# Geospatial & Directional-Survey Pipeline Governance (MView_X)

> **Status:** NEW (deep) · **Owner:** Nikhil Salunke · **Reviewer:** DS SME (Christos Batsios / Gabor Korosi) · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-06-30 · **Review cadence:** Quarterly + on any pipeline-step change
> **Source:** the `MView_X` repository (README, `docs/`, `scripts/`, `notebooks/`, `config/templates/`, `arcgis_toolboxes/`) and Nikhil Salunke's project work summary (2026-06).
> **Companion:** `rrc-data-governance.md`, `map-gis-governance.md`, `texas-oil-and-gas-domain-governance.md`, `Data_Provenance_And_Freshness.md`, `quality-assurance-checklists.md`, `_REPO_INVENTORY.md`.

---

## 1. Purpose & scope

Govern **MView_X** — the ArcGIS Pro workflow that prepares Texas RRC well data into the spatial products the platform depends on: cleaned well points, processed directional surveys, grouped wells, generated zones, recalculated supergroups, geodetic lines, grids, spatiotemporal activity, and reservoir naming.

MView_X is the **upstream geospatial engine** for the map, the nearby-well / offset analytics, lease-level rollups, and reservoir/zone context. Errors here propagate silently into every spatial surface, so the workflow is deliberately **checkpoint-driven** with mandatory manual QA gates — it is **not** a single continuous automated script.

**In scope:** the nine-stage MView_X workflow, its inputs/outputs, coordinate handling, the manual QA checkpoints, and the rules that keep its outputs trustworthy. **Out of scope:** the decline/EUR math (`Playbook_Decline_And_Forecast.md`), the map serving layer (`map-gis-governance.md`), and the RRC ingestion contract (`rrc-data-governance.md`) — MView_X consumes RRC data after that ingestion.

## 2. Authoritative workflow order (MUST run in sequence)

The README defines the canonical order. Stages **must** run in sequence; several stages have a manual checkpoint that **must** pass before the next stage is safe to run.

| # | Stage | Repo path | Output role |
|---|---|---|---|
| 1 | Raw RRC spatial data preparation | `scripts/01_raw_rrc_preparation/` | Standardized SHL/BHL well points + well-line layer |
| 2 | Lateral linkage preparation | `scripts/02_linkage_preparation/` | Lateral data prepared for directional-survey processing |
| 3 | Directional survey processing | `scripts/03_directional_survey/` | Cleaned surveys → minimum-curvature 3D trajectories → perforation geometry |
| 4 | DSGW / RRCW preparation for merge | `scripts/04_dsgw_rrcw_merge_prep/` | Directional-survey wells + RRC wells prepared for merge |
| 5 | Grouping and zone generation | `scripts/05_grouping_and_zones/` | Wells grouped (surface/bottom-hole); zones generated |
| 6 | SuperGroup Z-recalculation + geodetic lines | `scripts/06_supergroups_zrecalc_geodetic/` | Recalculated local supergroups; geodetic line geometry |
| 7 | Grid creation | `scripts/07_grid_creation/` | Spatial grid for analysis |
| 8 | Spatiotemporal analysis | `scripts/08_spatiotemporal_analysis/` | Well-activity over space and time |
| 9 | Reservoir naming | `scripts/09_reservoir_naming/` | Public reservoir/zone naming (Permian public naming toolbox) |

## 3. Stage 1 — Raw RRC spatial data preparation (MUST)

Prepares raw Texas RRC spatial data immediately after download into MView_X-ready geodatabase layers. The workflow:
- **Consolidates** county-level RRC shapefile downloads and statewide API DBF files.
- **Creates normalized API identifiers** so records key consistently (API-42 discipline, see `texas-oil-and-gas-domain-governance.md`).
- **Filters** to valid point records.
- **Projects** surface-hole (SHL) and bottom-hole (BHL) points to a **Texas statewide projected coordinate system** and calculates point coordinates.
- **Builds an operational well-line layer** by dissolving duplicated line segments.

**Rule:** coordinate authority for SHL/BHL flows from this stage; downstream stages must not silently re-project or override these coordinates (consistent with `map-gis-governance.md` §2–3, where Postgres is authoritative for coordinates).

## 4. Stage 3 — Directional survey processing (MUST, checkpoint-heavy)

Converts the ArcGIS notebook workflow into repo-ready, **checkpoint-driven** scripts (`01`–`07`). Surveys are normally processed **separately for MWD and GYRO** survey types.

Processing stages:
1. **Compile** raw survey Excel files (`01_compile_excel_surveys.py`) → `combined_output.csv`, `summary_statistics.xlsx`, `error_log.txt`. Checks: invalid measured depth (MD), duplicate sequential MD/Inc/Azimuth rows, impossible inclination/azimuth values.
2. **Import + initial QC** in ArcGIS (`02`).
3. **Sort, deduplicate, select** the best usable survey per trajectory (`03`).
4. **Minimum-curvature calculation + 3D spatial build** (`04`) — derives trajectory geometry from MD/Inc/Azimuth using the minimum-curvature method and builds 3D trajectory features.
5. **Linkage review + final filter** (`05`).
6. **Trajectory similarity review** (`06`).
7. **Perforation MD + output lines** (`07`) — derives perforation-position geometry.

**Trajectory rule (validated, MUST):** synthetic well trajectories are built as a **straight line SHL → landing → BHL**. Empirical validation across tens of thousands of wells showed that adding a perpendicular "bend" to synthetic trajectories **doubled mean error** and matched reality only at coin-flip level. **Do not** reintroduce a bend term into synthetic trajectories without new empirical evidence and DS-SME + Ryan approval.

## 5. Manual checkpoints (MUST pass before continuing)

The workflow intentionally stops for human QA/QC. These are governance gates, not optional steps.

- **Checkpoint 1 — Problematic source surveys:** review `summary_statisticsX0_ALL` rows where `To_Check = 'MUST_CHECK'`. Typical triggers: high row-removal ratio, impossible inclination/azimuth, MD-sequence errors, very small `MD_max`, random zero measured depths.
- **Checkpoint — Trajectory similarity:** stage `06` surfaces trajectories that look near-duplicate or anomalous for human decision before they propagate.
- **General rule:** if a stage emits an `error_log.txt` / `MUST_CHECK` flag, the operator resolves or consciously accepts each item **before** running the next stage. No stage may be auto-chained past an unreviewed checkpoint.

## 6. Coordinate & geometry discipline (MUST)

- Project to the **Texas statewide projected coordinate system** used in Stage 1; do not mix geographic/projected CRS within a stage.
- **Geodetic lines** (Stage 6) and grid geometry (Stage 7) are derived geometry — they inherit, and must remain consistent with, the Stage 1 SHL/BHL coordinates.
- SHL/BHL points, well-lines, trajectories, perforation geometry, zones, supergroups, and reservoir names must remain **mutually consistent**; a change in an upstream stage requires re-running downstream stages, not patching outputs in place.

## 7. Provenance & vintage (MUST — ties to P4)

Every MView_X output carries, at minimum, its **RRC pull vintage** (the source RRC download date), its **survey source type** (MWD vs GYRO), and the **pipeline stage** that produced it. Because RRC retroactively rewrites history (`rrc-data-governance.md`), spatial products are only as current as their RRC vintage; the served map/offset surfaces must not imply a freshness the underlying RRC pull does not support.

## 8. Configuration & tooling

- Editable configuration lives in `config/templates/` (e.g. `directional_survey_config_TEMPLATE.py`). Operators copy the template, never edit a shared config in place.
- Custom ArcGIS toolboxes live in `arcgis_toolboxes/` (`MVestXtools.tbx` plus recalc/geodetic/spatiotemporal `.py` tools); the Permian public-naming toolbox (`Permian_PublicNaming.pyt`) governs Stage 9.
- Environment: **ArcGIS Pro Python with `arcpy`** — these scripts are not portable to a plain Python environment without `arcpy`.

## 9. Change control

- Any change to stage order, the minimum-curvature method, the straight-line trajectory rule, the coordinate system, or a manual-checkpoint threshold is a **governed change**: DS-SME review + Ryan approval, logged in `DECISION_LOG.md`.
- New stages or scripts are added to `_REPO_INVENTORY.md` and reflected here.
- This file is read-only context for AI surfaces; it changes only through the approved commit flow.

## 10. Open items (for Ryan / DS SME)

- Confirm the exact name/EPSG of the "Texas statewide projected coordinate system" so it can be stated explicitly here (currently described by role, not by code).
- Confirm whether MView_X outputs land in Postgres, a file geodatabase, or both, and how they reach the serving map (`map-gis-governance.md`).
- Confirm the canonical handling when MWD and GYRO surveys disagree for the same trajectory (precedence rule).
