import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { GIT_EXE } from '@/lib/paths';
import {
  append_workflow_event,
  get_company,
  github_cli_authenticated,
  insert_ai_run,
  intake_dir_for_id,
} from '@/lib/helpers';
import { abort, json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

// POST /api/intake/<intake_id>/github_snapshot  (api_intake_github_snapshot, governance_ui.py:4436)
export const POST = route(async (_req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);
  const company = intake.company;
  const cfg = get_company(company);
  const [gh_ok, gh_detail] = github_cli_authenticated();
  let governance_dirty = false;
  let legal_dirty = false;
  let governance_changes: string[] = [];
  let legal_changes: string[] = [];
  for (const [label, p] of [
    ['governance', cfg.root],
    ['legal', cfg.vault],
  ] as [string, string][]) {
    if (fs.existsSync(path.join(p, '.git'))) {
      const result = spawnSync(GIT_EXE, ['-C', p, 'status', '--short'], {
        encoding: 'utf-8',
        timeout: 10000,
      });
      const changes = String(result.stdout || '')
        .split('\n')
        .filter((line) => line.trim());
      if (label === 'governance') {
        governance_dirty = changes.length > 0;
        governance_changes = changes;
      } else {
        legal_dirty = changes.length > 0;
        legal_changes = changes;
      }
    }
  }
  const snapshot = {
    gh_authenticated: gh_ok,
    gh_detail,
    governance_dirty,
    governance_changes,
    legal_dirty,
    legal_changes,
  };
  const intake_dir = intake_dir_for_id(company, id);
  const output_path = path.join(intake_dir, 'github_snapshot.json');
  fs.writeFileSync(output_path, JSON.stringify(snapshot, null, 2), 'utf-8');
  const run_id = insert_ai_run(
    db,
    id,
    'GitHub / local git',
    'completed',
    '',
    JSON.stringify(snapshot, null, 2),
    output_path,
    '',
  );
  append_workflow_event(db, id, 'GitHub snapshot', 'system', `GitHub/local snapshot saved to ${path.basename(output_path)}`);
  return json({ ok: true, run_id, snapshot, output_path });
});
