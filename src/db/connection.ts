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

/** Return the connected GovernanceDB database handle. */
export async function getDb(): Promise<Db> {
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
  const db = await getDb();
  return db.collection<TSchema>(name);
}
