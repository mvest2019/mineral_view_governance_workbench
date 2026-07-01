import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { aspect_groups_for_company } from '@/lib/helpers';
import { json, route } from '@/lib/http';
import { ensure_aspect_group_reviews_table } from './_aspect_helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const groups = aspect_groups_for_company(company as string);
  let review_map: Record<string, any> = {};
  try {
    const db = getDb();
    ensure_aspect_group_reviews_table(db);
    review_map = {};
    for (const row of db
      .prepare(
        'SELECT group_name, decision, reviewer, note, reviewed_at FROM aspect_group_reviews WHERE company=?',
      )
      .all(company) as any[]) {
      review_map[row.group_name] = row;
    }
  } catch {
    review_map = {};
  }
  for (const group of groups) {
    const rv = review_map[group['name']];
    group['review'] = rv
      ? {
          decision: rv.decision,
          reviewer: rv.reviewer,
          note: rv.note,
          reviewed_at: rv.reviewed_at,
        }
      : null;
  }
  return json({
    company,
    groups,
  });
});
