#!/usr/bin/env node
// Step-by-step, READ-ONLY diagnostic for /api/employees.
// Connects to GovernanceDB ONLY and prints exactly why the employees query
// returns what it returns (empty collection? wrong companyKey/status? wrong db?).
// Writes nothing. Run: npm run diagnose:employees
import { MongoClient } from 'mongodb';

const DEFAULT_DB = 'GovernanceDB';
const COLLECTION = 'employees';
const COMPANY = 'MView';

const step = (n, msg) => console.log(`\n[STEP ${n}] ${msg}`);

async function main() {
  const uri = (process.env.MONGODB_URI || '').trim();
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB;

  step(1, 'Read environment');
  console.log('  MONGODB_URI set :', Boolean(uri));
  console.log('  MONGODB_DB_NAME :', dbName);
  console.log('  URI host        :', (uri.match(/@([^/]+)/) || [])[1] || '(srv / unknown)');
  if (!uri) { console.error('  ✖ MONGODB_URI is not set. Put it in .env.local and retry.'); process.exit(1); }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, appName: 'diagnose-employees' });
  try {
    step(2, 'Connect to MongoDB');
    await client.connect();
    console.log('  ✔ connected');

    const db = client.db(dbName);
    const col = db.collection(COLLECTION);
    step(3, `Target database="${dbName}" collection="${COLLECTION}"`);

    step(4, 'Collections present in this database');
    const colls = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort();
    console.log('  collections:', colls.join(', ') || '(none)');
    console.log('  employees exists:', colls.includes(COLLECTION));

    step(5, 'Total documents in employees');
    const total = await col.countDocuments({});
    console.log('  total documents:', total);

    step(6, 'Distinct values actually stored');
    console.log('  companyKey :', JSON.stringify(await col.distinct('companyKey')));
    console.log('  status     :', JSON.stringify(await col.distinct('status')));
    console.log('  isDeleted  :', JSON.stringify(await col.distinct('isDeleted')));

    step(7, 'Count per filter component');
    console.log(`  { companyKey: "${COMPANY}" } ..`, await col.countDocuments({ companyKey: COMPANY }));
    console.log('  { status: "ACTIVE" } .........', await col.countDocuments({ status: 'ACTIVE' }));
    console.log('  { isDeleted: false } .........', await col.countDocuments({ isDeleted: false }));

    step(8, 'The EXACT query /api/employees runs');
    const filter = { companyKey: COMPANY, status: 'ACTIVE', isDeleted: false };
    console.log('  filter:', JSON.stringify(filter));
    const matched = await col.countDocuments(filter);
    console.log('  matched documents:', matched);

    step(9, 'Sample matched documents (up to 5)');
    const sample = await col.find(filter).limit(5)
      .project({ _id: 0, memberKey: 1, fullName: 1, companyKey: 1, status: 1, isDeleted: 1 }).toArray();
    console.log(JSON.stringify(sample, null, 2));

    step(10, 'DIAGNOSIS');
    if (total === 0) {
      console.log(`  → The employees collection is EMPTY in "${dbName}" on host ${(uri.match(/@([^/]+)/) || [])[1]}.`);
      console.log('    Import employees.json / run the seed INTO THIS SAME database & cluster.');
      console.log('    (A common trap: the data was imported into a DIFFERENT cluster/db than this URI points to.)');
    } else if (matched === 0) {
      console.log('  → Documents exist but NONE match the query. Compare STEP 6 values:');
      console.log('    companyKey must include "MView", status must include "ACTIVE", isDeleted must include false.');
      console.log('    A mismatch there (or wrong database) is the cause.');
    } else {
      console.log(`  → ${matched} employees match. /api/employees WILL return ${matched} from THIS database.`);
      console.log('    If the app still fails, the problem is the HTTP bridge path (Vercel), not the data —');
      console.log('    check /api/health/mongo for bridgeReachable / mongoOk.');
    }
  } catch (err) {
    console.error('\n✖ FAILED:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
main();
