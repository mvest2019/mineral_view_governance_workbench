# Mineral View — Playbook: Spatial & Offset Analysis

Status: ENHANCED (v0.2 — preserves v0.1; radius/zone-matching/offset scoring still need SME confirmation)
Owner: Ryan Cochran (final authority) · Reviewer: DS SME (Christos Batsios / Gabor Korosi) · Maintainer: Nikhil Salunke
Last Updated: 2026-06-23
Applies To: Mineral View only

How we compute distance, adjacency, and "nearby" rigorously, so a neighbor's activity is handled
correctly and an owner is **never** shown irrelevant far-away activity. This is the geofence behind
every owner answer.

## 1. Purpose & scope
Govern the spatial relevance layer: distance/adjacency, the relevance radius + zone matching, and
the offset-intensity score. In scope: the geofence that scopes every answer/report. Out of scope:
how offset intensity is used for drilling odds (`Playbook_AcreWell_And_Well_Probability.md`) and
coordinate storage/datum rules (`map-gis-governance.md`).

## 2. Why it matters
A Goliad County owner must never be shown Andrews County activity as if it were relevant. Relevance
is spatial first: what is genuinely near this owner's unit, in the same zone.

## 3. Inputs (data layers)
- **Layer 1/3:** the owner's lease/unit geometry; nearby leases, wells, permits, operators.
- **Backed by:** PostGIS (the heavy `st_*` stored functions), `getnearbydevelopment(ByLocation)`,
  `ShowNearbyLeases`, `getNeighboringLeasesData`, `getRelativeLeases`, the map API's nearby/offset
  endpoints; geometry from `bottomlocation`/`surfacelocation` (NAD27 **and** NAD83) and trajectory
  from `directional_survey_child`.
- **Coordinate note (MUST):** in storage `bhl_x` = latitude and `bhl_y` = longitude (opposite the
  usual GIS convention); use the correct datum consistently and validate within Texas bounds
  (`map-gis-governance.md`).

## 4. Method (to confirm with SME)
- **Distance/adjacency:** PostGIS spatial relations (intersects, distance, buffer) on lease/well
  geometry.
- **Relevance radius:** define "nearby" by distance **and** same formation/zone (a well 1.2 miles
  away in the same Lower Eagle Ford zone is relevant; a far one, or a different zone, is not).
  _(confirm the radius and zone-matching rules.)_
- **Offset intensity:** summarize how much activity surrounds the unit (a score) feeding
  well-probability.
- **Geofence:** scope every answer/report to the owner's relevant area; filter out the rest.

> Exact radius, zone-matching, and offset-intensity scoring are `TODO` — fill from SME and the
> spatial/zone/supergroup pipeline.

## 5. Outputs
- The set of relevant neighbors/offsets for an owner.
- An offset-intensity input to `Playbook_AcreWell_And_Well_Probability.md`.
- The geofence used by `Answer_Routing_Playbook.md` and the relevance rules.

## 6. Guardrails
- Never surface activity outside the owner's relevant area (Non-Negotiable #7 scope; relevance).
- A neighbor's well **doesn't pay the owner** — frame it as a signal ("the rock around you is
  productive"), not income.
- Coordinate/datum mistakes silently mislocate owners — validate Texas bounds and axis orientation.

## 7. Good vs bad framing
| Good | Bad |
|---|---|
| "Three relevant offset wells within your zone and radius — a productive-rock signal for you." | "A well in another county just came online — good news for you." |
| "Nearby same-zone result de-risks your unit." | "Your neighbor's production will be in your check." |

## 8. Anti-patterns
Showing out-of-area/out-of-zone activity as relevant; treating `bhl_x` as longitude; mixing
NAD27/83; implying a neighbor's well is owner income; inventing the radius/zone rules.

## 9. QA checklist
☐ Geofence scopes the answer ☐ Relevance = distance AND zone ☐ Offset intensity computed ☐
Coordinates valid in Texas + correct datum + axis orientation ☐ Neighbor-well framed as signal ☐
No out-of-area leakage.

## 10. Evidence notes & gaps (TODO)
Document the relevance radius, zone-matching, and offset-intensity formula; align with the
Relevance/Geofencing rules. Confirm the PostGIS `st_*` function set and the NAD27/83 handling in
`getnearbydevelopment`.
