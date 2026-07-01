import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { json, route, abort } from '@/lib/http';
import { is_allowed_artifact_path } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const path_value = req.nextUrl.searchParams.get('path') || '';
  if (!path_value) {
    abort(400, 'path required');
  }
  if (!is_allowed_artifact_path(path_value)) {
    return json({ ok: false, error: 'path not allowed' }, 403);
  }
  let stat: fs.Stats;
  try {
    stat = fs.statSync(path_value);
  } catch {
    return json({ ok: false, error: 'file not found' }, 404);
  }
  if (!stat.isFile()) {
    return json({ ok: false, error: 'file not found' }, 404);
  }
  let content: string;
  try {
    // Python read_text(errors='replace'); Buffer.toString('utf-8') replaces
    // invalid sequences with U+FFFD, matching that behaviour.
    content = fs.readFileSync(path_value).toString('utf-8');
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
  return json({
    ok: true,
    path: path_value,
    name: path.basename(path_value),
    size_bytes: stat.size,
    content: content,
  });
});
