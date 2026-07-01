import { NextRequest } from 'next/server';
import { json, abort, route } from '@/lib/http';
import { getDb } from '@/lib/db';
import { list_meetings_for_company } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

// api_meeting_detail (governance_ui.py:5713)
export const GET = route(
  async (req: NextRequest, ctx: { params: Promise<{ meeting_id: string }> }) => {
    const { meeting_id } = await ctx.params;
    const meetingId = parseInt(meeting_id, 10);
    const company = req.nextUrl.searchParams.get('company');
    const db = getDb();
    const rows = list_meetings_for_company(db, company as any);
    const meeting = rows.find((row: any) => row.id === meetingId);
    if (!meeting) {
      abort(404);
    }
    return json({ ok: true, meeting });
  },
);
