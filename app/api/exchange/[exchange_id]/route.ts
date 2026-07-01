import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { append_workflow_event } from '@/lib/helpers';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

// POST /api/exchange/<exchange_id>  (api_exchange_update, governance_ui.py:4582)
export const POST = route(async (req: NextRequest, ctx: { params: Promise<{ exchange_id: string }> }) => {
  const { exchange_id } = await ctx.params;
  const id = Number(exchange_id);
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const agreement_status = body.agreement_status;
  const next_action = body.next_action;
  const valid_agreements = new Set(['Needs review', 'Agrees', 'Partially agrees', 'Disagrees', 'Human review required']);
  const valid_actions = new Set(['Hold', 'Convert to Finding', 'Convert to Q', 'Draft Decision', 'Return to Intake Review']);
  if (!valid_agreements.has(agreement_status)) abort(400, 'invalid agreement status');
  if (!valid_actions.has(next_action)) abort(400, 'invalid next action');
  const db = getDb();
  const row = db.prepare('SELECT * FROM ai_exchange WHERE id=?').get(id) as any;
  if (!row) abort(404);
  db.prepare('UPDATE ai_exchange SET agreement_status=?, next_action=?, updated_at=? WHERE id=?').run(
    agreement_status,
    next_action,
    nowIso(),
    id,
  );
  append_workflow_event(
    db,
    row.intake_id,
    'AI Exchange Reviewed',
    'user',
    `Exchange #${id}: ${agreement_status} / ${next_action}`,
  );
  return json({ ok: true });
});
