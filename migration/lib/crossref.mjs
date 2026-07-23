// ObjectId cross-reference generator + reference index.
//
// - Mints in-memory ObjectIds for a (collection, naturalKey) pair so the dry-run
//   can estimate document ids and wire references deterministically per run.
//   Creating an ObjectId is a pure BSON operation — it does NOT connect to
//   MongoDB. MongoClient is never imported here.
// - Maintains a "known keys" index (memberKeys, questionCodes, repoNames) so
//   mappers can detect MISSING references without touching the database.

import { ObjectId } from 'mongodb';

export function createCrossRef() {
  const idMap = new Map();   // `${collection}:${key}` -> ObjectId
  const known = new Map();   // collection -> Set(keys)

  function slot(collection) {
    if (!known.has(collection)) known.set(collection, new Set());
    return known.get(collection);
  }

  return {
    /** Get (or mint) an ObjectId for a natural key. In-memory only. */
    objectIdFor(collection, key) {
      const k = `${collection}:${key}`;
      if (!idMap.has(k)) idMap.set(k, new ObjectId());
      return idMap.get(k);
    },

    /** Register that a natural key exists in a collection (for ref checks). */
    register(collection, key) {
      if (key == null || key === '') return;
      slot(collection).add(String(key));
    },

    /** Register many keys at once. */
    registerAll(collection, keys) {
      for (const k of keys) this.register(collection, k);
    },

    /** Does a referenced key exist? Missing => reference would dangle. */
    has(collection, key) {
      return slot(collection).has(String(key));
    },

    knownCount(collection) { return slot(collection).size; },
  };
}
