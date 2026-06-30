# Mineral View — Decision Log

Status: LIVE
Owner: Ryan Cochran (final authority)
Last Updated: 2026-06-16
Applies To: Mineral View only

Running log of approved decisions. Each entry: date, decision, rationale, approver, status.
Nothing is added here without approval. Proposed entries await Ryan.

---

### D-0001 — Bootstrap Mineral View governance
- **Date:** 2026-06-16
- **Decision:** Stand up the Mineral View governance tree under `C:\MineralView-Org\_GOVERNANCE\`, seeded from a deep review of the six platform repositories and the owner-intelligence briefing.
- **Rationale:** The Governance Workbench needs real governance files to read; an empty tree gives the AI no rulebook.
- **Approver:** _(pending Ryan)_
- **Status:** PROPOSED

### D-0002 — Ryan Cochran is final governance authority
- **Date:** 2026-06-16
- **Decision:** All governance, constitution, product, pricing, analytics-methodology, and customer-claim changes require Ryan's approval through the workflow.
- **Rationale:** Single, clear authority keeps the constitution coherent.
- **Approver:** _(pending Ryan)_
- **Status:** PROPOSED

### D-0003 — Adopt code's plan model as the working tier baseline
- **Date:** 2026-06-16
- **Decision:** Treat `Anonymous / Free / Pro / Premium` (+ Enterprise) — the model in `featureAccess` — as the working tier baseline, pending reconciliation with the "Access/Insights/Pro" persona names in the briefing.
- **Rationale:** Code is what actually enforces access today; the persona names need a deliberate mapping.
- **Approver:** _(pending Ryan — confirm canonical names + limits in `Pricing_And_Tiers_Policy.md`)_
- **Status:** PROPOSED

### D-0004 — Owner-provided documents outrank public and modeled data
- **Date:** 2026-06-16
- **Decision:** Adopt the data-authority precedence: owner uploads > derived models > public records > web/world context.
- **Rationale:** Makes answers precise and honest; already the basis of the dossier design.
- **Approver:** _(pending Ryan)_
- **Status:** PROPOSED

### D-0005 — Secrets must leave source control
- **Date:** 2026-06-16
- **Decision:** Treat all committed secrets/keys/certs as compromised; rotate and move to a secret store; remove from history. Adopt `Engineering_Standards.md` §2.
- **Rationale:** Critical security exposure across every repo.
- **Approver:** _(pending Ryan)_
- **Status:** PROPOSED

### D-0006 — MviewMapAPI is the reference architecture
- **Date:** 2026-06-16
- **Decision:** New services follow the `MviewMapAPI` (TypeScript, layered) pattern; shared logic (tiers, GIS, valuation) has one authoritative source.
- **Rationale:** It is the cleanest, most maintainable codebase; reduces drift.
- **Approver:** _(pending Ryan)_
- **Status:** PROPOSED

### D-0007 — Analytics playbooks are scaffolds until SME sign-off
- **Date:** 2026-06-16
- **Decision:** The `Playbook_*` files are governance scaffolds; their exact formulas/thresholds remain `TODO` and are not treated as truth until an SME and Ryan confirm them.
- **Rationale:** Methodology must be authoritative; we don't ship invented numbers.
- **Approver:** _(pending Ryan)_
- **Status:** PROPOSED

> Add a new D-#### entry each time a decision is approved through the workflow.
