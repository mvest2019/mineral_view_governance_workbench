# Database Source Inventory

> **Status:** ENHANCED (deep, column-level) · **Owner:** Nikhil Salunke · **Reviewer:** DS SME · **Final approver:** Ryan Cochran
> **Last Updated:** 2026-06-23 · **Review cadence:** Quarterly + on each backup
> **Source:** PostgreSQL production dump (`MviewDownload`, 3-part split zip, reassembled & analyzed 2026-06-23) + MongoDB backup (`June_2026_Mongo_DB_Backup`).
> **Companion:** `data-architecture-governance.md`, `data-provenance-and-lineage-governance.md`, `database-backup-and-archive-governance.md`, `security-governance.md`.

---

## 1. Purpose & scope

Authoritative, **column-level** inventory of the production data stores: every table in the PostgreSQL dump, its columns, approximate scale, and the sensitivity flags that govern handling. This is the factual base that `data-architecture-governance.md`, `security-governance.md`, and `privacy-and-data-use-governance.md` build on. The PostgreSQL dump is the **system of record**; MongoDB is the **derived serving layer**.

## 2. PostgreSQL — shape

- **85 table files** across two schemas: `public` (application DB) and `scrapy_data` (RRC scrape + audit pipeline).
- **~4.75 GB** uncompressed, **~28M+ rows** total.
- Every dump file carries a header row, so **column schemas below are exact**, taken directly from the dump.

## 3. PostgreSQL — tables by domain (column-level)

### 3.1 Reference / master

**`public.attachment_type`**  ·  2 columns  ·  rows: —
> id,filename

**`public.content_data`**  ·  4 columns  ·  rows: —
> id,county,well_content,mineral_content

**`public.counties`**  ·  2 columns  ·  rows: 254
> id,county_name

**`public.county_cities`**  ·  7 columns  ·  rows: —
> id,state_name,state_code,city_code,city_name,county_code,county_name

**`public.countyplaytypes`**  ·  4 columns  ·  rows: —
> id,playtype_name,county,code

**`public.field_rules`**  ·  2 columns  ·  rows: —
> field_number,field_name

**`public.master_county`**  ·  8 columns  ·  rows: —
> county_no,county_fips_code,county_name,district_no,district_name,on_shore_flag,onshore_assc_cnty_flag,id

**`public.master_fields`**  ·  5 columns  ·  rows: 59,031
> id,fieldnumber,fieldname,reservoir,fields_description

**`public.master_leases`**  ·  7 columns  ·  rows: 496,297
> id,district_code,lease_number,lease_name,county,acres,created_date

**`public.master_operators`**  ·  5 columns  ·  rows: 28,599
> operator_number,operator_name,operator_address,id,created_date

**`public.playtypes`**  ·  3 columns  ·  rows: —
> id,playtypename,playtype_description

**`public.reservoir_playtypes`**  ·  4 columns  ·  rows: —
> id,reservoirtype,playtype,playtypeid

**`public.schema_mappings`**  ·  14 columns  ·  rows: —
> mapping_id,mapping_version,state,jurisdiction,source_authority,source_type,schema_hash,mapping_json,drift_detected,drift_detail,human_reviewed,review_outcome,review_timestamp,created_at

### 3.2 Mineral owners (PII)

**`public.countyspecific_mineralownerdata`**  ·  9 columns  ·  rows: —
> id,statecode,statename,county,totalmineralowner,totalvalue,interest,property,mineralowneryear

**`public.mineralowner_2023`**  ·  8 columns  ·  rows: 2,889,341
> county,ownernumber,ownername,owneraddress,id2,id,ownercountyname,ownercity

**`public.mineralowner_2024`**  ·  8 columns  ·  rows: 1,220,169
> county,ownernumber,ownername,owneraddress,id2,id,ownercountyname,ownercity

**`public.mineralownerproperty_2023`**  ·  15 columns  ·  rows: 2,838,121
> mineralownerid,propertydescription,districtcode,leasenumber,ri,value,ritype,leasename,leasedata,mineralownerid2,ownernumber,id,mineralaccountnumber,mineralaccountsequence,leaseacres

**`public.mineralownerproperty_2024`**  ·  16 columns  ·  rows: 6,903,875
> mineralownerid,propertydescription,districtcode,leasenumber,ri,value,ritype,leasename,leasedata,mineralownerid2,ownernumber,id,mineralaccountnumber,mineralaccountsequence,leaseacres,ri_updated

**`public.mineralownerproperty_terry_2023`**  ·  15 columns  ·  rows: —
> mineralownerid,propertydescription,districtcode,leasenumber,ri,value,ritype,leasename,leasedata,mineralownerid2,ownernumber,id,mineralaccountnumber,mineralaccountsequence,leaseacres

**`public.mineralownerproperty_tyler_2023`**  ·  15 columns  ·  rows: —
> mineralownerid,propertydescription,districtcode,leasenumber,ri,value,ritype,leasename,leasedata,mineralownerid2,ownernumber,id,mineralaccountnumber,mineralaccountsequence,leaseacres

**`public.mineralownersdetailsbbycountysitemap`**  ·  4 columns  ·  rows: 1,115,879
> county,ownernumber,ownername_url,interest

**`public.purchase_county_years`**  ·  4 columns  ·  rows: —
> county,current_year,mineralownertable,mineralownerpropertiestable

### 3.3 Wells & permits (W-1)

**`public.w1fields`**  ·  16 columns  ·  rows: —
> id,fieldnumber,status_number,distance_to_nearest_well,distance_to_nearest_lease_line,completiondepth,welltype,district_code,swr,pooled_or_unitized,perpendiculars,distanceone,directionone,distancetwo,directiontwo,fieldname

**`public.w1permit_latitude`**  ·  5 columns  ·  rows: —
> id,status_number,status,column_updated,lease_number

**`public.w1permits`**  ·  28 columns  ·  rows: 849,825
> id,api,status_number,issued_date,status,filed,wellboreprofiles,filing_purpose,swr,horizontal_wellbore,stacked_lateral_parent_well_dp,perpendiculars,distanceone,directionone,distancetwo,directiontwo,spud_date,drilling_completed_date,surface_casing_date,completed_date,validated_date,status_suffix,submit_date,isscrape,new_api,updated_date,firstactivity_date,old_api

**`public.w1wells`**  ·  34 columns  ·  rows: 864,983
> id,status_number,district_code,lease_number,originaloperator_number,currentoperate_number,well_number,total_depth,well_status_code,completed_well_type,distance_from_nearest_town,direction_from_nearest_town,nreatest_town,surface_location_type,nad27latdegrees,nad27latminutes,nad27latseconds,nad27longidegrees,nad27longiminutes,nad27longiseconds,nad27x,nad27y,nad27lat,nad27longi,nad83lat,nad83longi,stateplanezone,lease_name,nadtype,latitude,longitude,county,final_lat,final_long

### 3.4 Completions & tests (W-2)

**`public.completion_form_summary`**  ·  24 columns  ·  rows: 309,511
> tracking_no,district_code,lease_number,wellnumber,field_number,county,api14,operator_number,status,lease_name,filing_purpose,filing_type,filing_welltype,recompletiondate,permit_number,submit_date,wellboreprofile,HWB_completion,Parent_permit,D_severance,operator_name,field_name,api10,Lease_id

**`public.gastestdata`**  ·  15 columns  ·  rows: 40,175
> tracking_no,testdate,gasvolume,oilvolume,watervolume,gashaydroratio,tubingpressure,chokesize,casingpressure,shutinpressure,sepoperatingpressure,stocktankcolor,sepliquidgravity,gasgravity,id

**`scrapy_data.w2_acidfracture`**  ·  8 columns  ·  rows: —
> id,tracking_no,ishydraulicfracturing,isdownholeactuationsleeve,actuationpressure,psigpriorhydrafracturing,psigduringhydrafracturing,isswr29

**`scrapy_data.w2_casingrecords`**  ·  14 columns  ·  rows: —
> id,tracking_no,fieldname,casingtype,casingsize,holesize,settingdepth,multistagetooldepth,multistageshoedepth,cementclass,cementamount,slurryvolume,cementtop,tocdeterminedby

**`public.w2_completion_informations`**  ·  38 columns  ·  rows: —
> id,tracking_no,submit_date,spud_date,firstproduction_date,drillingoperation_date,producingwells,nearestwelldistance,elevation,completiontype,surfacecasingrotationtime,iscementingaffidavit,isrecompletionreclass,ismultiplecompletion,logsruntype,wellboreprofile,logs_description,locationfromleaseboundry,horizwbcompletiontype,stackedlateralparentchildwell,slrecorddrillingpermitno,horizontaldepthseverance,leaseacres,totaltvd,totalmd,plugbacktvd,plugbackmd,gau_depth,swr_depth,depth_date,drillingoperation_enddate,elevation_type,offlease,inclination,feet1,feet2,line1,line2

**`public.w2_completionattachment`**  ·  6 columns  ·  rows: —
> id,tracking_no,attachment,status,attachmentlink,attachmentupdateddate

**`public.w2_completions`**  ·  18 columns  ·  rows: 326,844
> id,tracking_no,api,operator_number,fieldnumber,lease_number,district_code,status,completion_date,iscurrent,new_api,updated_date,permitnumber,lease_name,updated_lease_name,old_api,W2/G1_Available,rrc_available

**`public.w2_completionwells`**  ·  22 columns  ·  rows: —
> id,api,district_code,lease_number,originaloperator_number,tracking_no,wellnumber,drillingpermitno,packettype,fieldno,location,county,completionlat,completionlong,section,block,survey,abstract,welllocation,directionfrom,milesin,new_api

**`scrapy_data.w2_fielddata_pressurecalculations`**  ·  9 columns  ·  rows: —
> id,tracking_no,gravitydrygas,gasliquidhydroratio,avgshutintemp,gravityliquidhydrocarbons,gravitymixture,bottomholetempdepth,tempinft

**`public.w2_fillinginformations`**  ·  6 columns  ·  rows: —
> id,tracking_no,fillingpurpose,completiontype,welltype,completiondate

**`public.w2_formationrecordchild`**  ·  5 columns  ·  rows: —
> id,tracking_no,formationrecord_id,doproducinginterval,iscompletion

**`public.w2_formationrecords`**  ·  8 columns  ·  rows: —
> id,tracking_no,formations,encountered,tvd,md,isformationisolated,remarks

**`public.w2_initialpotential_testdata`**  ·  18 columns  ·  rows: —
> id,tracking_no,test_date,productionmethod,testedhours,chokesize,oilprodpriortest,isswabused,oil,gas,gasoilratio,flowingtubingpressure,water,oil24hr,gas24hr,oilgravity24hr,casingpressure24hr,water24hr

**`public.w2_intervals`**  ·  5 columns  ·  rows: —
> id,tracking_no,isopenhole,frominterval,tointerval

**`scrapy_data.w2_linearrecords`**  ·  11 columns  ·  rows: —
> id,tracking_no,linersize,holesize,linertop,linerbottom,cementclass,cementamount,slurryvolume,cementtop,tocdeterminedby

**`public.w2_permittypes`**  ·  5 columns  ·  rows: —
> id,tracking_no,permittype,permitdate,permitnumber

**`scrapy_data.w2_remarks`**  ·  3 columns  ·  rows: —
> id,tracking_no,remarks

**`scrapy_data.w2_tubingrecords`**  ·  5 columns  ·  rows: —
> id,tracking_no,size,depthsize,packerdepthtype

### 3.5 Geospatial / directional

**`scrapy_data.bottomlocation`**  ·  19 columns  ·  rows: 2,945,691
> id,bottomholeid,surfaceid,apinumber,stcode,wellnumber,bottomholelatitude27,bottomholelongitude27,bottomholelatitude83,bottomholelongitude83,well_locationid,symnum,reliab,out_fips,radioact,wellid,xnad27,ynad27,updated_date

**`public.directional_survey`**  ·  8 columns  ·  rows: 68,979
> id,filename,apinumber,tracking_no,status,new_api,updated_date,file_type

**`public.directional_survey_child`**  ·  11 columns  ·  rows: ~7,990,000
> id,directionalsurvey_id,md,inclinationangle,azimuth,tvd,calculatedtvd,x,y,calculatedx,calculatedy

**`public.directional_survey_exceptions`**  ·  5 columns  ·  rows: —
> id,directionalsurvey_id,exceptionmessage,rownumber,columnnumber

**`scrapy_data.surfacelocation`**  ·  16 columns  ·  rows: 96,936
> id,surfaceid,surfacelatitude27,surfacelongitude27,bottomholelatitude27,bottomholelongitude27,well_locationid,surfacelatitude83,surfacelongitude83,apinumber,symnum,reliab,wellid,xnad27,ynad27,updated_date

**`scrapy_data.well_location`**  ·  3 columns  ·  rows: —
> id,surface_filename,bottom_filename

### 3.6 Production (RRC lease-cycle)

**`scrapy_data.og_lease_cycle_disposition`**  ·  53 columns  ·  rows: 151,439
> oil_gas_code,district_no,lease_no,cycle_year,cycle_month,operator_no,field_no,cycle_year_month,lease_oil_dispcd00_vol,lease_oil_dispcd01_vol,lease_oil_dispcd02_vol,lease_oil_dispcd03_vol,lease_oil_dispcd04_vol,lease_oil_dispcd05_vol,lease_oil_dispcd06_vol,lease_oil_dispcd07_vol,lease_oil_dispcd08_vol,lease_oil_dispcd09_vol,lease_oil_dispcd99_vol,lease_gas_dispcd01_vol,lease_gas_dispcd02_vol,lease_gas_dispcd03_vol,lease_gas_dispcd04_vol,lease_gas_dispcd05_vol,lease_gas_dispcd06_vol,lease_gas_dispcd07_vol,lease_gas_dispcd08_vol,lease_gas_dispcd09_vol,lease_gas_dispcd99_vol,lease_cond_dispcd00_vol,lease_cond_dispcd01_vol,lease_cond_dispcd02_vol,lease_cond_dispcd03_vol,lease_cond_dispcd04_vol,lease_cond_dispcd05_vol,lease_cond_dispcd06_vol,lease_cond_dispcd07_vol,lease_cond_dispcd08_vol,lease_cond_dispcd99_vol,lease_csgd_dispcde01_vol,lease_csgd_dispcde02_vol,lease_csgd_dispcde03_vol,lease_csgd_dispcde04_vol,lease_csgd_dispcde05_vol,lease_csgd_dispcde06_vol,lease_csgd_dispcde07_vol,lease_csgd_dispcde08_vol,lease_csgd_dispcde99_vol,district_name,lease_name,operator_name,field_name,record_status

**`public.og_lease_cycle_disposition_dec_2025`**  ·  52 columns  ·  rows: —
> oil_gas_code,district_no,lease_no,cycle_year,cycle_month,operator_no,field_no,cycle_year_month,lease_oil_dispcd00_vol,lease_oil_dispcd01_vol,lease_oil_dispcd02_vol,lease_oil_dispcd03_vol,lease_oil_dispcd04_vol,lease_oil_dispcd05_vol,lease_oil_dispcd06_vol,lease_oil_dispcd07_vol,lease_oil_dispcd08_vol,lease_oil_dispcd09_vol,lease_oil_dispcd99_vol,lease_gas_dispcd01_vol,lease_gas_dispcd02_vol,lease_gas_dispcd03_vol,lease_gas_dispcd04_vol,lease_gas_dispcd05_vol,lease_gas_dispcd06_vol,lease_gas_dispcd07_vol,lease_gas_dispcd08_vol,lease_gas_dispcd09_vol,lease_gas_dispcd99_vol,lease_cond_dispcd00_vol,lease_cond_dispcd01_vol,lease_cond_dispcd02_vol,lease_cond_dispcd03_vol,lease_cond_dispcd04_vol,lease_cond_dispcd05_vol,lease_cond_dispcd06_vol,lease_cond_dispcd07_vol,lease_cond_dispcd08_vol,lease_cond_dispcd99_vol,lease_csgd_dispcde01_vol,lease_csgd_dispcde02_vol,lease_csgd_dispcde03_vol,lease_csgd_dispcde04_vol,lease_csgd_dispcde05_vol,lease_csgd_dispcde06_vol,lease_csgd_dispcde07_vol,lease_csgd_dispcde08_vol,lease_csgd_dispcde99_vol,district_name,lease_name,operator_name,field_name

**`scrapy_data.og_lease_cycle_disposition_dec_2025`**  ·  52 columns  ·  rows: —
> oil_gas_code,district_no,lease_no,cycle_year,cycle_month,operator_no,field_no,cycle_year_month,lease_oil_dispcd00_vol,lease_oil_dispcd01_vol,lease_oil_dispcd02_vol,lease_oil_dispcd03_vol,lease_oil_dispcd04_vol,lease_oil_dispcd05_vol,lease_oil_dispcd06_vol,lease_oil_dispcd07_vol,lease_oil_dispcd08_vol,lease_oil_dispcd09_vol,lease_oil_dispcd99_vol,lease_gas_dispcd01_vol,lease_gas_dispcd02_vol,lease_gas_dispcd03_vol,lease_gas_dispcd04_vol,lease_gas_dispcd05_vol,lease_gas_dispcd06_vol,lease_gas_dispcd07_vol,lease_gas_dispcd08_vol,lease_gas_dispcd09_vol,lease_gas_dispcd99_vol,lease_cond_dispcd00_vol,lease_cond_dispcd01_vol,lease_cond_dispcd02_vol,lease_cond_dispcd03_vol,lease_cond_dispcd04_vol,lease_cond_dispcd05_vol,lease_cond_dispcd06_vol,lease_cond_dispcd07_vol,lease_cond_dispcd08_vol,lease_cond_dispcd99_vol,lease_csgd_dispcde01_vol,lease_csgd_dispcde02_vol,lease_csgd_dispcde03_vol,lease_csgd_dispcde04_vol,lease_csgd_dispcde05_vol,lease_csgd_dispcde06_vol,lease_csgd_dispcde07_vol,lease_csgd_dispcde08_vol,lease_csgd_dispcde99_vol,district_name,lease_name,operator_name,field_name

**`scrapy_data.og_lease_cycle_production`**  ·  33 columns  ·  rows: 703,676
> oil_gas_code,district_no,lease_no,cycle_year,cycle_month,cycle_year_month,lease_no_district_no,operator_no,field_no,field_type,gas_well_no,prod_report_filed_flag,lease_oil_prod_vol,lease_oil_allow,lease_oil_ending_bal,lease_gas_prod_vol,lease_gas_allow,lease_gas_lift_inj_vol,lease_cond_prod_vol,lease_cond_limit,lease_cond_ending_bal,lease_csgd_prod_vol,lease_csgd_limit,lease_csgd_gas_lift,lease_oil_tot_disp,lease_gas_tot_disp,lease_cond_tot_disp,lease_csgd_tot_disp,district_name,lease_name,operator_name,field_name,record_status

**`public.og_lease_cycle_production_dec_2025`**  ·  32 columns  ·  rows: —
> oil_gas_code,district_no,lease_no,cycle_year,cycle_month,cycle_year_month,lease_no_district_no,operator_no,field_no,field_type,gas_well_no,prod_report_filed_flag,lease_oil_prod_vol,lease_oil_allow,lease_oil_ending_bal,lease_gas_prod_vol,lease_gas_allow,lease_gas_lift_inj_vol,lease_cond_prod_vol,lease_cond_limit,lease_cond_ending_bal,lease_csgd_prod_vol,lease_csgd_limit,lease_csgd_gas_lift,lease_oil_tot_disp,lease_gas_tot_disp,lease_cond_tot_disp,lease_csgd_tot_disp,district_name,lease_name,operator_name,field_name

**`scrapy_data.og_lease_cycle_production_dec_2025`**  ·  32 columns  ·  rows: —
> oil_gas_code,district_no,lease_no,cycle_year,cycle_month,cycle_year_month,lease_no_district_no,operator_no,field_no,field_type,gas_well_no,prod_report_filed_flag,lease_oil_prod_vol,lease_oil_allow,lease_oil_ending_bal,lease_gas_prod_vol,lease_gas_allow,lease_gas_lift_inj_vol,lease_cond_prod_vol,lease_cond_limit,lease_cond_ending_bal,lease_csgd_prod_vol,lease_csgd_limit,lease_csgd_gas_lift,lease_oil_tot_disp,lease_gas_tot_disp,lease_cond_tot_disp,lease_csgd_tot_disp,district_name,lease_name,operator_name,field_name

**`public.oil_gas_production_well_data`**  ·  5 columns  ·  rows: —
> cycle_year,oil,gas,completion,permit

**`scrapy_data.production_county`**  ·  9 columns  ·  rows: —
> id,lease_name,lease_number,county,district_code,oil_bbl,casinghead_mcf,gw_gas_mcf,condensate_bbl

**`scrapy_data.production_county_april`**  ·  9 columns  ·  rows: —
> id,lease_name,lease_number,county,district_code,oil_bbl,casinghead_mcf,gw_gas_mcf,condensate_bbl

**`scrapy_data.production_county_nov`**  ·  9 columns  ·  rows: —
> id,lease_name,lease_number,county,district_code,oil_bbl,casinghead_mcf,gw_gas_mcf,condensate_bbl

### 3.7 Price & market

**`public.marketupdates`**  ·  8 columns  ·  rows: —
> id,symbolname,lastprice,change,changepercentage,currency,datetime,marketupdatetype

**`public.oil_gas_history_future`**  ·  14 columns  ·  rows: 565
> id,oilgasdate,month,year,oilprice,oilopen,oilhigh,oillow,oilvolume,gasprice,gasopen,gashigh,gaslow,gasvolume

**`public.oilgasfuturepricingdata`**  ·  14 columns  ·  rows: 232,316
> datafetcheddate,month,year,oilprice,oilopen,oilhigh,oillow,oilvolume,gasprice,gasopen,gashigh,gaslow,gasvolume,id

**`public.oilgashistorydata`**  ·  14 columns  ·  rows: 11,375
> oilgashistorydate,month,year,oilprice,oilopen,oilhigh,oillow,oilvolume,gasprice,gasopen,gashigh,gaslow,gasvolume,id

**`public.oilgaspricing`**  ·  14 columns  ·  rows: 324
> id,datafetcheddate,month,year,oilprice,oilopen,oilhigh,oillow,oilvolume,gasprice,gasopen,gashigh,gaslow,gasvolume

### 3.8 Pipeline & audit (scrapy_data)

**`scrapy_data.audit_marketdata`**  ·  7 columns  ·  rows: —
> id,scanlog_id,market_date,start_time,end_time,success,file_url

**`scrapy_data.audit_productpricing`**  ·  9 columns  ·  rows: —
> id,scanlog_id,month,year,date,start_time,end_time,success,snapshot_url

**`scrapy_data.audit_surfacebottomlocation`**  ·  8 columns  ·  rows: —
> id,scanlog_id,surfacebottomlocation_id,start_time,end_time,success,snapshot_url,well_locationid

**`scrapy_data.audit_w1permits`**  ·  8 columns  ·  rows: —
> id,status_number,status,snapshot_url,time,scanlog_id,exceptions,api_number

**`scrapy_data.audit_w2completions`**  ·  7 columns  ·  rows: —
> id,scanlog_id,tracking_no,start_time,end_time,pde_path,status

**`scrapy_data.invalid_data`**  ·  11 columns  ·  rows: —
> id,api_number,scanlog_id,scraper_type,error_message,creatts,tracking_no,status_number,district_code,lease_number,production_id

**`scrapy_data.scrape_session_log`**  ·  7 columns  ·  rows: —
> scanlog_id,start_time,end_time,success,totalrecords_pulled,totalrecords_needed,scraper_type

**`scrapy_data.scraper_exception_log`**  ·  8 columns  ·  rows: —
> id,process_id,process_code,exception_date,exception_text,tracking_no,status_number,createts

**`scrapy_data.scraper_exceptions`**  ·  10 columns  ·  rows: —
> id,api_number,scanlog_id,scraper_type,exception_text,createts,tracking_no,status_number,district_code,lease_number

**`scrapy_data.scraper_process_log`**  ·  8 columns  ·  rows: —
> id,process_date,process_code,start_time,additional_info1,additional_info2,is_success,end_time

**`scrapy_data.scrapy_exceptions`**  ·  6 columns  ·  rows: —
> id,scanlog_id,scraper_type,api_number,exceptions,creatts

### 3.9 App / misc

**`public.dailyleases`**  ·  29 columns  ·  rows: 12,951
> id,operator,location,acres,latest_activity,play_type,lease_status,field_name,lease_wells,first_activity_date,original_operator,district_code,lease_number,lease_name,state,latitude,longitude,county_no,active_lease_wells,field_number,forecast,iscompletion,hasgisdata,start_month,start_year,end_month,end_year,createddate,lease_type

**`public.field_report`**  ·  40 columns  ·  rows: 9,830
> id,field_number,field_name,oil_county_regular,oil_salt_dome,oil_field_location,oil_dont_permit,oil_schedule_remark,oil_comment,oil_rule_type,oil_depth,oil_lease_spacing,oil_well_spacing,oil_acres_perunit,oil_tolerance_perunit,oil_diagonal_code,oil_diagonal_max_len,gas_county_regular,gas_salt_dome,gas_field_location,gas_dont_permit,gas_schedule_remark,gas_comment,gas_rule_type,gas_depth,gas_lease_spacing,gas_well_spacing,gas_acres_perunit,gas_tolerance_perunit,gas_diagonal_code,gas_diagonal_max_len,api_number,surface_tolerance_box,collaborative_interval_box,first_last_box,perpendicular_leaseline_box,horizontal_to_vertical_dir_box,horizontal_to_horizontal_dir_box,overlap_distance_box,stacked_lateral_rule_box

**`public.new_wellbore_master`**  ·  29 columns  ·  rows: 179,709
> district_code,Api_No,county,Well_Type,lease_name,field_number,field_name,lease_number,well_number,operator_name,operator_number,LAST_PROD_YM,FIRST_PROD_DATE,filing_welltype,recompletiondate,wellboreprofiles,latest_spud_date,ALLOWABLE_FLAG,DRILLER_FLAG,id,exist_flag,api14,latitude,longitude,bhl_x,bhl_y,lease_acres,to_md,updated_date

**`public.well_count`**  ·  11 columns  ·  rows: —
> id,completionrecords,permitrecords,casingrecords,testrecords,county,wells,producing_well,oil_production,gas_production,mongomonthlyproductioncount

**`public.well_count_new`**  ·  8 columns  ·  rows: —
> id,completionrecords,permitrecords,casingrecords,testrecords,county,wells,producing_well

### 3.10 App / misc (SECURITY)

**`public.dblink_config`**  ·  7 columns  ·  rows: —
> id,ip_address,port,type,username,password,is_active

## 4. Sensitivity & security flags

| Flag | Where | Governing rule |
|---|---|---|
| 🔴 Plaintext credentials | `public.dblink_config` (`ip_address, port, username, password, type, is_active`) | **Must** rotate; remove column; exclude from exports (F-DB-014) — `security-governance.md` |
| 🔴 PII at scale | `mineralowner_2023/2024` (~4.1M identities), `mineralownerproperty_2023/2024` (~9.7M rows) | **Must** encrypt at rest, access-control, define retention — `privacy-and-data-use-governance.md` |
| 🟠 SSOT ambiguity | `oil_gas_history_future` vs `oilgaspricing` vs `oilgashistorydata` vs `oilgasfuturepricingdata` | `oil_gas_history_future` is **canonical for MVestimate**; scope/deprecate the rest — `data-architecture-governance.md` |
| 🟠 Gap vs true-zero | `og_lease_cycle_production.prod_report` flag | `flag=N`+zero = gap (not a true zero) — `rrc-data-governance.md` |
| 🟠 Coordinate quirk | `bottomlocation`/`surfacelocation` (NAD27+NAD83); `bhl_x`=lat, `bhl_y`=long | Validate Texas bounds; handle datum + axis orientation — `map-gis-governance.md` |
| 🟢 In-DB governance | `public.schema_mappings` (`source_authority, schema_hash, drift_detected, human_reviewed, review_outcome`) | Existing RRC schema-drift tracking — `data-provenance-and-lineage-governance.md` |

## 5. MongoDB — analytics serving layer

Source: `June_2026_Mongo_DB_Backup`. Contents:

| Component | Description |
|---|---|
| `Linkage_data` DB | Per-county collections covering all of Texas (county-level well linkage) |
| Core collections | production, wells, allocation, linkage, operator (sampled for shape/schema) |
| Derived analytics | per-county well linkage, allocated production, acre/well "donut" percentiles, adjacency, county rollups, operator content |

MongoDB is **derived**: every analytics value must be reproducible from PostgreSQL + the documented methodology, and Mongo never overrides Postgres on a raw fact.

## 6. Pipeline relationship (confirmed)

`RRC scrape → PostgreSQL (scrapy_data + public) → allocation/transformation/valuation (Decline_curve, DeclineCurve2026, the MVestimate "108" repo [owner: Nikhil Salunke], New_Map_Final_Code, Operator-Directory) → MongoDB analytics → portal/map APIs → UI.` PostgreSQL = system of record; MongoDB = serving layer.

## 7. Why this inventory is governance-critical

- **PII scale** — the mineral-owner tables are the platform's primary privacy exposure (~4.1M identities, ~9.7M property rows), which is why backups are tightly controlled.
- **Embedded credentials** — `dblink_config` proves secrets live in the data layer, not just code, making export deny-lists mandatory.
- **Price-deck ambiguity** — four overlapping price tables create a real single-source-of-truth risk for MVestimate; only `oil_gas_history_future` is canonical for valuation.
- **Vintage correctness** — the `prod_report` flag and the snapshot tables are what let the platform distinguish a true zero from an unreported gap.

## 8. Evidence notes

Column lists and table set are taken directly from the 2026-06 PostgreSQL dump. Row counts marked with figures are from verified counts during analysis; `—` means not separately counted this pass. MongoDB collection-level detail is from prior-session analysis and should be re-verified against the live backup.

---

## Addendum (2026-07-02) — production PostgreSQL backup analysed

The June 2026 production PostgreSQL backup (`Postgress_Production_Backup`, **526 table exports, ~29.8 GB uncompressed**) has been analysed and documented:
- **`database-and-schema-governance.md`** — governance rules, canonical keys, data-domain ownership (RACI), provenance/vintage, privacy/security, backup scope, and schema-change control.
- **`database-schema-reference.md`** — the exhaustive per-table inventory (every table by category with sizes + column counts, plus detailed columns for the business-critical tables).

Headline: three trees — `Production/public` (92 live-app tables, ~0.95 GB), `MviewDownload` (~28.5 GB data spine, incl. the ~22 GB RRC production/disposition), and `Archive` (~1.9 GB history). Canonical keys: API-14, lease_number+district, ownernumber, member_id, joined via `linkage_data_new`.
