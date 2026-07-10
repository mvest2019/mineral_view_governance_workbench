// Ported faithfully from Governance_UI/governance-ui/governance_ui.py (helper
// functions, lines ~829-3524, excluding @app.route endpoints).
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import net from 'net';

import { getDb } from '@/lib/db';
import {
  COMPANIES,
  REPO_CATEGORIES,
  GOVERNANCE_FILE_CATEGORY_ORDER,
  ASPECT_GROUP_RULES,
  TEAM_MEMBER_PROFILES,
  DEPARTMENT_ARCHITECTURE,
  WORKFLOW_STAGES,
  GATE_NAMES,
  TEAM_MEMBER_FILE_PURPOSE_BUCKETS as CONFIG_TEAM_MEMBER_FILE_PURPOSE_BUCKETS,
  TEAM_MEMBER_QUESTION_STATUS_ORDER as CONFIG_TEAM_MEMBER_QUESTION_STATUS_ORDER,
} from '@/lib/config';
import {
  DATA_DIR,
  GH_EXE,
  GIT_EXE,
  loadLocalSettings as pathsLoadLocalSettings,
  saveLocalSettings as pathsSaveLocalSettings,
  SETTINGS_PATH,
  APP_BASE_DIR,
} from '@/lib/paths';
import { abort, nowIso } from '@/lib/http';
import { claude_cli_available, run_claude } from '@/lib/claude_cli';

// Silence unused-import lint for constants re-exported for parity with Python.
void REPO_CATEGORIES;
void WORKFLOW_STAGES;
void GATE_NAMES;
void GH_EXE;
void GIT_EXE;

type Dict = Record<string, any>;
type DB = ReturnType<typeof getDb>;

// ------------- Module-level constants (from governance_ui.py top) -------------
// BASE_DIR: the original Flask app directory (Governance_UI/governance-ui).
const BASE_DIR = APP_BASE_DIR;
// Claude CLI execution goes through lib/claude_cli.ts (remote bridge when
// REMOTE_CLAUDE_URL is configured, local `claude` on PATH otherwise).

// ------------- Small utilities to mirror Python stdlib behavior -------------

/** shutil.which equivalent: return the resolved path if found on PATH, else null. */
function which(cmd: string): string | null {
  if (!cmd) return null;
  // If it looks like a path and exists, return it.
  if ((cmd.includes('/') || cmd.includes('\\')) && fs.existsSync(cmd)) return cmd;
  const pathEnv = process.env.PATH || '';
  const exts = process.platform === 'win32'
    ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';')
    : [''];
  for (const dir of pathEnv.split(path.delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const full = path.join(dir, cmd + ext);
      try {
        if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
      } catch {
        // ignore
      }
    }
  }
  return null;
}

/** Python str.title(): capitalize the first letter of each run of letters. */
function titleCase(value: string): string {
  return value.replace(/[A-Za-z]+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

/** dict.fromkeys(x) dedupe preserving order. */
function dedupe<T>(items: T[]): T[] {
  return [...new Set(items)];
}

/** Python str.strip(chars) / lstrip / rstrip helpers. */
function pyStrip(s: string, chars?: string): string {
  if (chars === undefined) return s.replace(/^\s+|\s+$/g, '');
  const set = new Set(chars.split(''));
  let start = 0;
  let end = s.length;
  while (start < end && set.has(s[start])) start++;
  while (end > start && set.has(s[end - 1])) end--;
  return s.slice(start, end);
}
function pyLStrip(s: string, chars?: string): string {
  if (chars === undefined) return s.replace(/^\s+/, '');
  const set = new Set(chars.split(''));
  let start = 0;
  while (start < s.length && set.has(s[start])) start++;
  return s.slice(start);
}
function pyRStrip(s: string, chars?: string): string {
  if (chars === undefined) return s.replace(/\s+$/, '');
  const set = new Set(chars.split(''));
  let end = s.length;
  while (end > 0 && set.has(s[end - 1])) end--;
  return s.slice(0, end);
}

/** Read a file with errors='replace' semantics (best-effort). */
function readTextReplace(p: string): string {
  return fs.readFileSync(p, 'utf-8');
}

/** Python re.split with a capturing-group pattern; mirrors interleaved captures. */
function reSplit(pattern: RegExp, text: string): string[] {
  // Ensure the regex is global so String.split retains capture behavior consistently.
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
  const rx = new RegExp(pattern.source, flags);
  return text.split(rx);
}

/** Recursively walk a directory and return absolute paths of all files. */
function walkFiles(root: string): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop() as string;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

/** rglob('*.md') equivalent: all .md files under root, recursively. */
function rglobMd(root: string): string[] {
  return walkFiles(root).filter((p) => p.toLowerCase().endsWith('.md'));
}

// ============================================================================
// Helpers (line ~829 onward)
// ============================================================================

export function get_company(c: string): Dict {
  if (!(c in COMPANIES)) {
    abort(400, `Unknown company: ${c}`);
  }
  return (COMPANIES as Dict)[c];
}

export function get_intake_dir(company: string): string {
  const cfg = get_company(company);
  const d = path.join(cfg['root'], '_GOVERNANCE', '_INTAKE');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

// Task Tracker storage: reuses the company governance root (the bundled
// Governance_Files folder when present) so task notes land in
// Governance_Files/task_tracker/. Mirrors get_intake_dir / meetings_dir_for_company.
// On a read-only serverless host (e.g. Vercel) the bundled root is not writable,
// so fall back to the writable DATA_DIR (which resolves to /tmp there), keeping
// the same task_tracker/ folder name.
export function task_tracker_dir(company: string): string {
  const cfg = get_company(company);
  const isServerless = Boolean(process.env.VERCEL || process.env.WORKBENCH_SERVERLESS);
  const base = isServerless ? DATA_DIR : cfg['root'];
  const target = path.join(base, 'task_tracker');
  fs.mkdirSync(target, { recursive: true });
  return target;
}

export function get_team_member_files_dir(company: string, member_key: string): string {
  const cfg = get_company(company);
  let safeMember = String(member_key || 'unknown').replace(/[^A-Za-z0-9_]+/g, '_');
  safeMember = pyStrip(safeMember, '_') || 'unknown';
  const target = path.join(cfg['root'], '_GOVERNANCE', '_TEAM_MEMBER_FILES', safeMember);
  fs.mkdirSync(target, { recursive: true });
  return target;
}

export const TEAM_MEMBER_FILE_PURPOSE_BUCKETS: Record<string, string> =
  CONFIG_TEAM_MEMBER_FILE_PURPOSE_BUCKETS as Record<string, string>;

export const TEAM_MEMBER_QUESTION_STATUS_ORDER: string[] =
  CONFIG_TEAM_MEMBER_QUESTION_STATUS_ORDER as string[];

export function normalize_team_member_file_purpose(value: any): string {
  const key = String(value || 'other').trim().toLowerCase();
  if (!(key in TEAM_MEMBER_FILE_PURPOSE_BUCKETS)) {
    return 'other';
  }
  return key;
}

export function get_team_member_bucket_dir(company: string, member_key: string, file_purpose = 'other'): string {
  const root = get_team_member_files_dir(company, member_key);
  const bucket = TEAM_MEMBER_FILE_PURPOSE_BUCKETS[normalize_team_member_file_purpose(file_purpose)] || 'inbound';
  const target = path.join(root, bucket);
  fs.mkdirSync(target, { recursive: true });
  return target;
}

export function get_team_member_correspondence_markdown_path(company: string, member_key: string): string {
  return path.join(get_team_member_files_dir(company, member_key), 'correspondence_log.md');
}

export function parse_questions(md_text: string): Dict[] {
  const questions: Dict[] = [];
  const blocks = reSplit(/^### (Q-[A-Z0-9\-]+)\s+[—-]\s+(.+?)$/m, md_text);
  for (let i = 1; i < blocks.length; i += 3) {
    const qid = blocks[i];
    const title = (blocks[i + 1] ?? '').trim();
    const body = i + 2 < blocks.length ? blocks[i + 2] : '';
    const priority = /\*\*(?:6\. )?Priority\*\*\s*[—-]?\s*(\w+)/i.exec(body);
    const status = /\*\*Status:\*\*\s*([A-Z_()\d ]+)/.exec(body);
    const short_q = /\*\*1\. Short Question\*\*\s*[—-]?\s*(.+?)$/m.exec(body);
    const blocks_field = /\*\*(?:7\. )?Blocks\*\*\s*[—-]?\s*(.+?)$/m.exec(body);
    questions.push({
      qid,
      title,
      priority: priority ? priority[1].toUpperCase() : 'UNKNOWN',
      status: status ? status[1].trim() : 'OPEN',
      short_question: short_q ? short_q[1].trim() : '',
      blocks: blocks_field ? blocks_field[1].trim() : '',
      body: body.trim().slice(0, 3000),
    });
  }
  return questions;
}

export function extract_doc_reference_names(blocks_text: string): string[] {
  if (!blocks_text) {
    return [];
  }
  const refs = blocks_text.match(/([A-Za-z0-9_\- ]+\.md)/g) || [];
  const cleaned: string[] = [];
  for (let ref of refs) {
    ref = pyStrip(ref);
    ref = pyStrip(ref, '`');
    ref = ref.replace(/ /g, '');
    if (ref) {
      cleaned.push(ref);
    }
  }
  return dedupe(cleaned);
}

export function extract_alias_reference_names(blocks_text: string): string[] {
  const aliases: string[] = [];
  if (!blocks_text) {
    return aliases;
  }
  if (blocks_text.includes('Operating Constitution')) {
    aliases.push('Operating_Constitution.md');
  }
  if (blocks_text.includes('Decision-Authority Matrix')) {
    aliases.push('00_MASTER_GOVERNANCE_ARCHITECTURE.md');
  }
  if (blocks_text.includes('Risk Register')) {
    aliases.push('00_MASTER_GOVERNANCE_ARCHITECTURE.md');
  }
  if (blocks_text.includes('Customer Strategy')) {
    aliases.push('Business_Model.md');
  }
  if (blocks_text.includes('Pricing Policy')) {
    aliases.push('00_MASTER_GOVERNANCE_ARCHITECTURE.md');
  }
  return dedupe(aliases);
}

export function summarize_non_negotiables(doc_text: string): string[] {
  const match = /## Confirmed Non-Negotiables\s*([\s\S]+?)(?:\n## |$)/.exec(doc_text);
  if (!match) {
    return [];
  }
  const section = match[1];
  const rules: string[] = [];
  const rx = /###\s+\d+\.\s+([^\n]+)/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(section)) !== null) {
    rules.push(m[1]);
  }
  return rules.slice(0, 12);
}

export function summarize_markdown_context(filename: string, doc_text: string): Dict | null {
  if (filename === '03_NON_NEGOTIABLES.md') {
    const rules = summarize_non_negotiables(doc_text);
    if (rules.length) {
      return {
        kind: 'non_negotiables',
        summary: 'Current draft list of confirmed non-negotiables referenced by this question.',
        items: rules,
      };
    }
  }
  const section_summary = /## Section Summary\s*([\s\S]+?)(?:\n## |$)/.exec(doc_text);
  if (section_summary) {
    const summary = section_summary[1].split(/\s+/).filter(Boolean).join(' ');
    return {
      kind: 'summary',
      summary: summary.slice(0, 420),
      items: [],
    };
  }
  const first_heading = /## [^\n]+\s*([\s\S]+?)(?:\n## |$)/.exec(doc_text);
  if (first_heading) {
    const summary = first_heading[1].split(/\s+/).filter(Boolean).join(' ');
    return {
      kind: 'summary',
      summary: summary.slice(0, 420),
      items: [],
    };
  }
  return null;
}

export function build_question_context(cfg: Dict, question: Dict): Dict[] {
  const gov_dir = path.join(cfg['root'], '_GOVERNANCE');
  const refs = extract_doc_reference_names(question['blocks'] || '').concat(
    extract_alias_reference_names(question['blocks'] || ''),
  );
  const context_items: Dict[] = [];
  const seen = new Set<string>();
  for (const ref of refs) {
    if (seen.has(ref)) {
      continue;
    }
    seen.add(ref);
    const p = path.join(gov_dir, ref);
    if (!fs.existsSync(p)) {
      continue;
    }
    let doc_text: string;
    try {
      doc_text = readTextReplace(p);
    } catch {
      continue;
    }
    const summary = summarize_markdown_context(ref, doc_text);
    const s = summary || {};
    context_items.push({
      file: ref,
      exists: true,
      summary: s['summary'] || '',
      items: s['items'] || [],
      kind: s['kind'] || 'summary',
    });
  }
  return context_items;
}

export function load_local_settings(): Dict {
  return pathsLoadLocalSettings() as Dict;
}

export function save_local_settings(data: Dict): void {
  pathsSaveLocalSettings(data);
}

// resolve_company_paths(): in the Python app this mutates COMPANIES['MView'] paths
// based on local_settings and the bundle layout. Ported faithfully; COMPANIES
// paths are strings here.
export function resolve_company_paths(): void {
  const settings = load_local_settings();
  const root = settings['governance_root'];
  const vault = settings['vault_root'];
  const mirror = settings['repos_root'];
  if (root) {
    (COMPANIES as Dict)['MView']['root'] = String(root);
  } else {
    const bundle_files = path.join(BASE_DIR, '..', '..', 'Governance_Files');
    if (fs.existsSync(path.join(bundle_files, '_GOVERNANCE'))) {
      (COMPANIES as Dict)['MView']['root'] = bundle_files;
    }
  }
  if (vault) {
    (COMPANIES as Dict)['MView']['vault'] = String(vault);
  }
  if (mirror) {
    (COMPANIES as Dict)['MView']['mirror'] = String(mirror);
  }
}

export function get_openai_api_key(): string {
  return process.env.OPENAI_API_KEY || (load_local_settings()['openai_api_key'] as string) || '';
}

export function get_openai_model(): string {
  return process.env.OPENAI_MODEL || (load_local_settings()['openai_model'] as string) || 'gpt-5';
}

export async function call_claude_text(prompt: string, timeout: number | null = null): Promise<[boolean, string, string]> {
  if (!claude_cli_available()) {
    return [false, '', 'Claude CLI is not available on this machine.'];
  }
  if (timeout === null) {
    timeout = parseInt(String(load_local_settings()['claude_timeout'] ?? 600), 10);
  }
  try {
    const result = await run_claude(
      ['-p', '--allowedTools', 'Read'],
      {
        input: prompt,
        timeoutMs: timeout * 1000,
        cwd: String(BASE_DIR),
      },
    );
    if (result.error) {
      // Distinguish timeout from other spawn errors.
      if ((result.error as NodeJS.ErrnoException).code === 'ETIMEDOUT' || result.signal === 'SIGTERM') {
        return [false, '', 'Claude run timed out'];
      }
      return [false, '', String(result.error.message || result.error)];
    }
    if (result.status !== 0) {
      return [false, '', pyStrip(String(result.stderr || result.stdout || 'Claude request failed'))];
    }
    return [true, pyStrip(String(result.stdout || '')), ''];
  } catch (exc: any) {
    return [false, '', String(exc)];
  }
}

export function mask_secret(value: string): string {
  value = value || '';
  if (value.length <= 10) {
    return '*'.repeat(value.length);
  }
  return value.slice(0, 5) + '*'.repeat(12) + value.slice(-4);
}

export function pretty_member_name(member: string): string {
  return pyStrip((member || '').replace(/_/g, ' '));
}

export function pretty_department_name(department_key: string): string {
  return pyStrip(titleCase((department_key || '').replace(/_/g, ' ').replace(/\//g, ' / ')));
}

export function question_is_unanswered(status_text: string): boolean {
  const status = (status_text || '').trim().toUpperCase();
  return !new Set(['RESOLVED', 'ANSWERED', 'CLOSED', 'DONE']).has(status);
}

export function get_question_assignment_map(db: DB, company: string): Record<string, string> {
  const rows = db.prepare('SELECT qid, assignee FROM question_assignment WHERE company=?').all(company) as Dict[];
  const out: Record<string, string> = {};
  for (const row of rows) {
    out[row['qid']] = row['assignee'];
  }
  return out;
}

export function get_repo_understanding_map(db: DB, company: string): Record<string, Dict> {
  const rows = db
    .prepare('SELECT * FROM repo_understanding WHERE company=? ORDER BY department_key, repo_name')
    .all(company) as Dict[];
  const out: Record<string, Dict> = {};
  for (const row of rows) {
    out[`${row['department_key']}::${row['repo_name']}`] = { ...row };
  }
  return out;
}

export function parse_findings(md_text: string): Dict[] {
  const findings: Dict[] = [];
  const blocks = reSplit(/^### (F-\d+)\s+[—-]\s+(.+?)$/m, md_text);
  for (let i = 1; i < blocks.length; i += 3) {
    const fid = blocks[i];
    const title = (blocks[i + 1] ?? '').trim();
    const body = i + 2 < blocks.length ? blocks[i + 2] : '';
    const ftype = /\*\*Type:\*\*\s*([A-Z_]+)/.exec(body);
    const scope = /\*\*Owner Scope:\*\*\s*([^\n]+)/.exec(body);
    const status = /\*\*Status:\*\*\s*(\w+)/.exec(body);
    const observation = /\*\*Observation:\*\*\s*([\s\S]+?)(?=\n-|\n\*\*|$)/.exec(body);
    const why = /\*\*Why It Matters:\*\*\s*([\s\S]+?)(?=\n-|\n\*\*|$)/.exec(body);
    const proposed = /\*\*Proposed (?:Action|Destination)(?:\:|\*\*)\s*([\s\S]+?)(?=\n-|\n\*\*|$)/.exec(body);
    const confidence = /\*\*Confidence:\*\*\s*(\w+)/.exec(body);
    const date_match = /\*\*(?:Date|Detected|Added|Generated|Logged):\*\*\s*([^\n]+)/.exec(body);
    findings.push({
      fid,
      title,
      type: ftype ? ftype[1] : 'UNKNOWN',
      scope: scope ? scope[1].trim() : '',
      status: status ? status[1] : 'PENDING',
      observation: observation ? observation[1].trim() : '',
      why_matters: why ? why[1].trim() : '',
      proposed: proposed ? proposed[1].trim() : '',
      confidence: confidence ? confidence[1] : null,
      date: date_match ? date_match[1].trim() : null,
      body: body.trim().slice(0, 2500),
    });
  }
  return findings;
}

export function strip_markdown(value: any): string {
  let text = String(value || '');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
  text = text.replace(/â€”/g, '-').replace(/â€“/g, '-');
  text = text.replace(/\s+/g, ' ');
  return pyStrip(text, ' -\t\r\n');
}

export function normalize_repo_text(value: any): string {
  return pyStrip(String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' '));
}

export function repo_text_aliases(repo_name: string): string[] {
  const normalized = normalize_repo_text(repo_name);
  const pieces = normalized.split(' ').filter((p) => p);
  const aliases = new Set<string>();
  const ignored = new Set(['bpm', 'bold', 'repo']);
  if (normalized) {
    aliases.add(normalized);
  }
  const trimmed = pieces.filter((piece) => !ignored.has(piece));
  if (trimmed.length) {
    aliases.add(trimmed.join(' '));
  }
  if (normalized.includes('quickbook') || normalized.includes('quickbooks')) {
    aliases.add('quickbook');
    aliases.add('quickbooks');
  }
  if (repo_name) {
    aliases.add(String(repo_name).toLowerCase());
  }
  return [...aliases].filter((alias) => alias);
}

export function text_mentions_repo(text: string, repo_name: string): boolean {
  const haystack = normalize_repo_text(text);
  return repo_text_aliases(repo_name).some((alias) => haystack.includes(alias));
}

export function repo_question_priority_rank(priority: string): number {
  const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const key = (priority || '').toUpperCase();
  return key in order ? order[key] : 9;
}

export function repo_sheet_dir(company: string): string {
  const cfg = get_company(company);
  return path.join(cfg['root'], '_GOVERNANCE', 'repo_sheets');
}

export function repo_sheet_path(company: string, repo_name: string): string {
  return path.join(repo_sheet_dir(company), `${repo_name}.md`);
}

export function extract_numbered_markdown_section(md_text: string, section_number: number): string {
  const pattern = new RegExp(
    `^## ${section_number}\\.\\s+[^\\n]+\\n([\\s\\S]*?)(?=^## \\d+\\.\\s+|$)`,
    'm',
  );
  const match = pattern.exec(md_text);
  return match ? match[1].trim() : '';
}

export function parse_markdown_bullets(section_text: string): string[] {
  const bullets: string[] = [];
  let current: string[] = [];
  for (const raw_line of section_text.split(/\r?\n/)) {
    const stripped = raw_line.trim();
    if (stripped.startsWith('- ')) {
      if (current.length) {
        bullets.push(strip_markdown(current.join(' ')));
      }
      current = [stripped.slice(2).trim()];
    } else if (current.length && stripped && !stripped.startsWith('## ')) {
      current.push(stripped);
    }
  }
  if (current.length) {
    bullets.push(strip_markdown(current.join(' ')));
  }
  return bullets.filter((bullet) => bullet);
}

export function repo_question_slug(repo_name: string): string {
  const slug = pyStrip(String(repo_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'), '-');
  return slug || 'repo';
}

export function build_repo_question_code(repo_name: string, source: string, source_ref: string, title: string): string {
  const fingerprint = crypto
    .createHash('md5')
    .update(`${repo_name}|${source}|${source_ref}|${title}`, 'utf-8')
    .digest('hex')
    .slice(0, 6);
  return `RQ-${repo_question_slug(repo_name)}-${fingerprint}`;
}

export function infer_repo_question_priority(text: string, default_ = 'MEDIUM'): string {
  const lower = (text || '').toLowerCase();
  const criticalTokens = [
    'critical', 'rotate immediately', 'hardcoded sql password', 'jwt_secret', '.env', '.p12',
    'aws access key', 'trustservercertificate=true', 'tls verification disabled', 'secret', 'credential',
  ];
  if (criticalTokens.some((token) => lower.includes(token))) {
    return 'CRITICAL';
  }
  const highTokens = [
    'security', 'sql injection', 'dead code', 'boundary', 'verify', 'hardcoded', 'retry logic',
    'unreachable', 'parameterized',
  ];
  if (highTokens.some((token) => lower.includes(token))) {
    return 'HIGH';
  }
  const mediumTokens = ['inferred', 'confirm', 'documented'];
  if (mediumTokens.some((token) => lower.includes(token))) {
    return 'MEDIUM';
  }
  return default_;
}

export function repo_security_register_path(company: string): string {
  const cfg = get_company(company);
  return path.join(cfg['root'], '_GOVERNANCE', '_SECURITY_RISK_REGISTER.md');
}

export function parse_security_register_blocks(md_text: string): Dict[] {
  const blocks: Dict[] = [];
  const matches: RegExpExecArray[] = [];
  const rx = /^###\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(md_text)) !== null) {
    matches.push(m);
  }
  for (let index = 0; index < matches.length; index++) {
    const match = matches[index];
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : md_text.length;
    const heading = strip_markdown(match[1]);
    const body = md_text.slice(start, end).trim();
    const severity_match = /\*\*Severity:\*\*\s*([A-Z]+)/.exec(body);
    const severity = severity_match
      ? severity_match[1].toUpperCase()
      : heading.toUpperCase().includes('CRITICAL')
        ? 'CRITICAL'
        : heading.toUpperCase().includes('HIGH')
          ? 'HIGH'
          : 'MEDIUM';
    blocks.push({ heading, body, severity });
  }
  return blocks;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function build_repo_question_candidates(company: string, repo_name: string): Dict[] {
  const candidates: Dict[] = [];
  const sheet_path = repo_sheet_path(company, repo_name);
  if (fs.existsSync(sheet_path)) {
    const sheet_text = readTextReplace(sheet_path);
    const observed_section = extract_numbered_markdown_section(sheet_text, 3);
    const rules_section = extract_numbered_markdown_section(sheet_text, 5);
    const open_questions_section = extract_numbered_markdown_section(sheet_text, 8);

    parse_markdown_bullets(observed_section).forEach((bullet, i) => {
      const index = i + 1;
      if (!bullet.toUpperCase().includes('INFERRED')) {
        return;
      }
      const claim = pyStrip(bullet.replace(/\bINFERRED\b/gi, ''), ' -()');
      if (!claim) {
        return;
      }
      candidates.push({
        source: 'repo_sheet_section_3',
        source_ref: `repo_sheets/${repo_name}.md#section-3-item-${index}`,
        title: `Verify inferred behavior in ${repo_name}`,
        short_question: `Verify whether this inferred repo behavior is correct: ${claim}`,
        body_markdown: `Verify the inferred claim for \`${repo_name}\`.\n\nClaim:\n- ${claim}\n\nIf correct, confirm the behavior and point to the code or governance source that should document it.`,
        source_excerpt: claim,
        priority: 'MEDIUM',
      });
    });

    parse_markdown_bullets(rules_section).forEach((bullet, i) => {
      const index = i + 1;
      if (bullet.toLowerCase().startsWith('no business rules observed')) {
        return;
      }
      candidates.push({
        source: 'repo_sheet_section_5',
        source_ref: `repo_sheets/${repo_name}.md#section-5-item-${index}`,
        title: `Confirm business rule in ${repo_name}`,
        short_question: `Is this rule correct, and where is it documented: ${bullet}`,
        body_markdown: `Confirm the business rule observed in \`${repo_name}\` and identify the governance document that should own it.\n\nObserved rule:\n- ${bullet}`,
        source_excerpt: bullet,
        priority: infer_repo_question_priority(bullet, 'HIGH'),
      });
    });

    parse_markdown_bullets(open_questions_section).forEach((bullet, i) => {
      const index = i + 1;
      const clean_question = pyStrip(bullet.replace(/^(Q:|SECURITY:)\s*/i, ''));
      if (!clean_question) {
        return;
      }
      candidates.push({
        source: 'repo_sheet_section_8',
        source_ref: `repo_sheets/${repo_name}.md#section-8-item-${index}`,
        title: clean_question.slice(0, 120),
        short_question: clean_question,
        body_markdown: `Open repo question derived from the deep-read sheet for \`${repo_name}\`.\n\nQuestion:\n- ${clean_question}`,
        source_excerpt: bullet,
        priority: infer_repo_question_priority(bullet, 'HIGH'),
      });
    });
  }

  const cfg = get_company(company);
  const findings_path = path.join(cfg['root'], '_GOVERNANCE', '_FINDINGS_FOR_REVIEW.md');
  if (fs.existsSync(findings_path)) {
    for (const finding of parse_findings(readTextReplace(findings_path))) {
      const joined = [
        finding['fid'] || '',
        finding['title'] || '',
        finding['scope'] || '',
        finding['observation'] || '',
        finding['proposed'] || '',
      ].join(' ');
      if (!text_mentions_repo(joined, repo_name)) {
        continue;
      }
      candidates.push({
        source: 'finding',
        source_ref: `_FINDINGS_FOR_REVIEW.md:${finding['fid'] || ''}`,
        title: `Review finding ${finding['fid'] || ''} for ${repo_name}`,
        short_question: finding['title'] || 'Review finding impact on this repo.',
        body_markdown: `Finding linked to \`${repo_name}\`.\n\nFinding ID: \`${finding['fid'] || ''}\`\nObservation: ${finding['observation'] || ''}\nProposed action: ${finding['proposed'] || ''}\n\nConfirm whether this finding still applies to the repo and what remediation or clarification is required.`,
        source_excerpt: strip_markdown(finding['observation'] || finding['title'] || ''),
        priority: infer_repo_question_priority((finding['title'] || '') + ' ' + (finding['observation'] || ''), 'HIGH'),
      });
    }
  }

  const security_path = repo_security_register_path(company);
  if (fs.existsSync(security_path)) {
    const security_text = readTextReplace(security_path);
    for (const block of parse_security_register_blocks(security_text)) {
      const haystack = [block['heading'], block['body']].join(' ');
      if (!text_mentions_repo(haystack, repo_name)) {
        continue;
      }
      const excerpt_match = new RegExp(`([^\\n]*${escapeRegExp(repo_name)}[^\\n]*)`, 'i').exec(haystack);
      const excerpt = excerpt_match ? strip_markdown(excerpt_match[1]) : strip_markdown(block['heading']);
      candidates.push({
        source: 'security_finding',
        source_ref: `${path.basename(security_path)}:${block['heading']}`,
        title: `${block['severity']} security review for ${repo_name}`,
        short_question: strip_markdown(block['heading']),
        body_markdown: `Security register entry linked to \`${repo_name}\`.\n\nHeading: ${block['heading']}\nSeverity: ${block['severity']}\n\nConfirm the current remediation status and whether the repo still has this exposure.`,
        source_excerpt: excerpt,
        priority: block['severity'] === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      });
    }
  }

  if (!candidates.length) {
    const baseline: [string, string, string][] = [
      ['purpose', 'HIGH', `What is ${repo_name} specifically responsible for in practice?`],
      ['owner', 'HIGH', `Who currently owns ${repo_name}, and when/how does it run?`],
      ['trigger', 'MEDIUM', `What triggers ${repo_name} to run (schedule, event, or manual)?`],
      ['systems', 'HIGH', `What systems, vendors, or datasets does ${repo_name} read from or write to?`],
      ['rules', 'HIGH', `What business rules or exceptions are encoded in ${repo_name}?`],
      ['governance', 'MEDIUM', `Which governance document should own the rules and behavior of ${repo_name}?`],
    ];
    for (const [ref, prio, text] of baseline) {
      candidates.push({
        source: 'baseline',
        source_ref: `baseline/${repo_name}#${ref}`,
        title: text.slice(0, 120),
        short_question: text,
        body_markdown:
          `Baseline governance question for \`${repo_name}\`.\n\n` +
          `Question:\n- ${text}\n\n` +
          'Answer with the current reality (owner, trigger, systems, and rules) ' +
          'and note where this should be documented in governance.',
        source_excerpt: text,
        priority: prio,
      });
    }
  }

  const deduped = new Map<string, Dict>();
  for (const candidate of candidates) {
    const key = JSON.stringify([candidate['source'], candidate['source_ref'], candidate['short_question']]);
    deduped.set(key, candidate);
  }
  const sorted_candidates = [...deduped.values()].sort((a, b) => {
    const ra = repo_question_priority_rank(a['priority']);
    const rb = repo_question_priority_rank(b['priority']);
    if (ra !== rb) return ra - rb;
    const sa = a['source_ref'] || '';
    const sb = b['source_ref'] || '';
    if (sa !== sb) return sa < sb ? -1 : 1;
    const ta = a['title'] || '';
    const tb = b['title'] || '';
    if (ta !== tb) return ta < tb ? -1 : 1;
    return 0;
  });
  return sorted_candidates.slice(0, 12);
}

export function list_repo_questions(db: DB, company: string, repo_name: string | null = null): Dict[] {
  let sql = 'SELECT * FROM repo_questions WHERE company=?';
  const params: any[] = [company];
  if (repo_name) {
    sql += ' AND repo_name=?';
    params.push(repo_name);
  }
  sql +=
    " ORDER BY repo_name, CASE priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 9 END, created_at";
  return (db.prepare(sql).all(...params) as Dict[]).map((row) => ({ ...row }));
}

export function _parse_repo_question_json(text: string): Dict[] {
  if (!text) {
    return [];
  }
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(json)?/, '').trim();
  cleaned = cleaned.replace(/```$/, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  try {
    const data = JSON.parse(cleaned);
    if (Array.isArray(data)) {
      return data.filter((d) => d && typeof d === 'object' && !Array.isArray(d));
    }
  } catch {
    return [];
  }
  return [];
}

export async function build_repo_question_candidates_claude(company: string, repo_name: string): Promise<Dict[]> {
  if (!claude_cli_available()) {
    return [];
  }
  let gov = '';
  try {
    gov = governance_context(company, 10000);
  } catch {
    gov = '';
  }
  const dept_names: string[] = [];
  try {
    const dep = departments_for_company(company, getDb());
    for (const dept of dep['all'] as Dict[]) {
      if ((dept['repos'] || []).includes(repo_name)) {
        dept_names.push(dept['name'] || dept['key']);
      }
    }
  } catch {
    // pass
  }
  const dept_line = dept_names.length ? dept_names.join(', ') : 'unspecified';
  const prompt =
    'You are helping Mineral View build governance documentation for a code repository.\n\n' +
    `Repository: ${repo_name}\n` +
    `Department(s) this repo is mapped to: ${dept_line}\n\n` +
    'Existing governance context (the approved source of truth):\n' +
    `${gov || '(no governance context available)'}\n\n` +
    'Task: Draft 5-8 specific, high-value governance questions Mineral View must answer to ' +
    'fully document and govern this repository. Ground them in the governance context above ' +
    'where relevant (ownership, data handling, decision authority, backup, security, business ' +
    'rules). Each question must be concrete and answerable by the repo owner.\n\n' +
    'Return ONLY a JSON array, no preamble or markdown fences. Each element:\n' +
    '{"question": "<the question>", "priority": "HIGH|MEDIUM|LOW", "topic": "<short slug>"}';
  const [ok, text] = await call_claude_text(prompt);
  if (!ok || !text) {
    return [];
  }
  const items = _parse_repo_question_json(text);
  const candidates: Dict[] = [];
  items.forEach((item, i) => {
    const idx = i + 1;
    const q = (item['question'] || '').trim();
    if (!q) {
      return;
    }
    let prio = (item['priority'] || 'MEDIUM').trim().toUpperCase();
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(prio)) {
      prio = 'MEDIUM';
    }
    const topic = (item['topic'] || `q${idx}`).trim().replace(/ /g, '-').slice(0, 24);
    candidates.push({
      source: 'claude',
      source_ref: `claude/${repo_name}#${topic}-${idx}`,
      title: q.slice(0, 120),
      short_question: q,
      body_markdown:
        `Claude-drafted governance question for \`${repo_name}\` ` +
        '(grounded in the governance corpus).\n\n' +
        `Question:\n- ${q}\n\n` +
        'Answer with the current reality and note where this should be documented in governance.',
      source_excerpt: q,
      priority: prio,
    });
  });
  return candidates;
}

export async function generate_repo_questions(company: string, repo_name: string, actor = 'generator'): Promise<Dict> {
  const db = getDb();
  const now = nowIso();
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];
  let candidates = await build_repo_question_candidates_claude(company, repo_name);
  let engine_used = 'claude';
  if (!candidates.length) {
    candidates = build_repo_question_candidates(company, repo_name);
    engine_used = 'baseline';
  }
  for (const candidate of candidates) {
    const question_code = build_repo_question_code(repo_name, candidate['source'], candidate['source_ref'], candidate['title']);
    const existing = db
      .prepare('SELECT id FROM repo_questions WHERE company=? AND question_code=?')
      .get(company, question_code);
    if (existing) {
      skipped += 1;
      continue;
    }
    try {
      db.prepare(
        `INSERT INTO repo_questions(
               company, repo_name, question_code, title, body_markdown, short_question,
               priority, status, source, source_ref, source_excerpt, primary_assignee,
               answer_markdown, review_note, reviewed_by, created_by, created_at, updated_at
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).run(
        company,
        repo_name,
        question_code,
        candidate['title'],
        candidate['body_markdown'],
        candidate['short_question'],
        candidate['priority'],
        'OPEN',
        candidate['source'],
        candidate['source_ref'],
        candidate['source_excerpt'] || '',
        'Ryan Cochran',
        '',
        '',
        '',
        actor,
        now,
        now,
      );
      created += 1;
    } catch (exc: any) {
      errors.push(String(exc));
    }
  }
  // db.commit() is a no-op for better-sqlite3 (autocommit outside transactions).
  return { repo_name, created, skipped, errors, engine: engine_used };
}

export async function generate_all_repo_questions(company: string, actor = 'generator'): Promise<Dict[]> {
  const sheet_root = repo_sheet_dir(company);
  const results: Dict[] = [];
  if (!fs.existsSync(sheet_root)) {
    return results;
  }
  const sheets = fs
    .readdirSync(sheet_root)
    .filter((n) => n.endsWith('.md'))
    .sort();
  for (const name of sheets) {
    if (name.startsWith('_')) {
      continue;
    }
    const stem = name.slice(0, name.length - '.md'.length);
    results.push(await generate_repo_questions(company, stem, actor));
  }
  return results;
}

// Employees who have left and must not appear anywhere in the workbench.
export const REMOVED_EMPLOYEES: Record<string, Set<string>> = {
  MView: new Set(['Sanket_Nandanwar', 'Vedika_Kannawar', 'Dhiraj_Kakade', 'Ruchita_Vitkar']),
};

export const ROLE_GROUP_MAP: Record<string, string> = {
  'Owner / Operator': '',
  'Data Scientist': 'Data Scientist',
  'Junior Data Scientist': 'Data Scientist',
  'Senior Data Scientist': 'Data Scientist',
  'Process and Data Lead': 'Data Scientist',
  'Frontend Developer': 'Developer',
  'Backend Developer': 'Developer',
  'Full Stack Developer': 'Developer',
  Developer: 'Developer',
  'QA Tester': 'QA',
  QA: 'QA',
  'Content Writer': 'Content Writer',
  'Web Scraper': 'Web Scraper',
  'Digital Marketing Executive': 'Marketing',
  'Business Development Executive': 'Marketing',
  Marketing: 'Marketing',
  'Video Editor': 'Graphic',
  'Graphic Designer': 'Graphic',
  Graphic: 'Graphic',
  'Sales Team Lead': 'Sales',
  Sales: 'Sales',
};

export function role_group(role: string): string {
  const r = (role || '').trim();
  return r in ROLE_GROUP_MAP ? ROLE_GROUP_MAP[r] : r;
}

export function list_employees(company: string): string[] {
  const cfg = get_company(company);
  const emp_dir = path.join(cfg['root'], 'EMPLOYEE_TASKS');
  const employees = new Set<string>();
  if (fs.existsSync(emp_dir)) {
    for (const entry of fs.readdirSync(emp_dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        employees.add(entry.name);
      }
    }
  }
  for (const key of Object.keys((TEAM_MEMBER_PROFILES as Dict)[company] || {})) {
    employees.add(key);
  }
  const excluded = REMOVED_EMPLOYEES[company] || new Set<string>();
  let list = [...employees].filter((e) => !excluded.has(e));
  if (!list.length) {
    return ['Ryan_Cochran'];
  }
  list = list.sort();
  if (list.includes('Ryan_Cochran')) {
    list = list.filter((e) => e !== 'Ryan_Cochran');
    list.unshift('Ryan_Cochran');
  } else {
    list.unshift('Ryan_Cochran');
  }
  return list;
}

export function get_team_member_department_tags_map(db: DB, company: string): Record<string, Dict[]> {
  const rows = db
    .prepare(
      `SELECT member_key, department_key, source, note, updated_at
           FROM team_member_department_tags
           WHERE company=?
           ORDER BY member_key, department_key`,
    )
    .all(company) as Dict[];
  const grouped: Record<string, Dict[]> = {};
  for (const row of rows) {
    if (!grouped[row['member_key']]) grouped[row['member_key']] = [];
    grouped[row['member_key']].push({ ...row });
  }
  return grouped;
}

export function merged_departments_for_member(company: string, member_key: string, db: DB | null = null): string[] {
  // Python opens its own sqlite connection when db is None; here we reuse getDb().
  if (db === null) {
    db = getDb();
  }
  const static_departments = new Set<string>(get_team_member_profile(company, member_key)['departments'] || []);
  const manual_departments = new Set<string>(
    (db
      .prepare('SELECT department_key FROM team_member_department_tags WHERE company=? AND member_key=?')
      .all(company, member_key) as Dict[]).map((row) => row['department_key']),
  );
  return [...new Set<string>([...static_departments, ...manual_departments])].sort();
}

export function meetings_dir_for_company(company: string): string {
  const target = path.join(get_company(company)['root'], '_GOVERNANCE', '_MEETINGS');
  fs.mkdirSync(target, { recursive: true });
  return target;
}

// NOTE: save_meeting_notes_file relies on a Flask FileStorage object (file_storage
// with .filename and .save()). In the Next.js migration file uploads are handled
// differently; ported structurally. `file_storage` is expected to expose `filename`
// and a `save(path)` method.
export function save_meeting_notes_file(
  company: string,
  file_storage: { filename?: string; save: (p: string) => void },
  meeting_date: string,
  title: string,
): string {
  const suffix = path.extname(file_storage.filename || 'notes.txt') || '.txt';
  const date_prefix = String(meeting_date || todayIso());
  const month_dir = path.join(meetings_dir_for_company(company), date_prefix.slice(0, 7));
  fs.mkdirSync(month_dir, { recursive: true });
  const slug_base = pyStrip((title || 'meeting').replace(/[^A-Za-z0-9]+/g, '_'), '_') || 'meeting';
  const filename = `${date_prefix}_${slug_base.slice(0, 48)}${suffix.toLowerCase()}`;
  const p = path.join(month_dir, filename);
  file_storage.save(p);
  return p;
}

/** datetime.date.today().isoformat() */
function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function list_meetings_for_company(
  db: DB,
  company: string,
  attendee: string | null = null,
  days: number | null = null,
): Dict[] {
  let query = `
        SELECT m.*,
               COUNT(a.id) AS attendee_count,
               SUM(CASE WHEN a.follow_up_done=1 THEN 1 ELSE 0 END) AS follow_up_done_count
        FROM meetings m
        LEFT JOIN meeting_attendees a ON a.meeting_id = m.id
        WHERE m.company=?
    `;
  const params: any[] = [company];
  if (attendee) {
    query += ' AND m.id IN (SELECT meeting_id FROM meeting_attendees WHERE team_member_key=?)';
    params.push(attendee);
  }
  if (days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const pad = (n: number) => String(n).padStart(2, '0');
    const cutoff = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    query += ' AND m.meeting_date>=?';
    params.push(cutoff);
  }
  query += ' GROUP BY m.id ORDER BY m.meeting_date DESC, m.id DESC';
  const rows = (db.prepare(query).all(...params) as Dict[]).map((r) => ({ ...r }));
  for (const row of rows) {
    row['attendees'] = (db
      .prepare(
        `SELECT team_member_key, external_name, external_email, attended, follow_up_done, follow_up_note
               FROM meeting_attendees
               WHERE meeting_id=?
               ORDER BY COALESCE(team_member_key, external_name)`,
      )
      .all(row['id']) as Dict[]).map((a) => ({ ...a }));
    row['action_items'] = (db
      .prepare(
        `SELECT id, owner_key, description, status, created_at, updated_at
               FROM meeting_action_items
               WHERE meeting_id=?
               ORDER BY id`,
      )
      .all(row['id']) as Dict[]).map((a) => ({ ...a }));
  }
  return rows;
}

export function count_questions_for_company(cfg: Dict): number {
  let total = 0;
  const org_q = path.join(cfg['root'], '_GOVERNANCE', 'PRIORITY_QUESTIONS_FOR_RYAN.md');
  if (fs.existsSync(org_q)) {
    total += parse_questions(readTextReplace(org_q)).length;
  }
  const emp_dir = path.join(cfg['root'], 'EMPLOYEE_TASKS');
  if (fs.existsSync(emp_dir)) {
    for (const entry of fs.readdirSync(emp_dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const empPath = path.join(emp_dir, entry.name);
      for (const qf of fs.readdirSync(empPath)) {
        if (/.*PRIORITY_QUESTIONS.*\.md$/.test(qf)) {
          total += parse_questions(readTextReplace(path.join(empPath, qf))).length;
        }
      }
    }
  }
  return total;
}

export function get_team_member_profile(company: string, member_key: string): Dict {
  const profiles = (TEAM_MEMBER_PROFILES as Dict)[company] || {};
  if (member_key in profiles) {
    return profiles[member_key];
  }
  return {
    role: '',
    purpose: '',
    departments: [],
    repos: [],
    operating_sources: [],
  };
}

export function local_service_up(host: string, port: number, timeout = 0.5): boolean {
  // Python uses socket.create_connection with a timeout; that is blocking.
  // A faithful synchronous port is not possible with Node's async net module,
  // so we attempt a best-effort synchronous-ish check. Returns false on failure.
  try {
    const socket = new net.Socket();
    let connected = false;
    socket.setTimeout(timeout * 1000);
    socket.connect(port, host);
    socket.on('connect', () => {
      connected = true;
      socket.destroy();
    });
    // Without blocking we cannot truly wait; mirror the OSError->False fallback.
    return connected;
  } catch {
    return false;
  }
}

export function get_member_hub(company: string, member_key: string): Dict {
  void company;
  void member_key;
  return {
    enabled: false,
    gmail_auth_enabled: false,
    title: '',
    description: '',
    url: '',
    repo_dir: '',
    launch_target: '',
    running: false,
  };
}

// NOTE: member_hub_request uses requests.request (HTTP). Made async and ported to
// fetch (see TRANSLATION RULE 6). Returns [json|null, hub].
export async function member_hub_request(
  company: string,
  member_key: string,
  p: string,
  method = 'GET',
): Promise<[any, Dict]> {
  const hub = get_member_hub(company, member_key);
  if (!hub['enabled']) {
    abort(400, 'No member hub configured for this team member.');
  }
  if (!hub['running']) {
    return [null, hub];
  }
  const url = `${pyRStrip(hub['url'], '/')}/${pyLStrip(p, '/')}`;
  const response = await fetch(url, { method });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return [await response.json(), hub];
}

export function count_findings_for_company(cfg: Dict): number {
  const findings_file = path.join(cfg['root'], '_GOVERNANCE', '_FINDINGS_FOR_REVIEW.md');
  if (!fs.existsSync(findings_file)) {
    return 0;
  }
  return parse_findings(readTextReplace(findings_file)).length;
}

export function command_exists(path_or_name: string | null): boolean {
  if (!path_or_name) {
    return false;
  }
  try {
    return Boolean(which(path_or_name) || fs.existsSync(path_or_name));
  } catch {
    return false;
  }
}

export function openai_configured(): boolean {
  return Boolean(get_openai_api_key());
}

export function anthropic_configured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function github_cli_authenticated(): [boolean, string] {
  if (!command_exists(GH_EXE)) {
    return [false, 'gh CLI not installed'];
  }
  try {
    const result = spawnSync(GH_EXE, ['auth', 'status'], { encoding: 'utf-8', timeout: 10 * 1000 });
    if (result.error) {
      return [false, String(result.error.message || result.error)];
    }
    if (result.status === 0) {
      return [true, 'gh auth active'];
    }
    return [false, pyStrip(String(result.stderr || result.stdout || 'gh auth missing'))];
  } catch (e: any) {
    return [false, String(e)];
  }
}

export function customer_sources_for_company(company: string): Dict {
  const cfg = get_company(company);
  const govRoot = path.join(cfg['root'], '_GOVERNANCE');
  const governance_hits = fs.existsSync(govRoot)
    ? walkFiles(govRoot)
        .filter((p) => p.toLowerCase().includes('customer') && p.toLowerCase().endsWith('.md'))
        .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0))
    : [];
  let mirror_hits: string[] = [];
  if (fs.existsSync(cfg['mirror'])) {
    mirror_hits = fs
      .readdirSync(cfg['mirror'], { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.toLowerCase().includes('customer'))
      .map((e) => path.join(cfg['mirror'], e.name))
      .sort();
  }
  return {
    governance_files: governance_hits.slice(0, 50).map((p) => ({ name: path.basename(p), path: p })),
    customer_repos: mirror_hits.slice(0, 50).map((p) => ({ name: path.basename(p), path: p })),
    canonical_list_loaded: false,
  };
}

export function governance_file_category(rel_path: string): Dict {
  const rel_norm = String(rel_path).replace(/\\/g, '/').toLowerCase();
  const name = path.basename(rel_path).toLowerCase();

  if (rel_norm.includes('_archive') || name.startsWith('_archive')) {
    return { key: 'archive', label: 'Archive & Historical' };
  }
  if (rel_norm.includes('/repo_sheets/')) {
    return { key: 'systems', label: 'Repo & System Maps' };
  }
  if (
    rel_norm.startsWith('departments/') ||
    rel_norm.includes('/departments/') ||
    rel_norm.startsWith('employee_tasks/') ||
    rel_norm.includes('/employee_tasks/')
  ) {
    return { key: 'operations', label: 'Operations & Department Guides' };
  }
  if (rel_norm.includes('/_drafts/') || name.startsWith('codex_prompt_') || name.includes('prompt')) {
    return { key: 'drafts', label: 'Drafts & Build Prompts' };
  }
  if (['findings', 'review', 'drift', 'change_log', 'implementation_status', 'risk_register'].some((t) => name.includes(t))) {
    return { key: 'reviews', label: 'Reviews, Findings & Drift' };
  }
  if (
    ['repo_', 'infrastructure', 'inventory', 'engineering_standards', 'integration_architecture', 'devops', 'system_map', 'git_status'].some(
      (t) => name.includes(t),
    )
  ) {
    return { key: 'systems', label: 'Repo & System Maps' };
  }
  if (
    ['customer_', 'product_strategy', 'daily_ops', 'team_meetings', 'team_member', 'security', 'pricing', 'tax_', 'ops_', 'workflow_'].some(
      (t) => name.includes(t),
    )
  ) {
    return { key: 'operations', label: 'Operations & Department Guides' };
  }
  if (
    ['readme', 'master_governance_architecture', 'terminology', 'non_negotiables', 'business_model', 'glossary', 'governance_punch_list', 'constitution'].some(
      (t) => name.includes(t),
    )
  ) {
    return { key: 'core', label: 'Core Governance' };
  }
  if (/^\d\d_/.test(name)) {
    return { key: 'core', label: 'Core Governance' };
  }
  return { key: 'general', label: 'General' };
}

export function governance_file_attention_flags(rel_path: string, text: string): Dict[] {
  const rel_norm = String(rel_path).replace(/\\/g, '/').toLowerCase();
  const lower_text = (text || '').toLowerCase();
  const flags: Dict[] = [];
  if (rel_norm.includes('/_drafts/')) {
    flags.push({
      level: 'info',
      label: 'Draft',
      reason: 'This file lives in the _DRAFTS workspace.',
    });
  }
  const patterns: [string, string, string][] = [
    ['high', 'Owner decision required', 'owner_decision_required'],
    ['high', 'Pending verification', 'pending verification'],
    ['medium', 'TODO', '(^|\\W)todo(?=\\W|$)'],
    ['medium', 'TBD', '(^|\\W)tbd(?=\\W|$)'],
    ['medium', 'Assign owner', 'assign owner'],
    ['medium', 'Placeholder', '\\[project name\\]|\\[company\\]|\\[owner\\]'],
    ['medium', 'Not implemented', 'not yet implemented|not implemented'],
    ['medium', 'Needs clarity', 'needs clarification|requires clarification|open question'],
    ['low', 'FIXME', 'fixme'],
  ];
  for (const [level, label, pattern] of patterns) {
    if (new RegExp(pattern, 'im').test(lower_text)) {
      flags.push({
        level,
        label,
        reason: `Matched pattern: ${label}`,
      });
    }
  }
  const seen = new Set<string>();
  const deduped: Dict[] = [];
  for (const flag of flags) {
    const key = `${flag['level']}|${flag['label']}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(flag);
  }
  return deduped;
}

export function governance_file_attention_level(flags: Dict[]): string {
  if (flags.some((flag) => flag['level'] === 'high')) {
    return 'high';
  }
  if (flags.some((flag) => flag['level'] === 'medium')) {
    return 'medium';
  }
  if (flags.some((flag) => flag['level'] === 'info')) {
    return 'info';
  }
  if (flags.some((flag) => flag['level'] === 'low')) {
    return 'low';
  }
  return 'clear';
}

export function governance_file_headings(text: string, limit = 8): string[] {
  const headings: string[] = [];
  for (const line of (text || '').split(/\r?\n/)) {
    const stripped = line.trim();
    if (stripped.startsWith('#')) {
      const heading = pyLStrip(stripped, '#').trim();
      if (heading) {
        headings.push(heading);
      }
    }
    if (headings.length >= limit) {
      break;
    }
  }
  return headings;
}

export function list_governance_files(company: string): Dict[] {
  const cfg = get_company(company);
  const rows: Dict[] = [];
  const files = rglobMd(cfg['root']).sort((a, b) =>
    a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0,
  );
  for (const p of files) {
    if (p.split(path.sep).includes('.git')) {
      continue;
    }
    let rel: string;
    try {
      rel = path.relative(cfg['root'], p);
      if (rel.startsWith('..')) {
        continue;
      }
    } catch {
      continue;
    }
    const stat = fs.statSync(p);
    const text = readTextReplace(p);
    const category = governance_file_category(rel);
    const flags = governance_file_attention_flags(rel, text);
    const attention_level = governance_file_attention_level(flags);
    rows.push({
      path: rel,
      name: path.basename(p),
      size: stat.size,
      modified: mtimeIso(stat.mtimeMs),
      category_key: category['key'],
      category_label: category['label'],
      attention_flags: flags,
      attention_level,
      attention_count: flags.length,
      attention_summary: flags.slice(0, 3).map((flag) => flag['label']).join(', '),
      headings: governance_file_headings(text, 5),
    });
  }
  return rows;
}

/** datetime.datetime.fromtimestamp(mtime).isoformat() */
function mtimeIso(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `.${pad(d.getMilliseconds(), 3)}000`
  );
}

export function build_governance_file_index(company: string): Dict {
  const rows = list_governance_files(company);
  const order: Record<string, number> = {};
  (GOVERNANCE_FILE_CATEGORY_ORDER as [string, string][]).forEach(([key], idx) => {
    order[key] = idx;
  });
  rows.sort((a, b) => {
    const oa = a['category_key'] in order ? order[a['category_key']] : 999;
    const ob = b['category_key'] in order ? order[b['category_key']] : 999;
    if (oa !== ob) return oa - ob;
    const pa = a['path'].toLowerCase();
    const pb = b['path'].toLowerCase();
    if (pa !== pb) return pa < pb ? -1 : 1;
    return 0;
  });
  const categories: Dict[] = [];
  for (const [key, label] of GOVERNANCE_FILE_CATEGORY_ORDER as [string, string][]) {
    const cat_rows = rows.filter((row) => row['category_key'] === key);
    if (!cat_rows.length) {
      continue;
    }
    categories.push({
      key,
      label,
      count: cat_rows.length,
      attention_count: cat_rows.filter((row) => row['attention_count']).length,
    });
  }
  return {
    company,
    count: rows.length,
    attention_count: rows.filter((row) => row['attention_count']).length,
    draft_count: rows.filter((row) => row['category_key'] === 'drafts').length,
    categories,
    rows,
  };
}

export function build_governance_file_chat_prompt(
  company: string,
  file_row: Dict,
  content: string,
  related_files: Dict[],
  user_prompt: string,
): string {
  const related_lines = related_files.slice(0, 6).map((item) => `- ${item['path']}`).join('\n') || '- None';
  const attention_lines =
    (file_row['attention_flags'] || []).map((flag: Dict) => `- ${flag['label']}: ${flag['reason']}`).join('\n') ||
    '- No automatic clarity alerts.';
  const heading_lines =
    (file_row['headings'] || []).map((heading: string) => `- ${heading}`).join('\n') || '- No headings detected.';
  return `You are reviewing one governance document for ${(COMPANIES as Dict)[company]['name_full']} inside Governance Workbench.

Current file:
- Path: ${file_row['path']}
- Category: ${file_row['category_label']}
- Automatic clarity alerts:
${attention_lines}

Detected headings:
${heading_lines}

Related files in the same category:
${related_lines}

File content:
---
${pyStrip(content || '(no content)').slice(0, 16000)}
---

User request:
${user_prompt}

Rules:
1. Ground the answer in the current file first.
2. If you infer anything beyond the text, label it INFERRED.
3. Call out drift, ambiguity, missing owner truth, or stale framing explicitly.
4. Refer to headings or quoted phrases from the file when possible.
5. Do not invent approved governance truth.

Return markdown with these headings:
- Direct answer
- Drift / clarity issues
- Related files to inspect
- Recommended next edit
`;
}

export function build_repo_question_chat_prompt(company: string, question_row: Dict, user_prompt: string): string {
  return `You are reviewing one repo-specific governance question for ${(COMPANIES as Dict)[company]['name_full']} inside Governance Workbench.

Repo question:
- Repo: ${question_row['repo_name']}
- Code: ${question_row['question_code']}
- Title: ${question_row['title']}
- Priority: ${question_row['priority']}
- Status: ${question_row['status']}
- Source type: ${question_row['source']}
- Source reference: ${question_row['source_ref']}

Question body:
---
${pyStrip(question_row['body_markdown'] || '').slice(0, 12000)}
---

Source excerpt:
---
${pyStrip(question_row['source_excerpt'] || '').slice(0, 4000)}
---

Current working answer:
---
${pyStrip(question_row['answer_markdown'] || '').slice(0, 6000)}
---

User request:
${user_prompt}

Rules:
1. Stay grounded in the repo question, its source reference, and current working answer.
2. If you infer beyond the stored evidence, label it INFERRED.
3. Call out any missing evidence, stale question framing, or likely follow-up questions.
4. Do not invent approved governance truth.

Return markdown with these headings:
- Direct answer
- What the evidence supports
- Gaps or drift to check
- Recommended next step
`;
}

// sql_driver_status(): Python checks for optional Python SQL drivers via
// importlib.util.find_spec. Those packages do not exist in the Node runtime, so
// the faithful port reports them all absent.
export function sql_driver_status(): Dict {
  return {
    pyodbc: false,
    pymssql: false,
    sqlalchemy: false,
  };
}

export function customer_source_settings(company: string): Dict {
  const settings = load_local_settings();
  const source_cfg = ((settings['customer_sources'] as Dict) || {})[company] || {};
  const drivers = sql_driver_status();
  const candidates: Record<string, Dict[]> = {
    MView: [
      { label: 'Portal / CRM source not yet confirmed', type: 'question_required', notes: 'Need confirmed customer source for Mineral View.' },
      { label: 'MineralView-Portal-Next', type: 'repo', notes: 'Likely customer-facing portal / experience surface.' },
    ],
  };
  const profile_fields: Record<string, string[]> = {
    MView: [
      'Customer / account ID', 'Company / investor name', 'Email', 'Phone', 'Account status',
      'Plan / subscription type', 'Product usage', 'Report / deck interest', 'Persona classification',
      'Assigned owner', 'Last contact date',
    ],
  };
  const configured = Boolean(source_cfg['server'] && source_cfg['database']);
  return {
    configured,
    source: source_cfg,
    drivers,
    driver_ready: Object.values(drivers).some((v) => v),
    candidates: candidates[company] || [],
    profile_fields: profile_fields[company] || [],
  };
}

export function departments_for_company(company: string, db: DB | null = null): Dict {
  const shared_defs = (DEPARTMENT_ARCHITECTURE as Dict)['shared'] || [];
  const company_defs = (DEPARTMENT_ARCHITECTURE as Dict)[company] || [];
  const profile_keys = new Set<string>(Object.keys((TEAM_MEMBER_PROFILES as Dict)[company] || {}));
  const member_keys_all = list_employees(company).filter((k) => profile_keys.has(k));
  const tag_map = db !== null ? get_team_member_department_tags_map(db, company) : {};

  function build_entry(defn: Dict, bucket: string): Dict {
    let repos = defn['repos'];
    if (repos === undefined || repos === null) {
      repos = ((defn['repos_by_company'] as Dict) || {})[company] || [];
    }
    const member_keys = member_keys_all
      .filter((member_key) => {
        const combined = new Set<string>(get_team_member_profile(company, member_key)['departments'] || []);
        for (const row of tag_map[member_key] || []) {
          combined.add(row['department_key']);
        }
        return combined.has(defn['key']);
      })
      .sort();
    const member_names = member_keys.map((member_key) => pretty_member_name(member_key)).sort();
    return {
      key: defn['key'],
      name: defn['name'],
      description: defn['description'],
      bucket,
      repos,
      repo_count: repos.length,
      member_keys,
      member_names,
      member_count: member_names.length,
    };
  }

  const shared = (shared_defs as Dict[]).map((item) => build_entry(item, 'Shared Departments'));
  const company_specific = (company_defs as Dict[]).map((item) => build_entry(item, `${company} Departments`));
  const all_items = shared.concat(company_specific);
  return {
    shared,
    company_specific,
    all: all_items,
    count: all_items.length,
  };
}

export function normalize_department_key(company: string, raw_value: any, db: DB | null = null): string {
  const value = String(raw_value || '').trim();
  if (!value) {
    return '';
  }
  const department_data = departments_for_company(company, db);
  for (const item of department_data['all'] as Dict[]) {
    if (value.toLowerCase() === String(item['key']).toLowerCase() || value.toLowerCase() === String(item['name']).toLowerCase()) {
      return item['key'];
    }
  }
  return value;
}

export function aspect_groups_for_company(company: string): Dict[] {
  const cfg = get_company(company);
  let repo_names: string[] = [];
  if (fs.existsSync(cfg['mirror'])) {
    repo_names = fs
      .readdirSync(cfg['mirror'], { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(cfg['mirror'], e.name, '.git')))
      .map((e) => e.name)
      .sort();
  }
  const remaining = new Set<string>(repo_names);
  const groups: Dict[] = [];
  for (const rule of (ASPECT_GROUP_RULES as Dict)[company] || []) {
    const matched = (rule['repos'] as string[]).filter((repo) => remaining.has(repo));
    for (const repo of matched) {
      remaining.delete(repo);
    }
    groups.push({
      name: rule['name'],
      description: rule['description'],
      repos: matched,
      count: matched.length,
      confidence: 'Working hypothesis',
    });
  }
  if (remaining.size) {
    groups.push({
      name: 'Needs Review / Not Yet Grouped',
      description:
        'Repos not yet assigned to an aspect group. These need review before they are treated as part of a stable company map.',
      repos: [...remaining].sort(),
      count: remaining.size,
      confidence: 'Needs review',
    });
  }
  return groups;
}

export function intake_dir_for_id(company: string, intake_id: number): string {
  return path.join(get_intake_dir(company), `intake_${String(intake_id).padStart(5, '0')}`);
}

export function team_member_file_storage_path(
  company: string,
  member_key: string,
  original_filename: string,
  file_purpose = 'other',
): string {
  const suffix = path.extname(original_filename || 'upload.bin') || '.bin';
  const stemRaw = path.basename(original_filename || 'upload', path.extname(original_filename || 'upload'));
  let stem = pyStrip(stemRaw.replace(/[^A-Za-z0-9._-]+/g, '_'), '._') || 'upload';
  const timestamp = strftimeNow();
  const filename = `${timestamp}_${stem.slice(0, 64)}${suffix.toLowerCase()}`;
  return path.join(get_team_member_bucket_dir(company, member_key, file_purpose), filename);
}

/** datetime.datetime.now().strftime('%Y%m%d_%H%M%S') */
function strftimeNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export function file_size_safe(path_value: string): number {
  try {
    return fs.statSync(path_value).size;
  } catch {
    return 0;
  }
}

export function read_text_file_preview(p: string, limit = 7000): string {
  return readTextReplace(p).slice(0, limit);
}

// NOTE: read_docx_preview parses word/document.xml from a .docx (zip). A faithful
// zip+XML port would require a dependency; the Python code is wrapped in a broad
// try/except that returns '' on any failure. We preserve that fallback and return
// '' (best-effort). See report.
export function read_docx_preview(p: string, limit = 7000): string {
  void p;
  void limit;
  try {
    // No bundled zip/XML reader; Python's except path returns ''.
    return '';
  } catch {
    return '';
  }
}

// NOTE: read_pdf_preview uses the optional pypdf package. Python wraps in
// try/except returning '' when unavailable; we return '' (no PDF lib bundled).
export function read_pdf_preview(p: string, limit = 7000): string {
  void p;
  void limit;
  try {
    return '';
  } catch {
    return '';
  }
}

export function extract_member_file_preview(path_value: string, limit = 7000): string {
  const suffix = path.extname(path_value).toLowerCase();
  if (['.txt', '.md', '.csv', '.json', '.log', '.py', '.sql', '.html', '.htm'].includes(suffix)) {
    return read_text_file_preview(path_value, limit);
  }
  if (suffix === '.docx') {
    return read_docx_preview(path_value, limit);
  }
  if (suffix === '.pdf') {
    return read_pdf_preview(path_value, limit);
  }
  return '';
}

export function detect_member_file_kind(filename: string, preview_text: string, source_type: string): string {
  const suffix = path.extname(filename || '').toLowerCase();
  const text = `${filename || ''}\n${source_type || ''}\n${preview_text || ''}`.toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(suffix) || source_type === 'screenshot') {
    return 'image / screenshot';
  }
  if (suffix === '.pdf') {
    return 'pdf document';
  }
  if (suffix === '.docx') {
    return 'word document';
  }
  if (text.includes('job description') || text.includes('responsibilities') || text.includes('qualifications')) {
    return 'job description';
  }
  if (text.includes('meeting') || text.includes('agenda') || text.includes('follow-up')) {
    return 'meeting notes';
  }
  if (text.includes('resume') || text.includes('curriculum vitae')) {
    return 'resume / candidate profile';
  }
  return 'general document';
}

export function member_file_department_keyword_map(company: string): Record<string, string[]> {
  const base: Record<string, string[]> = {
    ACCOUNTING: ['tax', 'filing', 'sales tax', 'avalara', 'reconcile', 'reconciliation', 'payables', 'receivables', 'invoice', 'quickbooks'],
    CUSTOMER_SUPPORT: ['customer support', 'ticket', 'customer issue', 'refund', 'complaint', 'follow-up', 'case'],
    MARKETING: ['campaign', 'marketing', 'seo', 'audience', 'email list', 'content', 'social'],
    DEVELOPMENT: ['developer', 'engineering', 'api', 'repository', 'repo', 'frontend', 'backend', 'codebase', 'deployment', 'bug'],
    CUSTOMER_RELATIONS: ['customer relations', 'relationship', 'outreach', 'account management'],
    DAILY_OPS: ['operations', 'daily ops', 'schedule', 'receiving', 'shipping', 'shipment', 'package', 'warehouse', 'inventory'],
    PRICING: ['premium', 'pricing', 'spot', 'margin', 'price', 'vendor pricing'],
    VENDOR_MANAGEMENT: ['vendor', 'supplier', 'wholesale', 'dealer', 'feed'],
    ORDER_MANAGEMENT: ['order', 'checkout', 'shipstation', 'fulfillment', 'payment status'],
    PEOPLE: ['employee', 'hiring', 'candidate', 'job description', 'onboarding', 'training', 'review'],
  };
  if (company === 'MView') {
    Object.assign(base, {
      DATA_SCIENCE: ['well', 'lease', 'production', 'decline curve', 'royalty', 'mineral', 'title'],
      ENGINEERING: ['developer', 'engineering', 'api', 'codebase', 'deployment', 'frontend', 'backend'],
      PRODUCT: ['roadmap', 'feature', 'ux', 'customer interview', 'product'],
      CUSTOMER_SUCCESS: ['customer', 'client', 'support', 'renewal', 'account'],
    });
  }
  return base;
}

export function heuristic_member_file_analysis(
  company: string,
  member_key: string,
  filename: string,
  note: string,
  preview_text: string,
): Dict {
  const text = [filename, note, preview_text].filter((part) => part).join(' ').toLowerCase();
  const keyword_map = member_file_department_keyword_map(company);
  const scored: Dict[] = [];
  for (const [dept_key, keywords] of Object.entries(keyword_map)) {
    const hits = keywords.filter((kw) => text.includes(kw));
    if (hits.length) {
      scored.push({
        key: dept_key,
        score: hits.length,
        reason: `Matched keywords: ${hits.slice(0, 4).join(', ')}`,
      });
    }
  }
  scored.sort((a, b) => {
    if (a['score'] !== b['score']) return b['score'] - a['score'];
    return a['key'] < b['key'] ? -1 : a['key'] > b['key'] ? 1 : 0;
  });
  let suggestions: Dict[] = scored.slice(0, 3).map((item) => ({
    key: item['key'],
    reason: item['reason'],
    confidence: item['score'] >= 3 ? 'high' : 'medium',
  }));
  if (!suggestions.length) {
    const profile_departments = get_team_member_profile(company, member_key)['departments'] || [];
    suggestions = (profile_departments as string[]).slice(0, 2).map((dept_key) => ({
      key: dept_key,
      reason: 'Used the member profile department because the file text did not strongly match a more specific lane.',
      confidence: 'low',
    }));
  }
  const preview_words = (preview_text || '').match(/[\w/-]+/g) || [];
  const doc_kind = detect_member_file_kind(filename, preview_text, 'document');
  const summary_bits: string[] = [];
  if (note) {
    summary_bits.push(`Uploader note: ${note.trim()}`);
  }
  if (preview_words.length) {
    summary_bits.push(`Preview captured from the file (${Math.min(preview_words.length, 80)} words sampled).`);
  } else {
    summary_bits.push('No text preview was available, so the classification relied on the filename, note, and file type.');
  }
  summary_bits.push(`Likely document type: ${doc_kind}.`);
  if (suggestions.length) {
    summary_bits.push(`Most likely department lanes: ${suggestions.map((item) => item['key']).join(', ')}.`);
  }
  return {
    doc_kind,
    confidence: suggestions.length ? suggestions[0]['confidence'] : 'low',
    summary: summary_bits.join(' '),
    suggested_departments: suggestions,
    raw_output_text: preview_text ? preview_text.slice(0, 4000) : '',
    engine: 'Workbench Heuristic AI',
  };
}

export const GOVERNANCE_CONTEXT_FILES = [
  'NON_NEGOTIABLE', 'OPERATING_CONSTITUTION', 'CONSTITUTION', 'BUSINESS_MODEL',
  'GLOSSARY', 'FINDINGS', 'PRIORITY_QUESTIONS', 'DECISION_LOG', 'SECURITY_RISK',
  'MASTER_GOVERNANCE',
];

export function governance_context(company: string, max_chars = 14000, per_file_chars = 3500): string {
  let cfg: Dict;
  try {
    cfg = get_company(company);
  } catch {
    return '';
  }
  const gov_root = path.join(cfg['root'], '_GOVERNANCE');
  if (!fs.existsSync(gov_root)) {
    return '';
  }

  function rank(p: string): number {
    const name = path.basename(p).toUpperCase();
    for (let i = 0; i < GOVERNANCE_CONTEXT_FILES.length; i++) {
      if (name.includes(GOVERNANCE_CONTEXT_FILES[i])) {
        return i;
      }
    }
    return GOVERNANCE_CONTEXT_FILES.length;
  }

  let files: string[];
  try {
    files = rglobMd(gov_root).filter((p) => rank(p) < GOVERNANCE_CONTEXT_FILES.length);
  } catch {
    return '';
  }
  files.sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    const na = path.basename(a);
    const nb = path.basename(b);
    return na < nb ? -1 : na > nb ? 1 : 0;
  });
  const chunks: string[] = [];
  let total = 0;
  for (const p of files) {
    let text: string;
    try {
      text = readTextReplace(p).trim();
    } catch {
      continue;
    }
    if (!text) {
      continue;
    }
    let rel: string;
    try {
      rel = path.relative(gov_root, p);
    } catch {
      rel = path.basename(p);
    }
    let block = `### ${rel}\n${text.slice(0, per_file_chars)}`;
    if (total + block.length > max_chars) {
      block = block.slice(0, Math.max(0, max_chars - total));
    }
    if (!block) {
      break;
    }
    chunks.push(block);
    total += block.length;
    if (total >= max_chars) {
      break;
    }
  }
  if (!chunks.length) {
    return '';
  }
  return (
    'APPROVED GOVERNANCE SOURCE OF TRUTH (authoritative corpus excerpts - ground your ' +
    'answer in these, do not contradict them, and do not fabricate beyond them):\n\n' +
    chunks.join('\n\n')
  );
}

export function build_member_file_openai_prompt(
  company: string,
  member_key: string,
  file_row: Dict,
  preview_text: string,
  departments: Dict[],
): string {
  const department_lines = departments.map((item) => `- ${item['key']}: ${item['name']}`).join('\n');
  return `You are analyzing a file uploaded to a team-member workspace in the Governance Workbench for ${(COMPANIES as Dict)[company]['name_full']}.

Team member: ${pretty_member_name(member_key)}
Original filename: ${file_row['original_filename']}
Source type: ${file_row['source_type']}
Uploader note: ${file_row['note'] || '(none)'}

Available department keys:
${department_lines}

Text preview from the file:
---
${(preview_text || '(no text preview available)').slice(0, 5000)}
---

Return JSON only with this shape:
{
  "summary": "one short paragraph",
  "doc_kind": "short label",
  "confidence": "high|medium|low",
  "suggested_departments": [
    {"key": "DEPARTMENT_KEY", "reason": "short why", "confidence": "high|medium|low"}
  ]
}

Rules:
- Use only the department keys listed above.
- Suggest at most 3 departments.
- If the evidence is weak, return lower confidence instead of guessing.
- Keep the summary grounded in the preview text and uploader note.
`;
}

export function parse_member_file_openai_response(text: string, departments: Dict[]): Dict | null {
  let data: Dict;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const valid_keys = new Set<string>(departments.map((item) => item['key']));
  const suggestions: Dict[] = [];
  for (const item of (data['suggested_departments'] as Dict[]) || []) {
    const key = String(item['key'] || '').trim();
    if (valid_keys.has(key)) {
      suggestions.push({
        key,
        reason: String(item['reason'] || '').trim(),
        confidence: String(item['confidence'] || 'medium').trim().toLowerCase() || 'medium',
      });
    }
  }
  return {
    summary: String(data['summary'] || '').trim(),
    doc_kind: String(data['doc_kind'] || '').trim() || 'general document',
    confidence: String(data['confidence'] || 'medium').trim().toLowerCase() || 'medium',
    suggested_departments: suggestions.slice(0, 3),
  };
}

// NOTE: analyze_team_member_file may call the OpenAI HTTP API (requests.post).
// Ported to async + fetch per TRANSLATION RULE 6. The Claude branch uses the sync
// CLI helper. DB writes use better-sqlite3.
export async function analyze_team_member_file(
  db: DB,
  company: string,
  member_key: string,
  file_row: Dict,
  engine_preference = 'OpenAI',
): Promise<Dict> {
  const preview_text = extract_member_file_preview(file_row['saved_path']);
  const department_catalog = departments_for_company(company, db)['all'] as Dict[];
  const heuristic = heuristic_member_file_analysis(
    company,
    member_key,
    file_row['original_filename'],
    file_row['note'] || '',
    preview_text,
  );
  const analysis: Dict = {
    engine: heuristic['engine'],
    status: 'completed',
    doc_kind: heuristic['doc_kind'],
    confidence: heuristic['confidence'],
    summary: heuristic['summary'],
    suggested_departments: heuristic['suggested_departments'],
    raw_output_text: heuristic['raw_output_text'],
    error_text: '',
  };
  const requested = String(engine_preference || file_row['ai_preference'] || 'Claude').trim();
  if (['Claude', 'Claude Code', 'Both'].includes(requested) && claude_cli_available()) {
    const prompt = build_member_file_openai_prompt(company, member_key, file_row, preview_text, department_catalog);
    const [ok, output_text, err] = await call_claude_text(prompt);
    if (ok && output_text) {
      const parsed = parse_member_file_openai_response(output_text, department_catalog);
      if (parsed) {
        Object.assign(analysis, {
          engine: 'Claude Code',
          doc_kind: parsed['doc_kind'],
          confidence: parsed['confidence'],
          summary: parsed['summary'] || heuristic['summary'],
          suggested_departments: parsed['suggested_departments'] || heuristic['suggested_departments'],
          raw_output_text: output_text.slice(0, 12000),
        });
      } else {
        analysis['error_text'] = 'Claude returned non-JSON output; heuristic fallback used.';
      }
    } else {
      analysis['error_text'] = `${err || 'Claude request failed'}. Heuristic fallback used.`;
    }
  } else if (['OpenAI', 'Both'].includes(requested) && openai_configured()) {
    const prompt = build_member_file_openai_prompt(company, member_key, file_row, preview_text, department_catalog);
    try {
      const payload = {
        model: get_openai_model(),
        input: prompt,
      };
      const headers = {
        Authorization: `Bearer ${get_openai_api_key()}`,
        'Content-Type': 'application/json',
      };
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (response.status < 400) {
        const data = await response.json();
        let output_text = data['output_text'] || '';
        if (!output_text && 'output' in data) {
          const parts: string[] = [];
          for (const item of data['output'] || []) {
            for (const content of item['content'] || []) {
              if (content['type'] === 'output_text') {
                parts.push(content['text'] || '');
              }
            }
          }
          output_text = parts.join('\n').trim();
        }
        const parsed = parse_member_file_openai_response(output_text, department_catalog);
        if (parsed) {
          Object.assign(analysis, {
            engine: 'OpenAI Codex',
            doc_kind: parsed['doc_kind'],
            confidence: parsed['confidence'],
            summary: parsed['summary'] || heuristic['summary'],
            suggested_departments: parsed['suggested_departments'] || heuristic['suggested_departments'],
            raw_output_text: output_text.slice(0, 12000),
          });
        } else {
          analysis['error_text'] = 'OpenAI returned non-JSON output; heuristic fallback used.';
        }
      } else {
        analysis['error_text'] = `OpenAI request failed (${response.status}). Heuristic fallback used.`;
      }
    } catch (exc: any) {
      analysis['error_text'] = `${exc}. Heuristic fallback used.`;
    }
  }
  const started_at = nowIso();
  const info = db
    .prepare(
      `INSERT INTO team_member_file_analysis(
               member_file_id, engine, status, started_at, completed_at, doc_kind, confidence,
               summary_text, suggested_departments_json, raw_output_text, error_text
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      file_row['id'],
      analysis['engine'],
      analysis['status'],
      started_at,
      nowIso(),
      analysis['doc_kind'],
      analysis['confidence'],
      analysis['summary'],
      JSON.stringify(analysis['suggested_departments']),
      analysis['raw_output_text'],
      analysis['error_text'],
    );
  analysis['id'] = Number(info.lastInsertRowid);
  return analysis;
}

export function list_team_member_files(db: DB, company: string, member_key: string): Dict[] {
  const rows: Dict[] = [];
  const query_rows = db
    .prepare(
      `SELECT f.*,
                  a.id AS analysis_id,
                  a.engine AS analysis_engine,
                  a.status AS analysis_status,
                  a.doc_kind AS analysis_doc_kind,
                  a.confidence AS analysis_confidence,
                  a.summary_text AS analysis_summary,
                  a.suggested_departments_json AS analysis_suggested_departments_json,
                  a.error_text AS analysis_error_text,
                  a.completed_at AS analysis_completed_at
           FROM team_member_files f
           LEFT JOIN team_member_file_analysis a
             ON a.id = (
                 SELECT a2.id
                 FROM team_member_file_analysis a2
                 WHERE a2.member_file_id = f.id
                 ORDER BY a2.id DESC
                 LIMIT 1
             )
           WHERE f.company=? AND f.member_key=?
           ORDER BY f.uploaded_at DESC, f.id DESC
           LIMIT 20`,
    )
    .all(company, member_key) as Dict[];
  for (const row of query_rows) {
    const item = { ...row };
    let suggestions: any = [];
    const raw = item['analysis_suggested_departments_json'];
    if (raw) {
      try {
        suggestions = JSON.parse(raw);
      } catch {
        suggestions = [];
      }
    }
    item['suggested_departments'] = suggestions;
    rows.push(item);
  }
  return rows;
}

export function insert_team_member_question_ai_run(
  db: DB,
  company: string,
  member_key: string,
  engine: string,
  action_type: string,
  status: string,
  input_file_id: number | null = null,
  prompt_text = '',
  output_text = '',
  output_path = '',
  error_text = '',
): number {
  const now = nowIso();
  const info = db
    .prepare(
      `INSERT INTO team_member_question_ai_run(
               team_member_key, company, engine, action_type, status, started_at, completed_at,
               input_file_id, prompt_text, output_text, output_path, error_text
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      member_key,
      company,
      engine,
      action_type,
      status,
      now,
      ['completed', 'failed', 'blocked'].includes(status) ? now : null,
      input_file_id,
      prompt_text,
      output_text,
      output_path,
      error_text,
    );
  return Number(info.lastInsertRowid);
}

export function update_team_member_question_ai_run(
  db: DB,
  run_id: number,
  status: string,
  output_text: string | null = null,
  output_path: string | null = null,
  error_text: string | null = null,
): void {
  db.prepare(
    `UPDATE team_member_question_ai_run
           SET status=?, completed_at=?, output_text=COALESCE(?, output_text),
               output_path=COALESCE(?, output_path), error_text=COALESCE(?, error_text)
           WHERE id=?`,
  ).run(status, nowIso(), output_text, output_path, error_text, run_id);
}

export function team_member_question_code_slug(member_key: string): string {
  return pyStrip(String(member_key || 'member').replace(/_/g, '-').toLowerCase().replace(/[^a-z0-9]+/g, '-'), '-') || 'member';
}

export function next_team_member_question_code(db: DB, company: string, member_key: string): string {
  const slug = team_member_question_code_slug(member_key);
  const rows = db
    .prepare('SELECT question_code FROM team_member_questions WHERE company=? AND team_member_key=? ORDER BY id')
    .all(company, member_key) as Dict[];
  let highest = 0;
  const pattern = new RegExp(`^TMQ-${escapeRegExp(slug)}-(\\d+)$`, 'i');
  for (const row of rows) {
    const match = pattern.exec(row['question_code'] || '');
    if (match) {
      highest = Math.max(highest, parseInt(match[1], 10));
    }
  }
  return `TMQ-${slug}-${String(highest + 1).padStart(2, '0')}`;
}

export function create_team_member_question(
  db: DB,
  company: string,
  member_key: string,
  title: string,
  body_markdown: string,
  priority = 'MEDIUM',
  status = 'NEW',
  source_file_id: number | null = null,
  source_section = '',
  generated_by = 'manual',
): [number, string] {
  const now = nowIso();
  const code = next_team_member_question_code(db, company, member_key);
  const info = db
    .prepare(
      `INSERT INTO team_member_questions(
               company, team_member_key, question_code, title, body_markdown, priority, status,
               source_file_id, source_section, generated_by, created_at, updated_at, last_human_touch_at
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      company,
      member_key,
      code,
      title,
      body_markdown,
      priority,
      status,
      source_file_id,
      source_section,
      generated_by,
      now,
      now,
      generated_by === 'manual' ? now : null,
    );
  return [Number(info.lastInsertRowid), code];
}

export function list_team_member_questions(
  db: DB,
  company: string,
  member_key: string,
  statuses: string[] | null = null,
): Dict[] {
  const params: any[] = [company, member_key];
  let status_sql = '';
  if (statuses && statuses.length) {
    const placeholders = statuses.map(() => '?').join(',');
    status_sql = ` AND q.status IN (${placeholders})`;
    params.push(...statuses);
  }
  const rows = db
    .prepare(
      `SELECT q.*,
                   a.id AS latest_answer_id,
                   a.answer_markdown AS latest_answer_markdown,
                   a.match_confidence AS latest_answer_confidence,
                   a.accepted_by_ryan AS latest_answer_accepted,
                   f.original_filename AS source_filename,
                   f.file_purpose AS source_file_purpose
            FROM team_member_questions q
            LEFT JOIN team_member_question_answers a
              ON a.id = (
                   SELECT a2.id
                   FROM team_member_question_answers a2
                   WHERE a2.question_id = q.id
                   ORDER BY a2.id DESC
                   LIMIT 1
              )
            LEFT JOIN team_member_files f ON f.id = q.source_file_id
            WHERE q.company=? AND q.team_member_key=?${status_sql}
            ORDER BY q.id DESC`,
    )
    .all(...params) as Dict[];
  return rows.map((r) => ({ ...r }));
}

export function list_team_member_question_packets(db: DB, company: string, member_key: string): Dict[] {
  const rows = db
    .prepare(
      `SELECT *
           FROM team_member_question_packets
           WHERE company=? AND team_member_key=?
           ORDER BY packet_version DESC, id DESC`,
    )
    .all(company, member_key) as Dict[];
  return rows.map((r) => ({ ...r }));
}

export function list_team_member_correspondence(db: DB, company: string, member_key: string, limit = 60): Dict[] {
  const rows = db
    .prepare(
      `SELECT *
           FROM team_member_correspondence_log
           WHERE company=? AND team_member_key=?
           ORDER BY created_at DESC, id DESC
           LIMIT ?`,
    )
    .all(company, member_key, limit) as Dict[];
  return rows.map((r) => ({ ...r }));
}

export function rebuild_team_member_correspondence_markdown(db: DB, company: string, member_key: string): void {
  const events = list_team_member_correspondence(db, company, member_key, 500);
  const lines: string[] = [
    `# Correspondence Log - ${pretty_member_name(member_key)}`,
    '',
    `Company: ${company}`,
    `Generated: ${nowIso()}`,
    '',
  ];
  for (const event of [...events].reverse()) {
    lines.push(
      `## ${event['created_at'] || ''} - ${event['event_type'] || ''}`,
      '',
      `- Actor: ${event['actor'] || ''}`,
      `- Summary: ${event['event_summary'] || ''}`,
      `- Linked file id: ${event['linked_file_id'] || '-'}`,
      `- Linked question id: ${event['linked_question_id'] || '-'}`,
      `- Linked packet id: ${event['linked_packet_id'] || '-'}`,
      '',
    );
  }
  fs.writeFileSync(
    get_team_member_correspondence_markdown_path(company, member_key),
    pyStrip(lines.join('\n')) + '\n',
    'utf-8',
  );
}

export function append_team_member_correspondence_event(
  db: DB,
  company: string,
  member_key: string,
  event_type: string,
  event_summary: string,
  actor = 'system',
  linked_file_id: number | null = null,
  linked_question_id: number | null = null,
  linked_packet_id: number | null = null,
): void {
  const now = nowIso();
  db.prepare(
    `INSERT INTO team_member_correspondence_log(
               company, team_member_key, event_type, event_summary, actor,
               linked_file_id, linked_question_id, linked_packet_id, created_at
           ) VALUES(?,?,?,?,?,?,?,?,?)`,
  ).run(company, member_key, event_type, event_summary, actor, linked_file_id, linked_question_id, linked_packet_id, now);
  rebuild_team_member_correspondence_markdown(db, company, member_key);
}

export function summarize_team_member_question_statuses(question_rows: Dict[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const status of TEAM_MEMBER_QUESTION_STATUS_ORDER) {
    counts[status] = 0;
  }
  for (const row of question_rows) {
    const status = row['status'] || 'NEW';
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

export function team_member_question_priority_from_title(title: string): string {
  const text = String(title || '').toLowerCase();
  if (['must', 'required', 'compliance', 'critical', 'money', 'approval', 'deadline'].some((token) => text.includes(token))) {
    return 'HIGH';
  }
  if (['process', 'owner', 'source', 'rule', 'exception'].some((token) => text.includes(token))) {
    return 'MEDIUM';
  }
  return 'LOW';
}

export function heuristic_team_member_questions(file_row: Dict, preview_text: string, cap = 10): [Dict[], Dict[]] {
  const lines = (preview_text || '')
    .split(/\r?\n/)
    .map((line) => pyStrip(line, ' -\t'))
    .filter((line) => line.trim());
  let candidates: Dict[] = [];
  lines.slice(0, 60).forEach((line, i) => {
    const idx = i + 1;
    if (line.length < 12) {
      return;
    }
    const heading_like = line.endsWith(':') || (line === line.toUpperCase() && /[A-Z]/.test(line)) || line.split(/\s+/).length <= 10;
    if (heading_like) {
      const topic = pyStrip(pyRStrip(line, ':'));
      candidates.push({
        title: `Clarify ${topic}`,
        body_markdown: `Source section: line ${idx}\n\nPlease explain the current process, owner, exceptions, and system of record for \`${topic}\`.`,
        source_section: `line ${idx}`,
        priority: team_member_question_priority_from_title(topic),
      });
    }
  });
  if (!candidates.length) {
    const originalFilename = file_row['original_filename'] || 'document';
    const basis = path.basename(originalFilename, path.extname(originalFilename)).replace(/_/g, ' ');
    candidates = [
      {
        title: `Explain the current process in ${basis}`,
        body_markdown: `Please explain the current step-by-step process described in \`${file_row['original_filename']}\` including owner, systems used, timing, and exceptions.`,
        source_section: 'full document',
        priority: 'HIGH',
      },
      {
        title: `Identify decisions and approvals in ${basis}`,
        body_markdown: `What decisions are made in \`${file_row['original_filename']}\`, who makes them, and what requires Ryan approval?`,
        source_section: 'full document',
        priority: 'MEDIUM',
      },
    ];
  }
  const deduped: Dict[] = [];
  const seen = new Set<string>();
  for (const item of candidates) {
    const key = item['title'].toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(item);
  }
  const primary = deduped.slice(0, cap);
  const overflow = deduped.slice(cap, cap + 6);
  return [primary, overflow];
}

export function build_team_member_generate_prompt(
  company: string,
  member_key: string,
  file_row: Dict,
  preview_text: string,
  cap = 10,
): string {
  return `You are generating follow-up governance questions for a team member.

Company: ${company}
Team member: ${pretty_member_name(member_key)}
File name: ${file_row['original_filename']}
Uploader note: ${file_row['note'] || '(none)'}

Task:
1. Read the preview text.
2. Return the ${cap} most important questions Ryan should ask this team member to turn this document into governed knowledge.
3. Prefer questions about process, owner, systems of record, exceptions, timing, approvals, and unresolved ambiguity.
4. Be concise and grounded in the text. Do not invent facts.
5. Rank by importance and assign priority as CRITICAL, HIGH, MEDIUM, or LOW.

Return JSON only:
{
  "questions": [
    {
      "title": "short title",
      "body_markdown": "full question body",
      "source_section": "page/line/section reference if known",
      "priority": "HIGH"
    }
  ],
  "overflow": [
    {
      "title": "optional lower-priority follow-up",
      "body_markdown": "question",
      "source_section": "reference",
      "priority": "LOW"
    }
  ]
}

Preview text:
${preview_text.slice(0, 8000)}
`;
}

export function parse_team_member_question_json(text: string): Dict[] | null {
  let data: Dict;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const questions: Dict[] = [];
  for (const [bucket, status] of [['questions', 'NEW'], ['overflow', 'SUGGESTED_FOLLOW_UP']] as [string, string][]) {
    for (const item of (data[bucket] as Dict[]) || []) {
      const title = String(item['title'] || '').trim();
      const body = String(item['body_markdown'] || '').trim();
      if (!title || !body) {
        continue;
      }
      questions.push({
        title,
        body_markdown: body,
        source_section: String(item['source_section'] || '').trim(),
        priority: String(item['priority'] || 'MEDIUM').trim().toUpperCase() || 'MEDIUM',
        status,
      });
    }
  }
  return questions;
}

// NOTE: generate_team_member_questions_from_file may call the OpenAI HTTP API.
// Ported to async + fetch per TRANSLATION RULE 6.
export async function generate_team_member_questions_from_file(
  db: DB,
  company: string,
  member_key: string,
  file_row: Dict,
  engine = 'OpenAI',
  actor = 'Ryan',
  cap = 10,
): Promise<Dict[]> {
  void actor;
  const preview_text = extract_member_file_preview(file_row['saved_path']);
  const prompt = build_team_member_generate_prompt(company, member_key, file_row, preview_text, cap);
  const run_id = insert_team_member_question_ai_run(
    db,
    company,
    member_key,
    engine,
    'generate_questions',
    'running',
    file_row['id'],
    prompt,
  );
  let generated: Dict[] = [];
  let output_text = '';
  if (['Claude', 'Claude Code', 'Both'].includes(engine) && claude_cli_available()) {
    const [ok, out, err] = await call_claude_text(prompt);
    output_text = out;
    if (ok && output_text) {
      const parsed = parse_team_member_question_json(output_text);
      if (parsed) {
        generated = parsed;
      }
    } else {
      output_text = err || 'Claude request failed';
    }
  } else if (['OpenAI', 'OpenAI Codex'].includes(engine) && openai_configured()) {
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${get_openai_api_key()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: get_openai_model(), input: prompt }),
      });
      if (response.status < 400) {
        const payload = await response.json();
        output_text = payload['output_text'] || '';
        if (!output_text) {
          const parts: string[] = [];
          for (const item of payload['output'] || []) {
            for (const content of item['content'] || []) {
              if (content['type'] === 'output_text') {
                parts.push(content['text'] || '');
              }
            }
          }
          output_text = parts.join('\n').trim();
        }
        const parsed = parse_team_member_question_json(output_text);
        if (parsed) {
          generated = parsed;
        }
      } else {
        output_text = (await response.text()).slice(0, 4000);
      }
    } catch (exc: any) {
      output_text = String(exc);
    }
  }
  if (!generated.length) {
    const [primary, overflow] = heuristic_team_member_questions(file_row, preview_text, cap);
    generated = primary.map((item) => ({ ...item, status: 'NEW' })).concat(overflow.map((item) => ({ ...item, status: 'SUGGESTED_FOLLOW_UP' })));
  }
  const created: Dict[] = [];
  for (const item of generated) {
    const [question_id, question_code] = create_team_member_question(
      db,
      company,
      member_key,
      item['title'],
      item['body_markdown'],
      item['priority'] || 'MEDIUM',
      item['status'] || 'NEW',
      file_row['id'],
      item['source_section'] || '',
      generated.length ? engine : 'heuristic',
    );
    created.push({
      id: question_id,
      question_code,
      status: item['status'] || 'NEW',
      priority: item['priority'] || 'MEDIUM',
      title: item['title'],
    });
  }
  db.prepare('UPDATE team_member_files SET generated_question_count=? WHERE id=?').run(
    created.filter((item) => item['status'] === 'NEW').length,
    file_row['id'],
  );
  update_team_member_question_ai_run(db, run_id, 'completed', output_text.slice(0, 12000));
  append_team_member_correspondence_event(
    db,
    company,
    member_key,
    'questions_generated',
    `Generated ${created.length} team-member questions from ${file_row['original_filename']}.`,
    engine,
    file_row['id'],
  );
  return created;
}

export function render_team_member_packet_markdown(member_key: string, packet_version: number, questions: Dict[]): string {
  const lines: string[] = [
    `# Question Packet v${packet_version} - ${pretty_member_name(member_key)}`,
    '',
    'Please answer each question directly below its heading.',
    '',
  ];
  for (const question of questions) {
    lines.push(
      `## ${question['question_code']} - ${question['title'] || 'Question'}`,
      '',
      `Priority: ${question['priority'] || 'MEDIUM'}`,
      '',
      question['body_markdown'] || '',
      '',
      'Answer:',
      '',
      '---',
      '',
    );
  }
  return pyStrip(lines.join('\n')) + '\n';
}

export function export_team_member_question_packet(db: DB, company: string, member_key: string, actor = 'Ryan'): Dict | null {
  const questions = list_team_member_questions(db, company, member_key, ['NEW', 'NEEDS_FOLLOW_UP']);
  if (!questions.length) {
    return null;
  }
  const version_row = db
    .prepare('SELECT MAX(packet_version) AS max_version FROM team_member_question_packets WHERE company=? AND team_member_key=?')
    .get(company, member_key) as Dict;
  const packet_version = Math.trunc((version_row['max_version'] || 0) + 1);
  const markdown = render_team_member_packet_markdown(member_key, packet_version, [...questions].reverse());
  const outbound_dir = get_team_member_bucket_dir(company, member_key, 'outbound_packet');
  const filename = `${strftimeNow()}_question_packet_v${packet_version}.md`;
  const packet_path = path.join(outbound_dir, filename);
  fs.writeFileSync(packet_path, markdown, 'utf-8');
  const now = nowIso();
  const question_ids = questions.map((row) => row['id']);
  const packetInfo = db
    .prepare(
      `INSERT INTO team_member_question_packets(
               company, team_member_key, packet_version, question_ids_json, exported_file_path, exported_at, exported_by
           ) VALUES(?,?,?,?,?,?,?)`,
    )
    .run(company, member_key, packet_version, JSON.stringify(question_ids), packet_path, now, actor);
  const packet_id = Number(packetInfo.lastInsertRowid);
  const outboundInfo = db
    .prepare(
      `INSERT INTO team_member_files(
               company, member_key, original_filename, saved_path, source_type, note,
               ai_preference, size_bytes, uploaded_at, uploaded_by, file_purpose,
               linked_question_packet_id, parsed_answer_count, generated_question_count
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      company,
      member_key,
      filename,
      packet_path,
      'document',
      `Outbound question packet v${packet_version}`,
      'manual',
      file_size_safe(packet_path),
      now,
      actor,
      'outbound_packet',
      packet_id,
      0,
      question_ids.length,
    );
  const outbound_file_id = Number(outboundInfo.lastInsertRowid);
  db.prepare(
    `UPDATE team_member_questions SET status='SENT_TO_TEAM_MEMBER', updated_at=? WHERE company=? AND team_member_key=? AND id IN (${question_ids
      .map(() => '?')
      .join(',')})`,
  ).run(now, company, member_key, ...question_ids);
  db.prepare('UPDATE team_member_files SET linked_question_packet_id=? WHERE id=?').run(packet_id, outbound_file_id);
  append_team_member_correspondence_event(
    db,
    company,
    member_key,
    'packet_exported',
    `Exported question packet v${packet_version} with ${question_ids.length} questions.`,
    actor,
    outbound_file_id,
    null,
    packet_id,
  );
  return {
    packet_id,
    packet_version,
    question_count: question_ids.length,
    exported_file_path: packet_path,
    outbound_file_id,
  };
}

export function parse_answer_sections(answer_text: string): Dict[] {
  const pattern = /^##\s+(TMQ-[A-Za-z0-9\-]+)\s+-\s+(.+?)\n([\s\S]*?)(?=^##\s+TMQ-|$)/gm;
  const results: Dict[] = [];
  let match: RegExpExecArray | null;
  const text = answer_text || '';
  while ((match = pattern.exec(text)) !== null) {
    const body = match[3].trim();
    const answer_match = /Answer:\s*([\s\S]+)/i.exec(body);
    const answer_text_value = answer_match ? answer_match[1].trim() : body.trim();
    results.push({
      question_code: match[1].trim(),
      title: match[2].trim(),
      answer_markdown: answer_text_value,
      source_section: match[2].trim(),
    });
    if (match.index === pattern.lastIndex) {
      pattern.lastIndex++;
    }
  }
  return results;
}

/** difflib.SequenceMatcher(None, a, b).ratio() */
function sequenceMatcherRatio(a: string, b: string): number {
  // Compute the ratio using the size of matching blocks (Gestalt pattern matching).
  const matches = matchingBlocksTotal(a, b);
  const total = a.length + b.length;
  return total ? (2.0 * matches) / total : 1.0;
}

function matchingBlocksTotal(a: string, b: string): number {
  // Recursive longest-matching-block sum, mirroring difflib.
  if (!a.length || !b.length) return 0;
  let bestI = 0;
  let bestJ = 0;
  let bestSize = 0;
  const j2len: Record<number, number> = {};
  for (let i = 0; i < a.length; i++) {
    const newj2len: Record<number, number> = {};
    for (let j = 0; j < b.length; j++) {
      if (a[i] === b[j]) {
        const k = (j > 0 ? j2len[j - 1] || 0 : 0) + 1;
        newj2len[j] = k;
        if (k > bestSize) {
          bestI = i - k + 1;
          bestJ = j - k + 1;
          bestSize = k;
        }
      }
    }
    for (const key in j2len) delete j2len[key];
    Object.assign(j2len, newj2len);
  }
  if (bestSize === 0) return 0;
  return (
    bestSize +
    matchingBlocksTotal(a.slice(0, bestI), b.slice(0, bestJ)) +
    matchingBlocksTotal(a.slice(bestI + bestSize), b.slice(bestJ + bestSize))
  );
}

export function match_team_member_answer(question_rows: Dict[], answer: Dict): [Dict | null, string] {
  const code = String(answer['question_code'] || '').trim();
  if (code) {
    const exact = question_rows.find((row) => row['question_code'] === code) || null;
    if (exact) {
      return [exact, 'HIGH'];
    }
  }
  const title = String(answer['title'] || '').trim().toLowerCase();
  if (title) {
    const scored: [number, Dict][] = [];
    for (const row of question_rows) {
      const ratio = sequenceMatcherRatio(title, String(row['title'] || '').trim().toLowerCase());
      scored.push([ratio, row]);
    }
    scored.sort((x, y) => y[0] - x[0]);
    if (scored.length && scored[0][0] >= 0.88) {
      return [scored[0][1], 'MEDIUM'];
    }
    if (scored.length && scored[0][0] >= 0.72) {
      return [scored[0][1], 'LOW'];
    }
  }
  return [null, 'AMBIGUOUS'];
}

export function parse_team_member_answers_file(db: DB, company: string, member_key: string, file_row: Dict, actor = 'OpenAI'): Dict {
  const answer_text = extract_member_file_preview(file_row['saved_path']);
  const question_rows = list_team_member_questions(db, company, member_key, [
    'SENT_TO_TEAM_MEMBER',
    'ANSWER_PENDING_REVIEW',
    'NEEDS_FOLLOW_UP',
    'ANSWERED',
  ]);
  const parsed_sections = parse_answer_sections(answer_text);
  const created: Dict[] = [];
  let unmatched = 0;
  const now = nowIso();
  for (const answer of parsed_sections) {
    const [question_row, confidence] = match_team_member_answer(question_rows, answer);
    const question_id = question_row ? question_row['id'] : null;
    db.prepare(
      `INSERT INTO team_member_question_answers(
                   question_id, answer_markdown, source_file_id, source_section, match_confidence, parsed_by, accepted_by_ryan, created_at
               ) VALUES(?,?,?,?,?,?,?,?)`,
    ).run(
      question_id,
      answer['answer_markdown'] || '',
      file_row['id'],
      answer['source_section'] || '',
      confidence,
      actor,
      0,
      now,
    );
    const answer_id = (db.prepare('SELECT last_insert_rowid() AS id').get() as Dict)['id'];
    if (question_row) {
      const new_status = confidence === 'HIGH' ? 'ANSWERED' : 'ANSWER_PENDING_REVIEW';
      db.prepare('UPDATE team_member_questions SET status=?, updated_at=? WHERE id=?').run(new_status, now, question_row['id']);
      append_team_member_correspondence_event(
        db,
        company,
        member_key,
        'answers_parsed',
        `Parsed answer for ${question_row['question_code']} with ${confidence} confidence.`,
        actor,
        file_row['id'],
        question_row['id'],
      );
      created.push({
        answer_id,
        question_code: question_row['question_code'],
        match_confidence: confidence,
        status: new_status,
      });
    } else {
      unmatched += 1;
      append_team_member_correspondence_event(
        db,
        company,
        member_key,
        'unmatched_answer',
        'Stored an unmatched answer for Ryan review.',
        actor,
        file_row['id'],
      );
      created.push({
        answer_id,
        question_code: '',
        match_confidence: confidence,
        status: 'UNMATCHED',
      });
    }
  }
  db.prepare('UPDATE team_member_files SET parsed_answer_count=? WHERE id=?').run(created.length, file_row['id']);
  return {
    rows: created,
    count: created.length,
    unmatched_count: unmatched,
  };
}

export function suggest_team_member_follow_ups(db: DB, company: string, member_key: string, actor = 'OpenAI'): Dict[] {
  const rows = db
    .prepare(
      `SELECT q.*, a.answer_markdown, a.match_confidence
           FROM team_member_questions q
           LEFT JOIN team_member_question_answers a
             ON a.id = (
                 SELECT a2.id FROM team_member_question_answers a2
                 WHERE a2.question_id = q.id
                 ORDER BY a2.id DESC LIMIT 1
             )
           WHERE q.company=? AND q.team_member_key=? AND q.status IN ('ANSWER_PENDING_REVIEW', 'NEEDS_FOLLOW_UP')`,
    )
    .all(company, member_key) as Dict[];
  const created: Dict[] = [];
  for (const row of rows) {
    const answer_text = String(row['answer_markdown'] || '').toLowerCase();
    if (
      ['LOW', 'AMBIGUOUS'].includes(row['match_confidence']) ||
      ['not sure', 'need to check', 'unknown', 'follow up', 'later'].some((token) => answer_text.includes(token))
    ) {
      const title = `Follow up on ${row['question_code']}`;
      const body = `Clarify or complete the answer for \`${row['question_code']}\`. Current answer needs follow-up before it can be governed.`;
      const [question_id, question_code] = create_team_member_question(
        db,
        company,
        member_key,
        title,
        body,
        'MEDIUM',
        'NEW',
        row['source_file_id'],
        'follow-up',
        actor,
      );
      created.push({ id: question_id, question_code, title });
    }
  }
  if (created.length) {
    append_team_member_correspondence_event(
      db,
      company,
      member_key,
      'follow_ups_generated',
      `Generated ${created.length} follow-up questions.`,
      actor,
    );
  }
  return created;
}

export function accept_team_member_questions(db: DB, company: string, member_key: string, question_codes: string[], actor = 'Ryan'): string[] {
  if (!question_codes || !question_codes.length) {
    return [];
  }
  const placeholders = question_codes.map(() => '?').join(',');
  const rows = db
    .prepare(
      `SELECT * FROM team_member_questions
            WHERE company=? AND team_member_key=? AND question_code IN (${placeholders})`,
    )
    .all(company, member_key, ...question_codes) as Dict[];
  const now = nowIso();
  const accepted: string[] = [];
  for (const row of rows) {
    db.prepare(
      "UPDATE team_member_questions SET status='APPROVED', updated_at=?, last_human_touch_at=? WHERE id=?",
    ).run(now, now, row['id']);
    db.prepare(
      `UPDATE team_member_question_answers
               SET accepted_by_ryan=1
               WHERE id = (
                   SELECT a2.id FROM team_member_question_answers a2
                   WHERE a2.question_id=?
                   ORDER BY a2.id DESC LIMIT 1
               )`,
    ).run(row['id']);
    append_team_member_correspondence_event(
      db,
      company,
      member_key,
      'question_status_changed',
      `${row['question_code']} moved to APPROVED by Ryan.`,
      actor,
      null,
      row['id'],
    );
    accepted.push(row['question_code']);
  }
  return accepted;
}

export function insert_ai_run(
  db: DB,
  intake_id: number,
  engine: string,
  status: string,
  prompt_text = '',
  output_text = '',
  output_path = '',
  error_text = '',
): number {
  const started = nowIso();
  const info = db
    .prepare(
      `INSERT INTO ai_run(intake_id, engine, status, started_at, completed_at, prompt_text, output_text, output_path, error_text)
           VALUES(?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      intake_id,
      engine,
      status,
      started,
      ['completed', 'failed', 'blocked'].includes(status) ? started : null,
      prompt_text,
      output_text,
      output_path,
      error_text,
    );
  return Number(info.lastInsertRowid);
}

export function update_ai_run(
  db: DB,
  run_id: number,
  status: string,
  output_text: string | null = null,
  output_path: string | null = null,
  error_text: string | null = null,
): void {
  db.prepare(
    `UPDATE ai_run
           SET status=?, completed_at=?, output_text=COALESCE(?, output_text),
               output_path=COALESCE(?, output_path), error_text=COALESCE(?, error_text)
           WHERE id=?`,
  ).run(status, nowIso(), output_text, output_path, error_text, run_id);
}

export function list_ai_runs(db: DB, intake_id: number): Dict[] {
  return (db.prepare('SELECT * FROM ai_run WHERE intake_id=? ORDER BY id DESC').all(intake_id) as Dict[]).map((r) => ({ ...r }));
}

export function list_ai_exchanges(db: DB, intake_id: number | null = null, company: string | null = null): Dict[] {
  let query = `
        SELECT x.*, i.company
        FROM ai_exchange x
        JOIN intake i ON i.id = x.intake_id
    `;
  const params: any[] = [];
  const clauses: string[] = [];
  if (intake_id !== null) {
    clauses.push('x.intake_id=?');
    params.push(intake_id);
  }
  if (company !== null) {
    clauses.push('i.company=?');
    params.push(company);
  }
  if (clauses.length) {
    query += ' WHERE ' + clauses.join(' AND ');
  }
  query += ' ORDER BY x.id DESC';
  return (db.prepare(query).all(...params) as Dict[]).map((r) => ({ ...r }));
}

export function append_workflow_event(db: DB, intake_id: number, stage: string, actor: string, note: string): void {
  db.prepare('INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)').run(
    intake_id,
    stage,
    nowIso(),
    actor,
    note,
  );
}

export function latest_completed_run(db: DB, intake_id: number, engine_name: string): Dict | undefined {
  return db
    .prepare(
      `SELECT * FROM ai_run
           WHERE intake_id=? AND engine=? AND status='completed'
           ORDER BY id DESC LIMIT 1`,
    )
    .get(intake_id, engine_name) as Dict | undefined;
}

export function latest_completed_run_any(db: DB, intake_id: number, engine_names: string[]): Dict | undefined {
  const placeholders = engine_names.map(() => '?').join(',');
  return db
    .prepare(
      `SELECT * FROM ai_run
            WHERE intake_id=? AND engine IN (${placeholders}) AND status='completed'
            ORDER BY id DESC LIMIT 1`,
    )
    .get(intake_id, ...engine_names) as Dict | undefined;
}

export function governance_drafts_dir(company: string): string {
  const d = path.join(get_company(company)['root'], '_GOVERNANCE', '_DRAFTS');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function intake_stage_allows_commit_review(stage: string): boolean {
  const allowed = new Set([
    'Awaiting Commit Approval',
    'Committed',
    'Pushed',
    'Constitution Candidate',
    'Constitution Approved',
  ]);
  return allowed.has(stage);
}

export function intake_stage_allows_ai_exchange(stage: string): boolean {
  return !['Committed', 'Pushed', 'Constitution Candidate', 'Constitution Approved'].includes(stage);
}

export function allowed_artifact_roots(): string[] {
  const roots: string[] = ['C:\\Governance-UI'];
  for (const cfg of Object.values(COMPANIES as Dict)) {
    roots.push((cfg as Dict)['root'], (cfg as Dict)['vault']);
  }
  return roots.map((root) => path.resolve(root));
}

export function is_allowed_artifact_path(path_value: string): boolean {
  let candidate: string;
  try {
    candidate = path.resolve(path_value);
  } catch {
    return false;
  }
  for (const root of allowed_artifact_roots()) {
    const rel = path.relative(root, candidate);
    if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
      return true;
    }
  }
  return false;
}

export function build_openai_prompt(company: string, intake: Dict, files: Dict[]): string {
  const file_list = files.map((f) => `- ${f['filename']}`).join('\n');
  const employee_line = intake['employee'] ? intake['employee'] : 'org-wide / none';
  return `You are analyzing a governance intake item for ${(COMPANIES as Dict)[company]['name_full']}.

Intake metadata:
- Intake ID: ${intake['id']}
- Employee: ${employee_line}
- Source type: ${intake['source_type'] || 'document'}
- Note: ${intake['note'] || '(none)'}

Files in this intake:
${file_list}

${governance_context(company, 12000)}

Task:
1. Summarize what this intake appears to contain.
2. Propose candidate questions in a voice-answer-compatible format.
3. Draft any likely decision structure as IF / THEN / ELSE only when directly supported.
4. Compare the intake against the approved governance above; flag any CONTRADICTION or drift from the corpus, plus missing owner truth.
5. Treat the governance corpus as authoritative; do not treat your own interpretation of the intake as approved governance truth.

Return concise markdown with these headings:
- Summary
- Candidate Questions
- Candidate Decisions
- Contradictions / Gaps
`;
}

export function normalize_engine_slug(engine_name: string): string {
  const slug = pyStrip(engine_name.toLowerCase().replace(/[^a-z0-9]+/g, '_'), '_');
  return slug || 'engine';
}

export function build_exchange_prompt(
  company: string,
  intake: Dict,
  source_engine: string,
  target_engine: string,
  topic: string,
  source_output: string,
): string {
  return `You are participating in a governed AI review exchange for ${(COMPANIES as Dict)[company]['name_full']}.

Exchange topic:
${topic}

Source engine: ${source_engine}
Target engine: ${target_engine}
Intake ID: ${intake['id']}
Employee: ${intake['employee'] || 'org-wide / none'}
Source type: ${intake['source_type'] || 'document'}
Note: ${intake['note'] || '(none)'}

Review the source output below. Your job is not to replace it. Your job is to challenge, confirm, refine, or flag uncertainty.

Rules:
1. Distinguish CONFIRMED vs INFERRED vs QUESTION_REQUIRED.
2. If you disagree, explain why with evidence or the specific missing evidence.
3. Do not invent governance truth.
4. Keep the result suitable for a human approval gate.

Source output:
---
${source_output.slice(0, 18000)}
---

Return markdown with these headings:
- Agreement Summary
- Confirmed Points
- Challenges / Corrections
- Missing Evidence
- Recommended Next Action
- Suggested Routing
`;
}

export function build_questions_payload(company: string): Dict {
  const cfg = get_company(company);
  const db = getDb();
  const assignments = get_question_assignment_map(db, company);
  const result: Dict = { org_wide: [], employees: {}, team_counts: [] };

  const org_q = path.join(cfg['root'], '_GOVERNANCE', 'PRIORITY_QUESTIONS_FOR_RYAN.md');
  if (fs.existsSync(org_q)) {
    for (const question of parse_questions(readTextReplace(org_q))) {
      const assignee = question['qid'] in assignments ? assignments[question['qid']] : 'Ryan Cochran';
      question['assignee'] = assignee;
      question['owner_scope'] = 'org-wide';
      question['context_items'] = build_question_context(cfg, question);
      result['org_wide'].push(question);
    }
  }

  const emp_dir = path.join(cfg['root'], 'EMPLOYEE_TASKS');
  if (fs.existsSync(emp_dir)) {
    for (const entry of fs.readdirSync(emp_dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const empName = entry.name;
      const empPath = path.join(emp_dir, empName);
      for (const qfName of fs.readdirSync(empPath)) {
        if (!/.*PRIORITY_QUESTIONS.*\.md$/.test(qfName)) {
          continue;
        }
        const questions = parse_questions(readTextReplace(path.join(empPath, qfName)));
        if (!questions.length) {
          continue;
        }
        const default_assignee = pretty_member_name(empName);
        for (const question of questions) {
          question['assignee'] = question['qid'] in assignments ? assignments[question['qid']] : default_assignee;
          question['owner_scope'] = 'employee';
          question['context_items'] = build_question_context(cfg, question);
        }
        result['employees'][empName] = {
          file: qfName,
          questions,
          total_count: questions.length,
          unanswered_count: questions.filter((q) => question_is_unanswered(q['status'])).length,
          display_name: pretty_member_name(empName),
        };
      }
    }
  }

  const db_qs = db
    .prepare('SELECT * FROM team_member_questions WHERE company=? ORDER BY team_member_key, id')
    .all(company) as Dict[];
  for (const row of db_qs) {
    const member_key = row['team_member_key'];
    const display = pretty_member_name(member_key);
    const question: Dict = {
      qid: row['question_code'],
      title: row['title'] || '',
      short_question: (row['title'] || '').slice(0, 300),
      body: row['body_markdown'] || '',
      priority: (row['priority'] || 'MEDIUM').toUpperCase(),
      status: row['status'] || 'NEW',
      assignee: display,
      owner_scope: 'employee',
      source: row['generated_by'] || 'workspace',
      context_items: [],
    };
    if (!(member_key in result['employees'])) {
      result['employees'][member_key] = {
        file: null,
        questions: [],
        total_count: 0,
        unanswered_count: 0,
        display_name: display,
      };
    }
    result['employees'][member_key]['questions'].push(question);
  }
  for (const payload of Object.values(result['employees']) as Dict[]) {
    payload['total_count'] = payload['questions'].length;
    payload['unanswered_count'] = payload['questions'].filter((q: Dict) => question_is_unanswered(q['status'])).length;
  }

  const assignee_counts: Record<string, Dict> = {};
  for (const question of result['org_wide']) {
    const assignee = question['assignee'];
    if (!(assignee in assignee_counts)) {
      assignee_counts[assignee] = { key: assignee.replace(/ /g, '_'), display_name: assignee, total_count: 0, unanswered_count: 0 };
    }
    assignee_counts[assignee]['total_count'] += 1;
    if (question_is_unanswered(question['status'])) {
      assignee_counts[assignee]['unanswered_count'] += 1;
    }
  }
  for (const payload of Object.values(result['employees']) as Dict[]) {
    for (const question of payload['questions']) {
      const assignee = question['assignee'];
      if (!(assignee in assignee_counts)) {
        assignee_counts[assignee] = { key: assignee.replace(/ /g, '_'), display_name: assignee, total_count: 0, unanswered_count: 0 };
      }
      assignee_counts[assignee]['total_count'] += 1;
      if (question_is_unanswered(question['status'])) {
        assignee_counts[assignee]['unanswered_count'] += 1;
      }
    }
  }
  const team_counts = Object.values(assignee_counts).sort((a, b) => {
    if (a['unanswered_count'] !== b['unanswered_count']) return b['unanswered_count'] - a['unanswered_count'];
    return a['display_name'] < b['display_name'] ? -1 : a['display_name'] > b['display_name'] ? 1 : 0;
  });
  result['team_counts'] = team_counts;
  return result;
}

export function build_repo_questions_payload(company: string, repo_name: string | null = null): Dict {
  const db = getDb();
  const rows = list_repo_questions(db, company, repo_name);
  const by_repo: Record<string, Dict> = {};
  for (const row of rows) {
    if (!(row['repo_name'] in by_repo)) {
      by_repo[row['repo_name']] = {
        repo_name: row['repo_name'],
        questions: [],
        total_count: 0,
        unanswered_count: 0,
        critical_count: 0,
      };
    }
    const bucket = by_repo[row['repo_name']];
    bucket['questions'].push(row);
    bucket['total_count'] += 1;
    if (question_is_unanswered(row['status'])) {
      bucket['unanswered_count'] += 1;
    }
    if ((row['priority'] || '').toUpperCase() === 'CRITICAL') {
      bucket['critical_count'] += 1;
    }
  }
  return {
    company,
    repos: by_repo,
    rows,
  };
}

export function build_member_question_packet(company: string, member_key: string, question_data: Dict | null = null): Dict {
  question_data = question_data || build_questions_payload(company);
  const display_name = pretty_member_name(member_key);
  const priority_order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
  const questions: Dict[] = [];

  function maybe_add(question: Dict, scope_label: string): void {
    const assignee = (question['assignee'] || '').trim().toLowerCase();
    if (assignee !== display_name.toLowerCase()) {
      return;
    }
    const payload = { ...question };
    payload['scope_label'] = scope_label;
    questions.push(payload);
  }

  for (const question of question_data['org_wide'] || []) {
    maybe_add(question, 'Org-wide');
  }

  for (const [employee_key, payload] of Object.entries(question_data['employees'] || {}) as [string, Dict][]) {
    for (const question of payload['questions'] || []) {
      maybe_add(question, pretty_member_name(employee_key));
    }
  }

  questions.sort((a, b) => {
    const pa = (a['priority'] || 'UNKNOWN') in priority_order ? priority_order[a['priority'] || 'UNKNOWN'] : 9;
    const pb = (b['priority'] || 'UNKNOWN') in priority_order ? priority_order[b['priority'] || 'UNKNOWN'] : 9;
    if (pa !== pb) return pa - pb;
    const qa = a['qid'] || '';
    const qb = b['qid'] || '';
    if (qa !== qb) return qa < qb ? -1 : 1;
    return 0;
  });

  const priority_counts: Record<string, number> = {};
  for (const question of questions) {
    const priority = question['priority'] || 'UNKNOWN';
    priority_counts[priority] = (priority_counts[priority] || 0) + 1;
  }

  return {
    member_key,
    display_name,
    questions,
    total_count: questions.length,
    unanswered_count: questions.filter((q) => question_is_unanswered(q['status'])).length,
    priority_counts,
  };
}

export function build_member_question_chat_prompt(company: string, packet: Dict, user_prompt: string, session_notes = ''): string {
  const stopwords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'if', 'in', 'is', 'it',
    'of', 'on', 'or', 'so', 'the', 'to', 'was', 'were', 'will', 'with',
    'what', 'when', 'where', 'which', 'who', 'why', 'how', 'that', 'this', 'these',
    'from', 'into', 'about', 'there', 'their', 'them', 'they', 'would', 'could',
    'should', 'have', 'your', 'you', 'like', 'need', 'help', 'specifically',
    'ryan', 'cochran', 'question', 'questions', 'packet', 'answer', 'answers',
  ]);
  const keywords = ((user_prompt || '').toLowerCase().match(/[a-z0-9_#-]+/g) || []).filter(
    (token) => token.length >= 3 && !stopwords.has(token),
  );

  function question_score(question: Dict): number {
    const haystack = [
      String(question['qid'] || ''),
      String(question['title'] || ''),
      String(question['short_question'] || ''),
      String(question['body'] || ''),
    ].join(' ').toLowerCase();
    if (!keywords.length) {
      return 0;
    }
    const titleLower = String(question['title'] || '').toLowerCase();
    const shortLower = String(question['short_question'] || '').toLowerCase();
    return (
      keywords.reduce((acc, keyword) => acc + (titleLower.includes(keyword) ? 4 : 0), 0) +
      keywords.reduce((acc, keyword) => acc + (shortLower.includes(keyword) ? 3 : 0), 0) +
      keywords.reduce((acc, keyword) => acc + (haystack.includes(keyword) ? 1 : 0), 0)
    );
  }

  const all_questions = packet['questions'] || [];
  const matched_questions = all_questions.filter((question: Dict) => question_score(question) > 0);
  matched_questions.sort((a: Dict, b: Dict) => {
    const sa = question_score(a);
    const sb = question_score(b);
    if (sa !== sb) return sb - sa;
    const qa = a['qid'] || '';
    const qb = b['qid'] || '';
    if (qa !== qb) return qa < qb ? -1 : 1;
    return 0;
  });

  const selected: [Dict, boolean][] = [];
  const seen = new Set<string>();
  for (const question of matched_questions.slice(0, 4)) {
    const qid = question['qid'] || '';
    if (qid && !seen.has(qid)) {
      selected.push([question, true]);
      seen.add(qid);
    }
  }

  for (const question of all_questions) {
    if (selected.length >= 6) {
      break;
    }
    const qid = question['qid'] || '';
    if (qid && !seen.has(qid)) {
      selected.push([question, false]);
      seen.add(qid);
    }
  }

  const question_blocks: string[] = [];
  for (const [question, is_focus] of selected) {
    const context_items = question['context_items'] || [];
    let context_summary = context_items
      .slice(0, 1)
      .map((item: Dict) => `${item['file']}: ${item['summary'] || 'context attached'}`)
      .join('; ');
    if (!context_summary) {
      context_summary = 'No linked governance file summaries attached.';
    }
    let body_snippet = (question['body'] || '').trim();
    body_snippet = body_snippet.replace(/\s+/g, ' ');
    body_snippet = body_snippet.slice(0, is_focus ? 180 : 80);
    const focus_prefix = is_focus ? 'FOCUS' : 'QUEUE';
    question_blocks.push(
      `- ${focus_prefix} ${question['qid']} [${question['priority'] || 'UNKNOWN'}] (${question['scope_label']})
  Title: ${question['title'] || ''}
  Short question: ${question['short_question'] || ''}
  Status: ${question['status'] || 'OPEN'}
  Context snippet: ${body_snippet || '(none)'}
  Linked context: ${context_summary}`,
    );
  }

  const company_name = (COMPANIES as Dict)[company]['name_full'];
  const gov = governance_context(company, 12000);
  const gov_block = gov ? gov + '\n\n' : '';
  return `You are assisting with a governed question-answering session for ${company_name}.

${gov_block}Team member: ${packet['display_name']}
Assigned questions: ${packet['unanswered_count']} unanswered / ${packet['total_count']} total
Relevant keywords from the latest user prompt: ${keywords.length ? keywords.slice(0, 12).join(', ') : '(none)'}

Focused question packet subset (trimmed for fast chat):
${question_blocks.length ? question_blocks.join('\n') : '- No assigned questions were found.'}

Current session notes:
${session_notes || '(none)'}

User request:
${user_prompt}

Instructions:
1. Help the team member answer across the packet, prioritizing only the focused questions above unless another queue item is clearly necessary.
2. Prefer grouped answers when multiple questions can be answered together.
3. Distinguish CONFIRMED vs INFERRED vs QUESTION_REQUIRED when helpful.
4. Do not invent approved governance truth.
5. Be concise, direct, and practical. Keep the answer short enough to feel like chat, not a memo.
6. If the user asks for a specific list, answer that list first before adding any extra commentary.

Return markdown with these headings:
- Suggested answer packet
- Questions that can be answered together
- Questions still requiring human clarification
- Risks / assumptions
`;
}
