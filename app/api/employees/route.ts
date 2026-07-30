import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { list_employees } from '@/lib/helpers';
import { mongoListEmployees } from '@/lib/mongo_bridge';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const t0 = Date.now();
  console.log(`[TRACE][employees] route ENTER company=${company}`); // TEMP TRACE
  // Read from MongoDB first; fall back to the existing config source when Mongo
  // is not configured or has no employees yet. Response shape is identical.
  console.log('[TRACE][employees] before mongoListEmployees()'); // TEMP TRACE
  const fromMongo = await mongoListEmployees(company);
  console.log(`[TRACE][employees] after mongoListEmployees() -> ${fromMongo === null ? 'null (fallback to list_employees)' : `${fromMongo.length} employees`} elapsedMs=${Date.now() - t0}`); // TEMP TRACE
  console.log('[TRACE][employees] before returning response'); // TEMP TRACE
  return json(fromMongo ?? list_employees(company as any));
});
