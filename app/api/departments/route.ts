import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { departments_for_company } from '@/lib/helpers';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const db = getDb();
  return json({
    company,
    ...departments_for_company(company as string, db),
  });
});
