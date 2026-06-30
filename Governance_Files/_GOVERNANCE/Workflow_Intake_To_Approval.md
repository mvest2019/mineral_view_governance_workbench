# Mineral View — Governance Workflow (Intake → Approval)

Status: ENHANCED (v0.2 — preserves v0.1; SLAs and the "employee" role still need confirmation)
Owner: Ryan Cochran (final authority) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

How a new piece of information becomes approved governance. This mirrors the Governance Workbench's
workflow so the file and the tool agree. The core promise: **nothing enters the constitution, and
nothing pushes, without Ryan's explicit approval.**

## 1. Purpose & scope
Govern the intake→approval lifecycle and its human gates. In scope: the stages, gates, roles, flow,
and on-disk locations. Out of scope: the AI grounding rules (`ai-agent-instructions.md`) and the
change-risk classification (`change-management-governance.md`).

## 2. The stages
```
Uploaded → Stored → Parsed → AI Reviewed →
Findings Pending → Employee Questions Pending → Ryan Questions Pending →
Decision Drafting → Awaiting Ryan Approval → Draft Governance Updated →
Awaiting Commit Approval → Committed → Pushed →
(Constitution Candidate → Constitution Approved)
```

## 3. The gates (human checkpoints)
| Gate | Meaning |
|---|---|
| Findings Approved | The findings from AI review are accepted |
| Employee Answered | Employee questions resolved |
| Ryan Answered | Ryan's questions resolved |
| Decision Approved | The drafted decision is approved |
| Draft Governance Updated | Governance files updated to match |
| Commit Approved | The git commit is approved |
| Constitution Eligible | Eligible to enter the constitution |

## 4. Roles
- **AI (Claude / OpenAI):** analyzes intake, proposes findings and questions, drafts decisions and
  commit-review packages. **Never the final authority.** Must ground every claim and write
  "Not confirmed from the uploaded files." where evidence is absent (`ai-agent-instructions.md`).
- **Team / employees:** answer questions, review findings.
- **Ryan:** final approval at every gate.

## 5. The flow, in words
1. **Intake:** a file/transcript/finding is dropped; a tracked record is created (nothing committed).
2. **AI review:** Claude/OpenAI summarize and produce candidate **findings**
   (FACT/PATTERN/INCONSISTENCY/INFERENCE) and **questions**.
3. **Cross-check (optional):** the AI Exchange pits Claude vs OpenAI for agreement, with a human verdict.
4. **Questions:** routed to the right person (employee vs Ryan) and answered.
5. **Decision:** a decision is drafted and logged as a `D-####` proposal in `DECISION_LOG.md`.
6. **Governance update:** the affected governance file(s) are edited to match the decision.
7. **Commit review:** a diff package is generated; **nothing pushes automatically.**
8. **Ryan approval:** Ryan approves the commit; it is committed (and pushed) into the governance repo.
9. **Constitution gate:** the most binding rules can be routed to the constitution gate.

## 6. Rules
- **No auto-commit.** Approval in the tool does not push; Ryan approves the commit explicitly.
- **Employee uploads stay uncommitted** until employee questions are resolved.
- **One change, one record:** a decision, its governance edit, and its commit travel together.
- **Trace everything:** findings link to sources; decisions link to findings/questions
  (Non-Negotiable #11).
- **Append-only logs:** `_FINDINGS_FOR_REVIEW.md`, `DECISION_LOG.md`, `PRIORITY_QUESTIONS_FOR_RYAN.md`,
  `_SECURITY_RISK_REGISTER.md` are appended, never rewritten.

## 7. Where outputs land (on disk)
- Intake records & AI outputs → `_GOVERNANCE/_INTAKE/...`
- Draft decisions & commit-review packages → `_GOVERNANCE/_DRAFTS/...`
- Approved content → the governance files themselves
- Meeting notes → `_GOVERNANCE/_MEETINGS/...`
- Voice memos → `_GOVERNANCE/_VOICE_MEMOS/...`

## 8. Anti-patterns
Auto-committing on tool approval; committing employee uploads before questions resolve; a decision
without a linked finding/source; rewriting an append-only log; AI treated as final authority.

## 9. QA checklist
☐ Intake tracked (uncommitted) ☐ Findings + questions produced ☐ Questions routed + answered ☐
Decision logged (`D-####`) ☐ Governance file edited to match ☐ Commit-review package generated ☐
Ryan approved before push ☐ Logs appended not rewritten ☐ Everything traces to sources.

## 10. Evidence notes & gaps (TODO)
Define SLAs (how fast questions get answered) and who plays the "employee" role for MView. The
stages, gates, and no-auto-commit rule are confirmed from v0.1 and mirror the Workbench.
