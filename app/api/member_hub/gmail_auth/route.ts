import { NextRequest } from 'next/server';
import { json, route, abort } from '@/lib/http';
import { get_member_hub, member_hub_request } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const member_key = req.nextUrl.searchParams.get('member');
  if (!company || !member_key) {
    abort(400, 'company and member required');
  }
  const hub = get_member_hub(company, member_key);
  if (!hub.gmail_auth_enabled) {
    return json({ ok: false, enabled: false, error: 'Gmail auth is not configured for this member hub.' }, 400);
  }
  if (!hub.running) {
    return json({
      ok: false,
      enabled: true,
      running: false,
      authenticated: false,
      message: 'Daily Operations Hub is not running.',
    });
  }
  try {
    const [payload] = await member_hub_request(company, member_key, '/check-gmail-auth');
    return json({
      ok: true,
      enabled: true,
      running: true,
      authenticated: Boolean(payload?.authenticated),
      message: payload?.authenticated
        ? 'Authenticated - token available.'
        : 'Token expired or missing - launch Gmail re-auth.',
    });
  } catch (e: any) {
    return json({ ok: false, enabled: true, running: true, authenticated: false, error: String(e?.message || e) }, 500);
  }
});
