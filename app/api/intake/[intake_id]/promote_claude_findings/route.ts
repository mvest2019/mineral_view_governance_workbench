import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { COMPANIES } from '@/lib/config';
import { getDb } from '@/lib/db';
import {
  append_workflow_event,
  governance_drafts_dir,
  insert_ai_run,
  latest_completed_run,
} from '@/lib/helpers';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

function pad5(n: number): string {
  return String(n).padStart(5, '0');
}

// POST /api/intake/<intake_id>/promote_claude_findings  (api_promote_claude_findings, governance_ui.py:4605)
export const POST = route(async (_req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);
  const latest = latest_completed_run(db, id, 'Claude Code') as any;
  if (!latest || !latest.output_text) {
    return json({ ok: false, reason: 'No completed Claude run found for this intake' }, 409);
  }

  const company = intake.company;
  const draft_dir = governance_drafts_dir(company);
  const draft_path = path.join(draft_dir, `FINDINGS_DRAFT_FROM_INTAKE_${pad5(id)}.md`);
  const body = `# Findings Draft From Intake ${pad5(id)}

Status: DRAFT
Source Intake: #${id}
Source Engine: Claude Code
Generated: ${nowIso()}
Applies To: ${(COMPANIES as any)[company].name_full} only

This draft is generated from Claude intake analysis. It is not approved governance truth and must pass the normal findings review gate.

---

${latest.output_text}
`;
  fs.writeFileSync(draft_path, body, 'utf-8');
  const run_id = insert_ai_run(db, id, 'Draft Propagation', 'completed', '', body, draft_path, '');
  db.prepare('INSERT INTO link(intake_id, kind, ref) VALUES(?,?,?)').run(id, 'draft', draft_path);
  append_workflow_event(db, id, 'Findings draft created', 'system', `Claude output promoted to ${path.basename(draft_path)}`);
  if (['Uploaded', 'Stored', 'Parsed', 'AI Reviewed'].includes(intake.stage)) {
    db.prepare('UPDATE intake SET stage=?, blocker=NULL WHERE id=?').run('Findings Pending', id);
    db.prepare('UPDATE gate SET status=?, note=?, approver=?, decided_at=? WHERE intake_id=? AND gate_name=?').run(
      'Pending',
      'Awaiting findings review from promoted Claude output.',
      'system',
      nowIso(),
      id,
      'Findings Approved',
    );
    append_workflow_event(
      db,
      id,
      'Findings Pending',
      'system',
      'Intake moved into findings review after Claude draft promotion',
    );
  }
  return json({ ok: true, run_id, output_path: draft_path });
});
