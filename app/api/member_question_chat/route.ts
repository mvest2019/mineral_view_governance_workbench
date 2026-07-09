import { NextRequest } from 'next/server';
import { APP_BASE_DIR } from '@/lib/paths';
import { claude_cli_available, run_claude } from '@/lib/claude_cli';
import {
  build_member_question_packet,
  build_member_question_chat_prompt,
  openai_configured,
  get_openai_api_key,
  get_openai_model,
} from '@/lib/helpers';
import { abort, json, route } from '@/lib/http';

const BASE_DIR = APP_BASE_DIR;

export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const company = body.company;
  const member_key = body.member_key;
  const engine = body.engine;
  const user_prompt = (body.prompt || '').trim();
  const session_notes = (body.session_notes || '').trim();
  if (!company || !member_key || !engine || !user_prompt) {
    abort(400, 'company, member_key, engine, and prompt are required');
  }

  const packet = build_member_question_packet(company, member_key);
  const prompt = build_member_question_chat_prompt(company, packet, user_prompt, session_notes);

  if (engine === 'Claude Code') {
    if (!claude_cli_available()) {
      return json({ ok: false, reason: 'Claude CLI is not available on this machine.' }, 409);
    }
    const result = await run_claude(['-p', '--allowedTools', 'Read'], {
      input: prompt,
      timeoutMs: 180 * 1000,
      cwd: String(BASE_DIR),
    });
    if (result.error && (result.error as any).code === 'ETIMEDOUT') {
      return json({ ok: false, reason: 'Claude request timed out' }, 504);
    }
    if (result.status !== 0) {
      const reason = ((result.stderr || result.stdout || 'Claude request failed') as string).trim();
      return json({ ok: false, reason }, 500);
    }
    return json({
      ok: true,
      engine,
      response_text: (result.stdout || '').trim(),
      question_count: packet['total_count'],
    });
  }

  if (engine === 'OpenAI Codex') {
    if (!openai_configured()) {
      return json({ ok: false, reason: 'OPENAI_API_KEY not configured.' }, 409);
    }
    const payload = {
      model: get_openai_model(),
      input: prompt,
    };
    const headers = {
      Authorization: `Bearer ${get_openai_api_key()}`,
      'Content-Type': 'application/json',
    };
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (response.status >= 400) {
      const text = await response.text();
      return json({ ok: false, reason: text.slice(0, 4000) }, 500);
    }
    const data: any = await response.json();
    let output_text: string = data.output_text || '';
    if (!output_text && 'output' in data) {
      const output_chunks: string[] = [];
      for (const item of data.output || []) {
        for (const content_item of item.content || []) {
          if (content_item.type === 'output_text') {
            output_chunks.push(content_item.text || '');
          }
        }
      }
      output_text = output_chunks.filter((chunk) => chunk).join('\n');
    }
    return json({
      ok: true,
      engine,
      response_text: output_text.trim(),
      question_count: packet['total_count'],
    });
  }

  abort(400, 'Unsupported engine');
});
