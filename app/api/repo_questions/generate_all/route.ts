import { NextRequest } from 'next/server';
import { generate_all_repo_questions } from '@/lib/helpers';
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
  const actor = body.actor ?? 'generator';
  if (!company) {
    abort(400, 'company required');
  }
  const results = generate_all_repo_questions(company, actor);
  const totals = {
    repos: results.length,
    created: results.reduce((s: number, item: any) => s + item['created'], 0),
    skipped: results.reduce((s: number, item: any) => s + item['skipped'], 0),
    errors: results.reduce((s: number, item: any) => s + item['errors'].length, 0),
  };
  return json({ ok: true, totals, results });
});
