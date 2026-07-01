import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import {
  get_company,
  github_cli_authenticated,
  command_exists,
  openai_configured,
  mask_secret,
  get_openai_api_key,
  get_openai_model,
} from '@/lib/helpers';

export const dynamic = 'force-dynamic';

// CLAUDE_EXE is module-private in the Python app (shutil.which('claude')); the
// Flask code calls command_exists(CLAUDE_EXE or 'claude'), which is equivalent
// to command_exists('claude') since command_exists resolves via which().
export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company') as any;
  const cfg = get_company(company);
  const [gh_ok, gh_detail] = github_cli_authenticated();
  const claude_ok = command_exists('claude');
  const openai_ok = openai_configured();
  return json({
    company: company,
    items: [
      {
        name: 'Claude Code',
        status: claude_ok ? 'Active' : 'Unavailable',
        connected: claude_ok,
        detail: claude_ok
          ? 'Claude CLI is callable from this machine and can run intake analysis directly.'
          : 'Claude CLI is not available in PATH.',
      },
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
