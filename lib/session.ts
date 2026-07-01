import crypto from 'crypto';

// Signed-cookie session, mirroring Flask's server-side session for the three
// values the app stores: user_id, username, display_name. The cookie is signed
// with HMAC-SHA256 so it cannot be forged, matching Flask's signed-session
// guarantees. The same scheme is verified in middleware via Web Crypto.
export const SESSION_COOKIE = 'gw_session';

export interface SessionData {
  user_id: number;
  username: string;
  display_name: string;
}

function secret(): string {
  return process.env.WORKBENCH_SECRET || 'governance-workbench-dev-secret-change-me';
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): Buffer {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export function signSession(data: SessionData): string {
  const payload = b64urlEncode(Buffer.from(JSON.stringify(data), 'utf-8'));
  const sig = b64urlEncode(crypto.createHmac('sha256', secret()).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionData | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = b64urlEncode(crypto.createHmac('sha256', secret()).update(payload).digest());
  try {
    if (
      sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
      return null;
    }
    return JSON.parse(b64urlDecode(payload).toString('utf-8')) as SessionData;
  } catch {
    return null;
  }
}
