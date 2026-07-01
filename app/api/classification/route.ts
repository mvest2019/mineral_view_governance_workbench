import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { get_company } from '@/lib/helpers';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const cfg = get_company(company as string);
  const db = getDb();
  const rows: Record<string, any> = {};
  for (const r of db
    .prepare('SELECT * FROM repo_classification WHERE company=?')
    .all(company) as any[]) {
    rows[r.repo_name] = r;
  }

  // Merge with mirror filesystem (so we always show every repo)
  const out: any[] = [];
  if (fs.existsSync(cfg['mirror'])) {
    const repos = fs
      .readdirSync(cfg['mirror'], { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    for (const repoName of repos) {
      const repoPath = path.join(cfg['mirror'], repoName);
      if (!fs.existsSync(path.join(repoPath, '.git'))) continue;
      const existing = rows[repoName];
      if (existing) {
        out.push(existing);
      } else {
        out.push({
          company,
          repo_name: repoName,
          observed_purpose: '',
          proposed_category: 'Unknown',
          confidence: '',
          canonical_status: '',
          evidence: '',
          finding_link: '',
          question_link: '',
          approval_status: 'PENDING',
          updated_at: '',
        });
      }
    }
  }
  return json(out);
});

export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const company = body.company;
  const repo = body.repo_name;
  if (!company || !repo) abort(400, 'company and repo_name required');
  const fields = [
    'observed_purpose',
    'proposed_category',
    'confidence',
    'canonical_status',
    'evidence',
    'finding_link',
    'question_link',
    'approval_status',
  ];
  const db = getDb();
  const existing: any = db
    .prepare('SELECT id FROM repo_classification WHERE company=? AND repo_name=?')
    .get(company, repo);
  const now = nowIso();
  if (existing) {
    const cols = fields.map((f) => `${f}=?`).join(', ');
    const params = [...fields.map((f) => body[f] ?? ''), now, existing.id];
    db.prepare(`UPDATE repo_classification SET ${cols}, updated_at=? WHERE id=?`).run(...params);
  } else {
    const cols = ['company', 'repo_name', 'updated_at', ...fields];
    const ph = cols.map(() => '?').join(',');
    const vals = [company, repo, now, ...fields.map((f) => body[f] ?? '')];
    db.prepare(`INSERT INTO repo_classification(${cols.join(',')}) VALUES(${ph})`).run(...vals);
  }
  return json({ ok: true });
});
