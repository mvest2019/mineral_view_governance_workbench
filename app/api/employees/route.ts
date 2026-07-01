import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { list_employees } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  return json(list_employees(company as any));
});
