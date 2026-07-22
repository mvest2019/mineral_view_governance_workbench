import { NextRequest } from 'next/server';
import { WORKFLOW_STAGES } from '@/lib/config';
import { getDb } from '@/lib/db';
import { abort, json, nowIso, route } from '@/lib/http';
import { check_gate_for_advance } from '../../_intake_helpers';

export const dynamic = 'force-dynamic';

// POST /api/intake/<intake_id>/advance  (api_intake_advance, governance_ui.py:4227)
export const POST = route(async (req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const target = body.target_stage;
  const actor = body.actor ?? 'user';
  const note = body.note ?? '';
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);

  const current = intake.stage;
  if (!WORKFLOW_STAGES.includes(target)) abort(400, 'invalid target stage');
  const cur_idx = WORKFLOW_STAGES.indexOf(current);
  const tgt_idx = WORKFLOW_STAGES.indexOf(target);
  if (tgt_idx < cur_idx) abort(400, 'cannot move backwards via advance; use revert');
  if (tgt_idx > cur_idx + 1 && !body.force) {
    abort(400, `cannot skip stages (current: ${current}, target: ${target}). Pass force=true to override.`);
  }

  const blocked_reason = check_gate_for_advance(db, id, target);
  if (blocked_reason && !body.force) {
    return json({ error: 'blocked', reason: blocked_reason }, 409);
  }

  db.prepare('UPDATE intake SET stage=?, blocker=NULL WHERE id=?').run(target, id);
  db.prepare('INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)').run(
    id,
    target,
    nowIso(),
    actor,
    note,
  );
  return json({ ok: true, new_stage: target });
});
