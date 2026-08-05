# Remote MongoDB Bridge

A tiny, dependency-free Node.js **TCP proxy** that runs on the same Windows
server as the Claude bridge. It listens on `127.0.0.1:27018` and forwards the raw
MongoDB wire protocol to the production MongoDB at `108.181.152.168:27017`. You
publish `27018` to Vercel with `ngrok tcp` (outbound only) — exactly like the
Claude bridge — so production MongoDB is **never exposed directly** and its
configuration/firewall are **untouched**.

This is separate from `remote-claude-bridge/` and does not modify it, the
application, or the database.

## Why a TCP proxy (not an HTTP bridge like Claude)

Claude is request/response, so it maps to one HTTPS POST. MongoDB is a stateful
binary protocol over a long-lived TCP connection (SCRAM handshake, cursors,
sessions), so this forwards **bytes** at Layer 4. Nothing is parsed, inspected,
or stored — it just pipes the two sockets together. The deployed app is
unchanged; only `MONGODB_URI` in Vercel points at the ngrok endpoint.

## Files

| File | Purpose |
|------|---------|
| `server.js` | The TCP proxy (plain Node, no dependencies). |
| `start-mongo-bridge.bat` | Loads `.env` (if present) and runs `server.js`. |
| `.env.example` | Optional overrides (defaults are baked in). |

## Logging

```
[mongo-bridge <ISO time>] bridge started — listening tcp://127.0.0.1:27018 -> 108.181.152.168:27017
[mongo-bridge <ISO time>] client connected #1 from 127.0.0.1:52344 (active=1)
[mongo-bridge <ISO time>] #1 forwarding 127.0.0.1:52344 <-> 108.181.152.168:27017
[mongo-bridge <ISO time>] client disconnected #1 (active=0)
[mongo-bridge <ISO time>] #2 upstream connect failed (attempt 1/3): ... — retrying in 500ms   (auto-reconnect)
```

## Run it

Prereq: Node.js is already installed (the Claude bridge uses it), and this
Windows server can reach `108.181.152.168:27017` (verify with
`Test-NetConnection 108.181.152.168 -Port 27017` in PowerShell → `TcpTestSucceeded : True`).

```bat
cd C:\path\to\remote-mongo-bridge
copy .env.example .env   REM optional; defaults already match your setup
start-mongo-bridge.bat
```

You should see `bridge started — listening tcp://127.0.0.1:27018 -> 108.181.152.168:27017`.

## Expose 127.0.0.1:27018 with ngrok TCP

In a second terminal on the same server:

```bat
ngrok tcp 27018
```

ngrok connects **outbound** (no inbound firewall change) and prints a public
forwarding address, e.g.:

```
Forwarding   tcp://6.tcp.ngrok.io:15427 -> localhost:27018
```

Notes:
- A **reserved TCP address** (paid ngrok) keeps `host:port` stable across
  restarts; a free tunnel changes each run (you'd update `MONGODB_URI` each time).
- If you already run the Claude bridge under one ngrok agent, add this TCP tunnel
  to your `ngrok.yml` so both run together, e.g.:
  ```yaml
  tunnels:
    claude:
      proto: http
      addr: 8787
    mongo:
      proto: tcp
      addr: 27018
  ```
  then `ngrok start --all`.

## Set MONGODB_URI in Vercel

Take the ngrok host and port from the `Forwarding tcp://HOST:PORT` line and set
this in **Vercel → Settings → Environment Variables → Production**, then redeploy:

```
mongodb://admin:<URL-ENCODED-PASSWORD>@6.tcp.ngrok.io:15427/?authSource=admin&directConnection=true
```

- Replace `6.tcp.ngrok.io:15427` with YOUR ngrok forwarding host:port.
- Keep `MONGODB_DB_NAME=GovernanceDB` as its own variable.
- `directConnection=true` makes the driver talk straight to this node through the
  tunnel instead of trying to rediscover replica-set members by their internal
  names (which are not reachable through the tunnel).
- `authSource=admin` assumes the `admin` user lives in the admin database (typical).
- URL-encode special characters in the password (`#`→`%23`, `!`→`%21`, `@`→`%40`, …).

Verify: open `GET /api/health/mongo/connectivity` on the deployed app →
`details.tcp.ok: true`, `classification: "ok"`. Then save a Task Tracker entry →
it inserts into `GovernanceDB.taskTrackerEntries`.

## Security

- MongoDB **SCRAM auth is end-to-end and unchanged** — the password is never sent
  in the clear (challenge/response), even over the tunnel.
- ⚠️ **ngrok TCP tunnels are not encrypted by default.** SCRAM protects the
  credentials, but query/response payloads traverse the tunnel unencrypted. For
  production confidentiality, enable TLS on MongoDB (then add `tls=true` to the
  URI) or put a TLS terminator in front — see `remote-claude-bridge` for the same
  trade-off. Restrict access with ngrok's IP restrictions / a reserved address.
- Keep the listener bound to `127.0.0.1`; only ngrok should reach it.

## What this does NOT change

Production MongoDB (config, bindIp, firewall, users, data, collections, schema),
the Claude bridge, and the application (code, repositories, services, models,
validators, APIs, UI). Only the Vercel `MONGODB_URI` variable changes.
