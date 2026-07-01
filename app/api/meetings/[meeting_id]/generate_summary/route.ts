import { NextRequest } from 'next/server';
import { json, abort, route, nowIso } from '@/lib/http';
import { getDb } from '@/lib/db';
import { extract_member_file_preview } from '@/lib/helpers';
import { generate_meeting_intelligence } from '../../_meeting_helpers';

export const dynamic = 'force-dynamic';

// api_meeting_generate_summary (governance_ui.py:5745)
export const POST = route(
  async (req: NextRequest, ctx: { params: Promise<{ meeting_id: string }> }) => {
    const { meeting_id } = await ctx.params;
    const meetingId = parseInt(meeting_id, 10);
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const company = body.company || req.nextUrl.searchParams.get('company');
    const db = getDb();
    const meeting: any = db.prepare('SELECT * FROM meetings WHERE id=?').get(meetingId);
    if (!meeting) {
      abort(404);
    }
    let notes_text = '';
    if (meeting.notes_file_path) {
      try {
        notes_text = extract_member_file_preview(meeting.notes_file_path) || '';
      } catch {
        notes_text = '';
      }
    }
    if (!notes_text) {
      notes_text = meeting.note || '';
    }
    if (!(notes_text || '').trim()) {
      return json(
        {
          ok: false,
          reason:
            'No notes text available to summarize. Attach a notes file or add a summary note.',
        },
        400,
      );
    }
    const now = nowIso();
    const result = await generate_meeting_intelligence(
      db,
      meeting.company || company,
      meetingId,
      meeting.title,
      meeting.meeting_date,
      now,
      notes_text,
    );
    return json({ ok: true, ...result });
  },
);
