import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { getDb } from '@/lib/db';
import { get_company, list_ai_exchanges } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company') as any;
  get_company(company);
  const db = getDb();
  return json(list_ai_exchanges(db, null, company));
});
