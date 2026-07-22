import { NextRequest } from 'next/server';
import { generate_repo_questions } from '@/lib/helpers';
import { abort, json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const company = body.company;
  const repo_name = body.repo_name;
  const actor = body.actor ?? 'generator';
  if (!company || !repo_name) {
    abort(400, 'company and repo_name required');
  }
  const result = await generate_repo_questions(company, repo_name, actor);
  return json({ ok: true, ...result });
});
