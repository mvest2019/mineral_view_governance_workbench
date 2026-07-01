import { NextRequest, NextResponse } from 'next/server';

// Edge-compatible verification of the HMAC-SHA256 signed session cookie. Mirrors
// lib/session.ts (which signs with node:crypto) so the same token validates in
// both places.
const SESSION_COOKIE = 'gw_session';

function secret(): string {
  return process.env.WORKBENCH_SECRET || 'governance-workbench-dev-secret-change-me';
}

function b64urlToBytes(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    return bytesToB64url(mac) === sig && !!b64urlToBytes(payload);
  } catch {
    return false;
  }
}

// Endpoints reachable without a session, mirroring PUBLIC_ENDPOINTS.
const PUBLIC_PATHS = new Set(['/login', '/signup', '/logout']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets and Next internals are always public.
  if (
    pathname.startsWith('/static/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const valid = await isValidSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (valid) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  }
  const loginUrl = new URL('/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on everything except static asset files; auth logic above further
  // narrows what is public.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
