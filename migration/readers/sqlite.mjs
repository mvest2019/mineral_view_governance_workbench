// SQLite readers. Open governance.db READ-ONLY and read tables. The DB is
// ephemeral (/tmp on Vercel) and is frequently ABSENT locally; every function
// degrades gracefully (returns an "unavailable" marker), never throws, and never
// writes. better-sqlite3 is already a project dependency.

import { MIGRATION_CONFIG } from '../config.mjs';
import { exists } from '../lib/utils.mjs';

let _db = null;
let _tried = false;

/** Returns the read-only DB handle, or null if unavailable. Never throws. */
export async function openSqlite() {
  if (_tried) return _db;
  _tried = true;
  const file = MIGRATION_CONFIG.paths.sqlite;
  if (!exists(file)) { _db = null; return null; }
  try {
    const mod = await import('better-sqlite3');
    const Database = mod.default || mod;
    _db = new Database(file, { readonly: true, fileMustExist: true });
    return _db;
  } catch {
    _db = null;
    return null;
  }
}

/** True if the SQLite source is present and openable. */
export async function sqliteAvailable() {
  return (await openSqlite()) !== null;
}

/** Read all rows of a table (read-only). Returns [] if DB/table unavailable. */
export async function readTable(table) {
  const db = await openSqlite();
  if (!db) return [];
  try {
    // Identifier is from our own fixed table list, not user input.
    return db.prepare(`SELECT * FROM ${table}`).all();
  } catch {
    return [];
  }
}

/** Close the handle (used by tooling / tests). */
export function closeSqlite() {
  try { if (_db) _db.close(); } catch { /* ignore */ }
  _db = null; _tried = false;
}
