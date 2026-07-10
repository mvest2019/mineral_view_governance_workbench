import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { json, route } from '@/lib/http';
import { getDb } from '@/lib/db';
import {
  get_company,
  list_employees,
  departments_for_company,
  count_priority_questions_for_company,
  count_findings_for_company,
  aspect_groups_for_company,
  customer_sources_for_company,
} from '@/lib/helpers';

export const dynamic = 'force-dynamic';

// --- inlined _gov_find / _gov_glob (not present in lib/helpers) ---

function walkAll(root: string): string[] {
  const out: string[] = [];
  const stack: string[] = [root];
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
      } else {
        out.push(full);
      }
    }
  }
  return out;
}

function hasGitPart(p: string): boolean {
  return p.split(path.sep).includes('.git');
}

function globToRegExp(pattern: string): RegExp {
  let re = '';
  for (const ch of pattern) {
    if (ch === '*') re += '.*';
    else if (ch === '?') re += '.';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

function govFind(cfg: any, filename: string): string | null {
  const root = String(cfg['root']);
  const base = path.join(root, '_GOVERNANCE');
  const direct = path.join(base, filename);
  if (fs.existsSync(direct)) return direct;
  if (fs.existsSync(base)) {
    for (const p of walkAll(base)) {
      if (path.basename(p) === filename && !hasGitPart(p)) return p;
    }
  }
  if (fs.existsSync(root)) {
    for (const p of walkAll(root)) {
      if (path.basename(p) === filename && !hasGitPart(p)) return p;
    }
  }
  return null;
}

function govGlob(cfg: any, pattern: string): string[] {
  const root = String(cfg['root']);
  const base = path.join(root, '_GOVERNANCE');
  const rx = globToRegExp(pattern);
  if (fs.existsSync(base)) {
    let direct: string[] = [];
    try {
      direct = fs
        .readdirSync(base)
        .filter((name) => rx.test(name))
        .map((name) => path.join(base, name))
        .sort();
    } catch {
      direct = [];
    }
    if (direct.length) return direct;
    const nested = walkAll(base)
      .filter((p) => rx.test(path.basename(p)) && !hasGitPart(p))
      .sort();
    if (nested.length) return nested;
  }
  if (fs.existsSync(root)) {
    return walkAll(root)
      .filter((p) => rx.test(path.basename(p)) && !hasGitPart(p))
      .sort();
  }
  return [];
}

function govMdCount(root: string): number {
  const govDir = path.join(root, '_GOVERNANCE');
  if (!fs.existsSync(govDir)) return 0;
  try {
    return fs.readdirSync(govDir).filter((name) => name.toLowerCase().endsWith('.md')).length;
  } catch {
    return 0;
  }
}

function mirrorRepoCount(mirror: string): number {
  if (!fs.existsSync(mirror)) return 0;
  let count = 0;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(mirror, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const entry of entries) {
    if (entry.isDirectory() && fs.existsSync(path.join(mirror, entry.name, '.git'))) {
      count += 1;
    }
  }
  return count;
}

function sevenDaysAgoIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company') as any;
  const cfg = get_company(company);
  const db = getDb();
  const department_data = departments_for_company(company, db);
  const intake_total = (db.prepare('SELECT COUNT(*) AS c FROM intake WHERE company=?').get(company) as any).c;
  const blocked_total = (
    db
      .prepare(
        "SELECT COUNT(*) AS c FROM intake WHERE company=? AND (blocker IS NOT NULL OR stage IN ('Employee Questions Pending','Ryan Questions Pending','Awaiting Ryan Approval'))",
      )
      .get(company) as any
  ).c;
  const ready_commit = (
    db.prepare("SELECT COUNT(*) AS c FROM intake WHERE company=? AND stage='Awaiting Commit Approval'").get(company) as any
  ).c;
  const constitution = (
    db
      .prepare(
        "SELECT COUNT(*) AS c FROM intake WHERE company=? AND stage IN ('Constitution Candidate','Constitution Approved')",
      )
      .get(company) as any
  ).c;
  const markdown_files = govMdCount(cfg['root']);

  return json({
    dashboard: intake_total,
    intake: intake_total,
    board: blocked_total,
    departments: department_data['count'],
    questions: await count_priority_questions_for_company(company),
    findings: count_findings_for_company(cfg),
    meetings: (
      db.prepare('SELECT COUNT(*) AS c FROM meetings WHERE company=? AND meeting_date>=?').get(company, sevenDaysAgoIso()) as any
    ).c,
    aspect_groups: aspect_groups_for_company(company).length,
    classification: mirrorRepoCount(cfg['mirror']),
    decisions: govFind(cfg, 'DECISION_LOG.md') ? 1 : 0,
    glossary: govGlob(cfg, '*Glossary*.md').length ? 1 : 0,
    inventory: govFind(cfg, '_REPO_INVENTORY.md') ? 1 : 0,
    customers:
      (customer_sources_for_company(company)['governance_files'] as any[]).length +
      (customer_sources_for_company(company)['customer_repos'] as any[]).length,
    files: markdown_files,
    git: ready_commit,
    exchange: (
      db
        .prepare('SELECT COUNT(*) AS c FROM ai_exchange x JOIN intake i ON i.id=x.intake_id WHERE i.company=?')
        .get(company) as any
    ).c,
    constitution: constitution,
    record: 0,
    team: list_employees(company).length,
  });
});
