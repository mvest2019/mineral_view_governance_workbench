# Mineral View — Answer-Routing Playbook (the spine)

Status: ENHANCED (v0.2 — preserves v0.1; routing table expands as question types are added)
Owner: Ryan Cochran (final authority) · Reviewer: DS SME (Christos Batsios / Gabor Korosi) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

The spine of the owner-intelligence system: how an owner question becomes an answer. It identifies
intent, pulls the right dossier sections, runs the right playbooks, rates confidence, scopes to the
owner, phrases for the persona, and attaches the disclaimer. Every other playbook plugs into this
spine; the report and the chatbot both run it so they never disagree.

## 1. Purpose & scope
Govern the end-to-end routing of an owner question to a complete, scoped, disclaimed answer. In
scope: the flow, the intent→recipe table, the answer shape, the routing rules. Out of scope: the
math inside each playbook (the referenced playbooks) and persona phrasing
(`Customer_Communication_Style_Guide.md`).

## 2. Flow
```
owner question
   │
   ▼
identify intent + the recipe to run
   │
   ├─► pull the relevant Owner Dossier sections
   ├─► apply the Glossary (definitions)
   ├─► run the math playbooks (decline, revenue, pricing, acre/well, spatial)
   ├─► rate the output via Confidence & Data-Quality
   ├─► scope to the owner's own area (geofence — Spatial & Offset)
   ├─► phrase for the owner's persona (Style Guide)
   └─► append the right disclaimer (Compliance & Disclaimers)
   ▼
answer = plain English + range + confidence + reasons-it-could-be-wrong + disclaimer
```

## 3. Intent → recipe (starter routing table)
| Owner asks… | Pull from dossier | Run playbooks | Disclaimer |
|---|---|---|---|
| "Will my check stay steady (6 mo)?" | ownership, leases, wells, production, revenue | Decline, Revenue & Royalty, Pricing, Confidence | Income forecast |
| "What's my interest worth?" | ownership, valuation, offer | Acre/Well (upside), Mvestimate, Confidence | Valuation |
| "Will they drill more wells on me?" | unit, leases (clauses), offsets | Acre/Well & Well-Probability, Spatial & Offset | Drilling likelihood |
| "What's happening near me?" | offsets, activity | Spatial & Offset, Market & World Context | Activity likelihood |
| "Should I sell / take this offer?" | offer, valuation | (none — neutral) | Buy-offer neutrality → route to a person |

## 4. Rules
1. **Always produce the full answer shape:** plain English + range + confidence + reasons + disclaimer.
2. **Scope first:** never show an owner activity outside their relevant area (geofence).
3. **Confidence is mandatory:** if the data can't support an answer, say "we can't reliably tell you."
4. **Numbers trace to sources** (Non-Negotiable #11).
5. **Sell/lease/estate questions** are routed to a person, never answered with advice.
6. **The report and the chatbot use this same spine** so they never disagree.

## 5. Slice approach
Prove the whole spine on one question end-to-end before scaling. Slice #1: "Will my revenue be
consistent for the next six months?" Then add one new question or persona per slice, reusing this
spine.

## 6. Worked example (slice #1)
Q: "Will my check stay steady for 6 months?" → intent = income-stability → pull ownership/leases/
wells/production/revenue → run Decline (volume), Revenue & Royalty (net check), Pricing (realized
price as a lever), Confidence (band) → geofence to the owner's unit → phrase for the owner persona →
attach the income-forecast disclaimer → answer: plain-English trajectory + range + confidence +
"reasons it could be wrong" (young well, price moves, operator timing) + disclaimer.

## 7. Anti-patterns
Skipping any element of the answer shape; answering a sell/lease/estate question with advice;
leaking out-of-area activity; producing a number with no confidence/disclaimer; the report and
chatbot diverging because they didn't run the same spine.

## 8. QA checklist
☐ Intent + recipe identified ☐ Correct dossier sections pulled ☐ Right playbooks run ☐ Confidence
rated ☐ Geofenced to owner ☐ Persona phrasing ☐ Disclaimer attached ☐ Numbers trace to sources ☐
Sell/lease/estate routed to a person.

## 9. Evidence notes & gaps (TODO)
Expand the intent→recipe table as new question types are supported; encode the geofence radius
rules from `Playbook_Spatial_And_Offset.md`. The five starter recipes are confirmed from v0.1.
