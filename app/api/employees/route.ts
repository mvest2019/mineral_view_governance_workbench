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
  try {
    const employees = await mongoListEmployeesStrict(company);
    return json(employees);
  } catch (err) {
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
