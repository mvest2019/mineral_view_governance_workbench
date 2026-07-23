// Duplicate detection. Tracks natural keys / dedupe keys within a collection so
// the dry-run reports how many records would collide. Pure in-memory. No I/O.

export function createDuplicateTracker() {
  const seen = new Map(); // key -> first occurrence index/ref

  return {
    /**
     * Check a key. Returns { duplicate: boolean, firstRef }. Records the key on
     * first sight. `key` is the natural or dedupe key (e.g. memberKey,
     * questionCode, normalizedTitle, checksum).
     */
    check(key, ref) {
      if (key == null || key === '') return { duplicate: false };
      if (seen.has(key)) return { duplicate: true, firstRef: seen.get(key) };
      seen.set(key, ref ?? key);
      return { duplicate: false };
    },
    size() { return seen.size; },
    keys() { return [...seen.keys()]; },
  };
}
