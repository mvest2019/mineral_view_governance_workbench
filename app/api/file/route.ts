import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { get_company, build_governance_file_index, governance_file_headings } from '@/lib/helpers';
import { abort, json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const rel = req.nextUrl.searchParams.get('path');
  if (!rel) abort(400);
  const cfg = get_company(company as string);
  const rootResolved = path.resolve(cfg.root);
  const target = path.resolve(cfg.root, rel as string);
  // Mirror Path.relative_to: target must be inside root.
  if (target !== rootResolved && !target.startsWith(rootResolved + path.sep)) {
    abort(403);
  }
  let stat: fs.Stats;
  try {
    stat = fs.statSync(target);
  } catch {
    abort(404);
    return json({}); // unreachable
  }
  if (!stat.isFile()) abort(404);
  const content = fs.readFileSync(target, 'utf-8');
  const index = build_governance_file_index(company as string);
  const file_row = index.rows.find((row: any) => row.path === rel);
  if (!file_row) {
    abort(404);
  }
  const related_files = index.rows
    .filter((row: any) => row.category_key === file_row.category_key && row.path !== rel)
    .map((row: any) => ({ path: row.path, name: row.name }))
    .slice(0, 8);
  return json({
    path: rel,
    name: file_row.name,
    content,
    size: file_row.size,
    modified: file_row.modified,
    category_key: file_row.category_key,
    category_label: file_row.category_label,
    attention_flags: file_row.attention_flags,
    attention_level: file_row.attention_level,
    attention_count: file_row.attention_count,
    headings: governance_file_headings(content, 8),
    related_files,
  });
});
