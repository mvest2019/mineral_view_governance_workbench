import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import {
  append_workflow_event,
  build_openai_prompt,
  get_openai_api_key,
  get_openai_model,
  insert_ai_run,
  intake_dir_for_id,
  openai_configured,
  update_ai_run,
} from '@/lib/helpers';
import { abort, json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

// POST /api/intake/<intake_id>/run_openai  (api_run_openai, governance_ui.py:4377)
export const POST = route(async (_req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);

  if (!openai_configured()) {
    const run_id = insert_ai_run(db, id, 'OpenAI Codex', 'blocked', '', '', '', 'OPENAI_API_KEY not configured');
    append_workflow_event(db, id, 'OpenAI run blocked', 'system', 'OPENAI_API_KEY not configured');
    return json({ ok: false, run_id, reason: 'OPENAI_API_KEY not configured' }, 409);
  }

  const company = intake.company;
  const files = (db.prepare('SELECT * FROM intake_file WHERE intake_id=?').all(id) as any[]).map((r) => ({ ...r }));
  const intake_dir = intake_dir_for_id(company, id);
  const output_path = path.join(intake_dir, 'openai_output.md');
  const prompt = build_openai_prompt(company, intake, files);
  const run_id = insert_ai_run(db, id, 'OpenAI Codex', 'running', prompt, '', output_path, '');
  append_workflow_event(db, id, 'OpenAI run started', 'system', 'Launching OpenAI intake analysis');

  try {
    const payload = { model: get_openai_model(), input: prompt };
    const headers = {
      Authorization: `Bearer ${get_openai_api_key()}`,
      'Content-Type': 'application/json',
    };
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120000),
    });
    const responseText = await response.text();
    if (response.status >= 400) {
      update_ai_run(db, run_id, 'failed', null, null, responseText.slice(0, 2000));
      append_workflow_event(db, id, 'OpenAI run failed', 'system', responseText.slice(0, 400));
      return json({ ok: false, run_id, error: responseText }, 500);
    }
    const data: any = JSON.parse(responseText);
    let output_text: string = data.output_text || '';
    if (!output_text && 'output' in data) {
      const parts: string[] = [];
      for (const item of data.output || []) {
        for (const content of item.content || []) {
          if (content.type === 'output_text') {
            parts.push(content.text || '');
          }
        }
      }
      output_text = parts.join('\n').replace(/^\s+|\s+$/g, '');
    }
    fs.writeFileSync(output_path, output_text, 'utf-8');
    update_ai_run(db, run_id, 'completed', output_text, output_path, null);
    append_workflow_event(db, id, 'OpenAI run completed', 'system', `OpenAI analysis saved to ${path.basename(output_path)}`);
    if (['Stored', 'Parsed'].includes(intake.stage)) {
      db.prepare('UPDATE intake SET stage=? WHERE id=?').run('AI Reviewed', id);
      append_workflow_event(db, id, 'AI Reviewed', 'system', 'OpenAI completed intake analysis');
    }
    return json({ ok: true, run_id, output_path, excerpt: output_text.slice(0, 800) });
  } catch (e: any) {
    const msg = String(e?.message || e);
    update_ai_run(db, run_id, 'failed', null, null, msg);
    append_workflow_event(db, id, 'OpenAI run failed', 'system', msg.slice(0, 400));
    return json({ ok: false, run_id, error: msg }, 500);
  }
});
