import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { loadLocalSettings, saveLocalSettings } from '@/lib/paths';
import { get_company, customer_source_settings } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company') as any;
  get_company(company);
  return json(customer_source_settings(company));
});

export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  body = body || {};
  const company = body.company;
  get_company(company);
  const settings = loadLocalSettings();
  const customer_sources: Record<string, any> = (settings.customer_sources as any) || {};
  customer_sources[company] = {
    server: String(body.server || '').trim(),
    database: String(body.database || '').trim(),
    table_or_view: String(body.table_or_view || '').trim(),
    notes: String(body.notes || '').trim(),
  };
  settings.customer_sources = customer_sources;
  saveLocalSettings(settings);
  return json({
    ok: true,
    configured: Boolean(customer_sources[company].server && customer_sources[company].database),
  });
});
