# Remote MongoDB Bridge

Give the Vercel deployment a reachable MongoDB endpoint **without exposing the
production MongoDB server to the public internet and without allowlisting
Vercel's dynamic egress IPs** — the same networking idea as the Remote Claude
bridge, adapted to MongoDB's TCP wire protocol.

## Why this is a TCP proxy, not an HTTP bridge

`remote-claude-bridge` works over HTTPS because a Claude invocation is
**request/response** (args in → stdout out), which maps cleanly to one HTTP POST.
MongoDB is different: it is a **stateful, binary wire protocol over a long-lived
TCP connection** (SCRAM auth handshake, cursors, sessions, transactions). You
cannot express that as HTTP without rewriting every repository/service as HTTP
calls (a "Data API") — which would change application code.

So we reuse the **exposure** half of the Claude-bridge pattern (an outbound
tunnel to a public endpoint, protected by TLS + auth, no inbound firewall change)
and swap the **protocol** half from Layer‑7 HTTP to **Layer‑4 raw TCP**. The
result: the app is 100% unchanged — it still uses the MongoDB driver; only the
`MONGODB_URI` host:port points at the bridge.

## Architecture

```
Vercel (Governance UI)                 Bridge host (reaches Mongo privately)     Production MongoDB
┌───────────────────────┐   TLS/TCP    ┌───────────────────────────────┐  TCP   ┌──────────────────┐
│ MongoDB driver        │  (tunnel)    │ mongo-tcp-proxy.mjs           │ (local)│ mongod           │
│  MONGODB_URI ─────────┼─────────────►│  127.0.0.1:27018 ──▶ forward ─┼───────►│ 127.0.0.1:27017  │
│  = bridge endpoint    │              │  (ngrok / Cloudflare / VPS)   │        │ (unchanged,      │
└───────────────────────┘              └───────────────────────────────┘        │  stays private)  │
                                                                                 └──────────────────┘
```

The production MongoDB keeps its current bindIp/firewall. Only the bridge is
published, and only through an **outbound** tunnel (no inbound port opened on the
DB host), exactly like the Claude bridge.

## Security model

- **Authentication is unchanged and end-to-end.** MongoDB SCRAM stays on; the
  password is never sent in the clear (challenge/response), even on a plaintext
  hop. The bridge adds no new credentials to manage.
- **Encrypt the public hop with TLS.** Either terminate TLS in the proxy
  (`MONGO_BRIDGE_TLS_CERT_FILE`/`_KEY_FILE`, then Vercel uses `?tls=true`), or let
  the tunnel provider terminate TLS. The final localhost hop to mongod is
  plaintext but never leaves the machine.
- **One hardened choke point.** Mongo is never directly public; only a minimal,
  auditable proxy is reachable, and only via the tunnel. You can rotate, monitor,
  rate-limit, or firewall the bridge independently of the database.
- **Optional hardening: mTLS.** Require a client certificate at the proxy/tunnel
  so only the Vercel deployment (carrying the cert) can connect.

## Why a bridge beats allowlisting Vercel's IPs

Vercel serverless egresses from **dynamic, wide IP ranges**, so "allow Vercel"
effectively means opening the DB port very broadly — the opposite of least
privilege. The bridge instead keeps MongoDB private and exposes only a hardened,
TLS+SCRAM-protected proxy. It is strictly more secure and easier to reason about.
(No approach removes the need for *some* public, authenticated endpoint, because
Vercel egress is dynamic — the bridge just makes that endpoint a proxy, not your
database. The only way to avoid a public endpoint entirely is Vercel's
Enterprise dedicated/static egress IP + a single firewall allow rule, or Vercel
Secure Compute / a private-network peering — noted below as alternatives.)

## Setup

### Option A — Fastest: ngrok reserved TCP (reuses the Claude-bridge machine)

Run on the host that can reach MongoDB privately (e.g. the same Windows box that
runs the Claude bridge, if it can reach mongod):

1. Start the proxy (or skip it and tunnel mongod's local port directly):
   ```
   MONGO_TARGET_HOST=127.0.0.1 MONGO_TARGET_PORT=27017 \
   MONGO_BRIDGE_HOST=127.0.0.1 MONGO_BRIDGE_PORT=27018 \
   node mongo-tcp-proxy.mjs
   ```
2. Expose it with an ngrok **reserved TCP address** (stable host:port; paid):
   ```
   ngrok tcp 27018
   ```
   ngrok connects OUTBOUND — no inbound firewall change on the DB host.
3. In Vercel → Production env, set:
   ```
   MONGODB_URI=mongodb://admin:<password>@<N>.tcp.ngrok.io:<PORT>/?authSource=admin&directConnection=true
   ```
   Add `&tls=true` if you terminate TLS in the proxy. Redeploy.

### Option B — Most control: your own bastion VPS + reverse tunnel + TLS

1. On a small VPS with a static public IP, run this proxy (or nginx `stream`/
   HAProxy) with `MONGO_BRIDGE_TLS_CERT_FILE`/`_KEY_FILE` set to a cert for a
   hostname you control (e.g. `mongo-bridge.yourdomain.com`).
2. From the MongoDB host, open a persistent reverse tunnel to the VPS so the VPS
   can reach mongod without the DB host accepting any inbound connection:
   ```
   autossh -M 0 -N -R 27017:127.0.0.1:27017 bastion@<VPS_IP>
   ```
   Point the proxy's `MONGO_TARGET_*` at the VPS end of that tunnel.
3. Vercel → Production env:
   ```
   MONGODB_URI=mongodb://admin:<password>@mongo-bridge.yourdomain.com:27018/?authSource=admin&tls=true&directConnection=true
   ```
   Redeploy. Restrict the VPS proxy port with mTLS or a WAF if desired.

## What does NOT change

- Production MongoDB (bindIp, firewall, users, data, collections, schema).
- Application code, repositories, services, models, validators, APIs, UI.
- Only the `MONGODB_URI` environment variable in Vercel changes.

## Verify

After redeploy, open `GET /api/health/mongo/connectivity`. Expect
`details.tcp.ok = true` and `classification: "ok"` (or, if it's a single node,
add `directConnection=true` which the URI above already includes). Then create a
Task Tracker entry — it inserts into `GovernanceDB.taskTrackerEntries`.
