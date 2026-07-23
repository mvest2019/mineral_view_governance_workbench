#!/usr/bin/env node
// Migration CLI entry point.
//
// This phase supports DRY-RUN ONLY. It reads sources, validates, builds
// documents in memory, detects duplicates + missing references, and produces a
// report. It NEVER connects to MongoDB and NEVER writes anything.
//
// Usage:
//   node migration/cli.mjs --dry-run --all
//   node migration/cli.mjs --dry-run --collection employees --collection meetings
//   node migration/cli.mjs --help
//
// Flags:
//   --dry-run                 required in this phase (execution not implemented)
//   --collection <name>       add a collection (repeatable)
//   --all                     all supported collections
//   --out <file>              also write the JSON report to <file>
//   --quiet                   suppress progress lines
//   --help                    show help

import { MIGRATION_CONFIG } from './config.mjs';
import { runDryRun, resolveCollections, SUPPORTED } from './runner.mjs';
import { renderConsole, writeReportFile } from './lib/report.mjs';

function parseArgs(argv) {
  const opts = { dryRun: false, all: false, quiet: false, collections: [], out: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--all') opts.all = true;
    else if (a === '--quiet') opts.quiet = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--collection') { opts.collections.push(argv[i + 1]); i += 1; }
    else if (a.startsWith('--collection=')) opts.collections.push(a.split('=')[1]);
    else if (a === '--out') { opts.out = argv[i + 1]; i += 1; }
    else if (a.startsWith('--out=')) opts.out = a.split('=')[1];
    else console.warn(`(!) ignoring unknown argument: ${a}`);
  }
  return opts;
}

function printHelp() {
  console.log(`
Governance Workbench — migration framework (DRY-RUN ONLY)

Reads GitHub markdown + SQLite + config, validates, and reports what WOULD be
migrated. Writes nothing to MongoDB. Execution (inserts) is not implemented.

Usage:
  node migration/cli.mjs --dry-run --all
  node migration/cli.mjs --dry-run --collection <name> [--collection <name> ...]

Supported collections:
  ${SUPPORTED.join(', ')}

Flags:
  --dry-run              required (only mode available in this phase)
  --collection <name>    add a collection (repeatable)
  --all                  run all supported collections
  --out <file>           also write the JSON report to <file>
  --quiet                suppress progress lines
  --help                 show this help
`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { printHelp(); return; }

  const collections = resolveCollections(opts.collections, opts.all);
  if (!opts.dryRun) {
    console.error('✖ Refusing to run: only --dry-run is supported in this phase.');
    console.error('  The migration framework NEVER writes to MongoDB. Add --dry-run.');
    process.exitCode = 1;
    return;
  }
  if (collections.length === 0) {
    console.error('✖ No collections selected. Use --all or --collection <name>. See --help.');
    process.exitCode = 1;
    return;
  }
  const unknown = collections.filter((c) => !SUPPORTED.includes(c));
  if (unknown.length) {
    console.error(`✖ Unknown collection(s): ${unknown.join(', ')}`);
    console.error(`  Supported: ${SUPPORTED.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const runReport = await runDryRun(collections, opts);

  console.log(renderConsole(runReport));

  // Persist the JSON report (default under migration/reports/, git-ignored).
  const defaultPath = writeReportFile(runReport, MIGRATION_CONFIG.paths.reports);
  console.log(`Report written: ${defaultPath}`);
  if (opts.out) {
    const { writeFileSync } = await import('fs');
    try { writeFileSync(opts.out, JSON.stringify(runReport, null, 2), 'utf-8'); console.log(`Report also written: ${opts.out}`); }
    catch (e) { console.warn(`(!) could not write --out file: ${e && e.message ? e.message : e}`); }
  }

  console.log('\n✔ Dry-run complete. Documents inserted: 0 (nothing was written to MongoDB).');
}

main().catch((err) => {
  console.error(`✖ ${err && err.message ? err.message : err}`);
  process.exitCode = 1;
});
