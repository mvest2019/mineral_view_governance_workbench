# Mineral View — Playbook: Market & World Context

Status: ENHANCED (v0.2 — preserves v0.1; trusted-source list/refresh cadence still need confirmation)
Owner: Ryan Cochran (final authority) · Reviewer: DS SME (Christos Batsios / Gabor Korosi) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

The 4th data layer: operator news and world/market events. How we use them to add context — and the
firm guardrail that we never let them predict prices or override records. This is the lowest-authority
layer and the easiest to misuse, so its guardrails are non-negotiable.

## 1. Purpose & scope
Govern the use of external market/operator context: what it is, how we use it (and don't), and the
honesty framing. In scope: the price-lever connection, citation/dating, the no-prediction rule. Out
of scope: realized-price modeling (`Playbook_Pricing_And_Realization.md`) and the canonical price
deck (`data-architecture` / `oil_gas_history_future`).

## 2. What this layer is
- Operator news (M&A, capital plans, rig moves) relevant to the owner's operator.
- Market context: oil (WTI), gas (Henry Hub), OPEC+ decisions, inventories (EIA), LNG, geopolitics.
- **Authority: lowest.** Always cited and dated. Never overrides owner uploads, our models, or
  public records.

## 3. How we use it (and don't)
- **Do:** give dated, cited context ("Oil traded in the low-$70s this month; commonly-cited reasons
  in the press include an OPEC+ decision, a reported EIA inventory draw, and geopolitical risk").
- **Do:** connect it to the owner via the **price lever** ("your last check used about $70 oil; if
  it slipped toward $60, your check would be ~12–14% lighter on price alone").
- **Don't:** predict where prices are going.
- **Don't:** let a news item change a number that comes from a higher-authority source.

## 4. Inputs
Public web/news (cited), benchmark prices (`getspotprices`, `getmarketupdatecharts`), operator data
(`Operatordata`, `OperatorPresentation`, `compare-operators-data`). The realized-price math lives in
the Pricing playbook; this layer supplies context, not the deck.

## 5. Output
- The Monthly Report's "World & Market Watch" section (illustrative, dated, cited).
- Operator-context notes attached to activity items.
- Inputs to materiality (a relevant operator event may be worth surfacing).

## 6. Guardrails (non-negotiable)
1. **No price predictions** (Non-Negotiable #2) — show the lever, not a forecast.
2. **Cite and date** every external claim.
3. **Never override** records/models/owner data with web context.
4. Keep it **relevant** to the owner's operator/area (geofence still applies).

## 7. Honesty framing
Always label this section as context, not a forecast: "What this means for you — not a prediction:
…". The reader should never mistake market commentary for a guarantee about their check.

## 8. Good vs bad framing
| Good | Bad |
|---|---|
| "Not a prediction: oil traded near $70 this month; if it slipped to $60, your check would be ~12–14% lighter on price alone." | "Oil is heading to $60, so your check will drop." |
| "Per [cited source, dated], OPEC+ announced…" | (uncited market claim) |

## 9. Anti-patterns
Predicting prices; uncited/undated claims; letting news override an owner-doc or model number;
surfacing irrelevant (out-of-area/operator) market noise.

## 10. QA checklist
☐ Cited + dated ☐ Lowest authority (never overrides) ☐ Connected via the price lever ☐ No
prediction ☐ Relevant to the owner's operator/area ☐ Labeled "not a prediction."

## 11. Evidence notes & gaps (TODO)
Define the trusted-source list and citation format; set how often market context refreshes. The
guardrails and the price-lever pattern are confirmed from v0.1.
