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

function bridgeUrl(): string {
  const base = rawBridgeUrl().replace(/\/+$/, '');
  return base.endsWith('/mongo') ? base : `${base}/mongo`;
}

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
  const controller = new AbortController();
  const url = bridgeUrl();
  const timeout = bridgeTimeoutMs();
  const timer = setTimeout(() => controller.abort(), timeout);
  const token = bridgeToken();
  let host = '(unparseable)';
  try { host = new URL(url).host; } catch { /* ignore */ } // masked host only; token is in the header, never the URL
  const op = `${payload.target}.${payload.method}${payload.collection ? `(${payload.collection})` : ''}`;
  const started = Date.now();
  console.log(`[TRACE][http_bridge] fetch → https://${host}/mongo op=${op} hasToken=${Boolean(token)} timeout=${timeout}ms`); // TEMP TRACE
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: EJSON.stringify(payload as unknown as Document, { relaxed: false }),
      signal: controller.signal,
      cache: 'no-store',
    });
    console.log(`[TRACE][http_bridge] fetch RESOLVED op=${op} status=${res.status} elapsedMs=${Date.now() - started}`); // TEMP TRACE
  } catch (err) {
    console.error(`[TRACE][http_bridge] fetch REJECTED op=${op} elapsedMs=${Date.now() - started}: ${(err as Error).message}`); // TEMP TRACE
    throw new Error(`MongoDB bridge request failed: ${(err as Error).message}`);
  } finally {
    clearTimeout(timer);
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
 * Bounded health probe of the bridge: POST an admin ping to /mongo with its OWN
 * short timeout so /api/health/mongo returns promptly (never waits the full 20s
 * bridge timeout, which would exceed Vercel's function limit). Distinguishes
 * "bridge/tunnel unreachable" (fetch never resolves) from "bridge reached but
 * MongoDB ping failed" (bridge responds ok:false).
 */
export async function bridgePing(timeoutMs = 8000): Promise<BridgePingResult> {
  const url = bridgeUrl();
  let host = '(unparseable)';
  try { host = new URL(url).host; } catch { /* ignore */ }
  const token = bridgeToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  console.log(`[TRACE][http_bridge] bridgePing → https://${host}/mongo timeout=${timeoutMs}ms hasToken=${Boolean(token)}`); // TEMP TRACE
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: EJSON.stringify({ db: httpBridgeDbName(), target: 'admin', method: 'command', args: [{ ping: 1 }] } as unknown as Document, { relaxed: false }),
      signal: controller.signal,
      cache: 'no-store',
    });
    const text = await res.text();
    const elapsedMs = Date.now() - started;
    console.log(`[TRACE][http_bridge] bridgePing RESOLVED status=${res.status} elapsedMs=${elapsedMs}`); // TEMP TRACE
    type ParsedPing = { ok?: boolean; error?: string } | null;
    let parsed: ParsedPing = null;
    try { parsed = EJSON.parse(text) as ParsedPing; } catch { /* non-EJSON body */ }
    if (!res.ok) return { host, reachable: true, ok: false, status: res.status, elapsedMs, error: parsed?.error || `bridge/tunnel HTTP ${res.status}: ${text.slice(0, 120)}` };
    if (!parsed || parsed.ok !== true) return { host, reachable: true, ok: false, status: res.status, elapsedMs, error: parsed?.error || `bridge returned ok:false: ${text.slice(0, 120)}` };
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
