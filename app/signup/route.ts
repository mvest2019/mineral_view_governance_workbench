import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generatePasswordHash, getSession, setSession } from '@/lib/auth';
import { renderAuthHtml, htmlResponse } from '@/lib/templates';
import { nowIso } from '@/lib/http';

export const dynamic = 'force-dynamic';

interface UserRow {
  id: number;
  username: string;
  display_name: string | null;
}

export async function GET() {
  if (await getSession()) return NextResponse.redirect(new URL('/', baseUrl()));
  return htmlResponse(renderAuthHtml({ mode: 'signup' }));
}

export async function POST(req: NextRequest) {
  if (await getSession()) return NextResponse.redirect(new URL('/', req.url), 303);
  const db = getDb();
  const form = await req.formData();
  const username = String(form.get('username') || '').trim();
  const password = String(form.get('password') || '');
  const confirm = String(form.get('confirm') || '');
  const displayName = String(form.get('display_name') || '').trim();

  let error: string | null = null;
  if (!username || !password) error = 'Username and password are required.';
  else if (username.length < 3) error = 'Username must be at least 3 characters.';
  else if (password.length < 6) error = 'Password must be at least 6 characters.';
  else if (password !== confirm) error = 'Passwords do not match.';
  else if (db.prepare('SELECT 1 FROM users WHERE username=?').get(username))
    error = 'That username is already taken.';

  if (error) {
    return htmlResponse(
      renderAuthHtml({ mode: 'signup', error, username, display_name: displayName }),
    );
  }

  db.prepare(
    'INSERT INTO users(username, password_hash, display_name, created_at) VALUES(?,?,?,?)',
  ).run(username, generatePasswordHash(password), displayName || username, nowIso());
  const row = db.prepare('SELECT * FROM users WHERE username=?').get(username) as UserRow;
  await setSession({
    user_id: row.id,
    username: row.username,
    display_name: row.display_name || row.username,
  });
  return NextResponse.redirect(new URL('/', req.url), 303);
}

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
