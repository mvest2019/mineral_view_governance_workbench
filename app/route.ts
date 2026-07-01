import { renderIndexHtml, htmlResponse } from '@/lib/templates';

export const dynamic = 'force-dynamic';

// GET / -> the dashboard shell (index.html). The app is open (no login gate).
export function GET() {
  return htmlResponse(renderIndexHtml());
}
