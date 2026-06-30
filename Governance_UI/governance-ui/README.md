# Governance Workbench

A local web UI for reviewing the BOLD and Mineral View governance systems.

## Quick start

Double-click `start.bat` (Windows). Or:

```powershell
cd C:\Governance-UI
python governance_ui.py
```

Open `http://127.0.0.1:5050` in your browser.

## What it does

- **Dashboard** — branded overview, drag/drop quick intake, queue summaries, and integration status
- **Daily Intake** — create tracked intake records from dropped files before any governance changes happen
- **Workflow Board** — view items moving from upload through findings, questions, decisions, commit review, and constitution gate
- **Priority Questions** — view org-wide and per-employee Q-#### entries, sorted by priority
- **Findings for Review** — view findings from a code review, grouped by type (FACT / PATTERN / INCONSISTENCY / INFERENCE)
- **Repo Classification** — classify mirrored repos by observed purpose, category, status, and evidence
- **Decision Log** — read the running log of approved decisions
- **Glossary** — read the company glossary
- **Repo Inventory** — read the inventory of classified repos
- **All Governance Files** — browse every markdown governance file
- **Git Status** — show clean/dirty status and last commit for governance + legal-vault repos
- **Version History** — review recent file changes and Git-backed history
- **Constitution Gate** — keep constitution candidates separate from normal governance updates
- **Voice Memo** — record audio in the browser and save to `<company>/_GOVERNANCE/_VOICE_MEMOS/<timestamp>_<label>.webm`

## Hard isolation

The company picker at the top is the only switch. The backend never reads files from one company while serving a request for the other. Every API endpoint takes a `company` parameter and resolves to a fixed root path.

## What is live vs. deferred

| Feature | Status |
|---|---|
| Browse + view files | Yes |
| Priority Question view | Yes |
| Findings view | Yes (read-only — markup still happens via chat) |
| Workflow board + intake tracking | Yes |
| Dashboard quick intake | Yes |
| Voice recording | Yes |
| Git status | Yes |
| Claude Code integration | Yes, via local `claude` CLI |
| OpenAI integration | Partial — requires `OPENAI_API_KEY` |
| GitHub/local snapshot integration | Yes |
| Commit review draft generation | Yes |
| Inline edit governance docs | Deferred |
| Auto-mark findings (APPROVE / REJECT / etc.) | Deferred — currently you mark via chat |
| Audio transcription (Whisper) | Deferred |
| Direct GitHub push from UI | Deferred — backend snapshot only until auth + push actions are added |

## Stopping

Ctrl+C in the terminal where `start.bat` ran.

## Local runtime files

The app writes local runtime state to `governance.db`. That file is intentionally excluded from Git so each machine can keep its own intake/runtime history without polluting source control.

## File locations

- BOLD governance: `C:\BOLD-Org\`
- BOLD legal vault: `C:\BOLD-LegalVault\`
- BOLD code mirror: `C:\BOLD-Repos\`
- MView governance: `C:\MineralView-Org\`
- MView legal vault: `C:\MineralView-LegalVault\`
- MView code mirror: `C:\MineralView-Repos\`

These are configured at the top of `governance_ui.py`. Edit if your paths differ.

## Microphone permission

First time you use the Voice Memo tab, your browser will ask for microphone permission. Allow it. The recording stays local — uploaded only to the local Flask server, then saved to disk on your machine.
