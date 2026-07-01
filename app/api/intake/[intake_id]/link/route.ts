import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { abort, json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

// POST /api/intake/<intake_id>/link  (api_intake_link, governance_ui.py:4321)
export const POST = route(async (req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const kind = body.kind;
  const ref = body.ref;
  if (!['finding', 'question', 'decision', 'commit'].includes(kind)) abort(400, 'invalid kind');
  const db = getDb();
  db.prepare('INSERT INTO link(intake_id, kind, ref) VALUES(?,?,?)').run(id, kind, ref);
  return json({ ok: true });
});
