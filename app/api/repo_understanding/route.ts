import { NextRequest } from 'next/server';
import { json, abort, route, nowIso } from '@/lib/http';
import { getDb } from '@/lib/db';
import { get_repo_understanding_map } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

// api_repo_understanding_get (governance_ui.py:5788)
export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  if (!company) {
    abort(400, 'company required');
  }
  const db = getDb();
  return json({
    company,
    rows: Object.values(get_repo_understanding_map(db, company as string)),
  });
});

// api_repo_understanding_set (governance_ui.py:5799)
export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const company = body.company;
  const department_key = body.department_key;
  const repo_name = body.repo_name;
  const status = ((body.status || 'UNKNOWN') as string).trim().toUpperCase();
  const review_note = ((body.review_note || '') as string).trim();
  const next_questions_note = ((body.next_questions_note || '') as string).trim();
  const reviewed_by = ((body.reviewed_by || '') as string).trim();
  const allowed_statuses = new Set([
    'UNKNOWN',
    'QUESTIONS_OPEN',
    'ANSWERS_IN_REVIEW',
    'FOLLOW_UP_REQUIRED',
    'DEPARTMENT_UNDERSTOOD',
    'FULLY_UNDERSTOOD',
  ]);
  if (!company || !department_key || !repo_name) {
    abort(400, 'company, department_key, and repo_name required');
  }
  if (!allowed_statuses.has(status)) {
    abort(400, 'invalid status');
  }
  const db = getDb();
  const existing: any = db
    .prepare(
      'SELECT id FROM repo_understanding WHERE company=? AND department_key=? AND repo_name=?',
    )
    .get(company, department_key, repo_name);
  const now = nowIso();
  if (existing) {
    db.prepare(
      `UPDATE repo_understanding
               SET status=?, review_note=?, next_questions_note=?, reviewed_by=?, updated_at=?
               WHERE id=?`,
    ).run(status, review_note, next_questions_note, reviewed_by, now, existing.id);
  } else {
    db.prepare(
      `INSERT INTO repo_understanding(
                   company, department_key, repo_name, status,
                   review_note, next_questions_note, reviewed_by, updated_at
               ) VALUES(?,?,?,?,?,?,?,?)`,
    ).run(company, department_key, repo_name, status, review_note, next_questions_note, reviewed_by, now);
  }
  return json({ ok: true, updated_at: now });
});
