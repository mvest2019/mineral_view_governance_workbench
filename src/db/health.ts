// Connection health-check utilities.
//
// These are READ-ONLY diagnostics: they ping the server and list existing
// collections in GovernanceDB. They create nothing and write nothing, so they
// are safe to run against staging without side effects. Intended for a future
// health endpoint, deployment smoke tests, and the standalone verification
// script (scripts/mongo-healthcheck.mjs).

import { getMongoClient } from '@/src/db/client';
import { getDb } from '@/src/db/connection';
import { getMongoEnvConfig, isMongoConfigured } from '@/src/config/env';

export interface MongoHealth {
  ok: boolean;
  configured: boolean;
  dbName: string | null;
  /** Round-trip latency of the ping command, in milliseconds. */
  pingMs: number | null;
  /** Names of collections that already exist in GovernanceDB (read-only). */
  collections: string[];
  /** Populated when ok === false. */
  error?: string;
}

/**
 * Ping GovernanceDB and report connectivity. Never throws — returns a structured
 * result so callers (health endpoints, scripts) can branch on `ok`.
 */
export async function checkMongoHealth(): Promise<MongoHealth> {
  if (!isMongoConfigured()) {
    return {
      ok: false,
      configured: false,
      dbName: null,
      pingMs: null,
      collections: [],
      error: 'MONGODB_URI is not set.',
    };
  }

  const { dbName } = getMongoEnvConfig();
  const startedAt = Date.now();
  try {
    // Await the shared client (establishes the connection once, then reuses it).
    await getMongoClient();
    const db = await getDb();
    // `ping` is the lightest possible command and requires no privileges.
    await db.command({ ping: 1 });
    const pingMs = Date.now() - startedAt;

    // Read-only: lists collections that already exist. Creates nothing.
    const collections = (await db.listCollections({}, { nameOnly: true }).toArray())
      .map((c) => c.name)
      .sort();

    return { ok: true, configured: true, dbName, pingMs, collections };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      dbName,
      pingMs: null,
      collections: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
