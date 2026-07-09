import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { claude_cli_available, run_claude } from '@/lib/claude_cli';
import {
  get_company,
  build_governance_file_index,
  build_governance_file_chat_prompt,
  openai_configured,
  get_openai_api_key,
  get_openai_model,
} from '@/lib/helpers';
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
  const rel = body.path;
  const engine = body.engine;
  const user_prompt = String(body.prompt || '').trim();
  if (!company || !rel || !engine || !user_prompt) {
    abort(400, 'company, path, engine, and prompt are required');
  }

  const cfg = get_company(company);
  const rootResolved = path.resolve(cfg.root);
  const target = path.resolve(cfg.root, rel);
  if (target !== rootResolved && !target.startsWith(rootResolved + path.sep)) {
    abort(403);
  }
  let stat: fs.Stats | null = null;
  try {
    stat = fs.statSync(target);
  } catch {
    abort(404);
  }
  if (!stat || !stat.isFile()) abort(404);

  const index = build_governance_file_index(company);
  const file_row = index.rows.find((row: any) => row.path === rel);
  if (!file_row) {
    abort(404);
  }
  const related_files = index.rows
    .filter((row: any) => row.category_key === file_row.category_key && row.path !== rel)
    .slice(0, 6);
  const content = fs.readFileSync(target, 'utf-8');
  const prompt = build_governance_file_chat_prompt(company, file_row, content, related_files, user_prompt);

  if (engine === 'Claude Code') {
    if (!claude_cli_available()) {
      return json({ ok: false, reason: 'Claude CLI is not available on this machine.' }, 409);
    }
    const result = await run_claude(['-p', '--allowedTools', 'Read'], {
      input: prompt,
      timeoutMs: 180 * 1000,
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
    return json({
      ok: true,
      engine,
      response_text: String(result.stdout || '').trim(),
      category: file_row.category_label,
    });
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
    return json({
      ok: true,
      engine,
      response_text: output_text,
      category: file_row.category_label,
    });
  }

  abort(400, 'Unsupported engine');
});
