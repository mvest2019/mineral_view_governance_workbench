import { renderIndexHtml, htmlResponse } from '@/lib/templates';

export const dynamic = 'force-dynamic';

// GET / -> the dashboard shell (index.html). Auth gating is handled by
// middleware, mirroring Flask's require_login + index().
export function GET() {
  return htmlResponse(renderIndexHtml());
}
