import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { list_employees } from '@/lib/helpers';
import { mongoListEmployees } from '@/lib/mongo_bridge';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  // Read from MongoDB first; fall back to the existing config source when Mongo
  // is not configured or has no employees yet. Response shape is identical.
  const fromMongo = await mongoListEmployees(company);
  return json(fromMongo ?? list_employees(company as any));
});
