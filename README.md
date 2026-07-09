# Mineral_View_Governance
Mineral View Governance Workbench

## Next.js app (migrated)

The Governance Workbench has been migrated to **Next.js 15 (App Router, TypeScript)**
as a single deployable app. The original Flask source is preserved under
`Governance_UI/governance-ui/` for reference; the runtime is now the Next.js app
at the repository root.

- Frontend: the original UI is preserved verbatim — the same markup, the same
  `static/app.js` and `static/styles.css` (served from `public/static/`), so every
  screen renders and behaves identically.
- Backend: every Flask route was ported to a Next.js route handler under `app/api/**`,
  keeping the same URLs, request/response shapes, status codes, and SQLite schema.
- The app is open — there is no login/sign-in gate.

### Run locally

```bash
npm install
npm run dev      # http://localhost:3000
# or
npm run build && npm start
```

Open `http://localhost:3000` and use the workbench (no login required).

### Environment variables (same names as the Flask app)

| Variable | Purpose |
|---|---|
| `WORKBENCH_DATA_DIR` | Where the SQLite DB / settings are written. Defaults to the repo root locally, and `/tmp/governance-workbench` on Vercel. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | OpenAI integration (unchanged). |
| `REMOTE_CLAUDE_URL` | Base HTTPS URL of the remote Claude execution bridge (see `remote-claude-bridge/README.md`). When set, every Claude CLI invocation runs on that machine instead of locally. When unset, the CLI is spawned locally exactly as before. |
| `REMOTE_CLAUDE_TOKEN` | Shared secret sent to the bridge as a Bearer token (must match the bridge's `CLAUDE_BRIDGE_TOKEN`). |

`governance.db` and `local_settings.json` are runtime state and are git-ignored
(mirrors the Flask app).

### Deploy (Vercel)

The repo root is a standard Next.js project — Vercel auto-detects and builds it. Set
any OpenAI vars in the Vercel project settings.

Vercel cannot execute the Claude Code CLI, so Claude-powered features
(intake analysis, AI exchange, file/repo/member chats, meeting and voice-memo
intelligence, question generation) execute the CLI on a remote machine through
the HTTPS bridge in `remote-claude-bridge/`. Configure `REMOTE_CLAUDE_URL` and
`REMOTE_CLAUDE_TOKEN` in the Vercel project settings; full setup instructions
(Windows startup script, HTTPS exposure, path mapping) are in
[`remote-claude-bridge/README.md`](remote-claude-bridge/README.md).
