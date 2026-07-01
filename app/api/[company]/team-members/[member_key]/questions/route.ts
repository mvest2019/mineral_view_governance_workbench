import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import {
  list_team_member_questions,
  summarize_team_member_question_statuses,
} from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(
  async (req: NextRequest, ctx: { params: Promise<{ company: string; member_key: string }> }) => {
    const { company, member_key } = await ctx.params;
    const statuses = (req.nextUrl.searchParams.get('status') || '')
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);
    const db = getDb();
    const rows = list_team_member_questions(db, company, member_key, statuses.length ? statuses : null);
    const counts = summarize_team_member_question_statuses(rows);
    return json({
      company,
      member_key,
      rows,
      counts,
      count: rows.length,
    });
  },
);
