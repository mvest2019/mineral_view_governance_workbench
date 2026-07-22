import { NextRequest } from 'next/server';
import { json, route, abort } from '@/lib/http';
import { loadLocalSettings, saveLocalSettings } from '@/lib/paths';
import { get_openai_api_key, get_openai_model } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (_req: NextRequest) => {
  const settings = loadLocalSettings();
  const configured = Boolean(get_openai_api_key());
  const source = process.env.OPENAI_API_KEY
    ? 'environment'
    : settings.openai_api_key
      ? 'local_settings'
      : 'missing';
  return json({
    configured: configured,
    source: source,
    model: get_openai_model(),
  });
});

export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  body = body || {};
  if (body.remove) {
    const settings = loadLocalSettings();
    delete settings.openai_api_key;
    saveLocalSettings(settings);
    return json({ ok: true, configured: false });
  }
  const api_key = String(body.api_key || '').trim();
  const model = String(body.model || 'gpt-5').trim() || 'gpt-5';
  if (!api_key) {
    abort(400, 'api_key required');
  }
  const settings = loadLocalSettings();
  settings.openai_api_key = api_key;
  settings.openai_model = model;
  saveLocalSettings(settings);
  return json({ ok: true, configured: true, model: model });
});
