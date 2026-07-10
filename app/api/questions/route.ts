import { NextRequest } from 'next/server';
import { build_questions_payload, read_generated_priority_questions } from '@/lib/helpers';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const payload = build_questions_payload(company as string);
  // Merge in Claude-generated Priority Questions stored durably in GitHub so
  // they appear immediately on every serverless instance (the DB in /tmp is
  // per-instance). Best-effort — never blocks the base payload.
  try {
    const generated = await read_generated_priority_questions(company as string);
    if (generated.length) {
      const seen = new Set((payload['org_wide'] as any[]).map((q) => q.qid));
      for (const q of generated) {
        if (!seen.has(q['qid'])) {
          (payload['org_wide'] as any[]).push(q);
          seen.add(q['qid']);
        }
      }
    }
  } catch {
    // ignore — generated questions are additive
  }
  return json(payload);
});
