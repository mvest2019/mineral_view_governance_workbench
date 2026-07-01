import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { GATE_NAMES } from '@/lib/config';
import { getDb } from '@/lib/db';
import { get_company, get_intake_dir } from '@/lib/helpers';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/intake  (api_intake_list, governance_ui.py:4193)
export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT i.*, COUNT(f.id) AS file_count
         FROM intake i LEFT JOIN intake_file f ON i.id=f.intake_id
         WHERE i.company=? GROUP BY i.id
         ORDER BY i.uploaded_at DESC`,
    )
    .all(company) as any[];
  return json(rows.map((r) => ({ ...r })));
});

function pad5(n: number): string {
  return String(n).padStart(5, '0');
}

// POST /api/intake  (api_intake_create, governance_ui.py:4106)
export const POST = route(async (req: NextRequest) => {
  const form = await req.formData();
  const company = String(form.get('company') || '');
  get_company(company); // cfg (validation parity with Flask)
  const employee = String(form.get('employee') || '') || null;
  const source_type = String(form.get('source_type') || '') || 'document';
  const ai_engines = String(form.get('ai_engines') || '') || 'Claude';
  const note = String(form.get('note') || '') || '';
  const files = form.getAll('files').filter((f) => f instanceof File) as File[];
  if (!files.length) abort(400, 'no files attached');

  const db = getDb();
  const insertIntake = db.prepare(
    `INSERT INTO intake(company, employee, uploaded_at, source_type, ai_engines, note, stage)
       VALUES(?,?,?,?,?,?,?)`,
  );
  const info = insertIntake.run(company, employee, nowIso(), source_type, ai_engines, note, 'Uploaded');
  const intake_id = Number(info.lastInsertRowid);

  const intake_root = path.join(get_intake_dir(company), `intake_${pad5(intake_id)}`);
  fs.mkdirSync(intake_root, { recursive: true });
  const saved_files: string[] = [];
  const failed_files: Array<{ filename: string; reason: string }> = [];
  const timestamp_token = (() => {
    const d = new Date();
    const p = (x: number) => String(x).padStart(2, '0');
    return `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  })();

  for (const f of files) {
    const original_name = f.name || 'unnamed';
    let safe_name = original_name.replace(/\//g, '_').replace(/\\/g, '_');
    let out_path = path.join(intake_root, safe_name);
    if (fs.existsSync(out_path)) {
      const suffix = path.extname(safe_name);
      const stem = path.basename(safe_name, suffix);
      let counter = 1;
      for (;;) {
        const candidateName = `${stem}_${timestamp_token}_${counter}${suffix}`;
        const candidate = path.join(intake_root, candidateName);
        if (!fs.existsSync(candidate)) {
          out_path = candidate;
          safe_name = candidateName;
          break;
        }
        counter += 1;
      }
    }
    try {
      fs.writeFileSync(out_path, Buffer.from(await f.arrayBuffer()));
    } catch (exc: any) {
      failed_files.push({ filename: original_name, reason: String(exc?.message || exc) });
      continue;
    }
    const size = fs.statSync(out_path).size;
    db.prepare('INSERT INTO intake_file(intake_id, filename, saved_path, size_bytes) VALUES(?,?,?,?)').run(
      intake_id,
      safe_name,
      out_path,
      size,
    );
    saved_files.push(safe_name);
  }

  if (!saved_files.length) {
    // Rollback: remove the orphan intake row and empty folder (no transaction API here).
    db.prepare('DELETE FROM intake WHERE id=?').run(intake_id);
    try {
      fs.rmdirSync(intake_root);
    } catch {
      // ignore
    }
    return json(
      {
        ok: false,
        error:
          'No files could be saved. Close the file in Excel/Preview/OneDrive and try again, or rename the file before uploading.',
        failed_files,
      },
      500,
    );
  }

  for (const g_name of GATE_NAMES) {
    db.prepare('INSERT INTO gate(intake_id, gate_name, status) VALUES(?,?,?)').run(intake_id, g_name, 'Not Started');
  }

  let upload_note = `Uploaded ${saved_files.length} file(s)`;
  if (failed_files.length) {
    upload_note += `, ${failed_files.length} failed (locked or unwritable)`;
  }
  db.prepare('INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)').run(
    intake_id,
    'Uploaded',
    nowIso(),
    'user',
    upload_note,
  );
  db.prepare('UPDATE intake SET stage=? WHERE id=?').run('Stored', intake_id);
  db.prepare('INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)').run(
    intake_id,
    'Stored',
    nowIso(),
    'system',
    `Files stored under ${intake_root}`,
  );

  return json({
    intake_id,
    saved_to: intake_root,
    saved_files,
    failed_files,
  });
});
