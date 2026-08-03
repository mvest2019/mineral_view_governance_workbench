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

export interface MongoHealthStatus {
  required: boolean;
  mode: MongoMode;
  configured: boolean;
  /** bridge mode only: did the HTTPS call to the bridge resolve at all? */
  bridgeReachable: boolean | null;
  /** did MongoDB actually respond (ping ok)? */
  mongoOk: boolean;
  ok: boolean;
  dbName: string | null;
  pingMs: number | null;
  error?: string;
  reason: string;
}

// Bound the whole probe so the endpoint ALWAYS returns well under Vercel's
// function limit (the old code waited the full 10–20s driver/bridge timeout,
// which got the function killed → "never returns").
const HEALTH_TIMEOUT_MS = 8000;
const TIMED_OUT = Symbol('timed_out');

function raceTimeout<T>(p: Promise<T>, ms: number): Promise<T | typeof TIMED_OUT> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(TIMED_OUT), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      () => { clearTimeout(timer); resolve(TIMED_OUT); },
    );
  });
}

/** Structured, ALWAYS-prompt health for the /api/health/mongo diagnostic route. */
export async function mongoHealthStatus(): Promise<MongoHealthStatus> {
  const required = mongoRequired();

  // HTTP bridge mode: probe through the bridge with its OWN short timeout so this
  // reflects the same path Task Tracker/Employees use, and returns promptly.
  if (httpBridgeEnabled()) {
    const { bridgePing, httpBridgeDbName: dbNameFn } = await import('@/src/db/http_bridge');
    const p = await bridgePing(HEALTH_TIMEOUT_MS);
    const reason = p.ok
      ? 'Bridge reachable and MongoDB ping succeeded.'
      : !p.reachable
        ? `Bridge NOT reachable at ${p.host} — ngrok tunnel or the Windows bridge is down / not responding (${p.error}).`
        : `Bridge reachable but the MongoDB ping FAILED — the Windows bridge cannot reach MongoDB (${p.error}).`;
    return {
      required, mode: 'http_bridge', configured: true,
      bridgeReachable: p.reachable, mongoOk: p.ok, ok: p.ok,
      dbName: dbNameFn(), pingMs: p.ok ? p.elapsedMs : null, error: p.ok ? undefined : p.error, reason,
    };
  }

  if (!isMongoConfigured()) {
    return {
      required, mode: 'unconfigured', configured: false, bridgeReachable: null, mongoOk: false,
      ok: false, dbName: null, pingMs: null,
      reason: 'Neither MONGODB_BRIDGE_URL nor MONGODB_URI is set — the app has no MongoDB to reach. Set MONGODB_BRIDGE_URL to use the HTTP bridge.',
    };
  }

  // Direct mode — bound it so health returns even if the driver hangs on
  // server-selection against an unreachable MONGODB_URI.
  const h = await raceTimeout(checkMongoHealth(), HEALTH_TIMEOUT_MS);
  if (h === TIMED_OUT) {
    return {
      required, mode: 'direct', configured: true, bridgeReachable: null, mongoOk: false,
      ok: false, dbName: httpBridgeDbName() || null, pingMs: null, error: `timed out after ${HEALTH_TIMEOUT_MS}ms`,
      reason: `Direct driver did not connect within ${HEALTH_TIMEOUT_MS}ms — MONGODB_URI host is unreachable. NOTE: the HTTP bridge is OFF because MONGODB_BRIDGE_URL is not set; set it to route through the bridge.`,
    };
  }
  return {
    required, mode: 'direct', configured: true, bridgeReachable: null, mongoOk: h.ok,
    ok: h.ok, dbName: h.dbName, pingMs: h.pingMs, error: h.error,
    reason: h.ok
      ? 'Direct driver connected.'
      : `Direct driver failed: ${h.error}. NOTE: the HTTP bridge is OFF (MONGODB_BRIDGE_URL not set).`,
  };
}
