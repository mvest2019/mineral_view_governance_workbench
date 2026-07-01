import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import {
  append_workflow_event,
  build_exchange_prompt,
  command_exists,
  get_company,
  get_openai_api_key,
  get_openai_model,
  intake_dir_for_id,
  intake_stage_allows_ai_exchange,
  latest_completed_run,
  normalize_engine_slug,
  openai_configured,
} from '@/lib/helpers';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

function pad5(n: number): string {
  return String(n).padStart(5, '0');
}
function pyStrip(s: string): string {
  return (s || '').replace(/^\s+|\s+$/g, '');
}

// POST /api/intake/<intake_id>/exchange  (api_intake_exchange, governance_ui.py:4475)
export const POST = route(async (req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);
  if (!intake_stage_allows_ai_exchange(intake.stage)) {
    return json({ ok: false, reason: `AI exchange is locked once an intake reaches ${intake.stage}.` }, 409);
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const source_engine = body.source_engine;
  const target_engine = body.target_engine;
  const topic = body.topic || `Review intake ${id} analysis`;
  const allowed_pairs = new Set(['Claude Code|OpenAI Codex', 'OpenAI Codex|Claude Code']);
  if (!allowed_pairs.has(`${source_engine}|${target_engine}`)) abort(400, 'invalid exchange pair');

  const source_run = latest_completed_run(db, id, source_engine) as any;
  if (!source_run || !source_run.output_text) {
    return json({ ok: false, reason: `No completed ${source_engine} run is available for this intake.` }, 409);
  }

  if (target_engine === 'Claude Code' && !command_exists('claude')) {
    return json({ ok: false, reason: 'Claude CLI is not available on this machine.' }, 409);
  }
  if (target_engine === 'OpenAI Codex' && !openai_configured()) {
    return json({ ok: false, reason: 'OPENAI_API_KEY not configured.' }, 409);
  }

  const created = nowIso();
  const info = db
    .prepare(
      `INSERT INTO ai_exchange(
            intake_id, topic, source_engine, target_engine, status, created_at, updated_at,
            source_run_id, source_prompt, source_output, source_output_path, agreement_status, next_action
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      id,
      topic,
      source_engine,
      target_engine,
      'running',
      created,
      created,
      source_run.id,
      source_run.prompt_text,
      source_run.output_text,
      source_run.output_path,
      'Needs review',
      'Hold',
    );
  const exchange_id = Number(info.lastInsertRowid);
  const prompt = build_exchange_prompt(intake.company, intake, source_engine, target_engine, topic, source_run.output_text);
  const target_slug = normalize_engine_slug(target_engine);
  const intakeDir = intake_dir_for_id(intake.company, id);
  const output_path = path.join(intakeDir, `exchange_${pad5(exchange_id)}_${target_slug}.md`);
  db.prepare('UPDATE ai_exchange SET target_prompt=? WHERE id=?').run(prompt, exchange_id);
  append_workflow_event(db, id, 'AI Exchange Started', 'system', `${source_engine} -> ${target_engine} on topic: ${topic}`);

  try {
    let target_output: string;
    if (target_engine === 'Claude Code') {
      const governanceDir = path.join(get_company(intake.company).root, '_GOVERNANCE');
      const result = spawnSync(
        'claude',
        ['-p', prompt, '--add-dir', intakeDir, '--add-dir', governanceDir, '--allowedTools', 'Read'],
        { encoding: 'utf-8', timeout: 180000, cwd: intakeDir },
      );
      if (
        result.error &&
        ((result.error as NodeJS.ErrnoException).code === 'ETIMEDOUT' || result.signal === 'SIGTERM')
      ) {
        const error = 'Claude exchange timed out';
        db.prepare('UPDATE ai_exchange SET status=?, updated_at=?, error_text=? WHERE id=?').run(
          'failed',
          nowIso(),
          error,
          exchange_id,
        );
        append_workflow_event(db, id, 'AI Exchange Failed', 'system', error);
        return json({ ok: false, reason: error }, 504);
      }
      if (result.status !== 0) {
        const error = pyStrip(String(result.stderr || result.stdout || 'Claude exchange failed'));
        db.prepare('UPDATE ai_exchange SET status=?, updated_at=?, error_text=? WHERE id=?').run(
          'failed',
          nowIso(),
          error.slice(0, 4000),
          exchange_id,
        );
        append_workflow_event(db, id, 'AI Exchange Failed', 'system', error.slice(0, 400));
        return json({ ok: false, reason: error }, 500);
      }
      target_output = pyStrip(String(result.stdout || ''));
    } else {
      const payload = { model: get_openai_model(), input: prompt };
      const headers = {
        Authorization: `Bearer ${get_openai_api_key()}`,
        'Content-Type': 'application/json',
      };
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(180000),
      });
      const responseText = await response.text();
      if (response.status >= 400) {
        const error = responseText.slice(0, 4000);
        db.prepare('UPDATE ai_exchange SET status=?, updated_at=?, error_text=? WHERE id=?').run(
          'failed',
          nowIso(),
          error,
          exchange_id,
        );
        append_workflow_event(db, id, 'AI Exchange Failed', 'system', error.slice(0, 400));
        return json({ ok: false, reason: error }, 500);
      }
      const data: any = JSON.parse(responseText);
      target_output = data.output_text || '';
      if (!target_output && 'output' in data) {
        const parts: string[] = [];
        for (const item of data.output || []) {
          for (const content of item.content || []) {
            if (content.type === 'output_text') {
              parts.push(content.text || '');
            }
          }
        }
        target_output = parts.join('\n').replace(/^\s+|\s+$/g, '');
      }
    }

    fs.writeFileSync(output_path, target_output, 'utf-8');
    db.prepare(
      `UPDATE ai_exchange
         SET status=?, updated_at=?, target_output=?, target_output_path=?
         WHERE id=?`,
    ).run('completed', nowIso(), target_output, output_path, exchange_id);
    append_workflow_event(
      db,
      id,
      'AI Exchange Completed',
      'system',
      `${target_engine} response saved to ${path.basename(output_path)}`,
    );
    return json({ ok: true, exchange_id, output_path });
  } catch (e: any) {
    const error = String(e?.message || e);
    db.prepare('UPDATE ai_exchange SET status=?, updated_at=?, error_text=? WHERE id=?').run(
      'failed',
      nowIso(),
      error.slice(0, 4000),
      exchange_id,
    );
    append_workflow_event(db, id, 'AI Exchange Failed', 'system', error.slice(0, 400));
    return json({ ok: false, reason: error }, 500);
  }
});
