#!/usr/bin/env node
/*
 * MongoDB HANDSHAKE diagnostic — confirms the EXACT stage the connection fails.
 *
 * Run this ON THE MACHINE THAT OPENS THE REAL MONGO CONNECTION (the Windows
 * bridge), using the SAME connection string the bridge uses (MONGO_BRIDGE_URI).
 * It is read-only: it connects, pings, and reads server/version info. It writes
 * nothing and creates nothing.
 *
 * It breaks the handshake into independent stages so the failure is unambiguous
 * instead of a generic "server selection timed out":
 *
 *   STEP 1  parse + mask the connection string (scheme, hosts, options)
 *   STEP 2  DNS: resolve the SRV + TXT records  (mongodb+srv only)
 *   STEP 3  TCP: open a raw socket to each host:port  (network / IP-allowlist)
 *   STEP 4  Driver: connect + ping + hello + buildInfo  (TLS / auth / topology)
 *   STEP 5  VERDICT: the single most likely cause, with the fix location
 *
 * The STEP 3 result is the key discriminator for MongoDB Atlas:
 *   • DNS ok but TCP times out  → this machine's public IP is NOT allowed by
 *     Atlas Network Access (or a firewall blocks outbound 27017). #1 cause.
 *   • TCP ok but driver fails   → TLS or authentication, NOT the network.
 *
 * Usage (on the bridge machine):
 *   set MONGO_BRIDGE_URI=mongodb+srv://user:pass@cluster.xxx.mongodb.net/
 *   node scripts/diagnose-handshake.mjs
 * or:  node scripts/diagnose-handshake.mjs --uri "mongodb+srv://..."
 * (env is preferred; --uri lands in shell history.)
 */
import net from 'node:net';
import dns from 'node:dns/promises';
import { MongoClient } from 'mongodb';

const DEFAULT_DB = 'GovernanceDB';
const step = (n, msg) => console.log(`\n[STEP ${n}] ${msg}`);
const ok = (msg) => console.log(`  ✔ ${msg}`);
const bad = (msg) => console.log(`  ✖ ${msg}`);
const info = (msg) => console.log(`  • ${msg}`);

function argUri() {
  const i = process.argv.indexOf('--uri');
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1].trim() : '';
}

function maskUri(uri) {
  return uri.replace(/\/\/([^:@/]+):([^@/]+)@/, (_m, u) => `//${u}:****@`);
}

// Parse a mongodb:// or mongodb+srv:// URI without exposing the password.
function parseUri(uri) {
  const srv = uri.startsWith('mongodb+srv://');
  const body = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const at = body.lastIndexOf('@');
  const creds = at >= 0 ? body.slice(0, at) : '';
  const rest = at >= 0 ? body.slice(at + 1) : body;
  const hasUser = creds.length > 0;
  const [hostPart, ...pathParts] = rest.split('/');
  const query = (pathParts.join('/').split('?')[1]) || '';
  const opts = Object.fromEntries(new URLSearchParams(query));
  const hosts = hostPart.split(',').map((h) => {
    const [host, port] = h.split(':');
    return { host, port: port ? Number(port) : (srv ? null : 27017) };
  });
  return { srv, hasUser, hosts, opts };
}

function tcpProbe(host, port, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = new net.Socket();
    let done = false;
    const finish = (result) => { if (done) return; done = true; try { socket.destroy(); } catch { /* */ } resolve({ ...result, ms: Date.now() - started }); };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish({ ok: true }));
    socket.once('timeout', () => finish({ ok: false, error: `TCP connect timed out after ${timeoutMs}ms` }));
    socket.once('error', (err) => finish({ ok: false, error: err.code || err.message }));
    socket.connect(port, host);
  });
}

function classify(err, tcpAllFailed, dnsFailed) {
  const msg = String(err && err.message ? err.message : err);
  const name = err && err.name ? err.name : '';
  const code = err && (err.code ?? err.codeName);
  if (dnsFailed) return 'DNS: the cluster hostname could not be resolved — wrong host in the connection string, or DNS is blocked on this machine.';
  if (name === 'MongoParseError') return `Connection string is malformed: ${msg}`;
  if (code === 18 || /authentication failed|bad auth|SCRAM|not authorized/i.test(msg)) return 'AUTH: the username/password (or authSource) is wrong for this cluster.';
  if (/tls|ssl|certificate|self[- ]signed/i.test(msg)) return 'TLS: the encrypted handshake failed — TLS/cert problem (or tls option mismatch).';
  if (tcpAllFailed) return "NETWORK / IP-ALLOWLIST: DNS resolved but no host accepted a TCP connection. This machine's public IP is almost certainly NOT in Atlas > Network Access (or a firewall blocks outbound 27017). This is the #1 cause of 'server selection timed out'.";
  if (name === 'MongoServerSelectionError') return 'TOPOLOGY: reached the host(s) but could not select a server — replica-set/SRV misconfig, or Atlas is paused, or the IP-allowlist blocks the data-bearing nodes.';
  return `UNCLASSIFIED: ${name} ${code ?? ''} ${msg}`.trim();
}

async function main() {
  const uri = (process.env.MONGO_BRIDGE_URI || process.env.MONGODB_URI || argUri()).trim();
  const dbName = (process.env.MONGO_BRIDGE_DB || process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB;
  const source = process.env.MONGO_BRIDGE_URI ? 'MONGO_BRIDGE_URI' : process.env.MONGODB_URI ? 'MONGODB_URI' : (argUri() ? '--uri' : '(none)');

  console.log('=============================================================');
  console.log(' MongoDB handshake diagnostic (read-only)');
  console.log('=============================================================');
  info(`connection string source: ${source}`);
  info(`target database: ${dbName}`);
  if (!uri) {
    bad('No connection string found. Set MONGO_BRIDGE_URI (the value the bridge uses) and retry.');
    process.exit(1);
  }

  // STEP 1 — parse + mask
  step(1, 'Parse the connection string');
  console.log(`  masked: ${maskUri(uri)}`);
  let parsed;
  try { parsed = parseUri(uri); } catch (e) { bad(`could not parse URI: ${e.message}`); process.exit(1); }
  info(`scheme       : ${parsed.srv ? 'mongodb+srv (SRV/DNS-seeded)' : 'mongodb (direct host list)'}`);
  info(`credentials  : ${parsed.hasUser ? 'present' : 'MISSING (no user:pass in URI)'}`);
  info(`hosts        : ${parsed.hosts.map((h) => `${h.host}${h.port ? ':' + h.port : ''}`).join(', ')}`);
  info(`options      : ${Object.keys(parsed.opts).length ? JSON.stringify(parsed.opts) : '(none)'}`);

  // STEP 2 — DNS (SRV) resolution
  let resolvedHosts = parsed.hosts.map((h) => ({ host: h.host, port: h.port || 27017 }));
  let dnsFailed = false;
  step(2, parsed.srv ? 'DNS: resolve SRV + TXT records' : 'DNS: resolve host A records');
  try {
    if (parsed.srv) {
      const srvName = `_mongodb._tcp.${parsed.hosts[0].host}`;
      const recs = await dns.resolveSrv(srvName);
      ok(`SRV ${srvName} → ${recs.length} node(s): ${recs.map((r) => `${r.name}:${r.port}`).join(', ')}`);
      resolvedHosts = recs.map((r) => ({ host: r.name, port: r.port }));
      try { const txt = await dns.resolveTxt(parsed.hosts[0].host); info(`TXT options: ${txt.flat().join(' ') || '(none)'}`); } catch { info('TXT: none'); }
    } else {
      for (const h of parsed.hosts) {
        const addrs = await dns.lookup(h.host, { all: true });
        ok(`${h.host} → ${addrs.map((a) => a.address).join(', ')}`);
      }
    }
  } catch (e) {
    dnsFailed = true;
    bad(`DNS resolution FAILED: ${e.code || e.message}`);
    info('If this is the failure, the cluster hostname is wrong or DNS/egress is blocked on this machine.');
  }

  // STEP 3 — raw TCP reachability (the key network/allowlist discriminator)
  step(3, 'TCP: open a raw socket to each data node (network / IP-allowlist test)');
  let tcpAny = false;
  let tcpAllFailed = resolvedHosts.length > 0;
  if (dnsFailed) {
    info('skipped (DNS failed — nothing to connect to).');
    tcpAllFailed = false;
  } else {
    for (const h of resolvedHosts) {
      const r = await tcpProbe(h.host, h.port);
      if (r.ok) { ok(`${h.host}:${h.port} reachable in ${r.ms}ms`); tcpAny = true; tcpAllFailed = false; }
      else bad(`${h.host}:${h.port} NOT reachable (${r.error}) after ${r.ms}ms`);
    }
    if (!tcpAny) info("No node accepted a TCP connection → strongly indicates this machine's IP is not in Atlas Network Access, or a firewall blocks outbound 27017.");
  }

  // STEP 4 — full driver handshake
  step(4, 'Driver: connect + ping + hello + buildInfo (TLS / auth / topology)');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000, appName: 'handshake-diagnostic' });
  const started = Date.now();
  let driverErr = null;
  try {
    await client.connect();
    const admin = client.db(dbName).admin();
    const pingMs0 = Date.now();
    await client.db(dbName).command({ ping: 1 });
    ok(`ping OK in ${Date.now() - pingMs0}ms (total connect+ping ${Date.now() - started}ms)`);
    try {
      const hello = await admin.command({ hello: 1 });
      info(`topology: setName=${hello.setName || '(standalone)'} primary=${hello.primary || '?'} me=${hello.me || '?'}`);
    } catch { /* hello may be restricted */ }
    try {
      const bi = await admin.command({ buildInfo: 1 });
      info(`server version: ${bi.version}`);
    } catch { /* buildInfo may be restricted */ }
    const colls = (await client.db(dbName).listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort();
    ok(`database "${dbName}" reachable — ${colls.length} collection(s)${colls.length ? ': ' + colls.join(', ') : ''}`);
    const empCount = colls.includes('employees') ? await client.db(dbName).collection('employees').countDocuments({}) : null;
    if (empCount !== null) info(`employees collection: ${empCount} document(s)`);
  } catch (err) {
    driverErr = err;
    bad(`driver handshake FAILED after ${Date.now() - started}ms`);
    info(`name=${err.name || '?'} code=${err.code ?? err.codeName ?? '?'}`);
    info(`message: ${err.message}`);
  } finally {
    await client.close().catch(() => {});
  }

  // STEP 5 — verdict
  step(5, 'VERDICT');
  if (!driverErr) {
    ok('MongoDB handshake SUCCEEDS from this machine.');
    console.log('  → The database connection is healthy HERE. If the app still fails, the break is');
    console.log('    between Vercel and this machine (ngrok tunnel down / stale URL / wrong bridge');
    console.log('    token), NOT the database handshake. Compare /api/health/mongo/deep on prod.');
  } else {
    console.log(`  → ${classify(driverErr, tcpAllFailed, dnsFailed)}`);
    console.log('\n  Fix map:');
    console.log('   • NETWORK/IP-ALLOWLIST → MongoDB Atlas → Network Access → add this machine\'s public IP');
    console.log('     (or 0.0.0.0/0 temporarily to confirm). Then re-run this script.');
    console.log('   • AUTH → fix the user:pass / authSource in MONGO_BRIDGE_URI on this machine.');
    console.log('   • DNS → correct the cluster hostname in the connection string.');
    console.log('   • TLS → ensure system time is correct and no tls=false/appended cert mismatch.');
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error('\nunexpected error:', e); process.exitCode = 1; });
