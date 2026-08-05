import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { mongoListEmployeesStrict } from '@/lib/mongo_bridge';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Employees come from MongoDB ONLY. There is no fallback to config/list_employees
// or any hardcoded list. If MongoDB (or the HTTP bridge) is unavailable, return a
// 503 so the UI shows a clear error instead of dummy employees.
export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  const t0 = Date.now();
  console.log(`[TRACE][employees] route ENTER company=${company}`); // TEMP TRACE
  try {
    console.log('[TRACE][employees] before mongoListEmployeesStrict()'); // TEMP TRACE
    const employees = await mongoListEmployeesStrict(company);
    console.log(`[TRACE][employees] after mongoListEmployeesStrict() count=${employees.length} elapsedMs=${Date.now() - t0}`); // TEMP TRACE
    console.log('[TRACE][employees] before returning 200 response'); // TEMP TRACE
    return json(employees);
  } catch (err) {
    console.error(`[TRACE][employees] CAUGHT after ${Date.now() - t0}ms:`, err instanceof Error ? err.message : err); // TEMP TRACE
    console.error('[employees] Unable to load employees from MongoDB:', err);
    return json(
      {
        error: 'Unable to load employees from MongoDB',
        detail: err instanceof Error ? err.message : String(err),
      },
      503,
    );
  }
});
