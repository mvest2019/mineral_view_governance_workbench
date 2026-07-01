import { spawnSync } from 'child_process';
import { NextRequest } from 'next/server';
import {
  build_repo_question_chat_prompt,
  command_exists,
  openai_configured,
  get_openai_api_key,
  get_openai_model,
} from '@/lib/helpers';
import { getDb } from '@/lib/db';
import { abort, json, route } from '@/lib/http';
import { APP_BASE_DIR } from '@/lib/paths';

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
  const question_code = body.question_code;
  const engine = body.engine;
  const user_prompt = String(body.prompt || '').trim();
  if (!company || !question_code || !engine || !user_prompt) {
    abort(400, 'company, question_code, engine, and prompt are required');
  }

  const db = getDb();
  const row = db
    .prepare('SELECT * FROM repo_questions WHERE company=? AND question_code=?')
    .get(company, question_code) as any;
  if (!row) {
    abort(404);
  }
  const question_row = row;
  const prompt = build_repo_question_chat_prompt(company, question_row, user_prompt);

  if (engine === 'Claude Code') {
    if (!command_exists('claude')) {
      return json({ ok: false, reason: 'Claude CLI is not available on this machine.' }, 409);
    }
    const result = spawnSync('claude', ['-p', '--allowedTools', 'Read'], {
      input: prompt,
      encoding: 'utf-8',
      timeout: 180 * 1000,
      cwd: String(APP_BASE_DIR),
    });
    if (result.error) {
      if ((result.error as NodeJS.ErrnoException).code === 'ETIMEDOUT' || result.signal === 'SIGTERM') {
        return json({ ok: false, reason: 'Claude request timed out' }, 504);
      }
      return json({ ok: false, reason: String(result.error.message || result.error) }, 500);
    }
    if (result.status !== 0) {
      return json(
        { ok: false, reason: String(result.stderr || result.stdout || 'Claude request failed').trim() },
        500,
      );
    }
    return json({ ok: true, engine, response_text: String(result.stdout || '').trim() });
  }

  if (engine === 'OpenAI Codex') {
    if (!openai_configured()) {
      return json({ ok: false, reason: 'OPENAI_API_KEY not configured.' }, 409);
    }
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${get_openai_api_key()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: get_openai_model(), input: prompt }),
    });
    if (response.status >= 400) {
      const text = await response.text();
      return json({ ok: false, reason: text.slice(0, 4000) }, 500);
    }
    const data: any = await response.json();
    let output_text = data?.output_text || '';
    if (!output_text && 'output' in (data || {})) {
      const output_chunks: string[] = [];
      for (const item of data.output || []) {
        for (const content_item of item?.content || []) {
          if (content_item?.type === 'output_text') {
            output_chunks.push(content_item?.text || '');
          }
        }
      }
      output_text = output_chunks.filter((chunk) => chunk).join('\n');
    }
    return json({ ok: true, engine, response_text: output_text });
  }

  abort(400, 'Unsupported engine');
});
