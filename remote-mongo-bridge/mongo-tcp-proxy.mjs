// Remote MongoDB bridge — a small, dependency-free TCP/TLS proxy.
//
// Analogous to remote-claude-bridge/server.js, but for MongoDB. The Claude
// bridge works over HTTP because Claude is request/response; MongoDB speaks a
// stateful binary WIRE PROTOCOL over a long-lived TCP connection, so this bridge
// operates at Layer 4 (raw TCP) instead of Layer 7 (HTTP). The deployed app is
// UNCHANGED — it still uses the MongoDB driver; only MONGODB_URI points here.
//
// It listens on a local port and forwards every byte, in both directions, to a
// MongoDB server this host can reach privately (typically 127.0.0.1:27017 on the
// same machine, or a private-network address). Production MongoDB is NOT
// modified and is NOT exposed to the public internet: this proxy is published to
// Vercel only through an OUTBOUND tunnel (ngrok/Cloudflare) or a reverse proxy,
// exactly like the Claude bridge.
//
// Security model:
//   • MongoDB SCRAM authentication is end-to-end and unchanged (the password is
//     never sent in the clear, even over a plaintext hop — SCRAM is
//     challenge/response).
//   • Set MONGO_BRIDGE_TLS_CERT_FILE / _KEY_FILE to terminate TLS here, so the
//     public hop (Vercel → tunnel → this proxy) is encrypted while the final
//     localhost hop to MongoDB stays plaintext. Vercel then uses `?tls=true`.
//   • Bind to 127.0.0.1 and expose ONLY via the tunnel; the tunnel is the single
//     public, authenticated choke point.
//
// Usage:  node mongo-tcp-proxy.mjs      (loads sibling .env if present via your
//         process manager; this file itself reads process.env only).

import net from 'net';
import tls from 'tls';
import fs from 'fs';

const LISTEN_HOST = (process.env.MONGO_BRIDGE_HOST || '127.0.0.1').trim();
const LISTEN_PORT = Number(process.env.MONGO_BRIDGE_PORT || 27018);
const TARGET_HOST = (process.env.MONGO_TARGET_HOST || '127.0.0.1').trim();
const TARGET_PORT = Number(process.env.MONGO_TARGET_PORT || 27017);
const TLS_CERT = (process.env.MONGO_BRIDGE_TLS_CERT_FILE || '').trim();
const TLS_KEY = (process.env.MONGO_BRIDGE_TLS_KEY_FILE || '').trim();
const IDLE_MS = Number(process.env.MONGO_BRIDGE_IDLE_MS || 0); // 0 = no idle timeout

let active = 0;

/** Wire a freshly-accepted client socket to a new upstream MongoDB socket. */
function wire(client) {
  active += 1;
  const upstream = net.connect(TARGET_PORT, TARGET_HOST);
  const close = () => {
    try { client.destroy(); } catch { /* ignore */ }
    try { upstream.destroy(); } catch { /* ignore */ }
  };
  client.on('error', close);
  upstream.on('error', close);
  client.on('close', () => { try { upstream.end(); } catch { /* ignore */ } });
  upstream.on('close', () => { active = Math.max(0, active - 1); try { client.end(); } catch { /* ignore */ } });
  if (IDLE_MS > 0) {
    client.setTimeout(IDLE_MS, close);
    upstream.setTimeout(IDLE_MS, close);
  }
  // Full-duplex byte-for-byte forwarding of the MongoDB wire protocol.
  client.pipe(upstream);
  upstream.pipe(client);
}

const useTls = Boolean(TLS_CERT && TLS_KEY);
const server = useTls
  ? tls.createServer(
      { cert: fs.readFileSync(TLS_CERT), key: fs.readFileSync(TLS_KEY), minVersion: 'TLSv1.2' },
      wire,
    )
  : net.createServer(wire);

server.on('error', (err) => {
  console.error('[mongo-bridge] server error:', err && err.message ? err.message : err);
  process.exitCode = 1;
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  const scheme = useTls ? 'tls' : 'tcp';
  console.log(`[mongo-bridge] listening ${scheme}://${LISTEN_HOST}:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
  console.log('[mongo-bridge] MongoDB is NOT exposed directly; publish this port via a tunnel/reverse proxy only.');
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { console.log(`[mongo-bridge] ${sig} — closing (active=${active})`); server.close(() => process.exit(0)); });
}
