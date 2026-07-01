import { NextRequest } from 'next/server';
import { build_questions_payload } from '@/lib/helpers';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  return json(build_questions_payload(company as string));
});
