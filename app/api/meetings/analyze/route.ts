import { NextRequest } from 'next/server';
import { abort, json, route } from '@/lib/http';
import { generate_priority_questions_from_task, pretty_member_name } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

// Triggered after a meeting is uploaded (the meeting itself is already persisted
// to MongoDB by POST /api/meetings). This step ONLY runs Claude/OpenAI analysis
// to generate Priority Questions (0 or more) assigned to the meeting attendees.
//
// No GitHub token, no GitHub API, no Markdown note, no commit — the previous
// GitHub markdown-commit workflow has been removed. Best-effort: a missing or
// failed Claude/OpenAI engine never breaks the completed upload.
export const POST = route(async (req: NextRequest) => {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const company = String(body.company || '').trim();
  const title = String(body.title || '').trim();
  const meetingDate = String(body.meeting_date || '').trim();
  const meetingTime = String(body.meeting_time || '').trim();
  const summary = String(body.summary || '').trim();
  const claudeSummary = String(body.claude_summary || '').trim();
  const transcript = String(body.transcript || '').trim();
  const additionalDetails = String(body.additional_details || '').trim();
  const attendees = (Array.isArray(body.attendees) ? body.attendees : []) as Array<Record<string, unknown>>;

  if (!company) abort(400, 'company required');
  if (!title) abort(400, 'meeting title required');

  // Attendee display names + the team-member keys the questions get assigned to.
  const attendeeNames: string[] = [];
  const memberKeys: string[] = [];
  for (const a of attendees) {
    const memberKey = String(a['team_member_key'] || '').trim();
    const externalName = String(a['external_name'] || '').trim();
    if (memberKey) {
      attendeeNames.push(pretty_member_name(memberKey));
      memberKeys.push(memberKey);
    } else if (externalName) {
      attendeeNames.push(externalName);
    }
  }

  // Build the analysis text — the full transcript comes first so Claude can
  // determine per-question ownership from the actual conversation (who was
  // assigned / committed to which work), not just from the attendee list.
  const analysisText = [
    `Meeting: ${title}`,
    meetingDate ? `Date: ${meetingDate}${meetingTime ? ` ${meetingTime}` : ''}` : '',
    attendeeNames.length ? `Attendees: ${attendeeNames.join(', ')}` : '',
    transcript ? `Meeting transcript (who said what, action items, owners, decisions, risks, follow-ups):\n"""\n${transcript}\n"""` : '',
    claudeSummary ? `Meeting summary: ${claudeSummary}` : '',
    summary ? `User note: ${summary}` : '',
    additionalDetails ? `Additional notes: ${additionalDetails}` : '',
  ].filter(Boolean).join('\n');

  let generation: any = { ok: true, count: 0, question_count: 0, created: [] };
  if (memberKeys.length) {
    generation = await generate_priority_questions_from_task(company, memberKeys, analysisText);
  }

  return json({
    ok: true,
    company,
    attendees: attendeeNames,
    member_keys: memberKeys,
    question_count: generation.question_count ?? 0,
    created: generation.created ?? [],
    generation_skipped: Boolean(generation.skipped),
    generation_reason: generation.reason || null,
  });
});
