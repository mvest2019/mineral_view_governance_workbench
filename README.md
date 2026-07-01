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
  keeping the same URLs, request/response shapes, status codes, SQLite schema, and the
  login/session/`require_login` auth flow.

### Run locally

```bash
npm install
npm run dev      # http://localhost:3000
# or
npm run build && npm start
```

Open `http://localhost:3000`, create an account, and use the workbench.

### Environment variables (same names as the Flask app)

| Variable | Purpose |
|---|---|
| `WORKBENCH_SECRET` | Session-cookie signing key. Set this in production. |
| `WORKBENCH_DATA_DIR` | Where the SQLite DB / settings / secret are written. Defaults to the repo root locally, and `/tmp/governance-workbench` on Vercel. |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | OpenAI integration (unchanged). |

`governance.db`, `local_settings.json`, and `.workbench_secret` are runtime state and
are git-ignored (mirrors the Flask app).

### Deploy (Vercel)

The repo root is a standard Next.js project — Vercel auto-detects and builds it. Set
`WORKBENCH_SECRET` (and any OpenAI vars) in the Vercel project settings.
