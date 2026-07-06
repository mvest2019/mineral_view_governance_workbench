# Remote Claude Bridge

A small, dependency-free Node.js service that runs on the Windows server where
the Claude Code CLI is installed and authenticated. The Governance UI deployed
on Vercel cannot spawn the `claude` CLI itself (serverless functions cannot run
`child_process.spawn()` against a CLI that isn't in the deployment), so every
Claude invocation is forwarded to this bridge over HTTPS and executed here with
the exact same command, flags, stdin, working directory, and timeout as before.

Nothing else about the application changes: prompts, API routes, response
formats, timeout and error handling, and the UI are identical. When the bridge
is **not** configured, the app spawns the CLI locally exactly as it always did.

## Why an HTTPS bridge (and not SSH)

- Vercel serverless functions cannot open interactive SSH sessions reliably:
  there is no bundled `ssh` binary, key management is awkward, and Windows
  SSH + long-running commands + large multiline prompts are fragile.
- An HTTPS POST is a single round-trip that carries the args, stdin, cwd and
  timeout as JSON, and returns stdout/stderr/exit code as JSON — a lossless
  mirror of what `child_process.spawnSync` returned before.
- It is stateless and concurrency-safe: each request spawns its own CLI
  process (bounded by `CLAUDE_BRIDGE_MAX_CONCURRENCY`).
- Authentication is a shared bearer token compared in constant time; TLS is
  provided by a tunnel/reverse proxy or directly by the bridge.

## Architecture

```
Vercel (Governance UI)                        Windows server
┌──────────────────────────┐                 ┌──────────────────────────────┐
│ API route                │   HTTPS POST    │ remote-claude-bridge         │
│  └─ lib/claude_cli.ts ───┼────────────────►│  └─ spawn claude -p ... ─────┼─► Claude CLI
│     REMOTE_CLAUDE_URL    │  { args, input, │     (authenticated locally)  │
│     REMOTE_CLAUDE_TOKEN  │    cwd, timeout}│     CLAUDE_BRIDGE_TOKEN      │
└──────────────────────────┘                 └──────────────────────────────┘
```

## API

Both endpoints require `Authorization: Bearer <CLAUDE_BRIDGE_TOKEN>`.

### `GET /health`

Returns `{ ok, claude_command, platform, active, queued }`.

### `POST /run`

Request body:

```json
{
  "args": ["-p", "--allowedTools", "Read"],
  "input": "prompt text piped to stdin (or null)",
  "cwd": "/var/task/Governance_UI/governance-ui",
  "timeout_ms": 600000
}
```

Response body (mirrors `child_process.spawnSync`):

```json
{
  "ok": true,
  "status": 0,
  "signal": null,
  "stdout": "...",
  "stderr": "",
  "timed_out": false
}
```

On timeout: `timed_out: true`, `status: null`, `signal: "SIGTERM"`,
`error_code: "ETIMEDOUT"`. On spawn failure: `error_message` / `error_code`.
All existing CLI flags used by the app (`-p`, `--add-dir`, `--allowedTools`,
…) are passed through unchanged — the bridge does not interpret them.

## Windows server setup

Prerequisites (already in place per your environment): Node.js, Claude Code
CLI installed and authenticated (`claude` works in a terminal), and the
required repositories checked out.

1. Copy the `remote-claude-bridge/` folder to the server, e.g.
   `C:\claude-bridge\`.

2. Create the config:

   ```bat
   cd C:\claude-bridge
   copy .env.example .env
   ```

   Generate a strong shared token and put it in `.env` as
   `CLAUDE_BRIDGE_TOKEN`:

   ```bat
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. (Recommended) Set `CLAUDE_BRIDGE_PATH_MAP` so paths computed by the Vercel
   deployment resolve to the repository checkout on this machine. Vercel runs
   the app from `/var/task`, so if the repo lives at
   `C:\repos\mineral_view_governance_workbench`:

   ```
   CLAUDE_BRIDGE_PATH_MAP=/var/task=>C:\repos\mineral_view_governance_workbench
   ```

   This rewrites the request `cwd` and any path arguments such as `--add-dir`
   values. If a mapped `cwd` still doesn't exist, the bridge falls back to
   `CLAUDE_BRIDGE_DEFAULT_CWD` instead of failing, so plain prompt runs keep
   working either way.

4. Start it:

   ```bat
   start-claude-bridge.bat
   ```

   You should see `[claude-bridge] listening on http://127.0.0.1:8787` and the
   resolved Claude command. The bridge refuses to start without a token, and
   it automatically unwraps npm's `claude.cmd` shim to `cli.js` (or uses
   `claude.exe` from the native installer) so multiline prompts never pass
   through `cmd.exe`. If resolution fails, set `CLAUDE_BRIDGE_CLAUDE_EXE`.

5. Verify locally:

   ```bat
   curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8787/health
   ```

## Exposing the bridge over HTTPS

Vercel must reach the bridge on a **publicly trusted HTTPS** URL (self-signed
certificates will not work from Vercel's fetch). Pick one:

### Option A — Cloudflare Tunnel (recommended)

No inbound firewall ports, free, trusted TLS, stable hostname:

```bat
winget install Cloudflare.cloudflared
cloudflared tunnel login
cloudflared tunnel create claude-bridge
cloudflared tunnel route dns claude-bridge claude-bridge.yourdomain.com
cloudflared tunnel run --url http://127.0.0.1:8787 claude-bridge
```

Then `REMOTE_CLAUDE_URL=https://claude-bridge.yourdomain.com`. Install
`cloudflared` as a Windows service (`cloudflared service install`) so the
tunnel survives reboots. Keep `CLAUDE_BRIDGE_HOST=127.0.0.1`.

### Option B — Reverse proxy with a real certificate

Run Caddy/nginx/IIS(ARR) on the server with a Let's Encrypt certificate (e.g.
via [win-acme](https://www.win-acme.com/)) proxying `https://…/` to
`http://127.0.0.1:8787`, and forward port 443 on your router/firewall.

### Option C — Direct TLS from the bridge

Set `CLAUDE_BRIDGE_TLS_CERT_FILE` / `CLAUDE_BRIDGE_TLS_KEY_FILE` to a publicly
trusted certificate + key and set `CLAUDE_BRIDGE_HOST=0.0.0.0`. Only sensible
if you already manage certificates for this hostname.

## Auto-start on boot (Task Scheduler)

1. Open **Task Scheduler** → **Create Task…**
2. General: name `Claude Bridge`, select **Run whether user is logged on or
   not** (use the account where Claude Code is authenticated).
3. Triggers: **At startup**.
4. Actions: Start a program → `C:\claude-bridge\start-claude-bridge.bat`,
   "Start in" `C:\claude-bridge`.
5. Settings: enable **If the task fails, restart every 1 minute**.

(Alternatively use [NSSM](https://nssm.cc/) to run `node server.js` as a
proper Windows service.)

## Configuring the Vercel application

Set two environment variables in the Vercel project (Settings → Environment
Variables), then redeploy:

| Variable | Value |
| --- | --- |
| `REMOTE_CLAUDE_URL` | Public HTTPS base URL of the bridge, e.g. `https://claude-bridge.yourdomain.com` |
| `REMOTE_CLAUDE_TOKEN` | The same secret as `CLAUDE_BRIDGE_TOKEN` on the server |

That's the entire application-side configuration. With these unset, the app
runs the Claude CLI locally exactly as before (useful for the desktop/local
setup); with them set, every route that uses Claude transparently executes on
the Windows server.

## Bridge environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `CLAUDE_BRIDGE_TOKEN` | — (required) | Shared secret; requests must send it as a Bearer token |
| `CLAUDE_BRIDGE_PORT` | `8787` | Listen port |
| `CLAUDE_BRIDGE_HOST` | `127.0.0.1` | Bind address (`0.0.0.0` only behind a proxy that terminates TLS) |
| `CLAUDE_BRIDGE_CLAUDE_EXE` | auto-detect | Explicit path to `claude.exe`, the npm `cli.js`, or a shim |
| `CLAUDE_BRIDGE_DEFAULT_CWD` | bridge folder | Working directory when the request cwd doesn't exist here |
| `CLAUDE_BRIDGE_PATH_MAP` | empty | `from=>to\|from=>to` path prefix rewrites for cwd/`--add-dir` |
| `CLAUDE_BRIDGE_MAX_CONCURRENCY` | `4` | Parallel CLI processes; extra requests queue FIFO (`0` = unlimited) |
| `CLAUDE_BRIDGE_MAX_TIMEOUT_MS` | `1800000` | Upper cap on per-request timeout |
| `CLAUDE_BRIDGE_MAX_BODY_BYTES` | `33554432` | Request body cap |
| `CLAUDE_BRIDGE_TLS_CERT_FILE` / `CLAUDE_BRIDGE_TLS_KEY_FILE` | empty | Serve HTTPS directly |

## Security notes

- Never commit `.env`; never hardcode the token or URL anywhere.
- The token is compared with a constant-time check; requests without it get
  `401` and no information.
- Keep the bridge bound to `127.0.0.1` and let the tunnel/proxy handle public
  exposure; the bridge itself then has zero open ports on the internet.
- The bridge only ever executes the configured Claude CLI binary — the
  executable is resolved once at startup and request payloads cannot change
  it; they only supply CLI arguments, stdin, cwd, and a timeout (capped by
  `CLAUDE_BRIDGE_MAX_TIMEOUT_MS`).
- Rotate the token by updating it in `.env` (restart the bridge) and in the
  Vercel env vars (redeploy).

## Troubleshooting

- **409 "Claude CLI is not available"** from the app → `REMOTE_CLAUDE_URL` is
  not set on Vercel (the app fell back to local mode) — set it and redeploy.
- **"Remote Claude bridge unreachable"** in an API error → Vercel cannot reach
  the URL; check the tunnel/proxy and that the bridge process is running.
- **401 / "Remote Claude bridge request failed"** → token mismatch between
  `REMOTE_CLAUDE_TOKEN` (Vercel) and `CLAUDE_BRIDGE_TOKEN` (server).
- **"Could not resolve the Claude CLI"** at startup → set
  `CLAUDE_BRIDGE_CLAUDE_EXE` (see `.env.example` for examples).
- **Claude errors about unreadable paths** → set/extend
  `CLAUDE_BRIDGE_PATH_MAP` so the Vercel paths map to the local checkout.
- **Timeouts** → the app sends its existing per-route timeout (e.g. 180 s for
  chats, `claude_timeout` setting for intake runs); the bridge enforces it and
  reports `ETIMEDOUT`, which the app surfaces exactly as before (HTTP 504
  where applicable).
