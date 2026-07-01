import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL('/login', req.url), 303);
}
