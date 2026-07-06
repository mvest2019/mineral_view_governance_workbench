# PostgreSQL Server — Schema Documentation

> **Read-only metadata export.** No data was modified; only the system catalogs (`pg_catalog` / `information_schema`) were queried to list databases, schemas, tables, columns and row estimates.

| Property | Value |
|---|---|
| Host | `10.20.30.1:5432` |
| Server version | PostgreSQL 15.4 (64-bit) |
| Login role | `postgres` |
| Row counts | Planner estimates (`pg_class.reltuples`); `n/a` = never analyzed |

## Databases overview

| # | Database | Schemas | Tables / Views | Notes |
|---|---|---|---|---|
| 1 | **Archive** | 3 | 36 |  |
| 2 | **MviewDownload** | 5 | 405 |  |
| 3 | **Production** | 1 | 95 |  |
| 4 | **postgres** | 1 | 0 | empty / default maintenance DB |
| 5 | **spatiotemporal_analysis** | 1 | 76 |  |

---

## Database: `Archive`

*Historical/archived data warehouse — yearly mineral-owner snapshots, scraped RRC W-1/W-2 permit & completion form data, and PostGIS spatial layers.*

### Schema: `gisdata`  ·  7 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`gis_districts`](#archive-gisdata-gis_districts) | table | n/a | 5 | GIS polygon layer of Texas RRC administrative districts (district code + geometry). |
| [`gis_grids`](#archive-gisdata-gis_grids) | table | 1,484 | 5 | GIS polygon layer of lease grid blocks keyed by lease number, with shape length/area and geometry. |
| [`gis_leases_centeriod`](#archive-gisdata-gis_leases_centeriod) | table | 16,092 | 9 | Centroid points of leases (lat/long, lease id, district) used to plot leases on the map. |
| [`gis_rrc_wells`](#archive-gisdata-gis_rrc_wells) | table | 49,639 | 8 | GIS point layer of RRC wells with API numbers and status, used for well mapping. |
| [`gis_surveylines_2024`](#archive-gisdata-gis_surveylines_2024) | table | 1,077,365 | 4 | Survey line geometry (abstract/survey boundary lines) for 2024 land-survey mapping. |
| [`gis_surveys`](#archive-gisdata-gis_surveys) | table | 311,284 | 6 | Land survey polygons (abstract/survey level) with geometry for the base map. |
| [`gis_surveystring_2024`](#archive-gisdata-gis_surveystring_2024) | table | 479,619 | 10 | Survey map text labels (annotation strings, font, angle, position) for 2024 survey rendering. |

<a id="archive-gisdata-gis_districts"></a>
#### `gisdata.gis_districts`  (table)

- **Estimated rows:** n/a
- **What it holds:** GIS polygon layer of Texas RRC administrative districts (district code + geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `gid` | integer | ✔ | nextval('gisdata.gis_districts_gid_seq'::regclass) |
| 2 | `dis_code` | character varying(254) |  |  |
| 3 | `shape_leng` | numeric |  |  |
| 4 | `shape_area` | numeric |  |  |
| 5 | `geom` | geometry(MultiPolygon) |  |  |

<a id="archive-gisdata-gis_grids"></a>
#### `gisdata.gis_grids`  (table)

- **Estimated rows:** 1,484
- **What it holds:** GIS polygon layer of lease grid blocks keyed by lease number, with shape length/area and geometry.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `gid` | integer | ✔ | nextval('gisdata.gis_grids_gid_seq'::regclass) |
| 2 | `lease_num` | numeric |  |  |
| 3 | `shape_leng` | numeric |  |  |
| 4 | `shape_area` | numeric |  |  |
| 5 | `geom` | geometry(MultiPolygon) |  |  |

<a id="archive-gisdata-gis_leases_centeriod"></a>
#### `gisdata.gis_leases_centeriod`  (table)

- **Estimated rows:** 16,092
- **What it holds:** Centroid points of leases (lat/long, lease id, district) used to plot leases on the map.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `gid` | integer | ✔ | nextval('gisdata.gis_leases_centeriod_gid_seq'::regclass) |
| 2 | `lease_numb` | character varying(254) |  |  |
| 3 | `dlease_id` | character varying(254) |  |  |
| 4 | `long` | numeric |  |  |
| 5 | `lat` | numeric |  |  |
| 6 | `lease` | character varying(254) |  |  |
| 7 | `district` | character varying(254) |  |  |
| 8 | `orig_fid` | double precision |  |  |
| 9 | `geom` | geometry(Point) |  |  |

<a id="archive-gisdata-gis_rrc_wells"></a>
#### `gisdata.gis_rrc_wells`  (table)

- **Estimated rows:** 49,639
- **What it holds:** GIS point layer of RRC wells with API numbers and status, used for well mapping.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `gid` | integer | ✔ | nextval('gisdata.gis_rrc_wells_gid_seq'::regclass) |
| 2 | `idx` | character varying(254) |  |  |
| 3 | `api` | character varying(8) |  |  |
| 4 | `api10` | character varying(10) |  |  |
| 5 | `stcode` | character varying(2) |  |  |
| 6 | `api_status` | character varying(254) |  |  |
| 7 | `shape_leng` | numeric |  |  |
| 8 | `geom` | geometry(MultiLineString) |  |  |

<a id="archive-gisdata-gis_surveylines_2024"></a>
#### `gisdata.gis_surveylines_2024`  (table)

- **Estimated rows:** 1,077,365
- **What it holds:** Survey line geometry (abstract/survey boundary lines) for 2024 land-survey mapping.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `gid` | integer | ✔ | nextval('gisdata.gis_surveylines_2024_gid_seq'::regclass) |
| 2 | `ltype` | integer |  |  |
| 3 | `shape_leng` | numeric |  |  |
| 4 | `geom` | geometry(MultiLineString) |  |  |

<a id="archive-gisdata-gis_surveys"></a>
#### `gisdata.gis_surveys`  (table)

- **Estimated rows:** 311,284
- **What it holds:** Land survey polygons (abstract/survey level) with geometry for the base map.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `gid` | integer | ✔ | nextval('gisdata.gis_surveys_gid_seq'::regclass) |
| 2 | `level1_sur` | character varying(32) |  |  |
| 3 | `abstract_l` | character varying(11) |  |  |
| 4 | `shape_leng` | numeric |  |  |
| 5 | `shape_area` | numeric |  |  |
| 6 | `geom` | geometry(MultiPolygon) |  |  |

<a id="archive-gisdata-gis_surveystring_2024"></a>
#### `gisdata.gis_surveystring_2024`  (table)

- **Estimated rows:** 479,619
- **What it holds:** Survey map text labels (annotation strings, font, angle, position) for 2024 survey rendering.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `gid` | integer | ✔ | nextval('gisdata.gis_surveystring_2024_gid_seq'::regclass) |
| 2 | `textstring` | character varying(254) |  |  |
| 3 | `fontname` | character varying(254) |  |  |
| 4 | `fontsize` | numeric |  |  |
| 5 | `angle` | numeric |  |  |
| 6 | `just` | character varying(2) |  |  |
| 7 | `name` | character varying(40) |  |  |
| 8 | `id` | double precision |  |  |
| 9 | `symbol` | double precision |  |  |
| 10 | `geom` | geometry(Point) |  |  |

### Schema: `public`  ·  13 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`archive_mineralowner_2018`](#archive-public-archive_mineralowner_2018) | table | 60,940 | 6 | Historical snapshot (2018) of mineral owners: county, owner number, name and address. |
| [`archive_mineralowner_2019`](#archive-public-archive_mineralowner_2019) | table | 136,582 | 6 | Historical snapshot (2019) of mineral owners: county, owner number, name and address. |
| [`archive_mineralowner_2021`](#archive-public-archive_mineralowner_2021) | table | 5,063 | 6 | Historical snapshot (2021) of mineral owners: county, owner number, name and address. |
| [`archive_mineralowner_2022`](#archive-public-archive_mineralowner_2022) | table | 5,473 | 6 | Historical snapshot (2022) of mineral owners: county, owner number, name and address. |
| [`archive_mineralownerproperty_2018`](#archive-public-archive_mineralownerproperty_2018) | table | 258,443 | 12 | Historical (2018) owner-to-property links: lease/district, royalty interest (RI), value and lease name per mineral owner. |
| [`archive_mineralownerproperty_2019`](#archive-public-archive_mineralownerproperty_2019) | table | 681,778 | 12 | Historical (2019) owner-to-property links: lease/district, royalty interest, value and lease name per mineral owner. |
| [`archive_mineralownerproperty_2021`](#archive-public-archive_mineralownerproperty_2021) | table | 14,026 | 12 | Historical (2021) owner-to-property links: lease/district, royalty interest, value and lease name per mineral owner. |
| [`archive_mineralownerproperty_2022`](#archive-public-archive_mineralownerproperty_2022) | table | 49,040 | 14 | Historical (2022) owner-to-property links, adding mineral account number/sequence; royalty interest, value and lease name per owner. |
| [`archive_w1_permit_details`](#archive-public-archive_w1_permit_details) | table | 9,690 | 68 | Wide archive of RRC W-1 drilling-permit details (68 cols): API, operator, dates, location/lat-long, depths, field and permit attributes. |
| [`geography_columns`](#archive-public-geography_columns) | view | n/a | 7 | PostGIS system view listing geography columns and their SRID/type. |
| [`geometry_columns`](#archive-public-geometry_columns) | view | n/a | 7 | PostGIS system view listing geometry columns and their SRID/type. |
| [`gis_leases_centeriod`](#archive-public-gis_leases_centeriod) | table | 16,092 | 9 | Lease centroid points (duplicate of the gisdata layer) in the public schema. |
| [`spatial_ref_sys`](#archive-public-spatial_ref_sys) | table | 8,500 | 5 | PostGIS reference table of spatial coordinate systems (SRID definitions). |

<a id="archive-public-archive_mineralowner_2018"></a>
#### `public.archive_mineralowner_2018`  (table)

- **Estimated rows:** 60,940
- **What it holds:** Historical snapshot (2018) of mineral owners: county, owner number, name and address.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer | ✔ | nextval('mineralowner_2018_id_seq'::regclass) |

<a id="archive-public-archive_mineralowner_2019"></a>
#### `public.archive_mineralowner_2019`  (table)

- **Estimated rows:** 136,582
- **What it holds:** Historical snapshot (2019) of mineral owners: county, owner number, name and address.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer | ✔ | nextval('mineralowner_2019_id_seq'::regclass) |

<a id="archive-public-archive_mineralowner_2021"></a>
#### `public.archive_mineralowner_2021`  (table)

- **Estimated rows:** 5,063
- **What it holds:** Historical snapshot (2021) of mineral owners: county, owner number, name and address.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer | ✔ | nextval('mineralowner_2021_id_seq'::regclass) |

<a id="archive-public-archive_mineralowner_2022"></a>
#### `public.archive_mineralowner_2022`  (table)

- **Estimated rows:** 5,473
- **What it holds:** Historical snapshot (2022) of mineral owners: county, owner number, name and address.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer | ✔ | nextval('mineralowner_2022_id_seq'::regclass) |

<a id="archive-public-archive_mineralownerproperty_2018"></a>
#### `public.archive_mineralownerproperty_2018`  (table)

- **Estimated rows:** 258,443
- **What it holds:** Historical (2018) owner-to-property links: lease/district, royalty interest (RI), value and lease name per mineral owner.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ |  |

<a id="archive-public-archive_mineralownerproperty_2019"></a>
#### `public.archive_mineralownerproperty_2019`  (table)

- **Estimated rows:** 681,778
- **What it holds:** Historical (2019) owner-to-property links: lease/district, royalty interest, value and lease name per mineral owner.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ |  |

<a id="archive-public-archive_mineralownerproperty_2021"></a>
#### `public.archive_mineralownerproperty_2021`  (table)

- **Estimated rows:** 14,026
- **What it holds:** Historical (2021) owner-to-property links: lease/district, royalty interest, value and lease name per mineral owner.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ |  |

<a id="archive-public-archive_mineralownerproperty_2022"></a>
#### `public.archive_mineralownerproperty_2022`  (table)

- **Estimated rows:** 49,040
- **What it holds:** Historical (2022) owner-to-property links, adding mineral account number/sequence; royalty interest, value and lease name per owner.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |

<a id="archive-public-archive_w1_permit_details"></a>
#### `public.archive_w1_permit_details`  (table)

- **Estimated rows:** 9,690
- **What it holds:** Wide archive of RRC W-1 drilling-permit details (68 cols): API, operator, dates, location/lat-long, depths, field and permit attributes.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | bigint |  |  |
| 2 | `api` | text |  |  |
| 3 | `status_number` | text |  |  |
| 4 | `issued_date` | date |  |  |
| 5 | `status` | text |  |  |
| 6 | `filed` | text |  |  |
| 7 | `wellboreprofiles` | text |  |  |
| 8 | `filing_purpose` | text |  |  |
| 9 | `swr` | text |  |  |
| 10 | `horizontal_wellbore` | text |  |  |
| 11 | `stacked_lateral_parent_well_dp` | text |  |  |
| 12 | `perpendiculars` | text |  |  |
| 13 | `distanceone` | double precision |  |  |
| 14 | `directionone` | text |  |  |
| 15 | `distancetwo` | double precision |  |  |
| 16 | `directiontwo` | text |  |  |
| 17 | `spud_date` | date |  |  |
| 18 | `drilling_completed_date` | date |  |  |
| 19 | `surface_casing_date` | date |  |  |
| 20 | `completed_date` | date |  |  |
| 21 | `validated_date` | date |  |  |
| 22 | `status_suffi` | text |  |  |
| 23 | `submit_date` | date |  |  |
| 24 | `isscrape` | boolean |  |  |
| 25 | `new_api` | text |  |  |
| 26 | `updated_date` | date |  |  |
| 27 | `firstactivity_date` | date |  |  |
| 28 | `old_api` | text |  |  |
| 29 | `nad27x` | double precision |  |  |
| 30 | `nad27y` | double precision |  |  |
| 31 | `nadType` | text |  |  |
| 32 | `district` | text |  |  |
| 33 | `latitude` | double precision |  |  |
| 34 | `lease_no` | text |  |  |
| 35 | `nad27lat` | double precision |  |  |
| 36 | `nad83lat` | double precision |  |  |
| 37 | `longitude` | double precision |  |  |
| 38 | `lease_name` | text |  |  |
| 39 | `nad27longi` | double precision |  |  |
| 40 | `nad83longi` | double precision |  |  |
| 41 | `total_depth` | bigint |  |  |
| 42 | `well_number` | text |  |  |
| 43 | `nreatest_town` | text |  |  |
| 44 | `stateplanezone` | text |  |  |
| 45 | `nad27latdegrees` | double precision |  |  |
| 46 | `nad27latminutes` | double precision |  |  |
| 47 | `nad27latseconds` | double precision |  |  |
| 48 | `operator_number` | text |  |  |
| 49 | `well_status_code` | text |  |  |
| 50 | `nad27longidegrees` | double precision |  |  |
| 51 | `nad27longiminutes` | double precision |  |  |
| 52 | `nad27longiseconds` | double precision |  |  |
| 53 | `completed_well_type` | text |  |  |
| 54 | `currentoperate_number` | bigint |  |  |
| 55 | `surface_location_type` | text |  |  |
| 56 | `distance_from_nearest_town` | double precision |  |  |
| 57 | `direction_from_nearest_town` | text |  |  |
| 58 | `fieldno` | text |  |  |
| 59 | `fieldname` | text |  |  |
| 60 | `acres` | double precision |  |  |
| 61 | `county` | text |  |  |
| 62 | `api_number` | text |  |  |
| 63 | `wellborseprofiles` | text |  |  |
| 64 | `w1fields` | text |  |  |
| 65 | `w1exceptions` | text |  |  |
| 66 | `w1legeinformations` | text |  |  |
| 67 | `w1fieldresctriction` | text |  |  |
| 68 | `w1permitrestrictions` | text |  |  |

<a id="archive-public-geography_columns"></a>
#### `public.geography_columns`  (view)

- **Estimated rows:** n/a
- **What it holds:** PostGIS system view listing geography columns and their SRID/type.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `f_table_catalog` | name |  |  |
| 2 | `f_table_schema` | name |  |  |
| 3 | `f_table_name` | name |  |  |
| 4 | `f_geography_column` | name |  |  |
| 5 | `coord_dimension` | integer |  |  |
| 6 | `srid` | integer |  |  |
| 7 | `type` | text |  |  |

<a id="archive-public-geometry_columns"></a>
#### `public.geometry_columns`  (view)

- **Estimated rows:** n/a
- **What it holds:** PostGIS system view listing geometry columns and their SRID/type.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `f_table_catalog` | character varying(256) |  |  |
| 2 | `f_table_schema` | name |  |  |
| 3 | `f_table_name` | name |  |  |
| 4 | `f_geometry_column` | name |  |  |
| 5 | `coord_dimension` | integer |  |  |
| 6 | `srid` | integer |  |  |
| 7 | `type` | character varying(30) |  |  |

<a id="archive-public-gis_leases_centeriod"></a>
#### `public.gis_leases_centeriod`  (table)

- **Estimated rows:** 16,092
- **What it holds:** Lease centroid points (duplicate of the gisdata layer) in the public schema.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `gid` | integer | ✔ | nextval('gis_leases_centeriod_gid_seq'::regclass) |
| 2 | `lease_numb` | character varying(254) |  |  |
| 3 | `dlease_id` | character varying(254) |  |  |
| 4 | `long` | numeric |  |  |
| 5 | `lat` | numeric |  |  |
| 6 | `lease` | character varying(254) |  |  |
| 7 | `district` | character varying(254) |  |  |
| 8 | `orig_fid` | double precision |  |  |
| 9 | `geom` | geometry(Point) |  |  |

<a id="archive-public-spatial_ref_sys"></a>
#### `public.spatial_ref_sys`  (table)

- **Estimated rows:** 8,500
- **Primary key:** `srid`
- **What it holds:** PostGIS reference table of spatial coordinate systems (SRID definitions).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `srid` 🔑 | integer | ✔ |  |
| 2 | `auth_name` | character varying(256) |  |  |
| 3 | `auth_srid` | integer |  |  |
| 4 | `srtext` | character varying(2048) |  |  |
| 5 | `proj4text` | character varying(2048) |  |  |

### Schema: `scrapy_data`  ·  16 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`gasmeasurement_data`](#archive-scrapy_data-gasmeasurement_data) | table | 312,460 | 6 | Scraped gas-measurement records per test (tracking no, test date, method, gas produced during test). |
| [`gasmeasurementdatachild`](#archive-scrapy_data-gasmeasurementdatachild) | table | 229,735 | 13 | Child rows of gas measurements: per-run choke/orifice sizes, pressures, temperature, gravity and volume. |
| [`marketupdatesarchive`](#archive-scrapy_data-marketupdatesarchive) | table | 169,514 | 8 | Historical market/commodity price ticks (symbol, last price, change %, currency, datetime). |
| [`w1attachments`](#archive-scrapy_data-w1attachments) | table | 1,936,536 | 7 | Scraped W-1 permit attachments: file type, file/drive path linked to a status and API number (~1.9M rows). |
| [`w1comments`](#archive-scrapy_data-w1comments) | table | 1,860,633 | 5 | Scraped W-1 permit remarks/comments with entry date and author (~1.9M rows). |
| [`w1exceptions`](#archive-scrapy_data-w1exceptions) | table | 909,740 | 6 | Scraped W-1 rule exceptions (field, exception, docket number, resolution). |
| [`w1fieldrestrictions`](#archive-scrapy_data-w1fieldrestrictions) | table | 899,280 | 5 | Scraped W-1 field restrictions (field number, code, description). |
| [`w1form_jsondata`](#archive-scrapy_data-w1form_jsondata) | table | 21,925 | 2 | Raw scraped W-1 form payloads stored as JSON per record. |
| [`w1legalinformations`](#archive-scrapy_data-w1legalinformations) | table | 859,608 | 13 | Scraped W-1 legal land description (section, block, survey, abstract, township, league, labor, etc.). |
| [`w1permitrestrictions`](#archive-scrapy_data-w1permitrestrictions) | table | 1,597,455 | 4 | Scraped W-1 permit restrictions (code + restriction text), ~1.6M rows. |
| [`w2_acidfracturechild`](#archive-scrapy_data-w2_acidfracturechild) | table | 448,876 | 6 | Child rows of W-2 acid/fracture treatment: material type, depth, interval, operation type. |
| [`w2_completions_jsondata`](#archive-scrapy_data-w2_completions_jsondata) | table | 33,282 | 2 | Raw scraped W-2 completion form payloads stored as JSON. |
| [`w2_fielddata_pressurecalculationschild`](#archive-scrapy_data-w2_fielddata_pressurecalculationschild) | table | 75,380 | 7 | W-2 field pressure-test child rows: per-run choke size, wellhead pressure and flow temperature. |
| [`w2_operatorcertifications`](#archive-scrapy_data-w2_operatorcertifications) | table | 312,461 | 6 | W-2 operator certification block (printed name, title, phone, date certified) per tracking number. |
| [`w2_rrcremarks`](#archive-scrapy_data-w2_rrcremarks) | table | 312,461 | 9 | W-2 RRC remarks / linked sub-sections (casing, tubing, acid-fracture, potential test, gas measurement) per tracking number. |
| [`w2completionurls`](#archive-scrapy_data-w2completionurls) | table | n/a | 3 | Queue of W-2 completion source URLs and their scraped flag. |

<a id="archive-scrapy_data-gasmeasurement_data"></a>
#### `scrapy_data.gasmeasurement_data`  (table)

- **Estimated rows:** 312,460
- **Primary key:** `id`
- **What it holds:** Scraped gas-measurement records per test (tracking no, test date, method, gas produced during test).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('gasmeasurement_data_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `testdate` | date |  |  |
| 4 | `gasmeasurementmethod` | character varying |  |  |
| 5 | `gasproductionduringtest` | integer |  |  |
| 6 | `iswellpreflowed` | boolean |  |  |

<a id="archive-scrapy_data-gasmeasurementdatachild"></a>
#### `scrapy_data.gasmeasurementdatachild`  (table)

- **Estimated rows:** 229,735
- **Primary key:** `id`
- **What it holds:** Child rows of gas measurements: per-run choke/orifice sizes, pressures, temperature, gravity and volume.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('gasmeasurementdatachild_id_seq'::regclass) |
| 2 | `gasmeasurementdataid` | integer | ✔ |  |
| 3 | `runno` | integer |  |  |
| 4 | `linesize` | character varying |  |  |
| 5 | `oriforchokesize` | character varying |  |  |
| 6 | `oriforchoke24hr` | character varying |  |  |
| 7 | `staticpmorchoke` | character varying |  |  |
| 8 | `difference` | character varying |  |  |
| 9 | `flowtemp` | character varying |  |  |
| 10 | `temperature` | character varying |  |  |
| 11 | `gravity` | character varying |  |  |
| 12 | `compress` | character varying |  |  |
| 13 | `volume` | character varying |  |  |

<a id="archive-scrapy_data-marketupdatesarchive"></a>
#### `scrapy_data.marketupdatesarchive`  (table)

- **Estimated rows:** 169,514
- **What it holds:** Historical market/commodity price ticks (symbol, last price, change %, currency, datetime).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('scrapy_data.marketupdatesarchive_id_seq'::regclass) |
| 2 | `symbolname` | character varying |  |  |
| 3 | `lastprice` | numeric |  |  |
| 4 | `change` | numeric |  |  |
| 5 | `changepercentage` | numeric |  |  |
| 6 | `currency` | character varying |  |  |
| 7 | `datetime` | timestamp without time zone |  |  |
| 8 | `marketupdatetype` | character varying |  |  |

<a id="archive-scrapy_data-w1attachments"></a>
#### `scrapy_data.w1attachments`  (table)

- **Estimated rows:** 1,936,536
- **Primary key:** `id`
- **What it holds:** Scraped W-1 permit attachments: file type, file/drive path linked to a status and API number (~1.9M rows).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('w1attachments_id_seq'::regclass) |
| 2 | `status_number` | character varying | ✔ |  |
| 3 | `attachment_type` | character varying |  |  |
| 4 | `file_path` | character varying |  |  |
| 5 | `associtated_fields` | character varying |  |  |
| 6 | `drive_path` | character varying |  |  |
| 7 | `api_number` | character varying |  |  |

<a id="archive-scrapy_data-w1comments"></a>
#### `scrapy_data.w1comments`  (table)

- **Estimated rows:** 1,860,633
- **Primary key:** `id`
- **What it holds:** Scraped W-1 permit remarks/comments with entry date and author (~1.9M rows).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('w1comments_id_seq'::regclass) |
| 2 | `status_number` | character varying | ✔ |  |
| 3 | `remark` | text |  |  |
| 4 | `date_entered` | character varying |  |  |
| 5 | `entered_by` | character varying |  |  |

<a id="archive-scrapy_data-w1exceptions"></a>
#### `scrapy_data.w1exceptions`  (table)

- **Estimated rows:** 909,740
- **Primary key:** `id`
- **What it holds:** Scraped W-1 rule exceptions (field, exception, docket number, resolution).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('w1exceptions_id_seq'::regclass) |
| 2 | `status_number` | character varying | ✔ |  |
| 3 | `field` | character varying |  |  |
| 4 | `exception` | character varying |  |  |
| 5 | `case_docket_number` | integer |  |  |
| 6 | `resolution` | character varying |  |  |

<a id="archive-scrapy_data-w1fieldrestrictions"></a>
#### `scrapy_data.w1fieldrestrictions`  (table)

- **Estimated rows:** 899,280
- **Primary key:** `id`
- **What it holds:** Scraped W-1 field restrictions (field number, code, description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('w1fieldrestrictions_id_seq'::regclass) |
| 2 | `fieldnumber` | character varying | ✔ |  |
| 3 | `status_number` | character varying | ✔ |  |
| 4 | `code` | integer |  |  |
| 5 | `description` | character varying |  |  |

<a id="archive-scrapy_data-w1form_jsondata"></a>
#### `scrapy_data.w1form_jsondata`  (table)

- **Estimated rows:** 21,925
- **What it holds:** Raw scraped W-1 form payloads stored as JSON per record.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('w1form_jsondata_id_seq'::regclass) |
| 2 | `w1form` | jsonb |  |  |

<a id="archive-scrapy_data-w1legalinformations"></a>
#### `scrapy_data.w1legalinformations`  (table)

- **Estimated rows:** 859,608
- **Primary key:** `id`
- **What it holds:** Scraped W-1 legal land description (section, block, survey, abstract, township, league, labor, etc.).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('w1legalinformations_id_seq'::regclass) |
| 2 | `status_number` | character varying | ✔ |  |
| 3 | `section` | character varying |  |  |
| 4 | `block` | character varying |  |  |
| 5 | `survey` | character varying |  |  |
| 6 | `abstract` | character varying |  |  |
| 7 | `township` | character varying |  |  |
| 8 | `league` | character varying |  |  |
| 9 | `labor` | character varying |  |  |
| 10 | `porcion` | character varying |  |  |
| 11 | `share` | character varying |  |  |
| 12 | `tract` | character varying |  |  |
| 13 | `lot` | character varying |  |  |

<a id="archive-scrapy_data-w1permitrestrictions"></a>
#### `scrapy_data.w1permitrestrictions`  (table)

- **Estimated rows:** 1,597,455
- **Primary key:** `id`
- **What it holds:** Scraped W-1 permit restrictions (code + restriction text), ~1.6M rows.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('w1permitrestrictions_id_seq'::regclass) |
| 2 | `status_number` | character varying | ✔ |  |
| 3 | `code` | integer |  |  |
| 4 | `restriction` | character varying |  |  |

<a id="archive-scrapy_data-w2_acidfracturechild"></a>
#### `scrapy_data.w2_acidfracturechild`  (table)

- **Estimated rows:** 448,876
- **Primary key:** `id`
- **What it holds:** Child rows of W-2 acid/fracture treatment: material type, depth, interval, operation type.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('acidfracturechild_id_seq'::regclass) |
| 2 | `acidfractureid` | integer | ✔ |  |
| 3 | `materialamounttype` | character varying |  |  |
| 4 | `depth` | double precision |  |  |
| 5 | `interval` | double precision |  |  |
| 6 | `operationtype` | character varying |  |  |

<a id="archive-scrapy_data-w2_completions_jsondata"></a>
#### `scrapy_data.w2_completions_jsondata`  (table)

- **Estimated rows:** 33,282
- **What it holds:** Raw scraped W-2 completion form payloads stored as JSON.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('w2completions_jsondata_id_seq'::regclass) |
| 2 | `w2completions` | jsonb |  |  |

<a id="archive-scrapy_data-w2_fielddata_pressurecalculationschild"></a>
#### `scrapy_data.w2_fielddata_pressurecalculationschild`  (table)

- **Estimated rows:** 75,380
- **Primary key:** `id`
- **What it holds:** W-2 field pressure-test child rows: per-run choke size, wellhead pressure and flow temperature.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('fielddata_pressurecalculationschild_id_seq'::regclass) |
| 2 | `fielddata_pressureid` | bigint | ✔ |  |
| 3 | `runno` | character varying |  |  |
| 4 | `runtimeinminutes` | integer |  |  |
| 5 | `chokesize` | character varying |  |  |
| 6 | `wellheadpressure` | integer |  |  |
| 7 | `wellheadflowtemp` | double precision |  |  |

<a id="archive-scrapy_data-w2_operatorcertifications"></a>
#### `scrapy_data.w2_operatorcertifications`  (table)

- **Estimated rows:** 312,461
- **Primary key:** `id`
- **What it holds:** W-2 operator certification block (printed name, title, phone, date certified) per tracking number.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('operatorcertifications_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `printed_name` | character varying |  |  |
| 4 | `title` | character varying |  |  |
| 5 | `telephone_no` | character varying |  |  |
| 6 | `date_certified` | date |  |  |

<a id="archive-scrapy_data-w2_rrcremarks"></a>
#### `scrapy_data.w2_rrcremarks`  (table)

- **Estimated rows:** 312,461
- **Primary key:** `id`
- **What it holds:** W-2 RRC remarks / linked sub-sections (casing, tubing, acid-fracture, potential test, gas measurement) per tracking number.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('rrcremarks_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `publiccomments` | character varying |  |  |
| 4 | `casingrecords` | character varying |  |  |
| 5 | `tubingrecord` | character varying |  |  |
| 6 | `interval` | character varying |  |  |
| 7 | `acidfracture` | character varying |  |  |
| 8 | `potentialtestdata` | character varying |  |  |
| 9 | `gasmeasurement_date` | character varying |  |  |

<a id="archive-scrapy_data-w2completionurls"></a>
#### `scrapy_data.w2completionurls`  (table)

- **Estimated rows:** n/a
- **Primary key:** `srno`
- **What it holds:** Queue of W-2 completion source URLs and their scraped flag.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `srno` 🔑 | integer | ✔ | nextval('w2completionurls_srno_seq'::regclass) |
| 2 | `url` | character varying |  |  |
| 3 | `isscraped` | character varying |  | 'false'::character varying |

---

## Database: `MviewDownload`

*Bulk-download / export staging database supporting the data-purchase & file-download features.*

### Schema: `Linkage_data`  ·  1 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`linkage_data_new`](#mviewdownload-linkage_data-linkage_data_new) | table | n/a | 83 | Wide master linkage table (83 cols) tying mineral owners, leases, wells and properties together for cross-referencing across datasets. |

<a id="mviewdownload-linkage_data-linkage_data_new"></a>
#### `Linkage_data.linkage_data_new`  (table)

- **Estimated rows:** n/a
- **What it holds:** Wide master linkage table (83 cols) tying mineral owners, leases, wells and properties together for cross-referencing across datasets.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mview_api` | character varying(100) |  |  |
| 2 | `api14` | character varying(100) |  |  |
| 3 | `tracking_no` | bigint |  |  |
| 4 | `tracking_date` | date |  |  |
| 5 | `lease_number` | character varying(100) |  |  |
| 6 | `district_code` | character varying(10) |  |  |
| 7 | `county` | character varying(500) |  |  |
| 8 | `lease_name` | character varying(500) |  |  |
| 9 | `field_name` | character varying(500) |  |  |
| 10 | `reservoir` | character varying(500) |  |  |
| 11 | `field_number` | character varying(100) |  |  |
| 12 | `well_number` | character varying(100) |  |  |
| 13 | `operator_number` | character varying(100) |  |  |
| 14 | `operator_name` | character varying(500) |  |  |
| 15 | `filing_purpose` | character varying(500) |  |  |
| 16 | `filing_type` | character varying(500) |  |  |
| 17 | `filing_welltype` | character varying(500) |  |  |
| 18 | `recompletiondate` | date |  |  |
| 19 | `permit_type` | character varying |  |  |
| 20 | `permit_date` | date |  |  |
| 21 | `permit_number` | character varying |  |  |
| 22 | `spud_date` | date |  |  |
| 23 | `fpar_date` | date |  |  |
| 24 | `operation_date` | date |  |  |
| 25 | `lease_acres` | double precision |  |  |
| 26 | `elevation` | character varying |  |  |
| 27 | `total_tvd` | double precision |  |  |
| 28 | `total_md` | double precision |  |  |
| 29 | `test24_date` | date |  |  |
| 30 | `test24_chokesize` | character varying |  |  |
| 31 | `test24_oil` | double precision |  |  |
| 32 | `test24_gas` | double precision |  |  |
| 33 | `test24_water` | double precision |  |  |
| 34 | `test24_casing` | double precision |  |  |
| 35 | `oil_gravity` | double precision |  |  |
| 36 | `casing` | integer |  |  |
| 37 | `liner` | integer |  |  |
| 38 | `tubing` | integer |  |  |
| 39 | `multiple_interval` | integer |  |  |
| 40 | `from_md` | character varying |  |  |
| 41 | `to_md` | character varying |  |  |
| 42 | `ishydraulic_fracturing` | boolean |  |  |
| 43 | `remarks` | jsonb |  |  |
| 44 | `form_path` | character varying |  |  |
| 45 | `directional_survey_path` | jsonb |  |  |
| 46 | `plat_path` | character varying |  |  |
| 47 | `surfloc_x` | character varying |  |  |
| 48 | `surfloc_y` | character varying |  |  |
| 49 | `bhl_x` | character varying |  |  |
| 50 | `bhl_y` | character varying |  |  |
| 51 | `plugging_date` | character varying |  |  |
| 52 | `shut_in_date` | character varying |  |  |
| 53 | `playtype` | character varying |  |  |
| 54 | `status_number` | character varying |  |  |
| 55 | `status` | character varying |  |  |
| 56 | `isupdate` | boolean |  |  |
| 57 | `symnum` | integer |  |  |
| 58 | `bottom_symnum` | integer |  |  |
| 59 | `created_date` | date |  |  |
| 60 | `updated_date` | date |  |  |
| 61 | `surface_xnad27` | character varying |  |  |
| 62 | `surface_ynad27` | character varying |  |  |
| 63 | `bottom_xnad27` | character varying |  |  |
| 64 | `bottom_ynad27` | character varying |  |  |
| 65 | `wellboreprofiles` | character varying |  |  |
| 66 | `id` | character varying |  |  |
| 67 | `isnewinsert` | boolean |  |  |
| 68 | `i` | integer | ✔ |  |
| 69 | `new_api` | character varying |  |  |
| 70 | `dir_survey_name` | character varying |  |  |
| 71 | `dir_survey_pass` | boolean |  |  |
| 72 | `dir_survey_id` | character varying |  |  |
| 73 | `mwd_name` | character varying |  |  |
| 74 | `mwd_pass` | boolean |  |  |
| 75 | `mwd_id` | character varying |  |  |
| 76 | `gyro_name` | character varying |  |  |
| 77 | `gyro_pass` | boolean |  |  |
| 78 | `gyro_id` | character varying |  |  |
| 79 | `lastsyncdate` | timestamp without time zone |  |  |
| 80 | `lastupdateddate` | timestamp without time zone |  |  |
| 81 | `ispresent` | boolean |  |  |
| 82 | `submit_date` | date |  |  |
| 83 | `transformed_api` | character varying |  |  |

### Schema: `mineral_owner_2025`  ·  312 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`mineralowner_2025`](#mviewdownload-mineral_owner_2025-mineralowner_2025) | table | 76 | 8 | 2025 mineral-owner master (all counties): owner number, name and address. |
| [`mineralowner_2025_andrews`](#mviewdownload-mineral_owner_2025-mineralowner_2025_andrews) | table | 107,800 | 8 | 2025 mineral-owner records for **Andrews** county (owner number, name, address). |
| [`mineralowner_2025_angelina`](#mviewdownload-mineral_owner_2025-mineralowner_2025_angelina) | table | 7,445 | 8 | 2025 mineral-owner records for **Angelina** county (owner number, name, address). |
| [`mineralowner_2025_aransas`](#mviewdownload-mineral_owner_2025-mineralowner_2025_aransas) | table | n/a | 8 | 2025 mineral-owner records for **Aransas** county (owner number, name, address). |
| [`mineralowner_2025_archer`](#mviewdownload-mineral_owner_2025-mineralowner_2025_archer) | table | 3,182 | 7 | 2025 mineral-owner records for **Archer** county (owner number, name, address). |
| [`mineralowner_2025_armstrong`](#mviewdownload-mineral_owner_2025-mineralowner_2025_armstrong) | table | 58 | 7 | 2025 mineral-owner records for **Armstrong** county (owner number, name, address). |
| [`mineralowner_2025_atascosa`](#mviewdownload-mineral_owner_2025-mineralowner_2025_atascosa) | table | 42,178 | 8 | 2025 mineral-owner records for **Atascosa** county (owner number, name, address). |
| [`mineralowner_2025_bandera`](#mviewdownload-mineral_owner_2025-mineralowner_2025_bandera) | table | 51 | 8 | 2025 mineral-owner records for **Bandera** county (owner number, name, address). |
| [`mineralowner_2025_bastrop`](#mviewdownload-mineral_owner_2025-mineralowner_2025_bastrop) | table | 487 | 8 | 2025 mineral-owner records for **Bastrop** county (owner number, name, address). |
| [`mineralowner_2025_bee`](#mviewdownload-mineral_owner_2025-mineralowner_2025_bee) | table | 3,178 | 9 | 2025 mineral-owner records for **Bee** county (owner number, name, address). |
| [`mineralowner_2025_borden`](#mviewdownload-mineral_owner_2025-mineralowner_2025_borden) | table | 7,020 | 7 | 2025 mineral-owner records for **Borden** county (owner number, name, address). |
| [`mineralowner_2025_bowie`](#mviewdownload-mineral_owner_2025-mineralowner_2025_bowie) | table | n/a | 8 | 2025 mineral-owner records for **Bowie** county (owner number, name, address). |
| [`mineralowner_2025_brazoria`](#mviewdownload-mineral_owner_2025-mineralowner_2025_brazoria) | table | 8,663 | 7 | 2025 mineral-owner records for **Brazoria** county (owner number, name, address). |
| [`mineralowner_2025_brazos`](#mviewdownload-mineral_owner_2025-mineralowner_2025_brazos) | table | 55,533 | 8 | 2025 mineral-owner records for **Brazos** county (owner number, name, address). |
| [`mineralowner_2025_brooks`](#mviewdownload-mineral_owner_2025-mineralowner_2025_brooks) | table | 4,372 | 8 | 2025 mineral-owner records for **Brooks** county (owner number, name, address). |
| [`mineralowner_2025_brown`](#mviewdownload-mineral_owner_2025-mineralowner_2025_brown) | table | 10,889 | 8 | 2025 mineral-owner records for **Brown** county (owner number, name, address). |
| [`mineralowner_2025_caldwell`](#mviewdownload-mineral_owner_2025-mineralowner_2025_caldwell) | table | 16,544 | 8 | 2025 mineral-owner records for **Caldwell** county (owner number, name, address). |
| [`mineralowner_2025_calhoun`](#mviewdownload-mineral_owner_2025-mineralowner_2025_calhoun) | table | 567 | 8 | 2025 mineral-owner records for **Calhoun** county (owner number, name, address). |
| [`mineralowner_2025_camp`](#mviewdownload-mineral_owner_2025-mineralowner_2025_camp) | table | 9,295 | 8 | 2025 mineral-owner records for **Camp** county (owner number, name, address). |
| [`mineralowner_2025_carson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_carson) | table | 4,227 | 7 | 2025 mineral-owner records for **Carson** county (owner number, name, address). |
| [`mineralowner_2025_cass`](#mviewdownload-mineral_owner_2025-mineralowner_2025_cass) | table | 8,954 | 8 | 2025 mineral-owner records for **Cass** county (owner number, name, address). |
| [`mineralowner_2025_chambers`](#mviewdownload-mineral_owner_2025-mineralowner_2025_chambers) | table | 4,631 | 7 | 2025 mineral-owner records for **Chambers** county (owner number, name, address). |
| [`mineralowner_2025_childress`](#mviewdownload-mineral_owner_2025-mineralowner_2025_childress) | table | 51 | 7 | 2025 mineral-owner records for **Childress** county (owner number, name, address). |
| [`mineralowner_2025_clay`](#mviewdownload-mineral_owner_2025-mineralowner_2025_clay) | table | 2,134 | 7 | 2025 mineral-owner records for **Clay** county (owner number, name, address). |
| [`mineralowner_2025_cochran`](#mviewdownload-mineral_owner_2025-mineralowner_2025_cochran) | table | 16,558 | 8 | 2025 mineral-owner records for **Cochran** county (owner number, name, address). |
| [`mineralowner_2025_coke`](#mviewdownload-mineral_owner_2025-mineralowner_2025_coke) | table | 1,355 | 7 | 2025 mineral-owner records for **Coke** county (owner number, name, address). |
| [`mineralowner_2025_coleman`](#mviewdownload-mineral_owner_2025-mineralowner_2025_coleman) | table | 3,439 | 7 | 2025 mineral-owner records for **Coleman** county (owner number, name, address). |
| [`mineralowner_2025_collingsworth`](#mviewdownload-mineral_owner_2025-mineralowner_2025_collingsworth) | table | 840 | 7 | 2025 mineral-owner records for **Collingsworth** county (owner number, name, address). |
| [`mineralowner_2025_comanche`](#mviewdownload-mineral_owner_2025-mineralowner_2025_comanche) | table | 2,032 | 8 | 2025 mineral-owner records for **Comanche** county (owner number, name, address). |
| [`mineralowner_2025_cooke`](#mviewdownload-mineral_owner_2025-mineralowner_2025_cooke) | table | 35,002 | 8 | 2025 mineral-owner records for **Cooke** county (owner number, name, address). |
| [`mineralowner_2025_cottle`](#mviewdownload-mineral_owner_2025-mineralowner_2025_cottle) | table | 248 | 7 | 2025 mineral-owner records for **Cottle** county (owner number, name, address). |
| [`mineralowner_2025_crane`](#mviewdownload-mineral_owner_2025-mineralowner_2025_crane) | table | 5,761 | 8 | 2025 mineral-owner records for **Crane** county (owner number, name, address). |
| [`mineralowner_2025_crockett`](#mviewdownload-mineral_owner_2025-mineralowner_2025_crockett) | table | 3,812 | 7 | 2025 mineral-owner records for **Crockett** county (owner number, name, address). |
| [`mineralowner_2025_crosby`](#mviewdownload-mineral_owner_2025-mineralowner_2025_crosby) | table | 452 | 7 | 2025 mineral-owner records for **Crosby** county (owner number, name, address). |
| [`mineralowner_2025_culberson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_culberson) | table | 804 | 7 | 2025 mineral-owner records for **Culberson** county (owner number, name, address). |
| [`mineralowner_2025_dawson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_dawson) | table | 10,113 | 7 | 2025 mineral-owner records for **Dawson** county (owner number, name, address). |
| [`mineralowner_2025_denton`](#mviewdownload-mineral_owner_2025-mineralowner_2025_denton) | table | 61,233 | 8 | 2025 mineral-owner records for **Denton** county (owner number, name, address). |
| [`mineralowner_2025_dewitt`](#mviewdownload-mineral_owner_2025-mineralowner_2025_dewitt) | table | 9,183 | 7 | 2025 mineral-owner records for **Dewitt** county (owner number, name, address). |
| [`mineralowner_2025_dickens`](#mviewdownload-mineral_owner_2025-mineralowner_2025_dickens) | table | 1,281 | 7 | 2025 mineral-owner records for **Dickens** county (owner number, name, address). |
| [`mineralowner_2025_donley`](#mviewdownload-mineral_owner_2025-mineralowner_2025_donley) | table | 206 | 7 | 2025 mineral-owner records for **Donley** county (owner number, name, address). |
| [`mineralowner_2025_duval`](#mviewdownload-mineral_owner_2025-mineralowner_2025_duval) | table | 3,467 | 8 | 2025 mineral-owner records for **Duval** county (owner number, name, address). |
| [`mineralowner_2025_eastland`](#mviewdownload-mineral_owner_2025-mineralowner_2025_eastland) | table | 3,540 | 7 | 2025 mineral-owner records for **Eastland** county (owner number, name, address). |
| [`mineralowner_2025_ector`](#mviewdownload-mineral_owner_2025-mineralowner_2025_ector) | table | 11,216 | 7 | 2025 mineral-owner records for **Ector** county (owner number, name, address). |
| [`mineralowner_2025_edwards`](#mviewdownload-mineral_owner_2025-mineralowner_2025_edwards) | table | 1,207 | 8 | 2025 mineral-owner records for **Edwards** county (owner number, name, address). |
| [`mineralowner_2025_ellis`](#mviewdownload-mineral_owner_2025-mineralowner_2025_ellis) | table | 1,805 | 8 | 2025 mineral-owner records for **Ellis** county (owner number, name, address). |
| [`mineralowner_2025_fayette`](#mviewdownload-mineral_owner_2025-mineralowner_2025_fayette) | table | 19,000 | 8 | 2025 mineral-owner records for **Fayette** county (owner number, name, address). |
| [`mineralowner_2025_fisher`](#mviewdownload-mineral_owner_2025-mineralowner_2025_fisher) | table | 5,286 | 7 | 2025 mineral-owner records for **Fisher** county (owner number, name, address). |
| [`mineralowner_2025_foard`](#mviewdownload-mineral_owner_2025-mineralowner_2025_foard) | table | 452 | 7 | 2025 mineral-owner records for **Foard** county (owner number, name, address). |
| [`mineralowner_2025_fort_bend`](#mviewdownload-mineral_owner_2025-mineralowner_2025_fort_bend) | table | 14,121 | 8 | 2025 mineral-owner records for **Fort Bend** county (owner number, name, address). |
| [`mineralowner_2025_franklin`](#mviewdownload-mineral_owner_2025-mineralowner_2025_franklin) | table | 2,843 | 7 | 2025 mineral-owner records for **Franklin** county (owner number, name, address). |
| [`mineralowner_2025_freestone`](#mviewdownload-mineral_owner_2025-mineralowner_2025_freestone) | table | 11,743 | 7 | 2025 mineral-owner records for **Freestone** county (owner number, name, address). |
| [`mineralowner_2025_frio`](#mviewdownload-mineral_owner_2025-mineralowner_2025_frio) | table | 2,723 | 7 | 2025 mineral-owner records for **Frio** county (owner number, name, address). |
| [`mineralowner_2025_gaines`](#mviewdownload-mineral_owner_2025-mineralowner_2025_gaines) | table | 72,814 | 8 | 2025 mineral-owner records for **Gaines** county (owner number, name, address). |
| [`mineralowner_2025_galveston`](#mviewdownload-mineral_owner_2025-mineralowner_2025_galveston) | table | 2,258 | 8 | 2025 mineral-owner records for **Galveston** county (owner number, name, address). |
| [`mineralowner_2025_garza`](#mviewdownload-mineral_owner_2025-mineralowner_2025_garza) | table | 6,189 | 8 | 2025 mineral-owner records for **Garza** county (owner number, name, address). |
| [`mineralowner_2025_goliad`](#mviewdownload-mineral_owner_2025-mineralowner_2025_goliad) | table | 1,458 | 7 | 2025 mineral-owner records for **Goliad** county (owner number, name, address). |
| [`mineralowner_2025_gonzales`](#mviewdownload-mineral_owner_2025-mineralowner_2025_gonzales) | table | 9,695 | 7 | 2025 mineral-owner records for **Gonzales** county (owner number, name, address). |
| [`mineralowner_2025_grayson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_grayson) | table | 16,256 | 8 | 2025 mineral-owner records for **Grayson** county (owner number, name, address). |
| [`mineralowner_2025_gregg`](#mviewdownload-mineral_owner_2025-mineralowner_2025_gregg) | table | 268,900 | 8 | 2025 mineral-owner records for **Gregg** county (owner number, name, address). |
| [`mineralowner_2025_grimes`](#mviewdownload-mineral_owner_2025-mineralowner_2025_grimes) | table | 7,194 | 8 | 2025 mineral-owner records for **Grimes** county (owner number, name, address). |
| [`mineralowner_2025_guadalupe`](#mviewdownload-mineral_owner_2025-mineralowner_2025_guadalupe) | table | 2,831 | 8 | 2025 mineral-owner records for **Guadalupe** county (owner number, name, address). |
| [`mineralowner_2025_hale`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hale) | table | 3,891 | 8 | 2025 mineral-owner records for **Hale** county (owner number, name, address). |
| [`mineralowner_2025_hall`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hall) | table | 108 | 7 | 2025 mineral-owner records for **Hall** county (owner number, name, address). |
| [`mineralowner_2025_hamilton`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hamilton) | table | 58 | 7 | 2025 mineral-owner records for **Hamilton** county (owner number, name, address). |
| [`mineralowner_2025_hansford`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hansford) | table | 3,908 | 7 | 2025 mineral-owner records for **Hansford** county (owner number, name, address). |
| [`mineralowner_2025_hardeman`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hardeman) | table | 1,435 | 7 | 2025 mineral-owner records for **Hardeman** county (owner number, name, address). |
| [`mineralowner_2025_hardin`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hardin) | table | 6,299 | 8 | 2025 mineral-owner records for **Hardin** county (owner number, name, address). |
| [`mineralowner_2025_haskell`](#mviewdownload-mineral_owner_2025-mineralowner_2025_haskell) | table | 1,737 | 7 | 2025 mineral-owner records for **Haskell** county (owner number, name, address). |
| [`mineralowner_2025_hemphill`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hemphill) | table | 5,026 | 7 | 2025 mineral-owner records for **Hemphill** county (owner number, name, address). |
| [`mineralowner_2025_hill`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hill) | table | 4,931 | 8 | 2025 mineral-owner records for **Hill** county (owner number, name, address). |
| [`mineralowner_2025_hockley`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hockley) | table | 7,133 | 7 | 2025 mineral-owner records for **Hockley** county (owner number, name, address). |
| [`mineralowner_2025_houston`](#mviewdownload-mineral_owner_2025-mineralowner_2025_houston) | table | 3,663 | 7 | 2025 mineral-owner records for **Houston** county (owner number, name, address). |
| [`mineralowner_2025_howard`](#mviewdownload-mineral_owner_2025-mineralowner_2025_howard) | table | 25,182 | 7 | 2025 mineral-owner records for **Howard** county (owner number, name, address). |
| [`mineralowner_2025_howard_1`](#mviewdownload-mineral_owner_2025-mineralowner_2025_howard_1) | table | 23,890 | 7 | 2025 mineral-owner records for **Howard (secondary copy)** county (owner number, name, address). |
| [`mineralowner_2025_hutchinson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_hutchinson) | table | 3,000 | 7 | 2025 mineral-owner records for **Hutchinson** county (owner number, name, address). |
| [`mineralowner_2025_irion`](#mviewdownload-mineral_owner_2025-mineralowner_2025_irion) | table | 1,822 | 7 | 2025 mineral-owner records for **Irion** county (owner number, name, address). |
| [`mineralowner_2025_jack`](#mviewdownload-mineral_owner_2025-mineralowner_2025_jack) | table | 5,636 | 7 | 2025 mineral-owner records for **Jack** county (owner number, name, address). |
| [`mineralowner_2025_jasper`](#mviewdownload-mineral_owner_2025-mineralowner_2025_jasper) | table | 6,727 | 8 | 2025 mineral-owner records for **Jasper** county (owner number, name, address). |
| [`mineralowner_2025_jefferson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_jefferson) | table | 9,259 | 8 | 2025 mineral-owner records for **Jefferson** county (owner number, name, address). |
| [`mineralowner_2025_jimhogg`](#mviewdownload-mineral_owner_2025-mineralowner_2025_jimhogg) | table | 736 | 7 | 2025 mineral-owner records for **Jimhogg** county (owner number, name, address). |
| [`mineralowner_2025_jones`](#mviewdownload-mineral_owner_2025-mineralowner_2025_jones) | table | 4,068 | 7 | 2025 mineral-owner records for **Jones** county (owner number, name, address). |
| [`mineralowner_2025_karnes`](#mviewdownload-mineral_owner_2025-mineralowner_2025_karnes) | table | 17,390 | 7 | 2025 mineral-owner records for **Karnes** county (owner number, name, address). |
| [`mineralowner_2025_kenedy`](#mviewdownload-mineral_owner_2025-mineralowner_2025_kenedy) | table | 9,179 | 8 | 2025 mineral-owner records for **Kenedy** county (owner number, name, address). |
| [`mineralowner_2025_kent`](#mviewdownload-mineral_owner_2025-mineralowner_2025_kent) | table | 2,641 | 7 | 2025 mineral-owner records for **Kent** county (owner number, name, address). |
| [`mineralowner_2025_kimble`](#mviewdownload-mineral_owner_2025-mineralowner_2025_kimble) | table | 201 | 8 | 2025 mineral-owner records for **Kimble** county (owner number, name, address). |
| [`mineralowner_2025_king`](#mviewdownload-mineral_owner_2025-mineralowner_2025_king) | table | 614 | 7 | 2025 mineral-owner records for **King** county (owner number, name, address). |
| [`mineralowner_2025_kleberg`](#mviewdownload-mineral_owner_2025-mineralowner_2025_kleberg) | table | 4,720 | 8 | 2025 mineral-owner records for **Kleberg** county (owner number, name, address). |
| [`mineralowner_2025_lamb`](#mviewdownload-mineral_owner_2025-mineralowner_2025_lamb) | table | 1,404 | 8 | 2025 mineral-owner records for **Lamb** county (owner number, name, address). |
| [`mineralowner_2025_lavaca`](#mviewdownload-mineral_owner_2025-mineralowner_2025_lavaca) | table | 10,904 | 7 | 2025 mineral-owner records for **Lavaca** county (owner number, name, address). |
| [`mineralowner_2025_leon`](#mviewdownload-mineral_owner_2025-mineralowner_2025_leon) | table | 7,415 | 7 | 2025 mineral-owner records for **Leon** county (owner number, name, address). |
| [`mineralowner_2025_liberty`](#mviewdownload-mineral_owner_2025-mineralowner_2025_liberty) | table | 16,264 | 8 | 2025 mineral-owner records for **Liberty** county (owner number, name, address). |
| [`mineralowner_2025_liveoak`](#mviewdownload-mineral_owner_2025-mineralowner_2025_liveoak) | table | 6,298 | 7 | 2025 mineral-owner records for **Liveoak** county (owner number, name, address). |
| [`mineralowner_2025_loving`](#mviewdownload-mineral_owner_2025-mineralowner_2025_loving) | table | 9,998 | 7 | 2025 mineral-owner records for **Loving** county (owner number, name, address). |
| [`mineralowner_2025_lynn`](#mviewdownload-mineral_owner_2025-mineralowner_2025_lynn) | table | 779 | 7 | 2025 mineral-owner records for **Lynn** county (owner number, name, address). |
| [`mineralowner_2025_marion`](#mviewdownload-mineral_owner_2025-mineralowner_2025_marion) | table | 2,718 | 7 | 2025 mineral-owner records for **Marion** county (owner number, name, address). |
| [`mineralowner_2025_martin`](#mviewdownload-mineral_owner_2025-mineralowner_2025_martin) | table | 13,471 | 7 | 2025 mineral-owner records for **Martin** county (owner number, name, address). |
| [`mineralowner_2025_matagorda`](#mviewdownload-mineral_owner_2025-mineralowner_2025_matagorda) | table | 5,896 | 8 | 2025 mineral-owner records for **Matagorda** county (owner number, name, address). |
| [`mineralowner_2025_mcculloch`](#mviewdownload-mineral_owner_2025-mineralowner_2025_mcculloch) | table | 93 | 7 | 2025 mineral-owner records for **Mcculloch** county (owner number, name, address). |
| [`mineralowner_2025_mclennan`](#mviewdownload-mineral_owner_2025-mineralowner_2025_mclennan) | table | n/a | 8 | 2025 mineral-owner records for **Mclennan** county (owner number, name, address). |
| [`mineralowner_2025_menard`](#mviewdownload-mineral_owner_2025-mineralowner_2025_menard) | table | 138 | 7 | 2025 mineral-owner records for **Menard** county (owner number, name, address). |
| [`mineralowner_2025_midland`](#mviewdownload-mineral_owner_2025-mineralowner_2025_midland) | table | 399,725 | 8 | 2025 mineral-owner records for **Midland** county (owner number, name, address). |
| [`mineralowner_2025_milam`](#mviewdownload-mineral_owner_2025-mineralowner_2025_milam) | table | 14,780 | 8 | 2025 mineral-owner records for **Milam** county (owner number, name, address). |
| [`mineralowner_2025_mitchell`](#mviewdownload-mineral_owner_2025-mineralowner_2025_mitchell) | table | 23,274 | 8 | 2025 mineral-owner records for **Mitchell** county (owner number, name, address). |
| [`mineralowner_2025_morris`](#mviewdownload-mineral_owner_2025-mineralowner_2025_morris) | table | 181 | 7 | 2025 mineral-owner records for **Morris** county (owner number, name, address). |
| [`mineralowner_2025_nacogodoches`](#mviewdownload-mineral_owner_2025-mineralowner_2025_nacogodoches) | table | 40,062 | 8 | 2025 mineral-owner records for **Nacogodoches** county (owner number, name, address). |
| [`mineralowner_2025_navarro`](#mviewdownload-mineral_owner_2025-mineralowner_2025_navarro) | table | 1,850 | 8 | 2025 mineral-owner records for **Navarro** county (owner number, name, address). |
| [`mineralowner_2025_newton`](#mviewdownload-mineral_owner_2025-mineralowner_2025_newton) | table | 1,753 | 7 | 2025 mineral-owner records for **Newton** county (owner number, name, address). |
| [`mineralowner_2025_nolan`](#mviewdownload-mineral_owner_2025-mineralowner_2025_nolan) | table | 2,862 | 7 | 2025 mineral-owner records for **Nolan** county (owner number, name, address). |
| [`mineralowner_2025_nueces`](#mviewdownload-mineral_owner_2025-mineralowner_2025_nueces) | table | 35,344 | 8 | 2025 mineral-owner records for **Nueces** county (owner number, name, address). |
| [`mineralowner_2025_ochiltree`](#mviewdownload-mineral_owner_2025-mineralowner_2025_ochiltree) | table | 6,055 | 7 | 2025 mineral-owner records for **Ochiltree** county (owner number, name, address). |
| [`mineralowner_2025_orange`](#mviewdownload-mineral_owner_2025-mineralowner_2025_orange) | table | 1,843 | 7 | 2025 mineral-owner records for **Orange** county (owner number, name, address). |
| [`mineralowner_2025_panola`](#mviewdownload-mineral_owner_2025-mineralowner_2025_panola) | table | 29,955 | 7 | 2025 mineral-owner records for **Panola** county (owner number, name, address). |
| [`mineralowner_2025_polk`](#mviewdownload-mineral_owner_2025-mineralowner_2025_polk) | table | 29,672 | 8 | 2025 mineral-owner records for **Polk** county (owner number, name, address). |
| [`mineralowner_2025_rains`](#mviewdownload-mineral_owner_2025-mineralowner_2025_rains) | table | n/a | 8 | 2025 mineral-owner records for **Rains** county (owner number, name, address). |
| [`mineralowner_2025_reagan`](#mviewdownload-mineral_owner_2025-mineralowner_2025_reagan) | table | 8,817 | 7 | 2025 mineral-owner records for **Reagan** county (owner number, name, address). |
| [`mineralowner_2025_red_river`](#mviewdownload-mineral_owner_2025-mineralowner_2025_red_river) | table | 212 | 7 | 2025 mineral-owner records for **Red River** county (owner number, name, address). |
| [`mineralowner_2025_reeves`](#mviewdownload-mineral_owner_2025-mineralowner_2025_reeves) | table | 186,176 | 8 | 2025 mineral-owner records for **Reeves** county (owner number, name, address). |
| [`mineralowner_2025_refugio`](#mviewdownload-mineral_owner_2025-mineralowner_2025_refugio) | table | 1,293 | 7 | 2025 mineral-owner records for **Refugio** county (owner number, name, address). |
| [`mineralowner_2025_robertson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_robertson) | table | 3,605 | 9 | 2025 mineral-owner records for **Robertson** county (owner number, name, address). |
| [`mineralowner_2025_rusk`](#mviewdownload-mineral_owner_2025-mineralowner_2025_rusk) | table | 28,010 | 7 | 2025 mineral-owner records for **Rusk** county (owner number, name, address). |
| [`mineralowner_2025_san_augustine`](#mviewdownload-mineral_owner_2025-mineralowner_2025_san_augustine) | table | 8,930 | 7 | 2025 mineral-owner records for **San Augustine** county (owner number, name, address). |
| [`mineralowner_2025_san_jacinto`](#mviewdownload-mineral_owner_2025-mineralowner_2025_san_jacinto) | table | 6,247 | 8 | 2025 mineral-owner records for **San Jacinto** county (owner number, name, address). |
| [`mineralowner_2025_san_patricio`](#mviewdownload-mineral_owner_2025-mineralowner_2025_san_patricio) | table | 1,555 | 8 | 2025 mineral-owner records for **San Patricio** county (owner number, name, address). |
| [`mineralowner_2025_scurry`](#mviewdownload-mineral_owner_2025-mineralowner_2025_scurry) | table | 53,509 | 8 | 2025 mineral-owner records for **Scurry** county (owner number, name, address). |
| [`mineralowner_2025_shackelford`](#mviewdownload-mineral_owner_2025-mineralowner_2025_shackelford) | table | 9,531 | 8 | 2025 mineral-owner records for **Shackelford** county (owner number, name, address). |
| [`mineralowner_2025_shelby`](#mviewdownload-mineral_owner_2025-mineralowner_2025_shelby) | table | 10,766 | 7 | 2025 mineral-owner records for **Shelby** county (owner number, name, address). |
| [`mineralowner_2025_shelby_1`](#mviewdownload-mineral_owner_2025-mineralowner_2025_shelby_1) | table | 38,424 | 7 | 2025 mineral-owner records for **Shelby (secondary copy)** county (owner number, name, address). |
| [`mineralowner_2025_sherman`](#mviewdownload-mineral_owner_2025-mineralowner_2025_sherman) | table | 2,838 | 7 | 2025 mineral-owner records for **Sherman** county (owner number, name, address). |
| [`mineralowner_2025_starr`](#mviewdownload-mineral_owner_2025-mineralowner_2025_starr) | table | 3,965 | 9 | 2025 mineral-owner records for **Starr** county (owner number, name, address). |
| [`mineralowner_2025_sterling`](#mviewdownload-mineral_owner_2025-mineralowner_2025_sterling) | table | 1,882 | 7 | 2025 mineral-owner records for **Sterling** county (owner number, name, address). |
| [`mineralowner_2025_stonewall`](#mviewdownload-mineral_owner_2025-mineralowner_2025_stonewall) | table | 3,424 | 7 | 2025 mineral-owner records for **Stonewall** county (owner number, name, address). |
| [`mineralowner_2025_taylor`](#mviewdownload-mineral_owner_2025-mineralowner_2025_taylor) | table | 5,584 | 8 | 2025 mineral-owner records for **Taylor** county (owner number, name, address). |
| [`mineralowner_2025_terrell`](#mviewdownload-mineral_owner_2025-mineralowner_2025_terrell) | table | 10,679 | 8 | 2025 mineral-owner records for **Terrell** county (owner number, name, address). |
| [`mineralowner_2025_terry`](#mviewdownload-mineral_owner_2025-mineralowner_2025_terry) | table | 10,000 | 8 | 2025 mineral-owner records for **Terry** county (owner number, name, address). |
| [`mineralowner_2025_titus`](#mviewdownload-mineral_owner_2025-mineralowner_2025_titus) | table | 1,625 | 9 | 2025 mineral-owner records for **Titus** county (owner number, name, address). |
| [`mineralowner_2025_trinity`](#mviewdownload-mineral_owner_2025-mineralowner_2025_trinity) | table | 203 | 7 | 2025 mineral-owner records for **Trinity** county (owner number, name, address). |
| [`mineralowner_2025_tyler`](#mviewdownload-mineral_owner_2025-mineralowner_2025_tyler) | table | 15,348 | 8 | 2025 mineral-owner records for **Tyler** county (owner number, name, address). |
| [`mineralowner_2025_upton`](#mviewdownload-mineral_owner_2025-mineralowner_2025_upton) | table | 14,257 | 7 | 2025 mineral-owner records for **Upton** county (owner number, name, address). |
| [`mineralowner_2025_val_verde`](#mviewdownload-mineral_owner_2025-mineralowner_2025_val_verde) | table | 5,472 | 8 | 2025 mineral-owner records for **Val Verde** county (owner number, name, address). |
| [`mineralowner_2025_victoria`](#mviewdownload-mineral_owner_2025-mineralowner_2025_victoria) | table | 2,168 | 7 | 2025 mineral-owner records for **Victoria** county (owner number, name, address). |
| [`mineralowner_2025_victoria_1`](#mviewdownload-mineral_owner_2025-mineralowner_2025_victoria_1) | table | 2,481 | 5 | 2025 mineral-owner records for **Victoria (secondary copy)** county (owner number, name, address). |
| [`mineralowner_2025_walker`](#mviewdownload-mineral_owner_2025-mineralowner_2025_walker) | table | 1,916 | 8 | 2025 mineral-owner records for **Walker** county (owner number, name, address). |
| [`mineralowner_2025_ward`](#mviewdownload-mineral_owner_2025-mineralowner_2025_ward) | table | 9,012 | 7 | 2025 mineral-owner records for **Ward** county (owner number, name, address). |
| [`mineralowner_2025_washington`](#mviewdownload-mineral_owner_2025-mineralowner_2025_washington) | table | 18,851 | 8 | 2025 mineral-owner records for **Washington** county (owner number, name, address). |
| [`mineralowner_2025_webb`](#mviewdownload-mineral_owner_2025-mineralowner_2025_webb) | table | 48,808 | 8 | 2025 mineral-owner records for **Webb** county (owner number, name, address). |
| [`mineralowner_2025_wheeler`](#mviewdownload-mineral_owner_2025-mineralowner_2025_wheeler) | table | 8,486 | 7 | 2025 mineral-owner records for **Wheeler** county (owner number, name, address). |
| [`mineralowner_2025_wichita`](#mviewdownload-mineral_owner_2025-mineralowner_2025_wichita) | table | 2,913 | 9 | 2025 mineral-owner records for **Wichita** county (owner number, name, address). |
| [`mineralowner_2025_wilbarger`](#mviewdownload-mineral_owner_2025-mineralowner_2025_wilbarger) | table | 1,591 | 7 | 2025 mineral-owner records for **Wilbarger** county (owner number, name, address). |
| [`mineralowner_2025_willacy`](#mviewdownload-mineral_owner_2025-mineralowner_2025_willacy) | table | 5,142 | 8 | 2025 mineral-owner records for **Willacy** county (owner number, name, address). |
| [`mineralowner_2025_williamson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_williamson) | table | 198 | 7 | 2025 mineral-owner records for **Williamson** county (owner number, name, address). |
| [`mineralowner_2025_wilson`](#mviewdownload-mineral_owner_2025-mineralowner_2025_wilson) | table | 18,655 | 8 | 2025 mineral-owner records for **Wilson** county (owner number, name, address). |
| [`mineralowner_2025_winkler`](#mviewdownload-mineral_owner_2025-mineralowner_2025_winkler) | table | 6,859 | 9 | 2025 mineral-owner records for **Winkler** county (owner number, name, address). |
| [`mineralowner_2025_wise`](#mviewdownload-mineral_owner_2025-mineralowner_2025_wise) | table | 203,683 | 8 | 2025 mineral-owner records for **Wise** county (owner number, name, address). |
| [`mineralowner_2025_wood`](#mviewdownload-mineral_owner_2025-mineralowner_2025_wood) | table | 8,600 | 7 | 2025 mineral-owner records for **Wood** county (owner number, name, address). |
| [`mineralowner_2025_yoakum`](#mviewdownload-mineral_owner_2025-mineralowner_2025_yoakum) | table | 95,325 | 8 | 2025 mineral-owner records for **Yoakum** county (owner number, name, address). |
| [`mineralowner_2025_young`](#mviewdownload-mineral_owner_2025-mineralowner_2025_young) | table | 11,191 | 8 | 2025 mineral-owner records for **Young** county (owner number, name, address). |
| [`mineralownerproperty_2025`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025) | table | n/a | 52 | 2025 mineral-owner property/holdings master (all counties, 52 cols): lease/district, royalty interest, valuation and property description. |
| [`mineralownerproperty_2025_andrews`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_andrews) | table | 111,628 | 19 | 2025 mineral-owner property holdings for **Andrews** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_angelina`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_angelina) | table | 7,665 | 17 | 2025 mineral-owner property holdings for **Angelina** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_aransas`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_aransas) | table | n/a | 17 | 2025 mineral-owner property holdings for **Aransas** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_archer`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_archer) | table | 8,483 | 51 | 2025 mineral-owner property holdings for **Archer** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_armstrong`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_armstrong) | table | 377 | 49 | 2025 mineral-owner property holdings for **Armstrong** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_atascosa`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_atascosa) | table | 42,178 | 17 | 2025 mineral-owner property holdings for **Atascosa** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_bandera`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_bandera) | table | 78 | 17 | 2025 mineral-owner property holdings for **Bandera** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_bastrop`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_bastrop) | table | 737 | 17 | 2025 mineral-owner property holdings for **Bastrop** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_bee`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_bee) | table | 10,327 | 19 | 2025 mineral-owner property holdings for **Bee** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_borden`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_borden) | table | 31,965 | 49 | 2025 mineral-owner property holdings for **Borden** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_bowie`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_bowie) | table | n/a | 17 | 2025 mineral-owner property holdings for **Bowie** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_brazoria`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_brazoria) | table | 38,908 | 51 | 2025 mineral-owner property holdings for **Brazoria** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_brazos`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_brazos) | table | 56,257 | 17 | 2025 mineral-owner property holdings for **Brazos** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_brooks`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_brooks) | table | 4,372 | 17 | 2025 mineral-owner property holdings for **Brooks** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_brown`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_brown) | table | 10,892 | 17 | 2025 mineral-owner property holdings for **Brown** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_caldwell`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_caldwell) | table | 16,544 | 17 | 2025 mineral-owner property holdings for **Caldwell** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_calhoun`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_calhoun) | table | 567 | 17 | 2025 mineral-owner property holdings for **Calhoun** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_camp`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_camp) | table | 9,314 | 17 | 2025 mineral-owner property holdings for **Camp** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_carson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_carson) | table | 20,336 | 15 | 2025 mineral-owner property holdings for **Carson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_cass`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_cass) | table | 8,952 | 18 | 2025 mineral-owner property holdings for **Cass** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_chambers`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_chambers) | table | 9,797 | 15 | 2025 mineral-owner property holdings for **Chambers** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_childress`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_childress) | table | 187 | 51 | 2025 mineral-owner property holdings for **Childress** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_clay`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_clay) | table | 5,659 | 51 | 2025 mineral-owner property holdings for **Clay** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_cochran`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_cochran) | table | 16,558 | 17 | 2025 mineral-owner property holdings for **Cochran** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_coke`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_coke) | table | 3,756 | 49 | 2025 mineral-owner property holdings for **Coke** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_coleman`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_coleman) | table | 8,840 | 16 | 2025 mineral-owner property holdings for **Coleman** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_collingsworth`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_collingsworth) | table | 5,260 | 51 | 2025 mineral-owner property holdings for **Collingsworth** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_comanche`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_comanche) | table | 2,108 | 17 | 2025 mineral-owner property holdings for **Comanche** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_cooke`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_cooke) | table | 35,016 | 17 | 2025 mineral-owner property holdings for **Cooke** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_cottle`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_cottle) | table | 745 | 51 | 2025 mineral-owner property holdings for **Cottle** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_crane`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_crane) | table | 44,042 | 17 | 2025 mineral-owner property holdings for **Crane** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_crockett`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_crockett) | table | 22,431 | 51 | 2025 mineral-owner property holdings for **Crockett** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_crosby`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_crosby) | table | 1,828 | 15 | 2025 mineral-owner property holdings for **Crosby** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_culberson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_culberson) | table | 9,289 | 51 | 2025 mineral-owner property holdings for **Culberson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_dawson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_dawson) | table | 57,310 | 51 | 2025 mineral-owner property holdings for **Dawson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_denton`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_denton) | table | 64,936 | 17 | 2025 mineral-owner property holdings for **Denton** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_dewitt`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_dewitt) | table | 66,565 | 51 | 2025 mineral-owner property holdings for **Dewitt** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_dickens`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_dickens) | table | 2,290 | 51 | 2025 mineral-owner property holdings for **Dickens** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_donley`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_donley) | table | 743 | 51 | 2025 mineral-owner property holdings for **Donley** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_duval`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_duval) | table | 7,690 | 17 | 2025 mineral-owner property holdings for **Duval** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_eastland`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_eastland) | table | 7,120 | 51 | 2025 mineral-owner property holdings for **Eastland** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_ector`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_ector) | table | 154,323 | 64 | 2025 mineral-owner property holdings for **Ector** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_edwards`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_edwards) | table | 1,207 | 17 | 2025 mineral-owner property holdings for **Edwards** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_ellis`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_ellis) | table | 1,805 | 17 | 2025 mineral-owner property holdings for **Ellis** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_fayette`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_fayette) | table | 19,217 | 17 | 2025 mineral-owner property holdings for **Fayette** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_fisher`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_fisher) | table | 12,004 | 51 | 2025 mineral-owner property holdings for **Fisher** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_foard`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_foard) | table | 961 | 51 | 2025 mineral-owner property holdings for **Foard** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_fort_bend`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_fort_bend) | table | 14,839 | 16 | 2025 mineral-owner property holdings for **Fort Bend** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_franklin`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_franklin) | table | 7,339 | 51 | 2025 mineral-owner property holdings for **Franklin** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_freestone`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_freestone) | table | 130,471 | 51 | 2025 mineral-owner property holdings for **Freestone** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_frio`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_frio) | table | 12,065 | 51 | 2025 mineral-owner property holdings for **Frio** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_gaines`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_gaines) | table | 79,199 | 17 | 2025 mineral-owner property holdings for **Gaines** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_galveston`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_galveston) | table | 2,258 | 17 | 2025 mineral-owner property holdings for **Galveston** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_garza`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_garza) | table | 6,189 | 17 | 2025 mineral-owner property holdings for **Garza** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_goliad`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_goliad) | table | 3,978 | 17 | 2025 mineral-owner property holdings for **Goliad** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_gonzales`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_gonzales) | table | 73,626 | 51 | 2025 mineral-owner property holdings for **Gonzales** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_grayson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_grayson) | table | 16,780 | 17 | 2025 mineral-owner property holdings for **Grayson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_gregg`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_gregg) | table | 139,934 | 17 | 2025 mineral-owner property holdings for **Gregg** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_grimes`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_grimes) | table | 7,194 | 15 | 2025 mineral-owner property holdings for **Grimes** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_guadalupe`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_guadalupe) | table | 2,831 | 17 | 2025 mineral-owner property holdings for **Guadalupe** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hale`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hale) | table | 3,891 | 17 | 2025 mineral-owner property holdings for **Hale** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hall`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hall) | table | 550 | 51 | 2025 mineral-owner property holdings for **Hall** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hamilton`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hamilton) | table | 243 | 49 | 2025 mineral-owner property holdings for **Hamilton** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hansford`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hansford) | table | 15,876 | 51 | 2025 mineral-owner property holdings for **Hansford** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hardeman`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hardeman) | table | 3,457 | 51 | 2025 mineral-owner property holdings for **Hardeman** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hardin`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hardin) | table | 6,878 | 18 | 2025 mineral-owner property holdings for **Hardin** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_haskell`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_haskell) | table | 3,825 | 49 | 2025 mineral-owner property holdings for **Haskell** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hemphill`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hemphill) | table | 49,189 | 51 | 2025 mineral-owner property holdings for **Hemphill** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hill`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hill) | table | 4,931 | 17 | 2025 mineral-owner property holdings for **Hill** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hockley`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hockley) | table | 26,625 | 49 | 2025 mineral-owner property holdings for **Hockley** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_houston`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_houston) | table | 7,305 | 51 | 2025 mineral-owner property holdings for **Houston** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_howard`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_howard) | table | 215,593 | 14 | 2025 mineral-owner property holdings for **Howard** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_howard_1`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_howard_1) | table | 215,592 | 14 | 2025 mineral-owner property holdings for **Howard (secondary copy)** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_hutchinson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hutchinson) | table | 17,286 | 51 | 2025 mineral-owner property holdings for **Hutchinson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_irion`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_irion) | table | 11,580 | 16 | 2025 mineral-owner property holdings for **Irion** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_jack`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jack) | table | 12,654 | 51 | 2025 mineral-owner property holdings for **Jack** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_jasper`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jasper) | table | 6,728 | 17 | 2025 mineral-owner property holdings for **Jasper** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_jefferson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jefferson) | table | 9,259 | 17 | 2025 mineral-owner property holdings for **Jefferson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_jimhogg`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jimhogg) | table | 1,486 | 51 | 2025 mineral-owner property holdings for **Jimhogg** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_jones`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jones) | table | 8,090 | 51 | 2025 mineral-owner property holdings for **Jones** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_karnes`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_karnes) | table | 161,894 | 51 | 2025 mineral-owner property holdings for **Karnes** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_kenedy`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_kenedy) | table | 9,183 | 17 | 2025 mineral-owner property holdings for **Kenedy** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_kent`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_kent) | table | 7,273 | 51 | 2025 mineral-owner property holdings for **Kent** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_kimble`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_kimble) | table | 201 | 18 | 2025 mineral-owner property holdings for **Kimble** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_king`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_king) | table | 1,581 | 51 | 2025 mineral-owner property holdings for **King** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_kleberg`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_kleberg) | table | 4,720 | 18 | 2025 mineral-owner property holdings for **Kleberg** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_lamb`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_lamb) | table | 1,404 | 18 | 2025 mineral-owner property holdings for **Lamb** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_lavaca`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_lavaca) | table | 56,220 | 49 | 2025 mineral-owner property holdings for **Lavaca** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_leon`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_leon) | table | 26,435 | 51 | 2025 mineral-owner property holdings for **Leon** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_liberty`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_liberty) | table | 17,864 | 17 | 2025 mineral-owner property holdings for **Liberty** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_liveoak`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_liveoak) | table | 33,728 | 16 | 2025 mineral-owner property holdings for **Liveoak** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_loving`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_loving) | table | 102,406 | 51 | 2025 mineral-owner property holdings for **Loving** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_lynn`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_lynn) | table | 1,583 | 51 | 2025 mineral-owner property holdings for **Lynn** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_marion`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_marion) | table | 5,295 | 13 | 2025 mineral-owner property holdings for **Marion** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_martin`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_martin) | table | 195,912 | 51 | 2025 mineral-owner property holdings for **Martin** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_matagorda`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_matagorda) | table | 6,302 | 17 | 2025 mineral-owner property holdings for **Matagorda** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_mcculloch`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_mcculloch) | table | 403 | 51 | 2025 mineral-owner property holdings for **Mcculloch** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_mclennan`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_mclennan) | table | n/a | 17 | 2025 mineral-owner property holdings for **Mclennan** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_menard`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_menard) | table | 338 | 51 | 2025 mineral-owner property holdings for **Menard** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_midland`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_midland) | table | 421,423 | 16 | 2025 mineral-owner property holdings for **Midland** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_milam`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_milam) | table | 14,780 | 17 | 2025 mineral-owner property holdings for **Milam** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_mitchell`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_mitchell) | table | 23,847 | 17 | 2025 mineral-owner property holdings for **Mitchell** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_morris`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_morris) | table | 608 | 51 | 2025 mineral-owner property holdings for **Morris** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_nacogodoches`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_nacogodoches) | table | 40,716 | 17 | 2025 mineral-owner property holdings for **Nacogodoches** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_navarro`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_navarro) | table | 2,161 | 17 | 2025 mineral-owner property holdings for **Navarro** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_newton`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_newton) | table | 3,671 | 51 | 2025 mineral-owner property holdings for **Newton** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_nolan`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_nolan) | table | 7,184 | 51 | 2025 mineral-owner property holdings for **Nolan** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_nueces`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_nueces) | table | 35,361 | 17 | 2025 mineral-owner property holdings for **Nueces** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_ochiltree`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_ochiltree) | table | 25,403 | 51 | 2025 mineral-owner property holdings for **Ochiltree** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_orange`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_orange) | table | 5,300 | 51 | 2025 mineral-owner property holdings for **Orange** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_panola`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_panola) | table | 377,255 | 51 | 2025 mineral-owner property holdings for **Panola** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_polk`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_polk) | table | 30,013 | 17 | 2025 mineral-owner property holdings for **Polk** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_rains`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_rains) | table | n/a | 17 | 2025 mineral-owner property holdings for **Rains** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_reagan`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_reagan) | table | 108,555 | 51 | 2025 mineral-owner property holdings for **Reagan** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_red_river`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_red_river) | table | 576 | 16 | 2025 mineral-owner property holdings for **Red River** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_reeves`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_reeves) | table | 187,214 | 16 | 2025 mineral-owner property holdings for **Reeves** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_refugio`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_refugio) | table | 5,237 | 51 | 2025 mineral-owner property holdings for **Refugio** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_robertson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_robertson) | table | 10,000 | 19 | 2025 mineral-owner property holdings for **Robertson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_rusk`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_rusk) | table | 143,053 | 51 | 2025 mineral-owner property holdings for **Rusk** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_san_augustine`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_san_augustine) | table | 39,546 | 51 | 2025 mineral-owner property holdings for **San Augustine** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_san_jacinto`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_san_jacinto) | table | 6,247 | 17 | 2025 mineral-owner property holdings for **San Jacinto** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_san_patricio`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_san_patricio) | table | 1,598 | 18 | 2025 mineral-owner property holdings for **San Patricio** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_scurry`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_scurry) | table | 54,925 | 17 | 2025 mineral-owner property holdings for **Scurry** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_shackelford`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_shackelford) | table | 10,194 | 17 | 2025 mineral-owner property holdings for **Shackelford** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_shelby`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_shelby) | table | 35,323 | 49 | 2025 mineral-owner property holdings for **Shelby** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_shelby_1`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_shelby_1) | table | 38,424 | 48 | 2025 mineral-owner property holdings for **Shelby (secondary copy)** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_sherman`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_sherman) | table | 12,264 | 51 | 2025 mineral-owner property holdings for **Sherman** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_starr`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_starr) | table | 16,356 | 19 | 2025 mineral-owner property holdings for **Starr** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_sterling`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_sterling) | table | 7,018 | 51 | 2025 mineral-owner property holdings for **Sterling** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_stonewall`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_stonewall) | table | 6,759 | 51 | 2025 mineral-owner property holdings for **Stonewall** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_taylor`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_taylor) | table | 5,598 | 17 | 2025 mineral-owner property holdings for **Taylor** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_terrell`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_terrell) | table | 10,679 | 17 | 2025 mineral-owner property holdings for **Terrell** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_terry`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_terry) | table | 10,000 | 17 | 2025 mineral-owner property holdings for **Terry** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_titus`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_titus) | table | 5,632 | 14 | 2025 mineral-owner property holdings for **Titus** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_trinity`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_trinity) | table | 457 | 51 | 2025 mineral-owner property holdings for **Trinity** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_tyler`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_tyler) | table | 15,348 | 17 | 2025 mineral-owner property holdings for **Tyler** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_upton`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_upton) | table | 264,605 | 51 | 2025 mineral-owner property holdings for **Upton** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_val_verde`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_val_verde) | table | 5,818 | 16 | 2025 mineral-owner property holdings for **Val Verde** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_victoria`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_victoria) | table | 5,387 | 15 | 2025 mineral-owner property holdings for **Victoria** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_victoria_1`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_victoria_1) | table | 5,756 | 17 | 2025 mineral-owner property holdings for **Victoria (secondary copy)** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_walker`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_walker) | table | 1,916 | 17 | 2025 mineral-owner property holdings for **Walker** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_ward`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_ward) | table | 70,345 | 51 | 2025 mineral-owner property holdings for **Ward** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_washington`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_washington) | table | 19,201 | 17 | 2025 mineral-owner property holdings for **Washington** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_webb`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_webb) | table | 48,919 | 17 | 2025 mineral-owner property holdings for **Webb** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_wheeler`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wheeler) | table | 63,635 | 51 | 2025 mineral-owner property holdings for **Wheeler** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_wichita`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wichita) | table | 13,462 | 19 | 2025 mineral-owner property holdings for **Wichita** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_wilbarger`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wilbarger) | table | 6,187 | 15 | 2025 mineral-owner property holdings for **Wilbarger** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_willacy`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_willacy) | table | 5,142 | 17 | 2025 mineral-owner property holdings for **Willacy** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_williamson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_williamson) | table | 201 | 15 | 2025 mineral-owner property holdings for **Williamson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_wilson`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wilson) | table | 19,845 | 17 | 2025 mineral-owner property holdings for **Wilson** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_winkler`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_winkler) | table | 50,199 | 19 | 2025 mineral-owner property holdings for **Winkler** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_wise`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wise) | table | 215,964 | 17 | 2025 mineral-owner property holdings for **Wise** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_wood`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wood) | table | 39,747 | 49 | 2025 mineral-owner property holdings for **Wood** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_yoakum`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_yoakum) | table | 88,621 | 17 | 2025 mineral-owner property holdings for **Yoakum** county (lease, decimal interest, valuation, property description). |
| [`mineralownerproperty_2025_young`](#mviewdownload-mineral_owner_2025-mineralownerproperty_2025_young) | table | 12,065 | 17 | 2025 mineral-owner property holdings for **Young** county (lease, decimal interest, valuation, property description). |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025"></a>
#### `mineral_owner_2025.mineralowner_2025`  (table)

- **Estimated rows:** 76
- **What it holds:** 2025 mineral-owner master (all counties): owner number, name and address.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_andrews"></a>
#### `mineral_owner_2025.mineralowner_2025_andrews`  (table)

- **Estimated rows:** 107,800
- **What it holds:** 2025 mineral-owner records for **Andrews** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_andrews_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_angelina"></a>
#### `mineral_owner_2025.mineralowner_2025_angelina`  (table)

- **Estimated rows:** 7,445
- **What it holds:** 2025 mineral-owner records for **Angelina** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_angelina_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_aransas"></a>
#### `mineral_owner_2025.mineralowner_2025_aransas`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner records for **Aransas** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer |  |  |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_archer"></a>
#### `mineral_owner_2025.mineralowner_2025_archer`  (table)

- **Estimated rows:** 3,182
- **What it holds:** 2025 mineral-owner records for **Archer** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_archer_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_armstrong"></a>
#### `mineral_owner_2025.mineralowner_2025_armstrong`  (table)

- **Estimated rows:** 58
- **What it holds:** 2025 mineral-owner records for **Armstrong** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_armstrong_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_atascosa"></a>
#### `mineral_owner_2025.mineralowner_2025_atascosa`  (table)

- **Estimated rows:** 42,178
- **What it holds:** 2025 mineral-owner records for **Atascosa** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_atascosa_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_bandera"></a>
#### `mineral_owner_2025.mineralowner_2025_bandera`  (table)

- **Estimated rows:** 51
- **What it holds:** 2025 mineral-owner records for **Bandera** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_bandera_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_bastrop"></a>
#### `mineral_owner_2025.mineralowner_2025_bastrop`  (table)

- **Estimated rows:** 487
- **What it holds:** 2025 mineral-owner records for **Bastrop** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_bastrop_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_bee"></a>
#### `mineral_owner_2025.mineralowner_2025_bee`  (table)

- **Estimated rows:** 3,178
- **What it holds:** 2025 mineral-owner records for **Bee** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer |  |  |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |
| 9 | `property_id` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_borden"></a>
#### `mineral_owner_2025.mineralowner_2025_borden`  (table)

- **Estimated rows:** 7,020
- **What it holds:** 2025 mineral-owner records for **Borden** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_borden_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_bowie"></a>
#### `mineral_owner_2025.mineralowner_2025_bowie`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner records for **Bowie** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_bowie_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_brazoria"></a>
#### `mineral_owner_2025.mineralowner_2025_brazoria`  (table)

- **Estimated rows:** 8,663
- **What it holds:** 2025 mineral-owner records for **Brazoria** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_brazoria_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_brazos"></a>
#### `mineral_owner_2025.mineralowner_2025_brazos`  (table)

- **Estimated rows:** 55,533
- **What it holds:** 2025 mineral-owner records for **Brazos** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_brazos_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_brooks"></a>
#### `mineral_owner_2025.mineralowner_2025_brooks`  (table)

- **Estimated rows:** 4,372
- **What it holds:** 2025 mineral-owner records for **Brooks** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_brooks_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_brown"></a>
#### `mineral_owner_2025.mineralowner_2025_brown`  (table)

- **Estimated rows:** 10,889
- **What it holds:** 2025 mineral-owner records for **Brown** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_brown_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_caldwell"></a>
#### `mineral_owner_2025.mineralowner_2025_caldwell`  (table)

- **Estimated rows:** 16,544
- **What it holds:** 2025 mineral-owner records for **Caldwell** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_caldwell_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_calhoun"></a>
#### `mineral_owner_2025.mineralowner_2025_calhoun`  (table)

- **Estimated rows:** 567
- **What it holds:** 2025 mineral-owner records for **Calhoun** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_calhoun_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_camp"></a>
#### `mineral_owner_2025.mineralowner_2025_camp`  (table)

- **Estimated rows:** 9,295
- **What it holds:** 2025 mineral-owner records for **Camp** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_camp_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_carson"></a>
#### `mineral_owner_2025.mineralowner_2025_carson`  (table)

- **Estimated rows:** 4,227
- **What it holds:** 2025 mineral-owner records for **Carson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_carson_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_cass"></a>
#### `mineral_owner_2025.mineralowner_2025_cass`  (table)

- **Estimated rows:** 8,954
- **What it holds:** 2025 mineral-owner records for **Cass** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_cass_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_chambers"></a>
#### `mineral_owner_2025.mineralowner_2025_chambers`  (table)

- **Estimated rows:** 4,631
- **What it holds:** 2025 mineral-owner records for **Chambers** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_chambers_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_childress"></a>
#### `mineral_owner_2025.mineralowner_2025_childress`  (table)

- **Estimated rows:** 51
- **What it holds:** 2025 mineral-owner records for **Childress** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_childress_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_clay"></a>
#### `mineral_owner_2025.mineralowner_2025_clay`  (table)

- **Estimated rows:** 2,134
- **What it holds:** 2025 mineral-owner records for **Clay** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_clay_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_cochran"></a>
#### `mineral_owner_2025.mineralowner_2025_cochran`  (table)

- **Estimated rows:** 16,558
- **What it holds:** 2025 mineral-owner records for **Cochran** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_cochran_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_coke"></a>
#### `mineral_owner_2025.mineralowner_2025_coke`  (table)

- **Estimated rows:** 1,355
- **What it holds:** 2025 mineral-owner records for **Coke** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_coke_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_coleman"></a>
#### `mineral_owner_2025.mineralowner_2025_coleman`  (table)

- **Estimated rows:** 3,439
- **What it holds:** 2025 mineral-owner records for **Coleman** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_coleman_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_collingsworth"></a>
#### `mineral_owner_2025.mineralowner_2025_collingsworth`  (table)

- **Estimated rows:** 840
- **What it holds:** 2025 mineral-owner records for **Collingsworth** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_collingsworth_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_comanche"></a>
#### `mineral_owner_2025.mineralowner_2025_comanche`  (table)

- **Estimated rows:** 2,032
- **What it holds:** 2025 mineral-owner records for **Comanche** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_comanche_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_cooke"></a>
#### `mineral_owner_2025.mineralowner_2025_cooke`  (table)

- **Estimated rows:** 35,002
- **What it holds:** 2025 mineral-owner records for **Cooke** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_cooke_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_cottle"></a>
#### `mineral_owner_2025.mineralowner_2025_cottle`  (table)

- **Estimated rows:** 248
- **What it holds:** 2025 mineral-owner records for **Cottle** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_cottle_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_crane"></a>
#### `mineral_owner_2025.mineralowner_2025_crane`  (table)

- **Estimated rows:** 5,761
- **What it holds:** 2025 mineral-owner records for **Crane** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_crane_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_crockett"></a>
#### `mineral_owner_2025.mineralowner_2025_crockett`  (table)

- **Estimated rows:** 3,812
- **What it holds:** 2025 mineral-owner records for **Crockett** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_crockett_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_crosby"></a>
#### `mineral_owner_2025.mineralowner_2025_crosby`  (table)

- **Estimated rows:** 452
- **What it holds:** 2025 mineral-owner records for **Crosby** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_crosby_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_culberson"></a>
#### `mineral_owner_2025.mineralowner_2025_culberson`  (table)

- **Estimated rows:** 804
- **What it holds:** 2025 mineral-owner records for **Culberson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_culberson_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_dawson"></a>
#### `mineral_owner_2025.mineralowner_2025_dawson`  (table)

- **Estimated rows:** 10,113
- **What it holds:** 2025 mineral-owner records for **Dawson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_dawson_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_denton"></a>
#### `mineral_owner_2025.mineralowner_2025_denton`  (table)

- **Estimated rows:** 61,233
- **What it holds:** 2025 mineral-owner records for **Denton** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_denton_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_dewitt"></a>
#### `mineral_owner_2025.mineralowner_2025_dewitt`  (table)

- **Estimated rows:** 9,183
- **What it holds:** 2025 mineral-owner records for **Dewitt** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_dewitt_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_dickens"></a>
#### `mineral_owner_2025.mineralowner_2025_dickens`  (table)

- **Estimated rows:** 1,281
- **What it holds:** 2025 mineral-owner records for **Dickens** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_dickens_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_donley"></a>
#### `mineral_owner_2025.mineralowner_2025_donley`  (table)

- **Estimated rows:** 206
- **What it holds:** 2025 mineral-owner records for **Donley** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_donley_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_duval"></a>
#### `mineral_owner_2025.mineralowner_2025_duval`  (table)

- **Estimated rows:** 3,467
- **What it holds:** 2025 mineral-owner records for **Duval** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_duval_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_eastland"></a>
#### `mineral_owner_2025.mineralowner_2025_eastland`  (table)

- **Estimated rows:** 3,540
- **What it holds:** 2025 mineral-owner records for **Eastland** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_eastland_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_ector"></a>
#### `mineral_owner_2025.mineralowner_2025_ector`  (table)

- **Estimated rows:** 11,216
- **What it holds:** 2025 mineral-owner records for **Ector** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_ector_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_edwards"></a>
#### `mineral_owner_2025.mineralowner_2025_edwards`  (table)

- **Estimated rows:** 1,207
- **What it holds:** 2025 mineral-owner records for **Edwards** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_edwards_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_ellis"></a>
#### `mineral_owner_2025.mineralowner_2025_ellis`  (table)

- **Estimated rows:** 1,805
- **What it holds:** 2025 mineral-owner records for **Ellis** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_ellis_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_fayette"></a>
#### `mineral_owner_2025.mineralowner_2025_fayette`  (table)

- **Estimated rows:** 19,000
- **What it holds:** 2025 mineral-owner records for **Fayette** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_fayette_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_fisher"></a>
#### `mineral_owner_2025.mineralowner_2025_fisher`  (table)

- **Estimated rows:** 5,286
- **What it holds:** 2025 mineral-owner records for **Fisher** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_fisher_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_foard"></a>
#### `mineral_owner_2025.mineralowner_2025_foard`  (table)

- **Estimated rows:** 452
- **What it holds:** 2025 mineral-owner records for **Foard** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_foard_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_fort_bend"></a>
#### `mineral_owner_2025.mineralowner_2025_fort_bend`  (table)

- **Estimated rows:** 14,121
- **What it holds:** 2025 mineral-owner records for **Fort Bend** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_fort_bend_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_franklin"></a>
#### `mineral_owner_2025.mineralowner_2025_franklin`  (table)

- **Estimated rows:** 2,843
- **What it holds:** 2025 mineral-owner records for **Franklin** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_franklin_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_freestone"></a>
#### `mineral_owner_2025.mineralowner_2025_freestone`  (table)

- **Estimated rows:** 11,743
- **What it holds:** 2025 mineral-owner records for **Freestone** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_freestone_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_frio"></a>
#### `mineral_owner_2025.mineralowner_2025_frio`  (table)

- **Estimated rows:** 2,723
- **What it holds:** 2025 mineral-owner records for **Frio** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_frio_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_gaines"></a>
#### `mineral_owner_2025.mineralowner_2025_gaines`  (table)

- **Estimated rows:** 72,814
- **What it holds:** 2025 mineral-owner records for **Gaines** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_gaines_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_galveston"></a>
#### `mineral_owner_2025.mineralowner_2025_galveston`  (table)

- **Estimated rows:** 2,258
- **What it holds:** 2025 mineral-owner records for **Galveston** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_galveston_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_garza"></a>
#### `mineral_owner_2025.mineralowner_2025_garza`  (table)

- **Estimated rows:** 6,189
- **What it holds:** 2025 mineral-owner records for **Garza** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_garza_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_goliad"></a>
#### `mineral_owner_2025.mineralowner_2025_goliad`  (table)

- **Estimated rows:** 1,458
- **What it holds:** 2025 mineral-owner records for **Goliad** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_goliad_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_gonzales"></a>
#### `mineral_owner_2025.mineralowner_2025_gonzales`  (table)

- **Estimated rows:** 9,695
- **What it holds:** 2025 mineral-owner records for **Gonzales** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_gonzales_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_grayson"></a>
#### `mineral_owner_2025.mineralowner_2025_grayson`  (table)

- **Estimated rows:** 16,256
- **What it holds:** 2025 mineral-owner records for **Grayson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_grayson_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_gregg"></a>
#### `mineral_owner_2025.mineralowner_2025_gregg`  (table)

- **Estimated rows:** 268,900
- **What it holds:** 2025 mineral-owner records for **Gregg** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_gregg_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_grimes"></a>
#### `mineral_owner_2025.mineralowner_2025_grimes`  (table)

- **Estimated rows:** 7,194
- **What it holds:** 2025 mineral-owner records for **Grimes** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_grimes_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_guadalupe"></a>
#### `mineral_owner_2025.mineralowner_2025_guadalupe`  (table)

- **Estimated rows:** 2,831
- **What it holds:** 2025 mineral-owner records for **Guadalupe** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_guadalupe_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hale"></a>
#### `mineral_owner_2025.mineralowner_2025_hale`  (table)

- **Estimated rows:** 3,891
- **What it holds:** 2025 mineral-owner records for **Hale** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_hale_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hall"></a>
#### `mineral_owner_2025.mineralowner_2025_hall`  (table)

- **Estimated rows:** 108
- **What it holds:** 2025 mineral-owner records for **Hall** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_hall_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hamilton"></a>
#### `mineral_owner_2025.mineralowner_2025_hamilton`  (table)

- **Estimated rows:** 58
- **What it holds:** 2025 mineral-owner records for **Hamilton** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_hamilton_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hansford"></a>
#### `mineral_owner_2025.mineralowner_2025_hansford`  (table)

- **Estimated rows:** 3,908
- **What it holds:** 2025 mineral-owner records for **Hansford** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_hansford_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hardeman"></a>
#### `mineral_owner_2025.mineralowner_2025_hardeman`  (table)

- **Estimated rows:** 1,435
- **What it holds:** 2025 mineral-owner records for **Hardeman** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_hardeman_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hardin"></a>
#### `mineral_owner_2025.mineralowner_2025_hardin`  (table)

- **Estimated rows:** 6,299
- **What it holds:** 2025 mineral-owner records for **Hardin** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_hardin_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_haskell"></a>
#### `mineral_owner_2025.mineralowner_2025_haskell`  (table)

- **Estimated rows:** 1,737
- **What it holds:** 2025 mineral-owner records for **Haskell** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_haskell_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hemphill"></a>
#### `mineral_owner_2025.mineralowner_2025_hemphill`  (table)

- **Estimated rows:** 5,026
- **What it holds:** 2025 mineral-owner records for **Hemphill** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_hemphill_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hill"></a>
#### `mineral_owner_2025.mineralowner_2025_hill`  (table)

- **Estimated rows:** 4,931
- **What it holds:** 2025 mineral-owner records for **Hill** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_hill_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hockley"></a>
#### `mineral_owner_2025.mineralowner_2025_hockley`  (table)

- **Estimated rows:** 7,133
- **What it holds:** 2025 mineral-owner records for **Hockley** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_hockley_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_houston"></a>
#### `mineral_owner_2025.mineralowner_2025_houston`  (table)

- **Estimated rows:** 3,663
- **What it holds:** 2025 mineral-owner records for **Houston** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_houston_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_howard"></a>
#### `mineral_owner_2025.mineralowner_2025_howard`  (table)

- **Estimated rows:** 25,182
- **What it holds:** 2025 mineral-owner records for **Howard** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_howard_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_howard_1"></a>
#### `mineral_owner_2025.mineralowner_2025_howard_1`  (table)

- **Estimated rows:** 23,890
- **What it holds:** 2025 mineral-owner records for **Howard (secondary copy)** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_howard_1_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_hutchinson"></a>
#### `mineral_owner_2025.mineralowner_2025_hutchinson`  (table)

- **Estimated rows:** 3,000
- **What it holds:** 2025 mineral-owner records for **Hutchinson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_hutchinson_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_irion"></a>
#### `mineral_owner_2025.mineralowner_2025_irion`  (table)

- **Estimated rows:** 1,822
- **What it holds:** 2025 mineral-owner records for **Irion** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_irion_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_jack"></a>
#### `mineral_owner_2025.mineralowner_2025_jack`  (table)

- **Estimated rows:** 5,636
- **What it holds:** 2025 mineral-owner records for **Jack** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_jack_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_jasper"></a>
#### `mineral_owner_2025.mineralowner_2025_jasper`  (table)

- **Estimated rows:** 6,727
- **What it holds:** 2025 mineral-owner records for **Jasper** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_jasper_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_jefferson"></a>
#### `mineral_owner_2025.mineralowner_2025_jefferson`  (table)

- **Estimated rows:** 9,259
- **What it holds:** 2025 mineral-owner records for **Jefferson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_jefferson_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_jimhogg"></a>
#### `mineral_owner_2025.mineralowner_2025_jimhogg`  (table)

- **Estimated rows:** 736
- **What it holds:** 2025 mineral-owner records for **Jimhogg** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_jimhogg_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_jones"></a>
#### `mineral_owner_2025.mineralowner_2025_jones`  (table)

- **Estimated rows:** 4,068
- **What it holds:** 2025 mineral-owner records for **Jones** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_jones_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_karnes"></a>
#### `mineral_owner_2025.mineralowner_2025_karnes`  (table)

- **Estimated rows:** 17,390
- **What it holds:** 2025 mineral-owner records for **Karnes** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_karnes_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_kenedy"></a>
#### `mineral_owner_2025.mineralowner_2025_kenedy`  (table)

- **Estimated rows:** 9,179
- **What it holds:** 2025 mineral-owner records for **Kenedy** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_kenedy_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_kent"></a>
#### `mineral_owner_2025.mineralowner_2025_kent`  (table)

- **Estimated rows:** 2,641
- **What it holds:** 2025 mineral-owner records for **Kent** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_kent_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_kimble"></a>
#### `mineral_owner_2025.mineralowner_2025_kimble`  (table)

- **Estimated rows:** 201
- **What it holds:** 2025 mineral-owner records for **Kimble** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_kimble_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_king"></a>
#### `mineral_owner_2025.mineralowner_2025_king`  (table)

- **Estimated rows:** 614
- **What it holds:** 2025 mineral-owner records for **King** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_king_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_kleberg"></a>
#### `mineral_owner_2025.mineralowner_2025_kleberg`  (table)

- **Estimated rows:** 4,720
- **What it holds:** 2025 mineral-owner records for **Kleberg** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_kleberg_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_lamb"></a>
#### `mineral_owner_2025.mineralowner_2025_lamb`  (table)

- **Estimated rows:** 1,404
- **What it holds:** 2025 mineral-owner records for **Lamb** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_lamb_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_lavaca"></a>
#### `mineral_owner_2025.mineralowner_2025_lavaca`  (table)

- **Estimated rows:** 10,904
- **What it holds:** 2025 mineral-owner records for **Lavaca** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_lavaca_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_leon"></a>
#### `mineral_owner_2025.mineralowner_2025_leon`  (table)

- **Estimated rows:** 7,415
- **What it holds:** 2025 mineral-owner records for **Leon** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_leon_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_liberty"></a>
#### `mineral_owner_2025.mineralowner_2025_liberty`  (table)

- **Estimated rows:** 16,264
- **What it holds:** 2025 mineral-owner records for **Liberty** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_liberty_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_liveoak"></a>
#### `mineral_owner_2025.mineralowner_2025_liveoak`  (table)

- **Estimated rows:** 6,298
- **What it holds:** 2025 mineral-owner records for **Liveoak** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_liveoak_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_loving"></a>
#### `mineral_owner_2025.mineralowner_2025_loving`  (table)

- **Estimated rows:** 9,998
- **What it holds:** 2025 mineral-owner records for **Loving** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_loving_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_lynn"></a>
#### `mineral_owner_2025.mineralowner_2025_lynn`  (table)

- **Estimated rows:** 779
- **What it holds:** 2025 mineral-owner records for **Lynn** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_lynn_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_marion"></a>
#### `mineral_owner_2025.mineralowner_2025_marion`  (table)

- **Estimated rows:** 2,718
- **What it holds:** 2025 mineral-owner records for **Marion** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_marion_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_martin"></a>
#### `mineral_owner_2025.mineralowner_2025_martin`  (table)

- **Estimated rows:** 13,471
- **What it holds:** 2025 mineral-owner records for **Martin** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_martin_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_matagorda"></a>
#### `mineral_owner_2025.mineralowner_2025_matagorda`  (table)

- **Estimated rows:** 5,896
- **What it holds:** 2025 mineral-owner records for **Matagorda** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_matagorda_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_mcculloch"></a>
#### `mineral_owner_2025.mineralowner_2025_mcculloch`  (table)

- **Estimated rows:** 93
- **What it holds:** 2025 mineral-owner records for **Mcculloch** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_mcculloch_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_mclennan"></a>
#### `mineral_owner_2025.mineralowner_2025_mclennan`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner records for **Mclennan** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_mclennan_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_menard"></a>
#### `mineral_owner_2025.mineralowner_2025_menard`  (table)

- **Estimated rows:** 138
- **What it holds:** 2025 mineral-owner records for **Menard** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_menard_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_midland"></a>
#### `mineral_owner_2025.mineralowner_2025_midland`  (table)

- **Estimated rows:** 399,725
- **What it holds:** 2025 mineral-owner records for **Midland** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_midland_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_milam"></a>
#### `mineral_owner_2025.mineralowner_2025_milam`  (table)

- **Estimated rows:** 14,780
- **What it holds:** 2025 mineral-owner records for **Milam** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_milam_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_mitchell"></a>
#### `mineral_owner_2025.mineralowner_2025_mitchell`  (table)

- **Estimated rows:** 23,274
- **What it holds:** 2025 mineral-owner records for **Mitchell** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_mitchell_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_morris"></a>
#### `mineral_owner_2025.mineralowner_2025_morris`  (table)

- **Estimated rows:** 181
- **What it holds:** 2025 mineral-owner records for **Morris** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_morris_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_nacogodoches"></a>
#### `mineral_owner_2025.mineralowner_2025_nacogodoches`  (table)

- **Estimated rows:** 40,062
- **What it holds:** 2025 mineral-owner records for **Nacogodoches** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_nacogodoches_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_navarro"></a>
#### `mineral_owner_2025.mineralowner_2025_navarro`  (table)

- **Estimated rows:** 1,850
- **What it holds:** 2025 mineral-owner records for **Navarro** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_navarro_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_newton"></a>
#### `mineral_owner_2025.mineralowner_2025_newton`  (table)

- **Estimated rows:** 1,753
- **What it holds:** 2025 mineral-owner records for **Newton** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_newton_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_nolan"></a>
#### `mineral_owner_2025.mineralowner_2025_nolan`  (table)

- **Estimated rows:** 2,862
- **What it holds:** 2025 mineral-owner records for **Nolan** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_nolan_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_nueces"></a>
#### `mineral_owner_2025.mineralowner_2025_nueces`  (table)

- **Estimated rows:** 35,344
- **What it holds:** 2025 mineral-owner records for **Nueces** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_nueces_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_ochiltree"></a>
#### `mineral_owner_2025.mineralowner_2025_ochiltree`  (table)

- **Estimated rows:** 6,055
- **What it holds:** 2025 mineral-owner records for **Ochiltree** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_ochiltree_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_orange"></a>
#### `mineral_owner_2025.mineralowner_2025_orange`  (table)

- **Estimated rows:** 1,843
- **What it holds:** 2025 mineral-owner records for **Orange** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_orange_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_panola"></a>
#### `mineral_owner_2025.mineralowner_2025_panola`  (table)

- **Estimated rows:** 29,955
- **What it holds:** 2025 mineral-owner records for **Panola** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_panola_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_polk"></a>
#### `mineral_owner_2025.mineralowner_2025_polk`  (table)

- **Estimated rows:** 29,672
- **What it holds:** 2025 mineral-owner records for **Polk** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_polk_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_rains"></a>
#### `mineral_owner_2025.mineralowner_2025_rains`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner records for **Rains** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_rains_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_reagan"></a>
#### `mineral_owner_2025.mineralowner_2025_reagan`  (table)

- **Estimated rows:** 8,817
- **What it holds:** 2025 mineral-owner records for **Reagan** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_reagan_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_red_river"></a>
#### `mineral_owner_2025.mineralowner_2025_red_river`  (table)

- **Estimated rows:** 212
- **What it holds:** 2025 mineral-owner records for **Red River** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_red_river_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_reeves"></a>
#### `mineral_owner_2025.mineralowner_2025_reeves`  (table)

- **Estimated rows:** 186,176
- **What it holds:** 2025 mineral-owner records for **Reeves** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_reeves_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_refugio"></a>
#### `mineral_owner_2025.mineralowner_2025_refugio`  (table)

- **Estimated rows:** 1,293
- **What it holds:** 2025 mineral-owner records for **Refugio** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_refugio_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_robertson"></a>
#### `mineral_owner_2025.mineralowner_2025_robertson`  (table)

- **Estimated rows:** 3,605
- **What it holds:** 2025 mineral-owner records for **Robertson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer |  |  |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |
| 9 | `property_id` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_rusk"></a>
#### `mineral_owner_2025.mineralowner_2025_rusk`  (table)

- **Estimated rows:** 28,010
- **What it holds:** 2025 mineral-owner records for **Rusk** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_rusk_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_san_augustine"></a>
#### `mineral_owner_2025.mineralowner_2025_san_augustine`  (table)

- **Estimated rows:** 8,930
- **What it holds:** 2025 mineral-owner records for **San Augustine** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_san_augustine_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_san_jacinto"></a>
#### `mineral_owner_2025.mineralowner_2025_san_jacinto`  (table)

- **Estimated rows:** 6,247
- **What it holds:** 2025 mineral-owner records for **San Jacinto** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_san_jacinto_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_san_patricio"></a>
#### `mineral_owner_2025.mineralowner_2025_san_patricio`  (table)

- **Estimated rows:** 1,555
- **What it holds:** 2025 mineral-owner records for **San Patricio** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_san_patricio_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_scurry"></a>
#### `mineral_owner_2025.mineralowner_2025_scurry`  (table)

- **Estimated rows:** 53,509
- **What it holds:** 2025 mineral-owner records for **Scurry** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_scurry_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_shackelford"></a>
#### `mineral_owner_2025.mineralowner_2025_shackelford`  (table)

- **Estimated rows:** 9,531
- **What it holds:** 2025 mineral-owner records for **Shackelford** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_shackelford_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_shelby"></a>
#### `mineral_owner_2025.mineralowner_2025_shelby`  (table)

- **Estimated rows:** 10,766
- **What it holds:** 2025 mineral-owner records for **Shelby** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_shelby_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_shelby_1"></a>
#### `mineral_owner_2025.mineralowner_2025_shelby_1`  (table)

- **Estimated rows:** 38,424
- **What it holds:** 2025 mineral-owner records for **Shelby (secondary copy)** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_shelby_1_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_sherman"></a>
#### `mineral_owner_2025.mineralowner_2025_sherman`  (table)

- **Estimated rows:** 2,838
- **What it holds:** 2025 mineral-owner records for **Sherman** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_sherman_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_starr"></a>
#### `mineral_owner_2025.mineralowner_2025_starr`  (table)

- **Estimated rows:** 3,965
- **What it holds:** 2025 mineral-owner records for **Starr** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer |  |  |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |
| 9 | `property_id` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_sterling"></a>
#### `mineral_owner_2025.mineralowner_2025_sterling`  (table)

- **Estimated rows:** 1,882
- **What it holds:** 2025 mineral-owner records for **Sterling** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_sterling_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_stonewall"></a>
#### `mineral_owner_2025.mineralowner_2025_stonewall`  (table)

- **Estimated rows:** 3,424
- **What it holds:** 2025 mineral-owner records for **Stonewall** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_stonewall_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_taylor"></a>
#### `mineral_owner_2025.mineralowner_2025_taylor`  (table)

- **Estimated rows:** 5,584
- **What it holds:** 2025 mineral-owner records for **Taylor** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_taylor_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_terrell"></a>
#### `mineral_owner_2025.mineralowner_2025_terrell`  (table)

- **Estimated rows:** 10,679
- **What it holds:** 2025 mineral-owner records for **Terrell** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_terrell_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_terry"></a>
#### `mineral_owner_2025.mineralowner_2025_terry`  (table)

- **Estimated rows:** 10,000
- **What it holds:** 2025 mineral-owner records for **Terry** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_terry_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_titus"></a>
#### `mineral_owner_2025.mineralowner_2025_titus`  (table)

- **Estimated rows:** 1,625
- **Primary key:** `id`
- **What it holds:** 2025 mineral-owner records for **Titus** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |
| 8 | `property_id` | character varying |  |  |
| 9 | `id` 🔑 | integer | ✔ |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_trinity"></a>
#### `mineral_owner_2025.mineralowner_2025_trinity`  (table)

- **Estimated rows:** 203
- **What it holds:** 2025 mineral-owner records for **Trinity** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_trinity_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_tyler"></a>
#### `mineral_owner_2025.mineralowner_2025_tyler`  (table)

- **Estimated rows:** 15,348
- **What it holds:** 2025 mineral-owner records for **Tyler** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_tyler_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_upton"></a>
#### `mineral_owner_2025.mineralowner_2025_upton`  (table)

- **Estimated rows:** 14,257
- **What it holds:** 2025 mineral-owner records for **Upton** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_upton_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_val_verde"></a>
#### `mineral_owner_2025.mineralowner_2025_val_verde`  (table)

- **Estimated rows:** 5,472
- **What it holds:** 2025 mineral-owner records for **Val Verde** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_val_verde_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_victoria"></a>
#### `mineral_owner_2025.mineralowner_2025_victoria`  (table)

- **Estimated rows:** 2,168
- **What it holds:** 2025 mineral-owner records for **Victoria** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_victoria_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_victoria_1"></a>
#### `mineral_owner_2025.mineralowner_2025_victoria_1`  (table)

- **Estimated rows:** 2,481
- **What it holds:** 2025 mineral-owner records for **Victoria (secondary copy)** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_victoria_1_id_seq'::regclass) |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_walker"></a>
#### `mineral_owner_2025.mineralowner_2025_walker`  (table)

- **Estimated rows:** 1,916
- **What it holds:** 2025 mineral-owner records for **Walker** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_walker_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_ward"></a>
#### `mineral_owner_2025.mineralowner_2025_ward`  (table)

- **Estimated rows:** 9,012
- **What it holds:** 2025 mineral-owner records for **Ward** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_ward_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_washington"></a>
#### `mineral_owner_2025.mineralowner_2025_washington`  (table)

- **Estimated rows:** 18,851
- **What it holds:** 2025 mineral-owner records for **Washington** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_washington_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_webb"></a>
#### `mineral_owner_2025.mineralowner_2025_webb`  (table)

- **Estimated rows:** 48,808
- **What it holds:** 2025 mineral-owner records for **Webb** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_webb_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_wheeler"></a>
#### `mineral_owner_2025.mineralowner_2025_wheeler`  (table)

- **Estimated rows:** 8,486
- **What it holds:** 2025 mineral-owner records for **Wheeler** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_wheeler_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_wichita"></a>
#### `mineral_owner_2025.mineralowner_2025_wichita`  (table)

- **Estimated rows:** 2,913
- **What it holds:** 2025 mineral-owner records for **Wichita** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer |  |  |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |
| 9 | `property_id` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_wilbarger"></a>
#### `mineral_owner_2025.mineralowner_2025_wilbarger`  (table)

- **Estimated rows:** 1,591
- **What it holds:** 2025 mineral-owner records for **Wilbarger** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_wilbarger_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_willacy"></a>
#### `mineral_owner_2025.mineralowner_2025_willacy`  (table)

- **Estimated rows:** 5,142
- **What it holds:** 2025 mineral-owner records for **Willacy** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_willacy_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_williamson"></a>
#### `mineral_owner_2025.mineralowner_2025_williamson`  (table)

- **Estimated rows:** 198
- **What it holds:** 2025 mineral-owner records for **Williamson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_williamson_id_seq'::regclass) |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_wilson"></a>
#### `mineral_owner_2025.mineralowner_2025_wilson`  (table)

- **Estimated rows:** 18,655
- **What it holds:** 2025 mineral-owner records for **Wilson** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_wilson_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_winkler"></a>
#### `mineral_owner_2025.mineralowner_2025_winkler`  (table)

- **Estimated rows:** 6,859
- **What it holds:** 2025 mineral-owner records for **Winkler** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer |  |  |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |
| 9 | `property_id` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_wise"></a>
#### `mineral_owner_2025.mineralowner_2025_wise`  (table)

- **Estimated rows:** 203,683
- **What it holds:** 2025 mineral-owner records for **Wise** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_wise_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_wood"></a>
#### `mineral_owner_2025.mineralowner_2025_wood`  (table)

- **Estimated rows:** 8,600
- **What it holds:** 2025 mineral-owner records for **Wood** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralowner_2025_wood_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `ownercountyname` | character varying |  |  |
| 7 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_yoakum"></a>
#### `mineral_owner_2025.mineralowner_2025_yoakum`  (table)

- **Estimated rows:** 95,325
- **What it holds:** 2025 mineral-owner records for **Yoakum** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_yoakum_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralowner_2025_young"></a>
#### `mineral_owner_2025.mineralowner_2025_young`  (table)

- **Estimated rows:** 11,191
- **What it holds:** 2025 mineral-owner records for **Young** county (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `ownernumber` | character varying |  |  |
| 4 | `ownername` | character varying |  |  |
| 5 | `owneraddress` | character varying |  |  |
| 6 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralowner_2025_young_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025"></a>
#### `mineral_owner_2025.mineralownerproperty_2025`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner property/holdings master (all counties, 52 cols): lease/district, royalty interest, valuation and property description.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `mineralownerid2` | integer |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `id` | integer | ✔ |  |
| 14 | `mineralaccountnumber` | character varying |  |  |
| 15 | `mineralaccountsequence` | character varying |  |  |
| 16 | `leaseacres` | character varying |  |  |
| 17 | `jur_1_taxable_value` | character varying |  |  |
| 18 | `jur_2_taxable_value` | character varying |  |  |
| 19 | `jur_3_taxable_value` | character varying |  |  |
| 20 | `jur_4_taxable_value` | character varying |  |  |
| 21 | `jur_5_taxable_value` | character varying |  |  |
| 22 | `jur_6_taxable_value` | character varying |  |  |
| 23 | `jur_7_taxable_value` | character varying |  |  |
| 24 | `jur_8_taxable_value` | character varying |  |  |
| 25 | `jur_9_taxable_value` | character varying |  |  |
| 26 | `jur_10_taxable_value` | character varying |  |  |
| 27 | `jur_11_taxable_value` | character varying |  |  |
| 28 | `jur_12_taxable_value` | character varying |  |  |
| 29 | `jur_1_market_value` | character varying |  |  |
| 30 | `jur_2_market_value` | character varying |  |  |
| 31 | `jur_3_market_value` | character varying |  |  |
| 32 | `jur_4_market_value` | character varying |  |  |
| 33 | `jur_5_market_value` | character varying |  |  |
| 34 | `jur_6_market_value` | character varying |  |  |
| 35 | `jur_7_market_value` | character varying |  |  |
| 36 | `jur_8_market_value` | character varying |  |  |
| 37 | `jur_9_market_value` | character varying |  |  |
| 38 | `jur_10_market_value` | character varying |  |  |
| 39 | `jur_11_market_value` | character varying |  |  |
| 40 | `jur_12_market_value` | character varying |  |  |
| 41 | `taxable_value_new_jur_1` | character varying |  |  |
| 42 | `taxable_value_new_jur_2` | character varying |  |  |
| 43 | `taxable_value_new_jur_3` | character varying |  |  |
| 44 | `taxable_value_new_jur_4` | character varying |  |  |
| 45 | `taxable_value_new_jur_5` | character varying |  |  |
| 46 | `taxable_value_new_jur_6` | character varying |  |  |
| 47 | `taxable_value_new_jur_7` | character varying |  |  |
| 48 | `taxable_value_new_jur_8` | character varying |  |  |
| 49 | `taxable_value_new_jur_9` | character varying |  |  |
| 50 | `taxable_value_new_jur_10` | character varying |  |  |
| 51 | `taxable_value_new_jur_11` | character varying |  |  |
| 52 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_andrews"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_andrews`  (table)

- **Estimated rows:** 111,628
- **What it holds:** 2025 mineral-owner property holdings for **Andrews** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_andrews_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value_website` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `market_value_website` | character varying |  |  |
| 18 | `assessed_value` | character varying |  |  |
| 19 | `assessed_value_website` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_angelina"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_angelina`  (table)

- **Estimated rows:** 7,665
- **What it holds:** 2025 mineral-owner property holdings for **Angelina** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_angelina_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_aransas"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_aransas`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner property holdings for **Aransas** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `property_id` | character varying |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `id` | integer |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_archer"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_archer`  (table)

- **Estimated rows:** 8,483
- **What it holds:** 2025 mineral-owner property holdings for **Archer** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_archer_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_armstrong"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_armstrong`  (table)

- **Estimated rows:** 377
- **What it holds:** 2025 mineral-owner property holdings for **Armstrong** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_armstrong_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_atascosa"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_atascosa`  (table)

- **Estimated rows:** 42,178
- **What it holds:** 2025 mineral-owner property holdings for **Atascosa** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_atascosa_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_bandera"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_bandera`  (table)

- **Estimated rows:** 78
- **What it holds:** 2025 mineral-owner property holdings for **Bandera** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_bandera_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_bastrop"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_bastrop`  (table)

- **Estimated rows:** 737
- **What it holds:** 2025 mineral-owner property holdings for **Bastrop** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_bastrop_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_bee"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_bee`  (table)

- **Estimated rows:** 10,327
- **What it holds:** 2025 mineral-owner property holdings for **Bee** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `property_id` | character varying |  |  |
| 17 | `mineral_value` | character varying |  |  |
| 18 | `market_value` | character varying |  |  |
| 19 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_borden"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_borden`  (table)

- **Estimated rows:** 31,965
- **What it holds:** 2025 mineral-owner property holdings for **Borden** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_borden_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_bowie"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_bowie`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner property holdings for **Bowie** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_bowie_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `net_appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_brazoria"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_brazoria`  (table)

- **Estimated rows:** 38,908
- **What it holds:** 2025 mineral-owner property holdings for **Brazoria** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_brazoria_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_brazos"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_brazos`  (table)

- **Estimated rows:** 56,257
- **What it holds:** 2025 mineral-owner property holdings for **Brazos** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_brazos_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_brooks"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_brooks`  (table)

- **Estimated rows:** 4,372
- **What it holds:** 2025 mineral-owner property holdings for **Brooks** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_brooks_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_brown"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_brown`  (table)

- **Estimated rows:** 10,892
- **What it holds:** 2025 mineral-owner property holdings for **Brown** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_brown_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_caldwell"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_caldwell`  (table)

- **Estimated rows:** 16,544
- **What it holds:** 2025 mineral-owner property holdings for **Caldwell** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_caldwell_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_calhoun"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_calhoun`  (table)

- **Estimated rows:** 567
- **What it holds:** 2025 mineral-owner property holdings for **Calhoun** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_calhoun_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_camp"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_camp`  (table)

- **Estimated rows:** 9,314
- **What it holds:** 2025 mineral-owner property holdings for **Camp** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_camp_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_carson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_carson`  (table)

- **Estimated rows:** 20,336
- **What it holds:** 2025 mineral-owner property holdings for **Carson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_carson_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |
| 15 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_cass"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_cass`  (table)

- **Estimated rows:** 8,952
- **What it holds:** 2025 mineral-owner property holdings for **Cass** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_cass_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `rrcnumber` | character varying |  |  |
| 8 | `ri` | character varying |  |  |
| 9 | `ritype` | character varying |  |  |
| 10 | `leasename` | character varying |  |  |
| 11 | `leasedata` | character varying |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `mineral_value` | character varying |  |  |
| 17 | `market_value` | character varying |  |  |
| 18 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_chambers"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_chambers`  (table)

- **Estimated rows:** 9,797
- **What it holds:** 2025 mineral-owner property holdings for **Chambers** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_chambers_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `market_value` | character varying |  |  |
| 8 | `taxable_value` | character varying |  |  |
| 9 | `ritype` | character varying |  |  |
| 10 | `leasename` | character varying |  |  |
| 11 | `leasedata` | character varying |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_childress"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_childress`  (table)

- **Estimated rows:** 187
- **What it holds:** 2025 mineral-owner property holdings for **Childress** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_childress_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_clay"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_clay`  (table)

- **Estimated rows:** 5,659
- **What it holds:** 2025 mineral-owner property holdings for **Clay** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_clay_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_cochran"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_cochran`  (table)

- **Estimated rows:** 16,558
- **What it holds:** 2025 mineral-owner property holdings for **Cochran** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_cochran_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_coke"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_coke`  (table)

- **Estimated rows:** 3,756
- **What it holds:** 2025 mineral-owner property holdings for **Coke** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_coke_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_coleman"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_coleman`  (table)

- **Estimated rows:** 8,840
- **What it holds:** 2025 mineral-owner property holdings for **Coleman** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_coleman_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |
| 15 | `appraised_value` | character varying |  |  |
| 16 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_collingsworth"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_collingsworth`  (table)

- **Estimated rows:** 5,260
- **What it holds:** 2025 mineral-owner property holdings for **Collingsworth** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_collingsworth_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_comanche"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_comanche`  (table)

- **Estimated rows:** 2,108
- **What it holds:** 2025 mineral-owner property holdings for **Comanche** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_comanche_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_cooke"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_cooke`  (table)

- **Estimated rows:** 35,016
- **What it holds:** 2025 mineral-owner property holdings for **Cooke** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_cooke_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `net_appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_cottle"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_cottle`  (table)

- **Estimated rows:** 745
- **What it holds:** 2025 mineral-owner property holdings for **Cottle** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_cottle_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_crane"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_crane`  (table)

- **Estimated rows:** 44,042
- **What it holds:** 2025 mineral-owner property holdings for **Crane** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_crane_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_crockett"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_crockett`  (table)

- **Estimated rows:** 22,431
- **What it holds:** 2025 mineral-owner property holdings for **Crockett** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_crockett_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_crosby"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_crosby`  (table)

- **Estimated rows:** 1,828
- **What it holds:** 2025 mineral-owner property holdings for **Crosby** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_crosby_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |
| 15 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_culberson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_culberson`  (table)

- **Estimated rows:** 9,289
- **What it holds:** 2025 mineral-owner property holdings for **Culberson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_culberson_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_dawson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_dawson`  (table)

- **Estimated rows:** 57,310
- **What it holds:** 2025 mineral-owner property holdings for **Dawson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_dawson_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_denton"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_denton`  (table)

- **Estimated rows:** 64,936
- **What it holds:** 2025 mineral-owner property holdings for **Denton** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_denton_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `net_appraised_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_dewitt"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_dewitt`  (table)

- **Estimated rows:** 66,565
- **What it holds:** 2025 mineral-owner property holdings for **Dewitt** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_dewitt_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_dickens"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_dickens`  (table)

- **Estimated rows:** 2,290
- **What it holds:** 2025 mineral-owner property holdings for **Dickens** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_dickens_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_donley"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_donley`  (table)

- **Estimated rows:** 743
- **What it holds:** 2025 mineral-owner property holdings for **Donley** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_donley_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_duval"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_duval`  (table)

- **Estimated rows:** 7,690
- **What it holds:** 2025 mineral-owner property holdings for **Duval** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_duval_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_eastland"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_eastland`  (table)

- **Estimated rows:** 7,120
- **What it holds:** 2025 mineral-owner property holdings for **Eastland** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_eastland_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_ector"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_ector`  (table)

- **Estimated rows:** 154,323
- **What it holds:** 2025 mineral-owner property holdings for **Ector** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_ector_id_seq'::regclass) |
| 2 | `lease_id` | character varying |  |  |
| 3 | `owner_id` | character varying |  |  |
| 4 | `interest_type_cd` | character varying |  |  |
| 5 | `current_interest` | character varying |  |  |
| 6 | `prior_year_interest` | character varying |  |  |
| 7 | `owner_value` | character varying |  |  |
| 8 | `lease_name` | character varying |  |  |
| 9 | `description` | character varying |  |  |
| 10 | `operator_name` | character varying |  |  |
| 11 | `short_description` | character varying |  |  |
| 12 | `county_pct_2025` | character varying |  |  |
| 13 | `county_value_2025` | character varying |  |  |
| 14 | `ecisd_pct_2025` | character varying |  |  |
| 15 | `ecisd_value_2025` | character varying |  |  |
| 16 | `hospital_pct_2025` | character varying |  |  |
| 17 | `hospital_value_2025` | character varying |  |  |
| 18 | `special_pct_2025` | character varying |  |  |
| 19 | `special_value_2025` | character varying |  |  |
| 20 | `college_pct_2025` | character varying |  |  |
| 21 | `college_value_2025` | character varying |  |  |
| 22 | `city_pct_2025` | character varying |  |  |
| 23 | `city_value_2025` | character varying |  |  |
| 24 | `esd1_pct_2025` | character varying |  |  |
| 25 | `esd1_value_2025` | character varying |  |  |
| 26 | `esd2_pct_2025` | character varying |  |  |
| 27 | `esd2_value_2025` | character varying |  |  |
| 28 | `county_pct_2024` | character varying |  |  |
| 29 | `county_value_2024` | character varying |  |  |
| 30 | `ecisd_pct_2024` | character varying |  |  |
| 31 | `ecisd_value_2024` | character varying |  |  |
| 32 | `hospital_pct_2024` | character varying |  |  |
| 33 | `hospital_value_2024` | character varying |  |  |
| 34 | `special_pct_2024` | character varying |  |  |
| 35 | `special_value_2024` | character varying |  |  |
| 36 | `college_pct_2024` | character varying |  |  |
| 37 | `college_value_2024` | character varying |  |  |
| 38 | `city_pct_2024` | character varying |  |  |
| 39 | `city_value_2024` | character varying |  |  |
| 40 | `county_cap_loss_2025` | character varying |  |  |
| 41 | `ecisd_cap_loss_2025` | character varying |  |  |
| 42 | `hospital_cap_loss_2025` | character varying |  |  |
| 43 | `special_cap_loss_2025` | character varying |  |  |
| 44 | `college_cap_loss_2025` | character varying |  |  |
| 45 | `city_cap_loss_2025` | character varying |  |  |
| 46 | `esd1_cap_loss_2025` | character varying |  |  |
| 47 | `esd2_cap_loss_2025` | character varying |  |  |
| 48 | `new_impr_county_value_2025` | character varying |  |  |
| 49 | `new_impr_ecisd_value_2025` | character varying |  |  |
| 50 | `new_impr_hospital_value_2025` | character varying |  |  |
| 51 | `new_impr_special_value_2025` | character varying |  |  |
| 52 | `new_impr_college_value_2025` | character varying |  |  |
| 53 | `new_impr_city_value_2025` | character varying |  |  |
| 54 | `new_impr_esd1_value_2025` | character varying |  |  |
| 55 | `new_impr_esd2_value_2025` | character varying |  |  |
| 56 | `county_capped_value_2025` | character varying |  |  |
| 57 | `ecisd_capped_value_2025` | character varying |  |  |
| 58 | `hospital_capped_value_2025` | character varying |  |  |
| 59 | `special_capped_value_2025` | character varying |  |  |
| 60 | `college_capped_value_2025` | character varying |  |  |
| 61 | `city_capped_value_2025` | character varying |  |  |
| 62 | `esd1_capped_value_2025` | character varying |  |  |
| 63 | `esd2_capped_value_2025` | character varying |  |  |
| 64 | `lease_number` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_edwards"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_edwards`  (table)

- **Estimated rows:** 1,207
- **What it holds:** 2025 mineral-owner property holdings for **Edwards** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_edwards_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_ellis"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_ellis`  (table)

- **Estimated rows:** 1,805
- **What it holds:** 2025 mineral-owner property holdings for **Ellis** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_ellis_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `net_appraised_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_fayette"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_fayette`  (table)

- **Estimated rows:** 19,217
- **What it holds:** 2025 mineral-owner property holdings for **Fayette** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_fayette_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `mineral_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_fisher"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_fisher`  (table)

- **Estimated rows:** 12,004
- **What it holds:** 2025 mineral-owner property holdings for **Fisher** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_fisher_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_foard"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_foard`  (table)

- **Estimated rows:** 961
- **What it holds:** 2025 mineral-owner property holdings for **Foard** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_foard_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_fort_bend"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_fort_bend`  (table)

- **Estimated rows:** 14,839
- **What it holds:** 2025 mineral-owner property holdings for **Fort Bend** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_fort_bend_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_franklin"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_franklin`  (table)

- **Estimated rows:** 7,339
- **What it holds:** 2025 mineral-owner property holdings for **Franklin** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_franklin_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_freestone"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_freestone`  (table)

- **Estimated rows:** 130,471
- **What it holds:** 2025 mineral-owner property holdings for **Freestone** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_freestone_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_frio"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_frio`  (table)

- **Estimated rows:** 12,065
- **What it holds:** 2025 mineral-owner property holdings for **Frio** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_frio_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_gaines"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_gaines`  (table)

- **Estimated rows:** 79,199
- **What it holds:** 2025 mineral-owner property holdings for **Gaines** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_gaines_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `mineral_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_galveston"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_galveston`  (table)

- **Estimated rows:** 2,258
- **What it holds:** 2025 mineral-owner property holdings for **Galveston** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_galveston_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_garza"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_garza`  (table)

- **Estimated rows:** 6,189
- **What it holds:** 2025 mineral-owner property holdings for **Garza** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_garza_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_goliad"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_goliad`  (table)

- **Estimated rows:** 3,978
- **What it holds:** 2025 mineral-owner property holdings for **Goliad** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_goliad_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `rrcnumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `lease_number` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_gonzales"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_gonzales`  (table)

- **Estimated rows:** 73,626
- **What it holds:** 2025 mineral-owner property holdings for **Gonzales** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_gonzales_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_grayson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_grayson`  (table)

- **Estimated rows:** 16,780
- **What it holds:** 2025 mineral-owner property holdings for **Grayson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_grayson_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_gregg"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_gregg`  (table)

- **Estimated rows:** 139,934
- **What it holds:** 2025 mineral-owner property holdings for **Gregg** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_gregg_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_grimes"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_grimes`  (table)

- **Estimated rows:** 7,194
- **What it holds:** 2025 mineral-owner property holdings for **Grimes** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_grimes_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `leaseacres` | character varying |  |  |
| 13 | `mineral_value` | character varying |  |  |
| 14 | `assessed_value` | character varying |  |  |
| 15 | `taxable_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_guadalupe"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_guadalupe`  (table)

- **Estimated rows:** 2,831
- **What it holds:** 2025 mineral-owner property holdings for **Guadalupe** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_guadalupe_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hale"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hale`  (table)

- **Estimated rows:** 3,891
- **What it holds:** 2025 mineral-owner property holdings for **Hale** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_hale_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hall"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hall`  (table)

- **Estimated rows:** 550
- **What it holds:** 2025 mineral-owner property holdings for **Hall** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_hall_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hamilton"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hamilton`  (table)

- **Estimated rows:** 243
- **What it holds:** 2025 mineral-owner property holdings for **Hamilton** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_hamilton_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hansford"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hansford`  (table)

- **Estimated rows:** 15,876
- **What it holds:** 2025 mineral-owner property holdings for **Hansford** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_hansford_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hardeman"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hardeman`  (table)

- **Estimated rows:** 3,457
- **What it holds:** 2025 mineral-owner property holdings for **Hardeman** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_hardeman_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hardin"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hardin`  (table)

- **Estimated rows:** 6,878
- **What it holds:** 2025 mineral-owner property holdings for **Hardin** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_hardin_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `operator_name` | character varying |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `mineral_value` | character varying |  |  |
| 17 | `market_value` | character varying |  |  |
| 18 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_haskell"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_haskell`  (table)

- **Estimated rows:** 3,825
- **What it holds:** 2025 mineral-owner property holdings for **Haskell** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_haskell_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hemphill"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hemphill`  (table)

- **Estimated rows:** 49,189
- **What it holds:** 2025 mineral-owner property holdings for **Hemphill** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_hemphill_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hill"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hill`  (table)

- **Estimated rows:** 4,931
- **What it holds:** 2025 mineral-owner property holdings for **Hill** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_hill_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hockley"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hockley`  (table)

- **Estimated rows:** 26,625
- **What it holds:** 2025 mineral-owner property holdings for **Hockley** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_hockley_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_houston"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_houston`  (table)

- **Estimated rows:** 7,305
- **What it holds:** 2025 mineral-owner property holdings for **Houston** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_houston_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_howard"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_howard`  (table)

- **Estimated rows:** 215,593
- **What it holds:** 2025 mineral-owner property holdings for **Howard** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_howard_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `operator_name` | character varying |  |  |
| 11 | `field_name` | character varying |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_howard_1"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_howard_1`  (table)

- **Estimated rows:** 215,592
- **What it holds:** 2025 mineral-owner property holdings for **Howard (secondary copy)** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_howard_1_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `operator_name` | character varying |  |  |
| 11 | `field_name` | character varying |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_hutchinson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_hutchinson`  (table)

- **Estimated rows:** 17,286
- **What it holds:** 2025 mineral-owner property holdings for **Hutchinson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_hutchinson_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_irion"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_irion`  (table)

- **Estimated rows:** 11,580
- **What it holds:** 2025 mineral-owner property holdings for **Irion** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_irion_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |
| 15 | `appraised_value` | character varying |  |  |
| 16 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jack"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_jack`  (table)

- **Estimated rows:** 12,654
- **What it holds:** 2025 mineral-owner property holdings for **Jack** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_jack_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jasper"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_jasper`  (table)

- **Estimated rows:** 6,728
- **What it holds:** 2025 mineral-owner property holdings for **Jasper** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_jasper_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jefferson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_jefferson`  (table)

- **Estimated rows:** 9,259
- **What it holds:** 2025 mineral-owner property holdings for **Jefferson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_jefferson_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jimhogg"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_jimhogg`  (table)

- **Estimated rows:** 1,486
- **What it holds:** 2025 mineral-owner property holdings for **Jimhogg** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_jimhogg_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_jones"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_jones`  (table)

- **Estimated rows:** 8,090
- **What it holds:** 2025 mineral-owner property holdings for **Jones** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_jones_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_karnes"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_karnes`  (table)

- **Estimated rows:** 161,894
- **What it holds:** 2025 mineral-owner property holdings for **Karnes** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_karnes_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_kenedy"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_kenedy`  (table)

- **Estimated rows:** 9,183
- **What it holds:** 2025 mineral-owner property holdings for **Kenedy** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_kenedy_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_kent"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_kent`  (table)

- **Estimated rows:** 7,273
- **What it holds:** 2025 mineral-owner property holdings for **Kent** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_kent_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_kimble"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_kimble`  (table)

- **Estimated rows:** 201
- **What it holds:** 2025 mineral-owner property holdings for **Kimble** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_kimble_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `lease_number` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |
| 18 | `leasenumber` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_king"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_king`  (table)

- **Estimated rows:** 1,581
- **What it holds:** 2025 mineral-owner property holdings for **King** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_king_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_kleberg"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_kleberg`  (table)

- **Estimated rows:** 4,720
- **What it holds:** 2025 mineral-owner property holdings for **Kleberg** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_kleberg_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `rrcnumber` | character varying |  |  |
| 8 | `ri` | character varying |  |  |
| 9 | `ritype` | character varying |  |  |
| 10 | `leasename` | character varying |  |  |
| 11 | `leasedata` | character varying |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `mineral_value` | character varying |  |  |
| 17 | `market_value` | character varying |  |  |
| 18 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_lamb"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_lamb`  (table)

- **Estimated rows:** 1,404
- **What it holds:** 2025 mineral-owner property holdings for **Lamb** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_lamb_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `rrcnumber` | character varying |  |  |
| 8 | `ri` | character varying |  |  |
| 9 | `ritype` | character varying |  |  |
| 10 | `leasename` | character varying |  |  |
| 11 | `leasedata` | character varying |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `mineral_value` | character varying |  |  |
| 17 | `market_value` | character varying |  |  |
| 18 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_lavaca"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_lavaca`  (table)

- **Estimated rows:** 56,220
- **What it holds:** 2025 mineral-owner property holdings for **Lavaca** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_lavaca_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_leon"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_leon`  (table)

- **Estimated rows:** 26,435
- **What it holds:** 2025 mineral-owner property holdings for **Leon** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_leon_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_liberty"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_liberty`  (table)

- **Estimated rows:** 17,864
- **What it holds:** 2025 mineral-owner property holdings for **Liberty** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_liberty_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_liveoak"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_liveoak`  (table)

- **Estimated rows:** 33,728
- **What it holds:** 2025 mineral-owner property holdings for **Liveoak** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_liveoak_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |
| 15 | `appraised_value` | character varying |  |  |
| 16 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_loving"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_loving`  (table)

- **Estimated rows:** 102,406
- **What it holds:** 2025 mineral-owner property holdings for **Loving** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_loving_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_lynn"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_lynn`  (table)

- **Estimated rows:** 1,583
- **What it holds:** 2025 mineral-owner property holdings for **Lynn** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_lynn_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_marion"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_marion`  (table)

- **Estimated rows:** 5,295
- **What it holds:** 2025 mineral-owner property holdings for **Marion** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_marion_id_seq'::regclass) |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `ritype` | character varying |  |  |
| 7 | `leasename` | character varying |  |  |
| 8 | `leasedata` | character varying |  |  |
| 9 | `ownernumber` | character varying |  |  |
| 10 | `mineralaccountnumber` | character varying |  |  |
| 11 | `mineralaccountsequence` | character varying |  |  |
| 12 | `leaseacres` | character varying |  |  |
| 13 | `value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_martin"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_martin`  (table)

- **Estimated rows:** 195,912
- **What it holds:** 2025 mineral-owner property holdings for **Martin** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_martin_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_matagorda"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_matagorda`  (table)

- **Estimated rows:** 6,302
- **What it holds:** 2025 mineral-owner property holdings for **Matagorda** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_matagorda_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_mcculloch"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_mcculloch`  (table)

- **Estimated rows:** 403
- **What it holds:** 2025 mineral-owner property holdings for **Mcculloch** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_mcculloch_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_mclennan"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_mclennan`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner property holdings for **Mclennan** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_mclennan_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `net_appraised_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_menard"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_menard`  (table)

- **Estimated rows:** 338
- **What it holds:** 2025 mineral-owner property holdings for **Menard** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_menard_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_midland"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_midland`  (table)

- **Estimated rows:** 421,423
- **What it holds:** 2025 mineral-owner property holdings for **Midland** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_midland_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_milam"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_milam`  (table)

- **Estimated rows:** 14,780
- **What it holds:** 2025 mineral-owner property holdings for **Milam** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_milam_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_mitchell"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_mitchell`  (table)

- **Estimated rows:** 23,847
- **What it holds:** 2025 mineral-owner property holdings for **Mitchell** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_mitchell_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_morris"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_morris`  (table)

- **Estimated rows:** 608
- **What it holds:** 2025 mineral-owner property holdings for **Morris** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_morris_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_nacogodoches"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_nacogodoches`  (table)

- **Estimated rows:** 40,716
- **What it holds:** 2025 mineral-owner property holdings for **Nacogodoches** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_nacogodoches_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_navarro"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_navarro`  (table)

- **Estimated rows:** 2,161
- **What it holds:** 2025 mineral-owner property holdings for **Navarro** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_navarro_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_newton"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_newton`  (table)

- **Estimated rows:** 3,671
- **What it holds:** 2025 mineral-owner property holdings for **Newton** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_newton_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_nolan"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_nolan`  (table)

- **Estimated rows:** 7,184
- **What it holds:** 2025 mineral-owner property holdings for **Nolan** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_nolan_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_nueces"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_nueces`  (table)

- **Estimated rows:** 35,361
- **What it holds:** 2025 mineral-owner property holdings for **Nueces** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_nueces_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_ochiltree"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_ochiltree`  (table)

- **Estimated rows:** 25,403
- **What it holds:** 2025 mineral-owner property holdings for **Ochiltree** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_ochiltree_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_orange"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_orange`  (table)

- **Estimated rows:** 5,300
- **What it holds:** 2025 mineral-owner property holdings for **Orange** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_orange_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_panola"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_panola`  (table)

- **Estimated rows:** 377,255
- **What it holds:** 2025 mineral-owner property holdings for **Panola** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_panola_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_polk"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_polk`  (table)

- **Estimated rows:** 30,013
- **What it holds:** 2025 mineral-owner property holdings for **Polk** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_polk_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `taxable_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_rains"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_rains`  (table)

- **Estimated rows:** n/a
- **What it holds:** 2025 mineral-owner property holdings for **Rains** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_rains_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_reagan"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_reagan`  (table)

- **Estimated rows:** 108,555
- **What it holds:** 2025 mineral-owner property holdings for **Reagan** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_reagan_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_red_river"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_red_river`  (table)

- **Estimated rows:** 576
- **What it holds:** 2025 mineral-owner property holdings for **Red River** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_red_river_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `accountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `mineral_value` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_reeves"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_reeves`  (table)

- **Estimated rows:** 187,214
- **What it holds:** 2025 mineral-owner property holdings for **Reeves** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_reeves_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_refugio"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_refugio`  (table)

- **Estimated rows:** 5,237
- **What it holds:** 2025 mineral-owner property holdings for **Refugio** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_refugio_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_robertson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_robertson`  (table)

- **Estimated rows:** 10,000
- **What it holds:** 2025 mineral-owner property holdings for **Robertson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `property_id` | character varying |  |  |
| 17 | `mineral_value` | character varying |  |  |
| 18 | `market_value` | character varying |  |  |
| 19 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_rusk"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_rusk`  (table)

- **Estimated rows:** 143,053
- **What it holds:** 2025 mineral-owner property holdings for **Rusk** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_rusk_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_san_augustine"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_san_augustine`  (table)

- **Estimated rows:** 39,546
- **What it holds:** 2025 mineral-owner property holdings for **San Augustine** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_san_augustine_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_san_jacinto"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_san_jacinto`  (table)

- **Estimated rows:** 6,247
- **What it holds:** 2025 mineral-owner property holdings for **San Jacinto** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_san_jacinto_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_san_patricio"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_san_patricio`  (table)

- **Estimated rows:** 1,598
- **What it holds:** 2025 mineral-owner property holdings for **San Patricio** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_san_patricio_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `rrcnumber` | character varying |  |  |
| 8 | `ri` | character varying |  |  |
| 9 | `ritype` | character varying |  |  |
| 10 | `leasename` | character varying |  |  |
| 11 | `leasedata` | character varying |  |  |
| 12 | `ownernumber` | character varying |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `mineral_value` | character varying |  |  |
| 17 | `market_value` | character varying |  |  |
| 18 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_scurry"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_scurry`  (table)

- **Estimated rows:** 54,925
- **What it holds:** 2025 mineral-owner property holdings for **Scurry** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_scurry_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_shackelford"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_shackelford`  (table)

- **Estimated rows:** 10,194
- **What it holds:** 2025 mineral-owner property holdings for **Shackelford** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_shackelford_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_shelby"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_shelby`  (table)

- **Estimated rows:** 35,323
- **What it holds:** 2025 mineral-owner property holdings for **Shelby** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_shelby_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_shelby_1"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_shelby_1`  (table)

- **Estimated rows:** 38,424
- **What it holds:** 2025 mineral-owner property holdings for **Shelby (secondary copy)** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_shelby_1_id_seq'::regclass) |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `ritype` | character varying |  |  |
| 7 | `leasename` | character varying |  |  |
| 8 | `leasedata` | character varying |  |  |
| 9 | `ownernumber` | character varying |  |  |
| 10 | `mineralaccountnumber` | character varying |  |  |
| 11 | `mineralaccountsequence` | character varying |  |  |
| 12 | `leaseacres` | character varying |  |  |
| 13 | `jur_1_taxable_value` | character varying |  |  |
| 14 | `jur_2_taxable_value` | character varying |  |  |
| 15 | `jur_3_taxable_value` | character varying |  |  |
| 16 | `jur_4_taxable_value` | character varying |  |  |
| 17 | `jur_5_taxable_value` | character varying |  |  |
| 18 | `jur_6_taxable_value` | character varying |  |  |
| 19 | `jur_7_taxable_value` | character varying |  |  |
| 20 | `jur_8_taxable_value` | character varying |  |  |
| 21 | `jur_9_taxable_value` | character varying |  |  |
| 22 | `jur_10_taxable_value` | character varying |  |  |
| 23 | `jur_11_taxable_value` | character varying |  |  |
| 24 | `jur_12_taxable_value` | character varying |  |  |
| 25 | `jur_1_market_value` | character varying |  |  |
| 26 | `jur_2_market_value` | character varying |  |  |
| 27 | `jur_3_market_value` | character varying |  |  |
| 28 | `jur_4_market_value` | character varying |  |  |
| 29 | `jur_5_market_value` | character varying |  |  |
| 30 | `jur_6_market_value` | character varying |  |  |
| 31 | `jur_7_market_value` | character varying |  |  |
| 32 | `jur_8_market_value` | character varying |  |  |
| 33 | `jur_9_market_value` | character varying |  |  |
| 34 | `jur_10_market_value` | character varying |  |  |
| 35 | `jur_11_market_value` | character varying |  |  |
| 36 | `jur_12_market_value` | character varying |  |  |
| 37 | `taxable_value_new_jur_1` | character varying |  |  |
| 38 | `taxable_value_new_jur_2` | character varying |  |  |
| 39 | `taxable_value_new_jur_3` | character varying |  |  |
| 40 | `taxable_value_new_jur_4` | character varying |  |  |
| 41 | `taxable_value_new_jur_5` | character varying |  |  |
| 42 | `taxable_value_new_jur_6` | character varying |  |  |
| 43 | `taxable_value_new_jur_7` | character varying |  |  |
| 44 | `taxable_value_new_jur_8` | character varying |  |  |
| 45 | `taxable_value_new_jur_9` | character varying |  |  |
| 46 | `taxable_value_new_jur_10` | character varying |  |  |
| 47 | `taxable_value_new_jur_11` | character varying |  |  |
| 48 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_sherman"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_sherman`  (table)

- **Estimated rows:** 12,264
- **What it holds:** 2025 mineral-owner property holdings for **Sherman** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_sherman_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_starr"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_starr`  (table)

- **Estimated rows:** 16,356
- **What it holds:** 2025 mineral-owner property holdings for **Starr** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `property_id` | character varying |  |  |
| 17 | `mineral_value` | character varying |  |  |
| 18 | `market_value` | character varying |  |  |
| 19 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_sterling"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_sterling`  (table)

- **Estimated rows:** 7,018
- **What it holds:** 2025 mineral-owner property holdings for **Sterling** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_sterling_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_stonewall"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_stonewall`  (table)

- **Estimated rows:** 6,759
- **What it holds:** 2025 mineral-owner property holdings for **Stonewall** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_stonewall_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_taylor"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_taylor`  (table)

- **Estimated rows:** 5,598
- **What it holds:** 2025 mineral-owner property holdings for **Taylor** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_taylor_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_terrell"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_terrell`  (table)

- **Estimated rows:** 10,679
- **What it holds:** 2025 mineral-owner property holdings for **Terrell** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_terrell_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_terry"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_terry`  (table)

- **Estimated rows:** 10,000
- **What it holds:** 2025 mineral-owner property holdings for **Terry** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_terry_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_titus"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_titus`  (table)

- **Estimated rows:** 5,632
- **Primary key:** `id`
- **What it holds:** 2025 mineral-owner property holdings for **Titus** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `propertydescription` | character varying |  |  |
| 2 | `districtcode` | character varying |  |  |
| 3 | `leasenumber` | character varying |  |  |
| 4 | `ri` | character varying |  |  |
| 5 | `ritype` | character varying |  |  |
| 6 | `leasename` | character varying |  |  |
| 7 | `leasedata` | character varying |  |  |
| 8 | `ownernumber` | character varying |  |  |
| 9 | `property_id` | character varying |  |  |
| 10 | `mineral_value` | character varying |  |  |
| 11 | `market_value` | character varying |  |  |
| 12 | `assessed_value` | character varying |  |  |
| 13 | `acres` | character varying |  |  |
| 14 | `id` 🔑 | integer | ✔ |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_trinity"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_trinity`  (table)

- **Estimated rows:** 457
- **What it holds:** 2025 mineral-owner property holdings for **Trinity** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_trinity_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_tyler"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_tyler`  (table)

- **Estimated rows:** 15,348
- **What it holds:** 2025 mineral-owner property holdings for **Tyler** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_tyler_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_upton"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_upton`  (table)

- **Estimated rows:** 264,605
- **What it holds:** 2025 mineral-owner property holdings for **Upton** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_upton_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_val_verde"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_val_verde`  (table)

- **Estimated rows:** 5,818
- **What it holds:** 2025 mineral-owner property holdings for **Val Verde** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_val_verde_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_victoria"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_victoria`  (table)

- **Estimated rows:** 5,387
- **What it holds:** 2025 mineral-owner property holdings for **Victoria** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_victoria_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_victoria_1"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_victoria_1`  (table)

- **Estimated rows:** 5,756
- **What it holds:** 2025 mineral-owner property holdings for **Victoria (secondary copy)** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_victoria_1_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_walker"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_walker`  (table)

- **Estimated rows:** 1,916
- **What it holds:** 2025 mineral-owner property holdings for **Walker** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_walker_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_ward"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_ward`  (table)

- **Estimated rows:** 70,345
- **What it holds:** 2025 mineral-owner property holdings for **Ward** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_ward_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_washington"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_washington`  (table)

- **Estimated rows:** 19,201
- **What it holds:** 2025 mineral-owner property holdings for **Washington** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_washington_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_webb"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_webb`  (table)

- **Estimated rows:** 48,919
- **What it holds:** 2025 mineral-owner property holdings for **Webb** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_webb_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `market_value` | character varying |  |  |
| 16 | `appraised_value` | character varying |  |  |
| 17 | `net_appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wheeler"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_wheeler`  (table)

- **Estimated rows:** 63,635
- **What it holds:** 2025 mineral-owner property holdings for **Wheeler** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `market_value` | character varying |  |  |
| 7 | `taxable_value` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineral_owner_2025.mineralownerproperty_2025_wheeler_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `jur_1_taxable_value` | character varying |  |  |
| 17 | `jur_2_taxable_value` | character varying |  |  |
| 18 | `jur_3_taxable_value` | character varying |  |  |
| 19 | `jur_4_taxable_value` | character varying |  |  |
| 20 | `jur_5_taxable_value` | character varying |  |  |
| 21 | `jur_6_taxable_value` | character varying |  |  |
| 22 | `jur_7_taxable_value` | character varying |  |  |
| 23 | `jur_8_taxable_value` | character varying |  |  |
| 24 | `jur_9_taxable_value` | character varying |  |  |
| 25 | `jur_10_taxable_value` | character varying |  |  |
| 26 | `jur_11_taxable_value` | character varying |  |  |
| 27 | `jur_12_taxable_value` | character varying |  |  |
| 28 | `jur_1_market_value` | character varying |  |  |
| 29 | `jur_2_market_value` | character varying |  |  |
| 30 | `jur_3_market_value` | character varying |  |  |
| 31 | `jur_4_market_value` | character varying |  |  |
| 32 | `jur_5_market_value` | character varying |  |  |
| 33 | `jur_6_market_value` | character varying |  |  |
| 34 | `jur_7_market_value` | character varying |  |  |
| 35 | `jur_8_market_value` | character varying |  |  |
| 36 | `jur_9_market_value` | character varying |  |  |
| 37 | `jur_10_market_value` | character varying |  |  |
| 38 | `jur_11_market_value` | character varying |  |  |
| 39 | `jur_12_market_value` | character varying |  |  |
| 40 | `taxable_value_new_jur_1` | character varying |  |  |
| 41 | `taxable_value_new_jur_2` | character varying |  |  |
| 42 | `taxable_value_new_jur_3` | character varying |  |  |
| 43 | `taxable_value_new_jur_4` | character varying |  |  |
| 44 | `taxable_value_new_jur_5` | character varying |  |  |
| 45 | `taxable_value_new_jur_6` | character varying |  |  |
| 46 | `taxable_value_new_jur_7` | character varying |  |  |
| 47 | `taxable_value_new_jur_8` | character varying |  |  |
| 48 | `taxable_value_new_jur_9` | character varying |  |  |
| 49 | `taxable_value_new_jur_10` | character varying |  |  |
| 50 | `taxable_value_new_jur_11` | character varying |  |  |
| 51 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wichita"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_wichita`  (table)

- **Estimated rows:** 13,462
- **What it holds:** 2025 mineral-owner property holdings for **Wichita** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `property_id` | character varying |  |  |
| 17 | `mineral_value` | character varying |  |  |
| 18 | `market_value` | character varying |  |  |
| 19 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wilbarger"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_wilbarger`  (table)

- **Estimated rows:** 6,187
- **What it holds:** 2025 mineral-owner property holdings for **Wilbarger** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_wilbarger_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |
| 15 | `appraised_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_willacy"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_willacy`  (table)

- **Estimated rows:** 5,142
- **What it holds:** 2025 mineral-owner property holdings for **Willacy** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_willacy_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_williamson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_williamson`  (table)

- **Estimated rows:** 201
- **What it holds:** 2025 mineral-owner property holdings for **Williamson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_williamson_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `market_value` | character varying |  |  |
| 15 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wilson"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_wilson`  (table)

- **Estimated rows:** 19,845
- **What it holds:** 2025 mineral-owner property holdings for **Wilson** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_wilson_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_winkler"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_winkler`  (table)

- **Estimated rows:** 50,199
- **What it holds:** 2025 mineral-owner property holdings for **Winkler** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `property_id` | character varying |  |  |
| 17 | `mineral_value` | character varying |  |  |
| 18 | `market_value` | character varying |  |  |
| 19 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wise"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_wise`  (table)

- **Estimated rows:** 215,964
- **What it holds:** 2025 mineral-owner property holdings for **Wise** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_wise_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_wood"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_wood`  (table)

- **Estimated rows:** 39,747
- **What it holds:** 2025 mineral-owner property holdings for **Wood** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_wood_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `propertydescription` | character varying |  |  |
| 4 | `districtcode` | character varying |  |  |
| 5 | `leasenumber` | character varying |  |  |
| 6 | `ri` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `ownernumber` | character varying |  |  |
| 11 | `mineralaccountnumber` | character varying |  |  |
| 12 | `mineralaccountsequence` | character varying |  |  |
| 13 | `leaseacres` | character varying |  |  |
| 14 | `jur_1_taxable_value` | character varying |  |  |
| 15 | `jur_2_taxable_value` | character varying |  |  |
| 16 | `jur_3_taxable_value` | character varying |  |  |
| 17 | `jur_4_taxable_value` | character varying |  |  |
| 18 | `jur_5_taxable_value` | character varying |  |  |
| 19 | `jur_6_taxable_value` | character varying |  |  |
| 20 | `jur_7_taxable_value` | character varying |  |  |
| 21 | `jur_8_taxable_value` | character varying |  |  |
| 22 | `jur_9_taxable_value` | character varying |  |  |
| 23 | `jur_10_taxable_value` | character varying |  |  |
| 24 | `jur_11_taxable_value` | character varying |  |  |
| 25 | `jur_12_taxable_value` | character varying |  |  |
| 26 | `jur_1_market_value` | character varying |  |  |
| 27 | `jur_2_market_value` | character varying |  |  |
| 28 | `jur_3_market_value` | character varying |  |  |
| 29 | `jur_4_market_value` | character varying |  |  |
| 30 | `jur_5_market_value` | character varying |  |  |
| 31 | `jur_6_market_value` | character varying |  |  |
| 32 | `jur_7_market_value` | character varying |  |  |
| 33 | `jur_8_market_value` | character varying |  |  |
| 34 | `jur_9_market_value` | character varying |  |  |
| 35 | `jur_10_market_value` | character varying |  |  |
| 36 | `jur_11_market_value` | character varying |  |  |
| 37 | `jur_12_market_value` | character varying |  |  |
| 38 | `taxable_value_new_jur_1` | character varying |  |  |
| 39 | `taxable_value_new_jur_2` | character varying |  |  |
| 40 | `taxable_value_new_jur_3` | character varying |  |  |
| 41 | `taxable_value_new_jur_4` | character varying |  |  |
| 42 | `taxable_value_new_jur_5` | character varying |  |  |
| 43 | `taxable_value_new_jur_6` | character varying |  |  |
| 44 | `taxable_value_new_jur_7` | character varying |  |  |
| 45 | `taxable_value_new_jur_8` | character varying |  |  |
| 46 | `taxable_value_new_jur_9` | character varying |  |  |
| 47 | `taxable_value_new_jur_10` | character varying |  |  |
| 48 | `taxable_value_new_jur_11` | character varying |  |  |
| 49 | `taxable_value_new_jur_12` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_yoakum"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_yoakum`  (table)

- **Estimated rows:** 88,621
- **What it holds:** 2025 mineral-owner property holdings for **Yoakum** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_yoakum_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

<a id="mviewdownload-mineral_owner_2025-mineralownerproperty_2025_young"></a>
#### `mineral_owner_2025.mineralownerproperty_2025_young`  (table)

- **Estimated rows:** 12,065
- **What it holds:** 2025 mineral-owner property holdings for **Young** county (lease, decimal interest, valuation, property description).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  | nextval('mineral_owner_2025.mineralownerproperty_2025_young_id_seq'::regclass) |
| 2 | `mineralownerid` | integer |  |  |
| 3 | `property_id` | character varying |  |  |
| 4 | `propertydescription` | character varying |  |  |
| 5 | `districtcode` | character varying |  |  |
| 6 | `leasenumber` | character varying |  |  |
| 7 | `ri` | character varying |  |  |
| 8 | `ritype` | character varying |  |  |
| 9 | `leasename` | character varying |  |  |
| 10 | `leasedata` | character varying |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `mineralaccountnumber` | character varying |  |  |
| 13 | `mineralaccountsequence` | character varying |  |  |
| 14 | `leaseacres` | character varying |  |  |
| 15 | `mineral_value` | character varying |  |  |
| 16 | `market_value` | character varying |  |  |
| 17 | `assessed_value` | character varying |  |  |

### Schema: `public`  ·  60 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`attachment_type`](#mviewdownload-public-attachment_type) | table | n/a | 2 | Lookup of document attachment types. |
| [`completion_form_summary`](#mviewdownload-public-completion_form_summary) | table | 316,821 | 25 | Summarized well-completion (W-2) form data (25 cols) per well/tracking number. |
| [`content_data`](#mviewdownload-public-content_data) | table | n/a | 4 | Generic CMS/content storage (content, file name, layer name). |
| [`counties`](#mviewdownload-public-counties) | table | n/a | 2 | Simple county lookup (id/name). |
| [`county_cities`](#mviewdownload-public-county_cities) | table | n/a | 7 | Cities mapped to counties (7 cols). |
| [`countyplaytypes`](#mviewdownload-public-countyplaytypes) | table | n/a | 4 | Play types available per county. |
| [`countyspecific_mineralownerdata`](#mviewdownload-public-countyspecific_mineralownerdata) | table | n/a | 9 | County-specific mineral-owner data used for downloads (9 cols). |
| [`dailyleases`](#mviewdownload-public-dailyleases) | table | 12,951 | 29 | Daily new/updated lease records (29 cols) feeding notifications & activity. |
| [`dblink_config`](#mviewdownload-public-dblink_config) | table | n/a | 7 | Configuration for cross-database `dblink` connections (7 cols). |
| [`directional_survey`](#mviewdownload-public-directional_survey) | table | 68,979 | 8 | Directional well survey headers (API, survey metadata). |
| [`directional_survey_bothrecords`](#mviewdownload-public-directional_survey_bothrecords) | materialized view | 7,413,645 | 22 | Directional survey combined (PDF + digital) records (22 cols). |
| [`directional_survey_child`](#mviewdownload-public-directional_survey_child) | table | 7,379,488 | 11 | Directional survey station rows (per-depth MD/TVD/azimuth). |
| [`directional_survey_digitalrecords`](#mviewdownload-public-directional_survey_digitalrecords) | materialized view | n/a | 22 | Digitized directional survey records (22 cols). |
| [`directional_survey_exceptions`](#mviewdownload-public-directional_survey_exceptions) | table | 376,999 | 5 | Directional survey processing exceptions/errors. |
| [`directional_survey_pdfrecords`](#mviewdownload-public-directional_survey_pdfrecords) | materialized view | n/a | 22 | Directional survey records parsed from PDFs (22 cols). |
| [`field_report`](#mviewdownload-public-field_report) | table | 9,830 | 40 | Field-level report dataset (40 cols) — production/well stats per field. |
| [`field_rules`](#mviewdownload-public-field_rules) | table | 10,974 | 2 | Field rule lookup (field + rule). |
| [`gastestdata`](#mviewdownload-public-gastestdata) | table | 38,056 | 15 | Gas-well back-pressure/test data (15 cols). |
| [`marketupdates`](#mviewdownload-public-marketupdates) | table | 13 | 8 | Live market/commodity price updates (symbol, price, change, datetime). |
| [`master_county`](#mviewdownload-public-master_county) | table | n/a | 8 | Master county reference (8 cols). |
| [`master_fields`](#mviewdownload-public-master_fields) | table | 59,015 | 5 | Master oil & gas field reference (5 cols). |
| [`master_leases`](#mviewdownload-public-master_leases) | table | 455,923 | 7 | Master lease reference (7 cols). |
| [`master_operators`](#mviewdownload-public-master_operators) | table | 28,501 | 5 | Master operator reference (5 cols). |
| [`mineralowner_2023`](#mviewdownload-public-mineralowner_2023) | table | 2,871,465 | 8 | 2023 mineral-owner snapshot (owner number, name, address). |
| [`mineralowner_2024`](#mviewdownload-public-mineralowner_2024) | table | 1,220,150 | 8 | 2024 mineral-owner snapshot (owner number, name, address). |
| [`mineralownerproperty_2023`](#mviewdownload-public-mineralownerproperty_2023) | table | 2,728,092 | 15 | 2023 mineral-owner property/holdings (lease, interest, value). |
| [`mineralownerproperty_2024`](#mviewdownload-public-mineralownerproperty_2024) | table | 6,461,960 | 16 | 2024 mineral-owner property/holdings (lease, interest, value). |
| [`mineralownerproperty_terry_2023`](#mviewdownload-public-mineralownerproperty_terry_2023) | table | 9,672 | 15 | 2023 mineral-owner property holdings for Terry county. |
| [`mineralownerproperty_tyler_2023`](#mviewdownload-public-mineralownerproperty_tyler_2023) | table | 17,763 | 15 | 2023 mineral-owner property holdings for Tyler county. |
| [`mineralownersdetailsbbycountysitemap`](#mviewdownload-public-mineralownersdetailsbbycountysitemap) | table | 1,115,879 | 4 | Sitemap index of mineral-owner detail pages by county (SEO). |
| [`mo_texas`](#mviewdownload-public-mo_texas) | materialized view | 161 | 8 | Texas-wide mineral owners dataset (8 cols). |
| [`new_wellbore_master`](#mviewdownload-public-new_wellbore_master) | table | 1,070,341 | 29 | Master wellbore dataset (29 cols) — API, location, well attributes. |
| [`og_lease_cycle_disposition_dec_2025`](#mviewdownload-public-og_lease_cycle_disposition_dec_2025) | table | n/a | 52 | RRC oil & gas lease-cycle disposition data, Dec 2025 (52 cols). |
| [`og_lease_cycle_production_dec_2025`](#mviewdownload-public-og_lease_cycle_production_dec_2025) | table | 5 | 32 | RRC oil & gas lease-cycle production data, Dec 2025 (32 cols). |
| [`oil_gas_history_future`](#mviewdownload-public-oil_gas_history_future) | table | 565 | 14 | Combined oil & gas historical + forecast series (14 cols). |
| [`oil_gas_production_well_data`](#mviewdownload-public-oil_gas_production_well_data) | table | n/a | 5 | Per-well oil & gas production data (5 cols). |
| [`oilgasfuturepricingdata`](#mviewdownload-public-oilgasfuturepricingdata) | table | 201,283 | 14 | Oil & gas future/forecast pricing dataset (14 cols). |
| [`oilgashistorydata`](#mviewdownload-public-oilgashistorydata) | table | 11,134 | 14 | Oil & gas historical pricing/production dataset (14 cols). |
| [`oilgaspricing`](#mviewdownload-public-oilgaspricing) | table | 323 | 14 | Oil & gas pricing dataset (14 cols). |
| [`playtypes`](#mviewdownload-public-playtypes) | table | n/a | 3 | Play type lookup. |
| [`purchase_county_years`](#mviewdownload-public-purchase_county_years) | table | n/a | 4 | Available county-year combinations offered for data purchase. |
| [`reservoir_playtypes`](#mviewdownload-public-reservoir_playtypes) | table | 2,183 | 4 | Reservoir play-type lookup. |
| [`schema_mappings`](#mviewdownload-public-schema_mappings) | table | n/a | 14 | Configuration mapping logical schemas/tables (14 cols) — used to route per-county data. |
| [`texas_mineralowner_summary`](#mviewdownload-public-texas_mineralowner_summary) | view | n/a | 5 | Summary rollup of Texas mineral owners (5 cols). |
| [`w1fields`](#mviewdownload-public-w1fields) | table | 1,423,578 | 16 | W-1 permit field entries (field number/name and attributes per permit). |
| [`w1permit_latitude`](#mviewdownload-public-w1permit_latitude) | table | 839,009 | 5 | W-1 permit latitude/longitude coordinates (5 cols). |
| [`w1permits`](#mviewdownload-public-w1permits) | table | 840,506 | 28 | W-1 drilling permits master (28 cols) — API, operator, dates, location, status. |
| [`w1wells`](#mviewdownload-public-w1wells) | table | 864,090 | 34 | W-1 permitted wells (34 cols) — well-level permit detail. |
| [`w2_completion_informations`](#mviewdownload-public-w2_completion_informations) | table | 312,354 | 38 | W-2 completion information (38 cols) — completion details per well. |
| [`w2_completionattachment`](#mviewdownload-public-w2_completionattachment) | table | 2,682,827 | 6 | W-2 completion document attachments. |
| [`w2_completions`](#mviewdownload-public-w2_completions) | table | 286,780 | 18 | W-2 completion form master records (18 cols). |
| [`w2_completionwells`](#mviewdownload-public-w2_completionwells) | table | 312,625 | 22 | Wells linked to W-2 completions (22 cols). |
| [`w2_fillinginformations`](#mviewdownload-public-w2_fillinginformations) | table | 312,395 | 6 | W-2 filing metadata (6 cols). |
| [`w2_formationrecordchild`](#mviewdownload-public-w2_formationrecordchild) | table | 311,598 | 5 | W-2 formation record child rows. |
| [`w2_formationrecords`](#mviewdownload-public-w2_formationrecords) | table | 2,572,458 | 8 | W-2 formation records (formation tops per well). |
| [`w2_initialpotential_testdata`](#mviewdownload-public-w2_initialpotential_testdata) | table | 312,353 | 18 | W-2 initial potential (IP) test data (18 cols). |
| [`w2_intervals`](#mviewdownload-public-w2_intervals) | table | 441,746 | 5 | W-2 completion interval records. |
| [`w2_permittypes`](#mviewdownload-public-w2_permittypes) | table | 1,560,430 | 5 | W-2 permit type lookup. |
| [`well_count`](#mviewdownload-public-well_count) | table | n/a | 11 | Aggregated well counts (11 cols) — e.g. by county/operator. |
| [`well_count_new`](#mviewdownload-public-well_count_new) | table | 277 | 8 | Newer aggregated well counts (8 cols). |

<a id="mviewdownload-public-attachment_type"></a>
#### `public.attachment_type`  (table)

- **Estimated rows:** n/a
- **What it holds:** Lookup of document attachment types.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('attachment_name_id_seq'::regclass) |
| 2 | `filename` | character varying |  |  |

<a id="mviewdownload-public-completion_form_summary"></a>
#### `public.completion_form_summary`  (table)

- **Estimated rows:** 316,821
- **What it holds:** Summarized well-completion (W-2) form data (25 cols) per well/tracking number.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `tracking_no` | bigint |  |  |
| 2 | `district_code` | text |  |  |
| 3 | `lease_number` | text |  |  |
| 4 | `wellnumber` | text |  |  |
| 5 | `field_number` | text |  |  |
| 6 | `county` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `operator_number` | text |  |  |
| 9 | `status` | text |  |  |
| 10 | `lease_name` | text |  |  |
| 11 | `filing_purpose` | text |  |  |
| 12 | `filing_type` | text |  |  |
| 13 | `filing_welltype` | text |  |  |
| 14 | `recompletiondate` | date |  |  |
| 15 | `permit_number` | text |  |  |
| 16 | `submit_date` | text |  |  |
| 17 | `wellboreprofile` | text |  |  |
| 18 | `HWB_completion` | text |  |  |
| 19 | `Parent_permit` | text |  |  |
| 20 | `D_severance` | text |  |  |
| 21 | `operator_name` | text |  |  |
| 22 | `field_name` | text |  |  |
| 23 | `api10` | text |  |  |
| 24 | `Lease_id` | text |  |  |
| 25 | `updated_date` | text |  |  |

<a id="mviewdownload-public-content_data"></a>
#### `public.content_data`  (table)

- **Estimated rows:** n/a
- **What it holds:** Generic CMS/content storage (content, file name, layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('content_data_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `well_content` | character varying |  |  |
| 4 | `mineral_content` | character varying |  |  |

<a id="mviewdownload-public-counties"></a>
#### `public.counties`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Simple county lookup (id/name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('counties_id_seq'::regclass) |
| 2 | `county_name` | character varying(255) |  |  |

<a id="mviewdownload-public-county_cities"></a>
#### `public.county_cities`  (table)

- **Estimated rows:** n/a
- **What it holds:** Cities mapped to counties (7 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('county_cities_id_seq'::regclass) |
| 2 | `state_name` | character varying |  |  |
| 3 | `state_code` | numeric |  |  |
| 4 | `city_code` | numeric |  |  |
| 5 | `city_name` | character varying |  |  |
| 6 | `county_code` | numeric |  |  |
| 7 | `county_name` | character varying |  |  |

<a id="mviewdownload-public-countyplaytypes"></a>
#### `public.countyplaytypes`  (table)

- **Estimated rows:** n/a
- **What it holds:** Play types available per county.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('countyplaytypes_id_seq'::regclass) |
| 2 | `playtype_name` | character varying |  |  |
| 3 | `county` | character varying |  |  |
| 4 | `code` | character varying |  |  |

<a id="mviewdownload-public-countyspecific_mineralownerdata"></a>
#### `public.countyspecific_mineralownerdata`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** County-specific mineral-owner data used for downloads (9 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('countyspecific_mineralownerdata_id_seq'::regclass) |
| 2 | `statecode` | integer |  |  |
| 3 | `statename` | character varying |  |  |
| 4 | `county` | character varying |  |  |
| 5 | `totalmineralowner` | character varying |  |  |
| 6 | `totalvalue` | numeric |  |  |
| 7 | `interest` | numeric |  |  |
| 8 | `property` | numeric |  |  |
| 9 | `mineralowneryear` | integer |  |  |

<a id="mviewdownload-public-dailyleases"></a>
#### `public.dailyleases`  (table)

- **Estimated rows:** 12,951
- **Primary key:** `id`
- **What it holds:** Daily new/updated lease records (29 cols) feeding notifications & activity.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('dailyleases_id_seq'::regclass) |
| 2 | `operator` | character varying(50) |  |  |
| 3 | `location` | character varying(50) |  |  |
| 4 | `acres` | bigint |  |  |
| 5 | `latest_activity` | timestamp without time zone |  |  |
| 6 | `play_type` | character varying(20) |  |  |
| 7 | `lease_status` | character varying(20) |  |  |
| 8 | `field_name` | character varying |  |  |
| 9 | `lease_wells` | integer |  |  |
| 10 | `first_activity_date` | timestamp without time zone |  |  |
| 11 | `original_operator` | character varying(50) |  |  |
| 12 | `district_code` | character varying |  |  |
| 13 | `lease_number` | character varying |  |  |
| 14 | `lease_name` | character varying(50) |  |  |
| 15 | `state` | character varying(50) |  |  |
| 16 | `latitude` | character varying(50) |  |  |
| 17 | `longitude` | character varying(50) |  |  |
| 18 | `county_no` | character varying(10) |  |  |
| 19 | `active_lease_wells` | integer |  | 0 |
| 20 | `field_number` | character varying |  |  |
| 21 | `forecast` | boolean |  |  |
| 22 | `iscompletion` | boolean |  |  |
| 23 | `hasgisdata` | boolean |  |  |
| 24 | `start_month` | character varying |  |  |
| 25 | `start_year` | character varying |  |  |
| 26 | `end_month` | character varying |  |  |
| 27 | `end_year` | character varying |  |  |
| 28 | `createddate` | timestamp without time zone |  | now() |
| 29 | `lease_type` | character varying(10) |  |  |

<a id="mviewdownload-public-dblink_config"></a>
#### `public.dblink_config`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Configuration for cross-database `dblink` connections (7 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('dblink_config_id_seq'::regclass) |
| 2 | `ip_address` | text | ✔ |  |
| 3 | `port` | integer |  | 5432 |
| 4 | `type` | text | ✔ |  |
| 5 | `username` | text | ✔ |  |
| 6 | `password` | text | ✔ |  |
| 7 | `is_active` | boolean |  | true |

<a id="mviewdownload-public-directional_survey"></a>
#### `public.directional_survey`  (table)

- **Estimated rows:** 68,979
- **Primary key:** `id`
- **What it holds:** Directional well survey headers (API, survey metadata).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('directional_survey_id_seq'::regclass) |
| 2 | `filename` | character varying |  |  |
| 3 | `apinumber` | character varying |  |  |
| 4 | `tracking_no` | integer |  |  |
| 5 | `status` | character varying |  |  |
| 6 | `new_api` | character varying |  |  |
| 7 | `updated_date` | date |  |  |
| 8 | `file_type` | character varying(100) |  |  |

<a id="mviewdownload-public-directional_survey_bothrecords"></a>
#### `public.directional_survey_bothrecords`  (materialized view)

- **Estimated rows:** 7,413,645
- **What it holds:** Directional survey combined (PDF + digital) records (22 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `api14` | character varying(100) |  |  |
| 2 | `api10` | character varying |  |  |
| 3 | `permit_number` | character varying |  |  |
| 4 | `tracking_no` | bigint |  |  |
| 5 | `district_code` | character varying(10) |  |  |
| 6 | `lease_number` | character varying(100) |  |  |
| 7 | `lease_name` | character varying(500) |  |  |
| 8 | `well_number` | character varying(100) |  |  |
| 9 | `operator_name` | character varying(500) |  |  |
| 10 | `azimuth` | character varying |  |  |
| 11 | `inclinationangle` | character varying |  |  |
| 12 | `md` | character varying |  |  |
| 13 | `tvd` | character varying |  |  |
| 14 | `x` | character varying |  |  |
| 15 | `y` | character varying |  |  |
| 16 | `attachment` | character varying |  |  |
| 17 | `status` | character varying |  |  |
| 18 | `attachmentlink` | character varying |  |  |
| 19 | `attachmentupdateddate` | character varying |  |  |
| 20 | `filename` | text |  |  |
| 21 | `county` | character varying(500) |  |  |
| 22 | `wellboreprofiles` | character varying |  |  |

<a id="mviewdownload-public-directional_survey_child"></a>
#### `public.directional_survey_child`  (table)

- **Estimated rows:** 7,379,488
- **Primary key:** `id`
- **What it holds:** Directional survey station rows (per-depth MD/TVD/azimuth).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('directional_survey_child_id_seq'::regclass) |
| 2 | `directionalsurvey_id` | integer |  |  |
| 3 | `md` | character varying |  |  |
| 4 | `inclinationangle` | character varying |  |  |
| 5 | `azimuth` | character varying |  |  |
| 6 | `tvd` | character varying |  |  |
| 7 | `calculatedtvd` | character varying |  |  |
| 8 | `x` | character varying |  |  |
| 9 | `y` | character varying |  |  |
| 10 | `calculatedx` | character varying |  |  |
| 11 | `calculatedy` | character varying |  |  |

<a id="mviewdownload-public-directional_survey_digitalrecords"></a>
#### `public.directional_survey_digitalrecords`  (materialized view)

- **Estimated rows:** n/a
- **What it holds:** Digitized directional survey records (22 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `api14` | character varying(100) |  |  |
| 2 | `api10` | character varying |  |  |
| 3 | `permit_number` | character varying |  |  |
| 4 | `tracking_no` | bigint |  |  |
| 5 | `district_code` | character varying(10) |  |  |
| 6 | `lease_number` | character varying(100) |  |  |
| 7 | `lease_name` | character varying(500) |  |  |
| 8 | `well_number` | character varying(100) |  |  |
| 9 | `operator_name` | character varying(500) |  |  |
| 10 | `azimuth` | character varying |  |  |
| 11 | `inclinationangle` | character varying |  |  |
| 12 | `md` | character varying |  |  |
| 13 | `tvd` | character varying |  |  |
| 14 | `x` | character varying |  |  |
| 15 | `y` | character varying |  |  |
| 16 | `attachment` | character varying |  |  |
| 17 | `status` | character varying |  |  |
| 18 | `attachmentlink` | character varying |  |  |
| 19 | `attachmentupdateddate` | character varying |  |  |
| 20 | `filename` | text |  |  |
| 21 | `county` | character varying(500) |  |  |
| 22 | `wellboreprofiles` | character varying |  |  |

<a id="mviewdownload-public-directional_survey_exceptions"></a>
#### `public.directional_survey_exceptions`  (table)

- **Estimated rows:** 376,999
- **Primary key:** `id`
- **What it holds:** Directional survey processing exceptions/errors.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('directional_survey_exceptions_id_seq'::regclass) |
| 2 | `directionalsurvey_id` | integer |  |  |
| 3 | `exceptionmessage` | character varying |  |  |
| 4 | `rownumber` | integer |  |  |
| 5 | `columnnumber` | integer |  |  |

<a id="mviewdownload-public-directional_survey_pdfrecords"></a>
#### `public.directional_survey_pdfrecords`  (materialized view)

- **Estimated rows:** n/a
- **What it holds:** Directional survey records parsed from PDFs (22 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `api14` | character varying(100) |  |  |
| 2 | `api10` | character varying |  |  |
| 3 | `permit_number` | character varying |  |  |
| 4 | `tracking_no` | bigint |  |  |
| 5 | `district_code` | character varying(10) |  |  |
| 6 | `lease_number` | character varying(100) |  |  |
| 7 | `lease_name` | character varying(500) |  |  |
| 8 | `well_number` | character varying(100) |  |  |
| 9 | `operator_name` | character varying(500) |  |  |
| 10 | `azimuth` | character varying |  |  |
| 11 | `inclinationangle` | character varying |  |  |
| 12 | `md` | character varying |  |  |
| 13 | `tvd` | character varying |  |  |
| 14 | `x` | character varying |  |  |
| 15 | `y` | character varying |  |  |
| 16 | `attachment` | character varying |  |  |
| 17 | `status` | character varying |  |  |
| 18 | `attachmentlink` | character varying |  |  |
| 19 | `attachmentupdateddate` | character varying |  |  |
| 20 | `filename` | text |  |  |
| 21 | `county` | character varying(500) |  |  |
| 22 | `wellboreprofiles` | character varying |  |  |

<a id="mviewdownload-public-field_report"></a>
#### `public.field_report`  (table)

- **Estimated rows:** 9,830
- **Primary key:** `id`
- **What it holds:** Field-level report dataset (40 cols) — production/well stats per field.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('field_report_id_seq'::regclass) |
| 2 | `field_number` | character varying(50) |  |  |
| 3 | `field_name` | character varying |  |  |
| 4 | `oil_county_regular` | character varying |  |  |
| 5 | `oil_salt_dome` | character varying |  |  |
| 6 | `oil_field_location` | character varying |  |  |
| 7 | `oil_dont_permit` | character varying |  |  |
| 8 | `oil_schedule_remark` | character varying |  |  |
| 9 | `oil_comment` | character varying |  |  |
| 10 | `oil_rule_type` | character varying |  |  |
| 11 | `oil_depth` | character varying |  |  |
| 12 | `oil_lease_spacing` | character varying |  |  |
| 13 | `oil_well_spacing` | character varying |  |  |
| 14 | `oil_acres_perunit` | character varying |  |  |
| 15 | `oil_tolerance_perunit` | character varying |  |  |
| 16 | `oil_diagonal_code` | character varying |  |  |
| 17 | `oil_diagonal_max_len` | character varying |  |  |
| 18 | `gas_county_regular` | character varying |  |  |
| 19 | `gas_salt_dome` | character varying |  |  |
| 20 | `gas_field_location` | character varying |  |  |
| 21 | `gas_dont_permit` | character varying |  |  |
| 22 | `gas_schedule_remark` | character varying |  |  |
| 23 | `gas_comment` | character varying |  |  |
| 24 | `gas_rule_type` | character varying |  |  |
| 25 | `gas_depth` | character varying |  |  |
| 26 | `gas_lease_spacing` | character varying |  |  |
| 27 | `gas_well_spacing` | character varying |  |  |
| 28 | `gas_acres_perunit` | character varying |  |  |
| 29 | `gas_tolerance_perunit` | character varying |  |  |
| 30 | `gas_diagonal_code` | character varying |  |  |
| 31 | `gas_diagonal_max_len` | character varying |  |  |
| 32 | `api_number` | character varying |  |  |
| 33 | `surface_tolerance_box` | character varying |  |  |
| 34 | `collaborative_interval_box` | character varying |  |  |
| 35 | `first_last_box` | character varying |  |  |
| 36 | `perpendicular_leaseline_box` | character varying |  |  |
| 37 | `horizontal_to_vertical_dir_box` | character varying |  |  |
| 38 | `horizontal_to_horizontal_dir_box` | character varying |  |  |
| 39 | `overlap_distance_box` | character varying |  |  |
| 40 | `stacked_lateral_rule_box` | character varying |  |  |

<a id="mviewdownload-public-field_rules"></a>
#### `public.field_rules`  (table)

- **Estimated rows:** 10,974
- **What it holds:** Field rule lookup (field + rule).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `field_number` | text |  |  |
| 2 | `field_name` | text |  |  |

<a id="mviewdownload-public-gastestdata"></a>
#### `public.gastestdata`  (table)

- **Estimated rows:** 38,056
- **What it holds:** Gas-well back-pressure/test data (15 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `tracking_no` | integer |  |  |
| 2 | `testdate` | date |  |  |
| 3 | `gasvolume` | numeric |  |  |
| 4 | `oilvolume` | numeric |  |  |
| 5 | `watervolume` | numeric |  |  |
| 6 | `gashaydroratio` | character varying(20) |  |  |
| 7 | `tubingpressure` | character varying(20) |  |  |
| 8 | `chokesize` | character varying(20) |  |  |
| 9 | `casingpressure` | character varying(20) |  |  |
| 10 | `shutinpressure` | character varying(20) |  |  |
| 11 | `sepoperatingpressure` | character varying(20) |  |  |
| 12 | `stocktankcolor` | character varying |  |  |
| 13 | `sepliquidgravity` | character varying(20) |  |  |
| 14 | `gasgravity` | character varying(20) |  |  |
| 15 | `id` | integer | ✔ | nextval('gastestdata_id_seq'::regclass) |

<a id="mviewdownload-public-marketupdates"></a>
#### `public.marketupdates`  (table)

- **Estimated rows:** 13
- **What it holds:** Live market/commodity price updates (symbol, price, change, datetime).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('marketupdates_id_seq'::regclass) |
| 2 | `symbolname` | character varying |  |  |
| 3 | `lastprice` | numeric |  |  |
| 4 | `change` | numeric |  |  |
| 5 | `changepercentage` | numeric |  |  |
| 6 | `currency` | character varying |  |  |
| 7 | `datetime` | timestamp without time zone |  |  |
| 8 | `marketupdatetype` | character varying |  |  |

<a id="mviewdownload-public-master_county"></a>
#### `public.master_county`  (table)

- **Estimated rows:** n/a
- **What it holds:** Master county reference (8 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county_no` | character varying(3) |  |  |
| 2 | `county_fips_code` | character varying(3) |  |  |
| 3 | `county_name` | character varying(50) |  |  |
| 4 | `district_no` | character varying(2) |  |  |
| 5 | `district_name` | character varying(2) |  |  |
| 6 | `on_shore_flag` | character varying(1) |  |  |
| 7 | `onshore_assc_cnty_flag` | character varying(1) |  |  |
| 8 | `id` | integer |  |  |

<a id="mviewdownload-public-master_fields"></a>
#### `public.master_fields`  (table)

- **Estimated rows:** 59,015
- **Primary key:** `fieldnumber`
- **What it holds:** Master oil & gas field reference (5 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('fields_id_seq'::regclass) |
| 2 | `fieldnumber` 🔑 | character varying | ✔ |  |
| 3 | `fieldname` | character varying |  |  |
| 4 | `reservoir` | character varying |  |  |
| 5 | `fields_description` | character varying |  |  |

<a id="mviewdownload-public-master_leases"></a>
#### `public.master_leases`  (table)

- **Estimated rows:** 455,923
- **Primary key:** `id`
- **What it holds:** Master lease reference (7 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('leases_id_seq'::regclass) |
| 2 | `district_code` | character varying |  |  |
| 3 | `lease_number` | text |  |  |
| 4 | `lease_name` | character varying |  |  |
| 5 | `county` | character varying |  |  |
| 6 | `acres` | double precision |  |  |
| 7 | `created_date` | date |  |  |

<a id="mviewdownload-public-master_operators"></a>
#### `public.master_operators`  (table)

- **Estimated rows:** 28,501
- **Primary key:** `operator_number`
- **What it holds:** Master operator reference (5 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `operator_number` 🔑 | character varying | ✔ |  |
| 2 | `operator_name` | character varying |  |  |
| 3 | `operator_address` | character varying |  |  |
| 4 | `id` | integer | ✔ | nextval('operators_id_seq'::regclass) |
| 5 | `created_date` | date |  |  |

<a id="mviewdownload-public-mineralowner_2023"></a>
#### `public.mineralowner_2023`  (table)

- **Estimated rows:** 2,871,465
- **What it holds:** 2023 mineral-owner snapshot (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer | ✔ | nextval('mineralowner_2023_all_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-public-mineralowner_2024"></a>
#### `public.mineralowner_2024`  (table)

- **Estimated rows:** 1,220,150
- **What it holds:** 2024 mineral-owner snapshot (owner number, name, address).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `ownernumber` | character varying |  |  |
| 3 | `ownername` | character varying |  |  |
| 4 | `owneraddress` | character varying |  |  |
| 5 | `id2` | integer |  |  |
| 6 | `id` | integer | ✔ | nextval('mineralowner_2024_id_seq'::regclass) |
| 7 | `ownercountyname` | character varying |  |  |
| 8 | `ownercity` | character varying(255) |  |  |

<a id="mviewdownload-public-mineralownerproperty_2023"></a>
#### `public.mineralownerproperty_2023`  (table)

- **Estimated rows:** 2,728,092
- **What it holds:** 2023 mineral-owner property/holdings (lease, interest, value).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineralownerproperty_2023_all_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |

<a id="mviewdownload-public-mineralownerproperty_2024"></a>
#### `public.mineralownerproperty_2024`  (table)

- **Estimated rows:** 6,461,960
- **What it holds:** 2024 mineral-owner property/holdings (lease, interest, value).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer | ✔ | nextval('mineralownerproperty_2024_id_seq'::regclass) |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |
| 16 | `ri_updated` | character varying |  |  |

<a id="mviewdownload-public-mineralownerproperty_terry_2023"></a>
#### `public.mineralownerproperty_terry_2023`  (table)

- **Estimated rows:** 9,672
- **What it holds:** 2023 mineral-owner property holdings for Terry county.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |

<a id="mviewdownload-public-mineralownerproperty_tyler_2023"></a>
#### `public.mineralownerproperty_tyler_2023`  (table)

- **Estimated rows:** 17,763
- **What it holds:** 2023 mineral-owner property holdings for Tyler county.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mineralownerid` | integer |  |  |
| 2 | `propertydescription` | character varying |  |  |
| 3 | `districtcode` | character varying |  |  |
| 4 | `leasenumber` | character varying |  |  |
| 5 | `ri` | character varying |  |  |
| 6 | `value` | character varying |  |  |
| 7 | `ritype` | character varying |  |  |
| 8 | `leasename` | character varying |  |  |
| 9 | `leasedata` | character varying |  |  |
| 10 | `mineralownerid2` | integer |  |  |
| 11 | `ownernumber` | character varying |  |  |
| 12 | `id` | integer |  |  |
| 13 | `mineralaccountnumber` | character varying |  |  |
| 14 | `mineralaccountsequence` | character varying |  |  |
| 15 | `leaseacres` | character varying |  |  |

<a id="mviewdownload-public-mineralownersdetailsbbycountysitemap"></a>
#### `public.mineralownersdetailsbbycountysitemap`  (table)

- **Estimated rows:** 1,115,879
- **What it holds:** Sitemap index of mineral-owner detail pages by county (SEO).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | text |  |  |
| 2 | `ownernumber` | text |  |  |
| 3 | `ownername_url` | text |  |  |
| 4 | `interest` | numeric |  |  |

<a id="mviewdownload-public-mo_texas"></a>
#### `public.mo_texas`  (materialized view)

- **Estimated rows:** 161
- **What it holds:** Texas-wide mineral owners dataset (8 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `statecode` | integer |  |  |
| 2 | `statename` | character varying |  |  |
| 3 | `county` | text |  |  |
| 4 | `totalmineralowner` | text |  |  |
| 5 | `totalvalue` | text |  |  |
| 6 | `interest` | numeric |  |  |
| 7 | `property` | text |  |  |
| 8 | `playtypes` | text |  |  |

<a id="mviewdownload-public-new_wellbore_master"></a>
#### `public.new_wellbore_master`  (table)

- **Estimated rows:** 1,070,341
- **What it holds:** Master wellbore dataset (29 cols) — API, location, well attributes.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `district_code` | text |  |  |
| 2 | `Api_No` | text |  |  |
| 3 | `county` | text |  |  |
| 4 | `Well_Type` | text |  |  |
| 5 | `lease_name` | text |  |  |
| 6 | `field_number` | text |  |  |
| 7 | `field_name` | text |  |  |
| 8 | `lease_number` | text |  |  |
| 9 | `well_number` | text |  |  |
| 10 | `operator_name` | text |  |  |
| 11 | `operator_number` | text |  |  |
| 12 | `LAST_PROD_YM` | date |  |  |
| 13 | `FIRST_PROD_DATE` | date |  |  |
| 14 | `filing_welltype` | text |  |  |
| 15 | `recompletiondate` | date |  |  |
| 16 | `wellboreprofiles` | text |  |  |
| 17 | `latest_spud_date` | date |  |  |
| 18 | `ALLOWABLE_FLAG` | text |  |  |
| 19 | `DRILLER_FLAG` | text |  |  |
| 20 | `id` | text |  |  |
| 21 | `exist_flag` | text |  |  |
| 22 | `api14` | text |  |  |
| 23 | `latitude` | double precision |  |  |
| 24 | `longitude` | double precision |  |  |
| 25 | `bhl_x` | double precision |  |  |
| 26 | `bhl_y` | double precision |  |  |
| 27 | `lease_acres` | double precision |  |  |
| 28 | `to_md` | text |  |  |
| 29 | `updated_date` | timestamp without time zone |  |  |

<a id="mviewdownload-public-og_lease_cycle_disposition_dec_2025"></a>
#### `public.og_lease_cycle_disposition_dec_2025`  (table)

- **Estimated rows:** n/a
- **What it holds:** RRC oil & gas lease-cycle disposition data, Dec 2025 (52 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oil_gas_code` | character varying(1) |  |  |
| 2 | `district_no` | character varying(2) |  |  |
| 3 | `lease_no` | character varying(6) |  |  |
| 4 | `cycle_year` | character varying(4) |  |  |
| 5 | `cycle_month` | character varying(2) |  |  |
| 6 | `operator_no` | character varying(6) |  |  |
| 7 | `field_no` | character varying(8) |  |  |
| 8 | `cycle_year_month` | character varying(6) |  |  |
| 9 | `lease_oil_dispcd00_vol` | integer |  |  |
| 10 | `lease_oil_dispcd01_vol` | integer |  |  |
| 11 | `lease_oil_dispcd02_vol` | integer |  |  |
| 12 | `lease_oil_dispcd03_vol` | integer |  |  |
| 13 | `lease_oil_dispcd04_vol` | integer |  |  |
| 14 | `lease_oil_dispcd05_vol` | integer |  |  |
| 15 | `lease_oil_dispcd06_vol` | integer |  |  |
| 16 | `lease_oil_dispcd07_vol` | integer |  |  |
| 17 | `lease_oil_dispcd08_vol` | integer |  |  |
| 18 | `lease_oil_dispcd09_vol` | integer |  |  |
| 19 | `lease_oil_dispcd99_vol` | integer |  |  |
| 20 | `lease_gas_dispcd01_vol` | integer |  |  |
| 21 | `lease_gas_dispcd02_vol` | integer |  |  |
| 22 | `lease_gas_dispcd03_vol` | integer |  |  |
| 23 | `lease_gas_dispcd04_vol` | integer |  |  |
| 24 | `lease_gas_dispcd05_vol` | integer |  |  |
| 25 | `lease_gas_dispcd06_vol` | integer |  |  |
| 26 | `lease_gas_dispcd07_vol` | integer |  |  |
| 27 | `lease_gas_dispcd08_vol` | integer |  |  |
| 28 | `lease_gas_dispcd09_vol` | integer |  |  |
| 29 | `lease_gas_dispcd99_vol` | integer |  |  |
| 30 | `lease_cond_dispcd00_vol` | integer |  |  |
| 31 | `lease_cond_dispcd01_vol` | integer |  |  |
| 32 | `lease_cond_dispcd02_vol` | integer |  |  |
| 33 | `lease_cond_dispcd03_vol` | integer |  |  |
| 34 | `lease_cond_dispcd04_vol` | integer |  |  |
| 35 | `lease_cond_dispcd05_vol` | integer |  |  |
| 36 | `lease_cond_dispcd06_vol` | integer |  |  |
| 37 | `lease_cond_dispcd07_vol` | integer |  |  |
| 38 | `lease_cond_dispcd08_vol` | integer |  |  |
| 39 | `lease_cond_dispcd99_vol` | integer |  |  |
| 40 | `lease_csgd_dispcde01_vol` | integer |  |  |
| 41 | `lease_csgd_dispcde02_vol` | integer |  |  |
| 42 | `lease_csgd_dispcde03_vol` | integer |  |  |
| 43 | `lease_csgd_dispcde04_vol` | integer |  |  |
| 44 | `lease_csgd_dispcde05_vol` | integer |  |  |
| 45 | `lease_csgd_dispcde06_vol` | integer |  |  |
| 46 | `lease_csgd_dispcde07_vol` | integer |  |  |
| 47 | `lease_csgd_dispcde08_vol` | integer |  |  |
| 48 | `lease_csgd_dispcde99_vol` | integer |  |  |
| 49 | `district_name` | character varying(2) |  |  |
| 50 | `lease_name` | character varying(50) |  |  |
| 51 | `operator_name` | character varying(50) |  |  |
| 52 | `field_name` | character varying(50) |  |  |

<a id="mviewdownload-public-og_lease_cycle_production_dec_2025"></a>
#### `public.og_lease_cycle_production_dec_2025`  (table)

- **Estimated rows:** 5
- **What it holds:** RRC oil & gas lease-cycle production data, Dec 2025 (32 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oil_gas_code` | character varying(1) |  |  |
| 2 | `district_no` | character varying(2) |  |  |
| 3 | `lease_no` | character varying(6) |  |  |
| 4 | `cycle_year` | character varying(4) |  |  |
| 5 | `cycle_month` | character varying(2) |  |  |
| 6 | `cycle_year_month` | character varying(6) |  |  |
| 7 | `lease_no_district_no` | bigint |  |  |
| 8 | `operator_no` | character varying(6) |  |  |
| 9 | `field_no` | character varying(8) |  |  |
| 10 | `field_type` | character varying(2) |  |  |
| 11 | `gas_well_no` | character varying(6) |  |  |
| 12 | `prod_report_filed_flag` | character varying(1) |  |  |
| 13 | `lease_oil_prod_vol` | integer |  |  |
| 14 | `lease_oil_allow` | integer |  |  |
| 15 | `lease_oil_ending_bal` | integer |  |  |
| 16 | `lease_gas_prod_vol` | integer |  |  |
| 17 | `lease_gas_allow` | integer |  |  |
| 18 | `lease_gas_lift_inj_vol` | integer |  |  |
| 19 | `lease_cond_prod_vol` | integer |  |  |
| 20 | `lease_cond_limit` | integer |  |  |
| 21 | `lease_cond_ending_bal` | integer |  |  |
| 22 | `lease_csgd_prod_vol` | integer |  |  |
| 23 | `lease_csgd_limit` | integer |  |  |
| 24 | `lease_csgd_gas_lift` | integer |  |  |
| 25 | `lease_oil_tot_disp` | integer |  |  |
| 26 | `lease_gas_tot_disp` | integer |  |  |
| 27 | `lease_cond_tot_disp` | integer |  |  |
| 28 | `lease_csgd_tot_disp` | integer |  |  |
| 29 | `district_name` | character varying(2) |  |  |
| 30 | `lease_name` | character varying(50) |  |  |
| 31 | `operator_name` | character varying(50) |  |  |
| 32 | `field_name` | character varying(32) |  |  |

<a id="mviewdownload-public-oil_gas_history_future"></a>
#### `public.oil_gas_history_future`  (table)

- **Estimated rows:** 565
- **Primary key:** `id`
- **What it holds:** Combined oil & gas historical + forecast series (14 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('oil_gas_history_future_id_seq'::regclass) |
| 2 | `oilgasdate` | date |  |  |
| 3 | `month` | integer |  |  |
| 4 | `year` | integer |  |  |
| 5 | `oilprice` | numeric |  |  |
| 6 | `oilopen` | numeric |  |  |
| 7 | `oilhigh` | numeric |  |  |
| 8 | `oillow` | numeric |  |  |
| 9 | `oilvolume` | numeric |  |  |
| 10 | `gasprice` | numeric |  |  |
| 11 | `gasopen` | numeric |  |  |
| 12 | `gashigh` | numeric |  |  |
| 13 | `gaslow` | numeric |  |  |
| 14 | `gasvolume` | numeric |  |  |

<a id="mviewdownload-public-oil_gas_production_well_data"></a>
#### `public.oil_gas_production_well_data`  (table)

- **Estimated rows:** n/a
- **What it holds:** Per-well oil & gas production data (5 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `cycle_year` | integer |  |  |
| 2 | `oil` | bigint |  |  |
| 3 | `gas` | bigint |  |  |
| 4 | `completion` | integer |  |  |
| 5 | `permit` | integer |  |  |

<a id="mviewdownload-public-oilgasfuturepricingdata"></a>
#### `public.oilgasfuturepricingdata`  (table)

- **Estimated rows:** 201,283
- **What it holds:** Oil & gas future/forecast pricing dataset (14 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `datafetcheddate` | date |  |  |
| 2 | `month` | integer |  |  |
| 3 | `year` | integer |  |  |
| 4 | `oilprice` | numeric |  |  |
| 5 | `oilopen` | numeric |  |  |
| 6 | `oilhigh` | numeric |  |  |
| 7 | `oillow` | numeric |  |  |
| 8 | `oilvolume` | numeric |  |  |
| 9 | `gasprice` | numeric |  |  |
| 10 | `gasopen` | numeric |  |  |
| 11 | `gashigh` | numeric |  |  |
| 12 | `gaslow` | numeric |  |  |
| 13 | `gasvolume` | numeric |  |  |
| 14 | `id` | integer | ✔ | nextval('oilgasfuturepricingdata_id_seq'::regclass) |

<a id="mviewdownload-public-oilgashistorydata"></a>
#### `public.oilgashistorydata`  (table)

- **Estimated rows:** 11,134
- **Primary key:** `id`
- **What it holds:** Oil & gas historical pricing/production dataset (14 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oilgashistorydate` | date |  |  |
| 2 | `month` | integer |  |  |
| 3 | `year` | integer |  |  |
| 4 | `oilprice` | numeric |  |  |
| 5 | `oilopen` | numeric |  |  |
| 6 | `oilhigh` | numeric |  |  |
| 7 | `oillow` | numeric |  |  |
| 8 | `oilvolume` | numeric |  |  |
| 9 | `gasprice` | numeric |  |  |
| 10 | `gasopen` | numeric |  |  |
| 11 | `gashigh` | numeric |  |  |
| 12 | `gaslow` | numeric |  |  |
| 13 | `gasvolume` | numeric |  |  |
| 14 | `id` 🔑 | integer | ✔ | nextval('oilgashistorydata_id_seq1'::regclass) |

<a id="mviewdownload-public-oilgaspricing"></a>
#### `public.oilgaspricing`  (table)

- **Estimated rows:** 323
- **Primary key:** `id`
- **What it holds:** Oil & gas pricing dataset (14 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('oilgaspricing_id_seq'::regclass) |
| 2 | `datafetcheddate` | date |  |  |
| 3 | `month` | integer |  |  |
| 4 | `year` | integer |  |  |
| 5 | `oilprice` | numeric |  |  |
| 6 | `oilopen` | numeric |  |  |
| 7 | `oilhigh` | numeric |  |  |
| 8 | `oillow` | numeric |  |  |
| 9 | `oilvolume` | numeric |  |  |
| 10 | `gasprice` | numeric |  |  |
| 11 | `gasopen` | numeric |  |  |
| 12 | `gashigh` | numeric |  |  |
| 13 | `gaslow` | numeric |  |  |
| 14 | `gasvolume` | numeric |  |  |

<a id="mviewdownload-public-playtypes"></a>
#### `public.playtypes`  (table)

- **Estimated rows:** n/a
- **What it holds:** Play type lookup.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('playtypes_id_seq'::regclass) |
| 2 | `playtypename` | character varying |  |  |
| 3 | `playtype_description` | character varying |  |  |

<a id="mviewdownload-public-purchase_county_years"></a>
#### `public.purchase_county_years`  (table)

- **Estimated rows:** n/a
- **What it holds:** Available county-year combinations offered for data purchase.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | character varying |  |  |
| 2 | `current_year` | integer |  |  |
| 3 | `mineralownertable` | character varying |  |  |
| 4 | `mineralownerpropertiestable` | character varying |  |  |

<a id="mviewdownload-public-reservoir_playtypes"></a>
#### `public.reservoir_playtypes`  (table)

- **Estimated rows:** 2,183
- **Primary key:** `id`
- **What it holds:** Reservoir play-type lookup.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('reservoir_playtypes_id_seq'::regclass) |
| 2 | `reservoirtype` | character varying |  |  |
| 3 | `playtype` | character varying |  |  |
| 4 | `playtypeid` | integer |  |  |

<a id="mviewdownload-public-schema_mappings"></a>
#### `public.schema_mappings`  (table)

- **Estimated rows:** n/a
- **Primary key:** `mapping_id`
- **What it holds:** Configuration mapping logical schemas/tables (14 cols) — used to route per-county data.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `mapping_id` 🔑 | text | ✔ |  |
| 2 | `mapping_version` | integer | ✔ | 1 |
| 3 | `state` | text | ✔ |  |
| 4 | `jurisdiction` | text | ✔ |  |
| 5 | `source_authority` | text |  |  |
| 6 | `source_type` | text |  |  |
| 7 | `schema_hash` | text | ✔ |  |
| 8 | `mapping_json` | jsonb | ✔ |  |
| 9 | `drift_detected` | boolean | ✔ | false |
| 10 | `drift_detail` | text |  |  |
| 11 | `human_reviewed` | boolean | ✔ | false |
| 12 | `review_outcome` | text |  |  |
| 13 | `review_timestamp` | timestamp with time zone |  |  |
| 14 | `created_at` | timestamp with time zone | ✔ | now() |

<a id="mviewdownload-public-texas_mineralowner_summary"></a>
#### `public.texas_mineralowner_summary`  (view)

- **Estimated rows:** n/a
- **What it holds:** Summary rollup of Texas mineral owners (5 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `statename` | character varying |  |  |
| 2 | `totalmineralowner` | text |  |  |
| 3 | `totalappraisal` | text |  |  |
| 4 | `properties` | text |  |  |
| 5 | `totalrecord` | bigint |  |  |

<a id="mviewdownload-public-w1fields"></a>
#### `public.w1fields`  (table)

- **Estimated rows:** 1,423,578
- **Primary key:** `id`
- **What it holds:** W-1 permit field entries (field number/name and attributes per permit).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('w1fields_id_seq'::regclass) |
| 2 | `fieldnumber` | character varying | ✔ |  |
| 3 | `status_number` | character varying | ✔ |  |
| 4 | `distance_to_nearest_well` | double precision |  |  |
| 5 | `distance_to_nearest_lease_line` | double precision |  |  |
| 6 | `completiondepth` | double precision |  |  |
| 7 | `welltype` | character varying |  |  |
| 8 | `district_code` | character varying |  |  |
| 9 | `swr` | character varying |  |  |
| 10 | `pooled_or_unitized` | character varying |  |  |
| 11 | `perpendiculars` | character varying(30) |  |  |
| 12 | `distanceone` | double precision |  |  |
| 13 | `directionone` | character varying |  |  |
| 14 | `distancetwo` | double precision |  |  |
| 15 | `directiontwo` | character varying |  |  |
| 16 | `fieldname` | character varying |  |  |

<a id="mviewdownload-public-w1permit_latitude"></a>
#### `public.w1permit_latitude`  (table)

- **Estimated rows:** 839,009
- **What it holds:** W-1 permit latitude/longitude coordinates (5 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('permit_lat_id_seq'::regclass) |
| 2 | `status_number` | character varying | ✔ |  |
| 3 | `status` | boolean |  |  |
| 4 | `column_updated` | text |  |  |
| 5 | `lease_number` | boolean |  |  |

<a id="mviewdownload-public-w1permits"></a>
#### `public.w1permits`  (table)

- **Estimated rows:** 840,506
- **Primary key:** `status_number`
- **What it holds:** W-1 drilling permits master (28 cols) — API, operator, dates, location, status.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('w1permits_id_seq'::regclass) |
| 2 | `api` | character varying | ✔ |  |
| 3 | `status_number` 🔑 | character varying | ✔ |  |
| 4 | `issued_date` | date |  |  |
| 5 | `status` | character varying |  |  |
| 6 | `filed` | character varying |  |  |
| 7 | `wellboreprofiles` | character varying |  |  |
| 8 | `filing_purpose` | character varying |  |  |
| 9 | `swr` | character varying |  |  |
| 10 | `horizontal_wellbore` | character varying |  |  |
| 11 | `stacked_lateral_parent_well_dp` | character varying |  |  |
| 12 | `perpendiculars` | character varying |  |  |
| 13 | `distanceone` | double precision |  |  |
| 14 | `directionone` | character varying |  |  |
| 15 | `distancetwo` | double precision |  |  |
| 16 | `directiontwo` | character varying |  |  |
| 17 | `spud_date` | date |  |  |
| 18 | `drilling_completed_date` | date |  |  |
| 19 | `surface_casing_date` | date |  |  |
| 20 | `completed_date` | date |  |  |
| 21 | `validated_date` | date |  |  |
| 22 | `status_suffix` | character varying |  |  |
| 23 | `submit_date` | date |  |  |
| 24 | `isscrape` | boolean |  |  |
| 25 | `new_api` | character varying |  |  |
| 26 | `updated_date` | date |  |  |
| 27 | `firstactivity_date` | date |  |  |
| 28 | `old_api` | character varying |  |  |

<a id="mviewdownload-public-w1wells"></a>
#### `public.w1wells`  (table)

- **Estimated rows:** 864,090
- **Primary key:** `id`
- **What it holds:** W-1 permitted wells (34 cols) — well-level permit detail.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('wells_id_seq'::regclass) |
| 2 | `status_number` | character varying | ✔ |  |
| 3 | `district_code` | character varying |  |  |
| 4 | `lease_number` | text |  |  |
| 5 | `originaloperator_number` | character varying | ✔ |  |
| 6 | `currentoperate_number` | bigint |  |  |
| 7 | `well_number` | character varying |  |  |
| 8 | `total_depth` | integer |  |  |
| 9 | `well_status_code` | character varying |  |  |
| 10 | `completed_well_type` | character varying |  |  |
| 11 | `distance_from_nearest_town` | double precision |  |  |
| 12 | `direction_from_nearest_town` | character varying |  |  |
| 13 | `nreatest_town` | character varying |  |  |
| 14 | `surface_location_type` | character varying |  |  |
| 15 | `nad27latdegrees` | double precision |  |  |
| 16 | `nad27latminutes` | double precision |  |  |
| 17 | `nad27latseconds` | double precision |  |  |
| 18 | `nad27longidegrees` | double precision |  |  |
| 19 | `nad27longiminutes` | double precision |  |  |
| 20 | `nad27longiseconds` | double precision |  |  |
| 21 | `nad27x` | double precision |  |  |
| 22 | `nad27y` | double precision |  |  |
| 23 | `nad27lat` | double precision |  |  |
| 24 | `nad27longi` | double precision |  |  |
| 25 | `nad83lat` | double precision |  |  |
| 26 | `nad83longi` | double precision |  |  |
| 27 | `stateplanezone` | character varying |  |  |
| 28 | `lease_name` | character varying |  |  |
| 29 | `nadtype` | character varying |  |  |
| 30 | `latitude` | double precision |  |  |
| 31 | `longitude` | double precision |  |  |
| 32 | `county` | character varying(100) |  |  |
| 33 | `final_lat` | double precision |  |  |
| 34 | `final_long` | double precision |  |  |

<a id="mviewdownload-public-w2_completion_informations"></a>
#### `public.w2_completion_informations`  (table)

- **Estimated rows:** 312,354
- **Primary key:** `id`
- **What it holds:** W-2 completion information (38 cols) — completion details per well.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('completion_informations_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `submit_date` | date |  |  |
| 4 | `spud_date` | date |  |  |
| 5 | `firstproduction_date` | date |  |  |
| 6 | `drillingoperation_date` | date |  |  |
| 7 | `producingwells` | integer |  |  |
| 8 | `nearestwelldistance` | double precision |  |  |
| 9 | `elevation` | double precision |  |  |
| 10 | `completiontype` | character varying |  |  |
| 11 | `surfacecasingrotationtime` | double precision |  |  |
| 12 | `iscementingaffidavit` | boolean |  |  |
| 13 | `isrecompletionreclass` | boolean |  |  |
| 14 | `ismultiplecompletion` | boolean |  |  |
| 15 | `logsruntype` | character varying |  |  |
| 16 | `wellboreprofile` | character varying |  |  |
| 17 | `logs_description` | character varying |  |  |
| 18 | `locationfromleaseboundry` | double precision |  |  |
| 19 | `horizwbcompletiontype` | character varying |  |  |
| 20 | `stackedlateralparentchildwell` | character varying |  |  |
| 21 | `slrecorddrillingpermitno` | character varying |  |  |
| 22 | `horizontaldepthseverance` | character varying |  |  |
| 23 | `leaseacres` | double precision |  |  |
| 24 | `totaltvd` | double precision |  |  |
| 25 | `totalmd` | double precision |  |  |
| 26 | `plugbacktvd` | double precision |  |  |
| 27 | `plugbackmd` | double precision |  |  |
| 28 | `gau_depth` | double precision |  |  |
| 29 | `swr_depth` | double precision |  |  |
| 30 | `depth_date` | date |  |  |
| 31 | `drillingoperation_enddate` | date |  |  |
| 32 | `elevation_type` | character varying |  |  |
| 33 | `offlease` | boolean |  |  |
| 34 | `inclination` | boolean |  |  |
| 35 | `feet1` | double precision |  |  |
| 36 | `feet2` | double precision |  |  |
| 37 | `line1` | character varying |  |  |
| 38 | `line2` | character varying |  |  |

<a id="mviewdownload-public-w2_completionattachment"></a>
#### `public.w2_completionattachment`  (table)

- **Estimated rows:** 2,682,827
- **Primary key:** `id`
- **What it holds:** W-2 completion document attachments.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('completionattachment_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `attachment` | character varying |  |  |
| 4 | `status` | character varying |  |  |
| 5 | `attachmentlink` | character varying |  |  |
| 6 | `attachmentupdateddate` | character varying |  |  |

<a id="mviewdownload-public-w2_completions"></a>
#### `public.w2_completions`  (table)

- **Estimated rows:** 286,780
- **Primary key:** `tracking_no`
- **What it holds:** W-2 completion form master records (18 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('completions_id_seq'::regclass) |
| 2 | `tracking_no` 🔑 | bigint | ✔ |  |
| 3 | `api` | character varying | ✔ |  |
| 4 | `operator_number` | character varying |  |  |
| 5 | `fieldnumber` | character varying |  |  |
| 6 | `lease_number` | text |  |  |
| 7 | `district_code` | character varying |  |  |
| 8 | `status` | character varying |  |  |
| 9 | `completion_date` | date |  |  |
| 10 | `iscurrent` | boolean |  | false |
| 11 | `new_api` | character varying |  |  |
| 12 | `updated_date` | date |  |  |
| 13 | `permitnumber` | character varying |  |  |
| 14 | `lease_name` | character varying |  |  |
| 15 | `updated_lease_name` | character varying |  |  |
| 16 | `old_api` | character varying(255) |  |  |
| 17 | `W2/G1_Available` | boolean |  |  |
| 18 | `rrc_available` | boolean |  |  |

<a id="mviewdownload-public-w2_completionwells"></a>
#### `public.w2_completionwells`  (table)

- **Estimated rows:** 312,625
- **Primary key:** `id`
- **What it holds:** Wells linked to W-2 completions (22 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('completionwells_id_seq'::regclass) |
| 2 | `api` | character varying |  |  |
| 3 | `district_code` | character varying |  |  |
| 4 | `lease_number` | text |  |  |
| 5 | `originaloperator_number` | character varying |  |  |
| 6 | `tracking_no` | bigint |  |  |
| 7 | `wellnumber` | character varying |  |  |
| 8 | `drillingpermitno` | integer |  |  |
| 9 | `packettype` | character varying |  |  |
| 10 | `fieldno` | character varying |  |  |
| 11 | `location` | character varying |  |  |
| 12 | `county` | character varying |  |  |
| 13 | `completionlat` | double precision |  |  |
| 14 | `completionlong` | double precision |  |  |
| 15 | `section` | character varying |  |  |
| 16 | `block` | character varying |  |  |
| 17 | `survey` | character varying |  |  |
| 18 | `abstract` | character varying |  |  |
| 19 | `welllocation` | character varying |  |  |
| 20 | `directionfrom` | character varying |  |  |
| 21 | `milesin` | character varying |  |  |
| 22 | `new_api` | character varying |  |  |

<a id="mviewdownload-public-w2_fillinginformations"></a>
#### `public.w2_fillinginformations`  (table)

- **Estimated rows:** 312,395
- **Primary key:** `id`
- **What it holds:** W-2 filing metadata (6 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('fillinginformations_id_seq'::regclass) |
| 2 | `tracking_no` | bigint |  |  |
| 3 | `fillingpurpose` | character varying |  |  |
| 4 | `completiontype` | character varying |  |  |
| 5 | `welltype` | character varying |  |  |
| 6 | `completiondate` | date |  |  |

<a id="mviewdownload-public-w2_formationrecordchild"></a>
#### `public.w2_formationrecordchild`  (table)

- **Estimated rows:** 311,598
- **Primary key:** `id`
- **What it holds:** W-2 formation record child rows.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('w2_formationrecordchild_id_seq'::regclass) |
| 2 | `tracking_no` | bigint |  |  |
| 3 | `formationrecord_id` | integer |  |  |
| 4 | `doproducinginterval` | boolean |  |  |
| 5 | `iscompletion` | boolean |  |  |

<a id="mviewdownload-public-w2_formationrecords"></a>
#### `public.w2_formationrecords`  (table)

- **Estimated rows:** 2,572,458
- **Primary key:** `id`
- **What it holds:** W-2 formation records (formation tops per well).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('formationrecords_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `formations` | character varying |  |  |
| 4 | `encountered` | boolean |  |  |
| 5 | `tvd` | double precision |  |  |
| 6 | `md` | double precision |  |  |
| 7 | `isformationisolated` | boolean |  |  |
| 8 | `remarks` | character varying |  |  |

<a id="mviewdownload-public-w2_initialpotential_testdata"></a>
#### `public.w2_initialpotential_testdata`  (table)

- **Estimated rows:** 312,353
- **Primary key:** `id`
- **What it holds:** W-2 initial potential (IP) test data (18 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('initialpotential_testdata_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `test_date` | date |  |  |
| 4 | `productionmethod` | character varying |  |  |
| 5 | `testedhours` | integer |  |  |
| 6 | `chokesize` | character varying |  |  |
| 7 | `oilprodpriortest` | double precision |  |  |
| 8 | `isswabused` | boolean |  |  |
| 9 | `oil` | double precision |  |  |
| 10 | `gas` | double precision |  |  |
| 11 | `gasoilratio` | double precision |  |  |
| 12 | `flowingtubingpressure` | double precision |  |  |
| 13 | `water` | double precision |  |  |
| 14 | `oil24hr` | double precision |  |  |
| 15 | `gas24hr` | double precision |  |  |
| 16 | `oilgravity24hr` | double precision |  |  |
| 17 | `casingpressure24hr` | double precision |  |  |
| 18 | `water24hr` | double precision |  |  |

<a id="mviewdownload-public-w2_intervals"></a>
#### `public.w2_intervals`  (table)

- **Estimated rows:** 441,746
- **Primary key:** `id`
- **What it holds:** W-2 completion interval records.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('intervals_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `isopenhole` | boolean |  |  |
| 4 | `frominterval` | character varying |  |  |
| 5 | `tointerval` | character varying |  |  |

<a id="mviewdownload-public-w2_permittypes"></a>
#### `public.w2_permittypes`  (table)

- **Estimated rows:** 1,560,430
- **Primary key:** `id`
- **What it holds:** W-2 permit type lookup.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('permittypes_id_seq'::regclass) |
| 2 | `tracking_no` | bigint |  |  |
| 3 | `permittype` | character varying |  |  |
| 4 | `permitdate` | date |  |  |
| 5 | `permitnumber` | character varying |  |  |

<a id="mviewdownload-public-well_count"></a>
#### `public.well_count`  (table)

- **Estimated rows:** n/a
- **What it holds:** Aggregated well counts (11 cols) — e.g. by county/operator.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('well_count_id_seq'::regclass) |
| 2 | `completionrecords` | integer |  |  |
| 3 | `permitrecords` | integer |  |  |
| 4 | `casingrecords` | integer |  |  |
| 5 | `testrecords` | integer |  |  |
| 6 | `county` | character varying |  |  |
| 7 | `wells` | numeric |  |  |
| 8 | `producing_well` | integer |  |  |
| 9 | `oil_production` | character varying |  |  |
| 10 | `gas_production` | character varying |  |  |
| 11 | `mongomonthlyproductioncount` | integer |  |  |

<a id="mviewdownload-public-well_count_new"></a>
#### `public.well_count_new`  (table)

- **Estimated rows:** 277
- **What it holds:** Newer aggregated well counts (8 cols).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('well_count_new_id_seq'::regclass) |
| 2 | `completionrecords` | integer |  |  |
| 3 | `permitrecords` | integer |  |  |
| 4 | `casingrecords` | integer |  |  |
| 5 | `testrecords` | integer |  |  |
| 6 | `county` | character varying |  |  |
| 7 | `wells` | numeric |  |  |
| 8 | `producing_well` | integer |  |  |

### Schema: `rrc_og_production`  ·  5 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`gp_county`](#mviewdownload-rrc_og_production-gp_county) | table | n/a | 8 | RRC county reference (number, FIPS, district, onshore flags). |
| [`og_lease_cycle_disposition_dec_2025`](#mviewdownload-rrc_og_production-og_lease_cycle_disposition_dec_2025) | table | 47,519,472 | 52 | RRC lease-cycle disposition volumes (Dec 2025): oil/gas/condensate/casinghead volumes by disposition code. |
| [`og_lease_cycle_production_dec_2025`](#mviewdownload-rrc_og_production-og_lease_cycle_production_dec_2025) | table | 76,710,272 | 32 | RRC lease-cycle production volumes (Dec 2025): oil/gas/condensate/casinghead production, allowables and balances. |
| [`og_wellbore_ewa`](#mviewdownload-rrc_og_production-og_wellbore_ewa) | table | 1,350,857 | 60 | RRC wellbore 'EWA' master (60 cols): well status, plugging, permits, P5 renewal and 14(b)2 inactivity flags. |
| [`well_status_history`](#mviewdownload-rrc_og_production-well_status_history) | table | 0 | 61 | Historical well-status snapshots (61 cols) mirroring the wellbore EWA fields plus source file & timestamp. |

<a id="mviewdownload-rrc_og_production-gp_county"></a>
#### `rrc_og_production.gp_county`  (table)

- **Estimated rows:** n/a
- **What it holds:** RRC county reference (number, FIPS, district, onshore flags).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county_no` | character varying(3) |  |  |
| 2 | `county_fips_code` | character varying(3) |  |  |
| 3 | `county_name` | character varying(50) |  |  |
| 4 | `district_no` | character varying(2) |  |  |
| 5 | `district_name` | character varying(2) |  |  |
| 6 | `on_shore_flag` | character varying(1) |  |  |
| 7 | `onshore_assc_cnty_flag` | character varying(1) |  |  |
| 8 | `id` | integer |  |  |

<a id="mviewdownload-rrc_og_production-og_lease_cycle_disposition_dec_2025"></a>
#### `rrc_og_production.og_lease_cycle_disposition_dec_2025`  (table)

- **Estimated rows:** 47,519,472
- **What it holds:** RRC lease-cycle disposition volumes (Dec 2025): oil/gas/condensate/casinghead volumes by disposition code.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oil_gas_code` | character varying(1) |  |  |
| 2 | `district_no` | character varying(2) |  |  |
| 3 | `lease_no` | character varying(6) |  |  |
| 4 | `cycle_year` | character varying(4) |  |  |
| 5 | `cycle_month` | character varying(2) |  |  |
| 6 | `operator_no` | character varying(6) |  |  |
| 7 | `field_no` | character varying(8) |  |  |
| 8 | `cycle_year_month` | character varying(6) |  |  |
| 9 | `lease_oil_dispcd00_vol` | integer |  |  |
| 10 | `lease_oil_dispcd01_vol` | integer |  |  |
| 11 | `lease_oil_dispcd02_vol` | integer |  |  |
| 12 | `lease_oil_dispcd03_vol` | integer |  |  |
| 13 | `lease_oil_dispcd04_vol` | integer |  |  |
| 14 | `lease_oil_dispcd05_vol` | integer |  |  |
| 15 | `lease_oil_dispcd06_vol` | integer |  |  |
| 16 | `lease_oil_dispcd07_vol` | integer |  |  |
| 17 | `lease_oil_dispcd08_vol` | integer |  |  |
| 18 | `lease_oil_dispcd09_vol` | integer |  |  |
| 19 | `lease_oil_dispcd99_vol` | integer |  |  |
| 20 | `lease_gas_dispcd01_vol` | integer |  |  |
| 21 | `lease_gas_dispcd02_vol` | integer |  |  |
| 22 | `lease_gas_dispcd03_vol` | integer |  |  |
| 23 | `lease_gas_dispcd04_vol` | integer |  |  |
| 24 | `lease_gas_dispcd05_vol` | integer |  |  |
| 25 | `lease_gas_dispcd06_vol` | integer |  |  |
| 26 | `lease_gas_dispcd07_vol` | integer |  |  |
| 27 | `lease_gas_dispcd08_vol` | integer |  |  |
| 28 | `lease_gas_dispcd09_vol` | integer |  |  |
| 29 | `lease_gas_dispcd99_vol` | integer |  |  |
| 30 | `lease_cond_dispcd00_vol` | integer |  |  |
| 31 | `lease_cond_dispcd01_vol` | integer |  |  |
| 32 | `lease_cond_dispcd02_vol` | integer |  |  |
| 33 | `lease_cond_dispcd03_vol` | integer |  |  |
| 34 | `lease_cond_dispcd04_vol` | integer |  |  |
| 35 | `lease_cond_dispcd05_vol` | integer |  |  |
| 36 | `lease_cond_dispcd06_vol` | integer |  |  |
| 37 | `lease_cond_dispcd07_vol` | integer |  |  |
| 38 | `lease_cond_dispcd08_vol` | integer |  |  |
| 39 | `lease_cond_dispcd99_vol` | integer |  |  |
| 40 | `lease_csgd_dispcde01_vol` | integer |  |  |
| 41 | `lease_csgd_dispcde02_vol` | integer |  |  |
| 42 | `lease_csgd_dispcde03_vol` | integer |  |  |
| 43 | `lease_csgd_dispcde04_vol` | integer |  |  |
| 44 | `lease_csgd_dispcde05_vol` | integer |  |  |
| 45 | `lease_csgd_dispcde06_vol` | integer |  |  |
| 46 | `lease_csgd_dispcde07_vol` | integer |  |  |
| 47 | `lease_csgd_dispcde08_vol` | integer |  |  |
| 48 | `lease_csgd_dispcde99_vol` | integer |  |  |
| 49 | `district_name` | character varying(2) |  |  |
| 50 | `lease_name` | character varying(50) |  |  |
| 51 | `operator_name` | character varying(50) |  |  |
| 52 | `field_name` | character varying(50) |  |  |

<a id="mviewdownload-rrc_og_production-og_lease_cycle_production_dec_2025"></a>
#### `rrc_og_production.og_lease_cycle_production_dec_2025`  (table)

- **Estimated rows:** 76,710,272
- **What it holds:** RRC lease-cycle production volumes (Dec 2025): oil/gas/condensate/casinghead production, allowables and balances.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oil_gas_code` | character varying(1) |  |  |
| 2 | `district_no` | character varying(2) |  |  |
| 3 | `lease_no` | character varying(6) |  |  |
| 4 | `cycle_year` | character varying(4) |  |  |
| 5 | `cycle_month` | character varying(2) |  |  |
| 6 | `cycle_year_month` | character varying(6) |  |  |
| 7 | `lease_no_district_no` | bigint |  |  |
| 8 | `operator_no` | character varying(6) |  |  |
| 9 | `field_no` | character varying(8) |  |  |
| 10 | `field_type` | character varying(2) |  |  |
| 11 | `gas_well_no` | character varying(6) |  |  |
| 12 | `prod_report_filed_flag` | character varying(1) |  |  |
| 13 | `lease_oil_prod_vol` | integer |  |  |
| 14 | `lease_oil_allow` | integer |  |  |
| 15 | `lease_oil_ending_bal` | integer |  |  |
| 16 | `lease_gas_prod_vol` | integer |  |  |
| 17 | `lease_gas_allow` | integer |  |  |
| 18 | `lease_gas_lift_inj_vol` | integer |  |  |
| 19 | `lease_cond_prod_vol` | integer |  |  |
| 20 | `lease_cond_limit` | integer |  |  |
| 21 | `lease_cond_ending_bal` | integer |  |  |
| 22 | `lease_csgd_prod_vol` | integer |  |  |
| 23 | `lease_csgd_limit` | integer |  |  |
| 24 | `lease_csgd_gas_lift` | integer |  |  |
| 25 | `lease_oil_tot_disp` | integer |  |  |
| 26 | `lease_gas_tot_disp` | integer |  |  |
| 27 | `lease_cond_tot_disp` | integer |  |  |
| 28 | `lease_csgd_tot_disp` | integer |  |  |
| 29 | `district_name` | character varying(2) |  |  |
| 30 | `lease_name` | character varying(50) |  |  |
| 31 | `operator_name` | character varying(50) |  |  |
| 32 | `field_name` | character varying(32) |  |  |

<a id="mviewdownload-rrc_og_production-og_wellbore_ewa"></a>
#### `rrc_og_production.og_wellbore_ewa`  (table)

- **Estimated rows:** 1,350,857
- **What it holds:** RRC wellbore 'EWA' master (60 cols): well status, plugging, permits, P5 renewal and 14(b)2 inactivity flags.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `district_code` | character varying(3) |  |  |
| 2 | `county_code` | character varying(3) |  |  |
| 3 | `api_no` | character varying(14) |  |  |
| 4 | `county_name` | character varying(50) |  |  |
| 5 | `oil_gas_code` | character varying(1) |  |  |
| 6 | `lease_name` | character varying(1000) |  |  |
| 7 | `field_number` | character varying(10) |  |  |
| 8 | `field_name` | character varying(50) |  |  |
| 9 | `lease_number` | character varying(10) |  |  |
| 10 | `well_no_display` | character varying(1000) |  |  |
| 11 | `oil_unit_number` | character varying |  |  |
| 12 | `operator_name` | character varying(50) |  |  |
| 13 | `operator_number` | character varying(10) |  |  |
| 14 | `wb_water_land_code` | character varying(50) |  |  |
| 15 | `multi_comp_flag` | character varying(50) |  |  |
| 16 | `api_depth` | character varying(500) |  |  |
| 17 | `wb_shut_in_date` | character varying(500) |  |  |
| 18 | `wb_14b2_flag` | character varying(3) |  |  |
| 19 | `well_type_name` | character varying(50) |  |  |
| 20 | `wl_shut_in_date` | character varying(500) |  |  |
| 21 | `plug_date` | character varying(500) |  |  |
| 22 | `plug_lease_name` | character varying(500) |  |  |
| 23 | `plug_operator_name` | character varying(500) |  |  |
| 24 | `recent_permit` | character varying(500) |  |  |
| 25 | `recent_permit_lease_name` | character varying(500) |  |  |
| 26 | `recent_permit_operator_no` | character varying(500) |  |  |
| 27 | `on_schedule` | character varying(500) |  |  |
| 28 | `og_wellbore_ewa_id` | character varying(500) |  |  |
| 29 | `w2_g1_filled_date` | character varying(500) |  |  |
| 30 | `w2_g1_date` | character varying(500) |  |  |
| 31 | `completion_date` | character varying(500) |  |  |
| 32 | `w3_file_date` | character varying(500) |  |  |
| 33 | `created_by` | character varying(500) |  |  |
| 34 | `created_dt` | character varying(500) |  |  |
| 35 | `modified_by` | character varying(500) |  |  |
| 36 | `modified_dt` | character varying(500) |  |  |
| 37 | `well_no` | character varying(500) |  |  |
| 38 | `p5_renewal_month` | character varying(500) |  |  |
| 39 | `p5_renewal_year` | character varying(500) |  |  |
| 40 | `p5_org_status` | character varying(500) |  |  |
| 41 | `curr_inact_yrs` | character varying(500) |  |  |
| 42 | `curr_inact_mos` | character varying(500) |  |  |
| 43 | `wl_14b2_ext_status` | character varying(500) |  |  |
| 44 | `wl_14b2_mech_integ` | character varying(500) |  |  |
| 45 | `wl_14b2_plg_ord_sf` | character varying(500) |  |  |
| 46 | `wl_14b2_pollution` | character varying(500) |  |  |
| 47 | `wl_14b2_fldops_hold` | character varying(500) |  |  |
| 48 | `wl_14b2_h15_prob` | character varying(500) |  |  |
| 49 | `wl_14b2_h15_delq` | character varying(500) |  |  |
| 50 | `wl_14b2_oper_delq` | character varying(500) |  |  |
| 51 | `wl_14b2_dist_sfp` | character varying(500) |  |  |
| 52 | `wl_14b2_dist_sf_clnup` | character varying(500) |  |  |
| 53 | `wl_14b2_dist_st_plg` | character varying(500) |  |  |
| 54 | `wl_14b2_good_faith` | character varying(500) |  |  |
| 55 | `wl_14b2_well_other` | character varying(500) |  |  |
| 56 | `surf_eqp_viol` | character varying(500) |  |  |
| 57 | `w3x_viol` | character varying(500) |  |  |
| 58 | `h15_status_code` | character varying(500) |  |  |
| 59 | `orig_completion_dt` | character varying(500) |  |  |
| 60 | `new_api` | character varying |  |  |

<a id="mviewdownload-rrc_og_production-well_status_history"></a>
#### `rrc_og_production.well_status_history`  (table)

- **Estimated rows:** 0
- **What it holds:** Historical well-status snapshots (61 cols) mirroring the wellbore EWA fields plus source file & timestamp.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `district_code` | character varying(3) |  |  |
| 2 | `county_code` | character varying(3) |  |  |
| 3 | `api_no` | character varying(14) |  |  |
| 4 | `county_name` | character varying(50) |  |  |
| 5 | `oil_gas_code` | character varying(1) |  |  |
| 6 | `lease_name` | character varying(1000) |  |  |
| 7 | `field_number` | character varying(10) |  |  |
| 8 | `field_name` | character varying(50) |  |  |
| 9 | `lease_number` | character varying(10) |  |  |
| 10 | `well_no_display` | character varying(1000) |  |  |
| 11 | `oil_unit_number` | character varying |  |  |
| 12 | `operator_name` | character varying(50) |  |  |
| 13 | `operator_number` | character varying(10) |  |  |
| 14 | `wb_water_land_code` | character varying(50) |  |  |
| 15 | `multi_comp_flag` | character varying(50) |  |  |
| 16 | `api_depth` | character varying(500) |  |  |
| 17 | `wb_shut_in_date` | character varying(500) |  |  |
| 18 | `wb_14b2_flag` | character varying(3) |  |  |
| 19 | `well_type_name` | character varying(50) |  |  |
| 20 | `wl_shut_in_date` | character varying(500) |  |  |
| 21 | `plug_date` | character varying(500) |  |  |
| 22 | `plug_lease_name` | character varying(500) |  |  |
| 23 | `plug_operator_name` | character varying(500) |  |  |
| 24 | `recent_permit` | character varying(500) |  |  |
| 25 | `recent_permit_lease_name` | character varying(500) |  |  |
| 26 | `recent_permit_operator_no` | character varying(500) |  |  |
| 27 | `on_schedule` | character varying(500) |  |  |
| 28 | `og_wellbore_ewa_id` | character varying(500) |  |  |
| 29 | `w2_g1_filled_date` | character varying(500) |  |  |
| 30 | `w2_g1_date` | character varying(500) |  |  |
| 31 | `completion_date` | character varying(500) |  |  |
| 32 | `w3_file_date` | character varying(500) |  |  |
| 33 | `created_by` | character varying(500) |  |  |
| 34 | `created_dt` | character varying(500) |  |  |
| 35 | `modified_by` | character varying(500) |  |  |
| 36 | `modified_dt` | character varying(500) |  |  |
| 37 | `well_no` | character varying(500) |  |  |
| 38 | `p5_renewal_month` | character varying(500) |  |  |
| 39 | `p5_renewal_year` | character varying(500) |  |  |
| 40 | `p5_org_status` | character varying(500) |  |  |
| 41 | `curr_inact_yrs` | character varying(500) |  |  |
| 42 | `curr_inact_mos` | character varying(500) |  |  |
| 43 | `wl_14b2_ext_status` | character varying(500) |  |  |
| 44 | `wl_14b2_mech_integ` | character varying(500) |  |  |
| 45 | `wl_14b2_plg_ord_sf` | character varying(500) |  |  |
| 46 | `wl_14b2_pollution` | character varying(500) |  |  |
| 47 | `wl_14b2_fldops_hold` | character varying(500) |  |  |
| 48 | `wl_14b2_h15_prob` | character varying(500) |  |  |
| 49 | `wl_14b2_h15_delq` | character varying(500) |  |  |
| 50 | `wl_14b2_oper_delq` | character varying(500) |  |  |
| 51 | `wl_14b2_dist_sfp` | character varying(500) |  |  |
| 52 | `wl_14b2_dist_sf_clnup` | character varying(500) |  |  |
| 53 | `wl_14b2_dist_st_plg` | character varying(500) |  |  |
| 54 | `wl_14b2_good_faith` | character varying(500) |  |  |
| 55 | `wl_14b2_well_other` | character varying(500) |  |  |
| 56 | `surf_eqp_viol` | character varying(500) |  |  |
| 57 | `w3x_viol` | character varying(500) |  |  |
| 58 | `h15_status_code` | character varying(500) |  |  |
| 59 | `orig_completion_dt` | character varying(500) |  |  |
| 60 | `file_name` | text |  |  |
| 61 | `create_ts` | date |  |  |

### Schema: `scrapy_data`  ·  27 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`audit_marketdata`](#mviewdownload-scrapy_data-audit_marketdata) | table | 915 | 7 | Audit log of market-data scrape runs (date, timing, success, file URL). |
| [`audit_productpricing`](#mviewdownload-scrapy_data-audit_productpricing) | table | 2,930 | 9 | Audit log of product-pricing scrape runs (month/year, timing, success). |
| [`audit_surfacebottomlocation`](#mviewdownload-scrapy_data-audit_surfacebottomlocation) | table | 61,454 | 8 | Audit log of surface/bottom-hole location scrape runs. |
| [`audit_w1permits`](#mviewdownload-scrapy_data-audit_w1permits) | table | 30,849 | 8 | Audit log of W-1 permit scrape runs (status, snapshot URL, exceptions). |
| [`audit_w2completions`](#mviewdownload-scrapy_data-audit_w2completions) | table | 35,017 | 7 | Audit log of W-2 completion scrape runs (tracking no, timing, status). |
| [`bottomlocation`](#mviewdownload-scrapy_data-bottomlocation) | table | 2,944,479 | 19 | Bottom-hole well locations (NAD27/NAD83 lat-long, API, reliability). |
| [`invalid_data`](#mviewdownload-scrapy_data-invalid_data) | table | 120,788 | 11 | Records flagged invalid during scraping (API, error message, scraper type). |
| [`og_lease_cycle_disposition`](#mviewdownload-scrapy_data-og_lease_cycle_disposition) | table | 151,439 | 53 | RRC lease-cycle disposition volumes (rolling) with record status. |
| [`og_lease_cycle_disposition_dec_2025`](#mviewdownload-scrapy_data-og_lease_cycle_disposition_dec_2025) | table | n/a | 52 | RRC lease-cycle disposition volumes snapshot (Dec 2025). |
| [`og_lease_cycle_production`](#mviewdownload-scrapy_data-og_lease_cycle_production) | table | 703,676 | 33 | RRC lease-cycle production volumes (rolling) with record status. |
| [`og_lease_cycle_production_dec_2025`](#mviewdownload-scrapy_data-og_lease_cycle_production_dec_2025) | table | n/a | 32 | RRC lease-cycle production volumes snapshot (Dec 2025). |
| [`production_county`](#mviewdownload-scrapy_data-production_county) | table | 351,636 | 9 | Per-county lease production totals (oil, casinghead, gas-well gas, condensate). |
| [`production_county_april`](#mviewdownload-scrapy_data-production_county_april) | table | 378,080 | 9 | April per-county lease production totals. |
| [`production_county_nov`](#mviewdownload-scrapy_data-production_county_nov) | table | 369,492 | 9 | November per-county lease production totals. |
| [`scrape_session_log`](#mviewdownload-scrapy_data-scrape_session_log) | table | 38,344 | 7 | Scrape session log (records pulled vs needed, success, scraper type). |
| [`scraper_exception_log`](#mviewdownload-scrapy_data-scraper_exception_log) | table | n/a | 8 | Scraper exception log (process, exception text, tracking/status). |
| [`scraper_exceptions`](#mviewdownload-scrapy_data-scraper_exceptions) | table | n/a | 10 | Scraper exceptions per API/tracking with text and timestamp. |
| [`scraper_process_log`](#mviewdownload-scrapy_data-scraper_process_log) | table | 1,743 | 8 | Scraper process run log (process code, timing, success, info). |
| [`scrapy_exceptions`](#mviewdownload-scrapy_data-scrapy_exceptions) | table | n/a | 6 | Scrapy framework exceptions (scanlog, scraper type, API, text). |
| [`surfacelocation`](#mviewdownload-scrapy_data-surfacelocation) | table | 2,912,983 | 16 | Surface well locations (NAD27/NAD83 lat-long, API, reliability). |
| [`w2_acidfracture`](#mviewdownload-scrapy_data-w2_acidfracture) | table | 312,462 | 8 | W-2 acid/hydraulic-fracture treatment data (pressures, SWR29 flag). |
| [`w2_casingrecords`](#mviewdownload-scrapy_data-w2_casingrecords) | table | 793,898 | 14 | W-2 casing records (type, size, depths, cement details). |
| [`w2_fielddata_pressurecalculations`](#mviewdownload-scrapy_data-w2_fielddata_pressurecalculations) | table | 312,460 | 9 | W-2 field pressure calculations (gravities, shut-in temp, bottom-hole temp). |
| [`w2_linearrecords`](#mviewdownload-scrapy_data-w2_linearrecords) | table | 47,773 | 11 | W-2 liner records (size, depths, cement details). |
| [`w2_remarks`](#mviewdownload-scrapy_data-w2_remarks) | table | 337,289 | 3 | W-2 free-text remarks per tracking number. |
| [`w2_tubingrecords`](#mviewdownload-scrapy_data-w2_tubingrecords) | table | 288,744 | 5 | W-2 tubing records (size, depth, packer depth). |
| [`well_location`](#mviewdownload-scrapy_data-well_location) | table | 378 | 3 | Well location file references (surface/bottom filenames). |

<a id="mviewdownload-scrapy_data-audit_marketdata"></a>
#### `scrapy_data.audit_marketdata`  (table)

- **Estimated rows:** 915
- **Primary key:** `id`
- **What it holds:** Audit log of market-data scrape runs (date, timing, success, file URL).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('audit_marketdata_id_seq'::regclass) |
| 2 | `scanlog_id` | integer |  |  |
| 3 | `market_date` | timestamp without time zone |  |  |
| 4 | `start_time` | timestamp without time zone |  |  |
| 5 | `end_time` | timestamp without time zone |  |  |
| 6 | `success` | boolean |  |  |
| 7 | `file_url` | character varying |  |  |

<a id="mviewdownload-scrapy_data-audit_productpricing"></a>
#### `scrapy_data.audit_productpricing`  (table)

- **Estimated rows:** 2,930
- **Primary key:** `id`
- **What it holds:** Audit log of product-pricing scrape runs (month/year, timing, success).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('audit_productpricing_id_seq'::regclass) |
| 2 | `scanlog_id` | integer |  |  |
| 3 | `month` | integer |  |  |
| 4 | `year` | integer |  |  |
| 5 | `date` | date |  |  |
| 6 | `start_time` | timestamp without time zone |  |  |
| 7 | `end_time` | timestamp without time zone |  |  |
| 8 | `success` | boolean |  |  |
| 9 | `snapshot_url` | character varying |  |  |

<a id="mviewdownload-scrapy_data-audit_surfacebottomlocation"></a>
#### `scrapy_data.audit_surfacebottomlocation`  (table)

- **Estimated rows:** 61,454
- **Primary key:** `id`
- **What it holds:** Audit log of surface/bottom-hole location scrape runs.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('audit_surfacebottomlocation_id_seq'::regclass) |
| 2 | `scanlog_id` | integer |  |  |
| 3 | `surfacebottomlocation_id` | integer |  |  |
| 4 | `start_time` | timestamp without time zone |  |  |
| 5 | `end_time` | timestamp without time zone |  |  |
| 6 | `success` | boolean |  |  |
| 7 | `snapshot_url` | character varying |  |  |
| 8 | `well_locationid` | integer |  |  |

<a id="mviewdownload-scrapy_data-audit_w1permits"></a>
#### `scrapy_data.audit_w1permits`  (table)

- **Estimated rows:** 30,849
- **Primary key:** `id`
- **What it holds:** Audit log of W-1 permit scrape runs (status, snapshot URL, exceptions).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('scrapy_data.audit_w1permits_id_seq'::regclass) |
| 2 | `status_number` | character varying |  |  |
| 3 | `status` | character varying |  |  |
| 4 | `snapshot_url` | character varying |  |  |
| 5 | `time` | timestamp without time zone |  |  |
| 6 | `scanlog_id` | integer | ✔ |  |
| 7 | `exceptions` | character varying |  |  |
| 8 | `api_number` | character varying |  |  |

<a id="mviewdownload-scrapy_data-audit_w2completions"></a>
#### `scrapy_data.audit_w2completions`  (table)

- **Estimated rows:** 35,017
- **Primary key:** `id`
- **What it holds:** Audit log of W-2 completion scrape runs (tracking no, timing, status).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('scrapy_data.audit_w2completions_id_seq'::regclass) |
| 2 | `scanlog_id` | integer | ✔ |  |
| 3 | `tracking_no` | integer |  |  |
| 4 | `start_time` | timestamp without time zone |  |  |
| 5 | `end_time` | timestamp without time zone |  |  |
| 6 | `pde_path` | character varying |  |  |
| 7 | `status` | character varying |  |  |

<a id="mviewdownload-scrapy_data-bottomlocation"></a>
#### `scrapy_data.bottomlocation`  (table)

- **Estimated rows:** 2,944,479
- **Primary key:** `id`
- **What it holds:** Bottom-hole well locations (NAD27/NAD83 lat-long, API, reliability).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('bottomlocation_id_seq'::regclass) |
| 2 | `bottomholeid` | character varying |  |  |
| 3 | `surfaceid` | character varying |  |  |
| 4 | `apinumber` | character varying |  |  |
| 5 | `stcode` | character varying |  |  |
| 6 | `wellnumber` | character varying |  |  |
| 7 | `bottomholelatitude27` | character varying |  |  |
| 8 | `bottomholelongitude27` | character varying |  |  |
| 9 | `bottomholelatitude83` | character varying |  |  |
| 10 | `bottomholelongitude83` | character varying |  |  |
| 11 | `well_locationid` | integer |  |  |
| 12 | `symnum` | integer |  |  |
| 13 | `reliab` | integer |  |  |
| 14 | `out_fips` | text |  |  |
| 15 | `radioact` | text |  |  |
| 16 | `wellid` | text |  |  |
| 17 | `xnad27` | character varying |  |  |
| 18 | `ynad27` | character varying |  |  |
| 19 | `updated_date` | date |  |  |

<a id="mviewdownload-scrapy_data-invalid_data"></a>
#### `scrapy_data.invalid_data`  (table)

- **Estimated rows:** 120,788
- **What it holds:** Records flagged invalid during scraping (API, error message, scraper type).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('invalid_data_id_seq'::regclass) |
| 2 | `api_number` | character varying | ✔ |  |
| 3 | `scanlog_id` | integer | ✔ |  |
| 4 | `scraper_type` | integer |  |  |
| 5 | `error_message` | character varying |  |  |
| 6 | `creatts` | date |  |  |
| 7 | `tracking_no` | bigint |  |  |
| 8 | `status_number` | character varying |  |  |
| 9 | `district_code` | character varying |  |  |
| 10 | `lease_number` | integer |  |  |
| 11 | `production_id` | integer |  |  |

<a id="mviewdownload-scrapy_data-og_lease_cycle_disposition"></a>
#### `scrapy_data.og_lease_cycle_disposition`  (table)

- **Estimated rows:** 151,439
- **What it holds:** RRC lease-cycle disposition volumes (rolling) with record status.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oil_gas_code` | character varying(1) |  |  |
| 2 | `district_no` | character varying(2) |  |  |
| 3 | `lease_no` | character varying(6) |  |  |
| 4 | `cycle_year` | character varying(4) |  |  |
| 5 | `cycle_month` | character varying(2) |  |  |
| 6 | `operator_no` | character varying(6) |  |  |
| 7 | `field_no` | character varying(8) |  |  |
| 8 | `cycle_year_month` | character varying(6) |  |  |
| 9 | `lease_oil_dispcd00_vol` | integer |  |  |
| 10 | `lease_oil_dispcd01_vol` | integer |  |  |
| 11 | `lease_oil_dispcd02_vol` | integer |  |  |
| 12 | `lease_oil_dispcd03_vol` | integer |  |  |
| 13 | `lease_oil_dispcd04_vol` | integer |  |  |
| 14 | `lease_oil_dispcd05_vol` | integer |  |  |
| 15 | `lease_oil_dispcd06_vol` | integer |  |  |
| 16 | `lease_oil_dispcd07_vol` | integer |  |  |
| 17 | `lease_oil_dispcd08_vol` | integer |  |  |
| 18 | `lease_oil_dispcd09_vol` | integer |  |  |
| 19 | `lease_oil_dispcd99_vol` | integer |  |  |
| 20 | `lease_gas_dispcd01_vol` | integer |  |  |
| 21 | `lease_gas_dispcd02_vol` | integer |  |  |
| 22 | `lease_gas_dispcd03_vol` | integer |  |  |
| 23 | `lease_gas_dispcd04_vol` | integer |  |  |
| 24 | `lease_gas_dispcd05_vol` | integer |  |  |
| 25 | `lease_gas_dispcd06_vol` | integer |  |  |
| 26 | `lease_gas_dispcd07_vol` | integer |  |  |
| 27 | `lease_gas_dispcd08_vol` | integer |  |  |
| 28 | `lease_gas_dispcd09_vol` | integer |  |  |
| 29 | `lease_gas_dispcd99_vol` | integer |  |  |
| 30 | `lease_cond_dispcd00_vol` | integer |  |  |
| 31 | `lease_cond_dispcd01_vol` | integer |  |  |
| 32 | `lease_cond_dispcd02_vol` | integer |  |  |
| 33 | `lease_cond_dispcd03_vol` | integer |  |  |
| 34 | `lease_cond_dispcd04_vol` | integer |  |  |
| 35 | `lease_cond_dispcd05_vol` | integer |  |  |
| 36 | `lease_cond_dispcd06_vol` | integer |  |  |
| 37 | `lease_cond_dispcd07_vol` | integer |  |  |
| 38 | `lease_cond_dispcd08_vol` | integer |  |  |
| 39 | `lease_cond_dispcd99_vol` | integer |  |  |
| 40 | `lease_csgd_dispcde01_vol` | integer |  |  |
| 41 | `lease_csgd_dispcde02_vol` | integer |  |  |
| 42 | `lease_csgd_dispcde03_vol` | integer |  |  |
| 43 | `lease_csgd_dispcde04_vol` | integer |  |  |
| 44 | `lease_csgd_dispcde05_vol` | integer |  |  |
| 45 | `lease_csgd_dispcde06_vol` | integer |  |  |
| 46 | `lease_csgd_dispcde07_vol` | integer |  |  |
| 47 | `lease_csgd_dispcde08_vol` | integer |  |  |
| 48 | `lease_csgd_dispcde99_vol` | integer |  |  |
| 49 | `district_name` | character varying(2) |  |  |
| 50 | `lease_name` | character varying(50) |  |  |
| 51 | `operator_name` | character varying(50) |  |  |
| 52 | `field_name` | character varying(50) |  |  |
| 53 | `record_status` | character varying(50) |  |  |

<a id="mviewdownload-scrapy_data-og_lease_cycle_disposition_dec_2025"></a>
#### `scrapy_data.og_lease_cycle_disposition_dec_2025`  (table)

- **Estimated rows:** n/a
- **What it holds:** RRC lease-cycle disposition volumes snapshot (Dec 2025).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oil_gas_code` | character varying(1) |  |  |
| 2 | `district_no` | character varying(2) |  |  |
| 3 | `lease_no` | character varying(6) |  |  |
| 4 | `cycle_year` | character varying(4) |  |  |
| 5 | `cycle_month` | character varying(2) |  |  |
| 6 | `operator_no` | character varying(6) |  |  |
| 7 | `field_no` | character varying(8) |  |  |
| 8 | `cycle_year_month` | character varying(6) |  |  |
| 9 | `lease_oil_dispcd00_vol` | integer |  |  |
| 10 | `lease_oil_dispcd01_vol` | integer |  |  |
| 11 | `lease_oil_dispcd02_vol` | integer |  |  |
| 12 | `lease_oil_dispcd03_vol` | integer |  |  |
| 13 | `lease_oil_dispcd04_vol` | integer |  |  |
| 14 | `lease_oil_dispcd05_vol` | integer |  |  |
| 15 | `lease_oil_dispcd06_vol` | integer |  |  |
| 16 | `lease_oil_dispcd07_vol` | integer |  |  |
| 17 | `lease_oil_dispcd08_vol` | integer |  |  |
| 18 | `lease_oil_dispcd09_vol` | integer |  |  |
| 19 | `lease_oil_dispcd99_vol` | integer |  |  |
| 20 | `lease_gas_dispcd01_vol` | integer |  |  |
| 21 | `lease_gas_dispcd02_vol` | integer |  |  |
| 22 | `lease_gas_dispcd03_vol` | integer |  |  |
| 23 | `lease_gas_dispcd04_vol` | integer |  |  |
| 24 | `lease_gas_dispcd05_vol` | integer |  |  |
| 25 | `lease_gas_dispcd06_vol` | integer |  |  |
| 26 | `lease_gas_dispcd07_vol` | integer |  |  |
| 27 | `lease_gas_dispcd08_vol` | integer |  |  |
| 28 | `lease_gas_dispcd09_vol` | integer |  |  |
| 29 | `lease_gas_dispcd99_vol` | integer |  |  |
| 30 | `lease_cond_dispcd00_vol` | integer |  |  |
| 31 | `lease_cond_dispcd01_vol` | integer |  |  |
| 32 | `lease_cond_dispcd02_vol` | integer |  |  |
| 33 | `lease_cond_dispcd03_vol` | integer |  |  |
| 34 | `lease_cond_dispcd04_vol` | integer |  |  |
| 35 | `lease_cond_dispcd05_vol` | integer |  |  |
| 36 | `lease_cond_dispcd06_vol` | integer |  |  |
| 37 | `lease_cond_dispcd07_vol` | integer |  |  |
| 38 | `lease_cond_dispcd08_vol` | integer |  |  |
| 39 | `lease_cond_dispcd99_vol` | integer |  |  |
| 40 | `lease_csgd_dispcde01_vol` | integer |  |  |
| 41 | `lease_csgd_dispcde02_vol` | integer |  |  |
| 42 | `lease_csgd_dispcde03_vol` | integer |  |  |
| 43 | `lease_csgd_dispcde04_vol` | integer |  |  |
| 44 | `lease_csgd_dispcde05_vol` | integer |  |  |
| 45 | `lease_csgd_dispcde06_vol` | integer |  |  |
| 46 | `lease_csgd_dispcde07_vol` | integer |  |  |
| 47 | `lease_csgd_dispcde08_vol` | integer |  |  |
| 48 | `lease_csgd_dispcde99_vol` | integer |  |  |
| 49 | `district_name` | character varying(2) |  |  |
| 50 | `lease_name` | character varying(50) |  |  |
| 51 | `operator_name` | character varying(50) |  |  |
| 52 | `field_name` | character varying(50) |  |  |

<a id="mviewdownload-scrapy_data-og_lease_cycle_production"></a>
#### `scrapy_data.og_lease_cycle_production`  (table)

- **Estimated rows:** 703,676
- **What it holds:** RRC lease-cycle production volumes (rolling) with record status.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oil_gas_code` | character varying(1) |  |  |
| 2 | `district_no` | character varying(2) |  |  |
| 3 | `lease_no` | character varying(6) |  |  |
| 4 | `cycle_year` | character varying(4) |  |  |
| 5 | `cycle_month` | character varying(2) |  |  |
| 6 | `cycle_year_month` | character varying(6) |  |  |
| 7 | `lease_no_district_no` | bigint |  |  |
| 8 | `operator_no` | character varying(6) |  |  |
| 9 | `field_no` | character varying(8) |  |  |
| 10 | `field_type` | character varying(2) |  |  |
| 11 | `gas_well_no` | character varying(6) |  |  |
| 12 | `prod_report_filed_flag` | character varying(1) |  |  |
| 13 | `lease_oil_prod_vol` | integer |  |  |
| 14 | `lease_oil_allow` | integer |  |  |
| 15 | `lease_oil_ending_bal` | integer |  |  |
| 16 | `lease_gas_prod_vol` | integer |  |  |
| 17 | `lease_gas_allow` | integer |  |  |
| 18 | `lease_gas_lift_inj_vol` | integer |  |  |
| 19 | `lease_cond_prod_vol` | integer |  |  |
| 20 | `lease_cond_limit` | integer |  |  |
| 21 | `lease_cond_ending_bal` | integer |  |  |
| 22 | `lease_csgd_prod_vol` | integer |  |  |
| 23 | `lease_csgd_limit` | integer |  |  |
| 24 | `lease_csgd_gas_lift` | integer |  |  |
| 25 | `lease_oil_tot_disp` | integer |  |  |
| 26 | `lease_gas_tot_disp` | integer |  |  |
| 27 | `lease_cond_tot_disp` | integer |  |  |
| 28 | `lease_csgd_tot_disp` | integer |  |  |
| 29 | `district_name` | character varying(2) |  |  |
| 30 | `lease_name` | character varying(50) |  |  |
| 31 | `operator_name` | character varying(50) |  |  |
| 32 | `field_name` | character varying(32) |  |  |
| 33 | `record_status` | character varying(50) |  |  |

<a id="mviewdownload-scrapy_data-og_lease_cycle_production_dec_2025"></a>
#### `scrapy_data.og_lease_cycle_production_dec_2025`  (table)

- **Estimated rows:** n/a
- **What it holds:** RRC lease-cycle production volumes snapshot (Dec 2025).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `oil_gas_code` | character varying(1) |  |  |
| 2 | `district_no` | character varying(2) |  |  |
| 3 | `lease_no` | character varying(6) |  |  |
| 4 | `cycle_year` | character varying(4) |  |  |
| 5 | `cycle_month` | character varying(2) |  |  |
| 6 | `cycle_year_month` | character varying(6) |  |  |
| 7 | `lease_no_district_no` | bigint |  |  |
| 8 | `operator_no` | character varying(6) |  |  |
| 9 | `field_no` | character varying(8) |  |  |
| 10 | `field_type` | character varying(2) |  |  |
| 11 | `gas_well_no` | character varying(6) |  |  |
| 12 | `prod_report_filed_flag` | character varying(1) |  |  |
| 13 | `lease_oil_prod_vol` | integer |  |  |
| 14 | `lease_oil_allow` | integer |  |  |
| 15 | `lease_oil_ending_bal` | integer |  |  |
| 16 | `lease_gas_prod_vol` | integer |  |  |
| 17 | `lease_gas_allow` | integer |  |  |
| 18 | `lease_gas_lift_inj_vol` | integer |  |  |
| 19 | `lease_cond_prod_vol` | integer |  |  |
| 20 | `lease_cond_limit` | integer |  |  |
| 21 | `lease_cond_ending_bal` | integer |  |  |
| 22 | `lease_csgd_prod_vol` | integer |  |  |
| 23 | `lease_csgd_limit` | integer |  |  |
| 24 | `lease_csgd_gas_lift` | integer |  |  |
| 25 | `lease_oil_tot_disp` | integer |  |  |
| 26 | `lease_gas_tot_disp` | integer |  |  |
| 27 | `lease_cond_tot_disp` | integer |  |  |
| 28 | `lease_csgd_tot_disp` | integer |  |  |
| 29 | `district_name` | character varying(2) |  |  |
| 30 | `lease_name` | character varying(50) |  |  |
| 31 | `operator_name` | character varying(50) |  |  |
| 32 | `field_name` | character varying(32) |  |  |

<a id="mviewdownload-scrapy_data-production_county"></a>
#### `scrapy_data.production_county`  (table)

- **Estimated rows:** 351,636
- **Primary key:** `id`
- **What it holds:** Per-county lease production totals (oil, casinghead, gas-well gas, condensate).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('scrapy_data.production_county_id_seq'::regclass) |
| 2 | `lease_name` | character varying |  |  |
| 3 | `lease_number` | character varying |  |  |
| 4 | `county` | character varying |  |  |
| 5 | `district_code` | character varying |  |  |
| 6 | `oil_bbl` | numeric |  |  |
| 7 | `casinghead_mcf` | numeric |  |  |
| 8 | `gw_gas_mcf` | numeric |  |  |
| 9 | `condensate_bbl` | numeric |  |  |

<a id="mviewdownload-scrapy_data-production_county_april"></a>
#### `scrapy_data.production_county_april`  (table)

- **Estimated rows:** 378,080
- **Primary key:** `id`
- **What it holds:** April per-county lease production totals.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('scrapy_data.production_county_april_id_seq'::regclass) |
| 2 | `lease_name` | character varying |  |  |
| 3 | `lease_number` | character varying |  |  |
| 4 | `county` | character varying |  |  |
| 5 | `district_code` | character varying |  |  |
| 6 | `oil_bbl` | numeric |  |  |
| 7 | `casinghead_mcf` | numeric |  |  |
| 8 | `gw_gas_mcf` | numeric |  |  |
| 9 | `condensate_bbl` | numeric |  |  |

<a id="mviewdownload-scrapy_data-production_county_nov"></a>
#### `scrapy_data.production_county_nov`  (table)

- **Estimated rows:** 369,492
- **Primary key:** `id`
- **What it holds:** November per-county lease production totals.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('scrapy_data.production_county_nov_id_seq'::regclass) |
| 2 | `lease_name` | character varying |  |  |
| 3 | `lease_number` | character varying |  |  |
| 4 | `county` | character varying |  |  |
| 5 | `district_code` | character varying |  |  |
| 6 | `oil_bbl` | numeric |  |  |
| 7 | `casinghead_mcf` | numeric |  |  |
| 8 | `gw_gas_mcf` | numeric |  |  |
| 9 | `condensate_bbl` | numeric |  |  |

<a id="mviewdownload-scrapy_data-scrape_session_log"></a>
#### `scrapy_data.scrape_session_log`  (table)

- **Estimated rows:** 38,344
- **Primary key:** `scanlog_id`
- **What it holds:** Scrape session log (records pulled vs needed, success, scraper type).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `scanlog_id` 🔑 | integer | ✔ | nextval('scrapy_data.scrape_session_log_id_seq'::regclass) |
| 2 | `start_time` | timestamp without time zone |  |  |
| 3 | `end_time` | timestamp without time zone |  |  |
| 4 | `success` | boolean |  |  |
| 5 | `totalrecords_pulled` | integer |  |  |
| 6 | `totalrecords_needed` | integer |  |  |
| 7 | `scraper_type` | integer |  |  |

<a id="mviewdownload-scrapy_data-scraper_exception_log"></a>
#### `scrapy_data.scraper_exception_log`  (table)

- **Estimated rows:** n/a
- **What it holds:** Scraper exception log (process, exception text, tracking/status).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('scrapy_data.exceptions_log_id_seq'::regclass) |
| 2 | `process_id` | integer | ✔ |  |
| 3 | `process_code` | character varying |  |  |
| 4 | `exception_date` | date |  |  |
| 5 | `exception_text` | character varying |  |  |
| 6 | `tracking_no` | character varying(50) |  |  |
| 7 | `status_number` | character varying |  |  |
| 8 | `createts` | date |  |  |

<a id="mviewdownload-scrapy_data-scraper_exceptions"></a>
#### `scrapy_data.scraper_exceptions`  (table)

- **Estimated rows:** n/a
- **What it holds:** Scraper exceptions per API/tracking with text and timestamp.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('scrapy_data.exceptions_id_seq'::regclass) |
| 2 | `api_number` | character varying | ✔ |  |
| 3 | `scanlog_id` | integer | ✔ |  |
| 4 | `scraper_type` | integer |  |  |
| 5 | `exception_text` | character varying |  |  |
| 6 | `createts` | date |  |  |
| 7 | `tracking_no` | bigint |  |  |
| 8 | `status_number` | character varying |  |  |
| 9 | `district_code` | character varying |  |  |
| 10 | `lease_number` | integer |  |  |

<a id="mviewdownload-scrapy_data-scraper_process_log"></a>
#### `scrapy_data.scraper_process_log`  (table)

- **Estimated rows:** 1,743
- **Primary key:** `id`
- **What it holds:** Scraper process run log (process code, timing, success, info).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('scrapy_data.process_log_id_seq'::regclass) |
| 2 | `process_date` | date |  |  |
| 3 | `process_code` | character varying(100) |  |  |
| 4 | `start_time` | time without time zone |  |  |
| 5 | `additional_info1` | integer |  |  |
| 6 | `additional_info2` | integer |  |  |
| 7 | `is_success` | boolean |  |  |
| 8 | `end_time` | time without time zone |  |  |

<a id="mviewdownload-scrapy_data-scrapy_exceptions"></a>
#### `scrapy_data.scrapy_exceptions`  (table)

- **Estimated rows:** n/a
- **What it holds:** Scrapy framework exceptions (scanlog, scraper type, API, text).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('scrapy_data.scrapy_exceptions_id_seq'::regclass) |
| 2 | `scanlog_id` | integer | ✔ |  |
| 3 | `scraper_type` | integer |  |  |
| 4 | `api_number` | integer |  |  |
| 5 | `exceptions` | character varying |  |  |
| 6 | `creatts` | date |  |  |

<a id="mviewdownload-scrapy_data-surfacelocation"></a>
#### `scrapy_data.surfacelocation`  (table)

- **Estimated rows:** 2,912,983
- **Primary key:** `id`
- **What it holds:** Surface well locations (NAD27/NAD83 lat-long, API, reliability).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('surfacelocation_id_seq'::regclass) |
| 2 | `surfaceid` | character varying |  |  |
| 3 | `surfacelatitude27` | character varying |  |  |
| 4 | `surfacelongitude27` | character varying |  |  |
| 5 | `bottomholelatitude27` | character varying |  |  |
| 6 | `bottomholelongitude27` | character varying |  |  |
| 7 | `well_locationid` | integer |  |  |
| 8 | `surfacelatitude83` | character varying |  |  |
| 9 | `surfacelongitude83` | character varying |  |  |
| 10 | `apinumber` | character varying |  |  |
| 11 | `symnum` | integer |  |  |
| 12 | `reliab` | integer |  |  |
| 13 | `wellid` | text |  |  |
| 14 | `xnad27` | character varying |  |  |
| 15 | `ynad27` | character varying |  |  |
| 16 | `updated_date` | date |  |  |

<a id="mviewdownload-scrapy_data-w2_acidfracture"></a>
#### `scrapy_data.w2_acidfracture`  (table)

- **Estimated rows:** 312,462
- **Primary key:** `id`
- **What it holds:** W-2 acid/hydraulic-fracture treatment data (pressures, SWR29 flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('acidfracture_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `ishydraulicfracturing` | boolean |  |  |
| 4 | `isdownholeactuationsleeve` | boolean |  |  |
| 5 | `actuationpressure` | double precision |  |  |
| 6 | `psigpriorhydrafracturing` | double precision |  |  |
| 7 | `psigduringhydrafracturing` | double precision |  |  |
| 8 | `isswr29` | boolean |  |  |

<a id="mviewdownload-scrapy_data-w2_casingrecords"></a>
#### `scrapy_data.w2_casingrecords`  (table)

- **Estimated rows:** 793,898
- **Primary key:** `id`
- **What it holds:** W-2 casing records (type, size, depths, cement details).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('casingrecords_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `fieldname` | character varying |  |  |
| 4 | `casingtype` | character varying |  |  |
| 5 | `casingsize` | character varying |  |  |
| 6 | `holesize` | character varying |  |  |
| 7 | `settingdepth` | double precision |  |  |
| 8 | `multistagetooldepth` | double precision |  |  |
| 9 | `multistageshoedepth` | double precision |  |  |
| 10 | `cementclass` | character varying |  |  |
| 11 | `cementamount` | integer |  |  |
| 12 | `slurryvolume` | double precision |  |  |
| 13 | `cementtop` | character varying |  |  |
| 14 | `tocdeterminedby` | character varying |  |  |

<a id="mviewdownload-scrapy_data-w2_fielddata_pressurecalculations"></a>
#### `scrapy_data.w2_fielddata_pressurecalculations`  (table)

- **Estimated rows:** 312,460
- **Primary key:** `id`
- **What it holds:** W-2 field pressure calculations (gravities, shut-in temp, bottom-hole temp).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('fielddata_pressurecalculations_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `gravitydrygas` | double precision |  |  |
| 4 | `gasliquidhydroratio` | integer |  |  |
| 5 | `avgshutintemp` | double precision |  |  |
| 6 | `gravityliquidhydrocarbons` | double precision |  |  |
| 7 | `gravitymixture` | double precision |  |  |
| 8 | `bottomholetempdepth` | double precision |  |  |
| 9 | `tempinft` | character varying |  |  |

<a id="mviewdownload-scrapy_data-w2_linearrecords"></a>
#### `scrapy_data.w2_linearrecords`  (table)

- **Estimated rows:** 47,773
- **Primary key:** `id`
- **What it holds:** W-2 liner records (size, depths, cement details).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('linearrecords_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `linersize` | character varying |  |  |
| 4 | `holesize` | character varying |  |  |
| 5 | `linertop` | double precision |  |  |
| 6 | `linerbottom` | double precision |  |  |
| 7 | `cementclass` | character varying |  |  |
| 8 | `cementamount` | integer |  |  |
| 9 | `slurryvolume` | double precision |  |  |
| 10 | `cementtop` | character varying |  |  |
| 11 | `tocdeterminedby` | character varying |  |  |

<a id="mviewdownload-scrapy_data-w2_remarks"></a>
#### `scrapy_data.w2_remarks`  (table)

- **Estimated rows:** 337,289
- **Primary key:** `id`
- **What it holds:** W-2 free-text remarks per tracking number.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('remarks_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `remarks` | character varying |  |  |

<a id="mviewdownload-scrapy_data-w2_tubingrecords"></a>
#### `scrapy_data.w2_tubingrecords`  (table)

- **Estimated rows:** 288,744
- **Primary key:** `id`
- **What it holds:** W-2 tubing records (size, depth, packer depth).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('tubingrecords_id_seq'::regclass) |
| 2 | `tracking_no` | bigint | ✔ |  |
| 3 | `size` | character varying |  |  |
| 4 | `depthsize` | double precision |  |  |
| 5 | `packerdepthtype` | character varying |  |  |

<a id="mviewdownload-scrapy_data-well_location"></a>
#### `scrapy_data.well_location`  (table)

- **Estimated rows:** 378
- **Primary key:** `id`
- **What it holds:** Well location file references (surface/bottom filenames).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('well_location_id_seq'::regclass) |
| 2 | `surface_filename` | character varying |  |  |
| 3 | `bottom_filename` | character varying |  |  |

---

## Database: `Production`

*Live application database for the MineralView web platform — users, subscriptions, payments, claimed leases, notifications, pricing and operator directories.*

### Schema: `public`  ·  95 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`DailySyncLogs`](#production-public-dailysynclogs) | table | 68,176 | 6 | Log of daily background data-sync jobs per app (start/end time, exception, completed flag). |
| [`Request_order`](#production-public-request_order) | table | 102 | 14 | Customer data-purchase orders: package, pricing/discount, buyer contact, requested data type and request JSON. |
| [`activity_summary`](#production-public-activity_summary) | table | n/a | 11 | Monthly per-county rollups of new permits, completions, production, well-status and operator counts. |
| [`advisor_mineral_owner`](#production-public-advisor_mineral_owner) | table | n/a | 10 | Mineral owners linked to an advisor/member, with address, lease count and MV estimate. |
| [`apilogs`](#production-public-apilogs) | table | 1,073,911 | 12 | API request/response audit log (user, URL, method, payload, status, IP, timing) — ~1M rows. |
| [`blocked_ips`](#production-public-blocked_ips) | table | 963 | 3 | IP addresses blocked from the platform, with block date. |
| [`braintree_payment_response`](#production-public-braintree_payment_response) | table | 0 | 7 | Raw Braintree payment gateway responses keyed by transaction id and email. |
| [`cerebro_users`](#production-public-cerebro_users) | table | n/a | 3 | Internal admin / back-office (Cerebro) user credentials. |
| [`claimed_owners`](#production-public-claimed_owners) | table | 218 | 9 | Mineral owners claimed by members (owner number/name/address, claimed flag, timestamps). |
| [`county_discounts`](#production-public-county_discounts) | table | n/a | 7 | Per-data-type county-bundle discount tiers (5/10/all-county) with images and info text. |
| [`countyplaytypes`](#production-public-countyplaytypes) | table | 123 | 3 | Mapping of play types to counties. |
| [`email_subscribe_users`](#production-public-email_subscribe_users) | table | 18 | 3 | Newsletter/email subscription list (email + signup time). |
| [`email_verification`](#production-public-email_verification) | table | 21 | 11 | Email verification codes and status during signup (code, expiry, attempts, verified flag). |
| [`end_subscription_conversion_log`](#production-public-end_subscription_conversion_log) | table | 1,228 | 3 | Log of members whose subscription ended / converted. |
| [`enterprise_payment_checkout_track`](#production-public-enterprise_payment_checkout_track) | table | n/a | 29 | Step-by-step tracking of enterprise checkout: payment, account creation, email and error stages. |
| [`enterprise_plan_change`](#production-public-enterprise_plan_change) | table | n/a | 15 | Enterprise plan up/downgrade requests with amount, payment and Braintree status. |
| [`enterprise_plan_inquiries`](#production-public-enterprise_plan_inquiries) | table | n/a | 18 | Enterprise sales inquiries (company, contact, team size, message) and resulting payment status. |
| [`enterprise_requirements`](#production-public-enterprise_requirements) | table | n/a | 12 | Feature requirements captured per enterprise inquiry (API access, exports, analytics, claim counts). |
| [`error_log`](#production-public-error_log) | table | 299 | 4 | Application API error log (api name, error text, date). |
| [`exceptions`](#production-public-exceptions) | table | 540 | 5 | Code-level exception log (file, function, error text, time). |
| [`existing_user_claimed_mineral_owners`](#production-public-existing_user_claimed_mineral_owners) | table | n/a | 3 | Flag linking existing users to claimed mineral owners. |
| [`filter_combinations`](#production-public-filter_combinations) | table | 35 | 7 | Saved search-filter combinations per customer (named, active flag, filter JSON). |
| [`geography_columns`](#production-public-geography_columns) | view | n/a | 7 | PostGIS system view of geography columns. |
| [`geometry_columns`](#production-public-geometry_columns) | view | n/a | 7 | PostGIS system view of geometry columns. |
| [`gp_county`](#production-public-gp_county) | table | 277 | 11 | Master list of Texas counties (FIPS, district, onshore flags, description, image). |
| [`impersonation_audit`](#production-public-impersonation_audit) | table | 170 | 7 | Audit trail of admin user-impersonation actions (actor, target, IP, time). |
| [`invitations`](#production-public-invitations) | table | n/a | 7 | User referral/invite records (emails, personal message, lease details, template). |
| [`landing_pages`](#production-public-landing_pages) | table | n/a | 8 | CMS landing pages (slug, meta title/description, HTML content, active flag). |
| [`largesize_purchasedatarequest`](#production-public-largesize_purchasedatarequest) | table | 357 | 10 | Large data-export requests routed to Google Drive (filters, drive link, download count). |
| [`lease_claim_requests`](#production-public-lease_claim_requests) | table | n/a | 16 | Member requests to claim a lease, with contact preferences, status and admin notes. |
| [`leasereportcontent`](#production-public-leasereportcontent) | table | n/a | 4 | Content blocks/feature descriptions used in lease reports. |
| [`masters_entity`](#production-public-masters_entity) | table | 57 | 5 | Generic master/lookup data (entity type, code, name, active flag). |
| [`member_googledrive_folder_id`](#production-public-member_googledrive_folder_id) | table | 115 | 8 | Mapping of members to their Google Drive export folder id/link. |
| [`member_session`](#production-public-member_session) | table | 3,378 | 6 | Active member login sessions (unique id, expiry flag, create time). |
| [`memberleases`](#production-public-memberleases) | table | 330 | 24 | Leases associated to members with interest, MV estimate, tax value, PV10 and watchlist flags. |
| [`members_entity`](#production-public-members_entity) | table | 878 | 43 | Core user/member master (43 cols): identity, contact, credentials, membership plan, subscription and verification data. |
| [`members_entity_backup`](#production-public-members_entity_backup) | table | 681 | 43 | Backup copy of the members_entity user master table. |
| [`membersclaimedleases`](#production-public-membersclaimedleases) | table | 49,180 | 17 | Leases claimed by members with original/modified decimal interest, claim status and owner info. |
| [`memberswatchlistleases`](#production-public-memberswatchlistleases) | table | n/a | 8 | Leases on members' watchlists (lease/district/county, watchlist timestamp). |
| [`mineral_review`](#production-public-mineral_review) | table | n/a | 5 | User-submitted reviews/testimonials (name, email, review text, published flag). |
| [`notification_alert`](#production-public-notification_alert) | table | 29 | 13 | User notification-alert configurations (filters, operators, districts, leases, type, frequency). |
| [`notification_history`](#production-public-notification_history) | table | 13,292 | 6 | History of notifications sent (type, send channel, text, date). |
| [`notification_templates`](#production-public-notification_templates) | table | n/a | 4 | HTML templates and subjects per notification type. |
| [`notification_templates_temp`](#production-public-notification_templates_temp) | table | n/a | 4 | Staging copy of notification templates. |
| [`notificationtypes`](#production-public-notificationtypes) | table | n/a | 3 | Lookup of notification types and whether they are displayed. |
| [`operator_data`](#production-public-operator_data) | table | 28,304 | 8 | Operator directory scraped data (number, name, location, URLs, address, phone). |
| [`operator_data_shalexp`](#production-public-operator_data_shalexp) | table | 32,712 | 5 | Operator data sourced from ShaleXP (name, location, link, address, phone). |
| [`operator_directory`](#production-public-operator_directory) | table | 7,483 | 16 | Structured operator directory (address parts, phone, P5 status, county, logo). |
| [`operatorcountypages_metatitleanddescription`](#production-public-operatorcountypages_metatitleanddescription) | table | 256 | 4 | SEO meta title/description/H1 per operator-county landing page. |
| [`packages`](#production-public-packages) | table | n/a | 9 | Data packages for sale (name, play type, county, cost, discount, map image). |
| [`payment_cancel_process`](#production-public-payment_cancel_process) | table | n/a | 5 | Records of payment cancellation processing per member. |
| [`podcast_info`](#production-public-podcast_info) | table | n/a | 8 | Podcast entries (name, link, description, audience, listen count). |
| [`pricing`](#production-public-pricing) | table | 255 | 23 | Per-county pricing & record counts across all data products (mineral, well info, surveys, formations, reserves, etc.). |
| [`pricing_faq`](#production-public-pricing_faq) | table | n/a | 4 | Pricing-page FAQ entries (question, answer, type). |
| [`pricingmaster`](#production-public-pricingmaster) | table | n/a | 5 | Master price ranges per data type (base price, from/to range). |
| [`professional_claimed_owners`](#production-public-professional_claimed_owners) | table | 98 | 7 | Professional accounts' claimed owner records (owner id, member, active flag). |
| [`purchaseDataSentmailLog`](#production-public-purchasedatasentmaillog) | table | 112 | 3 | Log of purchase-confirmation emails sent. |
| [`purchase_insert_purchaseDataDetails`](#production-public-purchase_insert_purchasedatadetails) | table | 5,589 | 8 | Line items of purchased data (county, record count, price, price type, data type). |
| [`purchase_purchaseDataRequest`](#production-public-purchase_purchasedatarequest) | table | 475 | 67 | Master data-purchase transactions (67 cols): payment, filters (county/lease/API/depth/etc.), drive link and status. |
| [`purchase_user_payment_emails`](#production-public-purchase_user_payment_emails) | table | 199 | 7 | Purchase/payment email bodies and invoice templates per transaction. |
| [`referral_bonus`](#production-public-referral_bonus) | table | n/a | 6 | Referral bonus payouts per member (amount paid, date, referred member ids). |
| [`send_message`](#production-public-send_message) | table | n/a | 9 | Contact-us / message submissions (name, phone, comment, county, page). |
| [`show_functions`](#production-public-show_functions) | view | n/a | 1 | Helper view listing database routine names. |
| [`spatial_ref_sys`](#production-public-spatial_ref_sys) | table | 8,500 | 5 | PostGIS spatial reference system (SRID) definitions. |
| [`sponsored_advertise`](#production-public-sponsored_advertise) | table | 1 | 10 | Sponsored ad slots (vendor, dates, title, creative file, action link, publish flag). |
| [`sub_features`](#production-public-sub_features) | table | n/a | 8 | Subscription feature catalog (code, display text, visibility, active window). |
| [`sub_subfeatures`](#production-public-sub_subfeatures) | table | n/a | 8 | Sub-features under each subscription feature. |
| [`sub_subscription_cancellations`](#production-public-sub_subscription_cancellations) | table | n/a | 5 | Subscription cancellation events (user, subscription, cancellation data). |
| [`sub_subscription_downgrade_requests`](#production-public-sub_subscription_downgrade_requests) | table | n/a | 13 | Subscription downgrade requests with plan dates, status and payment data. |
| [`sub_subscription_plan`](#production-public-sub_subscription_plan) | table | n/a | 10 | Subscription plan definitions (name, plan code, price id, validity, member type). |
| [`sub_subscription_plan_duration`](#production-public-sub_subscription_plan_duration) | table | 685 | 7 | Per-user subscription plan validity windows (start/end, active flag). |
| [`sub_subscription_plan_duration_new`](#production-public-sub_subscription_plan_duration_new) | table | 416 | 7 | Newer version of per-user subscription plan durations. |
| [`sub_subscription_plan_feature_count`](#production-public-sub_subscription_plan_feature_count) | table | 191 | 9 | Access-count limits per plan+feature+sub-feature within a date window. |
| [`sub_subscription_plan_price`](#production-public-sub_subscription_plan_price) | table | n/a | 6 | Subscription plan price history (price, active window). |
| [`sub_user_feature_access_count`](#production-public-sub_user_feature_access_count) | table | 87 | 9 | Live per-user feature access usage counters against plan limits. |
| [`sub_user_feature_access_records`](#production-public-sub_user_feature_access_records) | table | 218 | 10 | Per-user feature access event records (action, date). |
| [`sub_user_payment`](#production-public-sub_user_payment) | table | n/a | 17 | User subscription payments (method, status, amount, Braintree ids, plan change, duration). |
| [`subscription`](#production-public-subscription) | table | n/a | 9 | Legacy subscription products (name, amount, validity, popular/offer flags). |
| [`subscriptionMemberdetails`](#production-public-subscriptionmemberdetails) | table | 842 | 8 | Member-to-subscription assignments with status and start/end dates. |
| [`subscriptionPayment`](#production-public-subscriptionpayment) | table | 150 | 13 | Subscription payment transactions (amount, transaction JSON, discount, cancel flag). |
| [`subscription_checkout_logs`](#production-public-subscription_checkout_logs) | table | 5 | 36 | Detailed subscription checkout attempt logs (36 cols): each step, Braintree ids, success/failure stage and email status. |
| [`subscription_plan_request`](#production-public-subscription_plan_request) | table | n/a | 10 | Subscription plan change requests (duration, amount, change type, processed flag). |
| [`subscription_tools`](#production-public-subscription_tools) | table | n/a | 3 | Reusable HTML snippets/tools for subscription pages. |
| [`subscriptionfeatures`](#production-public-subscriptionfeatures) | table | n/a | 5 | Legacy subscription feature list (name, active flag). |
| [`subscriptionplanfeatures`](#production-public-subscriptionplanfeatures) | table | n/a | 7 | Legacy mapping of features to subscription plans with details. |
| [`subscriptionprices`](#production-public-subscriptionprices) | table | n/a | 8 | Legacy subscription price tiers by duration with discount. |
| [`testusers`](#production-public-testusers) | table | n/a | 2 | Test/QA user email accounts. |
| [`unlimited_access_members`](#production-public-unlimited_access_members) | table | n/a | 1 | List of member ids granted unlimited access. |
| [`user_activity`](#production-public-user_activity) | table | 31,984 | 8 | User activity/feature-usage tracking (feature, sub-feature, metadata, URL, timestamps). |
| [`user_login_activity`](#production-public-user_login_activity) | table | 1,078 | 3 | User login events (email, timestamp). |
| [`user_notification_settings`](#production-public-user_notification_settings) | table | 51 | 11 | Per-user notification preferences per lease (types, county, operator, active flag, send count). |
| [`userbehavior`](#production-public-userbehavior) | table | 372,795 | 10 | Anonymous/visitor behavior tracking (page URLs, referrer, dwell time, mobile flag) — ~370K rows. |
| [`usersearchhistory`](#production-public-usersearchhistory) | table | 425 | 10 | Per-user counts of searches/actions (claims, watchlist, reports, map filters). |
| [`visitor_popups`](#production-public-visitor_popups) | table | 15 | 7 | Visitor pop-up display tracking (count, last session, visit times). |
| [`well_icons`](#production-public-well_icons) | table | 89 | 4 | Map well-icon catalog (description, icon URL). |

<a id="production-public-dailysynclogs"></a>
#### `public.DailySyncLogs`  (table)

- **Estimated rows:** 68,176
- **Primary key:** `id`
- **What it holds:** Log of daily background data-sync jobs per app (start/end time, exception, completed flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('"DailySyncLogs_id_seq"'::regclass) |
| 2 | `App` | character varying(500) | ✔ |  |
| 3 | `StartTime` | timestamp without time zone |  |  |
| 4 | `EndTime` | timestamp without time zone |  |  |
| 5 | `Exception` | character varying |  |  |
| 6 | `iscompleted` | boolean |  |  |

<a id="production-public-request_order"></a>
#### `public.Request_order`  (table)

- **Estimated rows:** 102
- **What it holds:** Customer data-purchase orders: package, pricing/discount, buyer contact, requested data type and request JSON.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('"Request_order_id_seq"'::regclass) |
| 2 | `email_id` | character varying(255) | ✔ |  |
| 3 | `member_id` | numeric |  |  |
| 4 | `original_price` | double precision | ✔ |  |
| 5 | `discount` | double precision |  |  |
| 6 | `discounted_price` | double precision |  |  |
| 7 | `package_name` | character varying(255) |  |  |
| 8 | `phone_number` | character varying(255) |  |  |
| 9 | `comments` | character varying(255) |  |  |
| 10 | `create_ts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 11 | `data_type` | character varying(100) |  |  |
| 12 | `req_json` | json |  |  |
| 13 | `name` | character varying(255) |  |  |
| 14 | `county_total_count` | integer |  |  |

<a id="production-public-activity_summary"></a>
#### `public.activity_summary`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Monthly per-county rollups of new permits, completions, production, well-status and operator counts.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('activity_summary_id_seq'::regclass) |
| 2 | `month` | integer | ✔ |  |
| 3 | `year` | integer | ✔ |  |
| 4 | `county` | character varying(100) | ✔ |  |
| 5 | `new_permit_count` | integer |  | 0 |
| 6 | `new_completion_count` | integer |  | 0 |
| 7 | `new_production_count` | integer |  | 0 |
| 8 | `well_status_count` | integer |  | 0 |
| 9 | `operator_count` | integer |  | 0 |
| 10 | `created_at` | timestamp without time zone |  | now() |
| 11 | `updated_at` | timestamp without time zone |  | now() |

<a id="production-public-advisor_mineral_owner"></a>
#### `public.advisor_mineral_owner`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Mineral owners linked to an advisor/member, with address, lease count and MV estimate.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ |  |
| 2 | `advisorid` | integer |  |  |
| 3 | `member_id` | integer |  |  |
| 4 | `owner_name` | text |  |  |
| 5 | `owner_address` | text |  |  |
| 6 | `owner_city` | text |  |  |
| 7 | `no_of_leases` | integer |  |  |
| 8 | `mvestimate` | numeric(10,2) |  |  |
| 9 | `isactive` | boolean |  | true |
| 10 | `createts` | timestamp with time zone |  | now() |

<a id="production-public-apilogs"></a>
#### `public.apilogs`  (table)

- **Estimated rows:** 1,073,911
- **Primary key:** `id`
- **What it holds:** API request/response audit log (user, URL, method, payload, status, IP, timing) — ~1M rows.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('apilogs_id_seq'::regclass) |
| 2 | `userid` | integer |  |  |
| 3 | `visitorid` | text | ✔ |  |
| 4 | `pageurl` | text | ✔ |  |
| 5 | `httpmethod` | text | ✔ |  |
| 6 | `requestinput` | text | ✔ |  |
| 7 | `responseoutput` | text | ✔ |  |
| 8 | `invoketime` | timestamp without time zone | ✔ |  |
| 9 | `responsetime` | timestamp without time zone | ✔ |  |
| 10 | `statuscode` | integer | ✔ |  |
| 11 | `ipaddress` | text | ✔ |  |
| 12 | `ismobile` | boolean | ✔ | false |

<a id="production-public-blocked_ips"></a>
#### `public.blocked_ips`  (table)

- **Estimated rows:** 963
- **Primary key:** `id`
- **What it holds:** IP addresses blocked from the platform, with block date.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('blocked_ips_id_seq'::regclass) |
| 2 | `ipaddress` | text |  |  |
| 3 | `added_on` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-braintree_payment_response"></a>
#### `public.braintree_payment_response`  (table)

- **Estimated rows:** 0
- **What it holds:** Raw Braintree payment gateway responses keyed by transaction id and email.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('braintree_payment_response_id_seq'::regclass) |
| 2 | `transaction_id` | character varying |  |  |
| 3 | `email_id` | character varying |  |  |
| 4 | `amount` | double precision |  |  |
| 5 | `transaction_data` | character varying |  |  |
| 6 | `transaction_uid` | character varying |  |  |
| 7 | `createts` | date |  |  |

<a id="production-public-cerebro_users"></a>
#### `public.cerebro_users`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Internal admin / back-office (Cerebro) user credentials.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('cerebro_users_id_seq'::regclass) |
| 2 | `email_id` | character varying |  |  |
| 3 | `password` | character varying |  |  |

<a id="production-public-claimed_owners"></a>
#### `public.claimed_owners`  (table)

- **Estimated rows:** 218
- **Primary key:** `id`
- **What it holds:** Mineral owners claimed by members (owner number/name/address, claimed flag, timestamps).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('claimed_owners_id_seq'::regclass) |
| 2 | `member_id` | bigint | ✔ |  |
| 3 | `ownernumber` | character varying(100) |  |  |
| 4 | `ownername` | character varying(255) |  |  |
| 5 | `owneraddress` | text |  |  |
| 6 | `isactive` | boolean |  | false |
| 7 | `created_ts` | timestamp without time zone |  | now() |
| 8 | `updated_ts` | timestamp without time zone |  | now() |
| 9 | `isclaimed` | boolean |  | true |

<a id="production-public-county_discounts"></a>
#### `public.county_discounts`  (table)

- **Estimated rows:** n/a
- **What it holds:** Per-data-type county-bundle discount tiers (5/10/all-county) with images and info text.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('county_discounts_id_seq'::regclass) |
| 2 | `data_type` | character varying |  |  |
| 3 | `fivecountydiscount` | integer |  |  |
| 4 | `tencountydiscount` | integer |  |  |
| 5 | `allcounty_discount` | integer |  |  |
| 6 | `datatype_image` | character varying |  |  |
| 7 | `data_type_info` | character varying |  |  |

<a id="production-public-countyplaytypes"></a>
#### `public.countyplaytypes`  (table)

- **Estimated rows:** 123
- **What it holds:** Mapping of play types to counties.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer |  |  |
| 2 | `playtype_name` | character varying |  |  |
| 3 | `county` | character varying |  |  |

<a id="production-public-email_subscribe_users"></a>
#### `public.email_subscribe_users`  (table)

- **Estimated rows:** 18
- **Primary key:** `serial_number`
- **What it holds:** Newsletter/email subscription list (email + signup time).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `serial_number` 🔑 | integer | ✔ | nextval('email_subscribe_users_serial_number_seq'::regclass) |
| 2 | `create_ts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 3 | `email` | character varying(500) | ✔ |  |

<a id="production-public-email_verification"></a>
#### `public.email_verification`  (table)

- **Estimated rows:** 21
- **Primary key:** `id`
- **What it holds:** Email verification codes and status during signup (code, expiry, attempts, verified flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('email_verification_id_seq'::regclass) |
| 2 | `email` | character varying(255) | ✔ |  |
| 3 | `verification_code` | character varying(10) | ✔ |  |
| 4 | `generated_at` | timestamp without time zone | ✔ | now() |
| 5 | `expires_at` | timestamp without time zone | ✔ |  |
| 6 | `is_verified` | boolean | ✔ | false |
| 7 | `verified_at` | timestamp without time zone |  |  |
| 8 | `attempts` | integer | ✔ | 0 |
| 9 | `created_at` | timestamp without time zone | ✔ | now() |
| 10 | `updated_at` | timestamp without time zone | ✔ | now() |
| 11 | `username` | character varying(255) |  |  |

<a id="production-public-end_subscription_conversion_log"></a>
#### `public.end_subscription_conversion_log`  (table)

- **Estimated rows:** 1,228
- **Primary key:** `id`
- **What it holds:** Log of members whose subscription ended / converted.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('end_subscription_conversion_log_id_seq'::regclass) |
| 2 | `member_id` | text |  |  |
| 3 | `created_at` | timestamp with time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-enterprise_payment_checkout_track"></a>
#### `public.enterprise_payment_checkout_track`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Step-by-step tracking of enterprise checkout: payment, account creation, email and error stages.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('enterprise_payment_checkout_track_id_seq'::regclass) |
| 2 | `inquiry_id` | integer |  |  |
| 3 | `work_email` | character varying(255) |  |  |
| 4 | `full_name` | character varying(255) |  |  |
| 5 | `payment_status` | character varying(20) |  |  |
| 6 | `payment_amount` | numeric(10,2) |  |  |
| 7 | `braintree_transaction_id` | character varying(100) |  |  |
| 8 | `braintree_status` | character varying(50) |  |  |
| 9 | `payment_response` | jsonb |  |  |
| 10 | `payment_error` | text |  |  |
| 11 | `payment_done_at` | timestamp without time zone |  |  |
| 12 | `account_status` | character varying(20) |  |  |
| 13 | `is_new_account` | boolean |  |  |
| 14 | `account_error` | text |  |  |
| 15 | `account_done_at` | timestamp without time zone |  |  |
| 16 | `email_status` | character varying(20) |  |  |
| 17 | `email_type` | character varying(50) |  |  |
| 18 | `email_to` | character varying(255) |  |  |
| 19 | `email_subject` | text |  |  |
| 20 | `email_html` | text |  |  |
| 21 | `email_template_name` | character varying(100) |  |  |
| 22 | `email_error` | text |  |  |
| 23 | `email_sent_at` | timestamp without time zone |  |  |
| 24 | `error_occurred` | boolean |  | false |
| 25 | `error_step` | character varying(50) |  |  |
| 26 | `error_message` | text |  |  |
| 27 | `error_stack` | text |  |  |
| 28 | `created_at` | timestamp without time zone | ✔ | (now() AT TIME ZONE 'UTC'::text) |
| 29 | `updated_at` | timestamp without time zone | ✔ | (now() AT TIME ZONE 'UTC'::text) |

<a id="production-public-enterprise_plan_change"></a>
#### `public.enterprise_plan_change`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Enterprise plan up/downgrade requests with amount, payment and Braintree status.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('enterprise_plan_change_id_seq'::regclass) |
| 2 | `member_id` | integer | ✔ |  |
| 3 | `email` | character varying(255) | ✔ |  |
| 4 | `amount` | numeric(10,2) | ✔ |  |
| 5 | `type` | character varying(20) | ✔ |  |
| 6 | `status` | character varying(20) |  | 'ACTIVE'::character varying |
| 7 | `payment_status` | character varying(50) |  | 'PENDING'::character varying |
| 8 | `payment_processed_date` | timestamp without time zone |  |  |
| 9 | `created_ts` | timestamp without time zone |  | now() |
| 10 | `member_type` | character varying(50) |  |  |
| 11 | `previous_count` | integer |  |  |
| 12 | `new_count` | integer |  |  |
| 13 | `braintree_payment_status` | character varying(255) |  |  |
| 14 | `braintree_transaction_id` | character varying(255) |  |  |
| 15 | `payment_response` | jsonb |  |  |

<a id="production-public-enterprise_plan_inquiries"></a>
#### `public.enterprise_plan_inquiries`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Enterprise sales inquiries (company, contact, team size, message) and resulting payment status.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('enterprise_plan_inquiries_id_seq'::regclass) |
| 2 | `full_name` | character varying(255) | ✔ |  |
| 3 | `company_name` | character varying(255) | ✔ |  |
| 4 | `work_email` | character varying(255) | ✔ |  |
| 5 | `phone_number` | character varying(20) | ✔ |  |
| 6 | `team_size` | character varying(50) | ✔ |  |
| 7 | `message` | text | ✔ |  |
| 8 | `status` | character varying(30) | ✔ | 'NEW'::character varying |
| 9 | `created_at` | timestamp without time zone |  | now() |
| 10 | `member_id` | integer |  |  |
| 11 | `amount` | numeric(12,2) |  |  |
| 12 | `member_type` | character varying(255) |  |  |
| 13 | `braintree_transaction_id` | text |  |  |
| 14 | `braintree_payment_status` | text |  |  |
| 15 | `payment_status` | text |  |  |
| 16 | `payment_response` | jsonb |  |  |
| 17 | `payment_completed_at` | timestamp without time zone |  | now() |
| 18 | `total_amount` | numeric(12,2) |  |  |

<a id="production-public-enterprise_requirements"></a>
#### `public.enterprise_requirements`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Feature requirements captured per enterprise inquiry (API access, exports, analytics, claim counts).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('enterprise_requirements_id_seq'::regclass) |
| 2 | `inquiry_id` | integer | ✔ |  |
| 3 | `api_access` | boolean |  | false |
| 4 | `bulk_data_export` | boolean |  | false |
| 5 | `team_collaboration` | boolean |  | false |
| 6 | `advanced_analytics` | boolean |  | false |
| 7 | `custom_reports` | boolean |  | false |
| 8 | `mineral_management` | boolean |  | false |
| 9 | `operator_data` | boolean |  | false |
| 10 | `created_at` | timestamp without time zone |  | now() |
| 11 | `professional_claim_count` | integer |  | 0 |
| 12 | `mineral_owner_claim_count` | integer |  | 0 |

<a id="production-public-error_log"></a>
#### `public.error_log`  (table)

- **Estimated rows:** 299
- **Primary key:** `id`
- **What it holds:** Application API error log (api name, error text, date).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('error_log_id_seq'::regclass) |
| 2 | `api_name` | character varying |  |  |
| 3 | `error` | character varying |  |  |
| 4 | `date` | timestamp with time zone |  | now() |

<a id="production-public-exceptions"></a>
#### `public.exceptions`  (table)

- **Estimated rows:** 540
- **Primary key:** `id`
- **What it holds:** Code-level exception log (file, function, error text, time).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('exceptions_id_seq'::regclass) |
| 2 | `filename` | character varying(200) |  |  |
| 3 | `functionname` | character varying(200) |  |  |
| 4 | `errortext` | text |  |  |
| 5 | `time` | timestamp without time zone |  | now() |

<a id="production-public-existing_user_claimed_mineral_owners"></a>
#### `public.existing_user_claimed_mineral_owners`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Flag linking existing users to claimed mineral owners.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | bigint | ✔ | nextval('existing_user_claimed_mineral_owners_id_seq'::regclass) |
| 2 | `member_id` | bigint | ✔ |  |
| 3 | `isexistinguser` | boolean | ✔ | false |

<a id="production-public-filter_combinations"></a>
#### `public.filter_combinations`  (table)

- **Estimated rows:** 35
- **What it holds:** Saved search-filter combinations per customer (named, active flag, filter JSON).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('filter_combinations_id_seq'::regclass) |
| 2 | `customer_id` | integer |  |  |
| 3 | `filter_name` | character varying(100) |  |  |
| 4 | `filter_properties` | jsonb |  |  |
| 5 | `isactive` | boolean |  |  |
| 6 | `create_ts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 7 | `update_ts` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-geography_columns"></a>
#### `public.geography_columns`  (view)

- **Estimated rows:** n/a
- **What it holds:** PostGIS system view of geography columns.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `f_table_catalog` | name |  |  |
| 2 | `f_table_schema` | name |  |  |
| 3 | `f_table_name` | name |  |  |
| 4 | `f_geography_column` | name |  |  |
| 5 | `coord_dimension` | integer |  |  |
| 6 | `srid` | integer |  |  |
| 7 | `type` | text |  |  |

<a id="production-public-geometry_columns"></a>
#### `public.geometry_columns`  (view)

- **Estimated rows:** n/a
- **What it holds:** PostGIS system view of geometry columns.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `f_table_catalog` | character varying(256) |  |  |
| 2 | `f_table_schema` | name |  |  |
| 3 | `f_table_name` | name |  |  |
| 4 | `f_geometry_column` | name |  |  |
| 5 | `coord_dimension` | integer |  |  |
| 6 | `srid` | integer |  |  |
| 7 | `type` | character varying(30) |  |  |

<a id="production-public-gp_county"></a>
#### `public.gp_county`  (table)

- **Estimated rows:** 277
- **What it holds:** Master list of Texas counties (FIPS, district, onshore flags, description, image).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county_no` | character varying(3) |  |  |
| 2 | `county_fips_code` | character varying(3) |  |  |
| 3 | `county_name` | character varying(50) |  |  |
| 4 | `district_no` | character varying(2) |  |  |
| 5 | `district_name` | character varying(2) |  |  |
| 6 | `on_shore_flag` | character varying(1) |  |  |
| 7 | `onshore_assc_cnty_flag` | character varying(1) |  |  |
| 8 | `state_name` | character varying |  |  |
| 9 | `is_active` | boolean |  |  |
| 10 | `county_description` | character varying |  |  |
| 11 | `county_img` | character varying |  |  |

<a id="production-public-impersonation_audit"></a>
#### `public.impersonation_audit`  (table)

- **Estimated rows:** 170
- **Primary key:** `id`
- **What it holds:** Audit trail of admin user-impersonation actions (actor, target, IP, time).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('impersonation_audit_id_seq'::regclass) |
| 2 | `actor_member_id` | integer | ✔ |  |
| 3 | `actor_email` | character varying |  |  |
| 4 | `target_member_id` | integer | ✔ |  |
| 5 | `target_member_type` | character varying |  |  |
| 6 | `ip_address` | character varying |  |  |
| 7 | `acted_at` | timestamp without time zone | ✔ | now() |

<a id="production-public-invitations"></a>
#### `public.invitations`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** User referral/invite records (emails, personal message, lease details, template).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('invitations_id_seq'::regclass) |
| 2 | `emails` | jsonb | ✔ |  |
| 3 | `personal_message` | text |  |  |
| 4 | `lease_details` | jsonb | ✔ |  |
| 5 | `inviter_name` | text |  |  |
| 6 | `created_at` | timestamp with time zone |  | now() |
| 7 | `htmltemplate` | text |  |  |

<a id="production-public-landing_pages"></a>
#### `public.landing_pages`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** CMS landing pages (slug, meta title/description, HTML content, active flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('landing_pages_id_seq'::regclass) |
| 2 | `page_slug` | character varying(100) | ✔ |  |
| 3 | `metatitle` | character varying(255) | ✔ |  |
| 4 | `metadesc` | text |  |  |
| 5 | `page_content` | jsonb | ✔ |  |
| 6 | `is_active` | boolean |  | true |
| 7 | `created_at` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 8 | `updated_at` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-largesize_purchasedatarequest"></a>
#### `public.largesize_purchasedatarequest`  (table)

- **Estimated rows:** 357
- **What it holds:** Large data-export requests routed to Google Drive (filters, drive link, download count).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | bigint | ✔ | nextval('datarequest_id_seq'::regclass) |
| 2 | `member_id` | numeric |  |  |
| 3 | `filters` | character varying |  |  |
| 4 | `request_ts` | timestamp without time zone |  |  |
| 5 | `response_ts` | timestamp without time zone |  |  |
| 6 | `data_type` | character varying |  |  |
| 7 | `google_drive_file_link` | character varying |  |  |
| 8 | `is_data_downloaded` | boolean |  |  |
| 9 | `transaction_uid` | character varying |  |  |
| 10 | `datadownload_count` | character varying |  |  |

<a id="production-public-lease_claim_requests"></a>
#### `public.lease_claim_requests`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Member requests to claim a lease, with contact preferences, status and admin notes.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('lease_claim_requests_id_seq'::regclass) |
| 2 | `member_id` | integer |  |  |
| 3 | `lease_info` | text |  |  |
| 4 | `location` | character varying(255) |  |  |
| 5 | `county_id` | integer |  |  |
| 6 | `contact_number` | character varying(20) | ✔ |  |
| 7 | `contact_email` | character varying(255) | ✔ |  |
| 8 | `preferred_call_day` | character varying(50) |  |  |
| 9 | `preferred_call_time` | character varying(50) |  |  |
| 10 | `preferred_communication_type` | character varying(20) |  |  |
| 11 | `message` | text |  |  |
| 12 | `status` | character varying(50) |  | 'pending'::character varying |
| 13 | `created_at` | timestamp without time zone |  | now() |
| 14 | `addressed_by_id` | integer |  |  |
| 15 | `addressed_time` | timestamp without time zone |  |  |
| 16 | `admin_notes` | text |  |  |

<a id="production-public-leasereportcontent"></a>
#### `public.leasereportcontent`  (table)

- **Estimated rows:** n/a
- **What it holds:** Content blocks/feature descriptions used in lease reports.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('leasereportcontent_id_seq'::regclass) |
| 2 | `feature_name` | character varying(100) |  |  |
| 3 | `description` | text |  |  |
| 4 | `create_ts` | timestamp without time zone |  |  |

<a id="production-public-masters_entity"></a>
#### `public.masters_entity`  (table)

- **Estimated rows:** 57
- **Primary key:** `masterdata_id`
- **What it holds:** Generic master/lookup data (entity type, code, name, active flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `masterdata_id` 🔑 | integer | ✔ | nextval('masters_entity_masterdata_id_seq'::regclass) |
| 2 | `entity_type` | character varying(100) |  |  |
| 3 | `code` | character varying(20) |  |  |
| 4 | `name` | character varying(100) |  |  |
| 5 | `isactive` | boolean |  |  |

<a id="production-public-member_googledrive_folder_id"></a>
#### `public.member_googledrive_folder_id`  (table)

- **Estimated rows:** 115
- **What it holds:** Mapping of members to their Google Drive export folder id/link.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('member_googledrive_folder_id_id_seq'::regclass) |
| 2 | `folder_name` | character varying |  |  |
| 3 | `email` | character varying |  |  |
| 4 | `_date` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 5 | `folder_id` | character varying |  |  |
| 6 | `_type` | character varying |  |  |
| 7 | `_link` | character varying |  |  |
| 8 | `status` | character varying |  |  |

<a id="production-public-member_session"></a>
#### `public.member_session`  (table)

- **Estimated rows:** 3,378
- **What it holds:** Active member login sessions (unique id, expiry flag, create time).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('member_session_id_seq'::regclass) |
| 2 | `member_id` | integer |  |  |
| 3 | `email_id` | character varying |  |  |
| 4 | `unic_id` | character varying |  |  |
| 5 | `isexpired` | boolean |  |  |
| 6 | `create_ts` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-memberleases"></a>
#### `public.memberleases`  (table)

- **Estimated rows:** 330
- **Primary key:** `id`
- **What it holds:** Leases associated to members with interest, MV estimate, tax value, PV10 and watchlist flags.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('memberleases_id_seq'::regclass) |
| 2 | `district_code` | character varying |  |  |
| 3 | `lease_number` | character varying |  |  |
| 4 | `lease_name` | character varying(100) |  |  |
| 5 | `member_id` | integer |  |  |
| 6 | `member_name` | character varying(100) |  |  |
| 7 | `member_email_id` | character varying(200) |  |  |
| 8 | `isclaimed` | boolean |  | false |
| 9 | `claimdatetime` | timestamp without time zone |  |  |
| 10 | `decimal_interest` | double precision |  |  |
| 11 | `mvestimate_old` | bigint |  |  |
| 12 | `current_year_tax_value` | bigint |  |  |
| 13 | `leaseinfo_lease_id` | integer |  |  |
| 14 | `group_name` | character varying |  |  |
| 15 | `onwatchlist` | boolean |  | false |
| 16 | `original_interest` | double precision |  |  |
| 17 | `yesterdaysmvestimate` | bigint |  |  |
| 18 | `mvestimateupdatedatetime` | timestamp without time zone |  |  |
| 19 | `oilsoldper` | double precision |  |  |
| 20 | `gassoldper` | double precision |  |  |
| 21 | `pv10` | integer |  |  |
| 22 | `mvestimate` | double precision |  |  |
| 23 | `county` | character varying(100) |  |  |
| 24 | `iswatchlist` | boolean |  |  |

<a id="production-public-members_entity"></a>
#### `public.members_entity`  (table)

- **Estimated rows:** 878
- **Primary key:** `member_id`
- **What it holds:** Core user/member master (43 cols): identity, contact, credentials, membership plan, subscription and verification data.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `member_id` 🔑 | integer | ✔ | nextval('members_entity_member_id_seq'::regclass) |
| 2 | `member_type` | character varying(100) |  |  |
| 3 | `f_name` | character varying(100) |  |  |
| 4 | `l_name` | character varying(100) |  |  |
| 5 | `email_id` | character varying(100) |  |  |
| 6 | `mailing_st_address` | character varying(200) |  |  |
| 7 | `city` | character varying(100) |  |  |
| 8 | `state_master_id` | integer |  |  |
| 9 | `zip_code` | character varying(50) |  |  |
| 10 | `phone_number` | character varying(50) |  |  |
| 11 | `password` | character varying(200) |  |  |
| 12 | `notification_phonenumber` | character varying(50) |  |  |
| 13 | `notification_email` | character varying(100) |  |  |
| 14 | `preference_optioncode` | smallint |  |  |
| 15 | `membership_planid` | smallint |  |  |
| 16 | `membership_expirydate` | timestamp without time zone |  |  |
| 17 | `registration_date` | timestamp without time zone |  |  |
| 18 | `email_verified` | boolean |  | false |
| 19 | `email_verification_code` | character varying(500) |  |  |
| 20 | `email_verification_time` | timestamp without time zone |  |  |
| 21 | `reset_password_token` | character varying(500) |  |  |
| 22 | `reset_password_validity` | timestamp without time zone |  |  |
| 23 | `user_name` | character varying(100) |  |  |
| 24 | `tag_line` | character varying(500) |  |  |
| 25 | `background_image` | character varying(200) |  |  |
| 26 | `otp_verification_code` | character varying(10) |  |  |
| 27 | `ispresentation` | boolean |  |  |
| 28 | `subscriptionid` | integer |  |  |
| 29 | `subscriptionstatus` | character varying |  |  |
| 30 | `issubscriptionpaid` | boolean |  | false |
| 31 | `referal_code` | character varying |  |  |
| 32 | `refered_code` | character varying |  |  |
| 33 | `email_text` | character varying |  |  |
| 34 | `membership_status` | character varying |  |  |
| 35 | `login_type` | character varying |  |  |
| 36 | `login_json` | json |  |  |
| 37 | `isfirstime` | boolean |  | true |
| 38 | `isguide` | boolean |  | false |
| 39 | `isautodebit` | boolean |  | false |
| 40 | `userType` | character varying(50) |  | 'user'::character varying |
| 41 | `ProfileImageUrl` | character varying |  |  |
| 42 | `visitorid` | text |  |  |
| 43 | `startdate` | date |  |  |

<a id="production-public-members_entity_backup"></a>
#### `public.members_entity_backup`  (table)

- **Estimated rows:** 681
- **What it holds:** Backup copy of the members_entity user master table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `member_id` | integer |  |  |
| 2 | `member_type` | character varying(100) |  |  |
| 3 | `f_name` | character varying(100) |  |  |
| 4 | `l_name` | character varying(100) |  |  |
| 5 | `email_id` | character varying(100) |  |  |
| 6 | `mailing_st_address` | character varying(200) |  |  |
| 7 | `city` | character varying(100) |  |  |
| 8 | `state_master_id` | integer |  |  |
| 9 | `zip_code` | character varying(50) |  |  |
| 10 | `phone_number` | character varying(50) |  |  |
| 11 | `password` | character varying(200) |  |  |
| 12 | `notification_phonenumber` | character varying(50) |  |  |
| 13 | `notification_email` | character varying(100) |  |  |
| 14 | `preference_optioncode` | smallint |  |  |
| 15 | `membership_planid` | smallint |  |  |
| 16 | `membership_expirydate` | timestamp without time zone |  |  |
| 17 | `registration_date` | timestamp without time zone |  |  |
| 18 | `email_verified` | boolean |  |  |
| 19 | `email_verification_code` | character varying(500) |  |  |
| 20 | `email_verification_time` | timestamp without time zone |  |  |
| 21 | `reset_password_token` | character varying(500) |  |  |
| 22 | `reset_password_validity` | timestamp without time zone |  |  |
| 23 | `user_name` | character varying(100) |  |  |
| 24 | `tag_line` | character varying(500) |  |  |
| 25 | `background_image` | character varying(200) |  |  |
| 26 | `otp_verification_code` | character varying(10) |  |  |
| 27 | `ispresentation` | boolean |  |  |
| 28 | `subscriptionid` | integer |  |  |
| 29 | `subscriptionstatus` | character varying |  |  |
| 30 | `issubscriptionpaid` | boolean |  |  |
| 31 | `referal_code` | character varying |  |  |
| 32 | `refered_code` | character varying |  |  |
| 33 | `email_text` | character varying |  |  |
| 34 | `membership_status` | character varying |  |  |
| 35 | `login_type` | character varying |  |  |
| 36 | `login_json` | json |  |  |
| 37 | `isfirstime` | boolean |  |  |
| 38 | `isguide` | boolean |  |  |
| 39 | `isautodebit` | boolean |  |  |
| 40 | `userType` | character varying(50) |  |  |
| 41 | `ProfileImageUrl` | character varying |  |  |
| 42 | `visitorid` | text |  |  |
| 43 | `startdate` | date |  |  |

<a id="production-public-membersclaimedleases"></a>
#### `public.membersclaimedleases`  (table)

- **Estimated rows:** 49,180
- **Primary key:** `id`
- **What it holds:** Leases claimed by members with original/modified decimal interest, claim status and owner info.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('membersclaimedleases_id_seq'::regclass) |
| 2 | `member_id` | integer |  |  |
| 3 | `lease_number` | character varying |  |  |
| 4 | `lease_name` | character varying |  |  |
| 5 | `district_code` | character varying |  |  |
| 6 | `county` | character varying |  |  |
| 7 | `original_decimal_interest` | numeric(10,8) |  |  |
| 8 | `modified_decimal_interest` | numeric(10,8) |  |  |
| 9 | `isclaimed` | boolean |  |  |
| 10 | `iswatchlist` | boolean |  |  |
| 11 | `claimed_date_and_time` | timestamp without time zone |  |  |
| 12 | `leaseswitchtimestamp` | timestamp without time zone |  |  |
| 13 | `ispaid` | boolean |  | false |
| 14 | `lease_switch_count` | integer |  | 0 |
| 15 | `ownernumber` | character varying |  |  |
| 16 | `ownername` | text |  |  |
| 17 | `owneraddress` | text |  |  |

<a id="production-public-memberswatchlistleases"></a>
#### `public.memberswatchlistleases`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Leases on members' watchlists (lease/district/county, watchlist timestamp).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('memberswatchlistleases_id_seq'::regclass) |
| 2 | `member_id` | integer |  |  |
| 3 | `lease_number` | character varying |  |  |
| 4 | `lease_name` | character varying |  |  |
| 5 | `district_code` | character varying |  |  |
| 6 | `county` | character varying |  |  |
| 7 | `iswatchlist` | boolean |  |  |
| 8 | `watchlist_date_and_time` | timestamp without time zone |  |  |

<a id="production-public-mineral_review"></a>
#### `public.mineral_review`  (table)

- **Estimated rows:** n/a
- **What it holds:** User-submitted reviews/testimonials (name, email, review text, published flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `firstname` | character varying(50) | ✔ |  |
| 2 | `email` | character varying(255) | ✔ |  |
| 3 | `review` | character varying | ✔ |  |
| 4 | `created_on` | timestamp without time zone | ✔ | now() |
| 5 | `is_published` | boolean |  | true |

<a id="production-public-notification_alert"></a>
#### `public.notification_alert`  (table)

- **Estimated rows:** 29
- **What it holds:** User notification-alert configurations (filters, operators, districts, leases, type, frequency).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('notification_alert_id_seq'::regclass) |
| 2 | `email_id` | character varying |  |  |
| 3 | `filters` | json |  |  |
| 4 | `create_ts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 5 | `updated_date` | timestamp without time zone |  |  |
| 6 | `operators` | character varying |  |  |
| 7 | `districts` | character varying |  |  |
| 8 | `leasenos` | character varying |  |  |
| 9 | `playtypes` | character varying |  |  |
| 10 | `countys` | character varying |  |  |
| 11 | `notification_type` | character varying |  |  |
| 12 | `frequency` | character varying |  |  |
| 13 | `notification_send_type` | character varying |  |  |

<a id="production-public-notification_history"></a>
#### `public.notification_history`  (table)

- **Estimated rows:** 13,292
- **What it holds:** History of notifications sent (type, send channel, text, date).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('notification_history_id_seq'::regclass) |
| 2 | `notification_alert_id` | character varying |  |  |
| 3 | `notification_type` | character varying |  |  |
| 4 | `notification_send_type` | character varying |  |  |
| 5 | `send_text` | character varying |  |  |
| 6 | `send_date` | date |  | CURRENT_DATE |

<a id="production-public-notification_templates"></a>
#### `public.notification_templates`  (table)

- **Estimated rows:** n/a
- **What it holds:** HTML templates and subjects per notification type.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('notification_templates_id_seq'::regclass) |
| 2 | `notification_type` | character varying(255) |  |  |
| 3 | `html_template` | text |  |  |
| 4 | `subject` | character varying |  |  |

<a id="production-public-notification_templates_temp"></a>
#### `public.notification_templates_temp`  (table)

- **Estimated rows:** n/a
- **What it holds:** Staging copy of notification templates.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('notification_templates_temp_id_seq'::regclass) |
| 2 | `notification_type` | character varying(255) |  |  |
| 3 | `html_template` | text |  |  |
| 4 | `subject` | character varying |  |  |

<a id="production-public-notificationtypes"></a>
#### `public.notificationtypes`  (table)

- **Estimated rows:** n/a
- **What it holds:** Lookup of notification types and whether they are displayed.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('notificationtypes_id_seq'::regclass) |
| 2 | `type_name` | character varying(255) |  |  |
| 3 | `isdisplayed` | boolean |  |  |

<a id="production-public-operator_data"></a>
#### `public.operator_data`  (table)

- **Estimated rows:** 28,304
- **What it holds:** Operator directory scraped data (number, name, location, URLs, address, phone).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` | text |  |  |
| 2 | `operator_number` | text |  |  |
| 3 | `operator_name` | text |  |  |
| 4 | `location` | text |  |  |
| 5 | `main_url` | text |  |  |
| 6 | `detail_link` | text |  |  |
| 7 | `address` | text |  |  |
| 8 | `phone` | text |  |  |

<a id="production-public-operator_data_shalexp"></a>
#### `public.operator_data_shalexp`  (table)

- **Estimated rows:** 32,712
- **What it holds:** Operator data sourced from ShaleXP (name, location, link, address, phone).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `operator_name` | text |  |  |
| 2 | `location` | text |  |  |
| 3 | `link` | text |  |  |
| 4 | `adddress` | text |  |  |
| 5 | `phone_no` | text |  |  |

<a id="production-public-operator_directory"></a>
#### `public.operator_directory`  (table)

- **Estimated rows:** 7,483
- **What it holds:** Structured operator directory (address parts, phone, P5 status, county, logo).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('operator_directory_id_seq'::regclass) |
| 2 | `operator_number` | character varying | ✔ |  |
| 3 | `operator_name` | character varying |  |  |
| 4 | `first_address_line` | character varying |  |  |
| 5 | `second_address_line` | character varying |  |  |
| 6 | `apt_suite` | character varying |  |  |
| 7 | `city` | character varying |  |  |
| 8 | `state` | character varying |  |  |
| 9 | `zip` | character varying |  |  |
| 10 | `country` | character varying |  |  |
| 11 | `phone_number` | character varying |  |  |
| 12 | `emergency` | character varying |  |  |
| 13 | `mail_ret_by_po` | character varying |  |  |
| 14 | `p5_status` | character varying |  |  |
| 15 | `county` | character varying(100) |  |  |
| 16 | `operator_logo` | character varying |  |  |

<a id="production-public-operatorcountypages_metatitleanddescription"></a>
#### `public.operatorcountypages_metatitleanddescription`  (table)

- **Estimated rows:** 256
- **Primary key:** `county`
- **What it holds:** SEO meta title/description/H1 per operator-county landing page.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `county` 🔑 | character varying | ✔ |  |
| 2 | `meta_title` | character varying |  |  |
| 3 | `meta_description` | text |  |  |
| 4 | `h1` | character varying |  |  |

<a id="production-public-packages"></a>
#### `public.packages`  (table)

- **Estimated rows:** n/a
- **What it holds:** Data packages for sale (name, play type, county, cost, discount, map image).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('packages_id_seq'::regclass) |
| 2 | `package_name` | character varying(255) | ✔ |  |
| 3 | `playtypename` | character varying(255) | ✔ |  |
| 4 | `playtypeid` | integer | ✔ |  |
| 5 | `county` | json | ✔ |  |
| 6 | `cost` | numeric(10,2) | ✔ |  |
| 7 | `package_map_image` | character varying |  |  |
| 8 | `package_discount` | integer |  |  |
| 9 | `package_county` | character varying |  |  |

<a id="production-public-payment_cancel_process"></a>
#### `public.payment_cancel_process`  (table)

- **Estimated rows:** n/a
- **What it holds:** Records of payment cancellation processing per member.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('payment_cancel_process_id_seq'::regclass) |
| 2 | `member_id` | integer |  |  |
| 3 | `process` | character varying |  |  |
| 4 | `status` | boolean |  | false |
| 5 | `createts` | date |  | CURRENT_DATE |

<a id="production-public-podcast_info"></a>
#### `public.podcast_info`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Podcast entries (name, link, description, audience, listen count).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('podcast_info_id_seq'::regclass) |
| 2 | `name` | character varying |  |  |
| 3 | `link` | character varying |  |  |
| 4 | `description` | character varying |  |  |
| 5 | `podcastfor` | character varying |  |  |
| 6 | `isactive` | boolean |  |  |
| 7 | `createts` | date |  |  |
| 8 | `listencount` | integer |  |  |

<a id="production-public-pricing"></a>
#### `public.pricing`  (table)

- **Estimated rows:** 255
- **What it holds:** Per-county pricing & record counts across all data products (mineral, well info, surveys, formations, reserves, etc.).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('pricing_id_seq'::regclass) |
| 2 | `county` | character varying |  |  |
| 3 | `mineraldata_records` | integer |  |  |
| 4 | `mineraldata_price` | numeric(10,2) |  |  |
| 5 | `well_info_records` | integer |  |  |
| 6 | `well_info_price` | numeric(10,2) |  |  |
| 7 | `file_download_records` | integer |  |  |
| 8 | `file_download_price` | numeric(10,2) |  |  |
| 9 | `directional_survey_records` | integer |  |  |
| 10 | `directional_survey_price` | numeric(10,2) |  |  |
| 11 | `formation_tops_records` | integer |  |  |
| 12 | `formation_tops_price` | numeric(10,2) |  |  |
| 13 | `lease_produced_records` | integer |  |  |
| 14 | `lease_produced_price` | numeric(10,2) |  |  |
| 15 | `lease_reserves_records` | integer |  |  |
| 16 | `lease_reserves_price` | numeric(10,2) |  |  |
| 17 | `well_produced_records` | integer |  |  |
| 18 | `well_produced_price` | numeric(10,2) |  |  |
| 19 | `well_reserves_records` | integer |  |  |
| 20 | `well_reserves_price` | numeric(10,2) |  |  |
| 21 | `createts` | timestamp without time zone |  |  |
| 22 | `pdf_file_records` | integer |  |  |
| 23 | `digitized_file_records` | integer |  |  |

<a id="production-public-pricing_faq"></a>
#### `public.pricing_faq`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Pricing-page FAQ entries (question, answer, type).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('pricing_faq_id_seq'::regclass) |
| 2 | `question` | text | ✔ |  |
| 3 | `answer` | text | ✔ |  |
| 4 | `type` | character varying |  |  |

<a id="production-public-pricingmaster"></a>
#### `public.pricingmaster`  (table)

- **Estimated rows:** n/a
- **What it holds:** Master price ranges per data type (base price, from/to range).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('pricingmaster_id_seq'::regclass) |
| 2 | `data_type` | character varying |  |  |
| 3 | `base_price` | numeric(10,2) |  |  |
| 4 | `from_range` | integer |  |  |
| 5 | `to_range` | integer |  |  |

<a id="production-public-professional_claimed_owners"></a>
#### `public.professional_claimed_owners`  (table)

- **Estimated rows:** 98
- **Primary key:** `id`
- **What it holds:** Professional accounts' claimed owner records (owner id, member, active flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('professional_claimed_owners_id_seq'::regclass) |
| 2 | `professional_owner_id` | integer | ✔ |  |
| 3 | `member_id` | integer | ✔ |  |
| 4 | `owner_name` | character varying(255) |  |  |
| 5 | `is_active` | boolean |  | true |
| 6 | `create_ts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 7 | `activate_owner` | boolean |  | false |

<a id="production-public-purchasedatasentmaillog"></a>
#### `public.purchaseDataSentmailLog`  (table)

- **Estimated rows:** 112
- **Primary key:** `id`
- **What it holds:** Log of purchase-confirmation emails sent.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('"purchaseDataSentmailLog_id_seq"'::regclass) |
| 2 | `emailid` | character varying | ✔ |  |
| 3 | `createts` | timestamp without time zone | ✔ | now() |

<a id="production-public-purchase_insert_purchasedatadetails"></a>
#### `public.purchase_insert_purchaseDataDetails`  (table)

- **Estimated rows:** 5,589
- **Primary key:** `id`
- **What it holds:** Line items of purchased data (county, record count, price, price type, data type).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | bigint | ✔ | nextval('"purchase_insert_purchaseDataDetails_id_seq"'::regclass) |
| 2 | `purchase_transactionid` | character varying | ✔ |  |
| 3 | `County` | character varying(100) |  |  |
| 4 | `TotalRecords` | numeric |  |  |
| 5 | `Price` | double precision |  |  |
| 6 | `PriceType` | character varying(100) |  |  |
| 7 | `createts` | timestamp without time zone |  | now() |
| 8 | `data_type` | character varying |  |  |

<a id="production-public-purchase_purchasedatarequest"></a>
#### `public.purchase_purchaseDataRequest`  (table)

- **Estimated rows:** 475
- **Primary key:** `id`
- **What it holds:** Master data-purchase transactions (67 cols): payment, filters (county/lease/API/depth/etc.), drive link and status.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | bigint | ✔ | nextval('"purchase_purchaseDataRequest_id_seq"'::regclass) |
| 2 | `transaction_uid` | character varying | ✔ |  |
| 3 | `member_id` | numeric |  |  |
| 4 | `transaction_type` | character varying(100) |  |  |
| 5 | `total_amount` | double precision | ✔ |  |
| 6 | `currency` | character varying(100) |  |  |
| 7 | `email_id` | character varying | ✔ |  |
| 8 | `Is_mobile_request` | boolean |  |  |
| 9 | `payment_status` | character varying(100) |  |  |
| 10 | `Is_data_downloaded` | boolean |  |  |
| 11 | `payment_response_object` | character varying |  |  |
| 12 | `subscriptionId` | numeric |  |  |
| 13 | `create_ts` | timestamp without time zone |  |  |
| 14 | `input_county` | character varying |  |  |
| 15 | `input_playtype` | character varying |  |  |
| 16 | `input_decimalinterestmin` | character varying |  |  |
| 17 | `input_decimalinterestmax` | character varying |  |  |
| 18 | `input_membername` | character varying |  |  |
| 19 | `braintree_payment_status` | character varying(100) |  |  |
| 20 | `update_date` | timestamp without time zone |  |  |
| 21 | `braintree_transaction_id` | character varying(500) |  |  |
| 22 | `google_drive_file_link` | character varying |  |  |
| 23 | `isdeletedfromgdrive` | boolean |  |  |
| 24 | `downloadeddate` | timestamp with time zone |  |  |
| 25 | `file_name` | character varying |  |  |
| 26 | `attachment` | character varying |  |  |
| 27 | `data_type` | character varying |  |  |
| 28 | `input_leaseno` | character varying |  |  |
| 29 | `input_trackingno` | character varying |  |  |
| 30 | `input_permitno` | character varying |  |  |
| 31 | `input_apino` | character varying |  |  |
| 32 | `input_status` | character varying |  |  |
| 33 | `input_welltype` | character varying |  |  |
| 34 | `input_fillingpurpose` | character varying |  |  |
| 35 | `input_wellboreprofile` | character varying |  |  |
| 36 | `input_datestart` | character varying |  |  |
| 37 | `input_dateend` | character varying |  |  |
| 38 | `input_districtcode` | character varying |  |  |
| 39 | `input_operatorname` | character varying |  |  |
| 40 | `input_type` | character varying |  |  |
| 41 | `input_todepth` | character varying |  |  |
| 42 | `input_fromdepth` | character varying |  |  |
| 43 | `isprogress` | boolean |  |  |
| 44 | `input_formationtype` | character varying |  |  |
| 45 | `input_depthtvd` | character varying |  |  |
| 46 | `input_depthmd` | character varying |  |  |
| 47 | `input_leaseid` | character varying |  |  |
| 48 | `input_view` | character varying |  |  |
| 49 | `input_year` | character varying |  |  |
| 50 | `input_appraisedmin` | character varying |  |  |
| 51 | `input_appraisedmax` | character varying |  |  |
| 52 | `input_mineralowneraddress` | character varying |  |  |
| 53 | `filter_req_object` | character varying |  |  |
| 54 | `input_fieldname` | character varying |  |  |
| 55 | `input_depthmdmin` | character varying |  |  |
| 56 | `input_depthmdmax` | character varying |  |  |
| 57 | `input_depthtvdmin` | character varying |  |  |
| 58 | `input_depthtvdmax` | character varying |  |  |
| 59 | `req_status` | character varying |  |  |
| 60 | `ispackages` | boolean |  |  |
| 61 | `f_name` | character varying |  |  |
| 62 | `package_name` | character varying |  |  |
| 63 | `discount_percentage` | integer |  |  |
| 64 | `original_price` | double precision |  |  |
| 65 | `countycount` | character varying |  |  |
| 66 | `directional_survey_type` | character varying |  |  |
| 67 | `total_count` | character varying |  |  |

<a id="production-public-purchase_user_payment_emails"></a>
#### `public.purchase_user_payment_emails`  (table)

- **Estimated rows:** 199
- **What it holds:** Purchase/payment email bodies and invoice templates per transaction.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('purchase_user_payment_emails_id_seq'::regclass) |
| 2 | `emailid` | character varying |  |  |
| 3 | `createts` | timestamp without time zone |  |  |
| 4 | `emailtype` | character varying |  |  |
| 5 | `emailbody` | character varying |  |  |
| 6 | `transaction_id` | character varying(255) |  |  |
| 7 | `invoice_template` | character varying |  |  |

<a id="production-public-referral_bonus"></a>
#### `public.referral_bonus`  (table)

- **Estimated rows:** n/a
- **What it holds:** Referral bonus payouts per member (amount paid, date, referred member ids).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('referral_bonus_id_seq'::regclass) |
| 2 | `member_id` | integer | ✔ |  |
| 3 | `referral_amount_paid` | character varying |  |  |
| 4 | `paid_date` | date |  |  |
| 5 | `memberids` | json |  |  |
| 6 | `total_referral_amount` | character varying |  |  |

<a id="production-public-send_message"></a>
#### `public.send_message`  (table)

- **Estimated rows:** n/a
- **What it holds:** Contact-us / message submissions (name, phone, comment, county, page).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `fname` | character varying(50) |  |  |
| 2 | `lname` | character varying(50) |  |  |
| 3 | `phone` | character varying |  |  |
| 4 | `comment` | character varying |  |  |
| 5 | `emailid` | character varying(255) | ✔ |  |
| 6 | `message` | character varying | ✔ |  |
| 7 | `created_on` | timestamp without time zone | ✔ | now() |
| 8 | `county` | text |  |  |
| 9 | `page` | text |  |  |

<a id="production-public-show_functions"></a>
#### `public.show_functions`  (view)

- **Estimated rows:** n/a
- **What it holds:** Helper view listing database routine names.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `routine_name` | information_schema.sql_identifier |  |  |

<a id="production-public-spatial_ref_sys"></a>
#### `public.spatial_ref_sys`  (table)

- **Estimated rows:** 8,500
- **Primary key:** `srid`
- **What it holds:** PostGIS spatial reference system (SRID) definitions.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `srid` 🔑 | integer | ✔ |  |
| 2 | `auth_name` | character varying(256) |  |  |
| 3 | `auth_srid` | integer |  |  |
| 4 | `srtext` | character varying(2048) |  |  |
| 5 | `proj4text` | character varying(2048) |  |  |

<a id="production-public-sponsored_advertise"></a>
#### `public.sponsored_advertise`  (table)

- **Estimated rows:** 1
- **Primary key:** `id`
- **What it holds:** Sponsored ad slots (vendor, dates, title, creative file, action link, publish flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sponsored_advertise_id_seq'::regclass) |
| 2 | `vender` | character varying |  |  |
| 3 | `start_date` | timestamp without time zone |  |  |
| 4 | `end_date` | timestamp without time zone |  |  |
| 5 | `title` | character varying |  |  |
| 6 | `description` | character varying |  |  |
| 7 | `file` | character varying |  |  |
| 8 | `actionlink` | character varying |  |  |
| 9 | `isactive` | boolean |  |  |
| 10 | `ispublished` | boolean |  |  |

<a id="production-public-sub_features"></a>
#### `public.sub_features`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Subscription feature catalog (code, display text, visibility, active window).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_features_id_seq'::regclass) |
| 2 | `code` | text |  |  |
| 3 | `displaytext` | text |  |  |
| 4 | `isvisible` | boolean |  | true |
| 5 | `startdate` | date |  |  |
| 6 | `enddate` | date |  |  |
| 7 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 8 | `isactive` | boolean |  | true |

<a id="production-public-sub_subfeatures"></a>
#### `public.sub_subfeatures`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Sub-features under each subscription feature.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_subfeatures_id_seq'::regclass) |
| 2 | `featureid` | integer |  |  |
| 3 | `code` | text |  |  |
| 4 | `displaytext` | text |  |  |
| 5 | `startdate` | date |  |  |
| 6 | `enddate` | date |  |  |
| 7 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 8 | `isactive` | boolean |  | true |

<a id="production-public-sub_subscription_cancellations"></a>
#### `public.sub_subscription_cancellations`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Subscription cancellation events (user, subscription, cancellation data).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_subscription_cancellations_id_seq'::regclass) |
| 2 | `user_id` | integer | ✔ |  |
| 3 | `subscription_id` | integer | ✔ |  |
| 4 | `cancellation_data` | jsonb |  |  |
| 5 | `created_at` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-sub_subscription_downgrade_requests"></a>
#### `public.sub_subscription_downgrade_requests`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Subscription downgrade requests with plan dates, status and payment data.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_subscription_downgrade_requests_id_seq'::regclass) |
| 2 | `member_id` | integer | ✔ |  |
| 3 | `current_subscription_id` | integer | ✔ |  |
| 4 | `requested_subscription_id` | integer | ✔ |  |
| 5 | `current_plan_end_date` | date | ✔ |  |
| 6 | `downgrade_start_date` | date | ✔ |  |
| 7 | `downgrade_end_date` | date |  |  |
| 8 | `status` | character varying(20) |  | 'pending'::character varying |
| 9 | `request_date` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 10 | `processed_date` | timestamp without time zone |  |  |
| 11 | `amount_paid` | numeric(10,2) |  | 0 |
| 12 | `transaction_id` | character varying(255) |  |  |
| 13 | `payment_data` | jsonb |  |  |

<a id="production-public-sub_subscription_plan"></a>
#### `public.sub_subscription_plan`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Subscription plan definitions (name, plan code, price id, validity, member type).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_subscription_plan_id_seq'::regclass) |
| 2 | `name` | text |  |  |
| 3 | `displaytext` | text |  |  |
| 4 | `plancode` | text |  |  |
| 5 | `planpriceid` | integer |  |  |
| 6 | `upgradeplanid` | integer |  |  |
| 7 | `planvalidity` | integer |  |  |
| 8 | `isactive` | boolean |  | true |
| 9 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 10 | `member_type` | character varying(50) |  |  |

<a id="production-public-sub_subscription_plan_duration"></a>
#### `public.sub_subscription_plan_duration`  (table)

- **Estimated rows:** 685
- **Primary key:** `id`
- **What it holds:** Per-user subscription plan validity windows (start/end, active flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_subscription_plan_duration_id_seq'::regclass) |
| 2 | `userid` | integer |  |  |
| 3 | `subscriptionplanid` | integer |  |  |
| 4 | `startdate` | date |  |  |
| 5 | `enddate` | date |  |  |
| 6 | `isactive` | boolean |  | true |
| 7 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-sub_subscription_plan_duration_new"></a>
#### `public.sub_subscription_plan_duration_new`  (table)

- **Estimated rows:** 416
- **Primary key:** `id`
- **What it holds:** Newer version of per-user subscription plan durations.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_subscription_plan_duration_new_id_seq'::regclass) |
| 2 | `userid` | integer |  |  |
| 3 | `subscriptionplanid` | integer |  |  |
| 4 | `startdate` | date |  |  |
| 5 | `enddate` | date |  |  |
| 6 | `isactive` | boolean |  | true |
| 7 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-sub_subscription_plan_feature_count"></a>
#### `public.sub_subscription_plan_feature_count`  (table)

- **Estimated rows:** 191
- **Primary key:** `id`
- **What it holds:** Access-count limits per plan+feature+sub-feature within a date window.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_subscription_plan_feature_count_id_seq'::regclass) |
| 2 | `subscriptionplanid` | integer |  |  |
| 3 | `featureid` | integer |  |  |
| 4 | `subfeatureid` | integer |  |  |
| 5 | `accesscount` | integer |  |  |
| 6 | `startdate` | date |  |  |
| 7 | `enddate` | date |  |  |
| 8 | `isactive` | boolean |  | true |
| 9 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-sub_subscription_plan_price"></a>
#### `public.sub_subscription_plan_price`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Subscription plan price history (price, active window).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_subscription_plan_price_id_seq'::regclass) |
| 2 | `startdate` | date |  |  |
| 3 | `enddate` | date |  |  |
| 4 | `price` | numeric(10,2) |  |  |
| 5 | `isactive` | boolean |  | true |
| 6 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-sub_user_feature_access_count"></a>
#### `public.sub_user_feature_access_count`  (table)

- **Estimated rows:** 87
- **Primary key:** `id`
- **What it holds:** Live per-user feature access usage counters against plan limits.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_user_feature_access_count_id_seq'::regclass) |
| 2 | `visitorid` | text |  |  |
| 3 | `userid` | integer |  |  |
| 4 | `subscriptionplanid` | integer |  |  |
| 5 | `featureid` | integer |  |  |
| 6 | `subfeatureid` | integer |  |  |
| 7 | `count` | integer |  |  |
| 8 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 9 | `isactive` | boolean |  | true |

<a id="production-public-sub_user_feature_access_records"></a>
#### `public.sub_user_feature_access_records`  (table)

- **Estimated rows:** 218
- **Primary key:** `id`
- **What it holds:** Per-user feature access event records (action, date).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_user_feature_access_records_id_seq'::regclass) |
| 2 | `userid` | integer |  |  |
| 3 | `visitorid` | text |  |  |
| 4 | `subscriptionplanid` | integer |  |  |
| 5 | `featureid` | integer |  |  |
| 6 | `subfeatureid` | integer |  |  |
| 7 | `action` | text |  |  |
| 8 | `date` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 9 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 10 | `isactive` | boolean |  | true |

<a id="production-public-sub_user_payment"></a>
#### `public.sub_user_payment`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** User subscription payments (method, status, amount, Braintree ids, plan change, duration).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('sub_user_payment_id_seq'::regclass) |
| 2 | `userid` | integer |  |  |
| 3 | `subscriptionplanid` | integer |  |  |
| 4 | `paymentmethod` | text |  |  |
| 5 | `paymentstatus` | text |  |  |
| 6 | `paymentdate` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 7 | `transaction_id` | text |  |  |
| 8 | `amount` | numeric(10,2) |  |  |
| 9 | `transaction_data` | jsonb |  |  |
| 10 | `braintree_subscription_id` | text |  |  |
| 11 | `payment_nonce` | text |  |  |
| 12 | `plan_change_type` | text |  |  |
| 13 | `duration` | integer |  |  |
| 14 | `startdate` | date |  |  |
| 15 | `enddate` | date |  |  |
| 16 | `isactive` | boolean |  | true |
| 17 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-subscription"></a>
#### `public.subscription`  (table)

- **Estimated rows:** n/a
- **Primary key:** `subscriptionid`
- **What it holds:** Legacy subscription products (name, amount, validity, popular/offer flags).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `subscriptionid` 🔑 | integer | ✔ | nextval('subscription_subscriptionid_seq'::regclass) |
| 2 | `subscriptionname` | character varying(255) | ✔ |  |
| 3 | `subscriptionamount` | numeric | ✔ |  |
| 4 | `validityinmonths` | character varying(20) | ✔ |  |
| 5 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 6 | `isactive` | boolean |  | true |
| 7 | `ispopular` | boolean |  |  |
| 8 | `offerimage` | character varying |  |  |
| 9 | `coupontagline` | character varying |  |  |

<a id="production-public-subscriptionmemberdetails"></a>
#### `public.subscriptionMemberdetails`  (table)

- **Estimated rows:** 842
- **Primary key:** `id`
- **What it holds:** Member-to-subscription assignments with status and start/end dates.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('"subscriptionMemberdetails_id_seq"'::regclass) |
| 2 | `subscriptionid` | numeric | ✔ |  |
| 3 | `member_id` | numeric | ✔ |  |
| 4 | `subscriptionStatus` | character varying(255) |  |  |
| 5 | `subscriptionStartDate` | date |  |  |
| 6 | `subscriptionEndDat` | date |  |  |
| 7 | `createts` | timestamp without time zone |  | now() |
| 8 | `duration` | integer |  |  |

<a id="production-public-subscriptionpayment"></a>
#### `public.subscriptionPayment`  (table)

- **Estimated rows:** 150
- **Primary key:** `id`
- **What it holds:** Subscription payment transactions (amount, transaction JSON, discount, cancel flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('"subscriptionPayment_id_seq"'::regclass) |
| 2 | `subscriptionId` | integer | ✔ |  |
| 3 | `member_id` | integer | ✔ |  |
| 4 | `amount` | double precision | ✔ |  |
| 5 | `createTs` | time without time zone |  | now() |
| 6 | `transactionid` | character varying(255) |  |  |
| 7 | `paymentnoance` | character varying(255) |  |  |
| 8 | `transactionJson` | character varying |  |  |
| 9 | `transaction_type` | character varying |  |  |
| 10 | `req_json` | character varying |  |  |
| 11 | `paymentsubscriptionid` | character varying |  |  |
| 12 | `iscanceled` | boolean |  | false |
| 13 | `discountedamount` | double precision |  |  |

<a id="production-public-subscription_checkout_logs"></a>
#### `public.subscription_checkout_logs`  (table)

- **Estimated rows:** 5
- **Primary key:** `id`
- **What it holds:** Detailed subscription checkout attempt logs (36 cols): each step, Braintree ids, success/failure stage and email status.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | bigint | ✔ | nextval('subscription_checkout_logs_id_seq'::regclass) |
| 2 | `checkout_uid` | uuid |  |  |
| 3 | `member_id` | integer |  |  |
| 4 | `email` | character varying(255) |  |  |
| 5 | `f_name` | character varying(150) |  |  |
| 6 | `l_name` | character varying(150) |  |  |
| 7 | `plan_change_type` | character varying(20) |  |  |
| 8 | `subscription_plan_id` | integer |  |  |
| 9 | `plan_name` | character varying(100) |  |  |
| 10 | `member_type` | character varying(50) |  |  |
| 11 | `braintree_plan_id` | character varying(20) |  |  |
| 12 | `amount` | numeric(12,2) |  |  |
| 13 | `old_subscription_id` | character varying(100) |  |  |
| 14 | `braintree_customer_id` | character varying(100) |  |  |
| 15 | `braintree_payment_token` | character varying(100) |  |  |
| 16 | `braintree_transaction_id` | character varying(100) |  |  |
| 17 | `braintree_subscription_id` | character varying(100) |  |  |
| 18 | `first_billing_date` | date |  |  |
| 19 | `status` | character varying(40) | ✔ | 'started'::character varying |
| 20 | `current_step` | character varying(60) |  |  |
| 21 | `is_success` | boolean | ✔ | false |
| 22 | `failure_stage` | character varying(60) |  |  |
| 23 | `failure_reason` | text |  |  |
| 24 | `braintree_error_code` | character varying(50) |  |  |
| 25 | `braintree_response` | jsonb |  |  |
| 26 | `email_template` | character varying(150) |  |  |
| 27 | `email_subject` | character varying(255) |  |  |
| 28 | `email_sent` | boolean | ✔ | false |
| 29 | `email_error` | text |  |  |
| 30 | `email_sent_at` | timestamp with time zone |  |  |
| 31 | `payment_id` | integer |  |  |
| 32 | `request_payload` | jsonb |  |  |
| 33 | `response_payload` | jsonb |  |  |
| 34 | `created_at` | timestamp with time zone | ✔ | now() |
| 35 | `updated_at` | timestamp with time zone | ✔ | now() |
| 36 | `completed_at` | timestamp with time zone |  |  |

<a id="production-public-subscription_plan_request"></a>
#### `public.subscription_plan_request`  (table)

- **Estimated rows:** n/a
- **What it holds:** Subscription plan change requests (duration, amount, change type, processed flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('subscription_plan_request_id_seq'::regclass) |
| 2 | `member_id` | integer | ✔ |  |
| 3 | `subscription_id` | integer | ✔ |  |
| 4 | `duration` | integer | ✔ |  |
| 5 | `amount` | numeric(10,2) | ✔ |  |
| 6 | `plan_change_type` | text | ✔ |  |
| 7 | `payment_transaction_id` | text |  |  |
| 8 | `processed` | boolean |  | false |
| 9 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 10 | `updatets` | timestamp without time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-subscription_tools"></a>
#### `public.subscription_tools`  (table)

- **Estimated rows:** n/a
- **What it holds:** Reusable HTML snippets/tools for subscription pages.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('subscription_tools_id_seq'::regclass) |
| 2 | `type` | character varying(255) |  |  |
| 3 | `html` | text |  |  |

<a id="production-public-subscriptionfeatures"></a>
#### `public.subscriptionfeatures`  (table)

- **Estimated rows:** n/a
- **Primary key:** `featureid`
- **What it holds:** Legacy subscription feature list (name, active flag).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `featureid` 🔑 | integer | ✔ | nextval('subscriptionfeatures_featureid_seq'::regclass) |
| 2 | `featurename` | character varying(255) | ✔ |  |
| 3 | `active` | boolean |  | true |
| 4 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 5 | `updatets` | timestamp without time zone |  |  |

<a id="production-public-subscriptionplanfeatures"></a>
#### `public.subscriptionplanfeatures`  (table)

- **Estimated rows:** n/a
- **Primary key:** `subscriptionplanfeatureid`
- **What it holds:** Legacy mapping of features to subscription plans with details.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `subscriptionplanfeatureid` 🔑 | integer | ✔ | nextval('subscriptionplanfeatures_subscriptionplanfeatureid_seq'::regclass) |
| 2 | `subscriptionid` | integer | ✔ |  |
| 3 | `featureid` | integer | ✔ |  |
| 4 | `featuredetails` | text |  |  |
| 5 | `active` | boolean |  | true |
| 6 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 7 | `updatets` | timestamp without time zone |  |  |

<a id="production-public-subscriptionprices"></a>
#### `public.subscriptionprices`  (table)

- **Estimated rows:** n/a
- **Primary key:** `subscriptionpriceid`
- **What it holds:** Legacy subscription price tiers by duration with discount.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `subscriptionpriceid` 🔑 | integer | ✔ | nextval('subscriptionprices_subscriptionpriceid_seq'::regclass) |
| 2 | `subscriptionid` | integer | ✔ |  |
| 3 | `subscriptionamount` | numeric | ✔ |  |
| 4 | `durationname` | character varying(255) |  |  |
| 5 | `duration` | character varying(255) |  |  |
| 6 | `discount` | numeric |  |  |
| 7 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 8 | `updatets` | timestamp without time zone |  |  |

<a id="production-public-testusers"></a>
#### `public.testusers`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Test/QA user email accounts.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('testusers_id_seq'::regclass) |
| 2 | `email_id` | character varying |  |  |

<a id="production-public-unlimited_access_members"></a>
#### `public.unlimited_access_members`  (table)

- **Estimated rows:** n/a
- **What it holds:** List of member ids granted unlimited access.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `member_id` | integer |  |  |

<a id="production-public-user_activity"></a>
#### `public.user_activity`  (table)

- **Estimated rows:** 31,984
- **What it holds:** User activity/feature-usage tracking (feature, sub-feature, metadata, URL, timestamps).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('user_activity_id_seq'::regclass) |
| 2 | `member_id` | integer | ✔ |  |
| 3 | `feature_name` | character varying(255) |  |  |
| 4 | `sub_feature_name` | character varying(255) |  |  |
| 5 | `meta_data` | character varying(255) |  |  |
| 6 | `create_ts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 7 | `end_date` | timestamp without time zone |  |  |
| 8 | `url` | character varying |  |  |

<a id="production-public-user_login_activity"></a>
#### `public.user_login_activity`  (table)

- **Estimated rows:** 1,078
- **Primary key:** `id`
- **What it holds:** User login events (email, timestamp).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('user_login_activity_id_seq'::regclass) |
| 2 | `email_id` | character varying(255) | ✔ |  |
| 3 | `createts` | timestamp with time zone |  | CURRENT_TIMESTAMP |

<a id="production-public-user_notification_settings"></a>
#### `public.user_notification_settings`  (table)

- **Estimated rows:** 51
- **What it holds:** Per-user notification preferences per lease (types, county, operator, active flag, send count).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` | integer | ✔ | nextval('user_notification_settings_id_seq'::regclass) |
| 2 | `member_id` | integer |  |  |
| 3 | `lease_name` | character varying(255) |  |  |
| 4 | `lease_number` | character varying(255) |  |  |
| 5 | `email_id` | character varying(255) | ✔ |  |
| 6 | `notification_types` | text[] | ✔ |  |
| 7 | `is_active` | boolean |  | true |
| 8 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 9 | `send_count` | integer |  | 0 |
| 10 | `county` | character varying |  |  |
| 11 | `operator` | character varying |  |  |

<a id="production-public-userbehavior"></a>
#### `public.userbehavior`  (table)

- **Estimated rows:** 372,795
- **Primary key:** `id`
- **What it holds:** Anonymous/visitor behavior tracking (page URLs, referrer, dwell time, mobile flag) — ~370K rows.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ |  |
| 2 | `visitorid` | text | ✔ |  |
| 3 | `userid` | integer |  |  |
| 4 | `ipaddress` | text | ✔ |  |
| 5 | `pageurl` | text | ✔ |  |
| 6 | `previouspageurl` | text |  |  |
| 7 | `starttime` | timestamp without time zone | ✔ | CURRENT_TIMESTAMP |
| 8 | `endtime` | timestamp without time zone |  |  |
| 9 | `spendingtime` | integer |  | EXTRACT(epoch FROM (endtime - starttime)) |
| 10 | `ismobile` | boolean | ✔ | false |

<a id="production-public-usersearchhistory"></a>
#### `public.usersearchhistory`  (table)

- **Estimated rows:** 425
- **What it holds:** Per-user counts of searches/actions (claims, watchlist, reports, map filters).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `usersearchhistoryid` | integer | ✔ | nextval('usersearchhistory_usersearchhistoryid_seq'::regclass) |
| 2 | `member_id` | integer |  |  |
| 3 | `email_id` | character varying(255) |  |  |
| 4 | `claimleasecount` | integer |  | 0 |
| 5 | `watchlistcount` | integer |  | 0 |
| 6 | `leasereportcount` | integer |  | 0 |
| 7 | `mapfiltercount` | integer |  | 0 |
| 8 | `activitynotificationcount` | integer |  | 0 |
| 9 | `createts` | timestamp without time zone |  | CURRENT_TIMESTAMP |
| 10 | `wellreportcount` | integer |  | 0 |

<a id="production-public-visitor_popups"></a>
#### `public.visitor_popups`  (table)

- **Estimated rows:** 15
- **Primary key:** `id`
- **What it holds:** Visitor pop-up display tracking (count, last session, visit times).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('visitor_popups_id_seq'::regclass) |
| 2 | `member_id` | integer | ✔ |  |
| 3 | `popup_count` | integer | ✔ | 0 |
| 4 | `last_session_id` | text |  |  |
| 5 | `last_visit_at` | timestamp without time zone |  |  |
| 6 | `created_at` | timestamp without time zone |  | now() |
| 7 | `updated_at` | timestamp without time zone |  | now() |

<a id="production-public-well_icons"></a>
#### `public.well_icons`  (table)

- **Estimated rows:** 89
- **Primary key:** `id`
- **What it holds:** Map well-icon catalog (description, icon URL).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('well_icons_id_seq'::regclass) |
| 2 | `description` | character varying(100) | ✔ |  |
| 3 | `icon_url` | text |  |  |
| 4 | `created_at` | timestamp without time zone |  | now() |

---

## Database: `postgres`

*Default PostgreSQL maintenance database (no application objects).*

> No user tables/views (empty database).

---

## Database: `spatiotemporal_analysis`

*Spatiotemporal analytics database (production/well data over time & space).*

### Schema: `public`  ·  76 object(s)

| Object | Type | Est. rows | Cols | Summary |
|---|---|---|---|---|
| [`spatiotemporal_analysis_info_lz_2_1`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_2_1) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_2_1` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_2_3n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_2_3n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_2_3n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_3_1n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_3_1n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_3_1n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_3_2`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_3_2) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_3_2` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_3_3`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_3_3) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_3_3` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_3_4n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_3_4n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_3_4n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_4_1n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_4_1n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_4_1n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_4_2`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_4_2) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_4_2` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_4_3n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_4_3n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_4_3n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_5_1n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_5_1n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_5_1n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_5_2`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_5_2) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_5_2` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_5_3`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_5_3) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_5_3` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_6_1n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_6_1n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_6_1n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_6_2n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_6_2n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_6_2n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_6_3n`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_6_3n) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_6_3n` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_7_1`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_7_1) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_7_1` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_7_2`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_7_2) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_7_2` (raw content, source file name, GIS layer name). |
| [`spatiotemporal_analysis_info_lz_7_3`](#spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_7_3) | table | n/a | 4 | Metadata/info records for spatiotemporal grid tile `lz_7_3` (raw content, source file name, GIS layer name). |
| [`x_gridinfox_act_d01_out`](#spatiotemporal_analysis-public-x_gridinfox_act_d01_out) | table | 3,375,992 | 20 | Per-well grid-point production analytics for tile `d01_out` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_d02_out`](#spatiotemporal_analysis-public-x_gridinfox_act_d02_out) | table | 3,108,989 | 20 | Per-well grid-point production analytics for tile `d02_out` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_1_1`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_1_1) | table | 16,968,852 | 20 | Per-well grid-point production analytics for tile `lz_1_1` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_1_2`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_1_2) | table | 18,729,844 | 20 | Per-well grid-point production analytics for tile `lz_1_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_1_3`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_1_3) | table | 14,295,244 | 20 | Per-well grid-point production analytics for tile `lz_1_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_1_4`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_1_4) | table | 13,652,292 | 20 | Per-well grid-point production analytics for tile `lz_1_4` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_2_1`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_2_1) | table | 7,645,062 | 20 | Per-well grid-point production analytics for tile `lz_2_1` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_2_2`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_2_2) | table | 13,781,939 | 20 | Per-well grid-point production analytics for tile `lz_2_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_2_3n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_2_3n) | table | 8,320,019 | 20 | Per-well grid-point production analytics for tile `lz_2_3n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_3_1n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_3_1n) | table | 8,198,989 | 20 | Per-well grid-point production analytics for tile `lz_3_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_3_2`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_3_2) | table | 8,580,843 | 20 | Per-well grid-point production analytics for tile `lz_3_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_3_3`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_3_3) | table | 8,317,900 | 20 | Per-well grid-point production analytics for tile `lz_3_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_3_4n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_3_4n) | table | 8,619,870 | 20 | Per-well grid-point production analytics for tile `lz_3_4n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_4_1n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_4_1n) | table | 7,880,756 | 20 | Per-well grid-point production analytics for tile `lz_4_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_4_2`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_4_2) | table | 8,155,676 | 20 | Per-well grid-point production analytics for tile `lz_4_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_4_3n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_4_3n) | table | 9,573,143 | 20 | Per-well grid-point production analytics for tile `lz_4_3n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_5_1n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_5_1n) | table | 8,146,029 | 20 | Per-well grid-point production analytics for tile `lz_5_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_5_2`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_5_2) | table | 9,495,549 | 20 | Per-well grid-point production analytics for tile `lz_5_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_5_3`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_5_3) | table | 8,785,895 | 20 | Per-well grid-point production analytics for tile `lz_5_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_6_1n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_6_1n) | table | 11,199,753 | 20 | Per-well grid-point production analytics for tile `lz_6_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_6_2n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_6_2n) | table | 11,599,378 | 20 | Per-well grid-point production analytics for tile `lz_6_2n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_6_3n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_6_3n) | table | 13,288,003 | 20 | Per-well grid-point production analytics for tile `lz_6_3n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_7_1`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_7_1) | table | 8,667,877 | 20 | Per-well grid-point production analytics for tile `lz_7_1` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_7_2`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_7_2) | table | 9,870,184 | 20 | Per-well grid-point production analytics for tile `lz_7_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_7_3`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_7_3) | table | 8,406,436 | 20 | Per-well grid-point production analytics for tile `lz_7_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_8_0n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_8_0n) | table | 6,989,372 | 20 | Per-well grid-point production analytics for tile `lz_8_0n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_8_1n`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_8_1n) | table | 9,416,826 | 20 | Per-well grid-point production analytics for tile `lz_8_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_8_2`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_8_2) | table | 10,208,088 | 20 | Per-well grid-point production analytics for tile `lz_8_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridinfox_act_lz_8_3`](#spatiotemporal_analysis-public-x_gridinfox_act_lz_8_3) | table | 3,946,766 | 20 | Per-well grid-point production analytics for tile `lz_8_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table. |
| [`x_gridpolysx_act_d01_out`](#spatiotemporal_analysis-public-x_gridpolysx_act_d01_out) | table | 1,658,382 | 68 | Grid-polygon aggregate analytics for tile `d01_out` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). Includes 44 per-district frequency columns. |
| [`x_gridpolysx_act_d02_out`](#spatiotemporal_analysis-public-x_gridpolysx_act_d02_out) | table | 1,514,334 | 68 | Grid-polygon aggregate analytics for tile `d02_out` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). Includes 44 per-district frequency columns. |
| [`x_gridpolysx_act_lz_1_1`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_1_1) | table | 4,332,293 | 19 | Grid-polygon aggregate analytics for tile `lz_1_1` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_1_2`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_1_2) | table | 4,020,700 | 19 | Grid-polygon aggregate analytics for tile `lz_1_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_1_3`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_1_3) | table | 4,364,766 | 19 | Grid-polygon aggregate analytics for tile `lz_1_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_1_4`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_1_4) | table | 4,119,802 | 19 | Grid-polygon aggregate analytics for tile `lz_1_4` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_2_1`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_2_1) | table | 3,872,917 | 19 | Grid-polygon aggregate analytics for tile `lz_2_1` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_2_2`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_2_2) | table | 4,109,465 | 19 | Grid-polygon aggregate analytics for tile `lz_2_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_2_3n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_2_3n) | table | 4,026,618 | 19 | Grid-polygon aggregate analytics for tile `lz_2_3n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_3_1n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_3_1n) | table | 4,088,073 | 19 | Grid-polygon aggregate analytics for tile `lz_3_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_3_2`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_3_2) | table | 3,965,141 | 19 | Grid-polygon aggregate analytics for tile `lz_3_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_3_3`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_3_3) | table | 3,719,189 | 19 | Grid-polygon aggregate analytics for tile `lz_3_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_3_4n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_3_4n) | table | 3,752,261 | 19 | Grid-polygon aggregate analytics for tile `lz_3_4n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_4_1n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_4_1n) | table | 3,530,325 | 19 | Grid-polygon aggregate analytics for tile `lz_4_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_4_2`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_4_2) | table | 3,658,515 | 19 | Grid-polygon aggregate analytics for tile `lz_4_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_4_3n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_4_3n) | table | 3,780,807 | 19 | Grid-polygon aggregate analytics for tile `lz_4_3n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_5_1n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_5_1n) | table | 3,934,306 | 19 | Grid-polygon aggregate analytics for tile `lz_5_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_5_2`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_5_2) | table | 3,903,641 | 19 | Grid-polygon aggregate analytics for tile `lz_5_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_5_3`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_5_3) | table | 4,118,717 | 19 | Grid-polygon aggregate analytics for tile `lz_5_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_6_1n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_6_1n) | table | 4,181,280 | 19 | Grid-polygon aggregate analytics for tile `lz_6_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_6_2n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_6_2n) | table | 4,733,509 | 19 | Grid-polygon aggregate analytics for tile `lz_6_2n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_6_3n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_6_3n) | table | 4,980,298 | 19 | Grid-polygon aggregate analytics for tile `lz_6_3n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_7_1`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_7_1) | table | 3,903,646 | 19 | Grid-polygon aggregate analytics for tile `lz_7_1` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_7_2`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_7_2) | table | 4,025,986 | 19 | Grid-polygon aggregate analytics for tile `lz_7_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_7_3`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_7_3) | table | 3,965,109 | 19 | Grid-polygon aggregate analytics for tile `lz_7_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_8_0n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_8_0n) | table | 3,411,923 | 19 | Grid-polygon aggregate analytics for tile `lz_8_0n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_8_1n`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_8_1n) | table | 3,350,111 | 19 | Grid-polygon aggregate analytics for tile `lz_8_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_8_2`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_8_2) | table | 4,127,389 | 19 | Grid-polygon aggregate analytics for tile `lz_8_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |
| [`x_gridpolysx_act_lz_8_3`](#spatiotemporal_analysis-public-x_gridpolysx_act_lz_8_3) | table | 1,782,853 | 19 | Grid-polygon aggregate analytics for tile `lz_8_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_2_1"></a>
#### `public.spatiotemporal_analysis_info_lz_2_1`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_2_1` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_2_1_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_2_3n"></a>
#### `public.spatiotemporal_analysis_info_lz_2_3n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_2_3n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_2_3n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_3_1n"></a>
#### `public.spatiotemporal_analysis_info_lz_3_1n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_3_1n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_3_1n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_3_2"></a>
#### `public.spatiotemporal_analysis_info_lz_3_2`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_3_2` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_3_2_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_3_3"></a>
#### `public.spatiotemporal_analysis_info_lz_3_3`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_3_3` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_3_3_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_3_4n"></a>
#### `public.spatiotemporal_analysis_info_lz_3_4n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_3_4n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_3_4n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_4_1n"></a>
#### `public.spatiotemporal_analysis_info_lz_4_1n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_4_1n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_4_1n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_4_2"></a>
#### `public.spatiotemporal_analysis_info_lz_4_2`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_4_2` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_4_2_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_4_3n"></a>
#### `public.spatiotemporal_analysis_info_lz_4_3n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_4_3n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_4_3n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_5_1n"></a>
#### `public.spatiotemporal_analysis_info_lz_5_1n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_5_1n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_5_1n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_5_2"></a>
#### `public.spatiotemporal_analysis_info_lz_5_2`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_5_2` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_5_2_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_5_3"></a>
#### `public.spatiotemporal_analysis_info_lz_5_3`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_5_3` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_5_3_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_6_1n"></a>
#### `public.spatiotemporal_analysis_info_lz_6_1n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_6_1n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_6_1n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_6_2n"></a>
#### `public.spatiotemporal_analysis_info_lz_6_2n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_6_2n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_6_2n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_6_3n"></a>
#### `public.spatiotemporal_analysis_info_lz_6_3n`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_6_3n` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_6_3n_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_7_1"></a>
#### `public.spatiotemporal_analysis_info_lz_7_1`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_7_1` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_7_1_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_7_2"></a>
#### `public.spatiotemporal_analysis_info_lz_7_2`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_7_2` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_7_2_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-spatiotemporal_analysis_info_lz_7_3"></a>
#### `public.spatiotemporal_analysis_info_lz_7_3`  (table)

- **Estimated rows:** n/a
- **Primary key:** `id`
- **What it holds:** Metadata/info records for spatiotemporal grid tile `lz_7_3` (raw content, source file name, GIS layer name).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `id` 🔑 | integer | ✔ | nextval('spatiotemporal_analysis_info_lz_7_3_id_seq'::regclass) |
| 2 | `content` | text |  |  |
| 3 | `file_name` | text |  |  |
| 4 | `layer_name` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_d01_out"></a>
#### `public.x_gridinfox_act_d01_out`  (table)

- **Estimated rows:** 3,375,992
- **What it holds:** Per-well grid-point production analytics for tile `d01_out` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_d02_out"></a>
#### `public.x_gridinfox_act_d02_out`  (table)

- **Estimated rows:** 3,108,989
- **What it holds:** Per-well grid-point production analytics for tile `d02_out` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_1_1"></a>
#### `public.x_gridinfox_act_lz_1_1`  (table)

- **Estimated rows:** 16,968,852
- **What it holds:** Per-well grid-point production analytics for tile `lz_1_1` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_1_2"></a>
#### `public.x_gridinfox_act_lz_1_2`  (table)

- **Estimated rows:** 18,729,844
- **What it holds:** Per-well grid-point production analytics for tile `lz_1_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_1_3"></a>
#### `public.x_gridinfox_act_lz_1_3`  (table)

- **Estimated rows:** 14,295,244
- **What it holds:** Per-well grid-point production analytics for tile `lz_1_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_1_4"></a>
#### `public.x_gridinfox_act_lz_1_4`  (table)

- **Estimated rows:** 13,652,292
- **What it holds:** Per-well grid-point production analytics for tile `lz_1_4` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_2_1"></a>
#### `public.x_gridinfox_act_lz_2_1`  (table)

- **Estimated rows:** 7,645,062
- **What it holds:** Per-well grid-point production analytics for tile `lz_2_1` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_2_2"></a>
#### `public.x_gridinfox_act_lz_2_2`  (table)

- **Estimated rows:** 13,781,939
- **What it holds:** Per-well grid-point production analytics for tile `lz_2_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_2_3n"></a>
#### `public.x_gridinfox_act_lz_2_3n`  (table)

- **Estimated rows:** 8,320,019
- **What it holds:** Per-well grid-point production analytics for tile `lz_2_3n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_3_1n"></a>
#### `public.x_gridinfox_act_lz_3_1n`  (table)

- **Estimated rows:** 8,198,989
- **What it holds:** Per-well grid-point production analytics for tile `lz_3_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_3_2"></a>
#### `public.x_gridinfox_act_lz_3_2`  (table)

- **Estimated rows:** 8,580,843
- **What it holds:** Per-well grid-point production analytics for tile `lz_3_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_3_3"></a>
#### `public.x_gridinfox_act_lz_3_3`  (table)

- **Estimated rows:** 8,317,900
- **What it holds:** Per-well grid-point production analytics for tile `lz_3_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_3_4n"></a>
#### `public.x_gridinfox_act_lz_3_4n`  (table)

- **Estimated rows:** 8,619,870
- **What it holds:** Per-well grid-point production analytics for tile `lz_3_4n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_4_1n"></a>
#### `public.x_gridinfox_act_lz_4_1n`  (table)

- **Estimated rows:** 7,880,756
- **What it holds:** Per-well grid-point production analytics for tile `lz_4_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_4_2"></a>
#### `public.x_gridinfox_act_lz_4_2`  (table)

- **Estimated rows:** 8,155,676
- **What it holds:** Per-well grid-point production analytics for tile `lz_4_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_4_3n"></a>
#### `public.x_gridinfox_act_lz_4_3n`  (table)

- **Estimated rows:** 9,573,143
- **What it holds:** Per-well grid-point production analytics for tile `lz_4_3n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_5_1n"></a>
#### `public.x_gridinfox_act_lz_5_1n`  (table)

- **Estimated rows:** 8,146,029
- **What it holds:** Per-well grid-point production analytics for tile `lz_5_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_5_2"></a>
#### `public.x_gridinfox_act_lz_5_2`  (table)

- **Estimated rows:** 9,495,549
- **What it holds:** Per-well grid-point production analytics for tile `lz_5_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_5_3"></a>
#### `public.x_gridinfox_act_lz_5_3`  (table)

- **Estimated rows:** 8,785,895
- **What it holds:** Per-well grid-point production analytics for tile `lz_5_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_6_1n"></a>
#### `public.x_gridinfox_act_lz_6_1n`  (table)

- **Estimated rows:** 11,199,753
- **What it holds:** Per-well grid-point production analytics for tile `lz_6_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_6_2n"></a>
#### `public.x_gridinfox_act_lz_6_2n`  (table)

- **Estimated rows:** 11,599,378
- **What it holds:** Per-well grid-point production analytics for tile `lz_6_2n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_6_3n"></a>
#### `public.x_gridinfox_act_lz_6_3n`  (table)

- **Estimated rows:** 13,288,003
- **What it holds:** Per-well grid-point production analytics for tile `lz_6_3n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_7_1"></a>
#### `public.x_gridinfox_act_lz_7_1`  (table)

- **Estimated rows:** 8,667,877
- **What it holds:** Per-well grid-point production analytics for tile `lz_7_1` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_7_2"></a>
#### `public.x_gridinfox_act_lz_7_2`  (table)

- **Estimated rows:** 9,870,184
- **What it holds:** Per-well grid-point production analytics for tile `lz_7_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_7_3"></a>
#### `public.x_gridinfox_act_lz_7_3`  (table)

- **Estimated rows:** 8,406,436
- **What it holds:** Per-well grid-point production analytics for tile `lz_7_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_8_0n"></a>
#### `public.x_gridinfox_act_lz_8_0n`  (table)

- **Estimated rows:** 6,989,372
- **What it holds:** Per-well grid-point production analytics for tile `lz_8_0n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_8_1n"></a>
#### `public.x_gridinfox_act_lz_8_1n`  (table)

- **Estimated rows:** 9,416,826
- **What it holds:** Per-well grid-point production analytics for tile `lz_8_1n` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_8_2"></a>
#### `public.x_gridinfox_act_lz_8_2`  (table)

- **Estimated rows:** 10,208,088
- **What it holds:** Per-well grid-point production analytics for tile `lz_8_2` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridinfox_act_lz_8_3"></a>
#### `public.x_gridinfox_act_lz_8_3`  (table)

- **Estimated rows:** 3,946,766
- **What it holds:** Per-well grid-point production analytics for tile `lz_8_3` (API14, timestamp, EWA index, production sums, well age, lease/field/operator). Large fact table.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `in_fid` | text |  |  |
| 5 | `ewa_idx` | text |  |  |
| 6 | `frequency` | text |  |  |
| 7 | `api14` | text |  |  |
| 8 | `mean_age` | text |  |  |
| 9 | `length_api` | text |  |  |
| 10 | `prod_api` | text |  |  |
| 11 | `sum_prod` | text |  |  |
| 12 | `length_per` | text |  |  |
| 13 | `prod_per` | text |  |  |
| 14 | `id` | text |  |  |
| 15 | `lease_name` | text |  |  |
| 16 | `lease_number` | text |  |  |
| 17 | `field_name` | text |  |  |
| 18 | `field_number` | text |  |  |
| 19 | `operator_name` | text |  |  |
| 20 | `operator_number` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_d01_out"></a>
#### `public.x_gridpolysx_act_d01_out`  (table)

- **Estimated rows:** 1,658,382
- **What it holds:** Grid-polygon aggregate analytics for tile `d01_out` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). Includes 44 per-district frequency columns.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `grid_ptid` | text |  |  |
| 7 | `in_grid` | text |  |  |
| 8 | `grid_ptid_1` | text |  |  |
| 9 | `in_grid_1` | text |  |  |
| 10 | `d1_frq` | text |  |  |
| 11 | `d2_frq` | text |  |  |
| 12 | `d3_frq` | text |  |  |
| 13 | `d4_frq` | text |  |  |
| 14 | `d5_frq` | text |  |  |
| 15 | `d6_frq` | text |  |  |
| 16 | `d7_frq` | text |  |  |
| 17 | `d8_frq` | text |  |  |
| 18 | `d9_frq` | text |  |  |
| 19 | `d10_frq` | text |  |  |
| 20 | `d11_frq` | text |  |  |
| 21 | `d12_frq` | text |  |  |
| 22 | `d13_frq` | text |  |  |
| 23 | `d14_frq` | text |  |  |
| 24 | `d15_frq` | text |  |  |
| 25 | `d16_frq` | text |  |  |
| 26 | `d17_frq` | text |  |  |
| 27 | `d18_frq` | text |  |  |
| 28 | `d19_frq` | text |  |  |
| 29 | `d20_frq` | text |  |  |
| 30 | `d21_frq` | text |  |  |
| 31 | `d22_frq` | text |  |  |
| 32 | `d23_frq` | text |  |  |
| 33 | `d24_frq` | text |  |  |
| 34 | `d25_frq` | text |  |  |
| 35 | `d26_frq` | text |  |  |
| 36 | `d27_frq` | text |  |  |
| 37 | `d28_frq` | text |  |  |
| 38 | `d29_frq` | text |  |  |
| 39 | `d30_frq` | text |  |  |
| 40 | `d31_frq` | text |  |  |
| 41 | `d32_frq` | text |  |  |
| 42 | `d33_frq` | text |  |  |
| 43 | `d34_frq` | text |  |  |
| 44 | `d35_frq` | text |  |  |
| 45 | `d36_frq` | text |  |  |
| 46 | `d37_frq` | text |  |  |
| 47 | `d38_frq` | text |  |  |
| 48 | `d39_frq` | text |  |  |
| 49 | `d40_frq` | text |  |  |
| 50 | `d41_frq` | text |  |  |
| 51 | `d42_frq` | text |  |  |
| 52 | `d43_frq` | text |  |  |
| 53 | `d44_frq` | text |  |  |
| 54 | `zones_frq` | text |  |  |
| 55 | `zones_list` | text |  |  |
| 56 | `min_near_dist` | text |  |  |
| 57 | `max_near_dist` | text |  |  |
| 58 | `mean_near_dist` | text |  |  |
| 59 | `sum_production_pt` | text |  |  |
| 60 | `mean_age` | text |  |  |
| 61 | `v_acresperwell` | text |  |  |
| 62 | `v_boeperacre` | text |  |  |
| 63 | `vx_factor0` | text |  |  |
| 64 | `vx_factor1` | text |  |  |
| 65 | `centroid_x` | text |  |  |
| 66 | `centroid_y` | text |  |  |
| 67 | `shape_length` | text |  |  |
| 68 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_d02_out"></a>
#### `public.x_gridpolysx_act_d02_out`  (table)

- **Estimated rows:** 1,514,334
- **What it holds:** Grid-polygon aggregate analytics for tile `d02_out` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry). Includes 44 per-district frequency columns.

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `grid_ptid` | text |  |  |
| 7 | `in_grid` | text |  |  |
| 8 | `grid_ptid_1` | text |  |  |
| 9 | `in_grid_1` | text |  |  |
| 10 | `d1_frq` | text |  |  |
| 11 | `d2_frq` | text |  |  |
| 12 | `d3_frq` | text |  |  |
| 13 | `d4_frq` | text |  |  |
| 14 | `d5_frq` | text |  |  |
| 15 | `d6_frq` | text |  |  |
| 16 | `d7_frq` | text |  |  |
| 17 | `d8_frq` | text |  |  |
| 18 | `d9_frq` | text |  |  |
| 19 | `d10_frq` | text |  |  |
| 20 | `d11_frq` | text |  |  |
| 21 | `d12_frq` | text |  |  |
| 22 | `d13_frq` | text |  |  |
| 23 | `d14_frq` | text |  |  |
| 24 | `d15_frq` | text |  |  |
| 25 | `d16_frq` | text |  |  |
| 26 | `d17_frq` | text |  |  |
| 27 | `d18_frq` | text |  |  |
| 28 | `d19_frq` | text |  |  |
| 29 | `d20_frq` | text |  |  |
| 30 | `d21_frq` | text |  |  |
| 31 | `d22_frq` | text |  |  |
| 32 | `d23_frq` | text |  |  |
| 33 | `d24_frq` | text |  |  |
| 34 | `d25_frq` | text |  |  |
| 35 | `d26_frq` | text |  |  |
| 36 | `d27_frq` | text |  |  |
| 37 | `d28_frq` | text |  |  |
| 38 | `d29_frq` | text |  |  |
| 39 | `d30_frq` | text |  |  |
| 40 | `d31_frq` | text |  |  |
| 41 | `d32_frq` | text |  |  |
| 42 | `d33_frq` | text |  |  |
| 43 | `d34_frq` | text |  |  |
| 44 | `d35_frq` | text |  |  |
| 45 | `d36_frq` | text |  |  |
| 46 | `d37_frq` | text |  |  |
| 47 | `d38_frq` | text |  |  |
| 48 | `d39_frq` | text |  |  |
| 49 | `d40_frq` | text |  |  |
| 50 | `d41_frq` | text |  |  |
| 51 | `d42_frq` | text |  |  |
| 52 | `d43_frq` | text |  |  |
| 53 | `d44_frq` | text |  |  |
| 54 | `zones_frq` | text |  |  |
| 55 | `zones_list` | text |  |  |
| 56 | `min_near_dist` | text |  |  |
| 57 | `max_near_dist` | text |  |  |
| 58 | `mean_near_dist` | text |  |  |
| 59 | `sum_production_pt` | text |  |  |
| 60 | `mean_age` | text |  |  |
| 61 | `v_acresperwell` | text |  |  |
| 62 | `v_boeperacre` | text |  |  |
| 63 | `vx_factor0` | text |  |  |
| 64 | `vx_factor1` | text |  |  |
| 65 | `centroid_x` | text |  |  |
| 66 | `centroid_y` | text |  |  |
| 67 | `shape_length` | text |  |  |
| 68 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_1_1"></a>
#### `public.x_gridpolysx_act_lz_1_1`  (table)

- **Estimated rows:** 4,332,293
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_1_1` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_1_2"></a>
#### `public.x_gridpolysx_act_lz_1_2`  (table)

- **Estimated rows:** 4,020,700
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_1_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_1_3"></a>
#### `public.x_gridpolysx_act_lz_1_3`  (table)

- **Estimated rows:** 4,364,766
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_1_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_1_4"></a>
#### `public.x_gridpolysx_act_lz_1_4`  (table)

- **Estimated rows:** 4,119,802
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_1_4` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_2_1"></a>
#### `public.x_gridpolysx_act_lz_2_1`  (table)

- **Estimated rows:** 3,872,917
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_2_1` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_2_2"></a>
#### `public.x_gridpolysx_act_lz_2_2`  (table)

- **Estimated rows:** 4,109,465
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_2_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_2_3n"></a>
#### `public.x_gridpolysx_act_lz_2_3n`  (table)

- **Estimated rows:** 4,026,618
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_2_3n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_3_1n"></a>
#### `public.x_gridpolysx_act_lz_3_1n`  (table)

- **Estimated rows:** 4,088,073
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_3_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_3_2"></a>
#### `public.x_gridpolysx_act_lz_3_2`  (table)

- **Estimated rows:** 3,965,141
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_3_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_3_3"></a>
#### `public.x_gridpolysx_act_lz_3_3`  (table)

- **Estimated rows:** 3,719,189
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_3_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_3_4n"></a>
#### `public.x_gridpolysx_act_lz_3_4n`  (table)

- **Estimated rows:** 3,752,261
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_3_4n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_4_1n"></a>
#### `public.x_gridpolysx_act_lz_4_1n`  (table)

- **Estimated rows:** 3,530,325
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_4_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_4_2"></a>
#### `public.x_gridpolysx_act_lz_4_2`  (table)

- **Estimated rows:** 3,658,515
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_4_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_4_3n"></a>
#### `public.x_gridpolysx_act_lz_4_3n`  (table)

- **Estimated rows:** 3,780,807
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_4_3n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_5_1n"></a>
#### `public.x_gridpolysx_act_lz_5_1n`  (table)

- **Estimated rows:** 3,934,306
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_5_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_5_2"></a>
#### `public.x_gridpolysx_act_lz_5_2`  (table)

- **Estimated rows:** 3,903,641
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_5_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_5_3"></a>
#### `public.x_gridpolysx_act_lz_5_3`  (table)

- **Estimated rows:** 4,118,717
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_5_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_6_1n"></a>
#### `public.x_gridpolysx_act_lz_6_1n`  (table)

- **Estimated rows:** 4,181,280
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_6_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_6_2n"></a>
#### `public.x_gridpolysx_act_lz_6_2n`  (table)

- **Estimated rows:** 4,733,509
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_6_2n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_6_3n"></a>
#### `public.x_gridpolysx_act_lz_6_3n`  (table)

- **Estimated rows:** 4,980,298
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_6_3n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_7_1"></a>
#### `public.x_gridpolysx_act_lz_7_1`  (table)

- **Estimated rows:** 3,903,646
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_7_1` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_7_2"></a>
#### `public.x_gridpolysx_act_lz_7_2`  (table)

- **Estimated rows:** 4,025,986
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_7_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_7_3"></a>
#### `public.x_gridpolysx_act_lz_7_3`  (table)

- **Estimated rows:** 3,965,109
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_7_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_8_0n"></a>
#### `public.x_gridpolysx_act_lz_8_0n`  (table)

- **Estimated rows:** 3,411,923
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_8_0n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_8_1n"></a>
#### `public.x_gridpolysx_act_lz_8_1n`  (table)

- **Estimated rows:** 3,350,111
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_8_1n` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_8_2"></a>
#### `public.x_gridpolysx_act_lz_8_2`  (table)

- **Estimated rows:** 4,127,389
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_8_2` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

<a id="spatiotemporal_analysis-public-x_gridpolysx_act_lz_8_3"></a>
#### `public.x_gridpolysx_act_lz_8_3`  (table)

- **Estimated rows:** 1,782,853
- **What it holds:** Grid-polygon aggregate analytics for tile `lz_8_3` (nearest-neighbor distances, production sum, mean well age, acres-per-well, BOE-per-acre, centroid X/Y, shape geometry).

| # | Column | Type | Not Null | Default |
|---|---|---|---|---|
| 1 | `file_name` | text |  |  |
| 2 | `layer_name` | text |  |  |
| 3 | `timestamp` | text |  |  |
| 4 | `join_count` | text |  |  |
| 5 | `target_fid` | text |  |  |
| 6 | `gridpt_id` | text |  |  |
| 7 | `min_near_dist` | text |  |  |
| 8 | `max_near_dist` | text |  |  |
| 9 | `mean_near_dist` | text |  |  |
| 10 | `sum_production_pt` | text |  |  |
| 11 | `mean_age` | text |  |  |
| 12 | `v_acresperwell` | text |  |  |
| 13 | `v_boeperacre` | text |  |  |
| 14 | `vx_factor0` | text |  |  |
| 15 | `vx_factor1` | text |  |  |
| 16 | `centroid_x` | text |  |  |
| 17 | `centroid_y` | text |  |  |
| 18 | `shape_length` | text |  |  |
| 19 | `shape_area` | text |  |  |

---

_End of documentation. Generated read-only from PostgreSQL system catalogs._

<br>

---
---

# MineralView PostgreSQL Database Architecture Documentation

## Overview

The PostgreSQL environment serves as the primary relational database system for the MineralView platform. It stores structured business data that supports the website, data scraping pipelines, GIS information, production datasets, user management, subscriptions, payment processing, and analytical calculations.

The PostgreSQL server is divided into multiple databases, where each database is responsible for a specific business domain. This separation helps improve maintainability, performance, security, and data organization.

The major PostgreSQL databases are:

1. Archive
2. MineralView Download
3. Production
4. PostgreSQL (Empty/System Database)
5. Spatio-Temporal Analysis

---

# 1. Archive Database

## Purpose

The **Archive** database stores historical datasets that are valuable for reference but are no longer actively used by the application. Instead of deleting old data, it is archived for auditing, historical comparison, and future analysis.

This reduces the size of operational databases while preserving historical information.

---

## Schemas

The Archive database contains three major schemas:

* GIS Data
* Public
* Scrapy Data

---

## GIS Data Schema

### Purpose

This schema stores archived Geographic Information System (GIS) datasets.

These datasets contain mapping information that was previously used or calculated but is no longer required for active production systems.

Typical tables include:

* GIS District
* GIS Grid
* GIS Lease Centroid
* GIS RRC Wells
* GIS Survey
* GIS Survey String
* GIS Survey 2024
* GIS Surveillance 2024

### Data Stored

* Survey boundaries
* Lease centroids
* Well coordinates
* District boundaries
* Survey polygons
* Historical GIS calculations

### Business Usage

These datasets are mainly retained for:

* Historical GIS reference
* Legacy map calculations
* Internal verification
* Data auditing

---

## Public Schema

### Purpose

The Public schema stores archived Mineral Ownership information.

The data is organized by year.

Example datasets include:

* Archive Mineral Owner 2018
* Archive Mineral Owner 2019
* Archive Mineral Owner 2021
* Archive Mineral Owner 2022

Property datasets:

* Active Mineral Owner Property 2018
* Active Mineral Owner Property 2019
* Active Mineral Owner Property 2021
* Active Mineral Owner Property 2022

Additional tables include:

* Archive W1 Permit Details
* GIS Lease Centroid
* Spatial Reference System

### Business Usage

These tables preserve historical ownership records for:

* Historical ownership tracking
* Legal verification
* Ownership comparison
* Internal auditing

---

## Scrapy Data Schema

### Purpose

This schema stores archived web scraping results collected from the Texas Railroad Commission (RRC) and other public resources.

Example tables include:

* Gas Measurement Data
* Gas Measurement Child
* Market Update Archive
* W1 Attachments
* W1 Comments
* W1 Exceptions
* W1 Field Restrictions
* W1 Form JSON Data
* W1 Legal Information
* W1 Permit Restrictions
* W2 Acid Fracture Child
* W2 Completion JSON Data
* W2 Field Data
* Pressure Calculation Child
* W2 Operator Certifications
* W2 RRC Remarks
* W2 Completion URLs

### Business Usage

This schema preserves historical scraped datasets for:

* Data recovery
* Scraper validation
* Historical permit tracking
* Troubleshooting
* Auditing scraping processes

---

# 2. MineralView Download Database

## Purpose

This is the most important operational database in the MineralView ecosystem.

It stores nearly all scraped datasets collected from multiple external sources, including:

* Texas Railroad Commission (RRC)
* County Appraisal Districts (CAD)
* Public GIS sources
* Mineral ownership resources
* Market information

This database serves as the central repository for scraped data before it is processed and integrated into the platform.

---

## Schemas

The database contains five major schemas:

* Linkage Data
* Mineral Owner 2025
* Public
* RRC OG Production
* Scrapy Data

---

## Linkage Data Schema

### Purpose

Stores completion linkage information.

Main table:

* Linkage Data New

### Data Stored

This table links completion records with production datasets, including:

* W-2 completion records
* Well identifiers
* Lease information
* Production linkage
* API relationships

---

## Mineral Owner 2025 Schema

### Purpose

Stores the latest mineral ownership data.

The schema is organized by county.

Each county has its own table.

Examples:

* Andrews County
* Bee County
* Brazos County
* Other Texas counties

### Data Stored

* Mineral owners
* Property ownership
* Legal descriptions
* Survey information
* County-specific ownership records

### Data Source

Collected from:

* CAD websites
* Public county resources
* Government portals
* Web scraping

---

## Public Schema

### Purpose

Contains operational datasets used across the entire platform.

This is one of the largest schemas.

Key table categories include:

### Master Data

* Master County
* Master Field
* Master Lease
* Master Operators

### Completion Data

* W1 Fields
* W1 Permits
* W1 Wells
* W2 Completions
* W2 Completion Information
* W2 Completion Attachments
* W2 Formation Records
* W2 Interval Records
* W2 Initial Potential Tests

### Directional Survey

* Directional Survey
* Directional Survey Child
* Directional Survey Exceptions

### Market Data

* Market Updates
* Oil & Gas Pricing
* Historical Pricing
* Future Pricing

### Production Data

* Oil & Gas Production Well Data
* Lease Cycle Production
* Lease Cycle Disposition
* Historical Gas Data

### Mineral Ownership

* Mineral Owner 2023
* Mineral Owner 2024
* Mineral Owner Property 2023
* Mineral Owner Property 2024
* County Mineral Owner Details

### Geographic Information

* Counties
* County Cities
* County Play Types
* Reservoir Play Types

### Additional Operational Tables

* Sitemap
* Daily Leads
* Drilling Conflict
* Well Counts
* Purchase County Years
* Schema Mapping

---

## RRC OG Production Schema

### Purpose

Stores production datasets received from the Texas Railroad Commission.

Major tables include:

* GP County
* Lease Cycle Production
* Lease Cycle Disposition
* Well Status History
* Wellbore Data

### Business Usage

Provides production history used throughout the MineralView platform.

---

## Scrapy Data Schema

### Purpose

Contains raw scraping output, scraper logs, validation tables, and processing information.

Major table categories include:

### Audit Tables

* Audit Market Data
* Audit Product Pricing
* Audit Surface Bottom Location
* Audit W1 Permit
* Audit W2 Completion

### Production Tables

* Production County
* Monthly Production
* Lease Cycle Production
* Lease Cycle Disposition

### Scraper Monitoring

* Scrapy Session Log
* Scraper Processed Log
* Scraper Exception Log
* Scrapy Exceptions

### Well Information

* Surface Location
* Bottom Location
* Well Location

### W2 Supporting Tables

* Acid Fracture
* Casing Record
* Pressure Calculator
* Liner Record
* Tubing Record
* Remarks

### Business Usage

Supports:

* Automated scraping
* Error monitoring
* Data validation
* ETL pipelines
* Data quality assurance

---

# 3. Production Database

## Purpose

The Production database manages all operational backend information for the MineralView website.

Unlike the MineralView Download database, which stores scraped datasets, this database stores application-level information generated by users and the platform.

---

## Schema

Public

Approximately 92 tables.

---

## Major Functional Areas

### User Management

Stores:

* User profiles
* Login history
* User sessions
* User activity
* Existing users
* Test users

---

### Subscription Management

Stores:

* Subscription plans
* Subscription pricing
* Subscription duration
* Subscription features
* User subscriptions
* Subscription checkout logs
* Upgrade requests
* Downgrade requests
* Cancellation requests

---

### Payment Processing

Stores:

* Braintree responses
* Enterprise payments
* Subscription payments
* Checkout tracking
* Payment history

---

### Enterprise Customers

Stores:

* Enterprise plans
* Enterprise inquiries
* Enterprise requirements
* Plan modifications

---

### Notifications

Stores:

* Notification templates
* Notification history
* Notification settings
* Notification types

---

### User Activity Tracking

Stores:

* Search history
* Login activity
* Website behavior
* Watchlists
* Claimed leases
* Claimed mineral owners

---

### Operator Information

Stores:

* Operator directory
* Operator data
* County operator pages

---

### Purchase Management

Stores:

* Purchase requests
* Purchase details
* Purchase emails
* Large dataset requests

---

### Referral System

Stores:

* Referral bonuses
* Invitations
* Sponsored advisors

---

### Website Content

Stores:

* Landing pages
* FAQ
* Pricing pages
* Lease reports
* Podcast information
* Visitor popups
* Meta descriptions

---

### System Monitoring

Stores:

* API logs
* Error logs
* Exceptions
* Backend IPs
* Activity summaries
* Daily synchronization logs

---

## Business Role

This database powers nearly every feature visible on the MineralView website.

---

# 4. PostgreSQL Database

This database currently contains only the default Public schema.

No application tables or operational data are currently stored here.

It functions as an empty or system-level database reserved for future use.

---

# 5. Spatio-Temporal Analysis Database

## Purpose

This database stores advanced analytical datasets generated through internal calculations.

These datasets are not directly scraped but are derived from mathematical and spatial analysis.

---

## Workflow

1. Christos performs advanced spatio-temporal calculations.
2. The generated datasets are shared with Nikhil.
3. Nikhil validates, verifies, and formats the calculated results.
4. The validated results are loaded into the PostgreSQL database.
5. Gabor consumes these datasets for downstream analytical models.

---

## Business Applications

The stored analytical datasets support:

* Reserve estimation
* New well probability prediction
* Production forecasting
* Spatial analysis
* Temporal analysis
* Advanced engineering calculations
* Decision-support models

---

# Overall PostgreSQL Architecture

The PostgreSQL environment can be viewed as five functional layers:

**Archive Layer**

* Historical datasets
* Legacy GIS
* Archived mineral ownership
* Archived scraping data

**Scraping Layer**

* Raw scraped information
* RRC datasets
* CAD datasets
* Mineral ownership
* Market data

**Operational Layer**

* Website backend
* User management
* Authentication
* Subscription management
* Payments
* Notifications
* Business operations

**Production Layer**

* Oil & gas production
* Well information
* Lease production
* Disposition records
* Production history

**Analytics Layer**

* Spatio-temporal calculations
* Reserve estimation
* Well probability models
* Engineering analytics

---

# Summary

The PostgreSQL ecosystem is the backbone of the MineralView platform. It combines historical archives, large-scale scraped datasets, production records, application backend data, and advanced analytical results into a structured relational architecture. By separating responsibilities across multiple databases and schemas, the platform achieves better scalability, easier maintenance, and clear separation between archival, operational, production, and analytical workloads.
