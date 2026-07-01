import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import { accept_team_member_questions } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const POST = route(
  async (
    _req: NextRequest,
    ctx: { params: Promise<{ company: string; member_key: string; question_code: string }> },
  ) => {
    const { company, member_key, question_code } = await ctx.params;
    const db = getDb();
    const accepted = accept_team_member_questions(db, company, member_key, [question_code], 'Ryan');
    if (!accepted.length) {
      return json({ ok: false, reason: 'Question not found.' }, 404);
    }
    return json({ ok: true, accepted, count: accepted.length });
  },
);
