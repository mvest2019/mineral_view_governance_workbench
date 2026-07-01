import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { NextRequest } from 'next/server';
import { get_company } from '@/lib/helpers';
import { json, route } from '@/lib/http';
import { GIT_EXE } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const cfg = get_company(company as string);
  const out: Record<string, any> = { governance: [], legal_vault: [] };
  const targets: [string, string, string][] = [
    ['governance', cfg.root, '_GOVERNANCE'],
    ['legal_vault', cfg.vault, '.'],
  ];
  for (const [label, p, scoped_path] of targets) {
    if (!fs.existsSync(path.join(p, '.git'))) {
      continue;
    }
    try {
      const log_cmd = [
        '-C',
        String(p),
        'log',
        '--date=short',
        '--pretty=format:%h|%ad|%an|%s',
        '-12',
      ];
      if (scoped_path !== '.') {
        log_cmd.push('--', scoped_path);
      }
      const log = spawnSync(GIT_EXE, log_cmd, { encoding: 'utf-8', timeout: 15 * 1000 });
      if (log.error) throw log.error;
      const commits: any[] = [];
      for (const line of String(log.stdout || '').split('\n')) {
        const parts = line.split('|');
        // Python: line.split('|', 3) -> at most 4 parts, remainder in last.
        if (parts.length < 4) {
          continue;
        }
        const sha = parts[0];
        const date = parts[1];
        const author = parts[2];
        const subject = parts.slice(3).join('|');
        const show_cmd = ['-C', String(p), 'show', '--name-only', '--format=', sha];
        const show = spawnSync(GIT_EXE, show_cmd, { encoding: 'utf-8', timeout: 15 * 1000 });
        if (show.error) throw show.error;
        const files = String(show.stdout || '')
          .split('\n')
          .filter((f) => f.trim());
        commits.push({
          sha,
          date,
          author,
          subject,
          files: files.slice(0, 15),
          path: String(p),
        });
      }
      out[label] = commits;
    } catch (e: any) {
      out[label] = [{ error: String(e?.message || e) }];
    }
  }
  return json(out);
});
