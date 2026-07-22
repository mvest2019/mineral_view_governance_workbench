import { NextRequest } from 'next/server';
import { build_repo_questions_payload } from '@/lib/helpers';
import { abort, json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  if (!company) {
    abort(400, 'company required');
  }
  const repo_name = req.nextUrl.searchParams.get('repo_name');
  return json(build_repo_questions_payload(company as string, repo_name));
});
