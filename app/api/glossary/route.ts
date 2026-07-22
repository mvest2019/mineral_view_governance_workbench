import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { get_company } from '@/lib/helpers';
import { json, route } from '@/lib/http';
import { _gov_glob } from '@/app/api/_content_helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const cfg = get_company(company as string);
  const candidates = _gov_glob(cfg, '*Glossary*.md');
  if (!candidates.length) return json({ exists: false, content: '' });
  return json({
    exists: true,
    content: fs.readFileSync(candidates[0], 'utf-8'),
    file: path.basename(candidates[0]),
  });
});
