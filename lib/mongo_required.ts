// MongoDB mandatory-mode health guard (final cutover switch).
//
// This is the "MongoDB is now mandatory / fail fast" control from the cutover
// phase — delivered as an OPT-IN gate so it can ship safely BEFORE the data is
// migrated. Behavior:
//
//   • MONGO_REQUIRED !== 'true'  → no-op (current behavior; nothing changes).
//   • MONGO_REQUIRED === 'true'  → verify GovernanceDB is reachable; if not,
//                                  FAIL FAST with a clear error (no silent
//                                  fallback to GitHub markdown).
//
// Flip MONGO_REQUIRED=true only AFTER the migration has executed and verified,
// as the last step of the cutover. Until then this stays off and the app runs
// exactly as before.

import { isMongoConfigured } from '@/src/config/env';
import { checkMongoHealth } from '@/src/db/health';
import { httpBridgeEnabled, httpBridgeDbName } from '@/src/db/http_bridge';

export class MongoUnavailableError extends Error {
  readonly status = 503;
  constructor(message: string) {
    super(message);
    this.name = 'MongoUnavailableError';
  }
}

/** True when the app is configured to treat MongoDB as mandatory. */
export function mongoRequired(): boolean {
  return String(process.env.MONGO_REQUIRED || '').trim().toLowerCase() === 'true';
}

/**
 * Assert MongoDB is available when mandatory mode is on. No-op otherwise.
 * Throws MongoUnavailableError (→ 503) if MongoDB is required but unreachable —
 * the app never silently falls back to GitHub markdown in this mode.
 */
export async function assertMongoReady(): Promise<void> {
  if (!mongoRequired()) return;
  if (!isMongoConfigured()) {
    throw new MongoUnavailableError('MongoDB is required (MONGO_REQUIRED=true) but MONGODB_URI is not set.');
  }
  const health = await checkMongoHealth();
  if (!health.ok) {
    throw new MongoUnavailableError(`MongoDB is required but unavailable: ${health.error || 'connection failed'}`);
  }
}

/** Which persistence path the running server will actually use for MongoDB. */
export type MongoMode = 'http_bridge' | 'direct' | 'unconfigured';

/** Structured health result for the /api/health/mongo diagnostic route. */
export async function mongoHealthStatus(): Promise<{
  required: boolean;
  mode: MongoMode;
  configured: boolean;
  ok: boolean;
  dbName: string | null;
  pingMs: number | null;
  error?: string;
}> {
  const required = mongoRequired();

  // HTTP bridge mode: the app never connects to MongoDB directly. Ping through
  // the bridge so this reflects the SAME path Task Tracker/Meetings use.
  if (httpBridgeEnabled()) {
    const started = Date.now();
    try {
      const { getDb } = await import('@/src/db/connection');
      const db = await getDb();
      await db.command({ ping: 1 });
      return { required, mode: 'http_bridge', configured: true, ok: true, dbName: httpBridgeDbName(), pingMs: Date.now() - started };
    } catch (err) {
      return {
        required, mode: 'http_bridge', configured: true, ok: false, dbName: httpBridgeDbName(),
        pingMs: null, error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  if (!isMongoConfigured()) {
    return { required, mode: 'unconfigured', configured: false, ok: false, dbName: null, pingMs: null, error: 'Neither MONGODB_BRIDGE_URL nor MONGODB_URI is set' };
  }
  const h = await checkMongoHealth();
  return { required, mode: 'direct', configured: true, ok: h.ok, dbName: h.dbName, pingMs: h.pingMs, error: h.error };
}
