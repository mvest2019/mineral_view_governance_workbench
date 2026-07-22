# Remote Claude Bridge — Complete Setup & Verification Runbook

Follow this top to bottom to make every Governance Claude request execute on your
Windows server. Each step lists the **exact command** and the **evidence** that
proves it worked. Nothing here hardcodes URLs, tokens, or paths — everything is
configuration you supply.

Legend: 🪟 = run on the **Windows server** · ☁️ = do in the **Vercel dashboard** ·
🌐 = run from **any other machine** (to test public reachability).

Fill these in once and reuse them:

- `REPO` = your Windows checkout of this repo (e.g. `C:\repos\mineral_view_governance_workbench`)
- `BRIDGE_DIR` = `REPO\remote-claude-bridge`
- `TOKEN` = a shared secret you generate in Step 3
- `PUBLIC_URL` = the public HTTPS URL from Step 6 (e.g. `https://xxxx.trycloudflare.com`)

---

## Step 1 🪟 — Install the Claude Code CLI (skip if `claude --version` works)

```powershell
# Requires Node.js (you already have it). Install the CLI globally:
npm install -g @anthropic-ai/claude-code

# Evidence:
claude --version          # -> e.g. 2.1.202 (Claude Code)
```

## Step 2 🪟 — Authenticate Claude

```powershell
claude          # opens an interactive session; type:  /login
                # complete the browser OAuth, then type:  /exit
```
Evidence — a non-interactive prompt returns text instead of an auth error:
```powershell
"Reply with exactly the single word AUTH_OK" | claude -p --allowedTools Read
# -> AUTH_OK
```
> Authentication is per Windows user. Authenticate as the **same account** the
> bridge will run under (important if you later run it as a service/task).

## Step 3 🪟 — Configure the bridge `.env`

```powershell
cd $env:REPO\remote-claude-bridge      # substitute your real REPO path
copy .env.example .env

# Generate a strong token:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Open `.env` in Notepad and set (leave everything else default):
```
CLAUDE_BRIDGE_TOKEN=<paste the generated token>          # this is your TOKEN
CLAUDE_BRIDGE_PATH_MAP=/var/task=>C:\repos\mineral_view_governance_workbench
```
- `CLAUDE_BRIDGE_TOKEN` must later equal Vercel's `REMOTE_CLAUDE_TOKEN`.
- The right-hand side of `CLAUDE_BRIDGE_PATH_MAP` is **your** `REPO` path — this
  is what makes `--add-dir`/cwd from Vercel (`/var/task/...`) resolve to your
  Windows checkout. Do not hardcode this anywhere else; it lives only in `.env`.

## Step 4 🪟 — Start the bridge

```powershell
cd $env:REPO\remote-claude-bridge
.\start-claude-bridge.bat
```
Evidence — the console prints (yours will show a Windows path and your mapping):
```
[claude-bridge] listening on http://127.0.0.1:8787
[claude-bridge] claude command: C:\...\claude.exe        (or ...\cli.js)
[claude-bridge] path map: /var/task => C:\repos\mineral_view_governance_workbench
```
If it says `CLAUDE_BRIDGE_TOKEN is required` → your `.env` token is empty (Step 3).

## Step 5 🪟 — Verify `/health` and a real CLI run locally

```powershell
$T = "<TOKEN>"
# 5a. Health
Invoke-RestMethod "http://127.0.0.1:8787/health" -Headers @{Authorization="Bearer $T"}
#   Evidence: ok=True, platform="win32 ...", claude_command shows your CLI path

# 5b. Execute a prompt through the bridge
$b = @{ args=@("-p","--allowedTools","Read"); input="Reply with exactly BRIDGE_OK"; timeout_ms=120000 } | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:8787/run" -Method Post -Headers @{Authorization="Bearer $T"} -ContentType "application/json" -Body $b
#   Evidence: ok=True, status=0, stdout="BRIDGE_OK`n"
```
This proves: Windows Server → Claude Code CLI → response, authenticated by token.

## Step 6 🪟 — Expose the bridge over public HTTPS

Vercel needs a **publicly-trusted HTTPS** URL (self-signed will not work).

**Cloudflare Tunnel — quick test URL (fastest):**
```powershell
winget install --id Cloudflare.cloudflared -e
cloudflared tunnel --url http://127.0.0.1:8787
#   Evidence: prints  https://<random>.trycloudflare.com   <- this is PUBLIC_URL
```
For production, create a **named** tunnel bound to your own domain and install it
as a service so it survives reboots:
```powershell
cloudflared tunnel login
cloudflared tunnel create claude-bridge
cloudflared tunnel route dns claude-bridge claude-bridge.yourdomain.com
cloudflared service install         # runs the tunnel on boot
```
**ngrok alternative:** `ngrok http 8787` → use the printed `https://…ngrok…` URL.

Keep `CLAUDE_BRIDGE_HOST=127.0.0.1` (default) so only the tunnel is exposed.

## Step 7 🌐 — Verify the HTTPS endpoint is publicly reachable

From a **different** machine (or phone/hotspot), not the Windows box:
```bash
curl -H "Authorization: Bearer <TOKEN>" https://<PUBLIC_URL>/health
#   Evidence: same {"ok":true,"platform":"win32 ..."} JSON as Step 5a
```
If Step 5a worked but this fails → the **tunnel** is the problem, not the bridge.

## Step 8 ☁️ — Configure Vercel environment variables

Vercel → your project → **Settings → Environment Variables** → Production:

| Variable | Value |
|---|---|
| `REMOTE_CLAUDE_URL` | `https://<PUBLIC_URL>` (from Step 6/7) |
| `REMOTE_CLAUDE_TOKEN` | **exactly** the `TOKEN` from Step 3 |

Then **Deployments → ⋯ → Redeploy**. Env-var changes only take effect on a new
build — skipping the redeploy is the #1 reason the connection "still doesn't work."

## Step 9 ☁️→🪟 — End-to-end proof from the Governance UI

1. 🪟 Watch the bridge console (or `Get-Content bridge.log -Wait -Tail 20`).
2. ☁️ Open the deployed Governance UI → **Integrations** page.
   - **Evidence (Step 9a):** Claude Code shows **Active**, detail
     *"Claude CLI runs on the remote Windows bridge (win32 …)"*.
   - If it shows a specific error instead, jump to Troubleshooting below.
3. ☁️ Open any governance file → **Chat with this file** → engine **Claude Code**
   → send a message.
   - **Evidence (Step 9b — request reached Windows + CLI executed):** a new line
     appears on the Windows console:
     `[claude-bridge] run flags="-p --allowedTools" cwd="C:\...\Governance_UI\governance-ui" exit=0 ...`
   - **Evidence (Step 9c — response returned):** the chat panel shows Claude's
     reply; browser DevTools → Network → the `POST /api/files/chat` response is
     `{"ok":true,"response_text":"..."}`.

That single click demonstrates the full required flow:
**Governance UI → Vercel → Remote Claude Bridge → Windows Server → Claude Code CLI → Governance UI.**

## Step 10 — Confirm every Claude feature uses the bridge

All features share the same execution path (`lib/claude_cli.ts → run_claude`), so
Step 9 proves the mechanism for all of them. To spot-check each, trigger it in the
UI and confirm a matching `run flags=` line appears on Windows:

| Feature | UI action | Bridge flags you'll see |
|---|---|---|
| Files Chat | Chat on a governance file | `-p --allowedTools` |
| Intake Analysis | Intake → **Run Claude** | `-p --add-dir --add-dir --allowedTools` |
| AI Exchange | Intake → **AI Exchange** (→ Claude) | `-p --add-dir --add-dir --allowedTools` |
| Repo Questions | Generate / Chat on a repo question | `-p --allowedTools` |
| Member Questions | Chat / generate on a member question | `-p --allowedTools` |
| Meeting Intelligence | Create a meeting with notes | `-p --allowedTools` |
| Voice Memo | Upload a voice memo (needs OpenAI Whisper key) | `-p --allowedTools` |

---

## Backward compatibility (local mode)

Leaving `REMOTE_CLAUDE_URL` unset restores the original behavior: the app spawns
`claude` locally. No code toggle needed — remote is used **only** when the URL is
set. (On Vercel there is no local CLI, so remote config is required there.)

## Troubleshooting — the Integrations page tells you the exact failure

| Integrations detail | Cause | Fix |
|---|---|---|
| "REMOTE_CLAUDE_URL is not configured …" | Env var missing / not redeployed | Step 8 (set vars **and** redeploy) |
| "rejected the token (401) … does not match CLAUDE_BRIDGE_TOKEN" | Token mismatch | Make `REMOTE_CLAUDE_TOKEN` == `CLAUDE_BRIDGE_TOKEN`; redeploy |
| "unreachable … fetch failed" | Bridge down or tunnel/URL wrong | Steps 4, 6, 7 |
| "did not respond within 8s" | Tunnel up but bridge hung/misrouted | Restart bridge; confirm tunnel points at `127.0.0.1:8787` |

## Stop / restart

```powershell
# Stop:
netstat -ano | findstr :8787      # get PID
taskkill /PID <pid> /F
# Restart:
.\start-claude-bridge.bat
```
When the bridge is down, UI Claude actions return
`{"ok":false,"reason":"Remote Claude bridge unreachable ..."}`; restarting restores them.
