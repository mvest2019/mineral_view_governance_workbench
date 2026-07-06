import { claude_cli_available, run_claude } from '@/lib/claude_cli';
import {
  openai_configured,
  get_openai_api_key,
  get_openai_model,
  pretty_member_name,
  governance_context,
  create_team_member_question,
} from '@/lib/helpers';

type DB = any;

// build_meeting_ai_prompt (governance_ui.py:5377)
export function build_meeting_ai_prompt(
  title: string,
  meeting_date: string,
  attendee_labels: string[],
  notes_text: string,
  governance_text = '',
): string {
  const roster =
    attendee_labels && attendee_labels.length
      ? attendee_labels.map((n) => `- ${n}`).join('\n')
      : '- the attendees';
  const gov_block = (governance_text || '').trim()
    ? 'APPROVED GOVERNANCE CONTEXT (the company\'s source of truth - use it to keep questions ' +
      'concrete and to flag anything in the notes that conflicts with, or is not yet covered by, ' +
      'these rules):\n' +
      (governance_text || '') +
      '\n\n'
    : '';
  return (
    'You are a meeting assistant for the Mineral View governance workbench.\n' +
    'Read the GOVERNANCE CONTEXT and the MEETING NOTES at the end and produce (1) a concise summary and ' +
    "(2) specific follow-up PRIORITY QUESTIONS, each assigned to exactly one attendee.\n\n" +
    `Meeting title: ${title}\n` +
    `Date: ${meeting_date}\n` +
    "Attendees (you MUST copy one of these EXACT full names into each question's 'attendee' field):\n" +
    `${roster}\n\n` +
    'Respond with STRICT JSON ONLY. No prose before or after, no markdown code fences. Shape:\n' +
    '{\n' +
    '  "summary": "6-10 sentence plain-English summary of what was discussed, decided, and what happens next",\n' +
    '  "questions": [\n' +
    '    {"attendee": "EXACT full attendee name from the list", "priority": "HIGH", "question": "a specific, actionable follow-up grounded in the notes"}\n' +
    '  ]\n' +
    '}\n\n' +
    'Requirements:\n' +
    '- Generate 2 to 3 questions FOR EACH attendee listed above (a 2-person meeting yields 4-6 questions total).\n' +
    "- Every 'attendee' value MUST be copied verbatim (full name) from the attendee list above - never a first name only.\n" +
    '- Base every question on actual decisions, action items, owners, deadlines, risks, or open issues in the notes. Do NOT invent facts.\n' +
    "- 'priority' is exactly one of HIGH, MEDIUM, or LOW, based on urgency and impact.\n" +
    '- Where relevant, ground questions in the GOVERNANCE CONTEXT and flag anything in the notes ' +
    'that conflicts with, or is not yet covered by, approved governance.\n' +
    '- Output JSON only.\n\n' +
    `${gov_block}` +
    `MEETING NOTES:\n${(notes_text || '').slice(0, 8000)}`
  );
}

// _json_object_candidates (governance_ui.py:5411)
export function _json_object_candidates(s: string): string[] {
  const cands: string[] = [];
  for (let start = 0; start < s.length; start++) {
    if (s[start] !== '{') continue;
    let depth = 0;
    for (let j = start; j < s.length; j++) {
      if (s[j] === '{') {
        depth += 1;
      } else if (s[j] === '}') {
        depth -= 1;
        if (depth === 0) {
          cands.push(s.slice(start, j + 1));
          break;
        }
      }
    }
  }
  cands.sort((a, b) => b.length - a.length);
  return cands;
}

// parse_meeting_ai_json (governance_ui.py:5427)
export function parse_meeting_ai_json(text: string): any {
  if (!text) {
    return null;
  }
  const cleaned = text.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '').trim();
  for (const candidate of _json_object_candidates(cleaned)) {
    let data: any;
    try {
      data = JSON.parse(candidate);
    } catch {
      continue;
    }
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      ('summary' in data || 'questions' in data)
    ) {
      return data;
    }
  }
  return null;
}

// run_meeting_ai (governance_ui.py:5440) - makes external calls (Claude CLI / OpenAI HTTP).
export async function run_meeting_ai(prompt: string): Promise<[string, string | null]> {
  if (claude_cli_available()) {
    try {
      const result = await run_claude(['-p', prompt, '--allowedTools', 'Read'], {
        timeoutMs: 180000,
        maxBuffer: 1024 * 1024 * 64,
      });
      if (result.status === 0 && (result.stdout || '').trim()) {
        return [result.stdout.trim(), 'Claude Code'];
      }
    } catch {
      // fall through
    }
  }
  if (openai_configured()) {
    try {
      const resp = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${get_openai_api_key()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: get_openai_model(), input: prompt }),
      });
      if (resp.status < 400) {
        const payload: any = await resp.json();
        let out = payload['output_text'] || '';
        if (!out) {
          const parts: string[] = [];
          for (const item of payload['output'] || []) {
            for (const content of item['content'] || []) {
              if (content['type'] === 'output_text') {
                parts.push(content['text'] || '');
              }
            }
          }
          out = parts.join('\n').trim();
        }
        return [out, 'OpenAI'];
      }
    } catch {
      // fall through
    }
  }
  return ['', null];
}

// heuristic_meeting_summary (governance_ui.py:5474)
export function heuristic_meeting_summary(
  title: string,
  attendee_labels: string[],
  notes_text: string,
): { summary: string; questions: any[] } {
  const raw = notes_text || '';
  const flat = raw.split(/\s+/).filter((x) => x.length > 0).join(' ');
  const summary = flat
    ? flat.slice(0, 600) + (flat.length > 600 ? '...' : '')
    : `Meeting '${title}' was captured, but no notes text was available to summarize.`;
  const names = attendee_labels && attendee_labels.length ? attendee_labels : ['Team'];
  const first_names: Record<string, string> = {};
  for (const n of names) {
    first_names[n] = n.split(/\s+/)[0].toLowerCase();
  }
  const sentences = raw.split(/(?<=[.!?])\s+|\n+/);
  const cue =
    /\b(will|need to|needs to|should|must|confirm|decide|assign|rotate|reissue|send|review|approve|follow up|audit|map|document|add|fix|check|loop me in|owner|deadline|by friday|before|todo|action|open question)\b/i;
  const picks = sentences
    .map((s) => (s || '').trim())
    .filter((s) => s && cue.test(s) && s.trim().length > 25)
    .slice(0, 12);
  const questions: any[] = [];
  let rr = 0;
  for (const s of picks) {
    const low = s.toLowerCase();
    let assigned: string | null =
      names.find((n) => low.includes(first_names[n]) || low.includes(n.toLowerCase())) || null;
    if (!assigned) {
      assigned = names[rr % names.length];
      rr += 1;
    }
    // turn the statement into a follow-up question
    let body = s.trim().replace(/^(ryan|nikhil)\s*:\s*/i, '');
    body = body.replace(/\.+$/, '');
    const q = body.endsWith('?') ? body : `Follow up on: ${body}?`;
    questions.push({ attendee: assigned, priority: 'MEDIUM', question: q.slice(0, 240) });
  }
  if (!questions.length) {
    for (const n of names.slice(0, 8)) {
      questions.push({
        attendee: n,
        priority: 'MEDIUM',
        question: `What are your next steps and any blockers following '${title}'?`,
      });
    }
  }
  return { summary, questions };
}

// generate_meeting_intelligence (governance_ui.py:5507) - awaits run_meeting_ai (external calls).
export async function generate_meeting_intelligence(
  db: DB,
  company: string,
  meeting_id: number,
  title: string,
  meeting_date: string,
  now: string,
  notes_text: string,
): Promise<any> {
  const attendees: any[] = db
    .prepare('SELECT team_member_key, external_name FROM meeting_attendees WHERE meeting_id=?')
    .all(meeting_id);
  const label_to_key: Record<string, string> = {};
  const labels: string[] = [];
  const internal_keys: string[] = [];
  for (const a of attendees) {
    if (a.team_member_key) {
      const key = a.team_member_key;
      const label = pretty_member_name(key);
      labels.push(label);
      internal_keys.push(key);
      const aliases = new Set([
        label.toLowerCase(),
        key.toLowerCase(),
        label.split(/\s+/)[0].toLowerCase(),
        label.split(/\s+/).slice(-1)[0].toLowerCase(),
      ]);
      for (const alias of aliases) {
        if (alias && !(alias in label_to_key)) {
          label_to_key[alias] = key;
        }
      }
    } else if (a.external_name) {
      labels.push(a.external_name);
    }
  }

  const resolve_key = (att: string): string | null => {
    const a = (att || '').trim().toLowerCase();
    if (!a) {
      return null;
    }
    if (a in label_to_key) {
      return label_to_key[a];
    }
    // fuzzy: any alias contained in the attendee string or vice-versa
    for (const [alias, key] of Object.entries(label_to_key)) {
      if (alias && (a.includes(alias) || alias.includes(a))) {
        return key;
      }
    }
    return null;
  };

  let gov_text: string;
  try {
    gov_text = governance_context(company, 8000);
  } catch {
    gov_text = '';
  }
  let prompt = build_meeting_ai_prompt(title, meeting_date, labels, notes_text, gov_text);
  const _gov = governance_context(company, 8000);
  if (_gov) {
    prompt = _gov + '\n\n' + prompt;
  }
  const [text, engineFromAi] = await run_meeting_ai(prompt);
  let engine = engineFromAi;
  const data = text ? parse_meeting_ai_json(text) : null;

  let summary = '';
  let questions: any[] = [];
  if (data) {
    summary = ((data.summary as string) || '').trim();
    questions = data.questions || [];
  }
  // backfill from the content-aware heuristic if the AI gave no summary/questions
  if (!summary || !questions.length) {
    const fb = heuristic_meeting_summary(title, labels, notes_text);
    if (!summary) {
      summary = fb.summary;
    }
    if (!questions.length) {
      questions = fb.questions;
      engine = engine || 'heuristic';
    }
  }
  engine = engine || 'heuristic';

  const norm_questions: any[] = [];
  let questions_created = 0;
  let rr = 0;
  for (const q of questions) {
    const qtext = String((q || {}).question || '').trim();
    if (!qtext) {
      continue;
    }
    let priority = String((q || {}).priority || 'MEDIUM').trim().toUpperCase();
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
      priority = 'MEDIUM';
    }
    let att = String((q || {}).attendee || '').trim();
    let member_key = resolve_key(att);
    // if the AI named someone not on the roster, route round-robin to a real internal attendee
    if (!member_key && internal_keys.length) {
      member_key = internal_keys[rr % internal_keys.length];
      rr += 1;
      if (!att) {
        att = pretty_member_name(member_key);
      }
    }
    norm_questions.push({
      attendee: att || (member_key ? pretty_member_name(member_key) : 'Team'),
      member_key,
      priority,
      question: qtext,
    });
    if (member_key) {
      const body = `From meeting **${title}** (${meeting_date}).\n\n${qtext}`;
      try {
        create_team_member_question(
          db,
          company,
          member_key,
          qtext.slice(0, 160),
          body,
          priority,
          'NEW',
          null,
          '',
          'Meeting AI',
        );
        questions_created += 1;
      } catch {
        // ignore
      }
    }
  }

  const status = summary ? 'generated' : 'partial';
  db.prepare(
    `UPDATE meetings
           SET summary_text=?, summary_status=?, summary_engine=?, priority_questions_json=?,
               summary_generated_at=?, updated_at=?
           WHERE id=?`,
  ).run(summary, status, engine || '', JSON.stringify(norm_questions), now, now, meeting_id);
  return {
    summary,
    summary_status: status,
    engine,
    questions: norm_questions,
    questions_created,
  };
}
