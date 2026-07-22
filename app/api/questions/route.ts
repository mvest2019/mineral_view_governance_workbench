import { NextRequest } from 'next/server';
import { build_questions_payload, apply_generated_questions, filter_priority_questions_for_page } from '@/lib/helpers';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const payload = build_questions_payload(company as string);
  // Merge Claude-generated Priority Questions (stored durably in GitHub) into
  // the payload, grouped under the employee each was generated for. Best-effort.
  await apply_generated_questions(company as string, payload);
  // Page policy: keep only Riya Wankhade's existing questions + generated ones.
  filter_priority_questions_for_page(payload);
  return json(payload);
});
