import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { abort, json, route } from '@/lib/http';
import { analyze_team_member_file } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const POST = route(
  async (req: NextRequest, ctx: { params: Promise<{ file_id: string }> }) => {
    const { file_id } = await ctx.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const company = body.company;
    const engine = body.engine || 'OpenAI';
    if (!company) {
      abort(400, 'company required');
    }
    const db = getDb();
    const file_row = db
      .prepare('SELECT * FROM team_member_files WHERE id=? AND company=?')
      .get(Number(file_id), company);
    if (!file_row) {
      abort(404);
    }
    const analysis = await analyze_team_member_file(
      db,
      company,
      (file_row as any).member_key,
      file_row as any,
      engine,
    );
    return json({
      ok: true,
      file_id: Number(file_id),
      analysis,
    });
  },
);
