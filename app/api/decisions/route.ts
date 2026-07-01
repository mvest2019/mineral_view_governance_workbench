import fs from 'fs';
import { NextRequest } from 'next/server';
import { get_company } from '@/lib/helpers';
import { json, route } from '@/lib/http';
import { _gov_find } from '@/app/api/_content_helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const cfg = get_company(company as string);
  const f = _gov_find(cfg, 'DECISION_LOG.md');
  if (!f) return json({ exists: false, content: '' });
  return json({ exists: true, content: fs.readFileSync(f, 'utf-8') });
});
