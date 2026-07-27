import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { mongoEnabled } from '@/lib/mongo_bridge';
import { getMongoEnvConfig, isMongoConfigured } from '@/src/config/env';
import { checkMongoHealth } from '@/src/db/health';
import { getCollection } from '@/src/db/connection';
import { slugifyName } from '@/lib/github';
import { COLLECTIONS } from '@/src/constants/collections';

export const dynamic = 'force-dynamic';

// TEMPORARY DIAGNOSTIC (to be removed once the root cause is confirmed).
//
// Runs the REAL Task Tracker MongoDB write path inside the running Next.js
// server process — the same runtime that serves POST /api/task_tracker — and
// returns a complete JSON trace: whether the server sees MONGODB_URI, which
// database/collection is targeted, the document count before and after, and
// either the inserted _id or the FULL error (unswallowed).
//
// GET  /api/health/mongo/tasktracker            -> trace only (no write)
// GET  /api/health/mongo/tasktracker?write=1    -> also performs one real insert
export const GET = route(async (req: NextRequest) => {
  const url = new URL(req.url);
  const doWrite = url.searchParams.get('write') === '1';

  const COLLECTION = COLLECTIONS.TASK_TRACKER_ENTRIES;
  const out: Record<string, unknown> = {
    collection: COLLECTION,
    trace: {} as Record<string, unknown>,
  };
  const t = out.trace as Record<string, unknown>;

  // 6/9/10 — does the SERVER runtime see the connection string, and where would it write?
  const serverSeesMongoUri = mongoEnabled();
  t['1_mongoEnabled_in_server_runtime'] = serverSeesMongoUri;
  t['2_isMongoConfigured'] = isMongoConfigured();
  let dbName: string | null = null;
  try {
    dbName = getMongoEnvConfig().dbName;
  } catch (e) {
    t['env_error'] = e instanceof Error ? e.message : String(e);
  }
  out.database = dbName;
  t['10_database'] = dbName;
  t['9_collection'] = COLLECTION;

  if (!serverSeesMongoUri) {
    // This is the silent no-op path: the bridge returns before any write.
    t['ROOT_CAUSE'] =
      'MONGODB_URI is NOT present in the Next.js SERVER process environment, so '
      + 'mongoSaveTaskTracker() returns early (no-op) and no insert is ever attempted. '
      + 'npm run mongo:health works because it is a separate process that loads .env.local '
      + 'via --env-file-if-exists. The running server does not have that variable. '
      + 'Fix: provide MONGODB_URI (and MONGODB_DB_NAME) to the server process itself.';
    t['3_mongoSaveTaskTracker_executes'] = 'returns early (guard false)';
    t['4_service_create_executes'] = false;
    t['5_repository_create_executes'] = false;
    t['6_insertOne_executes'] = false;
    return json(out, 200);
  }

  // Server sees the URI — can it actually reach GovernanceDB from THIS process?
  const health = await checkMongoHealth();
  t['reachable_from_server'] = health.ok;
  t['pingMs'] = health.pingMs;
  if (!health.ok) {
    t['ROOT_CAUSE'] =
      `Server has MONGODB_URI but cannot reach ${dbName}: ${health.error}. `
      + 'The write path throws on connect and the bridge swallows it (non-fatal).';
    t['7_mongo_error'] = health.error;
    t['8_error_swallowed_by_bridge'] = true;
    return json(out, 200);
  }

  // Count BEFORE (both scoped and total) + which companyKeys already exist.
  const col = await getCollection(COLLECTION);
  const countBeforeScoped = await col.countDocuments({ companyKey: 'MView', isDeleted: false });
  const countBeforeTotal = await col.estimatedDocumentCount();
  const companyKeys = await col.distinct('companyKey');
  out.document_count_before = countBeforeScoped;
  t['count_before_MView_live'] = countBeforeScoped;
  t['count_before_total'] = countBeforeTotal;
  t['existing_companyKeys'] = companyKeys;

  if (!doWrite) {
    t['note'] = 'Add ?write=1 to perform one real insert and report the _id + count after.';
    return json(out, 200);
  }

  // Run the REAL service/repository path (bypassing the bridge's try/catch so any
  // error surfaces here in full). This is byte-for-byte what the bridge invokes.
  t['3_mongoSaveTaskTracker_executes'] = true;
  try {
    const { TaskTrackerEntryRepository } = await import('@/src/repositories/taskTrackerEntry.repository');
    const { TaskTrackerService } = await import('@/src/services/taskTrackerEntry.service');
    const svc = new TaskTrackerService(new TaskTrackerEntryRepository({ companyKey: 'MView' }));
    t['4_service_create_executes'] = true;
    t['5_repository_create_executes'] = true;
    t['6_insertOne_executes'] = true;
    const saved = await svc.createEntry(
      {
        employeeKey: slugifyName('Ajay Landge'),
        employeeName: 'Ajay Landge',
        entryDate: new Date(),
        title: 'Task Tracker',
        bodyMarkdown: '# Task Tracker\n\nDiagnostic entry via /api/health/mongo/tasktracker?write=1',
      },
      'system',
    );
    const insertedId = String((saved as { _id?: unknown })._id);
    out.inserted_id = insertedId;
    t['7_mongo_error'] = null;
    t['8_error_swallowed_by_bridge'] = false;
    out.document_count_after = await col.countDocuments({ companyKey: 'MView', isDeleted: false });
    out.result = 'INSERT_OK';
  } catch (err) {
    const e = err as { name?: string; code?: number; message?: string; errInfo?: unknown };
    t['7_mongo_error'] = { name: e?.name, code: e?.code, message: e?.message, errInfo: e?.errInfo };
    t['8_error_swallowed_by_bridge'] = 'in the real route YES (bridge catch); surfaced here for diagnosis';
    out.document_count_after = await col.countDocuments({ companyKey: 'MView', isDeleted: false });
    out.result = 'INSERT_FAILED';
  }
  return json(out, 200);
});
