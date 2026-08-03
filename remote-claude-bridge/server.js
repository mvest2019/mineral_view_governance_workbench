#!/usr/bin/env node
/*
 * Remote Claude CLI execution bridge.
 *
 * Runs on the machine where the Claude Code CLI is installed and
 * authenticated (e.g. a Windows server). The Governance UI deployed on
 * Vercel forwards every Claude CLI invocation here over HTTPS instead of
 * spawning the CLI locally.
 *
 * Endpoints (both require `Authorization: Bearer <CLAUDE_BRIDGE_TOKEN>`):
 *   GET  /health  -> { ok, claude_command, active, queued }
 *   POST /run     -> body { args: string[], input?: string|null,
 *                           cwd?: string|null, timeout_ms?: number }
 *                    reply { ok, status, signal, stdout, stderr,
 *                            timed_out, error_message?, error_code? }
 *
 * The reply mirrors child_process.spawnSync's result so the web app can keep
 * its existing error/timeout handling byte-for-byte.
 *
 * Configuration (environment variables; see .env.example):
 *   CLAUDE_BRIDGE_TOKEN            shared secret (required)
 *   CLAUDE_BRIDGE_PORT             listen port (default 8787)
 *   CLAUDE_BRIDGE_HOST             bind address (default 127.0.0.1; set
 *                                  0.0.0.0 only when fronted by a proxy/tunnel)
 *   CLAUDE_BRIDGE_CLAUDE_EXE       explicit path to claude(.exe/.cmd/cli.js)
 *   CLAUDE_BRIDGE_DEFAULT_CWD      cwd used when the request cwd does not
 *                                  exist on this machine (default: this dir)
 *   CLAUDE_BRIDGE_PATH_MAP         rewrite request paths to local paths, e.g.
 *                                  /var/task/Governance_Files=>C:\repos\Governance_Files|/var/task=>C:\repos
 *   CLAUDE_BRIDGE_MAX_CONCURRENCY  parallel CLI processes (default 4; 0 = unlimited)
 *   CLAUDE_BRIDGE_MAX_TIMEOUT_MS   cap on per-request timeout (default 1800000)
 *   CLAUDE_BRIDGE_MAX_BODY_BYTES   request body cap (default 33554432)
 *   CLAUDE_BRIDGE_TLS_CERT_FILE /  serve HTTPS directly with this cert/key
 *   CLAUDE_BRIDGE_TLS_KEY_FILE     (otherwise plain HTTP behind an HTTPS tunnel)
 */
'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

const TOKEN = String(process.env.CLAUDE_BRIDGE_TOKEN || '').trim();
const PORT = parseInt(process.env.CLAUDE_BRIDGE_PORT || '8787', 10);
const HOST = process.env.CLAUDE_BRIDGE_HOST || '127.0.0.1';
const DEFAULT_CWD = process.env.CLAUDE_BRIDGE_DEFAULT_CWD || __dirname;
const MAX_CONCURRENCY = parseInt(process.env.CLAUDE_BRIDGE_MAX_CONCURRENCY || '4', 10);
const MAX_TIMEOUT_MS = parseInt(process.env.CLAUDE_BRIDGE_MAX_TIMEOUT_MS || String(30 * 60 * 1000), 10);
const MAX_BODY_BYTES = parseInt(process.env.CLAUDE_BRIDGE_MAX_BODY_BYTES || String(32 * 1024 * 1024), 10);
const DEFAULT_TIMEOUT_MS = 600 * 1000;

if (!TOKEN) {
  console.error('[claude-bridge] CLAUDE_BRIDGE_TOKEN is required. Refusing to start without authentication.');
  process.exit(1);
}

// Path map: "from=>to|from=>to". Longest prefixes win.
const PATH_MAP = String(process.env.CLAUDE_BRIDGE_PATH_MAP || '')
  .split('|')
  .map((pair) => pair.split('=>'))
  .filter((parts) => parts.length === 2 && parts[0].trim() && parts[1].trim())
  .map(([from, to]) => ({ from: from.trim(), to: to.trim() }))
  .sort((a, b) => b.from.length - a.from.length);

function mapPath(value) {
  if (typeof value !== 'string' || !value) return value;
  for (const { from, to } of PATH_MAP) {
    if (value === from) return to;
    if (value.startsWith(from + '/') || value.startsWith(from + '\\')) {
      const rest = value.slice(from.length + 1);
      return path.join(to, rest);
    }
  }
  return value;
}

// ----------------------------------------------------------------------------
// Claude CLI resolution
// ----------------------------------------------------------------------------

function pathSearch(cmd) {
  const exts = process.platform === 'win32'
    ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';').concat([''])
    : [''];
  const hits = [];
  for (const dir of String(process.env.PATH || '').split(path.delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const full = path.join(dir, cmd + ext);
      try {
        if (fs.existsSync(full) && fs.statSync(full).isFile()) hits.push(full);
      } catch {
        /* ignore */
      }
    }
  }
  return hits;
}

/**
 * npm installs `claude` on Windows as a .cmd shim that wraps
 * node_modules/@anthropic-ai/claude-code/cli.js. cmd.exe cannot safely receive
 * multiline prompts as arguments, so instead of running the shim through
 * cmd.exe we resolve the underlying cli.js and run it with this Node binary.
 */
function resolveCmdShim(shimPath) {
  let text = '';
  try {
    text = fs.readFileSync(shimPath, 'utf-8');
  } catch {
    return null;
  }
  const shimDir = path.dirname(shimPath);
  const match = text.match(/"%(?:~dp0|dp0)%?\\([^"\r\n]+?\.js)"/i) || text.match(/%~dp0\\([^\s"]+?\.js)/i);
  const candidates = [];
  if (match) candidates.push(path.join(shimDir, match[1]));
  candidates.push(path.join(shimDir, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'));
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return [process.execPath, candidate];
  }
  return null;
}

/**
 * Given any `claude` launcher path on Windows (the bare npm shell script, a
 * .cmd/.bat shim, etc.), return a command array that spawn() can actually run:
 * the sibling claude.exe, or the .cmd shim unwrapped to its cli.js, or cli.js
 * derived by npm convention. Returns null if none can be found. This is what
 * prevents "spawn ...\npm\claude ENOENT": the bare extensionless file is never
 * spawned directly on Windows.
 */
function windowsUpgradeCommand(p) {
  const dir = path.dirname(p);
  const base = path.basename(p).replace(/\.(cmd|bat|ps1)$/i, '');
  const exe = path.join(dir, base + '.exe');
  if (fs.existsSync(exe)) return [exe];
  for (const ext of ['.cmd', '.bat']) {
    const shim = path.join(dir, base + ext);
    if (fs.existsSync(shim)) {
      const resolved = resolveCmdShim(shim);
      if (resolved) return resolved;
    }
  }
  const cli = path.join(dir, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js');
  if (fs.existsSync(cli)) return [process.execPath, cli];
  return null;
}

function resolveClaudeCommand() {
  const override = String(process.env.CLAUDE_BRIDGE_CLAUDE_EXE || '').trim();
  if (override) {
    const lower = override.toLowerCase();
    if (lower.endsWith('.js')) return [process.execPath, override];
    if (lower.endsWith('.exe')) return [override];
    if (lower.endsWith('.cmd') || lower.endsWith('.bat')) {
      const resolved = resolveCmdShim(override);
      if (resolved) return resolved;
      throw new Error(
        `CLAUDE_BRIDGE_CLAUDE_EXE points to a cmd shim (${override}) whose cli.js target could not be resolved. ` +
        'Point it at claude.exe or at .../@anthropic-ai/claude-code/cli.js instead.',
      );
    }
    // Extensionless override. On Windows this is almost always the bare npm
    // shell script that spawn() cannot launch (the reported ENOENT). Upgrade it
    // to its .exe / cli.js sibling instead of blindly returning it. On POSIX the
    // bare file is the real executable.
    if (process.platform === 'win32') {
      const upgraded = windowsUpgradeCommand(override);
      if (upgraded) return upgraded;
      throw new Error(
        `CLAUDE_BRIDGE_CLAUDE_EXE=${override} is a bare npm launcher that Windows cannot spawn (ENOENT). ` +
        'Point it at claude.exe or at ...\\@anthropic-ai\\claude-code\\cli.js instead.',
      );
    }
    return [override];
  }

  const hits = pathSearch('claude');
  // 1. A real native executable (native installer) is always safe to spawn.
  const exe = hits.find((p) => p.toLowerCase().endsWith('.exe'));
  if (exe) return [exe];

  if (process.platform === 'win32') {
    // On Windows, `npm i -g @anthropic-ai/claude-code` drops THREE files in the
    // npm dir: claude.cmd (the real Windows shim), claude.ps1, and a bare
    // extensionless `claude` (a POSIX shell script for Git Bash). Windows cannot
    // spawn() that bare shell script -> "spawn ...\npm\claude ENOENT". So for
    // every candidate we upgrade to the .exe/cli.js sibling and never spawn the
    // bare file directly.
    for (const hit of hits) {
      const upgraded = windowsUpgradeCommand(hit);
      if (upgraded) return upgraded;
    }
  } else {
    // POSIX: the bare extensionless file IS the executable CLI.
    const plain = hits.find((p) => {
      const lower = p.toLowerCase();
      return !lower.endsWith('.cmd') && !lower.endsWith('.bat') && !lower.endsWith('.ps1') && !lower.endsWith('.com');
    });
    if (plain) return [plain];
  }

  throw new Error(
    'Could not resolve the Claude CLI on this machine. Install Claude Code or set CLAUDE_BRIDGE_CLAUDE_EXE ' +
    'to the full path of claude.exe (native install) or .../@anthropic-ai/claude-code/cli.js (npm install).',
  );
}

let CLAUDE_COMMAND;
try {
  const candidates = pathSearch('claude');
  console.log(`[claude-bridge] claude candidates on PATH: ${candidates.length ? candidates.join(' | ') : '(none)'}`);
  CLAUDE_COMMAND = resolveClaudeCommand();
  // Safety net: on Windows a single extensionless path is the bare npm shell
  // script; spawn() cannot launch it and every request would fail with ENOENT.
  // Refuse to start loudly instead of failing silently on every request.
  if (
    process.platform === 'win32' &&
    CLAUDE_COMMAND.length === 1 &&
    !CLAUDE_COMMAND[0].toLowerCase().endsWith('.exe')
  ) {
    throw new Error(
      `Refusing to start: resolved Claude command "${CLAUDE_COMMAND[0]}" is not a Windows executable ` +
      '(a bare npm launcher spawns as ENOENT). Set CLAUDE_BRIDGE_CLAUDE_EXE to claude.exe or ' +
      '...\\@anthropic-ai\\claude-code\\cli.js and restart.',
    );
  }
} catch (err) {
  console.error(`[claude-bridge] ${err.message}`);
  process.exit(1);
}

// ----------------------------------------------------------------------------
// Concurrency limiter (simple FIFO semaphore; requests queue, never dropped)
// ----------------------------------------------------------------------------

let active = 0;
const waiting = [];

function acquireSlot() {
  if (MAX_CONCURRENCY <= 0 || active < MAX_CONCURRENCY) {
    active += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function releaseSlot() {
  const next = waiting.shift();
  if (next) {
    next();
  } else {
    active -= 1;
  }
}

// ----------------------------------------------------------------------------
// CLI execution (async spawn -> safe under concurrent requests)
// ----------------------------------------------------------------------------

function runClaude(args, input, cwd, timeoutMs) {
  return new Promise((resolve) => {
    const [file, ...prefix] = CLAUDE_COMMAND;
    let child;
    try {
      child = spawn(file, prefix.concat(args), {
        cwd,
        env: process.env,
        windowsHide: true,
      });
    } catch (err) {
      resolve({
        ok: false,
        status: null,
        signal: null,
        stdout: '',
        stderr: '',
        timed_out: false,
        error_message: String(err.message || err),
        error_code: err.code || undefined,
      });
      return;
    }

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let spawnError = null;
    let settled = false;

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(killTimer);
      resolve(payload);
    };

    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });

    // Mirror spawnSync: write `input` to stdin (if any) and close it so the
    // CLI never blocks waiting for more input. Guard against the child never
    // starting (ENOENT) — its stdin may already be unwritable.
    child.stdin.on('error', () => { /* EPIPE when the CLI exits early */ });
    try {
      if (input) child.stdin.write(input);
      child.stdin.end();
    } catch { /* child failed to start */ }

    const killTimer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGTERM'); } catch { /* ignore */ }
      // Escalate if the process ignores SIGTERM.
      setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* ignore */ } }, 5000).unref();
    }, timeoutMs);

    // A failed spawn (e.g. a non-executable file -> ENOENT) emits 'error' and,
    // on some platforms, never emits 'close'. Resolve here so the request never
    // hangs and the bridge returns the real reason.
    child.on('error', (err) => {
      spawnError = err;
      finish({
        ok: false,
        status: null,
        signal: null,
        stdout,
        stderr,
        timed_out: false,
        error_message: String(err.message || err),
        error_code: err.code || undefined,
      });
    });
    child.on('close', (code, signal) => {
      finish({
        ok: !spawnError && !timedOut && code === 0,
        status: code,
        signal: signal || (timedOut ? 'SIGTERM' : null),
        stdout,
        stderr,
        timed_out: timedOut,
        error_message: spawnError ? String(spawnError.message || spawnError) : undefined,
        error_code: spawnError && spawnError.code ? spawnError.code : (timedOut ? 'ETIMEDOUT' : undefined),
      });
    });
  });
}

// ----------------------------------------------------------------------------
// HTTP plumbing
// ----------------------------------------------------------------------------

function authorized(req) {
  const header = String(req.headers['authorization'] || '');
  if (!header.startsWith('Bearer ')) return false;
  const presented = Buffer.from(header.slice('Bearer '.length).trim());
  const expected = Buffer.from(TOKEN);
  if (presented.length !== expected.length) return false;
  return crypto.timingSafeEqual(presented, expected);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

async function handleRun(req, res) {
  let body;
  try {
    body = JSON.parse(await readBody(req) || '{}');
  } catch (err) {
    sendJson(res, 400, { ok: false, error_message: `invalid JSON body: ${err.message}` });
    return;
  }
  if (!Array.isArray(body.args) || !body.args.every((a) => typeof a === 'string')) {
    sendJson(res, 400, { ok: false, error_message: '`args` must be an array of strings' });
    return;
  }

  const args = body.args.map(mapPath);
  const input = body.input === null || body.input === undefined ? '' : String(body.input);
  let timeoutMs = Number(body.timeout_ms) || DEFAULT_TIMEOUT_MS;
  timeoutMs = Math.max(1000, Math.min(timeoutMs, MAX_TIMEOUT_MS));

  let cwd = body.cwd ? mapPath(String(body.cwd)) : DEFAULT_CWD;
  if (!fs.existsSync(cwd)) cwd = DEFAULT_CWD;

  const startedAt = Date.now();
  const flags = args.filter((a) => a.startsWith('-')).join(' ');
  await acquireSlot();
  try {
    const result = await runClaude(args, input, cwd, timeoutMs);
    const elapsed = Date.now() - startedAt;
    console.log(
      `[claude-bridge] run flags="${flags}" cwd="${cwd}" exit=${result.status} ` +
      `timed_out=${result.timed_out} stdout=${result.stdout.length}B stderr=${result.stderr.length}B ${elapsed}ms`,
    );
    sendJson(res, 200, result);
  } finally {
    releaseSlot();
  }
}

// ----------------------------------------------------------------------------
// MongoDB bridge (additive) — authenticated Data-API-style endpoint so the
// Vercel app can run MongoDB operations HERE without connecting to MongoDB
// itself. Only this server ever opens a MongoDB connection. The mongodb driver
// is loaded lazily, so the Claude endpoints keep working even if it is not
// installed. EJSON is used on the wire so ObjectId/Date round-trip losslessly.
//   POST /mongo/op     body (EJSON): { target, db, collection?, method, args, cursorOps? }
//                      reply (EJSON): { ok, result } | { ok:false, error, errorMeta }
//   POST /mongo        alias of /mongo/op (older app clients)
//   GET  /mongo/health reply (JSON): { ok, mongoOk, pingMs, db, error? } (bounded ping)
// ----------------------------------------------------------------------------
const MONGO_BRIDGE_URI = String(process.env.MONGO_BRIDGE_URI || '').trim();
const MONGO_BRIDGE_DB = String(process.env.MONGO_BRIDGE_DB || 'GovernanceDB').trim();
const MONGO_CURSOR_METHODS = new Set(['find', 'aggregate', 'listIndexes', 'listSearchIndexes']);

let _mongoLib = null;
let _EJSON = null;
let _mongoClientPromise = null;

function mongoLib() {
  if (!_mongoLib) {
    _mongoLib = require('mongodb'); // lazy: Claude works even if this isn't installed
    _EJSON = _mongoLib.EJSON || require('bson').EJSON;
  }
  return _mongoLib;
}

function mongoClient() {
  if (!_mongoClientPromise) {
    if (!MONGO_BRIDGE_URI) throw new Error('MONGO_BRIDGE_URI is not set on the bridge');
    const { MongoClient } = mongoLib();
    const client = new MongoClient(MONGO_BRIDGE_URI, {
      serverSelectionTimeoutMS: 10000,
      appName: 'remote-claude-bridge-mongo',
    });
    _mongoClientPromise = client.connect().catch((err) => {
      _mongoClientPromise = null; // allow reconnect on the next request
      throw err;
    });
  }
  return _mongoClientPromise;
}

function sendEjson(res, statusCode, payload) {
  mongoLib();
  const body = _EJSON.stringify(payload, { relaxed: false });
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function handleMongo(req, res) {
  let cmd;
  try {
    mongoLib();
    cmd = _EJSON.parse((await readBody(req)) || '{}');
  } catch (err) {
    sendJson(res, 400, { ok: false, error: `invalid EJSON body: ${err.message}` });
    return;
  }

  const target = String(cmd.target || 'collection');
  const method = String(cmd.method || '');
  const args = Array.isArray(cmd.args) ? cmd.args : [];
  const dbName = String(cmd.db || MONGO_BRIDGE_DB);
  const collName = cmd.collection ? String(cmd.collection) : null;
  if (!method) { sendJson(res, 400, { ok: false, error: 'method is required' }); return; }

  // Run the operation. Compute the outcome FIRST, then send the response
  // OUTSIDE this try/catch, so a serialization/partial-send problem can never be
  // mistaken for an operation failure (which would report a successful insert as
  // failed) or trigger a double-send ("headers already sent").
  const started = Date.now();
  let succeeded = false;
  let result;
  let opError = null;
  try {
    const client = await mongoClient();
    const db = client.db(dbName);
    let base;
    if (target === 'collection') {
      if (!collName) throw new Error('collection is required for target=collection');
      base = db.collection(collName);
    } else if (target === 'admin') {
      base = db.admin();
    } else {
      base = db;
    }
    if (typeof base[method] !== 'function') throw new Error(`unsupported operation: ${target}.${method}`);

    let r = base[method](...args);
    if (Array.isArray(cmd.cursorOps)) {
      for (const op of cmd.cursorOps) r = r[op.name](...(op.args || []));
      r = await r.toArray();
    } else if (MONGO_CURSOR_METHODS.has(method) && r && typeof r.toArray === 'function') {
      r = await r.toArray();
    } else {
      r = await r;
    }
    result = r;
    succeeded = true;
  } catch (err) {
    opError = err;
  }

  const elapsed = Date.now() - started;
  try {
    if (succeeded) {
      console.log(`[claude-bridge] mongo ${target}.${method} db=${dbName} coll=${collName || '-'} ${elapsed}ms OK`);
      sendEjson(res, 200, { ok: true, result });
    } else {
      console.error(`[claude-bridge] mongo ${target}.${method} FAILED:`, opError && opError.message ? opError.message : opError);
      // 200 + ok:false carries the real Mongo error (name/code/errInfo) so the
      // app can surface it exactly as before.
      sendJson(res, 200, {
        ok: false,
        error: String(opError && opError.message ? opError.message : opError),
        errorMeta: {
          name: opError && opError.name ? opError.name : null,
          code: opError && opError.code != null ? opError.code : null,
          codeName: opError && opError.codeName ? opError.codeName : null,
          errInfo: opError && opError.errInfo ? opError.errInfo : null,
        },
      });
    }
  } catch (sendErr) {
    console.error('[claude-bridge] mongo response send failed:', sendErr && sendErr.message ? sendErr.message : sendErr);
    if (!res.headersSent) {
      try { sendJson(res, 500, { ok: false, error: `bridge response send failed: ${String(sendErr && sendErr.message ? sendErr.message : sendErr)}` }); } catch (_) { /* ignore */ }
    }
  }
}

// GET /mongo/health — bounded MongoDB ping so the Vercel app's /api/health/mongo
// returns promptly. Reports mongoOk separately from the HTTP status so the app
// can distinguish "bridge reachable" from "MongoDB reachable".
async function handleMongoHealth(req, res) {
  const started = Date.now();
  try {
    const client = await mongoClient();
    await client.db(MONGO_BRIDGE_DB).command({ ping: 1 });
    sendJson(res, 200, { ok: true, mongoOk: true, pingMs: Date.now() - started, db: MONGO_BRIDGE_DB });
  } catch (err) {
    console.error('[claude-bridge] mongo health ping FAILED:', err && err.message ? err.message : err);
    // 200 + mongoOk:false: the bridge is up, MongoDB is not. HTTP 200 keeps the
    // app's "bridge reachable" signal true while mongoOk carries the real state.
    sendJson(res, 200, { ok: false, mongoOk: false, pingMs: Date.now() - started, db: MONGO_BRIDGE_DB, error: String(err && err.message ? err.message : err) });
  }
}

const requestListener = (req, res) => {
  if (!authorized(req)) {
    sendJson(res, 401, { ok: false, error_message: 'unauthorized' });
    return;
  }
  const url = (req.url || '').split('?')[0];
  if (req.method === 'GET' && url === '/mongo/health') {
    handleMongoHealth(req, res).catch((err) => {
      console.error('[claude-bridge] mongo health unhandled error:', err);
      if (!res.headersSent) sendJson(res, 500, { ok: false, mongoOk: false, error: String(err.message || err) });
    });
    return;
  }
  if (req.method === 'POST' && (url === '/mongo/op' || url === '/mongo')) {
    handleMongo(req, res).catch((err) => {
      console.error('[claude-bridge] mongo unhandled error:', err);
      if (!res.headersSent) sendJson(res, 500, { ok: false, error: String(err.message || err) });
    });
    return;
  }
  if (req.method === 'GET' && url === '/health') {
    sendJson(res, 200, {
      ok: true,
      claude_command: CLAUDE_COMMAND,
      platform: `${os.platform()} ${os.release()}`,
      active,
      queued: waiting.length,
    });
    return;
  }
  if (req.method === 'POST' && url === '/run') {
    handleRun(req, res).catch((err) => {
      console.error('[claude-bridge] unhandled error:', err);
      if (!res.headersSent) {
        sendJson(res, 500, { ok: false, error_message: String(err.message || err) });
      }
    });
    return;
  }
  sendJson(res, 404, { ok: false, error_message: 'not found' });
};

const certFile = process.env.CLAUDE_BRIDGE_TLS_CERT_FILE;
const keyFile = process.env.CLAUDE_BRIDGE_TLS_KEY_FILE;
let server;
let scheme;
if (certFile && keyFile) {
  server = https.createServer(
    { cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) },
    requestListener,
  );
  scheme = 'https';
} else {
  server = http.createServer(requestListener);
  scheme = 'http';
}
// Keep sockets open long enough for the longest allowed CLI run.
server.requestTimeout = MAX_TIMEOUT_MS + 60_000;
server.headersTimeout = 65_000;

server.listen(PORT, HOST, () => {
  console.log(`[claude-bridge] listening on ${scheme}://${HOST}:${PORT}`);
  console.log(`[claude-bridge] claude command: ${CLAUDE_COMMAND.join(' ')}`);
  console.log(`[claude-bridge] default cwd: ${DEFAULT_CWD}`);
  console.log(`[claude-bridge] max concurrency: ${MAX_CONCURRENCY <= 0 ? 'unlimited' : MAX_CONCURRENCY}`);
  if (PATH_MAP.length) {
    for (const { from, to } of PATH_MAP) {
      console.log(`[claude-bridge] path map: ${from} => ${to}`);
    }
  }
  if (scheme === 'http') {
    console.log('[claude-bridge] WARNING: serving plain HTTP. Front this with an HTTPS tunnel/reverse proxy before exposing it.');
  }
  // Warm the MongoDB connection at startup and keep it alive so no /mongo/op
  // request ever pays the cold connect cost (TLS + SRV + up to 10s server
  // selection). That cold cost is what makes the FIRST op after startup/idle
  // slow enough to exceed the app's 4s read timeout — the exact "works after a
  // while / works on a warm bridge but not a fresh one" symptom. If MongoDB is
  // unreachable from THIS machine, it now fails loudly here at startup instead
  // of silently timing out every app request.
  warmMongo('startup');
  const mongoKeepAlive = setInterval(() => { warmMongo('keepalive'); }, 60_000);
  mongoKeepAlive.unref();
});

// Eagerly establish (and re-verify) the MongoDB connection. Additive: does
// nothing unless MONGO_BRIDGE_URI is set, so the Claude-only bridge is untouched.
async function warmMongo(reason) {
  if (!MONGO_BRIDGE_URI) return;
  const started = Date.now();
  try {
    const client = await mongoClient();
    await client.db(MONGO_BRIDGE_DB).command({ ping: 1 });
    console.log(`[claude-bridge] mongo warm (${reason}) OK ${Date.now() - started}ms db=${MONGO_BRIDGE_DB}`);
  } catch (err) {
    console.error(`[claude-bridge] mongo warm (${reason}) FAILED ${Date.now() - started}ms:`, err && err.message ? err.message : err);
  }
}
