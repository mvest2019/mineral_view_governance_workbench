import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import { ensure_aspect_group_reviews_table } from '../_aspect_helpers';

export const dynamic = 'force-dynamic';

// datetime.datetime.now().isoformat(timespec='minutes') -> YYYY-MM-DDTHH:MM (local, no tz)
function nowIsoMinutes(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export const POST = route(async (req: NextRequest) => {
  let data: any = {};
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const company = (data.company || '').trim();
  const group_name = (data.group_name || '').trim();
  let decision = (data.decision || 'CONFIRMED').trim().toUpperCase();
  const reviewer = (data.reviewer || '').trim();
  const note = (data.note || '').trim();
  if (!company || !group_name) {
    return json({ ok: false, error: 'company and group_name are required' }, 400);
  }
  if (!reviewer) {
    return json({ ok: false, error: 'Reviewer name is required' }, 400);
  }
  if (!['CONFIRMED', 'NEEDS_WORK', 'PENDING'].includes(decision)) {
    decision = 'CONFIRMED';
  }
  const db = getDb();
  ensure_aspect_group_reviews_table(db);
  const now = nowIsoMinutes();
  db.prepare(
    `INSERT INTO aspect_group_reviews (company, group_name, decision, reviewer, note, reviewed_at)
           VALUES (?,?,?,?,?,?)
           ON CONFLICT(company, group_name) DO UPDATE SET
             decision=excluded.decision,
             reviewer=excluded.reviewer,
             note=excluded.note,
             reviewed_at=excluded.reviewed_at`,
  ).run(company, group_name, decision, reviewer, note, now);
  return json({
    ok: true,
    review: {
      decision,
      reviewer,
      note,
      reviewed_at: now,
    },
  });
});
