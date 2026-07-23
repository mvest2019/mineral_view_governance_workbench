// Post-migration verification (read-only). Run after --execute to confirm a
// collection migrated correctly. Connects to GovernanceDB read-only (via the
// writer's read helpers), never writes. Produces a reconciliation report:
//   1) inserted document count vs source
//   2) indexes present vs expected
//   3) $jsonSchema validator present
//   4) migrated documents field-compared against the source
//
// Only GovernanceDB is referenced.

import { MAPPERS, buildReferenceIndex } from './runner.mjs';
import { createCrossRef } from './lib/crossref.mjs';

// Expected index names per collection (from src/db/indexes/*).
const EXPECTED_INDEXES = {
  employees: [
    'ux_employees_company_memberKey',
    'ix_employees_company_departmentKeys',
    'ix_employees_company_status',
    'tx_employees_company_fulltext',
  ],
};

// Natural key + fields to compare, per collection.
const COMPARE = {
  employees: {
    key: 'memberKey',
    fields: ['fullName', 'title', 'status', 'departmentKeys', 'roleKeys', 'aliases'],
  },
};

function normalizeForCompare(v) {
  if (Array.isArray(v)) return [...v].map(String).sort().join('|');
  return v === undefined || v === null ? '' : String(v);
}

/** Collect the source candidate docs a mapper would produce (no DB, no writes). */
async function collectSource(collection) {
  const crossref = createCrossRef();
  const titleIndex = new Map();
  buildReferenceIndex(crossref, titleIndex);
  const out = [];
  const sink = (coll, candidate) => { if (coll === collection) out.push(candidate); };
  const report = await MAPPERS[collection]({ crossref, titleIndex, sink });
  return { docs: out, report };
}

/**
 * Verify a migrated collection against its source. `writer` is a connected
 * (read-capable) mongoWriter. Returns a reconciliation report object.
 */
export async function verifyCollection(collection, options, writer) {
  const cmp = COMPARE[collection];
  if (!cmp) throw new Error(`No verification profile for collection "${collection}".`);

  const { docs: source } = await collectSource(collection);
  const runFilter = options.runId ? { 'metadata.migration.runId': options.runId } : {};

  // 1) counts
  const dbTotal = await writer.count(collection, {});
  const dbForRun = options.runId ? await writer.count(collection, runFilter) : dbTotal;

  // 2) indexes
  const indexes = await writer.listIndexes(collection);
  const indexNames = indexes.map((i) => i.name);
  const expected = EXPECTED_INDEXES[collection] || [];
  const missingIndexes = expected.filter((n) => !indexNames.includes(n));

  // 3) validator
  const info = await writer.getCollectionInfo(collection);
  const validator = info && info.options && info.options.validator;
  const hasJsonSchema = Boolean(validator && validator.$jsonSchema);
  const validationLevel = info && info.options ? info.options.validationLevel : undefined;
  const validationAction = info && info.options ? info.options.validationAction : undefined;

  // 4) source-vs-DB field comparison (by natural key)
  const dbDocs = await writer.find(collection, runFilter);
  const dbByKey = new Map(dbDocs.map((d) => [d[cmp.key], d]));
  const srcByKey = new Map(source.map((d) => [d[cmp.key], d]));

  const missingInDb = [];
  const extraInDb = [];
  const mismatches = [];
  for (const [key, sdoc] of srcByKey) {
    const ddoc = dbByKey.get(key);
    if (!ddoc) { missingInDb.push(key); continue; }
    for (const f of cmp.fields) {
      if (normalizeForCompare(sdoc[f]) !== normalizeForCompare(ddoc[f])) {
        mismatches.push({ key, field: f, source: sdoc[f], db: ddoc[f] });
      }
    }
  }
  for (const key of dbByKey.keys()) if (!srcByKey.has(key)) extraInDb.push(key);

  const ok = missingIndexes.length === 0
    && hasJsonSchema
    && missingInDb.length === 0
    && mismatches.length === 0
    && dbForRun === source.length;

  return {
    collection,
    generatedAt: new Date().toISOString(),
    database: writer.dbName,
    runId: options.runId || null,
    counts: { sourceValid: source.length, dbTotal, dbForRun, match: dbForRun === source.length },
    indexes: { expected, present: indexNames, missing: missingIndexes, ok: missingIndexes.length === 0 },
    validator: { hasJsonSchema, validationLevel, validationAction, ok: hasJsonSchema },
    documentComparison: {
      compared: srcByKey.size,
      missingInDb: missingInDb.length,
      extraInDb: extraInDb.length,
      mismatches: mismatches.length,
      details: { missingInDb, extraInDb, mismatches: mismatches.slice(0, 25) },
      ok: missingInDb.length === 0 && mismatches.length === 0,
    },
    verdict: ok ? 'VERIFIED' : 'DISCREPANCIES_FOUND',
  };
}

export function renderVerify(report) {
  const L = [];
  L.push('');
  L.push('══════════════════════════════════════════════════════════════');
  L.push(`  MIGRATION VERIFICATION — ${report.collection}`);
  L.push(`  database: ${report.database}  runId: ${report.runId || '(all)'}`);
  L.push('══════════════════════════════════════════════════════════════');
  L.push(`  1) COUNT      source ${report.counts.sourceValid} · db(run) ${report.counts.dbForRun} · db(total) ${report.counts.dbTotal} → ${report.counts.match ? 'MATCH ✔' : 'MISMATCH ✖'}`);
  L.push(`  2) INDEXES    ${report.indexes.ok ? 'all present ✔' : `MISSING: ${report.indexes.missing.join(', ')} ✖`}`);
  L.push(`                present: ${report.indexes.present.join(', ')}`);
  L.push(`  3) VALIDATOR  ${report.validator.ok ? `$jsonSchema present ✔ (${report.validator.validationLevel}/${report.validator.validationAction})` : 'NO $jsonSchema ✖'}`);
  L.push(`  4) DOCUMENTS  compared ${report.documentComparison.compared} · missingInDb ${report.documentComparison.missingInDb} · extraInDb ${report.documentComparison.extraInDb} · mismatches ${report.documentComparison.mismatches} → ${report.documentComparison.ok ? 'MATCH ✔' : 'DISCREPANCY ✖'}`);
  for (const m of report.documentComparison.details.mismatches.slice(0, 5)) {
    L.push(`      ✖ ${m.key}.${m.field}: source=${JSON.stringify(m.source)} db=${JSON.stringify(m.db)}`);
  }
  L.push('──────────────────────────────────────────────────────────────');
  L.push(`  VERDICT: ${report.verdict}`);
  L.push('──────────────────────────────────────────────────────────────');
  L.push('');
  return L.join('\n');
}
