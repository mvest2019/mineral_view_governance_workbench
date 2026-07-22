import { NextRequest } from 'next/server';
import { WORKFLOW_STAGES } from '@/lib/config';
import { getDb } from '@/lib/db';
import {
  intake_stage_allows_ai_exchange,
  intake_stage_allows_commit_review,
  list_ai_exchanges,
  list_ai_runs,
} from '@/lib/helpers';
import { abort, json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/intake/<intake_id>  (api_intake_detail, governance_ui.py:4203)
export const GET = route(async (_req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);
  const files = (db.prepare('SELECT * FROM intake_file WHERE intake_id=?').all(id) as any[]).map((r) => ({ ...r }));
  const events = (
    db.prepare('SELECT * FROM workflow_event WHERE intake_id=? ORDER BY ts').all(id) as any[]
  ).map((r) => ({ ...r }));
  const gates = (db.prepare('SELECT * FROM gate WHERE intake_id=?').all(id) as any[]).map((r) => ({ ...r }));
  const links = (db.prepare('SELECT * FROM link WHERE intake_id=?').all(id) as any[]).map((r) => ({ ...r }));
  const runs = list_ai_runs(db, id);
  const exchanges = list_ai_exchanges(db, id);
  return json({
    intake: { ...intake },
    files,
    events,
    gates,
    links,
    runs,
    exchanges,
    workflow_stages: WORKFLOW_STAGES,
    commit_review_ready: intake_stage_allows_commit_review(intake.stage),
    exchange_ready: intake_stage_allows_ai_exchange(intake.stage),
  });
});
