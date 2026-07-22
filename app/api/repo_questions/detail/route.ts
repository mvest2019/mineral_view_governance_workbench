import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { abort, json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const question_code = req.nextUrl.searchParams.get('question_code');
  if (!company || !question_code) {
    abort(400, 'company and question_code required');
  }
  const db = getDb();
  const row: any = db
    .prepare('SELECT * FROM repo_questions WHERE company=? AND question_code=?')
    .get(company, question_code);
  if (!row) {
    abort(404);
  }
  return json({ ok: true, question: row });
});
