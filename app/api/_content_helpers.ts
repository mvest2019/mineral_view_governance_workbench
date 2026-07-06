import fs from 'fs';
import path from 'path';
import { claude_cli_available, run_claude } from '@/lib/claude_cli';
import {
  openai_configured,
  get_openai_api_key,
  get_openai_model,
  governance_context,
  create_team_member_question,
} from '@/lib/helpers';
import { nowIso } from '@/lib/http';

type Dict = Record<string, any>;
type DB = any;
type CompanyConfig = Record<string, any>;

/**
 * Recursively walk `dir` yielding absolute file paths. Skips any path segment
 * named `.git` (mirrors Python's `'.git' not in p.parts` guard).
 */
function walkFiles(dir: string): string[] {
  const out: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name === '.git') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

/**
 * _gov_find: Locate a governance file by exact name. Tries _GOVERNANCE/<name>
 * directly, then anywhere under _GOVERNANCE, then anywhere under the company
 * root. Returns the absolute path or null.
 */
export function _gov_find(cfg: Record<string, any>, filename: string): string | null {
  const root = cfg.root;
  const base = path.join(root, '_GOVERNANCE');
  const direct = path.join(base, filename);
  if (fs.existsSync(direct)) {
    return direct;
  }
  if (fs.existsSync(base)) {
    for (const p of walkFiles(base)) {
      if (path.basename(p) === filename) {
        return p;
      }
    }
  }
  if (fs.existsSync(root)) {
    for (const p of walkFiles(root)) {
      if (path.basename(p) === filename) {
        return p;
      }
    }
  }
  return null;
}

/** Convert a shell-style glob pattern (only `*` and `?` used here) to a RegExp. */
function globToRegExp(pattern: string): RegExp {
  let re = '';
  for (const ch of pattern) {
    if (ch === '*') re += '[^/\\\\]*';
    else if (ch === '?') re += '.';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + re + '$');
}

/**
 * _gov_glob: Glob a governance pattern in _GOVERNANCE first (non-recursive),
 * then recursively under _GOVERNANCE, then under the whole company root.
 * Returns sorted absolute paths.
 */
export function _gov_glob(cfg: Record<string, any>, pattern: string): string[] {
  const root = cfg.root;
  const base = path.join(root, '_GOVERNANCE');
  const rx = globToRegExp(pattern);
  if (fs.existsSync(base)) {
    let direct: string[] = [];
    try {
      direct = fs
        .readdirSync(base, { withFileTypes: true })
        .filter((e) => rx.test(e.name))
        .map((e) => path.join(base, e.name));
    } catch {
      direct = [];
    }
    direct.sort();
    if (direct.length) {
      return direct;
    }
    const nested = walkFiles(base).filter((p) => rx.test(path.basename(p)));
    nested.sort();
    if (nested.length) {
      return nested;
    }
  }
  if (fs.existsSync(root)) {
    const all = walkFiles(root).filter((p) => rx.test(path.basename(p)));
    all.sort();
    return all;
  }
  return [];
}

/** ensure_finding_reviews_table: create the finding_reviews table if missing. */
export function ensure_finding_reviews_table(db: DB): void {
  db.exec(`
        CREATE TABLE IF NOT EXISTS finding_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            fid TEXT NOT NULL,
            decision TEXT NOT NULL DEFAULT 'REVIEWED',
            reviewer TEXT NOT NULL,
            note TEXT,
            reviewed_at TEXT NOT NULL,
            UNIQUE(company, fid)
        )
    `);
}

/**
 * transcribe_audio: Transcribe an audio file via OpenAI Whisper.
 * Returns [text, error].
 */
export async function transcribe_audio(p: string): Promise<[string | null, string | null]> {
  if (!openai_configured()) {
    return [null, 'OpenAI key not configured (Whisper is needed to transcribe voice memos).'];
  }
  try {
    const buf = fs.readFileSync(p);
    const form = new FormData();
    const blob = new Blob([new Uint8Array(buf)], { type: 'audio/webm' });
    form.append('file', blob, path.basename(p));
    form.append('model', 'whisper-1');
    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${get_openai_api_key()}` },
      body: form,
    });
    if (resp.status < 400) {
      const data: any = await resp.json();
      return [String(data?.text || '').trim(), null];
    }
    const text = await resp.text();
    return [null, `Transcription failed: HTTP ${resp.status} ${text.slice(0, 200)}`];
  } catch (exc: any) {
    return [null, `Transcription error: ${exc}`];
  }
}

/** build_voice_memo_prompt: build the strict-JSON prompt for a voice memo. */
export function build_voice_memo_prompt(label: string, transcript: string): string {
  return (
    'You are a governance assistant for Mineral View. A team member recorded a short voice memo. ' +
    'Read the TRANSCRIPT and respond with STRICT JSON only - no prose, no markdown fences. Shape:\n' +
    '{ "summary": "3-6 sentence summary of what was said, including any decision or answer", ' +
    '"questions": [ {"priority": "HIGH|MEDIUM|LOW", "question": "a specific follow-up question raised by the memo"} ] }\n' +
    'Rules: base it ONLY on the transcript; 1-4 questions; keep them specific and actionable.\n\n' +
    `MEMO LABEL: ${label}\nTRANSCRIPT:\n${(transcript || '').slice(0, 6000)}`
  );
}

/** _json_object_candidates: yield balanced {...} substrings, largest first. */
function _json_object_candidates(s: string): string[] {
  const cands: string[] = [];
  for (let start = 0; start < s.length; start++) {
    if (s[start] !== '{') continue;
    let depth = 0;
    for (let j = start; j < s.length; j++) {
      if (s[j] === '{') depth += 1;
      else if (s[j] === '}') {
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

/** parse_meeting_ai_json: parse the first balanced JSON object with summary/questions. */
function parse_meeting_ai_json(text: string): Dict | null {
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
    if (data && typeof data === 'object' && !Array.isArray(data) && ('summary' in data || 'questions' in data)) {
      return data;
    }
  }
  return null;
}

/** run_meeting_ai: try Claude CLI, then OpenAI. Returns [text, engine]. */
async function run_meeting_ai(prompt: string): Promise<[string, string | null]> {
  if (claude_cli_available()) {
    try {
      const result = await run_claude(['-p', prompt, '--allowedTools', 'Read'], {
        timeoutMs: 180 * 1000,
      });
      if (result.status === 0 && String(result.stdout || '').trim()) {
        return [String(result.stdout).trim(), 'Claude Code'];
      }
    } catch {
      // ignore
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
        let out = payload?.output_text || '';
        if (!out) {
          const parts: string[] = [];
          for (const item of payload?.output || []) {
            for (const content of item?.content || []) {
              if (content?.type === 'output_text') {
                parts.push(content?.text || '');
              }
            }
          }
          out = parts.join('\n').trim();
        }
        return [out, 'OpenAI'];
      }
    } catch {
      // ignore
    }
  }
  return ['', null];
}

/**
 * generate_voice_memo_intelligence: summarize + generate priority questions
 * from a transcript, optionally creating team-member questions.
 */
export async function generate_voice_memo_intelligence(
  db: DB,
  company: string,
  label: string,
  transcript: string,
  member_key: string | null = null,
): Promise<Dict> {
  let prompt = build_voice_memo_prompt(label, transcript);
  const _gov = governance_context(company, 8000);
  if (_gov) {
    prompt = _gov + '\n\n' + prompt;
  }
  let [text, engine] = await run_meeting_ai(prompt);
  let data: Dict | null = text ? parse_meeting_ai_json(text) : null;
  if (!data) {
    const flat = (transcript || '').split(/\s+/).filter(Boolean).join(' ');
    data = { summary: flat.slice(0, 500), questions: [] };
    engine = engine || 'heuristic';
  }
  const summary = String(data.summary || '').trim();
  const questions: Dict[] = [];
  let created = 0;
  for (const q of data.questions || []) {
    const qtext = String((q || {}).question || '').trim();
    if (!qtext) {
      continue;
    }
    let priority = String((q || {}).priority || 'MEDIUM').trim().toUpperCase();
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
      priority = 'MEDIUM';
    }
    questions.push({ priority, question: qtext, member_key });
    if (member_key) {
      try {
        create_team_member_question(
          db,
          company,
          member_key,
          qtext.slice(0, 160),
          `From voice memo '${label}'.\n\n${qtext}`,
          priority,
          'NEW',
          null,
          '',
          'Voice Memo AI',
        );
        created += 1;
      } catch {
        // ignore
      }
    }
  }
  return { summary, questions, engine, questions_created: created };
}

/**
 * governance_base_dir: return the directory that actually holds the governance
 * corpus, so voice memos land next to the real _GOVERNANCE files.
 */
export function governance_base_dir(cfg: Record<string, any>): string {
  const root = cfg.root;
  const base = path.join(root, '_GOVERNANCE');
  if (fs.existsSync(base)) {
    return base;
  }
  if (fs.existsSync(root)) {
    const found = findDirNamed(root, '_GOVERNANCE');
    if (found) {
      return found;
    }
  }
  return base;
}

/** Recursively find the first directory named `name` under `dir` (skips .git). */
function findDirNamed(dir: string, name: string): string | null {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const ent of entries) {
    if (ent.name === '.git') continue;
    if (ent.isDirectory()) {
      const full = path.join(dir, ent.name);
      if (ent.name === name) {
        return full;
      }
      const nested = findDirNamed(full, name);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

// re-export nowIso for callers that use these helpers together
export { nowIso };
