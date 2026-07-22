import { NextRequest } from 'next/server';
import { customer_sources_for_company } from '@/lib/helpers';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  return json(customer_sources_for_company(company as string));
});
