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

// The canonical variable is MONGODB_BRIDGE_URL. `MONGO_BRIDGE_URL` (no "DB") is
// accepted as an alias to guard against the easy naming slip that otherwise
// silently disables bridge mode and falls back to the direct driver.
function rawBridgeUrl(): string {
  return (process.env.MONGODB_BRIDGE_URL || process.env.MONGO_BRIDGE_URL || '').trim();
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
  // Reuse the Claude bridge token by default; allow a dedicated one if desired.
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
  const timer = setTimeout(() => controller.abort(), bridgeTimeoutMs());
  const token = bridgeToken();
  let res: Response;
  try {
    res = await fetch(bridgeUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: EJSON.stringify(payload as unknown as Document, { relaxed: false }),
      signal: controller.signal,
      cache: 'no-store',
    });
  } catch (err) {
    throw new Error(`MongoDB bridge request failed: ${(err as Error).message}`);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let parsed: { ok?: boolean; result?: unknown; error?: string; errorMeta?: Record<string, unknown> };
  try {
    parsed = EJSON.parse(text) as typeof parsed;
  } catch {
    throw new Error(`MongoDB bridge returned non-EJSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok || !parsed || parsed.ok !== true) {
    const err = new Error(parsed?.error || `MongoDB bridge error (HTTP ${res.status})`);
    // Re-attach the driver error metadata (name/code/errInfo) so existing route
    // error handling (e.g. task_tracker) keeps surfacing the real Mongo error.
    if (parsed?.errorMeta) Object.assign(err, parsed.errorMeta);
    throw err;
  }
  return parsed.result;
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
