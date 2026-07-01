import { NextRequest } from 'next/server';
import { GATE_NAMES } from '@/lib/config';
import { getDb } from '@/lib/db';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

// POST /api/intake/<intake_id>/gate  (api_intake_gate, governance_ui.py:4303)
export const POST = route(async (req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const name = body.gate_name;
  const status = body.status;
  const approver = body.approver ?? 'user';
  const note = body.note ?? '';
  if (!GATE_NAMES.includes(name)) abort(400, 'invalid gate');
  if (!['Not Started', 'Pending', 'Blocked', 'Approved', 'Rejected'].includes(status)) abort(400, 'invalid status');
  const db = getDb();
  db.prepare(
    `UPDATE gate SET status=?, approver=?, decided_at=?, note=?
       WHERE intake_id=? AND gate_name=?`,
  ).run(status, approver, nowIso(), note, id, name);
  db.prepare('INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)').run(
    id,
    `Gate: ${name}`,
    nowIso(),
    approver,
    `${status}. ${note}`,
  );
  return json({ ok: true });
});
