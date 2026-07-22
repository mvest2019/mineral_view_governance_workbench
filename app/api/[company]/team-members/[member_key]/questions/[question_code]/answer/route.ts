import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { abort, json, route } from '@/lib/http';
import { record_team_member_inline_answer } from '@/app/api/_team_member_helpers';

export const dynamic = 'force-dynamic';

export const POST = route(
  async (
    req: NextRequest,
    ctx: { params: Promise<{ company: string; member_key: string; question_code: string }> },
  ) => {
    const { company, member_key, question_code } = await ctx.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const answer_text = ((body.answer_markdown as string | undefined) || '').trim();
    const do_accept = Boolean(body.accept);
    if (!answer_text) {
      abort(400, 'answer_markdown required');
    }
    const db = getDb();
    const result = record_team_member_inline_answer(
      db,
      company,
      member_key,
      question_code,
      answer_text,
      do_accept,
      'Ryan',
    );
    if (!result) {
      return json({ ok: false, reason: 'Question not found.' }, 404);
    }
    return json({ ok: true, ...result });
  },
);
