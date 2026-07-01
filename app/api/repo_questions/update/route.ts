import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const company = body.company;
  const question_code = body.question_code;
  if (!company || !question_code) {
    abort(400, 'company and question_code required');
  }
  const fields = {
    status: (body.status || 'OPEN').trim().toUpperCase(),
    primary_assignee: (body.primary_assignee || '').trim(),
    answer_markdown: body.answer_markdown ?? '',
    review_note: body.review_note ?? '',
    reviewed_by: (body.reviewed_by || '').trim(),
  };
  const db = getDb();
  const existing: any = db
    .prepare('SELECT id FROM repo_questions WHERE company=? AND question_code=?')
    .get(company, question_code);
  if (!existing) {
    abort(404);
  }
  const now = nowIso();
  db.prepare(
    `UPDATE repo_questions
           SET status=?, primary_assignee=?, answer_markdown=?, review_note=?, reviewed_by=?, updated_at=?
           WHERE id=?`,
  ).run(
    fields.status,
    fields.primary_assignee,
    fields.answer_markdown,
    fields.review_note,
    fields.reviewed_by,
    now,
    existing.id,
  );
  return json({ ok: true, updated_at: now });
});
