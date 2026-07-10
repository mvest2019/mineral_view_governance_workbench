import { NextRequest } from 'next/server';
import { abort, json, route } from '@/lib/http';
import { generate_priority_questions_from_task } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

// Triggered automatically after a Task Tracker save. Sends the task description
// to the existing Claude integration, which analyzes the full Governance_Files
// knowledge and generates new (deduplicated) Priority Questions. Best-effort:
// a missing/failed Claude engine returns a soft result, never a 500, so the
// preceding task save is never affected.
export const POST = route(async (req: NextRequest) => {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const company = String(body.company || '').trim();
  const employee = String(body.employee || '').trim();
  const task = String(body.task || '').trim();

  if (!company) {
    abort(400, 'company required');
  }
  if (!task) {
    abort(400, 'task description required');
  }

  const result = await generate_priority_questions_from_task(company, employee, task);
  return json(result);
});
