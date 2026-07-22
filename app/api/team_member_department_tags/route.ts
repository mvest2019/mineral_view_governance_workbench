import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { normalize_department_key } from '@/lib/helpers';
import { abort, json, nowIso, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT company, member_key, department_key, source, note, created_at, updated_at
           FROM team_member_department_tags
           WHERE company=?
           ORDER BY member_key, department_key`,
    )
    .all(company) as any[];
  return json({
    company,
    rows,
  });
});

export const POST = route(async (req: NextRequest) => {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const company = body.company;
  const member_key = body.member_key;
  const departments = body.departments || [];
  const note = (body.note || '').trim();
  if (!company || !member_key) {
    abort(400, 'company and member_key required');
  }
  const db = getDb();
  const clean_departments: string[] = [];
  for (const item of departments) {
    const value = normalize_department_key(company, item, db);
    if (value && !clean_departments.includes(value)) {
      clean_departments.push(value);
    }
  }
  const now = nowIso();
  db.prepare(
    "DELETE FROM team_member_department_tags WHERE company=? AND member_key=? AND source='manual'",
  ).run(company, member_key);
  for (const department_key of clean_departments) {
    db.prepare(
      `INSERT INTO team_member_department_tags(company, member_key, department_key, source, note, created_at, updated_at)
               VALUES(?,?,?,?,?,?,?)`,
    ).run(company, member_key, department_key, 'manual', note, now, now);
  }
  return json({
    ok: true,
    company,
    member_key,
    departments: clean_departments,
    updated_at: now,
  });
});
