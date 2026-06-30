# Map & GIS Governance

> **Status:** ENHANCED (deep) · **Owner:** Nikhil Salunke · **Reviewer:** DS SME · **Last Updated:** 2026-06-23
> **Review cadence:** Quarterly + on map-data change · **Covers:** `MviewMapAPI`, `New_Map_Final_Code`, map UI · **Companion:** `data-architecture-governance.md`, `data-provenance-and-lineage-governance.md`.

---

## 1. Purpose & scope
Govern the Texas map: its data sources, spatial accuracy, coordinate handling, scope, and the content/disclaimer rules on map surfaces. The map is a primary trust surface — it visually asserts "we know where your wells are," so coordinate discipline and Texas-scope enforcement are non-negotiable.

## 2. Source-of-truth (MUST)
Map collections are **built from Postgres** (production + GIS tables) into Mongo `Linkage_data` per-county collections via `New_Map_Final_Code`. Postgres is authoritative for coordinates; Mongo serves the map; Mongo never overrides a Postgres coordinate.

## 3. Coordinate handling (MUST)
| Rule | Detail |
|---|---|
| Schema quirk | `bhl_x` stores **latitude**, `bhl_y` stores **longitude** (opposite GIS convention) — a frequent bug source |
| Datums | Source tables carry both **NAD27** and **NAD83** (`bottomlocation`, `surfacelocation`); use the correct datum consistently |
| Trajectory | `directional_survey_child` (~8M points: md/inclination/azimuth/tvd/x/y) is the trajectory source |
| Validation | All served coordinates validate within Texas bounds before rendering |

## 4. Texas scope & display
Map renders **Texas only** — RRC Districts 1–10 (incl. 7B/7C/8A). API-42 (Texas) prefix search. "Zoom to level 11 to see wells." Regulatory/Quick View toggles. **Must not** render or imply non-Texas coverage (constitution P1).

## 5. Linkage & formation
County/operator/well linkage served from Mongo; formation tops shown where confirmed. Lease/well/operator keys **must** stay consistent with Postgres so the dossier and map agree.

## 6. Disclaimers
Map data is public RRC-derived; **must** carry provenance and **must not** be presented as survey-grade or as a legal boundary source.

## 7. Performance
Tile/layer queries **should** be cached; heavy queries gated by tier (`pricing-and-plan-governance.md`); the relevance radius (1/3/5-mile) is a confirmed UI concept.

## 8. Spatial QA checklist
☐ Coordinates within Texas ☐ `bhl_x`/`bhl_y` orientation correct ☐ Correct datum (NAD27/83) ☐ Keys join to Postgres ☐ Texas-only ☐ Provenance/disclaimer present ☐ Performance acceptable ☐ Tier gating applied.

## 9. Anti-patterns
Treating `bhl_x` as longitude; mixing datums; serving Mongo coordinates that disagree with Postgres; implying survey-grade accuracy; rendering non-Texas.

## 10. Evidence notes & gaps
Districts, API-42, zoom-11, NAD27/83, and the `bhl_x/bhl_y` quirk confirmed from screenshots + Postgres schema; pipeline from `New_Map_Final_Code`. **Not confirmed from the uploaded files:** tile/cache configuration and exact formation-tops coverage.

---

## Addendum (2026-06-30) — upstream geospatial source (MView_X)

The map's well/lease geometry originates in the **MView_X** ArcGIS pipeline (`geospatial-directional-survey-pipeline-governance.md`), not in the serving layer. Relevant rules:

- **Well points & lines:** SHL/BHL points and the dissolved well-line layer come from MView_X Stage 1; the map renders them but is never their source of truth.
- **Trajectories:** 3D well trajectories are built via **minimum curvature** from directional surveys (MWD/GYRO); synthetic trajectories use a **straight line SHL → landing → BHL** (the validated rule — a perpendicular bend doubled mean error and is prohibited without new evidence).
- **Derived geometry:** **geodetic lines** (Stage 6), **grids** (Stage 7), zones, supergroups, and reservoir names are derived and must stay consistent with the Stage 1 coordinates; regenerate downstream rather than patching map outputs in place.
- **Freshness:** map spatial products are only as current as their **RRC pull vintage**; do not imply a freshness the underlying RRC pull does not support.
