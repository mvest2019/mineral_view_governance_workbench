import { NextRequest } from 'next/server';
import { json, route, abort } from '@/lib/http';
import { get_member_hub, member_hub_request } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

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
  if (!hub.gmail_auth_enabled) {
    return json({ ok: false, enabled: false, error: 'Gmail auth is not configured for this member hub.' }, 400);
  }
  if (!hub.running) {
    return json(
      { ok: false, enabled: true, running: false, error: 'Daily Operations Hub is not running. Launch it first.' },
      400,
    );
  }
  try {
    const [payload] = await member_hub_request(company, member_key, '/reauth-gmail', 'POST');
    return json({
      ok: Boolean(payload?.ok),
      enabled: true,
      running: true,
      started: Boolean(payload?.started !== undefined ? payload.started : payload?.ok),
      message: payload?.message || 'Gmail re-auth launched.',
      stdout: payload?.stdout ?? '',
      stderr: payload?.stderr ?? '',
    });
  } catch (e: any) {
    return json({ ok: false, enabled: true, running: true, error: String(e?.message || e) }, 500);
  }
});
