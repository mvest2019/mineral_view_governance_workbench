// MongoDB-over-HTTPS bridge client.
//
// When MONGO_BRIDGE_URL is set, the app never opens a MongoDB connection
// itself. Instead, every operation the repositories/services perform is sent
// as an authenticated HTTPS request to the remote-claude-bridge running on the
// Windows server (the SAME bridge, token, and ngrok tunnel already used for
// Claude CLI execution), which executes it against MongoDB locally and returns
// the result. The connection string lives only on that server.
//
// This module implements exactly the subset of the driver's Db/Collection API
// that the application uses (see src/db/connection.ts, src/db/provision.ts,
// src/db/health.ts and src/repositories/**), so the repositories work
// unchanged in either mode. ObjectId and Date values survive the round-trip
// via EJSON (relaxed mode: `{$oid}` / `{$date}` wrappers, plain numbers).
//
// Configuration (Vercel env vars):
//   MONGO_BRIDGE_URL       base URL of the bridge — the same HTTPS ngrok URL
//                          as REMOTE_CLAUDE_URL (required to enable this mode)
//   MONGO_BRIDGE_TOKEN     bearer token; defaults to REMOTE_CLAUDE_TOKEN since
//                          it is the same bridge secret (CLAUDE_BRIDGE_TOKEN)
//   MONGO_BRIDGE_TIMEOUT_MS  per-operation HTTP timeout (default 30000)
//
// With MONGO_BRIDGE_URL unset, nothing in this module runs and the app uses
// the direct MongoClient exactly as before (src/db/client.ts).

import { BSON, type Document, type Sort } from 'mongodb';

const { EJSON } = BSON;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export function getMongoBridgeUrl(): string {
  return String(process.env.MONGO_BRIDGE_URL || '').trim().replace(/\/+$/, '');
}

/** True when MongoDB access is delegated to the remote bridge. */
export function isMongoBridgeConfigured(): boolean {
  return Boolean(getMongoBridgeUrl());
}

function getMongoBridgeToken(): string {
  // Same bridge, same shared secret: fall back to the Claude bridge token.
  return String(process.env.MONGO_BRIDGE_TOKEN || process.env.REMOTE_CLAUDE_TOKEN || '').trim();
}

function getOpTimeoutMs(): number {
  const n = Number.parseInt(String(process.env.MONGO_BRIDGE_TIMEOUT_MS || ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 30_000;
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

/** Error thrown when a bridge operation fails (network, auth, or MongoDB). */
export class MongoBridgeError extends Error {
  /** MongoDB server error code (e.g. 11000 for duplicate key), when available. */
  code?: string | number;
  /** HTTP status of the bridge response, when one was received. */
  status?: number;

  constructor(message: string, opts?: { code?: string | number; status?: number }) {
    super(message);
    this.name = 'MongoBridgeError';
    this.code = opts?.code;
    this.status = opts?.status;
  }
}

/** Remove keys whose value is `undefined` so they are not serialized at all. */
function compact(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/**
 * Execute one whitelisted MongoDB operation on the remote bridge and return
 * its EJSON-decoded result. Never falls back to a direct connection.
 */
export async function mongoBridgeOp<T = unknown>(
  op: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const base = getMongoBridgeUrl();
  if (!base) throw new MongoBridgeError('MONGO_BRIDGE_URL is not set.');

  const body = EJSON.stringify({ op, ...compact(payload) }, undefined, undefined, { relaxed: true });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), getOpTimeoutMs());

  let response: Response;
  try {
    response = await fetch(`${base}/mongo/op`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getMongoBridgeToken()}`,
      },
      body,
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (err) {
    const reason = err instanceof Error && err.name === 'AbortError'
      ? `timed out after ${getOpTimeoutMs()}ms`
      : err instanceof Error ? err.message : String(err);
    throw new MongoBridgeError(`MongoDB bridge unreachable (op ${op}): ${reason}`);
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let parsed: { ok?: boolean; result?: unknown; error_message?: string; error_code?: string | number };
  try {
    parsed = EJSON.parse(text, { relaxed: true }) as typeof parsed;
  } catch {
    throw new MongoBridgeError(
      `MongoDB bridge returned a non-JSON response (op ${op}, HTTP ${response.status}).`,
      { status: response.status },
    );
  }

  if (!response.ok || !parsed || parsed.ok !== true) {
    throw new MongoBridgeError(
      parsed?.error_message || `MongoDB bridge request failed (op ${op}, HTTP ${response.status}).`,
      { code: parsed?.error_code, status: response.status },
    );
  }
  return parsed.result as T;
}

/** Ping MongoDB through the bridge; returns the remote database name. */
export async function pingMongoBridge(): Promise<{ ok: number; dbName: string }> {
  return mongoBridgeOp<{ ok: number; dbName: string }>('ping');
}

// ---------------------------------------------------------------------------
// Driver-shaped shim (the subset of Db/Collection the app uses)
// ---------------------------------------------------------------------------

interface FindOptionsShape {
  projection?: Document;
  sort?: Sort;
  limit?: number;
  skip?: number;
}

class BridgeFindCursor<T = Document> {
  private readonly options: FindOptionsShape;

  constructor(
    private readonly collectionName: string,
    private readonly filter: Document,
    options?: FindOptionsShape,
  ) {
    this.options = { ...(options || {}) };
  }

  sort(sort: Sort): this {
    this.options.sort = sort;
    return this;
  }

  limit(limit: number): this {
    this.options.limit = limit;
    return this;
  }

  skip(skip: number): this {
    this.options.skip = skip;
    return this;
  }

  project(projection: Document): this {
    this.options.projection = projection;
    return this;
  }

  async toArray(): Promise<T[]> {
    return mongoBridgeOp<T[]>('find', {
      collection: this.collectionName,
      filter: this.filter,
      options: compact(this.options as Record<string, unknown>),
    });
  }
}

class BridgeAggregationCursor<T = Document> {
  constructor(
    private readonly collectionName: string,
    private readonly pipeline: Document[],
  ) {}

  async toArray(): Promise<T[]> {
    return mongoBridgeOp<T[]>('aggregate', {
      collection: this.collectionName,
      pipeline: this.pipeline,
    });
  }
}

class BridgeListCollectionsCursor {
  constructor(
    private readonly filter: Document,
    private readonly nameOnly: boolean,
  ) {}

  async toArray(): Promise<Array<{ name: string; type?: string }>> {
    return mongoBridgeOp<Array<{ name: string; type?: string }>>('listCollections', {
      filter: this.filter,
      options: { nameOnly: this.nameOnly },
    });
  }
}

export class BridgeCollection {
  constructor(readonly collectionName: string) {}

  async insertOne(document: Document): Promise<{ acknowledged: boolean; insertedId: unknown }> {
    return mongoBridgeOp('insertOne', { collection: this.collectionName, document });
  }

  async insertMany(
    documents: Document[],
    options?: { ordered?: boolean },
  ): Promise<{ acknowledged: boolean; insertedCount: number; insertedIds: Record<number, unknown> }> {
    return mongoBridgeOp('insertMany', { collection: this.collectionName, documents, options });
  }

  async findOne<T = Document>(filter: Document = {}, options?: { projection?: Document; sort?: Sort }): Promise<T | null> {
    return mongoBridgeOp<T | null>('findOne', { collection: this.collectionName, filter, options });
  }

  find<T = Document>(filter: Document = {}, options?: FindOptionsShape): BridgeFindCursor<T> {
    return new BridgeFindCursor<T>(this.collectionName, filter, options);
  }

  async findOneAndUpdate<T = Document>(
    filter: Document,
    update: Document,
    options?: { projection?: Document; sort?: Sort; upsert?: boolean; returnDocument?: 'before' | 'after'; arrayFilters?: Document[] },
  ): Promise<T | null> {
    return mongoBridgeOp<T | null>('findOneAndUpdate', { collection: this.collectionName, filter, update, options });
  }

  async updateOne(
    filter: Document,
    update: Document,
    options?: { upsert?: boolean; arrayFilters?: Document[] },
  ): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number; upsertedCount: number; upsertedId: unknown }> {
    return mongoBridgeOp('updateOne', { collection: this.collectionName, filter, update, options });
  }

  async updateMany(
    filter: Document,
    update: Document,
    options?: { upsert?: boolean; arrayFilters?: Document[] },
  ): Promise<{ acknowledged: boolean; matchedCount: number; modifiedCount: number; upsertedCount: number; upsertedId: unknown }> {
    return mongoBridgeOp('updateMany', { collection: this.collectionName, filter, update, options });
  }

  async deleteOne(filter: Document): Promise<{ acknowledged: boolean; deletedCount: number }> {
    return mongoBridgeOp('deleteOne', { collection: this.collectionName, filter });
  }

  async deleteMany(filter: Document): Promise<{ acknowledged: boolean; deletedCount: number }> {
    return mongoBridgeOp('deleteMany', { collection: this.collectionName, filter });
  }

  async countDocuments(filter: Document = {}, options?: { limit?: number; skip?: number }): Promise<number> {
    return mongoBridgeOp<number>('countDocuments', { collection: this.collectionName, filter, options });
  }

  async estimatedDocumentCount(): Promise<number> {
    return mongoBridgeOp<number>('estimatedDocumentCount', { collection: this.collectionName });
  }

  async distinct(key: string, filter: Document = {}): Promise<unknown[]> {
    return mongoBridgeOp<unknown[]>('distinct', { collection: this.collectionName, key, filter });
  }

  aggregate<T = Document>(pipeline: Document[]): BridgeAggregationCursor<T> {
    return new BridgeAggregationCursor<T>(this.collectionName, pipeline);
  }

  async createIndexes(indexes: Document[]): Promise<string[]> {
    return mongoBridgeOp<string[]>('createIndexes', { collection: this.collectionName, indexes });
  }
}

export class BridgeDb {
  /** Informational only — the real database name is fixed on the bridge. */
  readonly databaseName = '(remote via mongo bridge)';

  collection(name: string): BridgeCollection {
    return new BridgeCollection(name);
  }

  listCollections(filter: Document = {}, options?: { nameOnly?: boolean }): BridgeListCollectionsCursor {
    return new BridgeListCollectionsCursor(filter, Boolean(options?.nameOnly));
  }

  async createCollection(
    name: string,
    options?: { validator?: Document; validationLevel?: string; validationAction?: string },
  ): Promise<BridgeCollection> {
    await mongoBridgeOp('createCollection', { name, options });
    return new BridgeCollection(name);
  }

  async command(command: Document): Promise<Document> {
    return mongoBridgeOp<Document>('command', { command });
  }
}

let cachedBridgeDb: BridgeDb | null = null;

/** Return the shared bridge-backed Db shim (stateless; safe to reuse). */
export function getBridgeDb(): BridgeDb {
  if (!cachedBridgeDb) cachedBridgeDb = new BridgeDb();
  return cachedBridgeDb;
}
