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
  const out: Record<string, any> = {};
  const targets: [string, string][] = [
    ['governance', cfg.root],
    ['legal_vault', cfg.vault],
  ];
  for (const [label, p] of targets) {
    if (!fs.existsSync(path.join(p, '.git'))) {
      out[label] = { exists: false };
      continue;
    }
    try {
      const status = spawnSync(GIT_EXE, ['-C', String(p), 'status', '--short'], {
        encoding: 'utf-8',
        timeout: 10 * 1000,
      });
      const log = spawnSync(GIT_EXE, ['-C', String(p), 'log', '-1', '--format=%h|%ai|%s'], {
        encoding: 'utf-8',
        timeout: 10 * 1000,
      });
      if (status.error) throw status.error;
      if (log.error) throw log.error;
      const statusOut = String(status.stdout || '').trim();
      out[label] = {
        exists: true,
        path: String(p),
        dirty: Boolean(statusOut),
        changes: statusOut ? statusOut.split('\n') : [],
        last_commit: String(log.stdout || '').trim(),
      };
    } catch (e: any) {
      out[label] = { exists: true, error: String(e?.message || e) };
    }
  }
  return json(out);
});
