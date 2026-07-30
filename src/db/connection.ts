// GovernanceDB database handle.
//
// This is the single entry point the rest of the application should use to get
// a database handle. It ALWAYS returns the approved GovernanceDB database (from
// config), so feature code physically cannot reach into another database in the
// cluster (Decline_data_to_web, MViewNewCommunity, ProdMwestPortal, etc.).
//
// No collections are created here. In MongoDB a collection springs into
// existence only on first write; obtaining a Db handle or a Collection accessor
// does nothing on the server.

import type { Db, Collection, Document } from 'mongodb';
import { getMongoClient } from '@/src/db/client';
import { getMongoEnvConfig } from '@/src/config/env';
import { httpBridgeEnabled, bridgeGetCollection, bridgeGetDb } from '@/src/db/http_bridge';

/** Return the connected GovernanceDB database handle. */
export async function getDb(): Promise<Db> {
  // When the HTTP bridge is configured, all MongoDB access is forwarded to the
  // remote-claude-bridge (only that server connects to MongoDB). The app never
  // opens a direct connection. Off by default → unchanged direct-driver behavior.
  if (httpBridgeEnabled()) return bridgeGetDb();
  const client = await getMongoClient();
  const { dbName } = getMongoEnvConfig();
  return client.db(dbName);
}

/**
 * Return a typed collection accessor from GovernanceDB.
 *
 * NOTE: calling this does NOT create the collection — MongoDB creates it lazily
 * on the first insert. During Phase 1 nothing writes, so no collection is
 * created. Concrete collection names will come from `src/constants/collections`
 * as V1 collections are implemented in later phases.
 */
export async function getCollection<TSchema extends Document = Document>(
  name: string,
): Promise<Collection<TSchema>> {
  // HTTP bridge mode: forward operations to the remote-claude-bridge instead of
  // opening a direct connection. Off by default → unchanged direct-driver path.
  const bridge = httpBridgeEnabled();
  console.log(`[TRACE][connection] getCollection('${name}') httpBridgeEnabled=${bridge} path=${bridge ? 'HTTP_BRIDGE' : 'DIRECT_DRIVER'}`); // TEMP TRACE
  if (bridge) return bridgeGetCollection<TSchema>(name);
  const db = await getDb();
  return db.collection<TSchema>(name);
}
