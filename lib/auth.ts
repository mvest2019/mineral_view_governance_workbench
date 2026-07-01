import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getDb } from './db';
import { SESSION_COOKIE, SessionData, signSession, verifySession } from './session';

// Password hashing. The original app used werkzeug's generate_password_hash /
// check_password_hash. The runtime DB is per-machine and not migrated, so we
// use Node's scrypt with a self-describing format that preserves the same
// signup/login behaviour (hash on signup, constant-time verify on login).
export function generatePasswordHash(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 32).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function checkPasswordHash(stored: string, password: string): boolean {
  try {
    const [scheme, salt, derived] = stored.split('$');
    if (scheme !== 'scrypt' || !salt || !derived) return false;
    const check = crypto.scryptSync(password, salt, 32).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

/** Read the current session from the request cookies (async in Next 15). */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function setSession(data: SessionData): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(data), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function hasUsers(): boolean {
  const row = getDb().prepare('SELECT 1 FROM users LIMIT 1').get();
  return !!row;
}
