#!/usr/bin/env node
// Standalone MongoDB connection health check for the MView-Staging GovernanceDB.
//
// Purpose: verify Phase 1 connectivity WITHOUT starting the Next.js app and
// WITHOUT touching the application code path. It is a pure diagnostic:
//   - reads MONGODB_URI / MONGODB_DB_NAME from the environment
//   - connects, pings, and lists existing collections in GovernanceDB
//   - creates nothing and writes nothing
//
// It is written in plain ESM (.mjs) so it runs with `node` on Node 22 with no
// build step or extra tooling. It deliberately does NOT import the TypeScript
// src/ layer (which needs bundling); it re-implements the minimal connect+ping
// so it can run directly. The app itself uses src/db/health.ts.
//
// Usage:
//   MONGODB_URI="mongodb+srv://..." npm run mongo:health
//   (or place MONGODB_URI in .env.local and load it into your shell)

import { MongoClient } from 'mongodb';

const DEFAULT_DB_NAME = 'GovernanceDB';

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;

  if (!uri) {
    console.error('✖ MONGODB_URI is not set.');
    console.error('  Set it to the MView-Staging connection string and retry.');
    console.error('  Example: MONGODB_URI="mongodb+srv://user:pass@host/" npm run mongo:health');
    process.exit(1);
  }

  console.log(`→ Connecting to MongoDB (database: ${dbName}) ...`);
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    appName: 'governance-workbench-healthcheck',
  });

  const startedAt = Date.now();
  try {
    await client.connect();
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    const pingMs = Date.now() - startedAt;

    const collections = (await db.listCollections({}, { nameOnly: true }).toArray())
      .map((c) => c.name)
      .sort();

    console.log(`✔ Connected and pinged GovernanceDB in ${pingMs} ms.`);
    console.log(
      collections.length
        ? `  Existing collections (${collections.length}): ${collections.join(', ')}`
        : '  No collections exist yet in GovernanceDB (expected for Phase 1).',
    );
    console.log('  No collections were created and no data was written.');
  } catch (err) {
    console.error('✖ MongoDB health check FAILED.');
    console.error(`  ${err && err.message ? err.message : err}`);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
