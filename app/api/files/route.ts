import { NextRequest } from 'next/server';
import { build_governance_file_index } from '@/lib/helpers';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  return json(build_governance_file_index(company as string));
});
