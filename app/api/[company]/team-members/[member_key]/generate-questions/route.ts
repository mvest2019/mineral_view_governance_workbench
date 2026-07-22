import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { abort, json, route } from '@/lib/http';
import {
  generate_team_member_questions_from_file,
  normalize_team_member_file_purpose,
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
    const cap = Math.max(8, Math.min(12, parseInt(String(body.cap || 10), 10)));
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
    if (
      !['initial_doc', 'supporting_evidence'].includes(
        normalize_team_member_file_purpose((file_row as any).file_purpose),
      )
    ) {
      abort(400, 'file must be initial_doc or supporting_evidence');
    }
    const created = await generate_team_member_questions_from_file(
      db,
      company,
      member_key,
      file_row as any,
      engine,
      'Ryan',
      cap,
    );
    return json({ ok: true, created, count: created.length, cap });
  },
);
