import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { abort, json, route } from '@/lib/http';
import {
  normalize_team_member_file_purpose,
  parse_team_member_answers_file,
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
    const file_id = body.file_id;
    const engine = body.engine || 'OpenAI';
    if (!file_id) {
      abort(400, 'file_id required');
    }
    const db = getDb();
    const file_row = db
      .prepare('SELECT * FROM team_member_files WHERE id=? AND company=? AND member_key=?')
      .get(file_id, company, member_key);
    if (!file_row) {
      abort(404);
    }
    if (normalize_team_member_file_purpose((file_row as any).file_purpose) !== 'answer_packet') {
      abort(400, 'file must be answer_packet');
    }
    const parsed = parse_team_member_answers_file(db, company, member_key, file_row as any, engine);
    return json({ ok: true, ...parsed });
  },
);
