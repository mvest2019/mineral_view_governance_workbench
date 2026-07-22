import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import {
  accept_team_member_questions,
  list_team_member_questions,
} from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const POST = route(
  async (req: NextRequest, ctx: { params: Promise<{ company: string; member_key: string }> }) => {
    const { company, member_key } = await ctx.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const requested_codes: string[] = body.question_codes || [];
    const db = getDb();
    const rows = list_team_member_questions(db, company, member_key, ['ANSWERED']);
    let eligible_codes = rows
      .filter((row: any) => (row.latest_answer_confidence || '') === 'HIGH')
      .map((row: any) => row.question_code);
    if (requested_codes.length) {
      eligible_codes = eligible_codes.filter((code: string) => requested_codes.includes(code));
    }
    const accepted = accept_team_member_questions(db, company, member_key, eligible_codes, 'Ryan');
    return json({ ok: true, accepted, count: accepted.length });
  },
);
