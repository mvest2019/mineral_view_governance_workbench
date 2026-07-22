import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import { suggest_team_member_follow_ups } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const POST = route(
  async (req: NextRequest, ctx: { params: Promise<{ company: string; member_key: string }> }) => {
    const { company, member_key } = await ctx.params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const actor = body.engine || 'OpenAI';
    const db = getDb();
    const created = suggest_team_member_follow_ups(db, company, member_key, actor);
    return json({ ok: true, created, count: created.length });
  },
);
