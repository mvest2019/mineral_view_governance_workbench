import { NextRequest } from 'next/server';
import { json, route, abort } from '@/lib/http';
import { get_member_hub } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const member_key = req.nextUrl.searchParams.get('member');
  if (!company || !member_key) {
    abort(400, 'company and member required');
  }
  return json(get_member_hub(company, member_key));
});
