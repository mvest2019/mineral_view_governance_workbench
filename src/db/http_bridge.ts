// HTTP MongoDB bridge client (app side).
//
// When MONGODB_BRIDGE_URL is set, the app does NOT connect to MongoDB directly.
// Instead every collection/db operation is forwarded as an authenticated HTTPS
// request to the remote-claude-bridge running on the Windows server, which holds
// the only real MongoDB connection. This mirrors how Claude is invoked through
// the same bridge/tunnel.
//
// The seam is a Collection/Db SHIM (a Proxy) that translates the exact driver
// methods the repositories use — insertOne / findOne / find().sort().limit()
// .toArray() / findOneAndUpdate / updateOne / countDocuments, plus db.command /
// listCollections / admin().command — into one POST per operation. Repositories,
// services, models, and validators are unchanged and never know the difference.
//
// EJSON (canonical) is used on the wire so BSON types (ObjectId, Date, …) round
// trip losslessly. When MONGODB_BRIDGE_URL is not set, none of this runs and the
// app uses the direct driver exactly as before.

import { EJSON } from 'bson';
import type { Collection, Db, Document } from 'mongodb';

const DEFAULT_DB = 'GovernanceDB';
// Methods on a Collection/Db that return a cursor (chained then .toArray()).
const CURSOR_METHODS = new Set(['find', 'aggregate', 'listIndexes', 'listSearchIndexes']);

// Canonical variable is MONGODB_BRIDGE_URL. `MONGO_BRIDGE_URL` (no "DB") is
// accepted as an alias so a common naming slip can't silently disable bridge
// mode and fall back to the direct driver. The resolved name is logged once.
function rawBridgeUrl(): string {
  const canonical = (process.env.MONGODB_BRIDGE_URL || '').trim();
  if (canonical) return canonical;
  const alias = (process.env.MONGO_BRIDGE_URL || '').trim();
  if (alias) {
    console.warn('[http_bridge] Using MONGO_BRIDGE_URL (alias). The canonical name is MONGODB_BRIDGE_URL — please rename it.');
    return alias;
  }
  return '';
}

export function httpBridgeEnabled(): boolean {
  return Boolean(rawBridgeUrl());
}

export function httpBridgeDbName(): string {
  return (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB;
}

// Normalize the configured bridge URL to the ROOT that the /mongo* routes hang
// off. The env var may be the tunnel root (https://x.ngrok.app) or may already
// include a /mongo, /mongo/op or /mongo/health suffix — strip any known suffix
// so we can append the exact route we need. The running bridge exposes
// `POST /mongo/op` (operations) and `GET /mongo/health` (ping); older repo
// bridges exposed a single `POST /mongo`. We target the new routes and fall
// back to /mongo on a 404 so any deploy ordering works.
function mongoBaseUrl(): string {
  let base = rawBridgeUrl().replace(/\/+$/, '');
  base = base.replace(/\/mongo(\/(op|health))?$/, '');
  return base;
}
function bridgeOpUrl(): string { return `${mongoBaseUrl()}/mongo/op`; }
function bridgeHealthUrl(): string { return `${mongoBaseUrl()}/mongo/health`; }
function bridgeLegacyUrl(): string { return `${mongoBaseUrl()}/mongo`; }

function bridgeToken(): string {
  // Reuse the Claude bridge token by default; allow a dedicated one (either name).
  return (
    process.env.MONGODB_BRIDGE_TOKEN
    || process.env.MONGO_BRIDGE_TOKEN
    || process.env.REMOTE_CLAUDE_TOKEN
    || ''
  ).trim();
}

function bridgeTimeoutMs(): number {
  const n = Number(process.env.MONGODB_BRIDGE_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : 20_000;
}

interface CursorOp { name: string; args: unknown[] }
interface BridgePayload {
  db: string;
  collection?: string;
  target: 'collection' | 'db' | 'admin';
  method: string;
  args: unknown[];
  cursorOps?: CursorOp[];
}

async function sendBridge(payload: BridgePayload): Promise<unknown> {
  const timeout = bridgeTimeoutMs();
  const token = bridgeToken();
  const op = `${payload.target}.${payload.method}${payload.collection ? `(${payload.collection})` : ''}`;
  const body = EJSON.stringify(payload as unknown as Document, { relaxed: false });

  // One bounded POST attempt against a specific route.
  const attempt = async (url: string): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    let host = '(unparseable)';
    let route = '/mongo';
    try { const u = new URL(url); host = u.host; route = u.pathname; } catch { /* masked host only; token is in the header, never the URL */ }
    const started = Date.now();
    console.log(`[TRACE][http_bridge] fetch → https://${host}${route} op=${op} hasToken=${Boolean(token)} timeout=${timeout}ms`); // TEMP TRACE
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ngrok's free tier can return an HTML interstitial instead of
          // forwarding; this header tells it to skip that and pass the request
          // straight through so the bridge's EJSON reply comes back intact.
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
        signal: controller.signal,
        cache: 'no-store',
      });
      console.log(`[TRACE][http_bridge] fetch RESOLVED op=${op} route=${route} status=${r.status} elapsedMs=${Date.now() - started}`); // TEMP TRACE
      return r;
    } finally {
      clearTimeout(timer);
    }
  };

  let res: Response;
  try {
    res = await attempt(bridgeOpUrl());
    // Backward-compat: a bridge that predates /mongo/op only serves /mongo. Only
    // a 404 (route missing) triggers the retry — real op errors are 200 ok:false.
    if (res.status === 404) {
      console.warn(`[http_bridge] /mongo/op returned 404; retrying legacy /mongo for op=${op}`);
      res = await attempt(bridgeLegacyUrl());
    }
  } catch (err) {
    console.error(`[TRACE][http_bridge] fetch REJECTED op=${op}: ${(err as Error).message}`); // TEMP TRACE
    throw new Error(`MongoDB bridge request failed: ${(err as Error).message}`);
  }

  console.log(`[TRACE][http_bridge] before res.text() op=${op}`); // TEMP TRACE
  const text = await res.text();
  console.log(`[TRACE][http_bridge] after res.text() op=${op} bytes=${text.length}; before EJSON.parse`); // TEMP TRACE
  let parsed: { ok?: boolean; result?: unknown; error?: string; errorMeta?: Record<string, unknown> };
  try {
    parsed = EJSON.parse(text) as typeof parsed;
  } catch {
    throw new Error(`MongoDB bridge returned non-EJSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  console.log(`[TRACE][http_bridge] after EJSON.parse op=${op} ok=${parsed?.ok}`); // TEMP TRACE
  if (!res.ok || !parsed || parsed.ok !== true) {
    const err = new Error(parsed?.error || `MongoDB bridge error (HTTP ${res.status})`);
    // Re-attach the driver error metadata (name/code/errInfo) so existing route
    // error handling (e.g. task_tracker) keeps surfacing the real Mongo error.
    if (parsed?.errorMeta) Object.assign(err, parsed.errorMeta);
    throw err;
  }
  return parsed.result;
}

export interface BridgePingResult {
  host: string;
  reachable: boolean; // did the HTTP request to the bridge RESOLVE at all?
  ok: boolean;        // did the MongoDB ping succeed (bridge → MongoDB)?
  status: number | null;
  elapsedMs: number;
  error?: string;
}

/**
 * Bounded health probe of the bridge with its OWN short timeout so
 * /api/health/mongo returns promptly (never waits the full 20s bridge timeout,
 * which would exceed Vercel's function limit). Primary path is `GET /mongo/health`
 * (the route the running bridge exposes); if that route is missing (404) it
 * falls back to the legacy `POST /mongo` admin ping. Distinguishes
 * "bridge/tunnel unreachable" (fetch never resolves) from "bridge reached but
 * MongoDB ping failed" (health reports mongoOk:false / ok:false).
 */
export async function bridgePing(timeoutMs = 8000): Promise<BridgePingResult> {
  const healthUrl = bridgeHealthUrl();
  let host = '(unparseable)';
  try { host = new URL(healthUrl).host; } catch { /* ignore */ }
  const token = bridgeToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  const authHeader: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  console.log(`[TRACE][http_bridge] bridgePing GET → https://${host}/mongo/health timeout=${timeoutMs}ms hasToken=${Boolean(token)}`); // TEMP TRACE
  try {
    let res = await fetch(healthUrl, { method: 'GET', headers: { ...authHeader }, signal: controller.signal, cache: 'no-store' });
    // Backward-compat: a bridge without /mongo/health -> ping via legacy POST /mongo.
    if (res.status === 404) {
      console.warn('[http_bridge] GET /mongo/health returned 404; falling back to legacy POST /mongo ping'); // TEMP TRACE
      res = await fetch(bridgeLegacyUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: EJSON.stringify({ db: httpBridgeDbName(), target: 'admin', method: 'command', args: [{ ping: 1 }] } as unknown as Document, { relaxed: false }),
        signal: controller.signal,
        cache: 'no-store',
      });
    }
    const text = await res.text();
    const elapsedMs = Date.now() - started;
    console.log(`[TRACE][http_bridge] bridgePing RESOLVED status=${res.status} elapsedMs=${elapsedMs}`); // TEMP TRACE
    type ParsedPing = { ok?: boolean; mongoOk?: boolean; error?: string } | null;
    let parsed: ParsedPing = null;
    try { parsed = EJSON.parse(text) as ParsedPing; } catch { /* non-EJSON body */ }
    if (!res.ok) return { host, reachable: true, ok: false, status: res.status, elapsedMs, error: parsed?.error || `bridge/tunnel HTTP ${res.status}: ${text.slice(0, 120)}` };
    // A health route reports Mongo reachability via mongoOk; the legacy admin
    // ping reports ok. Only an explicit false means "reached but Mongo down".
    const mongoFlag = parsed?.mongoOk ?? parsed?.ok;
    if (mongoFlag === false) return { host, reachable: true, ok: false, status: res.status, elapsedMs, error: parsed?.error || `bridge reachable but MongoDB ping failed: ${text.slice(0, 120)}` };
    return { host, reachable: true, ok: true, status: res.status, elapsedMs };
  } catch (err) {
    const elapsedMs = Date.now() - started;
    const aborted = (err as Error).name === 'AbortError';
    console.error(`[TRACE][http_bridge] bridgePing REJECTED elapsedMs=${elapsedMs}: ${(err as Error).message}`); // TEMP TRACE
    return { host, reachable: false, ok: false, status: null, elapsedMs, error: aborted ? `bridge did not respond within ${timeoutMs}ms` : (err as Error).message };
  } finally {
    clearTimeout(timer);
  }
}

function makeCursor(base: Omit<BridgePayload, 'cursorOps'>): unknown {
  const ops: CursorOp[] = [];
  const cursor = {
    sort(v: unknown) { ops.push({ name: 'sort', args: [v] }); return cursor; },
    limit(v: unknown) { ops.push({ name: 'limit', args: [v] }); return cursor; },
    skip(v: unknown) { ops.push({ name: 'skip', args: [v] }); return cursor; },
    project(v: unknown) { ops.push({ name: 'project', args: [v] }); return cursor; },
    toArray() { return sendBridge({ ...base, cursorOps: ops }); },
  };
  return cursor;
}

function bridgeCollection(dbName: string, collName: string): unknown {
  return new Proxy({}, {
    get(_t, prop) {
      if (typeof prop !== 'string') return undefined;
      if (prop === 'collectionName') return collName;
      if (prop === 'dbName') return dbName;
      if (CURSOR_METHODS.has(prop)) {
        return (...args: unknown[]) => makeCursor({ db: dbName, collection: collName, target: 'collection', method: prop, args });
      }
      return (...args: unknown[]) => sendBridge({ db: dbName, collection: collName, target: 'collection', method: prop, args });
    },
  });
}

function bridgeDb(dbName: string): unknown {
  return new Proxy({}, {
    get(_t, prop) {
      if (typeof prop !== 'string') return undefined;
      if (prop === 'databaseName') return dbName;
      if (prop === 'collection') return (name: string) => bridgeCollection(dbName, name);
      if (prop === 'admin') return () => ({
        command: (...args: unknown[]) => sendBridge({ db: dbName, target: 'admin', method: 'command', args }),
      });
      if (prop === 'listCollections') {
        return (...args: unknown[]) => makeCursor({ db: dbName, target: 'db', method: 'listCollections', args });
      }
      return (...args: unknown[]) => sendBridge({ db: dbName, target: 'db', method: prop, args });
    },
  });
}

/** Bridge-backed Collection (typed as the real thing; forwards over HTTPS). */
export function bridgeGetCollection<TSchema extends Document = Document>(name: string): Collection<TSchema> {
  return bridgeCollection(httpBridgeDbName(), name) as unknown as Collection<TSchema>;
}

/** Bridge-backed Db (typed as the real thing; forwards over HTTPS). */
export function bridgeGetDb(): Db {
  return bridgeDb(httpBridgeDbName()) as unknown as Db;
}
