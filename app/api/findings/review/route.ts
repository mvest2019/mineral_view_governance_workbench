import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import { ensure_finding_reviews_table } from '@/app/api/_content_helpers';

export const dynamic = 'force-dynamic';

function nowMinutes(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const POST = route(async (req: NextRequest) => {
  let data: any = {};
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  data = data || {};
  const company = String(data.company || '').trim();
  const fid = String(data.fid || '').trim();
  let decision = String(data.decision || 'REVIEWED').trim().toUpperCase();
  const reviewer = String(data.reviewer || '').trim();
  const note = String(data.note || '').trim();
  if (!company || !fid) {
    return json({ ok: false, error: 'company and fid are required' }, 400);
  }
  if (!reviewer) {
    return json({ ok: false, error: 'Reviewer name is required' }, 400);
  }
  const allowed = new Set(['PENDING', 'REVIEWED', 'APPROVED', 'DISMISSED']);
  if (!allowed.has(decision)) {
    decision = 'REVIEWED';
  }
  const db = getDb();
  ensure_finding_reviews_table(db);
  const now = nowMinutes();
  db.prepare(
    `INSERT INTO finding_reviews (company, fid, decision, reviewer, note, reviewed_at)
           VALUES (?,?,?,?,?,?)
           ON CONFLICT(company, fid) DO UPDATE SET
             decision=excluded.decision,
             reviewer=excluded.reviewer,
             note=excluded.note,
             reviewed_at=excluded.reviewed_at`,
  ).run(company, fid, decision, reviewer, note, now);
  return json({
    ok: true,
    review: { decision, reviewer, note, reviewed_at: now },
  });
});
