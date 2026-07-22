import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { NextRequest } from 'next/server';
import { COMPANIES } from '@/lib/config';
import { getDb } from '@/lib/db';
import { GIT_EXE } from '@/lib/paths';
import {
  append_workflow_event,
  get_company,
  governance_drafts_dir,
  insert_ai_run,
  intake_stage_allows_commit_review,
} from '@/lib/helpers';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

function pad5(n: number): string {
  return String(n).padStart(5, '0');
}
function pyStrip(s: string): string {
  return (s || '').replace(/^\s+|\s+$/g, '');
}

// POST /api/intake/<intake_id>/commit_review  (api_commit_review, governance_ui.py:4695)
export const POST = route(async (_req: NextRequest, ctx: { params: Promise<{ intake_id: string }> }) => {
  const { intake_id } = await ctx.params;
  const id = Number(intake_id);
  const db = getDb();
  const intake = db.prepare('SELECT * FROM intake WHERE id=?').get(id) as any;
  if (!intake) abort(404);
  if (!intake_stage_allows_commit_review(intake.stage)) {
    return json(
      {
        ok: false,
        reason: 'Commit review only opens after the intake reaches Awaiting Commit Approval.',
        current_stage: intake.stage,
      },
      409,
    );
  }

  const company = intake.company;
  const cfg = get_company(company);
  const draft_dir = governance_drafts_dir(company);
  const draft_path = path.join(draft_dir, `COMMIT_REVIEW_FROM_INTAKE_${pad5(id)}.md`);

  const sections: string[] = [];
  for (const [label, p] of [
    ['governance', cfg.root],
    ['legal_vault', cfg.vault],
  ] as [string, string][]) {
    if (!fs.existsSync(path.join(p, '.git'))) {
      sections.push(`## ${label}\n\nNot a git repository.\n`);
      continue;
    }
    const status = spawnSync(GIT_EXE, ['-C', p, 'status', '--short'], { encoding: 'utf-8', timeout: 15000 });
    const stat = spawnSync(GIT_EXE, ['-C', p, 'diff', '--stat'], { encoding: 'utf-8', timeout: 15000 });
    const diff =
      label === 'governance'
        ? spawnSync(GIT_EXE, ['-C', p, 'diff', '--', '_GOVERNANCE'], { encoding: 'utf-8', timeout: 15000 })
        : spawnSync(GIT_EXE, ['-C', p, 'diff'], { encoding: 'utf-8', timeout: 15000 });
    sections.push(
      `## ${label}\n\n` +
        `Path: \`${p}\`\n\n` +
        `### Status\n\n\`\`\`\n${pyStrip(String(status.stdout || '')) || 'clean'}\n\`\`\`\n\n` +
        `### Diff Stat\n\n\`\`\`\n${pyStrip(String(stat.stdout || '')) || 'no diff stat'}\n\`\`\`\n\n` +
        `### Diff Preview\n\n\`\`\`\n${pyStrip(String(diff.stdout || '')).slice(0, 12000) || 'no diff preview'}\n\`\`\`\n`,
    );
  }

  const body = `# Commit Review From Intake ${pad5(id)}

Status: REVIEW PACKAGE
Source Intake: #${id}
Generated: ${nowIso()}
Applies To: ${(COMPANIES as any)[company].name_full} only

This package exists for commit review only. It does not commit or push anything by itself.

---

${sections.join('\n')}
`;
  fs.writeFileSync(draft_path, body, 'utf-8');
  const run_id = insert_ai_run(db, id, 'GitHub Commit Review', 'completed', '', body, draft_path, '');
  db.prepare('INSERT INTO link(intake_id, kind, ref) VALUES(?,?,?)').run(id, 'commit_review', draft_path);
  append_workflow_event(db, id, 'Commit review package', 'system', `Commit review draft created at ${path.basename(draft_path)}`);
  return json({ ok: true, run_id, output_path: draft_path });
});
