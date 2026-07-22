import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import { export_team_member_question_packet } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const POST = route(
  async (_req: NextRequest, ctx: { params: Promise<{ company: string; member_key: string }> }) => {
    const { company, member_key } = await ctx.params;
    const db = getDb();
    const exported = export_team_member_question_packet(db, company, member_key, 'Ryan');
    if (!exported) {
      // Not an error — this member simply has no exportable questions right now.
      // Return 200 with an `empty` flag so the UI shows an informational message
      // instead of surfacing a hard "Export failed" error.
      return json({ ok: false, empty: true, reason: 'No NEW or NEEDS_FOLLOW_UP questions to export.' });
    }
    return json({ ok: true, ...exported });
  },
);
