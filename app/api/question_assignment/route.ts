import { NextRequest } from 'next/server';
import { json, abort, route, nowIso } from '@/lib/http';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// api_question_assignment (governance_ui.py:5769). NOTE: the Python source has NO
// @app.route decorator on this function, so no methods are declared there. The
// body reads request.get_json() and performs INSERT/UPDATE, so it is a POST handler.
export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const company = body.company;
  const qid = body.qid;
  const assignee = body.assignee;
  const note = body.note ?? '';
  if (!company || !qid || !assignee) {
    abort(400, 'company, qid, and assignee required');
  }
  const db = getDb();
  const existing: any = db
    .prepare('SELECT id FROM question_assignment WHERE company=? AND qid=?')
    .get(company, qid);
  const now = nowIso();
  if (existing) {
    db.prepare(
      'UPDATE question_assignment SET assignee=?, note=?, updated_at=? WHERE id=?',
    ).run(assignee, note, now, existing.id);
  } else {
    db.prepare(
      'INSERT INTO question_assignment(company, qid, assignee, updated_at, note) VALUES(?,?,?,?,?)',
    ).run(company, qid, assignee, now, note);
  }
  return json({ ok: true });
});
