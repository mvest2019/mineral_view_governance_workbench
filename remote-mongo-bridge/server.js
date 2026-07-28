'use strict';

/*
 * Remote MongoDB bridge — a plain Node.js TCP proxy (no external dependencies).
 *
 * Runs on the Windows server (the same box as the Claude bridge) and forwards
 * the raw MongoDB wire protocol from a LOCAL listener to the production MongoDB
 * this machine can reach. The listener is published to Vercel via `ngrok tcp`
 * (outbound only), so production MongoDB is never exposed directly and its
 * firewall/config is untouched.
 *
 * MongoDB speaks a stateful binary protocol over a long-lived TCP connection, so
 * this operates at Layer 4: it forwards bytes both ways and never parses, stores,
 * or modifies anything.
 *
 * Defaults (override via environment / .env — see .env.example):
 *   listen   127.0.0.1:27018
 *   forward  108.181.152.168:27017
 *
 * Logs: bridge started, client connected, client disconnected, connection
 * errors. Each client connection opens its own upstream socket and retries the
 * upstream connect a few times, so a transient MongoDB blip reconnects on the
 * next attempt without restarting the bridge.
 */

const net = require('net');

const LISTEN_HOST = String(process.env.MONGO_BRIDGE_HOST || '127.0.0.1').trim();
const LISTEN_PORT = parseInt(process.env.MONGO_BRIDGE_PORT || '27018', 10);
const TARGET_HOST = String(process.env.MONGO_TARGET_HOST || '108.181.152.168').trim();
const TARGET_PORT = parseInt(process.env.MONGO_TARGET_PORT || '27017', 10);
const RETRY_MAX = parseInt(process.env.MONGO_BRIDGE_UPSTREAM_RETRIES || '3', 10);
const RETRY_DELAY_MS = parseInt(process.env.MONGO_BRIDGE_RETRY_DELAY_MS || '500', 10);

function ts() { return new Date().toISOString(); }
function log(msg) { console.log(`[mongo-bridge ${ts()}] ${msg}`); }
function errlog(msg) { console.error(`[mongo-bridge ${ts()}] ${msg}`); }

let counter = 0;
let active = 0;

// Open an upstream socket to MongoDB, retrying transient failures a few times
// (auto-reconnect). Total retry time is kept well under the driver's connect
// timeout so a genuine outage still surfaces quickly to the client.
function connectUpstream(id, attempt, onReady, onFail) {
  const upstream = net.connect(TARGET_PORT, TARGET_HOST);
  upstream.setNoDelay(true);
  let settled = false;
  upstream.once('connect', () => { settled = true; onReady(upstream); });
  upstream.once('error', (err) => {
    if (settled) return;
    try { upstream.destroy(); } catch (_) { /* ignore */ }
    if (attempt < RETRY_MAX) {
      errlog(`#${id} upstream connect failed (attempt ${attempt}/${RETRY_MAX}): ${err.message} — retrying in ${RETRY_DELAY_MS}ms`);
      setTimeout(() => connectUpstream(id, attempt + 1, onReady, onFail), RETRY_DELAY_MS);
    } else {
      onFail(err);
    }
  });
}

const server = net.createServer((client) => {
  const id = ++counter;
  active += 1;
  const remote = `${client.remoteAddress}:${client.remotePort}`;
  log(`client connected #${id} from ${remote} (active=${active})`);

  client.setNoDelay(true);
  client.pause(); // hold client bytes until the upstream is ready

  let disconnectLogged = false;
  const markDisconnected = () => {
    if (disconnectLogged) return;
    disconnectLogged = true;
    active -= 1;
    log(`client disconnected #${id} (active=${active})`);
  };

  client.on('error', (err) => errlog(`#${id} client error: ${err.message}`));
  client.on('close', markDisconnected);

  connectUpstream(
    id,
    1,
    (upstream) => {
      upstream.on('error', (err) => { errlog(`#${id} upstream error: ${err.message}`); try { client.destroy(); } catch (_) { /* ignore */ } });
      upstream.on('close', () => { try { client.end(); } catch (_) { /* ignore */ } });
      client.on('close', () => { try { upstream.end(); } catch (_) { /* ignore */ } });
      // Pure byte-for-byte forwarding in both directions. Nothing is stored.
      client.pipe(upstream);
      upstream.pipe(client);
      client.resume();
      log(`#${id} forwarding ${remote} <-> ${TARGET_HOST}:${TARGET_PORT}`);
    },
    (err) => {
      errlog(`#${id} could not reach MongoDB ${TARGET_HOST}:${TARGET_PORT} after ${RETRY_MAX} attempts: ${err.message}`);
      try { client.destroy(); } catch (_) { /* ignore */ }
    },
  );
});

server.on('error', (err) => { errlog(`server error: ${err.message}`); process.exitCode = 1; });

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  log(`bridge started — listening tcp://${LISTEN_HOST}:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
  log('MongoDB is not exposed directly; publish this port with `ngrok tcp 27018` only.');
});

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => {
    log(`${sig} received — shutting down (active=${active})`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  });
});
