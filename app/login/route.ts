import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { checkPasswordHash, getSession, hasUsers, setSession } from '@/lib/auth';
import { renderAuthHtml, htmlResponse } from '@/lib/templates';

export const dynamic = 'force-dynamic';

interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  display_name: string | null;
}

export async function GET() {
  if (await getSession()) return NextResponse.redirect(new URL('/', baseUrl()));
  return htmlResponse(renderAuthHtml({ mode: 'login', has_users: hasUsers() }));
}

export async function POST(req: NextRequest) {
  if (await getSession()) return NextResponse.redirect(new URL('/', req.url), 303);
  const db = getDb();
  const hasUsersFlag = hasUsers();
  const form = await req.formData();
  const username = String(form.get('username') || '').trim();
  const password = String(form.get('password') || '');
  const row = db.prepare('SELECT * FROM users WHERE username=?').get(username) as UserRow | undefined;
  if (row && checkPasswordHash(row.password_hash, password)) {
    await setSession({
      user_id: row.id,
      username: row.username,
      display_name: row.display_name || row.username,
    });
    return NextResponse.redirect(new URL('/', req.url), 303);
  }
  return htmlResponse(
    renderAuthHtml({
      mode: 'login',
      error: 'Invalid username or password.',
      has_users: hasUsersFlag,
      username,
    }),
  );
}

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
