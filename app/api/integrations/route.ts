import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import {
  claude_cli_available,
  remote_claude_configured,
  check_remote_claude_health,
} from '@/lib/claude_cli';
import {
  get_company,
  github_cli_authenticated,
  openai_configured,
  mask_secret,
  get_openai_api_key,
  get_openai_model,
} from '@/lib/helpers';

export const dynamic = 'force-dynamic';

// Claude availability is resolved via lib/claude_cli. When the remote bridge is
// configured (REMOTE_CLAUDE_URL set) the status reflects a live /health probe of
// the Windows bridge; otherwise it falls back to the local `claude` on PATH check
// (equivalent to the original command_exists(CLAUDE_EXE or 'claude') behavior).
export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company') as any;
  const cfg = get_company(company);
  const [gh_ok, gh_detail] = github_cli_authenticated();
  const openai_ok = openai_configured();

  // Claude Code integration item.
  let claude_item: Record<string, any>;
  if (remote_claude_configured()) {
    // Remote mode: actively contact the bridge so the status is the real
    // Windows-server state, with the bridge's own reason on failure.
    const health = await check_remote_claude_health();
    const host = health.platform ? ` (${health.platform})` : '';
    claude_item = {
      name: 'Claude Code',
      status: health.ok ? 'Active' : 'Unavailable',
      connected: health.ok,
      mode: 'remote',
      detail: health.ok
        ? `Claude CLI runs on the remote Windows bridge${host} and is ready for intake analysis.`
        : health.reason,
    };
  } else {
    // Local mode: no bridge configured — check the local PATH as before.
    const claude_ok = claude_cli_available();
    claude_item = {
      name: 'Claude Code',
      status: claude_ok ? 'Active' : 'Unavailable',
      connected: claude_ok,
      mode: 'local',
      detail: claude_ok
        ? 'Claude CLI is callable from this machine and can run intake analysis directly.'
        : 'REMOTE_CLAUDE_URL is not configured and no local Claude CLI is on PATH. On Vercel, set REMOTE_CLAUDE_URL and REMOTE_CLAUDE_TOKEN (pointing at the Windows bridge) and redeploy.',
    };
  }

  return json({
    company: company,
    items: [
      claude_item,
      {
        name: 'OpenAI Codex',
        status: !openai_ok ? 'Awaiting API key' : 'Active',
        connected: openai_ok,
        masked_key: mask_secret(get_openai_api_key()),
        model: get_openai_model(),
        detail: !openai_ok
          ? 'OpenAI integration is scaffolded, but no API key is configured yet. You can activate it from the UI.'
          : `OpenAI API key detected. Transcript and decision drafting calls can run from the UI using model ${get_openai_model()}.`,
      },
      {
        name: 'GitHub / local git',
        status: gh_ok ? 'Active' : 'Local git only',
        connected: true,
        detail: `Local git status/history are available for ${cfg['root']} and ${cfg['vault']}. GitHub CLI auth: ${gh_detail}`,
      },
    ],
  });
});
