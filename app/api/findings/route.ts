import fs from 'fs';
import { NextRequest } from 'next/server';
import { get_company, parse_findings } from '@/lib/helpers';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import { _gov_find, ensure_finding_reviews_table } from '@/app/api/_content_helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const cfg = get_company(company as string);
  const f = _gov_find(cfg, '_FINDINGS_FOR_REVIEW.md');
  if (!f) return json({ exists: false, findings: [] });
  const text = fs.readFileSync(f, 'utf-8');
  const last_updated = text.match(/Last Updated:\s*([^\n]+)/);
  let generated_at = '';
  try {
    const mtime = fs.statSync(f).mtime;
    const pad = (n: number) => String(n).padStart(2, '0');
    generated_at = `${mtime.getFullYear()}-${pad(mtime.getMonth() + 1)}-${pad(mtime.getDate())}T${pad(mtime.getHours())}:${pad(mtime.getMinutes())}`;
  } catch {
    generated_at = '';
  }
  const findings = parse_findings(text);
  let review_map: Record<string, any> = {};
  try {
    const db = getDb();
    ensure_finding_reviews_table(db);
    const rows = db
      .prepare('SELECT fid, decision, reviewer, note, reviewed_at FROM finding_reviews WHERE company=?')
      .all(company) as any[];
    review_map = {};
    for (const row of rows) {
      review_map[row.fid] = row;
    }
  } catch {
    review_map = {};
  }
  for (const item of findings) {
    const rv = review_map[item['fid']];
    item['review'] = rv
      ? {
          decision: rv.decision,
          reviewer: rv.reviewer,
          note: rv.note,
          reviewed_at: rv.reviewed_at,
        }
      : null;
  }
  return json({
    exists: true,
    findings,
    file: String(f),
    generated_at,
    last_updated: last_updated ? last_updated[1].trim() : '',
  });
});
