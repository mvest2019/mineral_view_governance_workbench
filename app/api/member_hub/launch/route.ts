import { NextRequest } from 'next/server';
import fs from 'fs';
import { spawn } from 'child_process';
import { json, route, abort } from '@/lib/http';
import { get_member_hub, local_service_up } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  body = body || {};
  const company = body.company;
  const member_key = body.member;
  if (!company || !member_key) {
    abort(400, 'company and member required');
  }
  const hub = get_member_hub(company, member_key);
  if (!hub.enabled) {
    return json({ ok: false, error: 'No member hub configured for this team member.' }, 400);
  }
  if (hub.running) {
    return json({ ok: true, running: true, url: hub.url, message: 'Hub already running.' });
  }
  const repo_dir = String(hub.repo_dir);
  const launch_target = String(hub.launch_target);
  if (!fs.existsSync(repo_dir) || !fs.existsSync(launch_target)) {
    return json({ ok: false, error: 'Hub source files were not found on this machine.' }, 404);
  }
  try {
    const child = spawn('python', [launch_target], {
      cwd: repo_dir,
      stdio: 'ignore',
      detached: true,
    });
    child.unref();
    for (let i = 0; i < 12; i += 1) {
      await sleep(500);
      if (local_service_up('127.0.0.1', 5000)) {
        break;
      }
    }
    const running = local_service_up('127.0.0.1', 5000);
    return json({
      ok: running,
      running: running,
      url: hub.url,
      message: running ? 'Hub launched.' : 'Launch attempted, but the hub is not responding yet.',
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
});
