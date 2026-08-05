#!/usr/bin/env node
/*
 * Bridge HTTP endpoint diagnostic — tests the RUNNING bridge's MongoDB HTTP
 * layer on THIS machine over localhost, bypassing Vercel AND ngrok. It answers
 * one question: does the bridge's own /mongo* HTTP route work end to end
 * (HTTP routing + env-var name + MongoDB)? That separates a BRIDGE problem from
 * a VERCEL/TUNNEL problem.
 *
 * It reads remote-claude-bridge/.env for the token, port, host and TLS settings,
 * then sends an admin {ping:1} to each candidate route and reports the result:
 *
 *   GET  /mongo/health   (new server.js)
 *   POST /mongo/op       (running bridge on Development)
 *   POST /mongo          (older repo bridge)
 *
 * The bridge must be running (start-claude-bridge.bat). Read-only. No secrets in
 * the output (token is only a presence flag).
 *
 * Run:  node diagnose-bridge-http.mjs      (from remote-claude-bridge)
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const info = (m) => console.log(`  • ${m}`);
const ok = (m) => console.log(`  ✔ ${m}`);
const bad = (m) => console.log(`  ✖ ${m}`);

function parseEnvFile(file) {
  const out = {};
  let text = '';
  try { text = fs.readFileSync(file, 'utf8'); } catch { return out; }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^﻿/, '').trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

function loadEnv() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(process.cwd(), '.env'),
    path.join(scriptDir, '.env'),
    path.join(scriptDir, '..', 'remote-claude-bridge', '.env'),
  ].filter((v, i, a) => a.indexOf(v) === i);
  for (const f of candidates) {
    if (fs.existsSync(f)) return { file: f, kv: parseEnvFile(f) };
  }
  return { file: null, kv: {} };
}

function request({ scheme, host, port, method, route, token, body, timeoutMs = 8000 }) {
  return new Promise((resolve) => {
    const lib = scheme === 'https' ? https : http;
    const data = body ? Buffer.from(body) : null;
    const started = Date.now();
    const req = lib.request(
      {
        host, port, path: route, method, timeout: timeoutMs,
        rejectUnauthorized: false, // localhost, bridge's own (possibly self-signed) cert
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {}),
        },
      },
      (res) => {
        let b = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { b += c; });
        res.on('end', () => resolve({ status: res.statusCode, body: b, ms: Date.now() - started }));
      },
    );
    req.on('timeout', () => { req.destroy(); resolve({ status: null, error: `timed out after ${timeoutMs}ms`, ms: Date.now() - started }); });
    req.on('error', (e) => resolve({ status: null, error: e.code || e.message, ms: Date.now() - started }));
    if (data) req.write(data);
    req.end();
  });
}

function interpret(r) {
  if (r.status === null) return `NO RESPONSE (${r.error})`;
  let parsed = null;
  try { parsed = JSON.parse(r.body); } catch { /* non-JSON */ }
  const flag = parsed && (parsed.mongoOk ?? parsed.ok);
  if (r.status === 404) return 'route NOT FOUND on this bridge (404)';
  if (r.status === 401) return 'UNAUTHORIZED (401) — token mismatch';
  if (r.status === 200 && flag === true) return 'OK — bridge reached MongoDB through this route ✔';
  if (r.status === 200 && parsed && flag === false) return `reached bridge, but Mongo op failed: ${parsed.error || parsed.error_message || '(no message)'}`;
  return `HTTP ${r.status}: ${String(r.body).slice(0, 200)}`;
}

async function main() {
  console.log('=============================================================');
  console.log(' Bridge HTTP endpoint diagnostic (localhost — no Vercel/ngrok)');
  console.log('=============================================================');

  const { file, kv } = loadEnv();
  const token = (kv.CLAUDE_BRIDGE_TOKEN || '').trim();
  const port = Number(kv.CLAUDE_BRIDGE_PORT || 8787);
  const rawHost = (kv.CLAUDE_BRIDGE_HOST || '127.0.0.1').trim();
  const host = (rawHost === '0.0.0.0' || rawHost === '::' || !rawHost) ? '127.0.0.1' : rawHost;
  const scheme = (kv.CLAUDE_BRIDGE_TLS_CERT_FILE && kv.CLAUDE_BRIDGE_TLS_KEY_FILE) ? 'https' : 'http';
  const dbName = (kv.CLAUDE_BRIDGE_MONGODB_DB || kv.MONGO_BRIDGE_DB || 'GovernanceDB').trim();

  info(`.env: ${file || '(none found)'}`);
  info(`target: ${scheme}://${host}:${port}   db=${dbName}`);
  info(`token: ${token ? 'present' : 'MISSING (requests will 401)'}`);

  // Token fingerprint — compare sha12 against the deep health endpoint's
  // config.tokenFingerprint.sha12 on Vercel. Same sha12 = identical tokens; a
  // 401 with matching sha12 means something else, a 401 with different sha12
  // means the Vercel token value must be changed to match this one.
  const rawTok = kv.CLAUDE_BRIDGE_TOKEN || '';
  const trimTok = rawTok.trim();
  const sha12 = trimTok ? crypto.createHash('sha256').update(trimTok).digest('hex').slice(0, 12) : null;
  console.log('  CLAUDE_BRIDGE_TOKEN fingerprint (compare to Vercel /api/health/mongo/deep → config.tokenFingerprint):');
  console.log(`      sha12=${sha12}  trimmedLen=${trimTok.length}  rawLen=${rawTok.length}  surroundingQuotes=${/^["'].*["']$/.test(trimTok)}  whitespace=${rawTok.length !== trimTok.length}`);

  const pingBody = JSON.stringify({ db: dbName, target: 'admin', method: 'command', args: [{ ping: 1 }] });

  const tests = [
    { label: 'GET  /mongo/health', method: 'GET', route: '/mongo/health', body: null },
    { label: 'POST /mongo/op    ', method: 'POST', route: '/mongo/op', body: pingBody },
    { label: 'POST /mongo       ', method: 'POST', route: '/mongo', body: pingBody },
  ];

  console.log('\n[TESTS] admin ping through each candidate route:');
  const results = {};
  for (const t of tests) {
    const r = await request({ scheme, host, port, method: t.method, route: t.route, token, body: t.body });
    results[t.route] = r;
    const verdict = interpret(r);
    const line = `  ${t.label}  →  ${verdict}  (${r.ms}ms)`;
    if (verdict.includes('OK —')) ok(line.trim()); else if (verdict.includes('NOT FOUND') || verdict.includes('NO RESPONSE') || verdict.includes('UNAUTHORIZED')) bad(line.trim()); else console.log(line);
  }

  // Replicate the EXACT employees read the app does: find + sort via /mongo/op.
  // This is the path that times out in production (the health ping does NOT use
  // it), so it is the one that must be proven.
  console.log('\n[EMPLOYEES FIND] the exact query /api/employees runs, through /mongo/op:');
  const findBody = JSON.stringify({
    db: dbName, target: 'collection', collection: 'employees', method: 'find',
    args: [{ status: 'ACTIVE', companyKey: 'MView', isDeleted: false }],
    cursorOps: [{ name: 'sort', args: [{ fullName: 1 }] }],
  });
  const fr = await request({ scheme, host, port, method: 'POST', route: '/mongo/op', token, body: findBody });
  let findOk = false;
  if (fr.status === 200) {
    let cnt = '?';
    try { const p = JSON.parse(fr.body); if (Array.isArray(p.result)) { cnt = p.result.length; findOk = true; } else if (p.ok === false) cnt = `ok:false ${p.error || ''}`; } catch { cnt = '(unparseable body)'; }
    if (findOk) ok(`find employees → ${cnt} documents (${fr.ms}ms)`);
    else bad(`find employees → 200 but ${cnt} (${fr.ms}ms)`);
  } else {
    bad(`find employees → ${fr.status === null ? `NO RESPONSE (${fr.error})` : `HTTP ${fr.status}: ${String(fr.body).slice(0, 150)}`} (${fr.ms}ms)`);
  }

  console.log('\n[VERDICT]');
  const anyConn = Object.values(results).some((r) => r.status !== null);
  const opOk = ['/mongo/op', '/mongo'].some((rt) => { const r = results[rt]; if (!r || r.status !== 200) return false; try { const p = JSON.parse(r.body); return (p.mongoOk ?? p.ok) === true; } catch { return false; } });
  const healthOk = (() => { const r = results['/mongo/health']; if (!r || r.status !== 200) return false; try { const p = JSON.parse(r.body); return (p.mongoOk ?? p.ok) === true; } catch { return false; } })();

  if (!anyConn) {
    console.log('  ✖ Could not connect to the bridge at all on localhost.');
    console.log('    → The bridge is NOT running, or CLAUDE_BRIDGE_PORT/HOST/TLS differ from this .env.');
    console.log('      Start it (start-claude-bridge.bat) and re-run.');
    process.exitCode = 1;
  } else if (findOk) {
    console.log('  ✔ The EXACT employees find works through the bridge on this machine (see doc count above).');
    console.log('    → The bridge + DB + find path are all healthy locally. Since /api/employees still times');
    console.log('      out from Vercel, the break is ONLY between Vercel and this bridge for POST /mongo/op:');
    console.log('      watch the ngrok request log while reloading Task Tracker — if POST /mongo/op does NOT');
    console.log('      appear, the app is not reaching the bridge (stale MONGODB_BRIDGE_URL / tunnel); if it');
    console.log('      appears with a slow/!=200 result, note the status. Also check the Vercel function logs');
    console.log('      for the [TRACE][http_bridge] fetch lines to see exactly where it stalls.');
  } else if (opOk || healthOk) {
    console.log('  ⚠ The bridge PING works, but the employees FIND did not return docs (see above).');
    console.log('    → The health path (/mongo/health ping) is fine, but the actual find via /mongo/op failed');
    console.log('      or hung on the bridge. That matches production: mongoOk:true but /api/employees times');
    console.log('      out. Paste the [EMPLOYEES FIND] line above so we can fix the bridge find handler.');
    if (!results['/mongo/op'] || results['/mongo/op'].status === 404) {
      console.log('    ⚠ NOTE: /mongo/op returned 404 — this bridge only serves the legacy /mongo. The Vercel');
      console.log('      client must post to /mongo (or deploy the latest server.js that serves both).');
    }
  } else {
    console.log('  ✖ The bridge is reachable on localhost but its MongoDB route did NOT succeed.');
    console.log('    → This is a BRIDGE problem, not Vercel. Most likely the running server.js reads a');
    console.log('      different env-var name than the .env provides (CLAUDE_BRIDGE_MONGODB_URI), or it');
    console.log('      lacks the /mongo route. Deploy the latest remote-claude-bridge/server.js (git pull');
    console.log('      on this box) and restart start-claude-bridge.bat, then re-run. The bridge console');
    console.log('      also prints "[claude-bridge] mongo warm (startup) OK/FAILED" on restart.');
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error('\nunexpected error:', e); process.exitCode = 1; });
