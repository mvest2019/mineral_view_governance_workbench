import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { claude_cli_available, run_claude } from '@/lib/claude_cli';
import {
  append_workflow_event,
  get_company,
  insert_ai_run,
  intake_dir_for_id,
  load_local_settings,
  update_ai_run,
} from '@/lib/helpers';
import { abort, json, route } from '@/lib/http';
import { build_claude_prompt } from '../../_intake_helpers';

export const dynamic = 'force-dynamic';

function pyStrip(s: string): string {
  return (s || '').replace(/^\s+|\s+$/g, '');
}

// POST /api/intake/<intake_id>/run_claude  (api_run_claude, governance_ui.py:4332)
export const POST = route(async (_req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);

  // Claude CLI runs via lib/claude_cli (remote bridge when configured).
  if (!claude_cli_available()) {
    const run_id = insert_ai_run(db, id, 'Claude Code', 'blocked', '', '', '', 'Claude CLI not available');
    append_workflow_event(db, id, 'Claude run blocked', 'system', 'Claude CLI not available');
    return json({ ok: false, run_id, reason: 'Claude CLI not available' }, 409);
  }

  const company = intake.company;
  const files = (db.prepare('SELECT * FROM intake_file WHERE intake_id=?').all(id) as any[]).map((r) => ({ ...r }));
  const intake_dir = intake_dir_for_id(company, id);
  const output_path = path.join(intake_dir, 'claude_output.md');
  const prompt = build_claude_prompt(company, intake, files);
  const run_id = insert_ai_run(db, id, 'Claude Code', 'running', prompt, '', output_path, '');
  append_workflow_event(db, id, 'Claude run started', 'system', 'Launching Claude intake analysis');

  const governanceDir = path.join(get_company(company).root, '_GOVERNANCE');
  const claude_timeout = parseInt(String(load_local_settings().claude_timeout ?? 600), 10);
  const result = await run_claude(
    ['-p', prompt, '--add-dir', intake_dir, '--add-dir', governanceDir, '--allowedTools', 'Read'],
    { timeoutMs: claude_timeout * 1000, cwd: intake_dir },
  );

  if (
    result.error &&
    ((result.error as NodeJS.ErrnoException).code === 'ETIMEDOUT' || result.signal === 'SIGTERM')
  ) {
    update_ai_run(db, run_id, 'failed', null, null, 'Claude run timed out');
    append_workflow_event(db, id, 'Claude run failed', 'system', 'Claude run timed out');
    return json({ ok: false, run_id, error: 'Claude run timed out' }, 504);
  }

  if (result.status !== 0) {
    const err = pyStrip(String(result.stderr || result.stdout || 'Claude run failed'));
    update_ai_run(db, run_id, 'failed', null, null, err);
    append_workflow_event(db, id, 'Claude run failed', 'system', err.slice(0, 400));
    return json({ ok: false, run_id, error: err }, 500);
  }

  const output_text = pyStrip(String(result.stdout || ''));
  fs.writeFileSync(output_path, output_text, 'utf-8');
  update_ai_run(db, run_id, 'completed', output_text, output_path, null);
  append_workflow_event(db, id, 'Claude run completed', 'system', `Claude analysis saved to ${path.basename(output_path)}`);
  if (['Stored', 'Parsed'].includes(intake.stage)) {
    db.prepare('UPDATE intake SET stage=? WHERE id=?').run('AI Reviewed', id);
    append_workflow_event(db, id, 'AI Reviewed', 'system', 'Claude completed intake analysis');
  }
  return json({ ok: true, run_id, output_path, excerpt: output_text.slice(0, 800) });
});
