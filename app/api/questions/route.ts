import { NextRequest } from 'next/server';
import { build_questions_payload, apply_generated_questions } from '@/lib/helpers';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const payload = build_questions_payload(company as string);
  // Merge Claude-generated Priority Questions (stored durably in GitHub) into
  // the payload, grouped under the employee each was generated for, so they
  // appear immediately on every serverless instance. Best-effort.
  await apply_generated_questions(company as string, payload);
  return json(payload);
});
