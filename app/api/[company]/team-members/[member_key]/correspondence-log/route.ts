import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { json, route } from '@/lib/http';
import { list_team_member_correspondence } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export const GET = route(
  async (_req: NextRequest, ctx: { params: Promise<{ company: string; member_key: string }> }) => {
    const { company, member_key } = await ctx.params;
    const db = getDb();
    const rows = list_team_member_correspondence(db, company, member_key);
    return json({
      company,
      member_key,
      rows,
      count: rows.length,
    });
  },
);
