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

// POST /api/intake/<intake_id>/promote_openai_questions  (api_promote_openai_questions, governance_ui.py:4646)
export const POST = route(async (_req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);
  const latest = latest_completed_run(db, id, 'OpenAI Codex') as any;
  if (!latest || !latest.output_text) {
    return json({ ok: false, reason: 'No completed OpenAI run found for this intake' }, 409);
  }

  const company = intake.company;
  const draft_dir = governance_drafts_dir(company);
  const draft_path = path.join(draft_dir, `QUESTION_DRAFT_FROM_INTAKE_${pad5(id)}.md`);
  const body = `# Question Draft From Intake ${pad5(id)}

Status: DRAFT
Source Intake: #${id}
Source Engine: OpenAI Codex
Generated: ${nowIso()}
Applies To: ${(COMPANIES as any)[company].name_full} only

This draft is generated from OpenAI/Codex output. It is not an approved queue update and must be reviewed before anything is copied into a live question file.

---

${latest.output_text}
`;
  fs.writeFileSync(draft_path, body, 'utf-8');
  const run_id = insert_ai_run(db, id, 'Draft Propagation', 'completed', '', body, draft_path, '');
  db.prepare('INSERT INTO link(intake_id, kind, ref) VALUES(?,?,?)').run(id, 'draft', draft_path);
  append_workflow_event(db, id, 'Question draft created', 'system', `OpenAI output promoted to ${path.basename(draft_path)}`);
  let next_stage: string;
  let blocker: string;
  let gate_name: string;
  if (intake.employee) {
    next_stage = 'Employee Questions Pending';
    blocker = 'Employee answers required before this intake can move forward.';
    gate_name = 'Employee Answered';
  } else {
    next_stage = 'Ryan Questions Pending';
    blocker = 'Ryan answers required before this intake can move forward.';
    gate_name = 'Ryan Answered';
  }
  if (['Uploaded', 'Stored', 'Parsed', 'AI Reviewed', 'Findings Pending'].includes(intake.stage)) {
    db.prepare('UPDATE intake SET stage=?, blocker=? WHERE id=?').run(next_stage, blocker, id);
    db.prepare('UPDATE gate SET status=?, note=?, approver=?, decided_at=? WHERE intake_id=? AND gate_name=?').run(
      'Pending',
      'Awaiting answers for promoted OpenAI question draft.',
      'system',
      nowIso(),
      id,
      gate_name,
    );
    append_workflow_event(
      db,
      id,
      next_stage,
      'system',
      'Intake moved into question-answer lane after OpenAI draft promotion',
    );
  }
  return json({ ok: true, run_id, output_path: draft_path });
});
