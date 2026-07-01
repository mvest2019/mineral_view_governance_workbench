import { NextRequest } from 'next/server';
import { json, abort, route, nowIso } from '@/lib/http';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// api_meeting_follow_up (governance_ui.py:5723)
export const POST = route(
  async (
    req: NextRequest,
    ctx: { params: Promise<{ meeting_id: string; member_key: string }> },
  ) => {
    const { meeting_id, member_key } = await ctx.params;
    const meetingId = parseInt(meeting_id, 10);
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const follow_up_done = body.follow_up_done ? 1 : 0;
    const follow_up_note = (body.follow_up_note || '').trim();
    const now = nowIso();
    const db = getDb();
    const row: any = db
      .prepare('SELECT id FROM meeting_attendees WHERE meeting_id=? AND team_member_key=?')
      .get(meetingId, member_key);
    if (!row) {
      abort(404);
    }
    db.prepare(
      `UPDATE meeting_attendees
           SET follow_up_done=?, follow_up_note=?, updated_at=?
           WHERE id=?`,
    ).run(follow_up_done, follow_up_note, now, row.id);
    return json({ ok: true, updated_at: now, follow_up_done: Boolean(follow_up_done) });
  },
);
