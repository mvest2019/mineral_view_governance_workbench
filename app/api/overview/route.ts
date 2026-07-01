import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { json, route } from '@/lib/http';
import { getDb } from '@/lib/db';
import { get_company, list_employees, departments_for_company } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

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

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company') as any;
  const cfg = get_company(company);
  const db = getDb();
  const department_data = departments_for_company(company);
  const counts = {
    governance_files: govMdCount(cfg['root']),
    employees: list_employees(company).length,
    departments: department_data['count'],
    mirror_repos: mirrorRepoCount(cfg['mirror']),
    intakes_total: (db.prepare('SELECT COUNT(*) AS c FROM intake WHERE company=?').get(company) as any).c,
    intakes_blocked: (
      db.prepare('SELECT COUNT(*) AS c FROM intake WHERE company=? AND blocker IS NOT NULL').get(company) as any
    ).c,
    intake_files_total: (
      db
        .prepare(
          `SELECT COALESCE(COUNT(f.id), 0) AS c
           FROM intake i
           LEFT JOIN intake_file f ON i.id=f.intake_id
           WHERE i.company=?`,
        )
        .get(company) as any
    ).c,
  };
  const by_stage: Record<string, number> = {};
  const stageRows = db
    .prepare('SELECT stage, COUNT(*) AS c FROM intake WHERE company=? GROUP BY stage')
    .all(company) as any[];
  for (const row of stageRows) {
    by_stage[row.stage] = row.c;
  }
  return json({
    company: company,
    company_full: cfg['name_full'],
    gh_account: cfg['gh_account'],
    paths: { governance_root: cfg['root'], vault: cfg['vault'], code_mirror: cfg['mirror'] },
    counts: counts,
    by_stage: by_stage,
    department_summary: {
      shared: (department_data['shared'] as any[]).length,
      company_specific: (department_data['company_specific'] as any[]).length,
    },
  });
});
