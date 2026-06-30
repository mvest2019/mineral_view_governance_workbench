# Mineral View — Materiality & Alerting Rules

Status: ENHANCED (v0.2 — preserves v0.1; thresholds/cadence/entitlements still need SME confirmation)
Owner: Ryan Cochran (final authority) · Reviewer: DS SME (Christos Batsios / Gabor Korosi) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

What is worth surfacing to an owner, and when. This decides what becomes a notification, a Monthly
Report headline, or a "watch this" item — and what stays quiet. Alerting and the Monthly Report use
the same rules so they always agree.

## 1. Purpose & scope
Govern which events are surfaced, the materiality thresholds, prioritization, and per-tier
entitlements. In scope: event types, thresholds, ranking, rules. Out of scope: how "nearby" is
computed (`Playbook_Spatial_And_Offset.md`) and tier limits (`Pricing_And_Tiers_Policy.md`).

## 2. What we surface (event types)
- **New permit / W-1** on the owner's unit.
- **Spud** (drilling started) on the owner's unit — high signal.
- **DUC completing** / new well coming online.
- **Nearby (offset) well** result in the same zone (a signal, not income).
- **Material forecast change** — the income outlook moved by more than a threshold.
- **Valuation change** — the estimated value moved materially.
- **New offer** on file.

(Event source: RRC activity feed — `w1permits`, completions, the regulatory feed; offset relevance
from the Spatial playbook.)

## 3. Materiality thresholds (to confirm)
| Event | Surface if… |
|---|---|
| Forecast change | income outlook moves > **X%** _(confirm X)_ |
| Valuation change | value range moves > **Y%** _(confirm Y)_ |
| New permit/spud on unit | always (high signal) |
| Offset well | within the relevance radius **and** same zone (Spatial playbook) |
| Price move | only as a dated lever, never a prediction |

> Thresholds X/Y and the relevance radius are `TODO` — set with SME/Ryan.

## 4. Prioritization
- **Headline:** the single biggest positive/negative change this month (e.g. "your operator started
  drilling a new well").
- **Watch:** still-potential items (a likely 4th well, a deeper zone).
- **Context:** market/world items, dated and cited.

## 5. Rules
1. **Relevance first:** only surface what is genuinely the owner's or near them (geofence).
2. **No noise:** below-threshold changes are not surfaced as alerts.
3. **Honest framing:** an offset well is good news (productive rock) but **doesn't pay them** — say so.
4. **No predictions/advice** in alerts (non-negotiables apply).
5. Alerting and the Monthly Report use the same materiality rules so they agree.

## 6. Output
A ranked set of material items per owner per period, feeding notifications (`notification-alerts`,
`oil-gas-activity-alerts`) and the Monthly Report headline/sections.

## 7. Good vs bad framing
| Good | Bad |
|---|---|
| "Headline: your operator spudded a new well on your unit." | "You're about to get rich — new well!" |
| "An offset well came online nearby (productive-rock signal); it doesn't pay you." | "A nearby well means more money for you." |

## 8. Anti-patterns
Surfacing below-threshold noise; out-of-area items; predicting prices in an alert; implying offset
production is owner income; alerts and report disagreeing.

## 9. QA checklist
☐ Relevance/geofence applied ☐ Threshold met (or always-surface event) ☐ Ranked headline/watch/
context ☐ Honest offset framing ☐ No prediction/advice ☐ Tier entitlement respected ☐ Alerts match
the report.

## 10. Evidence notes & gaps (TODO)
Confirm thresholds X/Y, the alert cadence, and per-tier alert entitlements (Pricing policy). Event
types are confirmed from v0.1; thresholds are SME-pending.
