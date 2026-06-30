# Free-Tier & Upgrade-Path Governance

> **Status:** ENHANCED (deep) · **Owner:** Product · **Final approver:** Ryan · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on pricing change · **Companion:** `pricing-and-plan-governance.md`, `owner-portal-governance.md`.

---

## 1. Purpose & scope
Govern how the **Free tier and upgrade prompts** are presented — honestly, consistently with enforced limits, and without manipulative urgency.

## 2. Free-tier limits (canonical)
| Persona | Free limits |
|---|---|
| Mineral Owner | Map View unlimited; Map Report 50; Claim 1; operator tools 5 each; core features included |
| Professional | Most tooling unlimited; Owner Reports 1; Claim 1; Notification Agents 100 |

## 3. Upgrade rules (MUST)
Upgrade prompts state the **real limit hit** and the **real next-tier benefit**, match canonical pricing, and **must not** use guaranteed-value or false-scarcity language. The limit shown is the actual enforced limit from `SUBSCRIPTION_PLAN_MAP`.

## 4. Honest scarcity
**Do not** invent urgency or fabricate "limited time" pressure. Unclaimed-owner popups follow the approved non-escalating sequence (`owner-portal-governance.md`).

## 5. Good vs bad
| Good | Bad |
|---|---|
| "You've used your 1 free claim. Pro ($49.99) includes 2." | "Last chance — upgrade before you lose your minerals!" |

## 6. QA checklist
☐ Real limit shown ☐ Real benefit shown ☐ Pricing-consistent (persona-correct) ☐ No false urgency ☐ No guaranteed value.

## 7. Evidence notes & gaps
Limits confirmed from pricing screenshots + code; popup approach from prior UX work. Owner-price reconciliation (Q-A) applies here too.

---

## Deep context (2026-06-30) — tiers, gating, and the upgrade path

**Tiers:** **Free, Pro, Enterprise**. Feature access and **claim limits** are enforced both in the UI (tier-aware rendering) and server-side (`SUBSCRIPTION_PLAN_MAP` / `featureAccess`) — the two layers must agree, and the **server is authoritative**.

**The funnel (MUST reflect the product):**
- **Free** — education + discovery: glossary/blog/video, owner & lease **search**, and a capped number of **claims**. The goal is the first claim (activation).
- **Pro** — expanded **claim limits**, fuller portfolio/financials/reports, and notifications/agents.
- **Enterprise / Professional** — multi-owner management (**Switch Owner / act-as-owner**), Data Coverage, operator analytics, and portfolio-scale tooling for landmen/family offices/fiduciaries.

**Rules (MUST):** never expose a Pro/Enterprise action to a Free user (UI **and** API); claim attempts beyond the tier cap are blocked with a clear upgrade prompt, not a silent failure; downgrades must define what happens to existing claims/portfolio access; pricing/claim numbers shown to users must match the code config and are **Ryan-approved** before change (`pricing-and-plan-governance.md`, `terms-billing-and-refund-governance.md`).
