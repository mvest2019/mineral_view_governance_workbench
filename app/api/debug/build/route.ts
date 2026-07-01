import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { json, route } from '@/lib/http';
import { APP_BASE_DIR } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export const GET = route(async (_req: NextRequest) => {
  const templatePath = path.join(APP_BASE_DIR, 'templates', 'index.html');
  const templateText = fs.readFileSync(templatePath, 'utf-8');
  const lines = templateText.split(/\r?\n/);
  const cssLine = (lines.find((line) => line.includes('styles.css')) || '').trim();
  const jsLine = (lines.find((line) => line.includes('app.js')) || '').trim();
  return json({
    base_dir: APP_BASE_DIR,
    template_folder: path.join(APP_BASE_DIR, 'templates'),
    static_folder: path.join(APP_BASE_DIR, 'static'),
    template_path: templatePath,
    css_line: cssLine,
    js_line: jsLine,
  });
});
