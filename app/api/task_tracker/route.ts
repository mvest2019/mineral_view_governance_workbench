import { NextRequest } from 'next/server';
import { abort, json, route } from '@/lib/http';
import { slugifyName } from '@/lib/github';
import { mongoEnabled } from '@/lib/mongo_bridge';
import { logMongoEnvDiagnostics } from '@/lib/env_diagnostics';
import { TaskTrackerEntryRepository } from '@/src/repositories/taskTrackerEntry.repository';
import { TaskTrackerService, TaskTrackerValidationError } from '@/src/services/taskTrackerEntry.service';

export const dynamic = 'force-dynamic';
// Explicit Node.js runtime (not Edge) so process.env / .env.local are available.
export const runtime = 'nodejs';

const COMPANY_DEFAULT = 'MView';

// Raw employee keys are stored as "First_Last"; show a readable display name.
function employeeDisplayName(raw: string): string {
  return String(raw || '').replace(/_+/g, ' ').trim() || 'Unknown';
}

// Task Tracker persists DIRECTLY and ONLY to MongoDB (GovernanceDB.taskTrackerEntries).
// No GitHub credentials are required, no GitHub validation runs, no Markdown file is
// written, and no GitHub API is called. A MongoDB failure is surfaced to the caller
// (never swallowed).
export const POST = route(async (req: NextRequest) => {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const company = String(body.company || '').trim();
  const employeeRaw = String(body.employee || '').trim();
  const markdown = String(body.markdown || '').trim();
  const createdBy = String(body.created_by || '').trim() || 'Unknown';

  // Input validation (mirrors the client gating). These are request checks only —
  // there is no GitHub/token validation.
  if (!company) {
    abort(400, 'company required');
  }
  if (!employeeRaw) {
    abort(400, 'Please select an employee.');
  }
  if (!markdown) {
    abort(400, 'Please enter a task description.');
  }

  // MongoDB is the ONLY persistence layer. If it is not configured on the server,
  // that is a real failure — surface it instead of silently doing nothing.
  // TEMPORARY diagnostics: print exactly why MONGODB_URI may be missing here even
  // though the standalone health script can read it. Remove once resolved.
  const diag = logMongoEnvDiagnostics('task_tracker');
  const enabled = mongoEnabled();
  console.log(`[task_tracker] MongoDB enabled: ${enabled}`);
  if (!enabled) {
    console.error('[task_tracker] MONGODB_URI is not set on the server — cannot persist task.');
    return json(
      {
        error: 'MongoDB is not configured (MONGODB_URI is not set on the server).',
        diagnostics: diag,
      },
      503,
    );
  }

  const companyKey = company || COMPANY_DEFAULT;
  const employeeName = employeeDisplayName(employeeRaw);
  const employeeKey = slugifyName(employeeName);
  const actor = slugifyName(createdBy) || 'system';

  const svc = new TaskTrackerService(new TaskTrackerEntryRepository({ companyKey }));

  console.log(
    `[task_tracker] MongoDB insert attempted — db=GovernanceDB collection=taskTrackerEntries `
      + `company=${companyKey} employeeKey=${employeeKey}`,
  );

  try {
    const saved = await svc.createEntry(
      {
        employeeKey,
        employeeName,
        entryDate: new Date(),
        title: 'Task Tracker',
        bodyMarkdown: markdown,
      },
      actor,
    );

    const id = String((saved as { _id?: unknown })._id);
    console.log(`[task_tracker] MongoDB insert SUCCEEDED — _id=${id}`);

    return json({
      ok: true,
      id,
      company,
      employee: employeeRaw,
      employee_name: employeeName,
      collection: 'taskTrackerEntries',
      database: 'GovernanceDB',
    });
  } catch (err) {
    // DO NOT swallow — return the actual error.
    if (err instanceof TaskTrackerValidationError) {
      console.error('[task_tracker] MongoDB insert FAILED — edge validation:', err.errors);
      return json({ error: err.message, errors: err.errors }, 400);
    }
    const e = err as { name?: string; code?: number; message?: string; errInfo?: unknown };
    console.error(
      `[task_tracker] MongoDB insert FAILED — name=${e?.name} code=${e?.code} message=${e?.message}`,
      e?.errInfo ? `errInfo=${JSON.stringify(e.errInfo)}` : '',
    );
    return json(
      {
        error: e?.message || 'MongoDB insert failed',
        name: e?.name ?? null,
        code: e?.code ?? null,
        errInfo: e?.errInfo ?? null,
      },
      500,
    );
  }
});
