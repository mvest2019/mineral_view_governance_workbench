#!/usr/bin/env node
// Migration CLI entry point.
//
// Modes:
//   --dry-run   (default)  read + validate + report; NEVER connects to MongoDB.
//   --execute              write documents into GovernanceDB (idempotent upserts);
//                          requires --confirm and MONGODB_URI.
//   --rollback <runId>     delete all documents tagged with that migration runId
//                          from GovernanceDB; requires --confirm and MONGODB_URI.
//
// The application is NOT switched to MongoDB by this tool; it is a standalone,
// isolated migration utility. Only GovernanceDB is ever referenced.
//
// Usage:
//   node migration/cli.mjs --dry-run --all
//   node migration/cli.mjs --execute --all --confirm
//   node migration/cli.mjs --execute --collection employees --confirm
//   node migration/cli.mjs --rollback run-20260723-abcd12 --confirm
//   node migration/cli.mjs --help

import crypto from 'crypto';
import { MIGRATION_CONFIG } from './config.mjs';
import { runDryRun, resolveCollections, SUPPORTED, EXECUTION_ORDER } from './runner.mjs';
import { runExecute } from './executor.mjs';
import { renderConsole, writeReportFile } from './lib/report.mjs';

function parseArgs(argv) {
  const opts = {
    mode: 'dry-run', all: false, quiet: false, confirm: false,
    collections: [], out: null, help: false, runId: null, rollbackRunId: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run') opts.mode = 'dry-run';
    else if (a === '--execute') opts.mode = 'execute';
    else if (a === '--verify') opts.mode = 'verify';
    else if (a === '--rollback') { opts.mode = 'rollback'; opts.rollbackRunId = argv[i + 1]; i += 1; }
    else if (a.startsWith('--rollback=')) { opts.mode = 'rollback'; opts.rollbackRunId = a.split('=')[1]; }
    else if (a === '--all') opts.all = true;
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--confirm') opts.confirm = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--collection') { opts.collections.push(argv[i + 1]); i += 1; }
    else if (a.startsWith('--collection=')) opts.collections.push(a.split('=')[1]);
    else if (a === '--run-id') { opts.runId = argv[i + 1]; i += 1; }
    else if (a.startsWith('--run-id=')) opts.runId = a.split('=')[1];
    else if (a === '--out') { opts.out = argv[i + 1]; i += 1; }
    else if (a.startsWith('--out=')) opts.out = a.split('=')[1];
    else console.warn(`(!) ignoring unknown argument: ${a}`);
  }
  return opts;
}

function generateRunId() {
  const d = new Date();
  const stamp = d.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return `run-${stamp}-${crypto.randomBytes(3).toString('hex')}`;
}

function printHelp() {
  console.log(`
Governance Workbench — migration CLI

Modes:
  --dry-run             read + validate + report; writes nothing (default)
  --execute             insert into GovernanceDB (idempotent); needs --confirm + MONGODB_URI
  --rollback <runId>    delete all docs tagged with that runId; needs --confirm + MONGODB_URI

Collections: ${SUPPORTED.join(', ')}

Flags:
  --collection <name>   add a collection (repeatable)      --all    all supported
  --confirm             required for --execute / --rollback (safety)
  --run-id <id>         use a specific runId (else generated)
  --out <file>          also write the JSON report (dry-run)
  --quiet               suppress progress lines            --help   this help
`);
}

async function doDryRun(opts, collections) {
  const runReport = await runDryRun(collections, { dryRun: true, quiet: opts.quiet });
  console.log(renderConsole(runReport));
  const p = writeReportFile(runReport, MIGRATION_CONFIG.paths.reports);
  console.log(`Report written: ${p}`);
  console.log('\n✔ Dry-run complete. Documents inserted: 0 (nothing was written to MongoDB).');
}

async function doExecute(opts, collections) {
  if (!opts.confirm) {
    console.error('✖ Refusing to execute without --confirm. --execute WRITES documents to GovernanceDB.');
    process.exitCode = 1; return;
  }
  const { createWriter } = await import('./lib/mongoWriter.mjs');
  const runId = opts.runId || generateRunId();
  console.log(`▶ EXECUTE  runId=${runId}  collections=${collections.join(', ')}`);
  let writer;
  try {
    writer = await createWriter();
    console.log(`  connected to database: ${writer.dbName}`);
    const summary = await runExecute(collections, { runId, quiet: opts.quiet }, writer);
    console.log('\n──────────── EXECUTION SUMMARY ────────────');
    console.log(`  runId: ${summary.runId}  database: ${summary.database}`);
    console.log(`  documents inserted: ${summary.documentsInserted}  failed: ${summary.totalFailed}`);
    for (const c of summary.collections) console.log(`    ${JSON.stringify(c)}`);
    console.log(`\n  To roll back this run:\n    node migration/cli.mjs --rollback ${runId} --confirm`);
  } catch (err) {
    console.error(`✖ Execution failed: ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    if (writer) await writer.close();
  }
}

async function doVerify(opts, collections) {
  const { createWriter } = await import('./lib/mongoWriter.mjs');
  const { verifyCollection, renderVerify } = await import('./verify.mjs');
  const { writeReportFile } = await import('./lib/report.mjs');
  let writer;
  try {
    writer = await createWriter();
    let allOk = true;
    for (const collection of collections) {
      const report = await verifyCollection(collection, { runId: opts.runId }, writer);
      console.log(renderVerify(report));
      const p = writeReportFile(report, MIGRATION_CONFIG.paths.reports);
      console.log(`Verification report written: ${p}`);
      if (report.verdict !== 'VERIFIED') allOk = false;
    }
    if (!allOk) process.exitCode = 2;
  } catch (err) {
    console.error(`✖ Verification failed: ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    if (writer) await writer.close();
  }
}

async function doRollback(opts) {
  if (!opts.rollbackRunId) { console.error('✖ --rollback requires a runId.'); process.exitCode = 1; return; }
  if (!opts.confirm) {
    console.error('✖ Refusing to roll back without --confirm.');
    process.exitCode = 1; return;
  }
  const { createWriter } = await import('./lib/mongoWriter.mjs');
  let writer;
  try {
    writer = await createWriter();
    console.log(`▶ ROLLBACK runId=${opts.rollbackRunId}  database=${writer.dbName}`);
    const deleted = await writer.rollbackRun(opts.rollbackRunId, EXECUTION_ORDER);
    let total = 0;
    for (const [c, n] of Object.entries(deleted)) { console.log(`    ${c}: deleted ${n}`); total += n; }
    console.log(`✔ Rollback complete. Total documents deleted: ${total}`);
  } catch (err) {
    console.error(`✖ Rollback failed: ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    if (writer) await writer.close();
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { printHelp(); return; }

  if (opts.mode === 'rollback') { await doRollback(opts); return; }

  const collections = resolveCollections(opts.collections, opts.all);
  if (collections.length === 0) {
    console.error('✖ No collections selected. Use --all or --collection <name>. See --help.');
    process.exitCode = 1; return;
  }
  const unknown = collections.filter((c) => !SUPPORTED.includes(c));
  if (unknown.length) {
    console.error(`✖ Unknown collection(s): ${unknown.join(', ')}. Supported: ${SUPPORTED.join(', ')}`);
    process.exitCode = 1; return;
  }

  if (opts.mode === 'execute') await doExecute(opts, collections);
  else if (opts.mode === 'verify') await doVerify(opts, collections);
  else await doDryRun(opts, collections);
}

main().catch((err) => {
  console.error(`✖ ${err && err.message ? err.message : err}`);
  process.exitCode = 1;
});
