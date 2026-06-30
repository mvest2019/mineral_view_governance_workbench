"""Governance Workbench v3 — workflow-centric intake & approval system.

Run:
    python governance_ui.py

Opens at http://127.0.0.1:5050.
"""
import os, re, json, subprocess, datetime, sqlite3, shutil, importlib.util, socket, time, zipfile, hashlib, difflib
from pathlib import Path
from xml.etree import ElementTree as ET
from flask import Flask, render_template, request, jsonify, abort, g, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import secrets as _secrets
import requests

BASE_DIR = Path(__file__).resolve().parent

# ------------- Configuration -------------
COMPANIES = {
    'MView': {
        'root': Path(r'C:\MineralView-Org'),
        'vault': Path(r'C:\MineralView-LegalVault'),
        'mirror': Path(r'C:\MineralView-Repos'),
        'gh_account': 'MVest2018',
        'name_full': 'Mineral View (MVest LLC)',
    },
}

REPO_CATEGORIES = [
    'Pricing', 'Vendor Feeds', 'Payments / Finance', 'Tax / Compliance',
    'Orders / Checkout', 'Shipping / Fulfillment', 'Notifications / Email',
    'Customer / CRM / Marketing', 'Web / Storefront', 'Mobile',
    'Analytics / ML', 'Admin / Ops', 'Governance / Legal', 'Unknown',
]

GOVERNANCE_FILE_CATEGORY_ORDER = [
    ('core', 'Core Governance'),
    ('drafts', 'Drafts & Build Prompts'),
    ('reviews', 'Reviews, Findings & Drift'),
    ('systems', 'Repo & System Maps'),
    ('operations', 'Operations & Department Guides'),
    ('archive', 'Archive & Historical'),
    ('general', 'General'),
]

ASPECT_GROUP_RULES = {
    'MView': [
        {
            'name': 'Portal and Customer Experience',
            'description': 'Portal, customer-facing web experiences, messaging, and mobile touchpoints.',
            'repos': ['MineralView-Portal-Next', 'mview-platform-next15', 'Mview-Portal-Next', 'Mview-Portal-NextJS', 'MViewPortalUI', 'MViewPortalAPI', 'MView-Community-FE', 'mviewmessageAPI', 'mview-iOSApp', 'Mview-Cerebro-web'],
        },
        {
            'name': 'Data Ingestion and Scrapers',
            'description': 'Source-data ingestion, scraping, and inbound data collection.',
            'repos': ['CompletionScraper', 'DirectionalSurveyScraper', 'G5FormScraper', 'InvestorPresentationScraper', 'MarketUpdatesScraper', 'MineralRollScraper', 'ProductPricingScraper', 'Scrapers', 'W1PermitScraper', 'WellboreScraper', 'WellLocationScraper'],
        },
        {
            'name': 'Analytics, Estimation, and Modeling',
            'description': 'Valuation, decline curves, exploration notebooks, and analytical pipelines.',
            'repos': ['mvestimateAPI', 'MVestimateCalculator', 'MView-Analytics', 'MViewDataExploration', 'MviewDataExploreAPI', 'Decline_curve', 'DeclineCurve2026', 'DeclineCurveManualAnalysis2025', 'BuildSearchData4LeaseNWellRpts', 'VolumeReaderfromxls', 'OneTimeMonthlyVolumePopulation'],
        },
        {
            'name': 'GIS and Spatial Workflows',
            'description': 'Lease, well, GIS, and geospatial enrichment pipelines.',
            'repos': ['gis-poc', 'OTPopulateLeaseGISInfo', 'WellLocationScraper', 'DirectionalSurveyScraper'],
        },
        {
            'name': 'Presentations and Investor Outputs',
            'description': 'Investor decks, presentation sites, and presentation generation.',
            'repos': ['GenerateInvestorPresentations', 'Mview-Presentation-Next', 'PresentationSiteAPI', 'InvestorPresentationScraper'],
        },
        {
            'name': 'News and Market Updates',
            'description': 'Content generation and update distribution for news and market changes.',
            'repos': ['W1NewsGeneration', 'W2NewsGeneration', 'mineralview-weekly', 'MarketUpdatesScraper'],
        },
        {
            'name': 'Ops, Backups, and Utility Jobs',
            'description': 'Operational maintenance, backups, and recurring platform utility jobs.',
            'repos': ['Daily-Production-Backup', 'Daily-Production-Backups', 'OneTimeMonthlyVolumePopulation'],
        },
        {
            'name': 'APIs and Internal Services',
            'description': 'Service APIs, Cerebro surfaces, and internal platform services.',
            'repos': ['CerebroAPI', 'CerebroAPIs', 'W2API'],
        },
    ],
}

TEAM_MEMBER_PROFILES = {
    'MView': {
        'Ryan_Cochran': {
            'role': 'Owner / Operator',
            'purpose': 'Owns governance, final business decisions, and cross-team routing for Mineral View.',
            'departments': [
                'DATA_SCIENCE',
                'PLATFORM_INFRASTRUCTURE',
                'INVESTOR_RELATIONS',
                'LAND_TITLE',
                'RESERVOIR',
                'ROYALTY_ACCOUNTING',
                'DEVELOPMENT',
            ],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\EMPLOYEE_TASKS\Ryan_Cochran\_README.md',
            ],
        },
        'Sachin_Shinde': {
            'role': '',
            'purpose': 'Mineral View team member.',
            'departments': [],
            'repos': [],
            'operating_sources': [],
        },
        'Nikhil_Salunke': {
            'role': 'Data Scientist',
            'purpose': 'Leads large-scale oil and gas data collection, processing, validation, analytics, workflow verification, and AI-driven data-solution work across Mineral View, with strong hands-on ownership of production, lease, well, ownership, and Mvestimate-related data systems.',
            'departments': ['DATA_SCIENCE', 'DATA_ACQUISITION', 'DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE', 'RESERVOIR', 'LAND_TITLE', 'REPORTING', 'RISK_SECURITY'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\EMPLOYEE_TASKS\Nikhil_Salunke\PRIORITY_QUESTIONS_FOR_NIKHIL_SALUNKE_RESOLVED_v1.md',
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Gabor_Korosi': {
            'role': 'Data Scientist',
            'purpose': 'Works with Nikhil Salunke and Christos Batsios on Mineral View process improvements, data quality, and insight generation. Confirmed as MView contractor (memory: bold_dev_team.md, 2026-05-02).',
            'departments': ['DATA_SCIENCE', 'RESERVOIR', 'DEVELOPMENT'],
            'repos': [],
            'operating_sources': [],
        },
        'Christos_Batsios': {
            'role': 'Data Scientist',
            'purpose': 'Works with Nikhil Salunke and Gabor Korosi on Mineral View process improvements, data quality, and insight generation. Confirmed as MView contractor (memory: bold_dev_team.md, 2026-05-02).',
            'departments': ['DATA_SCIENCE', 'LAND_TITLE', 'DEVELOPMENT'],
            'repos': [],
            'operating_sources': [],
        },
        'Pranav_Nandeshwar': {
            'role': 'Data Scientist',
            'purpose': 'Builds production-grade data systems and AI-driven analytical engines across Mineral View, including production allocation, BOE forecasting, linkage optimization, geospatial workflows, cashflow modeling, monthly reporting, and activity notification systems.',
            'departments': ['DATA_SCIENCE', 'DATA_ACQUISITION'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Aboli_Mundralkar': {
            'role': 'Frontend Developer',
            'purpose': 'Builds responsive and scalable frontend interfaces, interactive UI components, API-integrated features, debugging and testing support, and continuous frontend improvements for Mineral View.',
            'departments': ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\EMPLOYEE_TASKS\Aboli_Mundralkar\PRIORITY_QUESTIONS_FOR_ABOLI_MUNDRALKAR_RESOLVED_v1.md',
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Utkarsha_Chougule': {
            'role': 'QA Tester',
            'purpose': 'Handles manual testing, regression and functional validation, UI responsiveness checks, API testing, and bug verification across lease data, owner records, production data, notifications, GIS maps, and related Mineral View workflows.',
            'departments': ['DEVELOPMENT', 'LAND_TITLE', 'RESERVOIR', 'PLATFORM_INFRASTRUCTURE'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Shubham_Kamble': {
            'role': 'Content Writer',
            'purpose': 'Creates SEO-optimized Mineral View content around mineral rights, valuation, and energy-market topics, while supporting keyword strategy, guest posting, and digital content marketing initiatives.',
            'departments': ['MARKETING', 'CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Pragati_Dhumal': {
            'role': 'Frontend Developer',
            'purpose': 'Builds Next.js and React frontend features, reusable UI components, SSR and routing workflows, responsive layouts, performance improvements, and deployment validation for Mineral View.',
            'departments': ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\EMPLOYEE_TASKS\Pragati_Dhumal\PRIORITY_QUESTIONS_FOR_PRAGATI_DHUMAL_RESOLVED_v1.md',
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Pooja_Wable': {
            'role': 'Frontend Developer',
            'purpose': 'Builds responsive React and Next.js frontend workflows, dynamic data-visualization features, API integrations, performance improvements, and usability fixes across the Mineral View platform.',
            'departments': ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE', 'RESERVOIR'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\EMPLOYEE_TASKS\Pooja_Wable\PRIORITY_QUESTIONS_FOR_POOJA_WABLE_RESOLVED_v1.md',
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Vaishnavi_Dhawale': {
            'role': 'Backend Developer',
            'purpose': 'Builds and optimizes backend APIs, query performance, database structures, and business logic for owner search, lease claiming, reporting, and search workflows on Mineral View.',
            'departments': ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE', 'LAND_TITLE', 'REPORTING'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\EMPLOYEE_TASKS\Vaishnavi_Dhawale\PRIORITY_QUESTIONS_FOR_VAISHNAVI_DHAWALE_RESOLVED_v1.md',
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Riya_Wankhade': {
            'role': 'Web Scraper',
            'purpose': 'Extracts oil and gas data from RRC and related sources, reruns failed scrapers, resolves data mismatches, and maintains scraper output accuracy and production readiness.',
            'departments': ['DATA_ACQUISITION', 'DATA_SCIENCE', 'DEVELOPMENT'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Sanskriti_Choudante': {
            'role': 'Backend Developer',
            'purpose': 'Builds scalable backend systems and high-performance APIs with a focus on authentication, data-driven workflows, user activity tracking, and backend optimization.',
            'departments': ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE', 'DATA_SCIENCE'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Rohit_Pandey': {
            'role': 'Digital Marketing Executive',
            'purpose': 'Handles SEO, website-visibility improvements, analytics, technical optimization, and user-behavior monitoring for Mineral View.',
            'departments': ['MARKETING', 'CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Tushar_Patil': {
            'role': 'Backend Developer',
            'purpose': 'Builds and maintains scalable backend services and APIs, database schemas, performance tuning, backend debugging, and production issue resolution for Mineral View.',
            'departments': ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\EMPLOYEE_TASKS\Tushar_Patil\PRIORITY_QUESTIONS_FOR_TUSHAR_PATIL_RESOLVED_v1.md',
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Ajay_Landge': {
            'role': 'Business Development Executive',
            'purpose': 'Supports SEO, technical optimization, analytics, social media, and broader digital-growth activities to improve Mineral View visibility and engagement.',
            'departments': ['MARKETING', 'CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Tejas_Zurange': {
            'role': 'Video Editor',
            'purpose': 'Creates video content and AI-assisted visual storytelling assets for Mineral View digital marketing and audience engagement.',
            'departments': ['MARKETING'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Krishna_Sable': {
            'role': 'Business Development Executive',
            'purpose': 'Handles SEO, blog and landing-page optimization, link building, off-page SEO, and digital-growth activities to improve Mineral View visibility and engagement.',
            'departments': ['MARKETING', 'CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
        'Gautammi_Kamath': {
            'role': 'Sales Team Lead',
            'purpose': 'Leads sales and marketing efforts, customer calls, content and social activity, and product-feedback coordination to improve customer satisfaction and growth.',
            'departments': ['CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS', 'MARKETING'],
            'repos': [],
            'operating_sources': [
                r'C:\MineralView-Org\_GOVERNANCE\team_members\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
            ],
        },
    },
}

DEPARTMENT_ARCHITECTURE = {
    'shared': [
        {
            'key': 'ACCOUNTING',
            'name': 'Accounting',
            'description': 'GL, reconciliations, A/R, A/P, and accounting-system workflows.',
            'repos_by_company': {
                'MView': [],
            },
        },
        {
            'key': 'TAX_COMPLIANCE',
            'name': 'Tax & Compliance',
            'description': 'Tax filings, compliance checks, notices, and regulator-facing workflows.',
            'repos_by_company': {
                'MView': [],
            },
        },
        {
            'key': 'MARKETING',
            'name': 'Marketing',
            'description': 'Email campaigns, content, SEO, social, and audience targeting.',
            'repos_by_company': {
                'MView': ['mineralview-weekly', 'W1NewsGeneration', 'W2NewsGeneration'],
            },
        },
        {
            'key': 'DEVELOPMENT',
            'name': 'Development',
            'description': 'Engineering roster, code delivery, sprint work, and technical debt.',
            'repos_by_company': {
                'MView': ['MViewPortalAPI', 'MineralView-Portal-Next', 'CerebroAPI'],
            },
        },
        {
            'key': 'LEGAL',
            'name': 'Legal',
            'description': 'Contracts, legal vault indexing, terms, privacy, and dispute handling.',
            'repos_by_company': {
                'MView': [],
            },
        },
        {
            'key': 'PEOPLE',
            'name': 'People',
            'description': 'Employees, contractors, training, reviews, and people operations.',
            'repos_by_company': {
                'MView': [],
            },
        },
        {
            'key': 'FINANCE_TREASURY',
            'name': 'Finance / Treasury',
            'description': 'Cash flow, banking relationships, treasury policy, and exposure management.',
            'repos_by_company': {
                'MView': [],
            },
        },
        {
            'key': 'RISK_SECURITY',
            'name': 'Risk & Security',
            'description': 'Security incidents, fraud alerts, blacklist handling, and continuity planning.',
            'repos_by_company': {
                'MView': [],
            },
        },
        {
            'key': 'REPORTING',
            'name': 'Reporting / BI',
            'description': 'Executive dashboards, KPIs, reporting pipelines, and board-pack support.',
            'repos_by_company': {
                'MView': ['MView-Analytics', 'mvestimateAPI'],
            },
        },
    ],
    'MView': [
        {
            'key': 'DATA_SCIENCE',
            'name': 'Data Science',
            'description': 'Decline curve analysis, mineral estimation models, predictive analytics, and model workflows.',
            'repos': ['mvestimateAPI', 'MVestimateCalculator', 'Decline_curve', 'DeclineCurve2026', 'DeclineCurveManualAnalysis2025', 'MView-Analytics'],
        },
        {
            'key': 'DATA_ACQUISITION',
            'name': 'Data Acquisition',
            'description': 'Scrapers, ETL, and ingestion of permit, well, market, and production data.',
            'repos': ['CompletionScraper', 'DirectionalSurveyScraper', 'G5FormScraper', 'MarketUpdatesScraper', 'MineralRollScraper', 'ProductPricingScraper', 'Scrapers', 'W1PermitScraper', 'WellboreScraper', 'WellLocationScraper'],
        },
        {
            'key': 'PLATFORM_INFRASTRUCTURE',
            'name': 'Platform Infrastructure',
            'description': 'Shared backend, APIs, portal frameworks, authentication, and cross-product platform services.',
            'repos': ['mview-platform-next15', 'MineralView-Portal-Next', 'MViewPortalUI', 'MViewPortalAPI', 'MView-Community-FE', 'mviewmessageAPI', 'mview-iOSApp', 'Mview-Cerebro-web', 'CerebroAPI', 'CerebroAPIs'],
        },
        {
            'key': 'DEVOPS',
            'name': 'DevOps',
            'description': 'Deployments, backups, scheduled jobs, and environment operations.',
            'repos': ['Daily-Production-Backup', 'Daily-Production-Backups', 'OneTimeMonthlyVolumePopulation'],
        },
        {
            'key': 'INVESTOR_RELATIONS',
            'name': 'Investor Relations',
            'description': 'Investor-facing communications, updates, and presentation outputs.',
            'repos': ['GenerateInvestorPresentations', 'Mview-Presentation-Next', 'PresentationSiteAPI', 'InvestorPresentationScraper'],
        },
        {
            'key': 'RESERVOIR',
            'name': 'Reservoir',
            'description': 'Reservoir analysis, valuation, decline curves, and production interpretation.',
            'repos': ['mvestimateAPI', 'MVestimateCalculator', 'Decline_curve', 'DeclineCurve2026', 'MView-Analytics'],
        },
        {
            'key': 'LAND_TITLE',
            'name': 'Land & Title',
            'description': 'Lease, title, GIS, and land-positioning workflows.',
            'repos': ['OTPopulateLeaseGISInfo', 'gis-poc', 'WellLocationScraper', 'DirectionalSurveyScraper'],
        },
        {
            'key': 'OPERATORS',
            'name': 'Operators',
            'description': 'Operator-side data sources, well activity, and operational field intelligence.',
            'repos': ['WellboreScraper', 'W1PermitScraper', 'CompletionScraper', 'MarketUpdatesScraper'],
        },
        {
            'key': 'ROYALTY_ACCOUNTING',
            'name': 'Royalty Accounting',
            'description': 'Royalty statement handling, production backups, and periodic accounting workflows.',
            'repos': ['Daily-Production-Backup', 'Daily-Production-Backups', 'OneTimeMonthlyVolumePopulation', 'VolumeReaderfromxls'],
        },
    ],
}

WORKFLOW_STAGES = [
    'Uploaded', 'Stored', 'Parsed', 'AI Reviewed',
    'Findings Pending', 'Employee Questions Pending',
    'Ryan Questions Pending', 'Decision Drafting',
    'Awaiting Ryan Approval', 'Draft Governance Updated',
    'Awaiting Commit Approval', 'Committed', 'Pushed',
    'Constitution Candidate', 'Constitution Approved',
]

GATE_NAMES = [
    'Findings Approved', 'Employee Answered', 'Ryan Answered',
    'Decision Approved', 'Draft Governance Updated',
    'Commit Approved', 'Constitution Eligible',
]

DB_PATH = BASE_DIR / 'governance.db'
SETTINGS_PATH = BASE_DIR / 'local_settings.json'
GH_EXE = r'C:\Program Files\GitHub CLI\gh.exe'
GIT_EXE = r'C:\Program Files\Git\cmd\git.exe'
CLAUDE_EXE = shutil.which('claude')

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / 'templates'),
    static_folder=str(BASE_DIR / 'static'),
)

# ------------- Authentication -------------
_SECRET_FILE = BASE_DIR / '.workbench_secret'
def _load_secret_key():
    try:
        if _SECRET_FILE.exists():
            value = _SECRET_FILE.read_text(encoding='utf-8').strip()
            if value:
                return value
    except Exception:
        pass
    value = _secrets.token_hex(32)
    try:
        _SECRET_FILE.write_text(value, encoding='utf-8')
    except Exception:
        pass
    return value

app.secret_key = _load_secret_key()
PUBLIC_ENDPOINTS = {'login', 'signup', 'logout', 'static'}

@app.before_request
def require_login():
    if request.endpoint in PUBLIC_ENDPOINTS or request.endpoint is None:
        return
    if session.get('user_id'):
        return
    if request.path.startswith('/api/'):
        return jsonify({'error': 'auth_required'}), 401
    return redirect(url_for('login'))


# ------------- Database -------------
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(_):
    db = g.pop('db', None)
    if db: db.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS intake (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            employee TEXT,
            uploaded_at TEXT NOT NULL,
            source_type TEXT,
            ai_engines TEXT,
            note TEXT,
            stage TEXT NOT NULL DEFAULT 'Uploaded',
            blocker TEXT
        );
        CREATE TABLE IF NOT EXISTS intake_file (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            intake_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            saved_path TEXT NOT NULL,
            size_bytes INTEGER,
            FOREIGN KEY(intake_id) REFERENCES intake(id)
        );
        CREATE TABLE IF NOT EXISTS workflow_event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            intake_id INTEGER NOT NULL,
            stage TEXT NOT NULL,
            ts TEXT NOT NULL,
            actor TEXT,
            note TEXT,
            FOREIGN KEY(intake_id) REFERENCES intake(id)
        );
        CREATE TABLE IF NOT EXISTS gate (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            intake_id INTEGER NOT NULL,
            gate_name TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Not Started',
            approver TEXT,
            decided_at TEXT,
            note TEXT,
            FOREIGN KEY(intake_id) REFERENCES intake(id),
            UNIQUE(intake_id, gate_name)
        );
        CREATE TABLE IF NOT EXISTS link (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            intake_id INTEGER NOT NULL,
            kind TEXT NOT NULL,
            ref TEXT NOT NULL,
            FOREIGN KEY(intake_id) REFERENCES intake(id)
        );
        CREATE TABLE IF NOT EXISTS repo_classification (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            repo_name TEXT NOT NULL,
            observed_purpose TEXT,
            proposed_category TEXT,
            confidence TEXT,
            canonical_status TEXT,
            evidence TEXT,
            finding_link TEXT,
            question_link TEXT,
            approval_status TEXT DEFAULT 'PENDING',
            updated_at TEXT,
            UNIQUE(company, repo_name)
        );
        CREATE TABLE IF NOT EXISTS ai_run (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            intake_id INTEGER NOT NULL,
            engine TEXT NOT NULL,
            status TEXT NOT NULL,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            prompt_text TEXT,
            output_text TEXT,
            output_path TEXT,
            error_text TEXT,
            FOREIGN KEY(intake_id) REFERENCES intake(id)
        );
        CREATE TABLE IF NOT EXISTS ai_exchange (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            intake_id INTEGER NOT NULL,
            topic TEXT,
            source_engine TEXT NOT NULL,
            target_engine TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            source_run_id INTEGER,
            source_prompt TEXT,
            source_output TEXT,
            source_output_path TEXT,
            target_prompt TEXT,
            target_output TEXT,
            target_output_path TEXT,
            agreement_status TEXT DEFAULT 'Needs review',
            next_action TEXT DEFAULT 'Hold',
            error_text TEXT,
            FOREIGN KEY(intake_id) REFERENCES intake(id),
            FOREIGN KEY(source_run_id) REFERENCES ai_run(id)
        );
        CREATE TABLE IF NOT EXISTS question_assignment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            qid TEXT NOT NULL,
            assignee TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            note TEXT,
            UNIQUE(company, qid)
        );
        CREATE TABLE IF NOT EXISTS repo_understanding (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            department_key TEXT NOT NULL,
            repo_name TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'UNKNOWN',
            review_note TEXT,
            next_questions_note TEXT,
            reviewed_by TEXT,
            updated_at TEXT NOT NULL,
            UNIQUE(company, department_key, repo_name)
        );
        CREATE TABLE IF NOT EXISTS finding_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            fid TEXT NOT NULL,
            decision TEXT NOT NULL DEFAULT 'REVIEWED',
            reviewer TEXT NOT NULL,
            note TEXT,
            reviewed_at TEXT NOT NULL,
            UNIQUE(company, fid)
        );
        CREATE TABLE IF NOT EXISTS repo_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            repo_name TEXT NOT NULL,
            question_code TEXT NOT NULL,
            title TEXT NOT NULL,
            body_markdown TEXT NOT NULL,
            short_question TEXT,
            priority TEXT NOT NULL DEFAULT 'MEDIUM',
            status TEXT NOT NULL DEFAULT 'OPEN',
            source TEXT NOT NULL,
            source_ref TEXT NOT NULL,
            source_excerpt TEXT,
            primary_assignee TEXT,
            answer_markdown TEXT,
            review_note TEXT,
            reviewed_by TEXT,
            created_by TEXT NOT NULL DEFAULT 'generator',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(company, question_code)
        );
        CREATE INDEX IF NOT EXISTS idx_repo_questions_company_repo
            ON repo_questions(company, repo_name);
        CREATE INDEX IF NOT EXISTS idx_repo_questions_company_priority
            ON repo_questions(company, priority, updated_at);
        CREATE TABLE IF NOT EXISTS team_member_department_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            member_key TEXT NOT NULL,
            department_key TEXT NOT NULL,
            source TEXT NOT NULL DEFAULT 'manual',
            note TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(company, member_key, department_key)
        );
        CREATE TABLE IF NOT EXISTS meetings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            title TEXT NOT NULL,
            meeting_type TEXT NOT NULL DEFAULT 'other',
            organizer TEXT,
            meeting_date TEXT NOT NULL,
            note TEXT,
            notes_file_path TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS meeting_attendees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id INTEGER NOT NULL,
            team_member_key TEXT,
            external_name TEXT,
            external_email TEXT,
            attended INTEGER NOT NULL DEFAULT 1,
            follow_up_done INTEGER NOT NULL DEFAULT 0,
            follow_up_note TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(meeting_id) REFERENCES meetings(id)
        );
        CREATE TABLE IF NOT EXISTS meeting_action_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id INTEGER NOT NULL,
            owner_key TEXT,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(meeting_id) REFERENCES meetings(id)
        );
        CREATE TABLE IF NOT EXISTS team_member_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            member_key TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            saved_path TEXT NOT NULL,
            source_type TEXT NOT NULL DEFAULT 'document',
            note TEXT,
            ai_preference TEXT NOT NULL DEFAULT 'Claude',
            size_bytes INTEGER,
            uploaded_at TEXT NOT NULL,
            uploaded_by TEXT NOT NULL DEFAULT 'user'
        );
        CREATE TABLE IF NOT EXISTS team_member_file_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_file_id INTEGER NOT NULL,
            engine TEXT NOT NULL,
            status TEXT NOT NULL,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            doc_kind TEXT,
            confidence TEXT,
            summary_text TEXT,
            suggested_departments_json TEXT,
            raw_output_text TEXT,
            error_text TEXT,
            FOREIGN KEY(member_file_id) REFERENCES team_member_files(id)
        );
        CREATE TABLE IF NOT EXISTS team_member_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            team_member_key TEXT NOT NULL,
            question_code TEXT NOT NULL,
            title TEXT,
            body_markdown TEXT,
            priority TEXT NOT NULL DEFAULT 'MEDIUM',
            status TEXT NOT NULL DEFAULT 'NEW',
            source_file_id INTEGER,
            source_section TEXT,
            generated_by TEXT NOT NULL DEFAULT 'manual',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_human_touch_at TEXT,
            UNIQUE(company, question_code),
            FOREIGN KEY(source_file_id) REFERENCES team_member_files(id)
        );
        CREATE INDEX IF NOT EXISTS idx_team_member_questions_company_member
            ON team_member_questions(company, team_member_key, status, updated_at);
        CREATE TABLE IF NOT EXISTS team_member_question_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            answer_markdown TEXT,
            source_file_id INTEGER NOT NULL,
            source_section TEXT,
            match_confidence TEXT NOT NULL DEFAULT 'LOW',
            parsed_by TEXT NOT NULL DEFAULT 'manual',
            accepted_by_ryan INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY(question_id) REFERENCES team_member_questions(id),
            FOREIGN KEY(source_file_id) REFERENCES team_member_files(id)
        );
        CREATE INDEX IF NOT EXISTS idx_tm_question_answers_question
            ON team_member_question_answers(question_id, created_at);
        CREATE TABLE IF NOT EXISTS team_member_question_packets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            team_member_key TEXT NOT NULL,
            packet_version INTEGER NOT NULL,
            question_ids_json TEXT NOT NULL,
            exported_file_path TEXT NOT NULL,
            exported_at TEXT NOT NULL,
            exported_by TEXT NOT NULL DEFAULT 'Ryan',
            UNIQUE(company, team_member_key, packet_version)
        );
        CREATE TABLE IF NOT EXISTS team_member_correspondence_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            team_member_key TEXT NOT NULL,
            event_type TEXT NOT NULL,
            event_summary TEXT NOT NULL,
            actor TEXT NOT NULL,
            linked_file_id INTEGER,
            linked_question_id INTEGER,
            linked_packet_id INTEGER,
            created_at TEXT NOT NULL,
            FOREIGN KEY(linked_file_id) REFERENCES team_member_files(id),
            FOREIGN KEY(linked_question_id) REFERENCES team_member_questions(id),
            FOREIGN KEY(linked_packet_id) REFERENCES team_member_question_packets(id)
        );
        CREATE INDEX IF NOT EXISTS idx_tm_correspondence_company_member
            ON team_member_correspondence_log(company, team_member_key, created_at, id);
        CREATE TABLE IF NOT EXISTS team_member_question_ai_run (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_member_key TEXT NOT NULL,
            company TEXT NOT NULL,
            engine TEXT NOT NULL,
            action_type TEXT NOT NULL,
            status TEXT NOT NULL,
            started_at TEXT NOT NULL,
            completed_at TEXT,
            input_file_id INTEGER,
            prompt_text TEXT,
            output_text TEXT,
            output_path TEXT,
            error_text TEXT,
            FOREIGN KEY(input_file_id) REFERENCES team_member_files(id)
        );
    ''')
    existing_columns = {row[1] for row in conn.execute("PRAGMA table_info(team_member_files)").fetchall()}
    if 'file_purpose' not in existing_columns:
        conn.execute("ALTER TABLE team_member_files ADD COLUMN file_purpose TEXT NOT NULL DEFAULT 'other'")
    if 'linked_question_packet_id' not in existing_columns:
        conn.execute("ALTER TABLE team_member_files ADD COLUMN linked_question_packet_id INTEGER")
    if 'parsed_answer_count' not in existing_columns:
        conn.execute("ALTER TABLE team_member_files ADD COLUMN parsed_answer_count INTEGER NOT NULL DEFAULT 0")
    if 'generated_question_count' not in existing_columns:
        conn.execute("ALTER TABLE team_member_files ADD COLUMN generated_question_count INTEGER NOT NULL DEFAULT 0")
    meeting_columns = {row[1] for row in conn.execute("PRAGMA table_info(meetings)").fetchall()}
    if 'summary_text' not in meeting_columns:
        conn.execute("ALTER TABLE meetings ADD COLUMN summary_text TEXT")
    if 'summary_status' not in meeting_columns:
        conn.execute("ALTER TABLE meetings ADD COLUMN summary_status TEXT NOT NULL DEFAULT 'none'")
    if 'summary_engine' not in meeting_columns:
        conn.execute("ALTER TABLE meetings ADD COLUMN summary_engine TEXT")
    if 'priority_questions_json' not in meeting_columns:
        conn.execute("ALTER TABLE meetings ADD COLUMN priority_questions_json TEXT")
    if 'summary_generated_at' not in meeting_columns:
        conn.execute("ALTER TABLE meetings ADD COLUMN summary_generated_at TEXT")
    conn.commit()
    conn.close()


# ------------- Helpers -------------
def get_company(c):
    if c not in COMPANIES:
        abort(400, f'Unknown company: {c}')
    return COMPANIES[c]

def get_intake_dir(company):
    cfg = get_company(company)
    d = cfg['root'] / '_GOVERNANCE' / '_INTAKE'
    d.mkdir(parents=True, exist_ok=True)
    return d

def get_team_member_files_dir(company, member_key):
    cfg = get_company(company)
    safe_member = re.sub(r'[^A-Za-z0-9_]+', '_', str(member_key or 'unknown')).strip('_') or 'unknown'
    target = cfg['root'] / '_GOVERNANCE' / '_TEAM_MEMBER_FILES' / safe_member
    target.mkdir(parents=True, exist_ok=True)
    return target

TEAM_MEMBER_FILE_PURPOSE_BUCKETS = {
    'initial_doc': 'inbound',
    'answer_packet': 'answers',
    'supporting_evidence': 'supporting',
    'meeting_note': 'supporting',
    'outbound_packet': 'outbound',
    'other': 'inbound',
}

TEAM_MEMBER_QUESTION_STATUS_ORDER = [
    'NEW',
    'SUGGESTED_FOLLOW_UP',
    'SENT_TO_TEAM_MEMBER',
    'ANSWERED',
    'ANSWER_PENDING_REVIEW',
    'NEEDS_FOLLOW_UP',
    'APPROVED',
    'CLOSED',
]

def normalize_team_member_file_purpose(value):
    key = str(value or 'other').strip().lower()
    if key not in TEAM_MEMBER_FILE_PURPOSE_BUCKETS:
        return 'other'
    return key

def get_team_member_bucket_dir(company, member_key, file_purpose='other'):
    root = get_team_member_files_dir(company, member_key)
    bucket = TEAM_MEMBER_FILE_PURPOSE_BUCKETS.get(normalize_team_member_file_purpose(file_purpose), 'inbound')
    target = root / bucket
    target.mkdir(parents=True, exist_ok=True)
    return target

def get_team_member_correspondence_markdown_path(company, member_key):
    return get_team_member_files_dir(company, member_key) / 'correspondence_log.md'

def parse_questions(md_text):
    questions = []
    blocks = re.split(r'^### (Q-[A-Z0-9\-]+)\s+[—-]\s+(.+?)$', md_text, flags=re.MULTILINE)
    for i in range(1, len(blocks), 3):
        qid, title = blocks[i], blocks[i+1].strip()
        body = blocks[i+2] if i+2 < len(blocks) else ''
        priority = re.search(r'\*\*(?:6\. )?Priority\*\*\s*[—-]?\s*(\w+)', body, re.IGNORECASE)
        status = re.search(r'\*\*Status:\*\*\s*([A-Z_()\d ]+)', body)
        short_q = re.search(r'\*\*1\. Short Question\*\*\s*[—-]?\s*(.+?)$', body, re.MULTILINE)
        blocks_field = re.search(r'\*\*(?:7\. )?Blocks\*\*\s*[—-]?\s*(.+?)$', body, re.MULTILINE)
        questions.append({
            'qid': qid, 'title': title,
            'priority': (priority.group(1).upper() if priority else 'UNKNOWN'),
            'status': (status.group(1).strip() if status else 'OPEN'),
            'short_question': (short_q.group(1).strip() if short_q else ''),
            'blocks': (blocks_field.group(1).strip() if blocks_field else ''),
            'body': body.strip()[:3000],
        })
    return questions

def extract_doc_reference_names(blocks_text):
    if not blocks_text:
        return []
    refs = re.findall(r'([A-Za-z0-9_\- ]+\.md)', blocks_text)
    cleaned = []
    for ref in refs:
        ref = ref.strip().strip('`').replace(' ', '')
        if ref:
            cleaned.append(ref)
    return list(dict.fromkeys(cleaned))

def extract_alias_reference_names(blocks_text):
    aliases = []
    if not blocks_text:
        return aliases
    if 'Operating Constitution' in blocks_text:
        aliases.append('Operating_Constitution.md')
    if 'Decision-Authority Matrix' in blocks_text:
        aliases.append('00_MASTER_GOVERNANCE_ARCHITECTURE.md')
    if 'Risk Register' in blocks_text:
        aliases.append('00_MASTER_GOVERNANCE_ARCHITECTURE.md')
    if 'Customer Strategy' in blocks_text:
        aliases.append('Business_Model.md')
    if 'Pricing Policy' in blocks_text:
        aliases.append('00_MASTER_GOVERNANCE_ARCHITECTURE.md')
    return list(dict.fromkeys(aliases))

def summarize_non_negotiables(doc_text):
    match = re.search(r'## Confirmed Non-Negotiables\s*(.+?)(?:\n## |\Z)', doc_text, re.DOTALL)
    if not match:
        return []
    section = match.group(1)
    rules = re.findall(r'###\s+\d+\.\s+([^\n]+)', section)
    return rules[:12]

def summarize_markdown_context(filename, doc_text):
    if filename == '03_NON_NEGOTIABLES.md':
        rules = summarize_non_negotiables(doc_text)
        if rules:
            return {
                'kind': 'non_negotiables',
                'summary': 'Current draft list of confirmed non-negotiables referenced by this question.',
                'items': rules,
            }
    section_summary = re.search(r'## Section Summary\s*(.+?)(?:\n## |\Z)', doc_text, re.DOTALL)
    if section_summary:
        summary = ' '.join(section_summary.group(1).split())
        return {
            'kind': 'summary',
            'summary': summary[:420],
            'items': [],
        }
    first_heading = re.search(r'## [^\n]+\s*(.+?)(?:\n## |\Z)', doc_text, re.DOTALL)
    if first_heading:
        summary = ' '.join(first_heading.group(1).split())
        return {
            'kind': 'summary',
            'summary': summary[:420],
            'items': [],
        }
    return None

def build_question_context(cfg, question):
    gov_dir = cfg['root'] / '_GOVERNANCE'
    refs = extract_doc_reference_names(question.get('blocks', '')) + extract_alias_reference_names(question.get('blocks', ''))
    context_items = []
    seen = set()
    for ref in refs:
        if ref in seen:
            continue
        seen.add(ref)
        path = gov_dir / ref
        if not path.exists():
            continue
        try:
            doc_text = path.read_text(encoding='utf-8', errors='replace')
        except Exception:
            continue
        summary = summarize_markdown_context(ref, doc_text)
        context_items.append({
            'file': ref,
            'exists': True,
            'summary': (summary or {}).get('summary', ''),
            'items': (summary or {}).get('items', []),
            'kind': (summary or {}).get('kind', 'summary'),
        })
    return context_items

def load_local_settings():
    if not SETTINGS_PATH.exists():
        return {}
    try:
        return json.loads(SETTINGS_PATH.read_text(encoding='utf-8'))
    except Exception:
        return {}

def save_local_settings(data):
    SETTINGS_PATH.write_text(json.dumps(data, indent=2), encoding='utf-8')

def resolve_company_paths():
    """Point the app at the _GOVERNANCE folder shipped in this bundle, wherever it is extracted, so
    every read AND write (intake uploads, drafts, decision log, glossary, etc.) uses that one folder.
    Priority:
      1) explicit overrides in local_settings.json: governance_root / vault_root / repos_root
      2) bundle layout: <bundle>/Governance_Files/_GOVERNANCE
         (this app lives in <bundle>/Governance_UI/governance-ui, so two levels up + Governance_Files)
      3) the C:\\MineralView-Org default already set on COMPANIES."""
    settings = load_local_settings()
    root = settings.get('governance_root')
    vault = settings.get('vault_root')
    mirror = settings.get('repos_root')
    if root:
        COMPANIES['MView']['root'] = Path(root)
    else:
        bundle_files = BASE_DIR.parent.parent / 'Governance_Files'
        if (bundle_files / '_GOVERNANCE').exists():
            COMPANIES['MView']['root'] = bundle_files
    if vault:
        COMPANIES['MView']['vault'] = Path(vault)
    if mirror:
        COMPANIES['MView']['mirror'] = Path(mirror)

resolve_company_paths()

def get_openai_api_key():
    return os.getenv('OPENAI_API_KEY') or load_local_settings().get('openai_api_key', '')

def get_openai_model():
    return os.getenv('OPENAI_MODEL') or load_local_settings().get('openai_model', 'gpt-5')

def call_claude_text(prompt, timeout=None):
    """Run the Claude CLI on a prompt (passed via stdin) and return (ok, text, error_message).
    Used by the Team Member AI actions so they can run on Claude instead of OpenAI."""
    if not command_exists(CLAUDE_EXE or 'claude'):
        return False, '', 'Claude CLI is not available on this machine.'
    if timeout is None:
        timeout = int(load_local_settings().get('claude_timeout', 600))
    try:
        result = subprocess.run(
            [CLAUDE_EXE or 'claude', '-p', '--allowedTools', 'Read'],
            capture_output=True, text=True, encoding='utf-8', errors='replace',
            input=prompt, timeout=timeout, cwd=str(BASE_DIR),
        )
        if result.returncode != 0:
            return False, '', (result.stderr or result.stdout or 'Claude request failed').strip()
        return True, result.stdout.strip(), ''
    except subprocess.TimeoutExpired:
        return False, '', 'Claude run timed out'
    except Exception as exc:
        return False, '', str(exc)

def mask_secret(value):
    value = value or ''
    if len(value) <= 10:
        return '*' * len(value)
    return value[:5] + '*' * 12 + value[-4:]

def pretty_member_name(member):
    return (member or '').replace('_', ' ').strip()

def pretty_department_name(department_key):
    return (department_key or '').replace('_', ' ').replace('/', ' / ').title().strip()

def question_is_unanswered(status_text):
    status = (status_text or '').strip().upper()
    return status not in {'RESOLVED', 'ANSWERED', 'CLOSED', 'DONE'}

def get_question_assignment_map(db, company):
    rows = db.execute("SELECT qid, assignee FROM question_assignment WHERE company=?", (company,)).fetchall()
    return {row['qid']: row['assignee'] for row in rows}

def get_repo_understanding_map(db, company):
    rows = db.execute(
        "SELECT * FROM repo_understanding WHERE company=? ORDER BY department_key, repo_name",
        (company,),
    ).fetchall()
    return {
        f"{row['department_key']}::{row['repo_name']}": dict(row)
        for row in rows
    }

def parse_findings(md_text):
    findings = []
    blocks = re.split(r'^### (F-\d+)\s+[—-]\s+(.+?)$', md_text, flags=re.MULTILINE)
    for i in range(1, len(blocks), 3):
        fid, title = blocks[i], blocks[i+1].strip()
        body = blocks[i+2] if i+2 < len(blocks) else ''
        ftype = re.search(r'\*\*Type:\*\*\s*([A-Z_]+)', body)
        scope = re.search(r'\*\*Owner Scope:\*\*\s*([^\n]+)', body)
        status = re.search(r'\*\*Status:\*\*\s*(\w+)', body)
        observation = re.search(r'\*\*Observation:\*\*\s*(.+?)(?=\n-|\n\*\*|\Z)', body, re.DOTALL)
        why = re.search(r'\*\*Why It Matters:\*\*\s*(.+?)(?=\n-|\n\*\*|\Z)', body, re.DOTALL)
        proposed = re.search(r'\*\*Proposed (?:Action|Destination)(?:\:|\*\*)\s*(.+?)(?=\n-|\n\*\*|\Z)', body, re.DOTALL)
        confidence = re.search(r'\*\*Confidence:\*\*\s*(\w+)', body)
        date_match = re.search(r'\*\*(?:Date|Detected|Added|Generated|Logged):\*\*\s*([^\n]+)', body)
        findings.append({
            'fid': fid, 'title': title,
            'type': (ftype.group(1) if ftype else 'UNKNOWN'),
            'scope': (scope.group(1).strip() if scope else ''),
            'status': (status.group(1) if status else 'PENDING'),
            'observation': (observation.group(1).strip() if observation else ''),
            'why_matters': (why.group(1).strip() if why else ''),
            'proposed': (proposed.group(1).strip() if proposed else ''),
            'confidence': (confidence.group(1) if confidence else None),
            'date': (date_match.group(1).strip() if date_match else None),
            'body': body.strip()[:2500],
        })
    return findings

def strip_markdown(value):
    text = str(value or '')
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'\[(.*?)\]\((.*?)\)', r'\1', text)
    text = text.replace('â€”', '-').replace('â€“', '-')
    text = re.sub(r'\s+', ' ', text)
    return text.strip(' -\t\r\n')

def normalize_repo_text(value):
    return re.sub(r'[^a-z0-9]+', ' ', str(value or '').lower()).strip()

def repo_text_aliases(repo_name):
    normalized = normalize_repo_text(repo_name)
    pieces = [piece for piece in normalized.split() if piece]
    aliases = set()
    ignored = {'bpm', 'bold', 'repo'}
    if normalized:
        aliases.add(normalized)
    trimmed = [piece for piece in pieces if piece not in ignored]
    if trimmed:
        aliases.add(' '.join(trimmed))
    if 'quickbook' in normalized or 'quickbooks' in normalized:
        aliases.add('quickbook')
        aliases.add('quickbooks')
    if repo_name:
        aliases.add(str(repo_name).lower())
    return [alias for alias in aliases if alias]

def text_mentions_repo(text, repo_name):
    haystack = normalize_repo_text(text)
    return any(alias in haystack for alias in repo_text_aliases(repo_name))

def repo_question_priority_rank(priority):
    order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    return order.get((priority or '').upper(), 9)

def repo_sheet_dir(company):
    cfg = get_company(company)
    return cfg['root'] / '_GOVERNANCE' / 'repo_sheets'

def repo_sheet_path(company, repo_name):
    return repo_sheet_dir(company) / f'{repo_name}.md'

def extract_numbered_markdown_section(md_text, section_number):
    pattern = rf'^## {section_number}\.\s+[^\n]+\n(.*?)(?=^## \d+\.\s+|\Z)'
    match = re.search(pattern, md_text, re.MULTILINE | re.DOTALL)
    return match.group(1).strip() if match else ''

def parse_markdown_bullets(section_text):
    bullets = []
    current = []
    for raw_line in section_text.splitlines():
        stripped = raw_line.strip()
        if stripped.startswith('- '):
            if current:
                bullets.append(strip_markdown(' '.join(current)))
            current = [stripped[2:].strip()]
        elif current and stripped and not stripped.startswith('## '):
            current.append(stripped)
    if current:
        bullets.append(strip_markdown(' '.join(current)))
    return [bullet for bullet in bullets if bullet]

def repo_question_slug(repo_name):
    slug = re.sub(r'[^a-z0-9]+', '-', str(repo_name or '').lower()).strip('-')
    return slug or 'repo'

def build_repo_question_code(repo_name, source, source_ref, title):
    fingerprint = hashlib.md5(f"{repo_name}|{source}|{source_ref}|{title}".encode('utf-8')).hexdigest()[:6]
    return f"RQ-{repo_question_slug(repo_name)}-{fingerprint}"

def infer_repo_question_priority(text, default='MEDIUM'):
    lower = (text or '').lower()
    if any(token in lower for token in ['critical', 'rotate immediately', 'hardcoded sql password', 'jwt_secret', '.env', '.p12', 'aws access key', 'trustservercertificate=true', 'tls verification disabled', 'secret', 'credential']):
        return 'CRITICAL'
    if any(token in lower for token in ['security', 'sql injection', 'dead code', 'boundary', 'verify', 'hardcoded', 'retry logic', 'unreachable', 'parameterized']):
        return 'HIGH'
    if any(token in lower for token in ['inferred', 'confirm', 'documented']):
        return 'MEDIUM'
    return default

def repo_security_register_path(company):
    cfg = get_company(company)
    return cfg['root'] / '_GOVERNANCE' / '_SECURITY_RISK_REGISTER.md'

def parse_security_register_blocks(md_text):
    blocks = []
    matches = list(re.finditer(r'^###\s+(.+)$', md_text, re.MULTILINE))
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(md_text)
        heading = strip_markdown(match.group(1))
        body = md_text[start:end].strip()
        severity_match = re.search(r'\*\*Severity:\*\*\s*([A-Z]+)', body)
        severity = severity_match.group(1).upper() if severity_match else ('CRITICAL' if 'CRITICAL' in heading.upper() else 'HIGH' if 'HIGH' in heading.upper() else 'MEDIUM')
        blocks.append({'heading': heading, 'body': body, 'severity': severity})
    return blocks

def build_repo_question_candidates(company, repo_name):
    candidates = []
    sheet_path = repo_sheet_path(company, repo_name)
    if sheet_path.exists():
        sheet_text = sheet_path.read_text(encoding='utf-8', errors='replace')
        observed_section = extract_numbered_markdown_section(sheet_text, 3)
        rules_section = extract_numbered_markdown_section(sheet_text, 5)
        open_questions_section = extract_numbered_markdown_section(sheet_text, 8)

        for index, bullet in enumerate(parse_markdown_bullets(observed_section), start=1):
            if 'INFERRED' not in bullet.upper():
                continue
            claim = re.sub(r'\bINFERRED\b', '', bullet, flags=re.IGNORECASE).strip(' -()')
            if not claim:
                continue
            candidates.append({
                'source': 'repo_sheet_section_3',
                'source_ref': f"repo_sheets/{repo_name}.md#section-3-item-{index}",
                'title': f"Verify inferred behavior in {repo_name}",
                'short_question': f"Verify whether this inferred repo behavior is correct: {claim}",
                'body_markdown': f"Verify the inferred claim for `{repo_name}`.\n\nClaim:\n- {claim}\n\nIf correct, confirm the behavior and point to the code or governance source that should document it.",
                'source_excerpt': claim,
                'priority': 'MEDIUM',
            })

        for index, bullet in enumerate(parse_markdown_bullets(rules_section), start=1):
            if bullet.lower().startswith('no business rules observed'):
                continue
            candidates.append({
                'source': 'repo_sheet_section_5',
                'source_ref': f"repo_sheets/{repo_name}.md#section-5-item-{index}",
                'title': f"Confirm business rule in {repo_name}",
                'short_question': f"Is this rule correct, and where is it documented: {bullet}",
                'body_markdown': f"Confirm the business rule observed in `{repo_name}` and identify the governance document that should own it.\n\nObserved rule:\n- {bullet}",
                'source_excerpt': bullet,
                'priority': infer_repo_question_priority(bullet, 'HIGH'),
            })

        for index, bullet in enumerate(parse_markdown_bullets(open_questions_section), start=1):
            clean_question = re.sub(r'^(Q:|SECURITY:)\s*', '', bullet, flags=re.IGNORECASE).strip()
            if not clean_question:
                continue
            candidates.append({
                'source': 'repo_sheet_section_8',
                'source_ref': f"repo_sheets/{repo_name}.md#section-8-item-{index}",
                'title': clean_question[:120],
                'short_question': clean_question,
                'body_markdown': f"Open repo question derived from the deep-read sheet for `{repo_name}`.\n\nQuestion:\n- {clean_question}",
                'source_excerpt': bullet,
                'priority': infer_repo_question_priority(bullet, 'HIGH'),
            })

    cfg = get_company(company)
    findings_path = cfg['root'] / '_GOVERNANCE' / '_FINDINGS_FOR_REVIEW.md'
    if findings_path.exists():
        for finding in parse_findings(findings_path.read_text(encoding='utf-8', errors='replace')):
            joined = ' '.join([
                finding.get('fid', ''),
                finding.get('title', ''),
                finding.get('scope', ''),
                finding.get('observation', ''),
                finding.get('proposed', ''),
            ])
            if not text_mentions_repo(joined, repo_name):
                continue
            candidates.append({
                'source': 'finding',
                'source_ref': f"_FINDINGS_FOR_REVIEW.md:{finding.get('fid', '')}",
                'title': f"Review finding {finding.get('fid', '')} for {repo_name}",
                'short_question': finding.get('title', '') or 'Review finding impact on this repo.',
                'body_markdown': f"Finding linked to `{repo_name}`.\n\nFinding ID: `{finding.get('fid', '')}`\nObservation: {finding.get('observation', '')}\nProposed action: {finding.get('proposed', '')}\n\nConfirm whether this finding still applies to the repo and what remediation or clarification is required.",
                'source_excerpt': strip_markdown(finding.get('observation', '') or finding.get('title', '')),
                'priority': infer_repo_question_priority(finding.get('title', '') + ' ' + finding.get('observation', ''), 'HIGH'),
            })

    security_path = repo_security_register_path(company)
    if security_path.exists():
        security_text = security_path.read_text(encoding='utf-8', errors='replace')
        for block in parse_security_register_blocks(security_text):
            haystack = ' '.join([block['heading'], block['body']])
            if not text_mentions_repo(haystack, repo_name):
                continue
            excerpt_match = re.search(rf'([^\n]*{re.escape(repo_name)}[^\n]*)', haystack, re.IGNORECASE)
            excerpt = strip_markdown(excerpt_match.group(1)) if excerpt_match else strip_markdown(block['heading'])
            candidates.append({
                'source': 'security_finding',
                'source_ref': f"{security_path.name}:{block['heading']}",
                'title': f"{block['severity']} security review for {repo_name}",
                'short_question': strip_markdown(block['heading']),
                'body_markdown': f"Security register entry linked to `{repo_name}`.\n\nHeading: {block['heading']}\nSeverity: {block['severity']}\n\nConfirm the current remediation status and whether the repo still has this exposure.",
                'source_excerpt': excerpt,
                'priority': 'CRITICAL' if block['severity'] == 'CRITICAL' else 'HIGH',
            })

    if not candidates:
        baseline = [
            ('purpose', 'HIGH', f"What is {repo_name} specifically responsible for in practice?"),
            ('owner', 'HIGH', f"Who currently owns {repo_name}, and when/how does it run?"),
            ('trigger', 'MEDIUM', f"What triggers {repo_name} to run (schedule, event, or manual)?"),
            ('systems', 'HIGH', f"What systems, vendors, or datasets does {repo_name} read from or write to?"),
            ('rules', 'HIGH', f"What business rules or exceptions are encoded in {repo_name}?"),
            ('governance', 'MEDIUM', f"Which governance document should own the rules and behavior of {repo_name}?"),
        ]
        for ref, prio, text in baseline:
            candidates.append({
                'source': 'baseline',
                'source_ref': f"baseline/{repo_name}#{ref}",
                'title': text[:120],
                'short_question': text,
                'body_markdown': (
                    f"Baseline governance question for `{repo_name}`.\n\n"
                    f"Question:\n- {text}\n\n"
                    "Answer with the current reality (owner, trigger, systems, and rules) "
                    "and note where this should be documented in governance."
                ),
                'source_excerpt': text,
                'priority': prio,
            })

    deduped = {}
    for candidate in candidates:
        key = (candidate['source'], candidate['source_ref'], candidate['short_question'])
        deduped[key] = candidate
    sorted_candidates = sorted(
        deduped.values(),
        key=lambda item: (
            repo_question_priority_rank(item.get('priority')),
            item.get('source_ref', ''),
            item.get('title', ''),
        ),
    )
    return sorted_candidates[:12]

def list_repo_questions(db, company, repo_name=None):
    sql = "SELECT * FROM repo_questions WHERE company=?"
    params = [company]
    if repo_name:
        sql += " AND repo_name=?"
        params.append(repo_name)
    sql += " ORDER BY repo_name, CASE priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 9 END, created_at"
    return [dict(row) for row in db.execute(sql, tuple(params)).fetchall()]

def _parse_repo_question_json(text):
    import json, re
    if not text:
        return []
    cleaned = text.strip()
    cleaned = re.sub(r'^```(json)?', '', cleaned).strip()
    cleaned = re.sub(r'```$', '', cleaned).strip()
    start = cleaned.find('[')
    end = cleaned.rfind(']')
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start:end + 1]
    try:
        data = json.loads(cleaned)
        if isinstance(data, list):
            return [d for d in data if isinstance(d, dict)]
    except Exception:
        return []
    return []


def build_repo_question_candidates_claude(company, repo_name):
    """Use Claude (grounded in the governance corpus) to draft repo-specific governance
    questions. Returns a list of candidate dicts, or [] if Claude is unavailable/fails."""
    if not command_exists(CLAUDE_EXE or 'claude'):
        return []
    try:
        gov = governance_context(company, max_chars=10000)
    except Exception:
        gov = ''
    dept_names = []
    try:
        for dept in departments_for_company(company, get_db()):
            if repo_name in (dept.get('repos') or []):
                dept_names.append(dept.get('name') or dept.get('key'))
    except Exception:
        pass
    dept_line = ', '.join(dept_names) if dept_names else 'unspecified'
    prompt = (
        "You are helping Mineral View build governance documentation for a code repository.\n\n"
        f"Repository: {repo_name}\n"
        f"Department(s) this repo is mapped to: {dept_line}\n\n"
        "Existing governance context (the approved source of truth):\n"
        f"{gov or '(no governance context available)'}\n\n"
        "Task: Draft 5-8 specific, high-value governance questions Mineral View must answer to "
        "fully document and govern this repository. Ground them in the governance context above "
        "where relevant (ownership, data handling, decision authority, backup, security, business "
        "rules). Each question must be concrete and answerable by the repo owner.\n\n"
        "Return ONLY a JSON array, no preamble or markdown fences. Each element:\n"
        '{"question": "<the question>", "priority": "HIGH|MEDIUM|LOW", "topic": "<short slug>"}'
    )
    ok, text, err = call_claude_text(prompt)
    if not ok or not text:
        return []
    items = _parse_repo_question_json(text)
    candidates = []
    for idx, item in enumerate(items, start=1):
        q = (item.get('question') or '').strip()
        if not q:
            continue
        prio = (item.get('priority') or 'MEDIUM').strip().upper()
        if prio not in ('HIGH', 'MEDIUM', 'LOW'):
            prio = 'MEDIUM'
        topic = (item.get('topic') or f'q{idx}').strip().replace(' ', '-')[:24]
        candidates.append({
            'source': 'claude',
            'source_ref': f"claude/{repo_name}#{topic}-{idx}",
            'title': q[:120],
            'short_question': q,
            'body_markdown': (
                f"Claude-drafted governance question for `{repo_name}` "
                "(grounded in the governance corpus).\n\n"
                f"Question:\n- {q}\n\n"
                "Answer with the current reality and note where this should be documented in governance."
            ),
            'source_excerpt': q,
            'priority': prio,
        })
    return candidates


def generate_repo_questions(company, repo_name, actor='generator'):
    db = get_db()
    now = datetime.datetime.now().isoformat()
    created = 0
    skipped = 0
    errors = []
    candidates = build_repo_question_candidates_claude(company, repo_name)
    engine_used = 'claude'
    if not candidates:
        candidates = build_repo_question_candidates(company, repo_name)
        engine_used = 'baseline'
    for candidate in candidates:
        question_code = build_repo_question_code(repo_name, candidate['source'], candidate['source_ref'], candidate['title'])
        existing = db.execute(
            "SELECT id FROM repo_questions WHERE company=? AND question_code=?",
            (company, question_code),
        ).fetchone()
        if existing:
            skipped += 1
            continue
        try:
            db.execute(
                """INSERT INTO repo_questions(
                       company, repo_name, question_code, title, body_markdown, short_question,
                       priority, status, source, source_ref, source_excerpt, primary_assignee,
                       answer_markdown, review_note, reviewed_by, created_by, created_at, updated_at
                   ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    company,
                    repo_name,
                    question_code,
                    candidate['title'],
                    candidate['body_markdown'],
                    candidate['short_question'],
                    candidate['priority'],
                    'OPEN',
                    candidate['source'],
                    candidate['source_ref'],
                    candidate.get('source_excerpt', ''),
                    'Ryan Cochran',
                    '',
                    '',
                    '',
                    actor,
                    now,
                    now,
                ),
            )
            created += 1
        except Exception as exc:
            errors.append(str(exc))
    db.commit()
    return {'repo_name': repo_name, 'created': created, 'skipped': skipped, 'errors': errors, 'engine': engine_used}

def generate_all_repo_questions(company, actor='generator'):
    sheet_root = repo_sheet_dir(company)
    results = []
    if not sheet_root.exists():
        return results
    for sheet_path in sorted(sheet_root.glob('*.md')):
        if sheet_path.name.startswith('_'):
            continue
        results.append(generate_repo_questions(company, sheet_path.stem, actor=actor))
    return results

# Employees who have left and must not appear anywhere in the workbench,
# even if a stale EMPLOYEE_TASKS folder still exists on disk.
REMOVED_EMPLOYEES = {
    'MView': {'Sanket_Nandanwar', 'Vedika_Kannawar', 'Dhiraj_Kakade', 'Ruchita_Vitkar'},
}

# Maps each specific job title (the single source of truth in TEAM_MEMBER_PROFILES)
# to the broad display group used in the Team Members UI. Edit profiles only; the UI follows.
ROLE_GROUP_MAP = {
    'Owner / Operator': '',
    'Data Scientist': 'Data Scientist',
    'Junior Data Scientist': 'Data Scientist',
    'Senior Data Scientist': 'Data Scientist',
    'Process and Data Lead': 'Data Scientist',
    'Frontend Developer': 'Developer',
    'Backend Developer': 'Developer',
    'Full Stack Developer': 'Developer',
    'Developer': 'Developer',
    'QA Tester': 'QA',
    'QA': 'QA',
    'Content Writer': 'Content Writer',
    'Web Scraper': 'Web Scraper',
    'Digital Marketing Executive': 'Marketing',
    'Business Development Executive': 'Marketing',
    'Marketing': 'Marketing',
    'Video Editor': 'Graphic',
    'Graphic Designer': 'Graphic',
    'Graphic': 'Graphic',
    'Sales Team Lead': 'Sales',
    'Sales': 'Sales',
}

def role_group(role):
    r = (role or '').strip()
    return ROLE_GROUP_MAP.get(r, r)

def list_employees(company):
    cfg = get_company(company)
    emp_dir = cfg['root'] / 'EMPLOYEE_TASKS'
    employees = set()
    if emp_dir.exists():
        employees.update(p.name for p in emp_dir.iterdir() if p.is_dir())
    employees.update((TEAM_MEMBER_PROFILES.get(company) or {}).keys())
    excluded = REMOVED_EMPLOYEES.get(company, set())
    employees = {e for e in employees if e not in excluded}
    if not employees:
        return ['Ryan_Cochran']
    employees = sorted(employees)
    if 'Ryan_Cochran' in employees:
        employees.remove('Ryan_Cochran')
        employees.insert(0, 'Ryan_Cochran')
    else:
        employees.insert(0, 'Ryan_Cochran')
    return employees

def get_team_member_department_tags_map(db, company):
    rows = db.execute(
        """SELECT member_key, department_key, source, note, updated_at
           FROM team_member_department_tags
           WHERE company=?
           ORDER BY member_key, department_key""",
        (company,)
    ).fetchall()
    grouped = {}
    for row in rows:
        grouped.setdefault(row['member_key'], []).append(dict(row))
    return grouped

def merged_departments_for_member(company, member_key, db=None):
    own_db = False
    if db is None:
        db = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
        own_db = True
    try:
        static_departments = set(get_team_member_profile(company, member_key).get('departments') or [])
        manual_departments = {
            row['department_key']
            for row in db.execute(
                "SELECT department_key FROM team_member_department_tags WHERE company=? AND member_key=?",
                (company, member_key),
            ).fetchall()
        }
        return sorted(static_departments | manual_departments)
    finally:
        if own_db:
            db.close()

def meetings_dir_for_company(company):
    target = get_company(company)['root'] / '_GOVERNANCE' / '_MEETINGS'
    target.mkdir(parents=True, exist_ok=True)
    return target

def save_meeting_notes_file(company, file_storage, meeting_date, title):
    suffix = Path(file_storage.filename or 'notes.txt').suffix or '.txt'
    date_prefix = str(meeting_date or datetime.date.today().isoformat())
    month_dir = meetings_dir_for_company(company) / date_prefix[:7]
    month_dir.mkdir(parents=True, exist_ok=True)
    slug_base = re.sub(r'[^A-Za-z0-9]+', '_', title or 'meeting').strip('_') or 'meeting'
    filename = f"{date_prefix}_{slug_base[:48]}{suffix.lower()}"
    path = month_dir / filename
    file_storage.save(path)
    return str(path)

def list_meetings_for_company(db, company, attendee=None, days=None):
    query = """
        SELECT m.*,
               COUNT(a.id) AS attendee_count,
               SUM(CASE WHEN a.follow_up_done=1 THEN 1 ELSE 0 END) AS follow_up_done_count
        FROM meetings m
        LEFT JOIN meeting_attendees a ON a.meeting_id = m.id
        WHERE m.company=?
    """
    params = [company]
    if attendee:
        query += " AND m.id IN (SELECT meeting_id FROM meeting_attendees WHERE team_member_key=?)"
        params.append(attendee)
    if days:
        cutoff = (datetime.date.today() - datetime.timedelta(days=days)).isoformat()
        query += " AND m.meeting_date>=?"
        params.append(cutoff)
    query += " GROUP BY m.id ORDER BY m.meeting_date DESC, m.id DESC"
    rows = [dict(r) for r in db.execute(query, tuple(params)).fetchall()]
    for row in rows:
        row['attendees'] = [dict(a) for a in db.execute(
            """SELECT team_member_key, external_name, external_email, attended, follow_up_done, follow_up_note
               FROM meeting_attendees
               WHERE meeting_id=?
               ORDER BY COALESCE(team_member_key, external_name)""",
            (row['id'],)
        ).fetchall()]
        row['action_items'] = [dict(a) for a in db.execute(
            """SELECT id, owner_key, description, status, created_at, updated_at
               FROM meeting_action_items
               WHERE meeting_id=?
               ORDER BY id""",
            (row['id'],)
        ).fetchall()]
    return rows

def count_questions_for_company(cfg):
    total = 0
    org_q = cfg['root'] / '_GOVERNANCE' / 'PRIORITY_QUESTIONS_FOR_RYAN.md'
    if org_q.exists():
        total += len(parse_questions(org_q.read_text(encoding='utf-8', errors='replace')))
    emp_dir = cfg['root'] / 'EMPLOYEE_TASKS'
    if emp_dir.exists():
        for emp in emp_dir.iterdir():
            if not emp.is_dir():
                continue
            for qf in emp.glob('*PRIORITY_QUESTIONS*.md'):
                total += len(parse_questions(qf.read_text(encoding='utf-8', errors='replace')))
    return total

def get_team_member_profile(company, member_key):
    return (TEAM_MEMBER_PROFILES.get(company) or {}).get(member_key, {
        'role': '',
        'purpose': '',
        'departments': [],
        'repos': [],
        'operating_sources': [],
    })

def local_service_up(host, port, timeout=0.5):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

def get_member_hub(company, member_key):
    return {
        'enabled': False,
        'gmail_auth_enabled': False,
        'title': '',
        'description': '',
        'url': '',
        'repo_dir': '',
        'launch_target': '',
        'running': False,
    }


def member_hub_request(company, member_key, path, method='GET'):
    hub = get_member_hub(company, member_key)
    if not hub.get('enabled'):
        abort(400, 'No member hub configured for this team member.')
    if not hub.get('running'):
        return None, hub
    url = f"{hub['url'].rstrip('/')}/{path.lstrip('/')}"
    response = requests.request(method, url, timeout=10)
    response.raise_for_status()
    return response.json(), hub

def count_findings_for_company(cfg):
    findings_file = cfg['root'] / '_GOVERNANCE' / '_FINDINGS_FOR_REVIEW.md'
    if not findings_file.exists():
        return 0
    return len(parse_findings(findings_file.read_text(encoding='utf-8', errors='replace')))

def command_exists(path_or_name):
    if not path_or_name:
        return False
    try:
        return bool(shutil.which(path_or_name) or Path(path_or_name).exists())
    except Exception:
        return False

def openai_configured():
    return bool(get_openai_api_key())

def anthropic_configured():
    return bool(os.getenv('ANTHROPIC_API_KEY'))

def github_cli_authenticated():
    if not command_exists(GH_EXE):
        return False, 'gh CLI not installed'
    try:
        result = subprocess.run([GH_EXE, 'auth', 'status'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=10)
        if result.returncode == 0:
            return True, 'gh auth active'
        return False, (result.stderr or result.stdout or 'gh auth missing').strip()
    except Exception as e:
        return False, str(e)

def customer_sources_for_company(company):
    cfg = get_company(company)
    governance_hits = sorted((cfg['root'] / '_GOVERNANCE').rglob('*customer*.md'), key=lambda p: str(p).lower()) if (cfg['root'] / '_GOVERNANCE').exists() else []
    mirror_hits = sorted([p for p in cfg['mirror'].iterdir() if p.is_dir() and 'customer' in p.name.lower()]) if cfg['mirror'].exists() else []
    return {
        'governance_files': [{'name': p.name, 'path': str(p)} for p in governance_hits[:50]],
        'customer_repos': [{'name': p.name, 'path': str(p)} for p in mirror_hits[:50]],
        'canonical_list_loaded': False,
    }

def governance_file_category(rel_path):
    rel_norm = str(rel_path).replace('\\', '/').lower()
    name = Path(rel_path).name.lower()

    if '_archive' in rel_norm or name.startswith('_archive'):
        return {'key': 'archive', 'label': 'Archive & Historical'}
    if '/repo_sheets/' in rel_norm:
        return {'key': 'systems', 'label': 'Repo & System Maps'}
    if rel_norm.startswith('departments/') or '/departments/' in rel_norm or rel_norm.startswith('employee_tasks/') or '/employee_tasks/' in rel_norm:
        return {'key': 'operations', 'label': 'Operations & Department Guides'}
    if '/_drafts/' in rel_norm or name.startswith('codex_prompt_') or 'prompt' in name:
        return {'key': 'drafts', 'label': 'Drafts & Build Prompts'}
    if any(token in name for token in ('findings', 'review', 'drift', 'change_log', 'implementation_status', 'risk_register')):
        return {'key': 'reviews', 'label': 'Reviews, Findings & Drift'}
    if any(token in name for token in ('repo_', 'infrastructure', 'inventory', 'engineering_standards', 'integration_architecture', 'devops', 'system_map', 'git_status')):
        return {'key': 'systems', 'label': 'Repo & System Maps'}
    if any(token in name for token in ('customer_', 'product_strategy', 'daily_ops', 'team_meetings', 'team_member', 'security', 'pricing', 'tax_', 'ops_', 'workflow_')):
        return {'key': 'operations', 'label': 'Operations & Department Guides'}
    if any(token in name for token in ('readme', 'master_governance_architecture', 'terminology', 'non_negotiables', 'business_model', 'glossary', 'governance_punch_list', 'constitution')):
        return {'key': 'core', 'label': 'Core Governance'}
    if re.match(r'^\d\d_', name):
        return {'key': 'core', 'label': 'Core Governance'}
    return {'key': 'general', 'label': 'General'}

def governance_file_attention_flags(rel_path, text):
    rel_norm = str(rel_path).replace('\\', '/').lower()
    lower_text = (text or '').lower()
    flags = []
    if '/_drafts/' in rel_norm:
        flags.append({
            'level': 'info',
            'label': 'Draft',
            'reason': 'This file lives in the _DRAFTS workspace.',
        })
    patterns = [
        ('high', 'Owner decision required', r'owner_decision_required'),
        ('high', 'Pending verification', r'pending verification'),
        ('medium', 'TODO', r'(^|\W)todo(?=\W|$)'),
        ('medium', 'TBD', r'(^|\W)tbd(?=\W|$)'),
        ('medium', 'Assign owner', r'assign owner'),
        ('medium', 'Placeholder', r'\[project name\]|\[company\]|\[owner\]'),
        ('medium', 'Not implemented', r'not yet implemented|not implemented'),
        ('medium', 'Needs clarity', r'needs clarification|requires clarification|open question'),
        ('low', 'FIXME', r'fixme'),
    ]
    for level, label, pattern in patterns:
        if re.search(pattern, lower_text, flags=re.IGNORECASE | re.MULTILINE):
            flags.append({
                'level': level,
                'label': label,
                'reason': f'Matched pattern: {label}',
            })
    seen = set()
    deduped = []
    for flag in flags:
        key = (flag['level'], flag['label'])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(flag)
    return deduped

def governance_file_attention_level(flags):
    if any(flag['level'] == 'high' for flag in flags):
        return 'high'
    if any(flag['level'] == 'medium' for flag in flags):
        return 'medium'
    if any(flag['level'] == 'info' for flag in flags):
        return 'info'
    if any(flag['level'] == 'low' for flag in flags):
        return 'low'
    return 'clear'

def governance_file_headings(text, limit=8):
    headings = []
    for line in (text or '').splitlines():
        stripped = line.strip()
        if stripped.startswith('#'):
            heading = stripped.lstrip('#').strip()
            if heading:
                headings.append(heading)
        if len(headings) >= limit:
            break
    return headings

def list_governance_files(company):
    cfg = get_company(company)
    rows = []
    for path in sorted(cfg['root'].rglob('*.md'), key=lambda p: str(p).lower()):
        if '.git' in path.parts:
            continue
        try:
            rel = str(path.relative_to(cfg['root']))
        except ValueError:
            continue
        stat = path.stat()
        text = path.read_text(encoding='utf-8', errors='replace')
        category = governance_file_category(rel)
        flags = governance_file_attention_flags(rel, text)
        attention_level = governance_file_attention_level(flags)
        rows.append({
            'path': rel,
            'name': path.name,
            'size': stat.st_size,
            'modified': datetime.datetime.fromtimestamp(stat.st_mtime).isoformat(),
            'category_key': category['key'],
            'category_label': category['label'],
            'attention_flags': flags,
            'attention_level': attention_level,
            'attention_count': len(flags),
            'attention_summary': ', '.join(flag['label'] for flag in flags[:3]),
            'headings': governance_file_headings(text, limit=5),
        })
    return rows

def build_governance_file_index(company):
    rows = list_governance_files(company)
    order = {key: idx for idx, (key, _label) in enumerate(GOVERNANCE_FILE_CATEGORY_ORDER)}
    rows.sort(key=lambda item: (order.get(item['category_key'], 999), item['path'].lower()))
    categories = []
    for key, label in GOVERNANCE_FILE_CATEGORY_ORDER:
        cat_rows = [row for row in rows if row['category_key'] == key]
        if not cat_rows:
            continue
        categories.append({
            'key': key,
            'label': label,
            'count': len(cat_rows),
            'attention_count': sum(1 for row in cat_rows if row['attention_count']),
        })
    return {
        'company': company,
        'count': len(rows),
        'attention_count': sum(1 for row in rows if row['attention_count']),
        'draft_count': sum(1 for row in rows if row['category_key'] == 'drafts'),
        'categories': categories,
        'rows': rows,
    }

def build_governance_file_chat_prompt(company, file_row, content, related_files, user_prompt):
    related_lines = '\n'.join(f"- {item['path']}" for item in related_files[:6]) or '- None'
    attention_lines = '\n'.join(f"- {flag['label']}: {flag['reason']}" for flag in file_row.get('attention_flags', [])) or '- No automatic clarity alerts.'
    heading_lines = '\n'.join(f"- {heading}" for heading in file_row.get('headings', [])) or '- No headings detected.'
    return f"""You are reviewing one governance document for {COMPANIES[company]['name_full']} inside Governance Workbench.

Current file:
- Path: {file_row['path']}
- Category: {file_row['category_label']}
- Automatic clarity alerts:
{attention_lines}

Detected headings:
{heading_lines}

Related files in the same category:
{related_lines}

File content:
---
{(content or '(no content)').strip()[:16000]}
---

User request:
{user_prompt}

Rules:
1. Ground the answer in the current file first.
2. If you infer anything beyond the text, label it INFERRED.
3. Call out drift, ambiguity, missing owner truth, or stale framing explicitly.
4. Refer to headings or quoted phrases from the file when possible.
5. Do not invent approved governance truth.

Return markdown with these headings:
- Direct answer
- Drift / clarity issues
- Related files to inspect
- Recommended next edit
"""

def build_repo_question_chat_prompt(company, question_row, user_prompt):
    return f"""You are reviewing one repo-specific governance question for {COMPANIES[company]['name_full']} inside Governance Workbench.

Repo question:
- Repo: {question_row['repo_name']}
- Code: {question_row['question_code']}
- Title: {question_row['title']}
- Priority: {question_row['priority']}
- Status: {question_row['status']}
- Source type: {question_row['source']}
- Source reference: {question_row['source_ref']}

Question body:
---
{(question_row.get('body_markdown') or '').strip()[:12000]}
---

Source excerpt:
---
{(question_row.get('source_excerpt') or '').strip()[:4000]}
---

Current working answer:
---
{(question_row.get('answer_markdown') or '').strip()[:6000]}
---

User request:
{user_prompt}

Rules:
1. Stay grounded in the repo question, its source reference, and current working answer.
2. If you infer beyond the stored evidence, label it INFERRED.
3. Call out any missing evidence, stale question framing, or likely follow-up questions.
4. Do not invent approved governance truth.

Return markdown with these headings:
- Direct answer
- What the evidence supports
- Gaps or drift to check
- Recommended next step
"""

def sql_driver_status():
    return {
        'pyodbc': bool(importlib.util.find_spec('pyodbc')),
        'pymssql': bool(importlib.util.find_spec('pymssql')),
        'sqlalchemy': bool(importlib.util.find_spec('sqlalchemy')),
    }

def customer_source_settings(company):
    settings = load_local_settings()
    source_cfg = (settings.get('customer_sources') or {}).get(company, {})
    drivers = sql_driver_status()
    candidates = {
        'MView': [
            {'label': 'Portal / CRM source not yet confirmed', 'type': 'question_required', 'notes': 'Need confirmed customer source for Mineral View.'},
            {'label': 'MineralView-Portal-Next', 'type': 'repo', 'notes': 'Likely customer-facing portal / experience surface.'},
        ],
    }
    profile_fields = {
        'MView': [
            'Customer / account ID', 'Company / investor name', 'Email', 'Phone', 'Account status',
            'Plan / subscription type', 'Product usage', 'Report / deck interest', 'Persona classification',
            'Assigned owner', 'Last contact date',
        ],
    }
    configured = bool(source_cfg.get('server') and source_cfg.get('database'))
    return {
        'configured': configured,
        'source': source_cfg,
        'drivers': drivers,
        'driver_ready': any(drivers.values()),
        'candidates': candidates.get(company, []),
        'profile_fields': profile_fields.get(company, []),
    }

def departments_for_company(company, db=None):
    shared_defs = DEPARTMENT_ARCHITECTURE.get('shared', [])
    company_defs = DEPARTMENT_ARCHITECTURE.get(company, [])
    profile_keys = set((TEAM_MEMBER_PROFILES.get(company) or {}).keys())
    member_keys_all = [k for k in list_employees(company) if k in profile_keys]
    tag_map = get_team_member_department_tags_map(db, company) if db is not None else {}

    def build_entry(defn, bucket):
        repos = defn.get('repos')
        if repos is None:
            repos = (defn.get('repos_by_company') or {}).get(company, [])
        member_keys = sorted([
            member_key
            for member_key in member_keys_all
            if defn['key'] in set(get_team_member_profile(company, member_key).get('departments') or []).union({
                row['department_key'] for row in tag_map.get(member_key, [])
            })
        ])
        member_names = sorted([
            pretty_member_name(member_key)
            for member_key in member_keys
        ])
        return {
            'key': defn['key'],
            'name': defn['name'],
            'description': defn['description'],
            'bucket': bucket,
            'repos': repos,
            'repo_count': len(repos),
            'member_keys': member_keys,
            'member_names': member_names,
            'member_count': len(member_names),
        }

    shared = [build_entry(item, 'Shared Departments') for item in shared_defs]
    company_specific = [build_entry(item, f"{company} Departments") for item in company_defs]
    all_items = shared + company_specific
    return {
        'shared': shared,
        'company_specific': company_specific,
        'all': all_items,
        'count': len(all_items),
    }

def normalize_department_key(company, raw_value, db=None):
    value = str(raw_value or '').strip()
    if not value:
        return ''
    department_data = departments_for_company(company, db)
    for item in department_data['all']:
        if value.lower() == str(item['key']).lower() or value.lower() == str(item['name']).lower():
            return item['key']
    return value

def aspect_groups_for_company(company):
    cfg = get_company(company)
    repo_names = sorted([p.name for p in cfg['mirror'].iterdir() if p.is_dir() and (p / '.git').exists()]) if cfg['mirror'].exists() else []
    remaining = set(repo_names)
    groups = []
    for rule in ASPECT_GROUP_RULES.get(company, []):
        matched = [repo for repo in rule['repos'] if repo in remaining]
        for repo in matched:
            remaining.discard(repo)
        groups.append({
            'name': rule['name'],
            'description': rule['description'],
            'repos': matched,
            'count': len(matched),
            'confidence': 'Working hypothesis',
        })
    if remaining:
        groups.append({
            'name': 'Needs Review / Not Yet Grouped',
            'description': 'Repos not yet assigned to an aspect group. These need review before they are treated as part of a stable company map.',
            'repos': sorted(remaining),
            'count': len(remaining),
            'confidence': 'Needs review',
        })
    return groups

def intake_dir_for_id(company, intake_id):
    return get_intake_dir(company) / f'intake_{intake_id:05d}'

def team_member_file_storage_path(company, member_key, original_filename, file_purpose='other'):
    suffix = Path(original_filename or 'upload.bin').suffix or '.bin'
    stem = re.sub(r'[^A-Za-z0-9._-]+', '_', Path(original_filename or 'upload').stem).strip('._') or 'upload'
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{stem[:64]}{suffix.lower()}"
    return get_team_member_bucket_dir(company, member_key, file_purpose) / filename

def file_size_safe(path_value):
    try:
        return Path(path_value).stat().st_size
    except Exception:
        return 0

def read_text_file_preview(path, limit=7000):
    return Path(path).read_text(encoding='utf-8', errors='replace')[:limit]

def read_docx_preview(path, limit=7000):
    try:
        with zipfile.ZipFile(path) as zf:
            with zf.open('word/document.xml') as handle:
                root = ET.fromstring(handle.read())
        texts = []
        for node in root.iter():
            if node.tag.endswith('}t') and node.text:
                texts.append(node.text)
        return ' '.join(texts)[:limit]
    except Exception:
        return ''

def read_pdf_preview(path, limit=7000):
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        parts = []
        for page in reader.pages[:3]:
            parts.append(page.extract_text() or '')
        return '\n'.join(parts)[:limit]
    except Exception:
        return ''

def extract_member_file_preview(path_value, limit=7000):
    path = Path(path_value)
    suffix = path.suffix.lower()
    if suffix in {'.txt', '.md', '.csv', '.json', '.log', '.py', '.sql', '.html', '.htm'}:
        return read_text_file_preview(path, limit=limit)
    if suffix == '.docx':
        return read_docx_preview(path, limit=limit)
    if suffix == '.pdf':
        return read_pdf_preview(path, limit=limit)
    return ''

def detect_member_file_kind(filename, preview_text, source_type):
    suffix = Path(filename or '').suffix.lower()
    text = f"{filename or ''}\n{source_type or ''}\n{preview_text or ''}".lower()
    if suffix in {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'} or source_type == 'screenshot':
        return 'image / screenshot'
    if suffix == '.pdf':
        return 'pdf document'
    if suffix == '.docx':
        return 'word document'
    if 'job description' in text or 'responsibilities' in text or 'qualifications' in text:
        return 'job description'
    if 'meeting' in text or 'agenda' in text or 'follow-up' in text:
        return 'meeting notes'
    if 'resume' in text or 'curriculum vitae' in text:
        return 'resume / candidate profile'
    return 'general document'

def member_file_department_keyword_map(company):
    base = {
        'ACCOUNTING': ['tax', 'filing', 'sales tax', 'avalara', 'reconcile', 'reconciliation', 'payables', 'receivables', 'invoice', 'quickbooks'],
        'CUSTOMER_SUPPORT': ['customer support', 'ticket', 'customer issue', 'refund', 'complaint', 'follow-up', 'case'],
        'MARKETING': ['campaign', 'marketing', 'seo', 'audience', 'email list', 'content', 'social'],
        'DEVELOPMENT': ['developer', 'engineering', 'api', 'repository', 'repo', 'frontend', 'backend', 'codebase', 'deployment', 'bug'],
        'CUSTOMER_RELATIONS': ['customer relations', 'relationship', 'outreach', 'account management'],
        'DAILY_OPS': ['operations', 'daily ops', 'schedule', 'receiving', 'shipping', 'shipment', 'package', 'warehouse', 'inventory'],
        'PRICING': ['premium', 'pricing', 'spot', 'margin', 'price', 'vendor pricing'],
        'VENDOR_MANAGEMENT': ['vendor', 'supplier', 'wholesale', 'dealer', 'feed'],
        'ORDER_MANAGEMENT': ['order', 'checkout', 'shipstation', 'fulfillment', 'payment status'],
        'PEOPLE': ['employee', 'hiring', 'candidate', 'job description', 'onboarding', 'training', 'review'],
    }
    if company == 'MView':
        base.update({
            'DATA_SCIENCE': ['well', 'lease', 'production', 'decline curve', 'royalty', 'mineral', 'title'],
            'ENGINEERING': ['developer', 'engineering', 'api', 'codebase', 'deployment', 'frontend', 'backend'],
            'PRODUCT': ['roadmap', 'feature', 'ux', 'customer interview', 'product'],
            'CUSTOMER_SUCCESS': ['customer', 'client', 'support', 'renewal', 'account'],
        })
    return base

def heuristic_member_file_analysis(company, member_key, filename, note, preview_text):
    text = ' '.join(part for part in [filename, note, preview_text] if part).lower()
    keyword_map = member_file_department_keyword_map(company)
    scored = []
    for dept_key, keywords in keyword_map.items():
        hits = [kw for kw in keywords if kw in text]
        if hits:
            scored.append({
                'key': dept_key,
                'score': len(hits),
                'reason': f"Matched keywords: {', '.join(hits[:4])}",
            })
    scored.sort(key=lambda item: (-item['score'], item['key']))
    suggestions = [
        {
            'key': item['key'],
            'reason': item['reason'],
            'confidence': 'high' if item['score'] >= 3 else 'medium',
        }
        for item in scored[:3]
    ]
    if not suggestions:
        profile_departments = get_team_member_profile(company, member_key).get('departments') or []
        suggestions = [
            {
                'key': dept_key,
                'reason': 'Used the member profile department because the file text did not strongly match a more specific lane.',
                'confidence': 'low',
            }
            for dept_key in profile_departments[:2]
        ]
    preview_words = re.findall(r'\b[\w/-]+\b', preview_text or '')
    doc_kind = detect_member_file_kind(filename, preview_text, 'document')
    summary_bits = []
    if note:
        summary_bits.append(f"Uploader note: {note.strip()}")
    if preview_words:
        summary_bits.append(f"Preview captured from the file ({min(len(preview_words), 80)} words sampled).")
    else:
        summary_bits.append('No text preview was available, so the classification relied on the filename, note, and file type.')
    summary_bits.append(f"Likely document type: {doc_kind}.")
    if suggestions:
        summary_bits.append(f"Most likely department lanes: {', '.join(item['key'] for item in suggestions)}.")
    return {
        'doc_kind': doc_kind,
        'confidence': suggestions[0]['confidence'] if suggestions else 'low',
        'summary': ' '.join(summary_bits),
        'suggested_departments': suggestions,
        'raw_output_text': preview_text[:4000] if preview_text else '',
        'engine': 'Workbench Heuristic AI',
    }

GOVERNANCE_CONTEXT_FILES = [
    'NON_NEGOTIABLE', 'OPERATING_CONSTITUTION', 'CONSTITUTION', 'BUSINESS_MODEL',
    'GLOSSARY', 'FINDINGS', 'PRIORITY_QUESTIONS', 'DECISION_LOG', 'SECURITY_RISK',
    'MASTER_GOVERNANCE',
]

def governance_context(company, max_chars=14000, per_file_chars=3500):
    """Load key approved governance files so the AI can ground answers in the source of truth."""
    try:
        cfg = get_company(company)
    except Exception:
        return ''
    gov_root = cfg['root'] / '_GOVERNANCE'
    if not gov_root.exists():
        return ''

    def rank(p):
        name = p.name.upper()
        for i, kw in enumerate(GOVERNANCE_CONTEXT_FILES):
            if kw in name:
                return i
        return len(GOVERNANCE_CONTEXT_FILES)

    try:
        files = [p for p in gov_root.rglob('*.md') if rank(p) < len(GOVERNANCE_CONTEXT_FILES)]
    except Exception:
        return ''
    files.sort(key=lambda p: (rank(p), p.name))
    chunks = []
    total = 0
    for p in files:
        try:
            text = p.read_text(encoding='utf-8', errors='replace').strip()
        except Exception:
            continue
        if not text:
            continue
        block = f"### {p.relative_to(gov_root)}\n{text[:per_file_chars]}"
        if total + len(block) > max_chars:
            block = block[:max(0, max_chars - total)]
        if not block:
            break
        chunks.append(block)
        total += len(block)
        if total >= max_chars:
            break
    if not chunks:
        return ''
    return (
        "APPROVED GOVERNANCE SOURCE OF TRUTH (authoritative corpus excerpts - ground your "
        "answer in these, do not contradict them, and do not fabricate beyond them):\n\n"
        + "\n\n".join(chunks)
    )

def build_member_file_openai_prompt(company, member_key, file_row, preview_text, departments):
    department_lines = '\n'.join(f"- {item['key']}: {item['name']}" for item in departments)
    return f"""You are analyzing a file uploaded to a team-member workspace in the Governance Workbench for {COMPANIES[company]['name_full']}.

Team member: {pretty_member_name(member_key)}
Original filename: {file_row['original_filename']}
Source type: {file_row['source_type']}
Uploader note: {file_row.get('note') or '(none)'}

Available department keys:
{department_lines}

Text preview from the file:
---
{(preview_text or '(no text preview available)')[:5000]}
---

Return JSON only with this shape:
{{
  "summary": "one short paragraph",
  "doc_kind": "short label",
  "confidence": "high|medium|low",
  "suggested_departments": [
    {{"key": "DEPARTMENT_KEY", "reason": "short why", "confidence": "high|medium|low"}}
  ]
}}

Rules:
- Use only the department keys listed above.
- Suggest at most 3 departments.
- If the evidence is weak, return lower confidence instead of guessing.
- Keep the summary grounded in the preview text and uploader note.
"""

def parse_member_file_openai_response(text, departments):
    try:
        data = json.loads(text)
    except Exception:
        return None
    valid_keys = {item['key'] for item in departments}
    suggestions = []
    for item in data.get('suggested_departments') or []:
        key = str(item.get('key') or '').strip()
        if key in valid_keys:
            suggestions.append({
                'key': key,
                'reason': str(item.get('reason') or '').strip(),
                'confidence': str(item.get('confidence') or 'medium').strip().lower() or 'medium',
            })
    return {
        'summary': str(data.get('summary') or '').strip(),
        'doc_kind': str(data.get('doc_kind') or '').strip() or 'general document',
        'confidence': str(data.get('confidence') or 'medium').strip().lower() or 'medium',
        'suggested_departments': suggestions[:3],
    }

def analyze_team_member_file(db, company, member_key, file_row, engine_preference='OpenAI'):
    preview_text = extract_member_file_preview(file_row['saved_path'])
    department_catalog = departments_for_company(company, db)['all']
    heuristic = heuristic_member_file_analysis(
        company,
        member_key,
        file_row['original_filename'],
        file_row.get('note') or '',
        preview_text,
    )
    analysis = {
        'engine': heuristic['engine'],
        'status': 'completed',
        'doc_kind': heuristic['doc_kind'],
        'confidence': heuristic['confidence'],
        'summary': heuristic['summary'],
        'suggested_departments': heuristic['suggested_departments'],
        'raw_output_text': heuristic['raw_output_text'],
        'error_text': '',
    }
    requested = str(engine_preference or file_row.get('ai_preference') or 'Claude').strip()
    if requested in {'Claude', 'Claude Code', 'Both'} and command_exists(CLAUDE_EXE or 'claude'):
        prompt = build_member_file_openai_prompt(company, member_key, file_row, preview_text, department_catalog)
        ok, output_text, err = call_claude_text(prompt)
        if ok and output_text:
            parsed = parse_member_file_openai_response(output_text, department_catalog)
            if parsed:
                analysis.update({
                    'engine': 'Claude Code',
                    'doc_kind': parsed['doc_kind'],
                    'confidence': parsed['confidence'],
                    'summary': parsed['summary'] or heuristic['summary'],
                    'suggested_departments': parsed['suggested_departments'] or heuristic['suggested_departments'],
                    'raw_output_text': output_text[:12000],
                })
            else:
                analysis['error_text'] = 'Claude returned non-JSON output; heuristic fallback used.'
        else:
            analysis['error_text'] = f"{err or 'Claude request failed'}. Heuristic fallback used."
    elif requested in {'OpenAI', 'Both'} and openai_configured():
        prompt = build_member_file_openai_prompt(company, member_key, file_row, preview_text, department_catalog)
        try:
            payload = {
                'model': get_openai_model(),
                'input': prompt,
            }
            headers = {
                'Authorization': f"Bearer {get_openai_api_key()}",
                'Content-Type': 'application/json',
            }
            response = requests.post('https://api.openai.com/v1/responses', headers=headers, json=payload, timeout=90)
            if response.status_code < 400:
                data = response.json()
                output_text = data.get('output_text', '')
                if not output_text and 'output' in data:
                    parts = []
                    for item in data.get('output', []):
                        for content in item.get('content', []):
                            if content.get('type') == 'output_text':
                                parts.append(content.get('text', ''))
                    output_text = '\n'.join(parts).strip()
                parsed = parse_member_file_openai_response(output_text, department_catalog)
                if parsed:
                    analysis.update({
                        'engine': 'OpenAI Codex',
                        'doc_kind': parsed['doc_kind'],
                        'confidence': parsed['confidence'],
                        'summary': parsed['summary'] or heuristic['summary'],
                        'suggested_departments': parsed['suggested_departments'] or heuristic['suggested_departments'],
                        'raw_output_text': output_text[:12000],
                    })
                else:
                    analysis['error_text'] = 'OpenAI returned non-JSON output; heuristic fallback used.'
            else:
                analysis['error_text'] = f"OpenAI request failed ({response.status_code}). Heuristic fallback used."
        except Exception as exc:
            analysis['error_text'] = f"{exc}. Heuristic fallback used."
    started_at = datetime.datetime.now().isoformat()
    cur = db.cursor()
    cur.execute(
        """INSERT INTO team_member_file_analysis(
               member_file_id, engine, status, started_at, completed_at, doc_kind, confidence,
               summary_text, suggested_departments_json, raw_output_text, error_text
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (
            file_row['id'],
            analysis['engine'],
            analysis['status'],
            started_at,
            datetime.datetime.now().isoformat(),
            analysis['doc_kind'],
            analysis['confidence'],
            analysis['summary'],
            json.dumps(analysis['suggested_departments']),
            analysis['raw_output_text'],
            analysis['error_text'],
        ),
    )
    analysis['id'] = cur.lastrowid
    return analysis

def list_team_member_files(db, company, member_key):
    rows = []
    query_rows = db.execute(
        """SELECT f.*,
                  a.id AS analysis_id,
                  a.engine AS analysis_engine,
                  a.status AS analysis_status,
                  a.doc_kind AS analysis_doc_kind,
                  a.confidence AS analysis_confidence,
                  a.summary_text AS analysis_summary,
                  a.suggested_departments_json AS analysis_suggested_departments_json,
                  a.error_text AS analysis_error_text,
                  a.completed_at AS analysis_completed_at
           FROM team_member_files f
           LEFT JOIN team_member_file_analysis a
             ON a.id = (
                 SELECT a2.id
                 FROM team_member_file_analysis a2
                 WHERE a2.member_file_id = f.id
                 ORDER BY a2.id DESC
                 LIMIT 1
             )
           WHERE f.company=? AND f.member_key=?
           ORDER BY f.uploaded_at DESC, f.id DESC
           LIMIT 20""",
        (company, member_key),
    ).fetchall()
    for row in query_rows:
        item = dict(row)
        suggestions = []
        raw = item.get('analysis_suggested_departments_json')
        if raw:
            try:
                suggestions = json.loads(raw)
            except Exception:
                suggestions = []
        item['suggested_departments'] = suggestions
        rows.append(item)
    return rows

def insert_team_member_question_ai_run(db, company, member_key, engine, action_type, status, input_file_id=None, prompt_text='', output_text='', output_path='', error_text=''):
    now = datetime.datetime.now().isoformat()
    cur = db.cursor()
    cur.execute(
        """INSERT INTO team_member_question_ai_run(
               team_member_key, company, engine, action_type, status, started_at, completed_at,
               input_file_id, prompt_text, output_text, output_path, error_text
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            member_key,
            company,
            engine,
            action_type,
            status,
            now,
            now if status in ('completed', 'failed', 'blocked') else None,
            input_file_id,
            prompt_text,
            output_text,
            output_path,
            error_text,
        ),
    )
    return cur.lastrowid

def update_team_member_question_ai_run(db, run_id, status, output_text=None, output_path=None, error_text=None):
    db.execute(
        """UPDATE team_member_question_ai_run
           SET status=?, completed_at=?, output_text=COALESCE(?, output_text),
               output_path=COALESCE(?, output_path), error_text=COALESCE(?, error_text)
           WHERE id=?""",
        (status, datetime.datetime.now().isoformat(), output_text, output_path, error_text, run_id),
    )

def team_member_question_code_slug(member_key):
    return re.sub(r'[^a-z0-9]+', '-', str(member_key or 'member').replace('_', '-').lower()).strip('-') or 'member'

def next_team_member_question_code(db, company, member_key):
    slug = team_member_question_code_slug(member_key)
    rows = db.execute(
        "SELECT question_code FROM team_member_questions WHERE company=? AND team_member_key=? ORDER BY id",
        (company, member_key),
    ).fetchall()
    highest = 0
    pattern = re.compile(rf'^TMQ-{re.escape(slug)}-(\d+)$', re.IGNORECASE)
    for row in rows:
        match = pattern.match(row['question_code'] or '')
        if match:
            highest = max(highest, int(match.group(1)))
    return f"TMQ-{slug}-{highest + 1:02d}"

def create_team_member_question(db, company, member_key, title, body_markdown, priority='MEDIUM', status='NEW', source_file_id=None, source_section='', generated_by='manual'):
    now = datetime.datetime.now().isoformat()
    code = next_team_member_question_code(db, company, member_key)
    cur = db.cursor()
    cur.execute(
        """INSERT INTO team_member_questions(
               company, team_member_key, question_code, title, body_markdown, priority, status,
               source_file_id, source_section, generated_by, created_at, updated_at, last_human_touch_at
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            company,
            member_key,
            code,
            title,
            body_markdown,
            priority,
            status,
            source_file_id,
            source_section,
            generated_by,
            now,
            now,
            now if generated_by == 'manual' else None,
        ),
    )
    return cur.lastrowid, code

def list_team_member_questions(db, company, member_key, statuses=None):
    params = [company, member_key]
    status_sql = ''
    if statuses:
        placeholders = ','.join('?' for _ in statuses)
        status_sql = f" AND q.status IN ({placeholders})"
        params.extend(statuses)
    rows = db.execute(
        f"""SELECT q.*,
                   a.id AS latest_answer_id,
                   a.answer_markdown AS latest_answer_markdown,
                   a.match_confidence AS latest_answer_confidence,
                   a.accepted_by_ryan AS latest_answer_accepted,
                   f.original_filename AS source_filename,
                   f.file_purpose AS source_file_purpose
            FROM team_member_questions q
            LEFT JOIN team_member_question_answers a
              ON a.id = (
                   SELECT a2.id
                   FROM team_member_question_answers a2
                   WHERE a2.question_id = q.id
                   ORDER BY a2.id DESC
                   LIMIT 1
              )
            LEFT JOIN team_member_files f ON f.id = q.source_file_id
            WHERE q.company=? AND q.team_member_key=?{status_sql}
            ORDER BY q.id DESC""",
        tuple(params),
    ).fetchall()
    return [dict(r) for r in rows]

def list_team_member_question_packets(db, company, member_key):
    rows = db.execute(
        """SELECT *
           FROM team_member_question_packets
           WHERE company=? AND team_member_key=?
           ORDER BY packet_version DESC, id DESC""",
        (company, member_key),
    ).fetchall()
    return [dict(r) for r in rows]

def list_team_member_correspondence(db, company, member_key, limit=60):
    rows = db.execute(
        """SELECT *
           FROM team_member_correspondence_log
           WHERE company=? AND team_member_key=?
           ORDER BY created_at DESC, id DESC
           LIMIT ?""",
        (company, member_key, limit),
    ).fetchall()
    return [dict(r) for r in rows]

def rebuild_team_member_correspondence_markdown(db, company, member_key):
    events = list_team_member_correspondence(db, company, member_key, limit=500)
    lines = [
        f"# Correspondence Log - {pretty_member_name(member_key)}",
        '',
        f"Company: {company}",
        f"Generated: {datetime.datetime.now().isoformat()}",
        '',
    ]
    for event in reversed(events):
        lines.extend([
            f"## {event.get('created_at', '')} - {event.get('event_type', '')}",
            '',
            f"- Actor: {event.get('actor', '')}",
            f"- Summary: {event.get('event_summary', '')}",
            f"- Linked file id: {event.get('linked_file_id') or '-'}",
            f"- Linked question id: {event.get('linked_question_id') or '-'}",
            f"- Linked packet id: {event.get('linked_packet_id') or '-'}",
            '',
        ])
    get_team_member_correspondence_markdown_path(company, member_key).write_text('\n'.join(lines).strip() + '\n', encoding='utf-8')

def append_team_member_correspondence_event(db, company, member_key, event_type, event_summary, actor='system', linked_file_id=None, linked_question_id=None, linked_packet_id=None):
    now = datetime.datetime.now().isoformat()
    db.execute(
        """INSERT INTO team_member_correspondence_log(
               company, team_member_key, event_type, event_summary, actor,
               linked_file_id, linked_question_id, linked_packet_id, created_at
           ) VALUES(?,?,?,?,?,?,?,?,?)""",
        (company, member_key, event_type, event_summary, actor, linked_file_id, linked_question_id, linked_packet_id, now),
    )
    rebuild_team_member_correspondence_markdown(db, company, member_key)

def summarize_team_member_question_statuses(question_rows):
    counts = {status: 0 for status in TEAM_MEMBER_QUESTION_STATUS_ORDER}
    for row in question_rows:
        status = row.get('status') or 'NEW'
        counts[status] = counts.get(status, 0) + 1
    return counts

def team_member_question_priority_from_title(title):
    text = str(title or '').lower()
    if any(token in text for token in ('must', 'required', 'compliance', 'critical', 'money', 'approval', 'deadline')):
        return 'HIGH'
    if any(token in text for token in ('process', 'owner', 'source', 'rule', 'exception')):
        return 'MEDIUM'
    return 'LOW'

def heuristic_team_member_questions(file_row, preview_text, cap=10):
    lines = [line.strip(' -\t') for line in (preview_text or '').splitlines() if line.strip()]
    candidates = []
    for idx, line in enumerate(lines[:60], start=1):
        if len(line) < 12:
            continue
        heading_like = line.endswith(':') or line.isupper() or len(line.split()) <= 10
        if heading_like:
            topic = line.rstrip(':').strip()
            candidates.append({
                'title': f'Clarify {topic}',
                'body_markdown': f"Source section: line {idx}\n\nPlease explain the current process, owner, exceptions, and system of record for `{topic}`.",
                'source_section': f'line {idx}',
                'priority': team_member_question_priority_from_title(topic),
            })
    if not candidates:
        basis = Path(file_row.get('original_filename') or 'document').stem.replace('_', ' ')
        candidates = [
            {
                'title': f'Explain the current process in {basis}',
                'body_markdown': f"Please explain the current step-by-step process described in `{file_row.get('original_filename')}` including owner, systems used, timing, and exceptions.",
                'source_section': 'full document',
                'priority': 'HIGH',
            },
            {
                'title': f'Identify decisions and approvals in {basis}',
                'body_markdown': f"What decisions are made in `{file_row.get('original_filename')}`, who makes them, and what requires Ryan approval?",
                'source_section': 'full document',
                'priority': 'MEDIUM',
            },
        ]
    deduped = []
    seen = set()
    for item in candidates:
        key = item['title'].lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    primary = deduped[:cap]
    overflow = deduped[cap:cap + 6]
    return primary, overflow

def build_team_member_generate_prompt(company, member_key, file_row, preview_text, cap=10):
    return f"""You are generating follow-up governance questions for a team member.

Company: {company}
Team member: {pretty_member_name(member_key)}
File name: {file_row.get('original_filename')}
Uploader note: {file_row.get('note') or '(none)'}

Task:
1. Read the preview text.
2. Return the {cap} most important questions Ryan should ask this team member to turn this document into governed knowledge.
3. Prefer questions about process, owner, systems of record, exceptions, timing, approvals, and unresolved ambiguity.
4. Be concise and grounded in the text. Do not invent facts.
5. Rank by importance and assign priority as CRITICAL, HIGH, MEDIUM, or LOW.

Return JSON only:
{{
  "questions": [
    {{
      "title": "short title",
      "body_markdown": "full question body",
      "source_section": "page/line/section reference if known",
      "priority": "HIGH"
    }}
  ],
  "overflow": [
    {{
      "title": "optional lower-priority follow-up",
      "body_markdown": "question",
      "source_section": "reference",
      "priority": "LOW"
    }}
  ]
}}

Preview text:
{preview_text[:8000]}
"""

def parse_team_member_question_json(text):
    try:
        data = json.loads(text)
    except Exception:
        return None
    questions = []
    for bucket, status in (('questions', 'NEW'), ('overflow', 'SUGGESTED_FOLLOW_UP')):
        for item in data.get(bucket) or []:
            title = str(item.get('title') or '').strip()
            body = str(item.get('body_markdown') or '').strip()
            if not title or not body:
                continue
            questions.append({
                'title': title,
                'body_markdown': body,
                'source_section': str(item.get('source_section') or '').strip(),
                'priority': str(item.get('priority') or 'MEDIUM').strip().upper() or 'MEDIUM',
                'status': status,
            })
    return questions

def generate_team_member_questions_from_file(db, company, member_key, file_row, engine='OpenAI', actor='Ryan', cap=10):
    preview_text = extract_member_file_preview(file_row['saved_path'])
    prompt = build_team_member_generate_prompt(company, member_key, file_row, preview_text, cap=cap)
    run_id = insert_team_member_question_ai_run(db, company, member_key, engine, 'generate_questions', 'running', input_file_id=file_row['id'], prompt_text=prompt)
    generated = []
    output_text = ''
    if engine in ('Claude', 'Claude Code', 'Both') and command_exists(CLAUDE_EXE or 'claude'):
        ok, output_text, err = call_claude_text(prompt)
        if ok and output_text:
            parsed = parse_team_member_question_json(output_text)
            if parsed:
                generated = parsed
        else:
            output_text = err or 'Claude request failed'
    elif engine in ('OpenAI', 'OpenAI Codex') and openai_configured():
        try:
            response = requests.post(
                'https://api.openai.com/v1/responses',
                headers={
                    'Authorization': f"Bearer {get_openai_api_key()}",
                    'Content-Type': 'application/json',
                },
                json={'model': get_openai_model(), 'input': prompt},
                timeout=90,
            )
            if response.status_code < 400:
                payload = response.json()
                output_text = payload.get('output_text', '')
                if not output_text:
                    parts = []
                    for item in payload.get('output', []):
                        for content in item.get('content', []):
                            if content.get('type') == 'output_text':
                                parts.append(content.get('text', ''))
                    output_text = '\n'.join(parts).strip()
                parsed = parse_team_member_question_json(output_text)
                if parsed:
                    generated = parsed
            else:
                output_text = response.text[:4000]
        except Exception as exc:
            output_text = str(exc)
    if not generated:
        primary, overflow = heuristic_team_member_questions(file_row, preview_text, cap=cap)
        generated = [dict(item, status='NEW') for item in primary] + [dict(item, status='SUGGESTED_FOLLOW_UP') for item in overflow]
    created = []
    for item in generated:
        question_id, question_code = create_team_member_question(
            db,
            company,
            member_key,
            item['title'],
            item['body_markdown'],
            priority=item.get('priority') or 'MEDIUM',
            status=item.get('status') or 'NEW',
            source_file_id=file_row['id'],
            source_section=item.get('source_section') or '',
            generated_by=engine if generated else 'heuristic',
        )
        created.append({
            'id': question_id,
            'question_code': question_code,
            'status': item.get('status') or 'NEW',
            'priority': item.get('priority') or 'MEDIUM',
            'title': item['title'],
        })
    db.execute(
        "UPDATE team_member_files SET generated_question_count=? WHERE id=?",
        (len([item for item in created if item['status'] == 'NEW']), file_row['id']),
    )
    update_team_member_question_ai_run(db, run_id, 'completed', output_text=output_text[:12000])
    append_team_member_correspondence_event(
        db,
        company,
        member_key,
        'questions_generated',
        f"Generated {len(created)} team-member questions from {file_row.get('original_filename')}.",
        actor=engine,
        linked_file_id=file_row['id'],
    )
    return created

def render_team_member_packet_markdown(member_key, packet_version, questions):
    lines = [
        f"# Question Packet v{packet_version} - {pretty_member_name(member_key)}",
        '',
        'Please answer each question directly below its heading.',
        '',
    ]
    for question in questions:
        lines.extend([
            f"## {question['question_code']} - {question.get('title') or 'Question'}",
            '',
            f"Priority: {question.get('priority') or 'MEDIUM'}",
            '',
            question.get('body_markdown') or '',
            '',
            'Answer:',
            '',
            '---',
            '',
        ])
    return '\n'.join(lines).strip() + '\n'

def export_team_member_question_packet(db, company, member_key, actor='Ryan'):
    questions = list_team_member_questions(db, company, member_key, statuses=['NEW', 'NEEDS_FOLLOW_UP'])
    if not questions:
        return None
    version_row = db.execute(
        "SELECT MAX(packet_version) AS max_version FROM team_member_question_packets WHERE company=? AND team_member_key=?",
        (company, member_key),
    ).fetchone()
    packet_version = int((version_row['max_version'] or 0) + 1)
    markdown = render_team_member_packet_markdown(member_key, packet_version, list(reversed(questions)))
    outbound_dir = get_team_member_bucket_dir(company, member_key, 'outbound_packet')
    filename = f"{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_question_packet_v{packet_version}.md"
    packet_path = outbound_dir / filename
    packet_path.write_text(markdown, encoding='utf-8')
    now = datetime.datetime.now().isoformat()
    cur = db.cursor()
    question_ids = [row['id'] for row in questions]
    cur.execute(
        """INSERT INTO team_member_question_packets(
               company, team_member_key, packet_version, question_ids_json, exported_file_path, exported_at, exported_by
           ) VALUES(?,?,?,?,?,?,?)""",
        (company, member_key, packet_version, json.dumps(question_ids), str(packet_path), now, actor),
    )
    packet_id = cur.lastrowid
    cur.execute(
        """INSERT INTO team_member_files(
               company, member_key, original_filename, saved_path, source_type, note,
               ai_preference, size_bytes, uploaded_at, uploaded_by, file_purpose,
               linked_question_packet_id, parsed_answer_count, generated_question_count
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            company,
            member_key,
            filename,
            str(packet_path),
            'document',
            f'Outbound question packet v{packet_version}',
            'manual',
            file_size_safe(packet_path),
            now,
            actor,
            'outbound_packet',
            packet_id,
            0,
            len(question_ids),
        ),
    )
    outbound_file_id = cur.lastrowid
    db.execute(
        f"UPDATE team_member_questions SET status='SENT_TO_TEAM_MEMBER', updated_at=? WHERE company=? AND team_member_key=? AND id IN ({','.join('?' for _ in question_ids)})",
        (now, company, member_key, *question_ids),
    )
    db.execute(
        "UPDATE team_member_files SET linked_question_packet_id=? WHERE id=?",
        (packet_id, outbound_file_id),
    )
    append_team_member_correspondence_event(
        db,
        company,
        member_key,
        'packet_exported',
        f'Exported question packet v{packet_version} with {len(question_ids)} questions.',
        actor=actor,
        linked_file_id=outbound_file_id,
        linked_packet_id=packet_id,
    )
    return {
        'packet_id': packet_id,
        'packet_version': packet_version,
        'question_count': len(question_ids),
        'exported_file_path': str(packet_path),
        'outbound_file_id': outbound_file_id,
    }

def parse_answer_sections(answer_text):
    pattern = re.compile(r'^##\s+(TMQ-[A-Za-z0-9\-]+)\s+-\s+(.+?)\n(.*?)(?=^##\s+TMQ-|\Z)', re.MULTILINE | re.DOTALL)
    results = []
    for match in pattern.finditer(answer_text or ''):
        body = match.group(3).strip()
        answer_match = re.search(r'Answer:\s*(.+)', body, re.DOTALL | re.IGNORECASE)
        answer_text_value = answer_match.group(1).strip() if answer_match else body.strip()
        results.append({
            'question_code': match.group(1).strip(),
            'title': match.group(2).strip(),
            'answer_markdown': answer_text_value,
            'source_section': match.group(2).strip(),
        })
    return results

def match_team_member_answer(question_rows, answer):
    code = str(answer.get('question_code') or '').strip()
    if code:
        exact = next((row for row in question_rows if row.get('question_code') == code), None)
        if exact:
            return exact, 'HIGH'
    title = str(answer.get('title') or '').strip().lower()
    if title:
        scored = []
        for row in question_rows:
            ratio = difflib.SequenceMatcher(None, title, str(row.get('title') or '').strip().lower()).ratio()
            scored.append((ratio, row))
        scored.sort(key=lambda item: item[0], reverse=True)
        if scored and scored[0][0] >= 0.88:
            return scored[0][1], 'MEDIUM'
        if scored and scored[0][0] >= 0.72:
            return scored[0][1], 'LOW'
    return None, 'AMBIGUOUS'

def parse_team_member_answers_file(db, company, member_key, file_row, actor='OpenAI'):
    answer_text = extract_member_file_preview(file_row['saved_path'])
    question_rows = list_team_member_questions(db, company, member_key, statuses=['SENT_TO_TEAM_MEMBER', 'ANSWER_PENDING_REVIEW', 'NEEDS_FOLLOW_UP', 'ANSWERED'])
    parsed_sections = parse_answer_sections(answer_text)
    created = []
    unmatched = 0
    now = datetime.datetime.now().isoformat()
    for answer in parsed_sections:
        question_row, confidence = match_team_member_answer(question_rows, answer)
        question_id = question_row['id'] if question_row else None
        db.execute(
            """INSERT INTO team_member_question_answers(
                   question_id, answer_markdown, source_file_id, source_section, match_confidence, parsed_by, accepted_by_ryan, created_at
               ) VALUES(?,?,?,?,?,?,?,?)""",
            (
                question_id,
                answer.get('answer_markdown') or '',
                file_row['id'],
                answer.get('source_section') or '',
                confidence,
                actor,
                0,
                now,
            ),
        )
        answer_id = db.execute("SELECT last_insert_rowid() AS id").fetchone()['id']
        if question_row:
            new_status = 'ANSWERED' if confidence == 'HIGH' else 'ANSWER_PENDING_REVIEW'
            db.execute(
                "UPDATE team_member_questions SET status=?, updated_at=? WHERE id=?",
                (new_status, now, question_row['id']),
            )
            append_team_member_correspondence_event(
                db,
                company,
                member_key,
                'answers_parsed',
                f"Parsed answer for {question_row['question_code']} with {confidence} confidence.",
                actor=actor,
                linked_file_id=file_row['id'],
                linked_question_id=question_row['id'],
            )
            created.append({
                'answer_id': answer_id,
                'question_code': question_row['question_code'],
                'match_confidence': confidence,
                'status': new_status,
            })
        else:
            unmatched += 1
            append_team_member_correspondence_event(
                db,
                company,
                member_key,
                'unmatched_answer',
                'Stored an unmatched answer for Ryan review.',
                actor=actor,
                linked_file_id=file_row['id'],
            )
            created.append({
                'answer_id': answer_id,
                'question_code': '',
                'match_confidence': confidence,
                'status': 'UNMATCHED',
            })
    db.execute(
        "UPDATE team_member_files SET parsed_answer_count=? WHERE id=?",
        (len(created), file_row['id']),
    )
    return {
        'rows': created,
        'count': len(created),
        'unmatched_count': unmatched,
    }

def suggest_team_member_follow_ups(db, company, member_key, actor='OpenAI'):
    rows = db.execute(
        """SELECT q.*, a.answer_markdown, a.match_confidence
           FROM team_member_questions q
           LEFT JOIN team_member_question_answers a
             ON a.id = (
                 SELECT a2.id FROM team_member_question_answers a2
                 WHERE a2.question_id = q.id
                 ORDER BY a2.id DESC LIMIT 1
             )
           WHERE q.company=? AND q.team_member_key=? AND q.status IN ('ANSWER_PENDING_REVIEW', 'NEEDS_FOLLOW_UP')""",
        (company, member_key),
    ).fetchall()
    created = []
    for row in rows:
        answer_text = str(row['answer_markdown'] or '').lower()
        if row['match_confidence'] in ('LOW', 'AMBIGUOUS') or any(token in answer_text for token in ('not sure', 'need to check', 'unknown', 'follow up', 'later')):
            title = f"Follow up on {row['question_code']}"
            body = f"Clarify or complete the answer for `{row['question_code']}`. Current answer needs follow-up before it can be governed."
            question_id, question_code = create_team_member_question(
                db, company, member_key, title, body, priority='MEDIUM', status='NEW',
                source_file_id=row['source_file_id'], source_section='follow-up', generated_by=actor
            )
            created.append({'id': question_id, 'question_code': question_code, 'title': title})
    if created:
        append_team_member_correspondence_event(
            db,
            company,
            member_key,
            'follow_ups_generated',
            f"Generated {len(created)} follow-up questions.",
            actor=actor,
        )
    return created

def accept_team_member_questions(db, company, member_key, question_codes, actor='Ryan'):
    if not question_codes:
        return []
    placeholders = ','.join('?' for _ in question_codes)
    rows = db.execute(
        f"""SELECT * FROM team_member_questions
            WHERE company=? AND team_member_key=? AND question_code IN ({placeholders})""",
        (company, member_key, *question_codes),
    ).fetchall()
    now = datetime.datetime.now().isoformat()
    accepted = []
    for row in rows:
        db.execute(
            "UPDATE team_member_questions SET status='APPROVED', updated_at=?, last_human_touch_at=? WHERE id=?",
            (now, now, row['id']),
        )
        db.execute(
            """UPDATE team_member_question_answers
               SET accepted_by_ryan=1
               WHERE id = (
                   SELECT a2.id FROM team_member_question_answers a2
                   WHERE a2.question_id=?
                   ORDER BY a2.id DESC LIMIT 1
               )""",
            (row['id'],),
        )
        append_team_member_correspondence_event(
            db,
            company,
            member_key,
            'question_status_changed',
            f"{row['question_code']} moved to APPROVED by Ryan.",
            actor=actor,
            linked_question_id=row['id'],
        )
        accepted.append(row['question_code'])
    return accepted

def insert_ai_run(db, intake_id, engine, status, prompt_text='', output_text='', output_path='', error_text=''):
    started = datetime.datetime.now().isoformat()
    cur = db.cursor()
    cur.execute(
        """INSERT INTO ai_run(intake_id, engine, status, started_at, completed_at, prompt_text, output_text, output_path, error_text)
           VALUES(?,?,?,?,?,?,?,?,?)""",
        (intake_id, engine, status, started, started if status in ('completed', 'failed', 'blocked') else None,
         prompt_text, output_text, output_path, error_text)
    )
    return cur.lastrowid

def update_ai_run(db, run_id, status, output_text=None, output_path=None, error_text=None):
    db.execute(
        """UPDATE ai_run
           SET status=?, completed_at=?, output_text=COALESCE(?, output_text),
               output_path=COALESCE(?, output_path), error_text=COALESCE(?, error_text)
           WHERE id=?""",
        (status, datetime.datetime.now().isoformat(), output_text, output_path, error_text, run_id)
    )

def list_ai_runs(db, intake_id):
    return [dict(r) for r in db.execute("SELECT * FROM ai_run WHERE intake_id=? ORDER BY id DESC", (intake_id,))]

def list_ai_exchanges(db, intake_id=None, company=None):
    query = """
        SELECT x.*, i.company
        FROM ai_exchange x
        JOIN intake i ON i.id = x.intake_id
    """
    params = []
    clauses = []
    if intake_id is not None:
        clauses.append("x.intake_id=?")
        params.append(intake_id)
    if company is not None:
        clauses.append("i.company=?")
        params.append(company)
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY x.id DESC"
    return [dict(r) for r in db.execute(query, tuple(params))]

def append_workflow_event(db, intake_id, stage, actor, note):
    db.execute(
        "INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)",
        (intake_id, stage, datetime.datetime.now().isoformat(), actor, note)
    )

def latest_completed_run(db, intake_id, engine_name):
    return db.execute(
        """SELECT * FROM ai_run
           WHERE intake_id=? AND engine=? AND status='completed'
           ORDER BY id DESC LIMIT 1""",
        (intake_id, engine_name)
    ).fetchone()

def latest_completed_run_any(db, intake_id, engine_names):
    placeholders = ",".join("?" for _ in engine_names)
    return db.execute(
        f"""SELECT * FROM ai_run
            WHERE intake_id=? AND engine IN ({placeholders}) AND status='completed'
            ORDER BY id DESC LIMIT 1""",
        (intake_id, *engine_names)
    ).fetchone()

def governance_drafts_dir(company):
    d = get_company(company)['root'] / '_GOVERNANCE' / '_DRAFTS'
    d.mkdir(parents=True, exist_ok=True)
    return d

def intake_stage_allows_commit_review(stage):
    allowed = {
        'Awaiting Commit Approval',
        'Committed',
        'Pushed',
        'Constitution Candidate',
        'Constitution Approved',
    }
    return stage in allowed

def intake_stage_allows_ai_exchange(stage):
    return stage not in ('Committed', 'Pushed', 'Constitution Candidate', 'Constitution Approved')

def allowed_artifact_roots():
    roots = [Path(r'C:\Governance-UI')]
    for cfg in COMPANIES.values():
        roots.extend([cfg['root'], cfg['vault']])
    return [root.resolve() for root in roots]

def is_allowed_artifact_path(path_value):
    try:
        candidate = Path(path_value).resolve()
    except Exception:
        return False
    for root in allowed_artifact_roots():
        try:
            candidate.relative_to(root)
            return True
        except ValueError:
            continue
    return False

def build_openai_prompt(company, intake, files):
    file_list = '\n'.join(f"- {f['filename']}" for f in files)
    employee_line = intake['employee'] if intake['employee'] else 'org-wide / none'
    return f"""You are analyzing a governance intake item for {COMPANIES[company]['name_full']}.

Intake metadata:
- Intake ID: {intake['id']}
- Employee: {employee_line}
- Source type: {intake['source_type'] or 'document'}
- Note: {intake['note'] or '(none)'}

Files in this intake:
{file_list}

{governance_context(company, max_chars=12000)}

Task:
1. Summarize what this intake appears to contain.
2. Propose candidate questions in a voice-answer-compatible format.
3. Draft any likely decision structure as IF / THEN / ELSE only when directly supported.
4. Compare the intake against the approved governance above; flag any CONTRADICTION or drift from the corpus, plus missing owner truth.
5. Treat the governance corpus as authoritative; do not treat your own interpretation of the intake as approved governance truth.

Return concise markdown with these headings:
- Summary
- Candidate Questions
- Candidate Decisions
- Contradictions / Gaps
"""

def normalize_engine_slug(engine_name):
    slug = re.sub(r'[^a-z0-9]+', '_', engine_name.lower()).strip('_')
    return slug or 'engine'

def build_exchange_prompt(company, intake, source_engine, target_engine, topic, source_output):
    return f"""You are participating in a governed AI review exchange for {COMPANIES[company]['name_full']}.

Exchange topic:
{topic}

Source engine: {source_engine}
Target engine: {target_engine}
Intake ID: {intake['id']}
Employee: {intake['employee'] or 'org-wide / none'}
Source type: {intake['source_type'] or 'document'}
Note: {intake['note'] or '(none)'}

Review the source output below. Your job is not to replace it. Your job is to challenge, confirm, refine, or flag uncertainty.

Rules:
1. Distinguish CONFIRMED vs INFERRED vs QUESTION_REQUIRED.
2. If you disagree, explain why with evidence or the specific missing evidence.
3. Do not invent governance truth.
4. Keep the result suitable for a human approval gate.

Source output:
---
{source_output[:18000]}
---

Return markdown with these headings:
- Agreement Summary
- Confirmed Points
- Challenges / Corrections
- Missing Evidence
- Recommended Next Action
- Suggested Routing
"""

def build_questions_payload(company):
    cfg = get_company(company)
    db = get_db()
    assignments = get_question_assignment_map(db, company)
    result = {'org_wide': [], 'employees': {}, 'team_counts': []}

    org_q = cfg['root'] / '_GOVERNANCE' / 'PRIORITY_QUESTIONS_FOR_RYAN.md'
    if org_q.exists():
        for question in parse_questions(org_q.read_text(encoding='utf-8', errors='replace')):
            assignee = assignments.get(question['qid'], 'Ryan Cochran')
            question['assignee'] = assignee
            question['owner_scope'] = 'org-wide'
            question['context_items'] = build_question_context(cfg, question)
            result['org_wide'].append(question)

    emp_dir = cfg['root'] / 'EMPLOYEE_TASKS'
    if emp_dir.exists():
        for emp in emp_dir.iterdir():
            if not emp.is_dir():
                continue
            for qf in emp.glob('*PRIORITY_QUESTIONS*.md'):
                questions = parse_questions(qf.read_text(encoding='utf-8', errors='replace'))
                if not questions:
                    continue
                default_assignee = pretty_member_name(emp.name)
                for question in questions:
                    question['assignee'] = assignments.get(question['qid'], default_assignee)
                    question['owner_scope'] = 'employee'
                    question['context_items'] = build_question_context(cfg, question)
                result['employees'][emp.name] = {
                    'file': qf.name,
                    'questions': questions,
                    'total_count': len(questions),
                    'unanswered_count': sum(1 for q in questions if question_is_unanswered(q.get('status'))),
                    'display_name': pretty_member_name(emp.name),
                }

    # Merge workspace questions (incl. Meeting AI) so they surface in the Priority Questions tab.
    db_qs = db.execute(
        "SELECT * FROM team_member_questions WHERE company=? ORDER BY team_member_key, id",
        (company,),
    ).fetchall()
    for row in db_qs:
        member_key = row['team_member_key']
        display = pretty_member_name(member_key)
        question = {
            'qid': row['question_code'],
            'title': row['title'] or '',
            'short_question': (row['title'] or '')[:300],
            'body': row['body_markdown'] or '',
            'priority': (row['priority'] or 'MEDIUM').upper(),
            'status': row['status'] or 'NEW',
            'assignee': display,
            'owner_scope': 'employee',
            'source': row['generated_by'] or 'workspace',
            'context_items': [],
        }
        bucket = result['employees'].setdefault(member_key, {
            'file': None, 'questions': [], 'total_count': 0, 'unanswered_count': 0,
            'display_name': display,
        })
        bucket['questions'].append(question)
    for payload in result['employees'].values():
        payload['total_count'] = len(payload['questions'])
        payload['unanswered_count'] = sum(1 for q in payload['questions'] if question_is_unanswered(q.get('status')))

    assignee_counts = {}
    for question in result['org_wide']:
        assignee = question['assignee']
        bucket = assignee_counts.setdefault(assignee, {'key': assignee.replace(' ', '_'), 'display_name': assignee, 'total_count': 0, 'unanswered_count': 0})
        bucket['total_count'] += 1
        if question_is_unanswered(question.get('status')):
            bucket['unanswered_count'] += 1
    for payload in result['employees'].values():
        for question in payload['questions']:
            assignee = question['assignee']
            bucket = assignee_counts.setdefault(assignee, {'key': assignee.replace(' ', '_'), 'display_name': assignee, 'total_count': 0, 'unanswered_count': 0})
            bucket['total_count'] += 1
            if question_is_unanswered(question.get('status')):
                bucket['unanswered_count'] += 1
    team_counts = sorted(assignee_counts.values(), key=lambda item: (-item['unanswered_count'], item['display_name']))
    result['team_counts'] = team_counts
    return result

def build_repo_questions_payload(company, repo_name=None):
    db = get_db()
    rows = list_repo_questions(db, company, repo_name=repo_name)
    by_repo = {}
    for row in rows:
        bucket = by_repo.setdefault(row['repo_name'], {
            'repo_name': row['repo_name'],
            'questions': [],
            'total_count': 0,
            'unanswered_count': 0,
            'critical_count': 0,
        })
        bucket['questions'].append(row)
        bucket['total_count'] += 1
        if question_is_unanswered(row.get('status')):
            bucket['unanswered_count'] += 1
        if (row.get('priority') or '').upper() == 'CRITICAL':
            bucket['critical_count'] += 1
    return {
        'company': company,
        'repos': by_repo,
        'rows': rows,
    }

def build_member_question_packet(company, member_key, question_data=None):
    question_data = question_data or build_questions_payload(company)
    display_name = pretty_member_name(member_key)
    priority_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'UNKNOWN': 4}
    questions = []

    def maybe_add(question, scope_label):
        assignee = (question.get('assignee') or '').strip().lower()
        if assignee != display_name.lower():
            return
        payload = dict(question)
        payload['scope_label'] = scope_label
        questions.append(payload)

    for question in question_data.get('org_wide', []):
        maybe_add(question, 'Org-wide')

    for employee_key, payload in question_data.get('employees', {}).items():
        for question in payload.get('questions', []):
            maybe_add(question, pretty_member_name(employee_key))

    questions.sort(key=lambda q: (priority_order.get(q.get('priority') or 'UNKNOWN', 9), q.get('qid') or ''))

    priority_counts = {}
    for question in questions:
        priority = question.get('priority') or 'UNKNOWN'
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

    return {
        'member_key': member_key,
        'display_name': display_name,
        'questions': questions,
        'total_count': len(questions),
        'unanswered_count': sum(1 for q in questions if question_is_unanswered(q.get('status'))),
        'priority_counts': priority_counts,
    }

def build_member_question_chat_prompt(company, packet, user_prompt, session_notes=''):
    stopwords = {
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'if', 'in', 'is', 'it',
        'of', 'on', 'or', 'so', 'the', 'to', 'was', 'were', 'will', 'with',
        'what', 'when', 'where', 'which', 'who', 'why', 'how', 'that', 'this', 'these',
        'from', 'into', 'about', 'there', 'their', 'them', 'they', 'would', 'could',
        'should', 'have', 'your', 'you', 'like', 'need', 'help', 'specifically',
        'ryan', 'cochran', 'question', 'questions', 'packet', 'answer', 'answers',
    }
    keywords = [
        token for token in re.findall(r"[a-z0-9_#-]+", (user_prompt or '').lower())
        if len(token) >= 3 and token not in stopwords
    ]

    def question_score(question):
        haystack = ' '.join([
            str(question.get('qid') or ''),
            str(question.get('title') or ''),
            str(question.get('short_question') or ''),
            str(question.get('body') or ''),
        ]).lower()
        if not keywords:
            return 0
        return sum(4 if keyword in str(question.get('title') or '').lower() else 0 for keyword in keywords) + \
            sum(3 if keyword in str(question.get('short_question') or '').lower() else 0 for keyword in keywords) + \
            sum(1 for keyword in keywords if keyword in haystack)

    all_questions = packet.get('questions', [])
    matched_questions = [question for question in all_questions if question_score(question) > 0]
    matched_questions.sort(key=lambda q: (-question_score(q), q.get('qid') or ''))

    selected = []
    seen = set()
    for question in matched_questions[:4]:
        qid = question.get('qid') or ''
        if qid and qid not in seen:
            selected.append((question, True))
            seen.add(qid)

    for question in all_questions:
        if len(selected) >= 6:
            break
        qid = question.get('qid') or ''
        if qid and qid not in seen:
            selected.append((question, False))
            seen.add(qid)

    question_blocks = []
    for question, is_focus in selected:
        context_items = question.get('context_items') or []
        context_summary = '; '.join(
            f"{item.get('file')}: {item.get('summary') or 'context attached'}"
            for item in context_items[:1]
        )
        if not context_summary:
            context_summary = 'No linked governance file summaries attached.'
        body_snippet = (question.get('body') or '').strip()
        body_snippet = re.sub(r'\s+', ' ', body_snippet)
        body_snippet = body_snippet[:180 if is_focus else 80]
        focus_prefix = 'FOCUS' if is_focus else 'QUEUE'
        question_blocks.append(
            f"""- {focus_prefix} {question.get('qid')} [{question.get('priority') or 'UNKNOWN'}] ({question.get('scope_label')})
  Title: {question.get('title') or ''}
  Short question: {question.get('short_question') or ''}
  Status: {question.get('status') or 'OPEN'}
  Context snippet: {body_snippet or '(none)'}
  Linked context: {context_summary}"""
        )

    company_name = COMPANIES[company]['name_full']
    gov = governance_context(company, max_chars=12000)
    gov_block = (gov + "\n\n") if gov else ''
    return f"""You are assisting with a governed question-answering session for {company_name}.

{gov_block}Team member: {packet.get('display_name')}
Assigned questions: {packet.get('unanswered_count')} unanswered / {packet.get('total_count')} total
Relevant keywords from the latest user prompt: {', '.join(keywords[:12]) if keywords else '(none)'}

Focused question packet subset (trimmed for fast chat):
{chr(10).join(question_blocks) if question_blocks else '- No assigned questions were found.'}

Current session notes:
{session_notes or '(none)'}

User request:
{user_prompt}

Instructions:
1. Help the team member answer across the packet, prioritizing only the focused questions above unless another queue item is clearly necessary.
2. Prefer grouped answers when multiple questions can be answered together.
3. Distinguish CONFIRMED vs INFERRED vs QUESTION_REQUIRED when helpful.
4. Do not invent approved governance truth.
5. Be concise, direct, and practical. Keep the answer short enough to feel like chat, not a memo.
6. If the user asks for a specific list, answer that list first before adding any extra commentary.

Return markdown with these headings:
- Suggested answer packet
- Questions that can be answered together
- Questions still requiring human clarification
- Risks / assumptions
"""


# ------------- Routes: pages -------------
@app.route('/')
def index():
    return render_template('index.html', companies=list(COMPANIES.keys()))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('user_id'):
        return redirect(url_for('index'))
    db = get_db()
    has_users = db.execute("SELECT 1 FROM users LIMIT 1").fetchone() is not None
    if request.method == 'POST':
        username = (request.form.get('username') or '').strip()
        password = request.form.get('password') or ''
        row = db.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
        if row and check_password_hash(row['password_hash'], password):
            session['user_id'] = row['id']
            session['username'] = row['username']
            session['display_name'] = row['display_name'] or row['username']
            return redirect(url_for('index'))
        return render_template('auth.html', mode='login', error='Invalid username or password.',
                               has_users=has_users, username=username)
    return render_template('auth.html', mode='login', has_users=has_users)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if session.get('user_id'):
        return redirect(url_for('index'))
    db = get_db()
    if request.method == 'POST':
        username = (request.form.get('username') or '').strip()
        password = request.form.get('password') or ''
        confirm = request.form.get('confirm') or ''
        display_name = (request.form.get('display_name') or '').strip()
        error = None
        if not username or not password:
            error = 'Username and password are required.'
        elif len(username) < 3:
            error = 'Username must be at least 3 characters.'
        elif len(password) < 6:
            error = 'Password must be at least 6 characters.'
        elif password != confirm:
            error = 'Passwords do not match.'
        elif db.execute("SELECT 1 FROM users WHERE username=?", (username,)).fetchone():
            error = 'That username is already taken.'
        if error:
            return render_template('auth.html', mode='signup', error=error,
                                   username=username, display_name=display_name)
        db.execute(
            "INSERT INTO users(username, password_hash, display_name, created_at) VALUES(?,?,?,?)",
            (username, generate_password_hash(password), display_name or username,
             datetime.datetime.now().isoformat()),
        )
        db.commit()
        row = db.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
        session['user_id'] = row['id']
        session['username'] = row['username']
        session['display_name'] = row['display_name'] or row['username']
        return redirect(url_for('index'))
    return render_template('auth.html', mode='signup')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


@app.route('/api/debug/build')
def debug_build():
    template_path = BASE_DIR / 'templates' / 'index.html'
    template_text = template_path.read_text(encoding='utf-8')
    css_line = next((line.strip() for line in template_text.splitlines() if 'styles.css' in line), '')
    js_line = next((line.strip() for line in template_text.splitlines() if 'app.js' in line), '')
    return jsonify({
        'base_dir': str(BASE_DIR),
        'template_folder': app.template_folder,
        'static_folder': app.static_folder,
        'template_path': str(template_path),
        'css_line': css_line,
        'js_line': js_line,
    })


# ------------- Routes: API -------------
@app.route('/api/companies')
def api_companies():
    return jsonify([{'key': k, 'name': v['name_full'], 'gh_account': v['gh_account']} for k, v in COMPANIES.items()])

@app.route('/api/employees')
def api_employees():
    return jsonify(list_employees(request.args.get('company')))

@app.route('/api/team_members')
def api_team_members():
    company = request.args.get('company')
    db = get_db()
    tag_map = get_team_member_department_tags_map(db, company)
    recent_meetings = list_meetings_for_company(db, company, days=30)
    question_data = build_questions_payload(company)
    by_member = {}
    _profiles = TEAM_MEMBER_PROFILES.get(company) or {}
    _order_keys = list(_profiles.keys())
    if 'Ryan_Cochran' in _order_keys:
        _order_keys = ['Ryan_Cochran'] + [k for k in _order_keys if k != 'Ryan_Cochran']
    _roster_order = {k: i for i, k in enumerate(_order_keys)}
    for member in list_employees(company):
        _role = (get_team_member_profile(company, member).get('role') or '').strip()
        by_member[member] = {
            'key': member,
            'display_name': pretty_member_name(member),
            'role': _role,
            'group': role_group(_role),
            'order': _roster_order.get(member, 9999),
            'total_questions': 0,
            'unanswered_questions': 0,
            'assigned_intakes': 0,
            'assigned_files': 0,
        }

    for bucket in question_data.get('team_counts', []):
        member_key = bucket['key']
        if member_key not in by_member:
            by_member[member_key] = {
                'key': member_key,
                'display_name': bucket['display_name'],
                'total_questions': 0,
                'unanswered_questions': 0,
                'assigned_intakes': 0,
                'assigned_files': 0,
            }
        by_member[member_key]['total_questions'] = bucket['total_count']
        by_member[member_key]['unanswered_questions'] = bucket['unanswered_count']

    for member_key, payload in question_data.get('employees', {}).items():
        if member_key not in by_member:
            by_member[member_key] = {
                'key': member_key,
                'display_name': pretty_member_name(member_key),
                'total_questions': 0,
                'unanswered_questions': 0,
                'assigned_intakes': 0,
                'assigned_files': 0,
            }

    intake_rows = db.execute("""SELECT i.employee, COUNT(DISTINCT i.id) AS intake_count, COALESCE(COUNT(f.id), 0) AS file_count
                                FROM intake i
                                LEFT JOIN intake_file f ON i.id = f.intake_id
                                WHERE i.company=? AND i.employee IS NOT NULL AND i.employee <> ''
                                GROUP BY i.employee""", (company,)).fetchall()
    for row in intake_rows:
        member_key = row['employee']
        if member_key not in by_member:
            by_member[member_key] = {
                'key': member_key,
                'display_name': pretty_member_name(member_key),
                'total_questions': 0,
                'unanswered_questions': 0,
                'assigned_intakes': 0,
                'assigned_files': 0,
            }
        by_member[member_key]['assigned_intakes'] = row['intake_count']
        by_member[member_key]['assigned_files'] = row['file_count']

    member_file_counts = db.execute(
        """SELECT member_key, COUNT(*) AS c
           FROM team_member_files
           WHERE company=?
           GROUP BY member_key""",
        (company,),
    ).fetchall()
    for row in member_file_counts:
        member_key = row['member_key']
        if member_key not in by_member:
            by_member[member_key] = {
                'key': member_key,
                'display_name': pretty_member_name(member_key),
                'total_questions': 0,
                'unanswered_questions': 0,
                'assigned_intakes': 0,
                'assigned_files': 0,
            }
        by_member[member_key]['assigned_files'] += row['c']

    priority_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'UNKNOWN': 4}
    for member_key, member in by_member.items():
        profile = get_team_member_profile(company, member_key)
        merged_departments = sorted(set(profile.get('departments') or []).union({
            row['department_key'] for row in tag_map.get(member_key, [])
        }))
        display_name = member['display_name']
        assigned_questions = []
        for question in question_data.get('org_wide', []):
            if (question.get('assignee') or '').strip().lower() == display_name.lower():
                assigned_questions.append(question)
        employee_bucket = question_data.get('employees', {}).get(member_key, {
            'questions': [],
        })
        assigned_questions.extend(employee_bucket.get('questions', []))
        assigned_questions.sort(key=lambda q: (priority_order.get(q.get('priority') or 'UNKNOWN', 9), q.get('qid') or ''))

        priority_counts = {}
        for question in assigned_questions:
            priority = question.get('priority') or 'UNKNOWN'
            priority_counts[priority] = priority_counts.get(priority, 0) + 1

        assigned_intake_rows = [dict(r) for r in db.execute(
            """SELECT i.id, i.note, i.stage, i.source_type, i.uploaded_at, COUNT(f.id) AS file_count
               FROM intake i
               LEFT JOIN intake_file f ON i.id = f.intake_id
               WHERE i.company=? AND i.employee=?
               GROUP BY i.id
               ORDER BY i.uploaded_at DESC
               LIMIT 10""",
            (company, member_key)
        ).fetchall()]
        assigned_file_rows = [dict(r) for r in db.execute(
            """SELECT f.id, f.filename, f.saved_path, f.size_bytes, f.intake_id
               FROM intake_file f
               JOIN intake i ON i.id = f.intake_id
               WHERE i.company=? AND i.employee=?
               ORDER BY f.id DESC
               LIMIT 20""",
            (company, member_key)
        ).fetchall()]
        member_file_rows = list_team_member_files(db, company, member_key)
        team_member_question_rows = list_team_member_questions(db, company, member_key)
        team_member_packet_rows = list_team_member_question_packets(db, company, member_key)
        team_member_correspondence_rows = list_team_member_correspondence(db, company, member_key, limit=25)
        tm_question_counts = summarize_team_member_question_statuses(team_member_question_rows)
        member_meetings = []
        for meeting in recent_meetings:
            attendee_row = next((row for row in meeting['attendees'] if row.get('team_member_key') == member_key), None)
            if attendee_row:
                member_meetings.append({
                    'id': meeting['id'],
                    'title': meeting['title'],
                    'meeting_type': meeting['meeting_type'],
                    'meeting_date': meeting['meeting_date'],
                    'note': meeting['note'],
                    'notes_file_path': meeting['notes_file_path'],
                    'follow_up_done': bool(attendee_row.get('follow_up_done')),
                    'follow_up_note': attendee_row.get('follow_up_note') or '',
                    'attendee_count': meeting.get('attendee_count', 0),
                })

        member['detail'] = {
            'key': member_key,
            'display_name': display_name,
            'role': profile.get('role') or '',
            'purpose': profile.get('purpose') or '',
            'departments': merged_departments,
            'manual_department_tags': [row['department_key'] for row in tag_map.get(member_key, [])],
            'repos': profile.get('repos') or [],
            'operating_sources': profile.get('operating_sources') or [],
            'question_total': len(assigned_questions),
            'question_unanswered': sum(1 for q in assigned_questions if question_is_unanswered(q.get('status'))),
            'priority_counts': priority_counts,
            'assigned_intakes': member['assigned_intakes'],
            'assigned_files': member['assigned_files'],
            'top_questions': assigned_questions[:8],
            'assigned_intake_items': assigned_intake_rows,
            'assigned_file_items': assigned_file_rows,
            'member_file_items': member_file_rows,
            'member_file_count': len(member_file_rows),
            'team_member_questions': team_member_question_rows,
            'team_member_question_counts': tm_question_counts,
            'team_member_question_packets': team_member_packet_rows,
            'team_member_correspondence': team_member_correspondence_rows,
            'recent_meetings': member_meetings[:8],
            'meeting_count_30d': len(member_meetings),
            'member_hub': get_member_hub(company, member_key),
            'daily_tasks': [],
            'task_lanes': [],
            'critical_rules': [],
            'immutable_rules': [],
            'workspace_sources': [],
        }

        member['debug_version'] = 'team-members-v2'

    return jsonify(sorted(by_member.values(), key=lambda item: (-item['unanswered_questions'], item['display_name'])))

@app.route('/api/categories')
def api_categories():
    return jsonify(REPO_CATEGORIES)

@app.route('/api/workflow/stages')
def api_stages():
    return jsonify(WORKFLOW_STAGES)

@app.route('/api/integrations')
def api_integrations():
    company = request.args.get('company')
    cfg = get_company(company)
    gh_ok, gh_detail = github_cli_authenticated()
    claude_ok = command_exists(CLAUDE_EXE or 'claude')
    openai_ok = openai_configured()
    return jsonify({
        'company': company,
        'items': [
            {
                'name': 'Claude Code',
                'status': 'Active' if claude_ok else 'Unavailable',
                'connected': claude_ok,
                'detail': 'Claude CLI is callable from this machine and can run intake analysis directly.' if claude_ok else 'Claude CLI is not available in PATH.',
            },
            {
                'name': 'OpenAI Codex',
                'status': 'Awaiting API key' if not openai_ok else 'Active',
                'connected': openai_ok,
                'masked_key': mask_secret(get_openai_api_key()),
                'model': get_openai_model(),
                'detail': 'OpenAI integration is scaffolded, but no API key is configured yet. You can activate it from the UI.' if not openai_ok else f'OpenAI API key detected. Transcript and decision drafting calls can run from the UI using model {get_openai_model()}.',
            },
            {
                'name': 'GitHub / local git',
                'status': 'Active' if gh_ok else 'Local git only',
                'connected': True,
                'detail': f"Local git status/history are available for {cfg['root']} and {cfg['vault']}. GitHub CLI auth: {gh_detail}",
            },
        ]
    })

@app.route('/api/openai_settings')
def api_openai_settings():
    settings = load_local_settings()
    configured = bool(get_openai_api_key())
    source = 'environment' if os.getenv('OPENAI_API_KEY') else ('local_settings' if settings.get('openai_api_key') else 'missing')
    return jsonify({
        'configured': configured,
        'source': source,
        'model': get_openai_model(),
    })

@app.route('/api/openai_settings', methods=['POST'])
def api_openai_settings_save():
    body = request.get_json() or {}
    if body.get('remove'):
        settings = load_local_settings()
        settings.pop('openai_api_key', None)
        save_local_settings(settings)
        return jsonify({'ok': True, 'configured': False})
    api_key = (body.get('api_key') or '').strip()
    model = (body.get('model') or 'gpt-5').strip() or 'gpt-5'
    if not api_key:
        abort(400, 'api_key required')
    settings = load_local_settings()
    settings['openai_api_key'] = api_key
    settings['openai_model'] = model
    save_local_settings(settings)
    return jsonify({'ok': True, 'configured': True, 'model': model})

@app.route('/api/member_hub')
def api_member_hub():
    company = request.args.get('company')
    member_key = request.args.get('member')
    if not company or not member_key:
        abort(400, 'company and member required')
    return jsonify(get_member_hub(company, member_key))

@app.route('/api/member_hub/launch', methods=['POST'])
def api_member_hub_launch():
    body = request.get_json() or {}
    company = body.get('company')
    member_key = body.get('member')
    if not company or not member_key:
        abort(400, 'company and member required')
    hub = get_member_hub(company, member_key)
    if not hub.get('enabled'):
        return jsonify({'ok': False, 'error': 'No member hub configured for this team member.'}), 400
    if hub.get('running'):
        return jsonify({'ok': True, 'running': True, 'url': hub.get('url'), 'message': 'Hub already running.'})
    repo_dir = Path(hub['repo_dir'])
    launch_target = Path(hub['launch_target'])
    if not repo_dir.exists() or not launch_target.exists():
        return jsonify({'ok': False, 'error': 'Hub source files were not found on this machine.'}), 404
    try:
        subprocess.Popen(
            ['python', str(launch_target)],
            cwd=str(repo_dir),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
        )
        for _ in range(12):
            time.sleep(0.5)
            if local_service_up('127.0.0.1', 5000):
                break
        running = local_service_up('127.0.0.1', 5000)
        return jsonify({'ok': running, 'running': running, 'url': hub.get('url'), 'message': 'Hub launched.' if running else 'Launch attempted, but the hub is not responding yet.'})
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500


@app.route('/api/member_hub/gmail_auth')
def api_member_hub_gmail_auth():
    company = request.args.get('company')
    member_key = request.args.get('member')
    if not company or not member_key:
        abort(400, 'company and member required')
    hub = get_member_hub(company, member_key)
    if not hub.get('gmail_auth_enabled'):
        return jsonify({'ok': False, 'enabled': False, 'error': 'Gmail auth is not configured for this member hub.'}), 400
    if not hub.get('running'):
        return jsonify({'ok': False, 'enabled': True, 'running': False, 'authenticated': False, 'message': 'Daily Operations Hub is not running.'})
    try:
        payload, _ = member_hub_request(company, member_key, '/check-gmail-auth')
        return jsonify({
            'ok': True,
            'enabled': True,
            'running': True,
            'authenticated': bool(payload.get('authenticated')),
            'message': 'Authenticated - token available.' if payload.get('authenticated') else 'Token expired or missing - launch Gmail re-auth.',
        })
    except Exception as e:
        return jsonify({'ok': False, 'enabled': True, 'running': True, 'authenticated': False, 'error': str(e)}), 500


@app.route('/api/member_hub/gmail_auth/reauth', methods=['POST'])
def api_member_hub_gmail_auth_reauth():
    body = request.get_json() or {}
    company = body.get('company')
    member_key = body.get('member')
    if not company or not member_key:
        abort(400, 'company and member required')
    hub = get_member_hub(company, member_key)
    if not hub.get('gmail_auth_enabled'):
        return jsonify({'ok': False, 'enabled': False, 'error': 'Gmail auth is not configured for this member hub.'}), 400
    if not hub.get('running'):
        return jsonify({'ok': False, 'enabled': True, 'running': False, 'error': 'Daily Operations Hub is not running. Launch it first.'}), 400
    try:
        payload, _ = member_hub_request(company, member_key, '/reauth-gmail', method='POST')
        return jsonify({
            'ok': bool(payload.get('ok')),
            'enabled': True,
            'running': True,
            'started': bool(payload.get('started', payload.get('ok'))),
            'message': payload.get('message') or 'Gmail re-auth launched.',
            'stdout': payload.get('stdout', ''),
            'stderr': payload.get('stderr', ''),
        })
    except Exception as e:
        return jsonify({'ok': False, 'enabled': True, 'running': True, 'error': str(e)}), 500

@app.route('/api/customer_source')
def api_customer_source():
    company = request.args.get('company')
    get_company(company)
    return jsonify(customer_source_settings(company))

@app.route('/api/customer_source', methods=['POST'])
def api_customer_source_save():
    body = request.get_json() or {}
    company = body.get('company')
    get_company(company)
    settings = load_local_settings()
    customer_sources = settings.get('customer_sources') or {}
    customer_sources[company] = {
        'server': (body.get('server') or '').strip(),
        'database': (body.get('database') or '').strip(),
        'table_or_view': (body.get('table_or_view') or '').strip(),
        'notes': (body.get('notes') or '').strip(),
    }
    settings['customer_sources'] = customer_sources
    save_local_settings(settings)
    return jsonify({'ok': True, 'configured': bool(customer_sources[company].get('server') and customer_sources[company].get('database'))})

@app.route('/api/exchanges')
def api_exchanges():
    company = request.args.get('company')
    get_company(company)
    db = get_db()
    return jsonify(list_ai_exchanges(db, company=company))

@app.route('/api/artifact')
def api_artifact():
    path_value = request.args.get('path', '')
    if not path_value:
        abort(400, 'path required')
    if not is_allowed_artifact_path(path_value):
        return jsonify({'ok': False, 'error': 'path not allowed'}), 403
    artifact = Path(path_value)
    if not artifact.exists() or not artifact.is_file():
        return jsonify({'ok': False, 'error': 'file not found'}), 404
    try:
        content = artifact.read_text(encoding='utf-8', errors='replace')
    except Exception as e:
        return jsonify({'ok': False, 'error': str(e)}), 500
    return jsonify({
        'ok': True,
        'path': str(artifact),
        'name': artifact.name,
        'size_bytes': artifact.stat().st_size,
        'content': content,
    })

@app.route('/api/overview')
def api_overview():
    company = request.args.get('company')
    cfg = get_company(company)
    db = get_db()
    department_data = departments_for_company(company)
    counts = {
        'governance_files': len(list((cfg['root'] / '_GOVERNANCE').glob('*.md'))) if (cfg['root'] / '_GOVERNANCE').exists() else 0,
        'employees': len(list_employees(company)),
        'departments': department_data['count'],
        'mirror_repos': sum(1 for p in cfg['mirror'].iterdir() if p.is_dir() and (p / '.git').exists()) if cfg['mirror'].exists() else 0,
        'intakes_total': db.execute("SELECT COUNT(*) FROM intake WHERE company=?", (company,)).fetchone()[0],
        'intakes_blocked': db.execute("SELECT COUNT(*) FROM intake WHERE company=? AND blocker IS NOT NULL", (company,)).fetchone()[0],
        'intake_files_total': db.execute("""SELECT COALESCE(COUNT(f.id), 0)
                                            FROM intake i
                                            LEFT JOIN intake_file f ON i.id=f.intake_id
                                            WHERE i.company=?""", (company,)).fetchone()[0],
    }
    by_stage = {}
    for row in db.execute("SELECT stage, COUNT(*) AS c FROM intake WHERE company=? GROUP BY stage", (company,)):
        by_stage[row['stage']] = row['c']
    return jsonify({
        'company': company,
        'company_full': cfg['name_full'],
        'gh_account': cfg['gh_account'],
        'paths': {'governance_root': str(cfg['root']), 'vault': str(cfg['vault']), 'code_mirror': str(cfg['mirror'])},
        'counts': counts,
        'by_stage': by_stage,
        'department_summary': {
            'shared': len(department_data['shared']),
            'company_specific': len(department_data['company_specific']),
        },
    })

@app.route('/api/nav_counts')
def api_nav_counts():
    company = request.args.get('company')
    cfg = get_company(company)
    db = get_db()
    department_data = departments_for_company(company, db)
    intake_total = db.execute("SELECT COUNT(*) FROM intake WHERE company=?", (company,)).fetchone()[0]
    blocked_total = db.execute(
        "SELECT COUNT(*) FROM intake WHERE company=? AND (blocker IS NOT NULL OR stage IN ('Employee Questions Pending','Ryan Questions Pending','Awaiting Ryan Approval'))",
        (company,)
    ).fetchone()[0]
    ready_commit = db.execute(
        "SELECT COUNT(*) FROM intake WHERE company=? AND stage='Awaiting Commit Approval'",
        (company,)
    ).fetchone()[0]
    constitution = db.execute(
        "SELECT COUNT(*) FROM intake WHERE company=? AND stage IN ('Constitution Candidate','Constitution Approved')",
        (company,)
    ).fetchone()[0]
    markdown_files = len(list((cfg['root'] / '_GOVERNANCE').glob('*.md'))) if (cfg['root'] / '_GOVERNANCE').exists() else 0

    return jsonify({
        'dashboard': intake_total,
        'intake': intake_total,
        'board': blocked_total,
        'team': len(list_employees(company)),
        'departments': department_data['count'],
        'questions': count_questions_for_company(cfg),
        'findings': count_findings_for_company(cfg),
        'meetings': db.execute(
            "SELECT COUNT(*) FROM meetings WHERE company=? AND meeting_date>=?",
            (company, (datetime.date.today() - datetime.timedelta(days=7)).isoformat()),
        ).fetchone()[0],
        'aspect_groups': len(aspect_groups_for_company(company)),
        'classification': sum(1 for p in cfg['mirror'].iterdir() if p.is_dir() and (p / '.git').exists()) if cfg['mirror'].exists() else 0,
        'decisions': 1 if _gov_find(cfg, 'DECISION_LOG.md') else 0,
        'glossary': 1 if _gov_glob(cfg, '*Glossary*.md') else 0,
        'inventory': 1 if _gov_find(cfg, '_REPO_INVENTORY.md') else 0,
        'customers': len(customer_sources_for_company(company)['governance_files']) + len(customer_sources_for_company(company)['customer_repos']),
        'files': markdown_files,
        'git': ready_commit,
        'exchange': db.execute("SELECT COUNT(*) FROM ai_exchange x JOIN intake i ON i.id=x.intake_id WHERE i.company=?", (company,)).fetchone()[0],
        'constitution': constitution,
        'record': 0,
        'team': len(list_employees(company)),
    })


# ----- Intake API -----
@app.route('/api/intake', methods=['POST'])
def api_intake_create():
    """Drag/drop upload. Multi-file. Creates an intake record + saved files."""
    company = request.form.get('company')
    cfg = get_company(company)
    employee = request.form.get('employee') or None
    source_type = request.form.get('source_type') or 'document'
    ai_engines = request.form.get('ai_engines') or 'Claude'
    note = request.form.get('note') or ''
    files = request.files.getlist('files')
    if not files:
        abort(400, 'no files attached')

    db = get_db()
    cur = db.cursor()
    cur.execute("""INSERT INTO intake(company, employee, uploaded_at, source_type, ai_engines, note, stage)
                   VALUES(?,?,?,?,?,?,?)""",
                (company, employee, datetime.datetime.now().isoformat(), source_type, ai_engines, note, 'Uploaded'))
    intake_id = cur.lastrowid

    # Save files into intake folder. Handle filename collisions and locked-file
    # PermissionErrors (common on Windows when Excel/OneDrive/AV holds the file
    # open) so a single failing file does not crash the whole intake or leave an
    # orphan row in the database.
    intake_root = get_intake_dir(company) / f'intake_{intake_id:05d}'
    intake_root.mkdir(exist_ok=True)
    saved_files = []
    failed_files = []
    timestamp_token = datetime.datetime.now().strftime('%H%M%S')
    for f in files:
        original_name = f.filename or 'unnamed'
        safe_name = original_name.replace('/', '_').replace('\\', '_')
        out_path = intake_root / safe_name
        if out_path.exists():
            stem = out_path.stem
            suffix = out_path.suffix
            counter = 1
            while True:
                candidate = intake_root / f"{stem}_{timestamp_token}_{counter}{suffix}"
                if not candidate.exists():
                    out_path = candidate
                    safe_name = candidate.name
                    break
                counter += 1
        try:
            f.save(out_path)
        except (PermissionError, OSError) as exc:
            failed_files.append({'filename': original_name, 'reason': str(exc)})
            continue
        cur.execute("INSERT INTO intake_file(intake_id, filename, saved_path, size_bytes) VALUES(?,?,?,?)",
                    (intake_id, safe_name, str(out_path), out_path.stat().st_size))
        saved_files.append(safe_name)

    if not saved_files:
        db.rollback()
        try:
            intake_root.rmdir()
        except OSError:
            pass
        return jsonify({
            'ok': False,
            'error': 'No files could be saved. Close the file in Excel/Preview/OneDrive and try again, or rename the file before uploading.',
            'failed_files': failed_files,
        }), 500

    # Initial gates
    for g_name in GATE_NAMES:
        cur.execute("INSERT INTO gate(intake_id, gate_name, status) VALUES(?,?,?)",
                    (intake_id, g_name, 'Not Started'))

    upload_note = f'Uploaded {len(saved_files)} file(s)'
    if failed_files:
        upload_note += f', {len(failed_files)} failed (locked or unwritable)'
    cur.execute("INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)",
                (intake_id, 'Uploaded', datetime.datetime.now().isoformat(), 'user', upload_note))
    cur.execute("UPDATE intake SET stage=? WHERE id=?", ('Stored', intake_id))
    cur.execute("INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)",
                (intake_id, 'Stored', datetime.datetime.now().isoformat(), 'system', f'Files stored under {intake_root}'))

    db.commit()
    return jsonify({
        'intake_id': intake_id,
        'saved_to': str(intake_root),
        'saved_files': saved_files,
        'failed_files': failed_files,
    })

@app.route('/api/intake')
def api_intake_list():
    company = request.args.get('company')
    db = get_db()
    rows = db.execute("""SELECT i.*, COUNT(f.id) AS file_count
                         FROM intake i LEFT JOIN intake_file f ON i.id=f.intake_id
                         WHERE i.company=? GROUP BY i.id
                         ORDER BY i.uploaded_at DESC""", (company,)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/intake/<int:intake_id>')
def api_intake_detail(intake_id):
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake: abort(404)
    files = [dict(r) for r in db.execute("SELECT * FROM intake_file WHERE intake_id=?", (intake_id,))]
    events = [dict(r) for r in db.execute("SELECT * FROM workflow_event WHERE intake_id=? ORDER BY ts", (intake_id,))]
    gates = [dict(r) for r in db.execute("SELECT * FROM gate WHERE intake_id=?", (intake_id,))]
    links = [dict(r) for r in db.execute("SELECT * FROM link WHERE intake_id=?", (intake_id,))]
    runs = list_ai_runs(db, intake_id)
    exchanges = list_ai_exchanges(db, intake_id=intake_id)
    return jsonify({
        'intake': dict(intake),
        'files': files,
        'events': events,
        'gates': gates,
        'links': links,
        'runs': runs,
        'exchanges': exchanges,
        'workflow_stages': WORKFLOW_STAGES,
        'commit_review_ready': intake_stage_allows_commit_review(intake['stage']),
        'exchange_ready': intake_stage_allows_ai_exchange(intake['stage']),
    })

@app.route('/api/intake/<int:intake_id>/advance', methods=['POST'])
def api_intake_advance(intake_id):
    """Advance an intake to the next stage. Enforces gate logic."""
    body = request.get_json() or {}
    target = body.get('target_stage')
    actor = body.get('actor', 'user')
    note = body.get('note', '')
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake: abort(404)

    current = intake['stage']
    if target not in WORKFLOW_STAGES: abort(400, 'invalid target stage')
    cur_idx, tgt_idx = WORKFLOW_STAGES.index(current), WORKFLOW_STAGES.index(target)
    if tgt_idx < cur_idx: abort(400, 'cannot move backwards via advance; use revert')
    if tgt_idx > cur_idx + 1 and not body.get('force'):
        abort(400, f'cannot skip stages (current: {current}, target: {target}). Pass force=true to override.')

    # Gate enforcement for key transitions
    blocked_reason = check_gate_for_advance(db, intake_id, target)
    if blocked_reason and not body.get('force'):
        return jsonify({'error': 'blocked', 'reason': blocked_reason}), 409

    cur = db.cursor()
    cur.execute("UPDATE intake SET stage=?, blocker=NULL WHERE id=?", (target, intake_id))
    cur.execute("INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)",
                (intake_id, target, datetime.datetime.now().isoformat(), actor, note))
    db.commit()
    return jsonify({'ok': True, 'new_stage': target})

def check_gate_for_advance(db, intake_id, target):
    gates = {r['gate_name']: r['status'] for r in db.execute("SELECT * FROM gate WHERE intake_id=?", (intake_id,))}
    rules = {
        'Decision Drafting': ('Findings Approved', 'Findings not yet approved'),
        'Awaiting Commit Approval': ('Decision Approved', 'Decision not yet approved'),
        'Committed': ('Commit Approved', 'Commit gate not opened'),
        'Constitution Candidate': ('Commit Approved', 'Cannot enter constitution lane until commit approved'),
        'Constitution Approved': ('Constitution Eligible', 'Constitution gate not approved'),
    }
    if target in rules:
        gate_name, message = rules[target]
        if gates.get(gate_name) != 'Approved':
            return f'{message} (gate: {gate_name})'
    return None

def build_claude_prompt(company, intake, files):
    file_list = '\n'.join(f"- {f['filename']}" for f in files)
    employee_line = intake['employee'] if intake['employee'] else 'org-wide / none'
    return f"""You are analyzing a governance intake item for {COMPANIES[company]['name_full']}.

Intake metadata:
- Intake ID: {intake['id']}
- Employee: {employee_line}
- Source type: {intake['source_type'] or 'document'}
- Note: {intake['note'] or '(none)'}

Files in this intake:
{file_list}

{governance_context(company, max_chars=12000)}

Task:
1. Summarize what this intake appears to contain.
2. Identify candidate findings as FACT, PATTERN, INCONSISTENCY, or INFERENCE - mark INCONSISTENCY when the intake conflicts with the approved governance above.
3. Suggest whether anything should route to an employee-specific queue versus Ryan's org-wide queue.
4. Note any likely repo/business categories if the files support that.
5. Treat the governance corpus as authoritative; do not treat your own interpretation as approved governance truth.

Return concise markdown with these headings:
- Summary
- Candidate Findings
- Candidate Questions
- Suggested Routing
- Risks / Unknowns
"""

@app.route('/api/intake/<int:intake_id>/gate', methods=['POST'])
def api_intake_gate(intake_id):
    body = request.get_json() or {}
    name = body.get('gate_name')
    status = body.get('status')
    approver = body.get('approver', 'user')
    note = body.get('note', '')
    if name not in GATE_NAMES: abort(400, 'invalid gate')
    if status not in ('Not Started', 'Pending', 'Blocked', 'Approved', 'Rejected'): abort(400, 'invalid status')
    db = get_db()
    db.execute("""UPDATE gate SET status=?, approver=?, decided_at=?, note=?
                  WHERE intake_id=? AND gate_name=?""",
               (status, approver, datetime.datetime.now().isoformat(), note, intake_id, name))
    db.execute("INSERT INTO workflow_event(intake_id, stage, ts, actor, note) VALUES(?,?,?,?,?)",
               (intake_id, f'Gate: {name}', datetime.datetime.now().isoformat(), approver, f'{status}. {note}'))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/intake/<int:intake_id>/link', methods=['POST'])
def api_intake_link(intake_id):
    body = request.get_json() or {}
    kind = body.get('kind')
    ref = body.get('ref')
    if kind not in ('finding', 'question', 'decision', 'commit'): abort(400, 'invalid kind')
    db = get_db()
    db.execute("INSERT INTO link(intake_id, kind, ref) VALUES(?,?,?)", (intake_id, kind, ref))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/intake/<int:intake_id>/run_claude', methods=['POST'])
def api_run_claude(intake_id):
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake:
        abort(404)
    if not command_exists(CLAUDE_EXE or 'claude'):
        run_id = insert_ai_run(db, intake_id, 'Claude Code', 'blocked', error_text='Claude CLI not available')
        append_workflow_event(db, intake_id, 'Claude run blocked', 'system', 'Claude CLI not available')
        db.commit()
        return jsonify({'ok': False, 'run_id': run_id, 'reason': 'Claude CLI not available'}), 409

    company = intake['company']
    files = [dict(r) for r in db.execute("SELECT * FROM intake_file WHERE intake_id=?", (intake_id,))]
    intake_dir = intake_dir_for_id(company, intake_id)
    output_path = intake_dir / 'claude_output.md'
    prompt = build_claude_prompt(company, intake, files)
    run_id = insert_ai_run(db, intake_id, 'Claude Code', 'running', prompt_text=prompt, output_path=str(output_path))
    append_workflow_event(db, intake_id, 'Claude run started', 'system', 'Launching Claude intake analysis')
    db.commit()

    try:
        cmd = [CLAUDE_EXE or 'claude', '-p', prompt, '--add-dir', str(intake_dir), '--add-dir', str(get_company(company)['root'] / '_GOVERNANCE'), '--allowedTools', 'Read']
        claude_timeout = int(load_local_settings().get('claude_timeout', 600))
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=claude_timeout, cwd=str(intake_dir))
        if result.returncode != 0:
            update_ai_run(db, run_id, 'failed', error_text=(result.stderr or result.stdout or 'Claude run failed').strip())
            append_workflow_event(db, intake_id, 'Claude run failed', 'system', (result.stderr or result.stdout or 'Claude run failed').strip()[:400])
            db.commit()
            return jsonify({'ok': False, 'run_id': run_id, 'error': (result.stderr or result.stdout or 'Claude run failed').strip()}), 500
        output_text = result.stdout.strip()
        output_path.write_text(output_text, encoding='utf-8')
        update_ai_run(db, run_id, 'completed', output_text=output_text, output_path=str(output_path))
        append_workflow_event(db, intake_id, 'Claude run completed', 'system', f'Claude analysis saved to {output_path.name}')
        if intake['stage'] in ('Stored', 'Parsed'):
            db.execute("UPDATE intake SET stage=? WHERE id=?", ('AI Reviewed', intake_id))
            append_workflow_event(db, intake_id, 'AI Reviewed', 'system', 'Claude completed intake analysis')
        db.commit()
        return jsonify({'ok': True, 'run_id': run_id, 'output_path': str(output_path), 'excerpt': output_text[:800]})
    except subprocess.TimeoutExpired:
        update_ai_run(db, run_id, 'failed', error_text='Claude run timed out')
        append_workflow_event(db, intake_id, 'Claude run failed', 'system', 'Claude run timed out')
        db.commit()
        return jsonify({'ok': False, 'run_id': run_id, 'error': 'Claude run timed out'}), 504

@app.route('/api/intake/<int:intake_id>/run_openai', methods=['POST'])
def api_run_openai(intake_id):
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake:
        abort(404)
    if not openai_configured():
        run_id = insert_ai_run(db, intake_id, 'OpenAI Codex', 'blocked', error_text='OPENAI_API_KEY not configured')
        append_workflow_event(db, intake_id, 'OpenAI run blocked', 'system', 'OPENAI_API_KEY not configured')
        db.commit()
        return jsonify({'ok': False, 'run_id': run_id, 'reason': 'OPENAI_API_KEY not configured'}), 409

    company = intake['company']
    files = [dict(r) for r in db.execute("SELECT * FROM intake_file WHERE intake_id=?", (intake_id,))]
    intake_dir = intake_dir_for_id(company, intake_id)
    output_path = intake_dir / 'openai_output.md'
    prompt = build_openai_prompt(company, intake, files)
    run_id = insert_ai_run(db, intake_id, 'OpenAI Codex', 'running', prompt_text=prompt, output_path=str(output_path))
    append_workflow_event(db, intake_id, 'OpenAI run started', 'system', 'Launching OpenAI intake analysis')
    db.commit()

    try:
        payload = {
            'model': get_openai_model(),
            'input': prompt,
        }
        headers = {
            'Authorization': f"Bearer {get_openai_api_key()}",
            'Content-Type': 'application/json',
        }
        response = requests.post('https://api.openai.com/v1/responses', headers=headers, json=payload, timeout=120)
        if response.status_code >= 400:
            update_ai_run(db, run_id, 'failed', error_text=response.text[:2000])
            append_workflow_event(db, intake_id, 'OpenAI run failed', 'system', response.text[:400])
            db.commit()
            return jsonify({'ok': False, 'run_id': run_id, 'error': response.text}), 500
        data = response.json()
        output_text = data.get('output_text', '')
        if not output_text and 'output' in data:
            parts = []
            for item in data.get('output', []):
                for content in item.get('content', []):
                    if content.get('type') == 'output_text':
                        parts.append(content.get('text', ''))
            output_text = '\n'.join(parts).strip()
        output_path.write_text(output_text, encoding='utf-8')
        update_ai_run(db, run_id, 'completed', output_text=output_text, output_path=str(output_path))
        append_workflow_event(db, intake_id, 'OpenAI run completed', 'system', f'OpenAI analysis saved to {output_path.name}')
        if intake['stage'] in ('Stored', 'Parsed'):
            db.execute("UPDATE intake SET stage=? WHERE id=?", ('AI Reviewed', intake_id))
            append_workflow_event(db, intake_id, 'AI Reviewed', 'system', 'OpenAI completed intake analysis')
        db.commit()
        return jsonify({'ok': True, 'run_id': run_id, 'output_path': str(output_path), 'excerpt': output_text[:800]})
    except Exception as e:
        update_ai_run(db, run_id, 'failed', error_text=str(e))
        append_workflow_event(db, intake_id, 'OpenAI run failed', 'system', str(e)[:400])
        db.commit()
        return jsonify({'ok': False, 'run_id': run_id, 'error': str(e)}), 500

@app.route('/api/intake/<int:intake_id>/github_snapshot', methods=['POST'])
def api_intake_github_snapshot(intake_id):
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake:
        abort(404)
    company = intake['company']
    cfg = get_company(company)
    gh_ok, gh_detail = github_cli_authenticated()
    governance_dirty = False
    legal_dirty = False
    governance_changes = []
    legal_changes = []
    for label, path in [('governance', cfg['root']), ('legal', cfg['vault'])]:
        if (path / '.git').exists():
            result = subprocess.run([GIT_EXE, '-C', str(path), 'status', '--short'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=10)
            changes = [line for line in result.stdout.splitlines() if line.strip()]
            if label == 'governance':
                governance_dirty = bool(changes)
                governance_changes = changes
            else:
                legal_dirty = bool(changes)
                legal_changes = changes
    snapshot = {
        'gh_authenticated': gh_ok,
        'gh_detail': gh_detail,
        'governance_dirty': governance_dirty,
        'governance_changes': governance_changes,
        'legal_dirty': legal_dirty,
        'legal_changes': legal_changes,
    }
    intake_dir = intake_dir_for_id(company, intake_id)
    output_path = intake_dir / 'github_snapshot.json'
    output_path.write_text(json.dumps(snapshot, indent=2), encoding='utf-8')
    run_id = insert_ai_run(db, intake_id, 'GitHub / local git', 'completed', output_text=json.dumps(snapshot, indent=2), output_path=str(output_path))
    append_workflow_event(db, intake_id, 'GitHub snapshot', 'system', f'GitHub/local snapshot saved to {output_path.name}')
    db.commit()
    return jsonify({'ok': True, 'run_id': run_id, 'snapshot': snapshot, 'output_path': str(output_path)})

@app.route('/api/intake/<int:intake_id>/exchange', methods=['POST'])
def api_intake_exchange(intake_id):
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake:
        abort(404)
    if not intake_stage_allows_ai_exchange(intake['stage']):
        return jsonify({'ok': False, 'reason': f"AI exchange is locked once an intake reaches {intake['stage']}."}), 409

    body = request.get_json() or {}
    source_engine = body.get('source_engine')
    target_engine = body.get('target_engine')
    topic = body.get('topic') or f"Review intake {intake_id} analysis"
    allowed_pairs = {
        ('Claude Code', 'OpenAI Codex'),
        ('OpenAI Codex', 'Claude Code'),
    }
    if (source_engine, target_engine) not in allowed_pairs:
        abort(400, 'invalid exchange pair')

    source_run = latest_completed_run(db, intake_id, source_engine)
    if not source_run or not source_run['output_text']:
        return jsonify({'ok': False, 'reason': f'No completed {source_engine} run is available for this intake.'}), 409

    if target_engine == 'Claude Code' and not command_exists(CLAUDE_EXE or 'claude'):
        return jsonify({'ok': False, 'reason': 'Claude CLI is not available on this machine.'}), 409
    if target_engine == 'OpenAI Codex' and not openai_configured():
        return jsonify({'ok': False, 'reason': 'OPENAI_API_KEY not configured.'}), 409

    created = datetime.datetime.now().isoformat()
    cur = db.cursor()
    cur.execute(
        """INSERT INTO ai_exchange(
                intake_id, topic, source_engine, target_engine, status, created_at, updated_at,
                source_run_id, source_prompt, source_output, source_output_path, agreement_status, next_action
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            intake_id, topic, source_engine, target_engine, 'running', created, created,
            source_run['id'], source_run['prompt_text'], source_run['output_text'],
            source_run['output_path'], 'Needs review', 'Hold'
        )
    )
    exchange_id = cur.lastrowid
    prompt = build_exchange_prompt(intake['company'], intake, source_engine, target_engine, topic, source_run['output_text'])
    target_slug = normalize_engine_slug(target_engine)
    output_path = intake_dir_for_id(intake['company'], intake_id) / f'exchange_{exchange_id:05d}_{target_slug}.md'
    db.execute("UPDATE ai_exchange SET target_prompt=? WHERE id=?", (prompt, exchange_id))
    append_workflow_event(db, intake_id, 'AI Exchange Started', 'system', f'{source_engine} -> {target_engine} on topic: {topic}')
    db.commit()

    try:
        if target_engine == 'Claude Code':
            cmd = [CLAUDE_EXE or 'claude', '-p', prompt, '--add-dir', str(intake_dir_for_id(intake['company'], intake_id)), '--add-dir', str(get_company(intake['company'])['root'] / '_GOVERNANCE'), '--allowedTools', 'Read']
            result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180, cwd=str(intake_dir_for_id(intake['company'], intake_id)))
            if result.returncode != 0:
                error = (result.stderr or result.stdout or 'Claude exchange failed').strip()
                db.execute("UPDATE ai_exchange SET status=?, updated_at=?, error_text=? WHERE id=?", ('failed', datetime.datetime.now().isoformat(), error[:4000], exchange_id))
                append_workflow_event(db, intake_id, 'AI Exchange Failed', 'system', error[:400])
                db.commit()
                return jsonify({'ok': False, 'reason': error}), 500
            target_output = result.stdout.strip()
        else:
            payload = {'model': get_openai_model(), 'input': prompt}
            headers = {
                'Authorization': f"Bearer {get_openai_api_key()}",
                'Content-Type': 'application/json',
            }
            response = requests.post('https://api.openai.com/v1/responses', headers=headers, json=payload, timeout=180)
            if response.status_code >= 400:
                error = response.text[:4000]
                db.execute("UPDATE ai_exchange SET status=?, updated_at=?, error_text=? WHERE id=?", ('failed', datetime.datetime.now().isoformat(), error, exchange_id))
                append_workflow_event(db, intake_id, 'AI Exchange Failed', 'system', error[:400])
                db.commit()
                return jsonify({'ok': False, 'reason': error}), 500
            data = response.json()
            target_output = data.get('output_text', '')
            if not target_output and 'output' in data:
                parts = []
                for item in data.get('output', []):
                    for content in item.get('content', []):
                        if content.get('type') == 'output_text':
                            parts.append(content.get('text', ''))
                target_output = '\n'.join(parts).strip()

        output_path.write_text(target_output, encoding='utf-8')
        db.execute(
            """UPDATE ai_exchange
               SET status=?, updated_at=?, target_output=?, target_output_path=?
               WHERE id=?""",
            ('completed', datetime.datetime.now().isoformat(), target_output, str(output_path), exchange_id)
        )
        append_workflow_event(db, intake_id, 'AI Exchange Completed', 'system', f'{target_engine} response saved to {output_path.name}')
        db.commit()
        return jsonify({'ok': True, 'exchange_id': exchange_id, 'output_path': str(output_path)})
    except subprocess.TimeoutExpired:
        error = 'Claude exchange timed out'
        db.execute("UPDATE ai_exchange SET status=?, updated_at=?, error_text=? WHERE id=?", ('failed', datetime.datetime.now().isoformat(), error, exchange_id))
        append_workflow_event(db, intake_id, 'AI Exchange Failed', 'system', error)
        db.commit()
        return jsonify({'ok': False, 'reason': error}), 504
    except Exception as e:
        error = str(e)
        db.execute("UPDATE ai_exchange SET status=?, updated_at=?, error_text=? WHERE id=?", ('failed', datetime.datetime.now().isoformat(), error[:4000], exchange_id))
        append_workflow_event(db, intake_id, 'AI Exchange Failed', 'system', error[:400])
        db.commit()
        return jsonify({'ok': False, 'reason': error}), 500

@app.route('/api/exchange/<int:exchange_id>', methods=['POST'])
def api_exchange_update(exchange_id):
    body = request.get_json() or {}
    agreement_status = body.get('agreement_status')
    next_action = body.get('next_action')
    valid_agreements = {'Needs review', 'Agrees', 'Partially agrees', 'Disagrees', 'Human review required'}
    valid_actions = {'Hold', 'Convert to Finding', 'Convert to Q', 'Draft Decision', 'Return to Intake Review'}
    if agreement_status not in valid_agreements:
        abort(400, 'invalid agreement status')
    if next_action not in valid_actions:
        abort(400, 'invalid next action')
    db = get_db()
    row = db.execute("SELECT * FROM ai_exchange WHERE id=?", (exchange_id,)).fetchone()
    if not row:
        abort(404)
    db.execute(
        "UPDATE ai_exchange SET agreement_status=?, next_action=?, updated_at=? WHERE id=?",
        (agreement_status, next_action, datetime.datetime.now().isoformat(), exchange_id)
    )
    append_workflow_event(db, row['intake_id'], 'AI Exchange Reviewed', 'user', f'Exchange #{exchange_id}: {agreement_status} / {next_action}')
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/intake/<int:intake_id>/promote_claude_findings', methods=['POST'])
def api_promote_claude_findings(intake_id):
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake:
        abort(404)
    latest = latest_completed_run(db, intake_id, 'Claude Code')
    if not latest or not latest['output_text']:
        return jsonify({'ok': False, 'reason': 'No completed Claude run found for this intake'}), 409

    company = intake['company']
    draft_dir = governance_drafts_dir(company)
    draft_path = draft_dir / f'FINDINGS_DRAFT_FROM_INTAKE_{intake_id:05d}.md'
    body = f"""# Findings Draft From Intake {intake_id:05d}

Status: DRAFT
Source Intake: #{intake_id}
Source Engine: Claude Code
Generated: {datetime.datetime.now().isoformat()}
Applies To: {COMPANIES[company]['name_full']} only

This draft is generated from Claude intake analysis. It is not approved governance truth and must pass the normal findings review gate.

---

{latest['output_text']}
"""
    draft_path.write_text(body, encoding='utf-8')
    run_id = insert_ai_run(db, intake_id, 'Draft Propagation', 'completed', output_text=body, output_path=str(draft_path))
    db.execute("INSERT INTO link(intake_id, kind, ref) VALUES(?,?,?)", (intake_id, 'draft', str(draft_path)))
    append_workflow_event(db, intake_id, 'Findings draft created', 'system', f'Claude output promoted to {draft_path.name}')
    if intake['stage'] in ('Uploaded', 'Stored', 'Parsed', 'AI Reviewed'):
        db.execute("UPDATE intake SET stage=?, blocker=NULL WHERE id=?", ('Findings Pending', intake_id))
        db.execute(
            "UPDATE gate SET status=?, note=?, approver=?, decided_at=? WHERE intake_id=? AND gate_name=?",
            ('Pending', 'Awaiting findings review from promoted Claude output.', 'system', datetime.datetime.now().isoformat(), intake_id, 'Findings Approved')
        )
        append_workflow_event(db, intake_id, 'Findings Pending', 'system', 'Intake moved into findings review after Claude draft promotion')
    db.commit()
    return jsonify({'ok': True, 'run_id': run_id, 'output_path': str(draft_path)})

@app.route('/api/intake/<int:intake_id>/promote_openai_questions', methods=['POST'])
def api_promote_openai_questions(intake_id):
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake:
        abort(404)
    latest = latest_completed_run(db, intake_id, 'OpenAI Codex')
    if not latest or not latest['output_text']:
        return jsonify({'ok': False, 'reason': 'No completed OpenAI run found for this intake'}), 409

    company = intake['company']
    draft_dir = governance_drafts_dir(company)
    draft_path = draft_dir / f'QUESTION_DRAFT_FROM_INTAKE_{intake_id:05d}.md'
    body = f"""# Question Draft From Intake {intake_id:05d}

Status: DRAFT
Source Intake: #{intake_id}
Source Engine: OpenAI Codex
Generated: {datetime.datetime.now().isoformat()}
Applies To: {COMPANIES[company]['name_full']} only

This draft is generated from OpenAI/Codex output. It is not an approved queue update and must be reviewed before anything is copied into a live question file.

---

{latest['output_text']}
"""
    draft_path.write_text(body, encoding='utf-8')
    run_id = insert_ai_run(db, intake_id, 'Draft Propagation', 'completed', output_text=body, output_path=str(draft_path))
    db.execute("INSERT INTO link(intake_id, kind, ref) VALUES(?,?,?)", (intake_id, 'draft', str(draft_path)))
    append_workflow_event(db, intake_id, 'Question draft created', 'system', f'OpenAI output promoted to {draft_path.name}')
    if intake['employee']:
        next_stage = 'Employee Questions Pending'
        blocker = 'Employee answers required before this intake can move forward.'
        gate_name = 'Employee Answered'
    else:
        next_stage = 'Ryan Questions Pending'
        blocker = 'Ryan answers required before this intake can move forward.'
        gate_name = 'Ryan Answered'
    if intake['stage'] in ('Uploaded', 'Stored', 'Parsed', 'AI Reviewed', 'Findings Pending'):
        db.execute("UPDATE intake SET stage=?, blocker=? WHERE id=?", (next_stage, blocker, intake_id))
        db.execute(
            "UPDATE gate SET status=?, note=?, approver=?, decided_at=? WHERE intake_id=? AND gate_name=?",
            ('Pending', 'Awaiting answers for promoted OpenAI question draft.', 'system', datetime.datetime.now().isoformat(), intake_id, gate_name)
        )
        append_workflow_event(db, intake_id, next_stage, 'system', 'Intake moved into question-answer lane after OpenAI draft promotion')
    db.commit()
    return jsonify({'ok': True, 'run_id': run_id, 'output_path': str(draft_path)})

@app.route('/api/intake/<int:intake_id>/commit_review', methods=['POST'])
def api_commit_review(intake_id):
    db = get_db()
    intake = db.execute("SELECT * FROM intake WHERE id=?", (intake_id,)).fetchone()
    if not intake:
        abort(404)
    if not intake_stage_allows_commit_review(intake['stage']):
        return jsonify({
            'ok': False,
            'reason': 'Commit review only opens after the intake reaches Awaiting Commit Approval.',
            'current_stage': intake['stage'],
        }), 409

    company = intake['company']
    cfg = get_company(company)
    draft_dir = governance_drafts_dir(company)
    draft_path = draft_dir / f'COMMIT_REVIEW_FROM_INTAKE_{intake_id:05d}.md'

    sections = []
    for label, path in [('governance', cfg['root']), ('legal_vault', cfg['vault'])]:
        if not (path / '.git').exists():
            sections.append(f"## {label}\n\nNot a git repository.\n")
            continue
        status = subprocess.run([GIT_EXE, '-C', str(path), 'status', '--short'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=15)
        stat = subprocess.run([GIT_EXE, '-C', str(path), 'diff', '--stat'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=15)
        diff = subprocess.run([GIT_EXE, '-C', str(path), 'diff', '--', '_GOVERNANCE'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=15) if label == 'governance' else subprocess.run([GIT_EXE, '-C', str(path), 'diff'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=15)
        sections.append(
            f"## {label}\n\n"
            f"Path: `{path}`\n\n"
            f"### Status\n\n```\n{status.stdout.strip() or 'clean'}\n```\n\n"
            f"### Diff Stat\n\n```\n{stat.stdout.strip() or 'no diff stat'}\n```\n\n"
            f"### Diff Preview\n\n```\n{(diff.stdout or '').strip()[:12000] or 'no diff preview'}\n```\n"
        )

    body = f"""# Commit Review From Intake {intake_id:05d}

Status: REVIEW PACKAGE
Source Intake: #{intake_id}
Generated: {datetime.datetime.now().isoformat()}
Applies To: {COMPANIES[company]['name_full']} only

This package exists for commit review only. It does not commit or push anything by itself.

---

{chr(10).join(sections)}
"""
    draft_path.write_text(body, encoding='utf-8')
    run_id = insert_ai_run(db, intake_id, 'GitHub Commit Review', 'completed', output_text=body, output_path=str(draft_path))
    db.execute("INSERT INTO link(intake_id, kind, ref) VALUES(?,?,?)", (intake_id, 'commit_review', str(draft_path)))
    append_workflow_event(db, intake_id, 'Commit review package', 'system', f'Commit review draft created at {draft_path.name}')
    db.commit()
    return jsonify({'ok': True, 'run_id': run_id, 'output_path': str(draft_path)})


# ----- Repo Classification API -----
@app.route('/api/classification')
def api_classification_get():
    company = request.args.get('company')
    cfg = get_company(company)
    db = get_db()
    rows = {r['repo_name']: dict(r) for r in db.execute("SELECT * FROM repo_classification WHERE company=?", (company,))}

    # Merge with mirror filesystem (so we always show every repo)
    out = []
    if cfg['mirror'].exists():
        for repo in sorted(cfg['mirror'].iterdir()):
            if not (repo.is_dir() and (repo / '.git').exists()): continue
            existing = rows.get(repo.name)
            if existing:
                out.append(existing)
            else:
                out.append({
                    'company': company, 'repo_name': repo.name,
                    'observed_purpose': '', 'proposed_category': 'Unknown',
                    'confidence': '', 'canonical_status': '',
                    'evidence': '', 'finding_link': '', 'question_link': '',
                    'approval_status': 'PENDING', 'updated_at': '',
                })
    return jsonify(out)

@app.route('/api/classification', methods=['POST'])
def api_classification_set():
    body = request.get_json() or {}
    company = body.get('company')
    repo = body.get('repo_name')
    if not company or not repo: abort(400, 'company and repo_name required')
    fields = ('observed_purpose', 'proposed_category', 'confidence', 'canonical_status',
              'evidence', 'finding_link', 'question_link', 'approval_status')
    db = get_db()
    existing = db.execute("SELECT id FROM repo_classification WHERE company=? AND repo_name=?", (company, repo)).fetchone()
    now = datetime.datetime.now().isoformat()
    if existing:
        cols = ', '.join(f'{f}=?' for f in fields)
        params = [body.get(f, '') for f in fields] + [now, existing['id']]
        db.execute(f"UPDATE repo_classification SET {cols}, updated_at=? WHERE id=?", params)
    else:
        cols = ['company', 'repo_name', 'updated_at'] + list(fields)
        ph = ','.join('?' * len(cols))
        vals = [company, repo, now] + [body.get(f, '') for f in fields]
        db.execute(f"INSERT INTO repo_classification({','.join(cols)}) VALUES({ph})", vals)
    db.commit()
    return jsonify({'ok': True})


# ----- Existing Q / F / Decision / Glossary -----
@app.route('/api/questions')
def api_questions():
    company = request.args.get('company')
    return jsonify(build_questions_payload(company))

@app.route('/api/repo_questions')
def api_repo_questions():
    company = request.args.get('company')
    if not company:
        abort(400, 'company required')
    repo_name = request.args.get('repo_name')
    return jsonify(build_repo_questions_payload(company, repo_name=repo_name))

@app.route('/api/repo_questions/detail')
def api_repo_question_detail():
    company = request.args.get('company')
    question_code = request.args.get('question_code')
    if not company or not question_code:
        abort(400, 'company and question_code required')
    db = get_db()
    row = db.execute(
        "SELECT * FROM repo_questions WHERE company=? AND question_code=?",
        (company, question_code),
    ).fetchone()
    if not row:
        abort(404)
    return jsonify({'ok': True, 'question': dict(row)})

@app.route('/api/repo_questions/generate', methods=['POST'])
def api_repo_questions_generate():
    body = request.get_json() or {}
    company = body.get('company')
    repo_name = body.get('repo_name')
    actor = body.get('actor', 'generator')
    if not company or not repo_name:
        abort(400, 'company and repo_name required')
    result = generate_repo_questions(company, repo_name, actor=actor)
    return jsonify({'ok': True, **result})

@app.route('/api/repo_questions/generate_all', methods=['POST'])
def api_repo_questions_generate_all():
    body = request.get_json() or {}
    company = body.get('company')
    actor = body.get('actor', 'generator')
    if not company:
        abort(400, 'company required')
    results = generate_all_repo_questions(company, actor=actor)
    totals = {
        'repos': len(results),
        'created': sum(item['created'] for item in results),
        'skipped': sum(item['skipped'] for item in results),
        'errors': sum(len(item['errors']) for item in results),
    }
    return jsonify({'ok': True, 'totals': totals, 'results': results})

@app.route('/api/repo_questions/update', methods=['POST'])
def api_repo_questions_update():
    body = request.get_json() or {}
    company = body.get('company')
    question_code = body.get('question_code')
    if not company or not question_code:
        abort(400, 'company and question_code required')
    fields = {
        'status': (body.get('status') or 'OPEN').strip().upper(),
        'primary_assignee': (body.get('primary_assignee') or '').strip(),
        'answer_markdown': body.get('answer_markdown', ''),
        'review_note': body.get('review_note', ''),
        'reviewed_by': (body.get('reviewed_by') or '').strip(),
    }
    db = get_db()
    existing = db.execute(
        "SELECT id FROM repo_questions WHERE company=? AND question_code=?",
        (company, question_code),
    ).fetchone()
    if not existing:
        abort(404)
    now = datetime.datetime.now().isoformat()
    db.execute(
        """UPDATE repo_questions
           SET status=?, primary_assignee=?, answer_markdown=?, review_note=?, reviewed_by=?, updated_at=?
           WHERE id=?""",
        (
            fields['status'],
            fields['primary_assignee'],
            fields['answer_markdown'],
            fields['review_note'],
            fields['reviewed_by'],
            now,
            existing['id'],
        ),
    )
    db.commit()
    return jsonify({'ok': True, 'updated_at': now})

@app.route('/api/member_question_chat', methods=['POST'])
def api_member_question_chat():
    body = request.get_json() or {}
    company = body.get('company')
    member_key = body.get('member_key')
    engine = body.get('engine')
    user_prompt = (body.get('prompt') or '').strip()
    session_notes = (body.get('session_notes') or '').strip()
    if not company or not member_key or not engine or not user_prompt:
        abort(400, 'company, member_key, engine, and prompt are required')

    packet = build_member_question_packet(company, member_key)
    prompt = build_member_question_chat_prompt(company, packet, user_prompt, session_notes=session_notes)

    if engine == 'Claude Code':
        if not command_exists(CLAUDE_EXE or 'claude'):
            return jsonify({'ok': False, 'reason': 'Claude CLI is not available on this machine.'}), 409
        try:
            result = subprocess.run(
                [CLAUDE_EXE or 'claude', '-p', '--allowedTools', 'Read'],
                capture_output=True,
                text=True, encoding='utf-8', errors='replace',
                input=prompt,
                timeout=180,
                cwd=str(BASE_DIR),
            )
            if result.returncode != 0:
                return jsonify({'ok': False, 'reason': (result.stderr or result.stdout or 'Claude request failed').strip()}), 500
            return jsonify({
                'ok': True,
                'engine': engine,
                'response_text': result.stdout.strip(),
                'question_count': packet['total_count'],
            })
        except subprocess.TimeoutExpired:
            return jsonify({'ok': False, 'reason': 'Claude request timed out'}), 504

    if engine == 'OpenAI Codex':
        if not openai_configured():
            return jsonify({'ok': False, 'reason': 'OPENAI_API_KEY not configured.'}), 409
        payload = {
            'model': get_openai_model(),
            'input': prompt,
        }
        headers = {
            'Authorization': f"Bearer {get_openai_api_key()}",
            'Content-Type': 'application/json',
        }
        response = requests.post('https://api.openai.com/v1/responses', headers=headers, json=payload, timeout=180)
        if response.status_code >= 400:
            return jsonify({'ok': False, 'reason': response.text[:4000]}), 500
        data = response.json()
        output_text = data.get('output_text', '')
        if not output_text and 'output' in data:
            output_chunks = []
            for item in data.get('output', []):
                for content_item in item.get('content', []):
                    if content_item.get('type') == 'output_text':
                        output_chunks.append(content_item.get('text', ''))
            output_text = '\n'.join(chunk for chunk in output_chunks if chunk)
        return jsonify({
            'ok': True,
            'engine': engine,
            'response_text': output_text.strip(),
            'question_count': packet['total_count'],
        })

    abort(400, 'Unsupported engine')

@app.route('/api/customers')
def api_customers():
    company = request.args.get('company')
    return jsonify(customer_sources_for_company(company))

@app.route('/api/departments')
def api_departments():
    company = request.args.get('company')
    db = get_db()
    return jsonify({
        'company': company,
        **departments_for_company(company, db),
    })

@app.route('/api/aspect_groups')
def api_aspect_groups():
    company = request.args.get('company')
    groups = aspect_groups_for_company(company)
    try:
        db = get_db()
        ensure_aspect_group_reviews_table(db)
        review_map = {
            row['group_name']: dict(row)
            for row in db.execute(
                "SELECT group_name, decision, reviewer, note, reviewed_at FROM aspect_group_reviews WHERE company=?",
                (company,),
            ).fetchall()
        }
    except Exception:
        review_map = {}
    for group in groups:
        rv = review_map.get(group['name'])
        group['review'] = ({
            'decision': rv['decision'],
            'reviewer': rv['reviewer'],
            'note': rv['note'],
            'reviewed_at': rv['reviewed_at'],
        } if rv else None)
    return jsonify({
        'company': company,
        'groups': groups,
    })


def ensure_aspect_group_reviews_table(db):
    db.execute("""
        CREATE TABLE IF NOT EXISTS aspect_group_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            group_name TEXT NOT NULL,
            decision TEXT NOT NULL DEFAULT 'CONFIRMED',
            reviewer TEXT NOT NULL,
            note TEXT,
            reviewed_at TEXT NOT NULL,
            UNIQUE(company, group_name)
        )
    """)
    db.commit()


@app.route('/api/aspect_groups/review', methods=['POST'])
def api_aspect_groups_review():
    data = request.get_json(force=True) or {}
    company = (data.get('company') or '').strip()
    group_name = (data.get('group_name') or '').strip()
    decision = (data.get('decision') or 'CONFIRMED').strip().upper()
    reviewer = (data.get('reviewer') or '').strip()
    note = (data.get('note') or '').strip()
    if not company or not group_name:
        return jsonify({'ok': False, 'error': 'company and group_name are required'}), 400
    if not reviewer:
        return jsonify({'ok': False, 'error': 'Reviewer name is required'}), 400
    if decision not in {'CONFIRMED', 'NEEDS_WORK', 'PENDING'}:
        decision = 'CONFIRMED'
    db = get_db()
    ensure_aspect_group_reviews_table(db)
    now = datetime.datetime.now().isoformat(timespec='minutes')
    db.execute(
        """INSERT INTO aspect_group_reviews (company, group_name, decision, reviewer, note, reviewed_at)
           VALUES (?,?,?,?,?,?)
           ON CONFLICT(company, group_name) DO UPDATE SET
             decision=excluded.decision,
             reviewer=excluded.reviewer,
             note=excluded.note,
             reviewed_at=excluded.reviewed_at""",
        (company, group_name, decision, reviewer, note, now),
    )
    db.commit()
    return jsonify({'ok': True, 'review': {
        'decision': decision, 'reviewer': reviewer, 'note': note, 'reviewed_at': now,
    }})


@app.route('/api/team_member_department_tags')
def api_team_member_department_tags():
    company = request.args.get('company')
    db = get_db()
    rows = [dict(row) for row in db.execute(
        """SELECT company, member_key, department_key, source, note, created_at, updated_at
           FROM team_member_department_tags
           WHERE company=?
           ORDER BY member_key, department_key""",
        (company,)
    ).fetchall()]
    return jsonify({
        'company': company,
        'rows': rows,
    })

@app.route('/api/team_member_department_tags', methods=['POST'])
def api_team_member_department_tags_set():
    body = request.get_json() or {}
    company = body.get('company')
    member_key = body.get('member_key')
    departments = body.get('departments') or []
    note = (body.get('note') or '').strip()
    if not company or not member_key:
        abort(400, 'company and member_key required')
    db = get_db()
    clean_departments = []
    for item in departments:
        value = normalize_department_key(company, item, db=db)
        if value and value not in clean_departments:
            clean_departments.append(value)
    now = datetime.datetime.now().isoformat()
    db.execute("DELETE FROM team_member_department_tags WHERE company=? AND member_key=? AND source='manual'", (company, member_key))
    for department_key in clean_departments:
        db.execute(
            """INSERT INTO team_member_department_tags(company, member_key, department_key, source, note, created_at, updated_at)
               VALUES(?,?,?,?,?,?,?)""",
            (company, member_key, department_key, 'manual', note, now, now)
        )
    db.commit()
    return jsonify({
        'ok': True,
        'company': company,
        'member_key': member_key,
        'departments': clean_departments,
        'updated_at': now,
    })

@app.route('/api/team_member_files')
def api_team_member_files():
    company = request.args.get('company')
    member_key = request.args.get('member')
    if not company or not member_key:
        abort(400, 'company and member required')
    db = get_db()
    rows = list_team_member_files(db, company, member_key)
    return jsonify({
        'company': company,
        'member_key': member_key,
        'rows': rows,
        'count': len(rows),
    })

@app.route('/api/team_member_files', methods=['POST'])
def api_team_member_files_create():
    company = request.form.get('company')
    member_key = request.form.get('member_key')
    source_type = (request.form.get('source_type') or 'document').strip() or 'document'
    ai_preference = (request.form.get('ai_engines') or 'Claude').strip() or 'Claude'
    note = (request.form.get('note') or '').strip()
    file_purpose = normalize_team_member_file_purpose(request.form.get('file_purpose') or 'other')
    files = request.files.getlist('files')
    if not company or not member_key:
        abort(400, 'company and member_key required')
    if not files:
        abort(400, 'no files attached')
    now = datetime.datetime.now().isoformat()
    db = get_db()
    cur = db.cursor()
    created = []
    for handle in files:
        if not handle or not handle.filename:
            continue
        safe_name = handle.filename.replace('/', '_').replace('\\', '_')
        output_path = team_member_file_storage_path(company, member_key, safe_name, file_purpose=file_purpose)
        handle.save(output_path)
        cur.execute(
            """INSERT INTO team_member_files(
                   company, member_key, original_filename, saved_path, source_type, note,
                   ai_preference, size_bytes, uploaded_at, uploaded_by, file_purpose,
                   linked_question_packet_id, parsed_answer_count, generated_question_count
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                company,
                member_key,
                safe_name,
                str(output_path),
                source_type,
                note,
                ai_preference,
                file_size_safe(output_path),
                now,
                'user',
                file_purpose,
                None,
                0,
                0,
            ),
        )
        created.append({
            'id': cur.lastrowid,
            'original_filename': safe_name,
            'saved_path': str(output_path),
            'size_bytes': file_size_safe(output_path),
            'file_purpose': file_purpose,
        })
        append_team_member_correspondence_event(
            db,
            company,
            member_key,
            'file_uploaded',
            f"Uploaded {safe_name} as {file_purpose}.",
            actor='Ryan',
            linked_file_id=cur.lastrowid,
        )
    db.commit()
    return jsonify({
        'ok': True,
        'company': company,
        'member_key': member_key,
        'rows': created,
        'count': len(created),
    })

@app.route('/api/team_member_files/<int:file_id>/analyze', methods=['POST'])
def api_team_member_file_analyze(file_id):
    body = request.get_json() or {}
    company = body.get('company')
    engine = body.get('engine') or 'OpenAI'
    if not company:
        abort(400, 'company required')
    db = get_db()
    file_row = db.execute(
        "SELECT * FROM team_member_files WHERE id=? AND company=?",
        (file_id, company),
    ).fetchone()
    if not file_row:
        abort(404)
    analysis = analyze_team_member_file(db, company, file_row['member_key'], dict(file_row), engine_preference=engine)
    db.commit()
    return jsonify({
        'ok': True,
        'file_id': file_id,
        'analysis': analysis,
    })

@app.route('/api/<company>/team-members/<member_key>/files/upload-with-purpose', methods=['POST'])
def api_team_member_files_upload_with_purpose(company, member_key):
    body_company = request.form.get('company') or company
    if body_company != company:
        abort(400, 'company mismatch')
    file_purpose = normalize_team_member_file_purpose(request.form.get('file_purpose') or '')
    if not request.form.get('file_purpose'):
        abort(400, 'file_purpose required')
    return api_team_member_files_create()

@app.route('/api/<company>/team-members/<member_key>/questions')
def api_team_member_questions(company, member_key):
    statuses = [item.strip() for item in (request.args.get('status') or '').split(',') if item.strip()]
    db = get_db()
    rows = list_team_member_questions(db, company, member_key, statuses=statuses or None)
    counts = summarize_team_member_question_statuses(rows)
    return jsonify({
        'company': company,
        'member_key': member_key,
        'rows': rows,
        'counts': counts,
        'count': len(rows),
    })

@app.route('/api/<company>/team-members/<member_key>/correspondence-log')
def api_team_member_correspondence_log(company, member_key):
    db = get_db()
    rows = list_team_member_correspondence(db, company, member_key)
    return jsonify({
        'company': company,
        'member_key': member_key,
        'rows': rows,
        'count': len(rows),
    })

@app.route('/api/<company>/team-members/<member_key>/generate-questions', methods=['POST'])
def api_team_member_generate_questions(company, member_key):
    body = request.get_json() or {}
    file_id = body.get('file_id')
    engine = body.get('engine') or 'OpenAI'
    cap = max(8, min(12, int(body.get('cap') or 10)))
    if not file_id:
        abort(400, 'file_id required')
    db = get_db()
    file_row = db.execute(
        "SELECT * FROM team_member_files WHERE id=? AND company=? AND member_key=?",
        (file_id, company, member_key),
    ).fetchone()
    if not file_row:
        abort(404)
    if normalize_team_member_file_purpose(file_row['file_purpose']) not in ('initial_doc', 'supporting_evidence'):
        abort(400, 'file must be initial_doc or supporting_evidence')
    created = generate_team_member_questions_from_file(db, company, member_key, dict(file_row), engine=engine, actor='Ryan', cap=cap)
    db.commit()
    return jsonify({'ok': True, 'created': created, 'count': len(created), 'cap': cap})

@app.route('/api/<company>/team-members/<member_key>/export-packet', methods=['POST'])
def api_team_member_export_packet(company, member_key):
    db = get_db()
    exported = export_team_member_question_packet(db, company, member_key, actor='Ryan')
    if not exported:
        return jsonify({'ok': False, 'reason': 'No NEW or NEEDS_FOLLOW_UP questions available.'}), 400
    db.commit()
    return jsonify({'ok': True, **exported})

@app.route('/api/<company>/team-members/<member_key>/parse-answers', methods=['POST'])
def api_team_member_parse_answers(company, member_key):
    body = request.get_json() or {}
    file_id = body.get('file_id')
    engine = body.get('engine') or 'OpenAI'
    if not file_id:
        abort(400, 'file_id required')
    db = get_db()
    file_row = db.execute(
        "SELECT * FROM team_member_files WHERE id=? AND company=? AND member_key=?",
        (file_id, company, member_key),
    ).fetchone()
    if not file_row:
        abort(404)
    if normalize_team_member_file_purpose(file_row['file_purpose']) != 'answer_packet':
        abort(400, 'file must be answer_packet')
    parsed = parse_team_member_answers_file(db, company, member_key, dict(file_row), actor=engine)
    db.commit()
    return jsonify({'ok': True, **parsed})

@app.route('/api/<company>/team-members/<member_key>/suggest-follow-ups', methods=['POST'])
def api_team_member_suggest_follow_ups(company, member_key):
    body = request.get_json() or {}
    actor = body.get('engine') or 'OpenAI'
    db = get_db()
    created = suggest_team_member_follow_ups(db, company, member_key, actor=actor)
    db.commit()
    return jsonify({'ok': True, 'created': created, 'count': len(created)})

@app.route('/api/<company>/team-members/<member_key>/questions/<question_code>/accept', methods=['POST'])
def api_team_member_accept_question(company, member_key, question_code):
    db = get_db()
    accepted = accept_team_member_questions(db, company, member_key, [question_code], actor='Ryan')
    if not accepted:
        return jsonify({'ok': False, 'reason': 'Question not found.'}), 404
    db.commit()
    return jsonify({'ok': True, 'accepted': accepted, 'count': len(accepted)})

def record_team_member_inline_answer(db, company, member_key, question_code, answer_markdown, accept=False, actor='Ryan'):
    row = db.execute(
        "SELECT * FROM team_member_questions WHERE company=? AND team_member_key=? AND question_code=?",
        (company, member_key, question_code),
    ).fetchone()
    if not row:
        return None
    now = datetime.datetime.now().isoformat()
    db.execute(
        """INSERT INTO team_member_question_answers(
               question_id, answer_markdown, source_file_id, source_section,
               match_confidence, parsed_by, accepted_by_ryan, created_at
           ) VALUES(?,?,?,?,?,?,?,?)""",
        (row['id'], answer_markdown, 0, 'inline', 'HIGH', 'inline', 0, now),
    )
    db.execute(
        "UPDATE team_member_questions SET status='ANSWERED', updated_at=?, last_human_touch_at=? WHERE id=?",
        (now, now, row['id']),
    )
    append_team_member_correspondence_event(
        db, company, member_key, 'answer_saved',
        f"Inline answer saved for {question_code}.", actor=actor, linked_question_id=row['id'],
    )
    accepted = []
    if accept:
        accepted = accept_team_member_questions(db, company, member_key, [question_code], actor=actor)
    return {
        'question_code': question_code,
        'status': 'APPROVED' if accepted else 'ANSWERED',
        'accepted': bool(accepted),
    }

@app.route('/api/<company>/team-members/<member_key>/questions/<question_code>/answer', methods=['POST'])
def api_team_member_answer_question(company, member_key, question_code):
    body = request.get_json() or {}
    answer_text = (body.get('answer_markdown') or '').strip()
    do_accept = bool(body.get('accept'))
    if not answer_text:
        abort(400, 'answer_markdown required')
    db = get_db()
    result = record_team_member_inline_answer(
        db, company, member_key, question_code, answer_text, accept=do_accept, actor='Ryan',
    )
    if not result:
        return jsonify({'ok': False, 'reason': 'Question not found.'}), 404
    db.commit()
    return jsonify({'ok': True, **result})

@app.route('/api/<company>/team-members/<member_key>/questions/bulk-accept-high-confidence', methods=['POST'])
def api_team_member_bulk_accept_questions(company, member_key):
    body = request.get_json() or {}
    requested_codes = body.get('question_codes') or []
    db = get_db()
    rows = list_team_member_questions(db, company, member_key, statuses=['ANSWERED'])
    eligible_codes = [row['question_code'] for row in rows if (row.get('latest_answer_confidence') or '') == 'HIGH']
    if requested_codes:
        eligible_codes = [code for code in eligible_codes if code in requested_codes]
    accepted = accept_team_member_questions(db, company, member_key, eligible_codes, actor='Ryan')
    db.commit()
    return jsonify({'ok': True, 'accepted': accepted, 'count': len(accepted)})

# ------------- Meeting intelligence (summary + per-attendee priority questions) -------------
def build_meeting_ai_prompt(title, meeting_date, attendee_labels, notes_text, governance_text=''):
    roster = '\n'.join(f"- {n}" for n in attendee_labels) if attendee_labels else "- the attendees"
    gov_block = (
        "APPROVED GOVERNANCE CONTEXT (the company's source of truth - use it to keep questions "
        "concrete and to flag anything in the notes that conflicts with, or is not yet covered by, "
        "these rules):\n" + (governance_text or '') + "\n\n"
    ) if (governance_text or '').strip() else ''
    return (
        "You are a meeting assistant for the Mineral View governance workbench.\n"
        "Read the GOVERNANCE CONTEXT and the MEETING NOTES at the end and produce (1) a concise summary and "
        "(2) specific follow-up PRIORITY QUESTIONS, each assigned to exactly one attendee.\n\n"
        f"Meeting title: {title}\n"
        f"Date: {meeting_date}\n"
        "Attendees (you MUST copy one of these EXACT full names into each question's 'attendee' field):\n"
        f"{roster}\n\n"
        "Respond with STRICT JSON ONLY. No prose before or after, no markdown code fences. Shape:\n"
        "{\n"
        '  "summary": "6-10 sentence plain-English summary of what was discussed, decided, and what happens next",\n'
        '  "questions": [\n'
        '    {"attendee": "EXACT full attendee name from the list", "priority": "HIGH", "question": "a specific, actionable follow-up grounded in the notes"}\n'
        "  ]\n"
        "}\n\n"
        "Requirements:\n"
        "- Generate 2 to 3 questions FOR EACH attendee listed above (a 2-person meeting yields 4-6 questions total).\n"
        "- Every 'attendee' value MUST be copied verbatim (full name) from the attendee list above - never a first name only.\n"
        "- Base every question on actual decisions, action items, owners, deadlines, risks, or open issues in the notes. Do NOT invent facts.\n"
        "- 'priority' is exactly one of HIGH, MEDIUM, or LOW, based on urgency and impact.\n"
        "- Where relevant, ground questions in the GOVERNANCE CONTEXT and flag anything in the notes "
        "that conflicts with, or is not yet covered by, approved governance.\n"
        "- Output JSON only.\n\n"
        f"{gov_block}"
        f"MEETING NOTES:\n{(notes_text or '')[:8000]}"
    )

def _json_object_candidates(s):
    """Yield balanced {...} substrings from s, largest first."""
    cands = []
    for start in (i for i, c in enumerate(s) if c == '{'):
        depth = 0
        for j in range(start, len(s)):
            if s[j] == '{':
                depth += 1
            elif s[j] == '}':
                depth -= 1
                if depth == 0:
                    cands.append(s[start:j + 1])
                    break
    cands.sort(key=len, reverse=True)
    return cands

def parse_meeting_ai_json(text):
    if not text:
        return None
    cleaned = re.sub(r'```[a-zA-Z]*', '', text).replace('```', '').strip()
    for candidate in _json_object_candidates(cleaned):
        try:
            data = json.loads(candidate)
        except Exception:
            continue
        if isinstance(data, dict) and ('summary' in data or 'questions' in data):
            return data
    return None

def run_meeting_ai(prompt):
    if command_exists(CLAUDE_EXE or 'claude'):
        try:
            result = subprocess.run(
                [CLAUDE_EXE or 'claude', '-p', prompt, '--allowedTools', 'Read'],
                capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180,
            )
            if result.returncode == 0 and (result.stdout or '').strip():
                return result.stdout.strip(), 'Claude Code'
        except Exception:
            pass
    if openai_configured():
        try:
            resp = requests.post(
                'https://api.openai.com/v1/responses',
                headers={'Authorization': f"Bearer {get_openai_api_key()}", 'Content-Type': 'application/json'},
                json={'model': get_openai_model(), 'input': prompt},
                timeout=120,
            )
            if resp.status_code < 400:
                payload = resp.json()
                out = payload.get('output_text', '')
                if not out:
                    parts = []
                    for item in payload.get('output', []):
                        for content in item.get('content', []):
                            if content.get('type') == 'output_text':
                                parts.append(content.get('text', ''))
                    out = '\n'.join(parts).strip()
                return out, 'OpenAI'
        except Exception:
            pass
    return '', None

def heuristic_meeting_summary(title, attendee_labels, notes_text):
    raw = notes_text or ''
    flat = ' '.join(raw.split())
    summary = (flat[:600] + ('...' if len(flat) > 600 else '')) if flat else \
        f"Meeting '{title}' was captured, but no notes text was available to summarize."
    names = attendee_labels or ['Team']
    first_names = {n: n.split()[0].lower() for n in names}
    sentences = re.split(r'(?<=[.!?])\s+|\n+', raw)
    cue = re.compile(
        r'\b(will|need to|needs to|should|must|confirm|decide|assign|rotate|reissue|send|review|'
        r'approve|follow up|audit|map|document|add|fix|check|loop me in|owner|deadline|by friday|'
        r'before|todo|action|open question)\b', re.I)
    picks = [s.strip() for s in sentences if s and cue.search(s) and len(s.strip()) > 25][:12]
    questions = []
    rr = 0
    for s in picks:
        low = s.lower()
        assigned = next((n for n in names if first_names[n] in low or n.lower() in low), None)
        if not assigned:
            assigned = names[rr % len(names)]
            rr += 1
        # turn the statement into a follow-up question
        body = re.sub(r'^(ryan|nikhil)\s*:\s*', '', s.strip(), flags=re.I).rstrip('.')
        q = body if body.endswith('?') else f"Follow up on: {body}?"
        questions.append({'attendee': assigned, 'priority': 'MEDIUM', 'question': q[:240]})
    if not questions:
        questions = [
            {'attendee': n, 'priority': 'MEDIUM',
             'question': f"What are your next steps and any blockers following '{title}'?"}
            for n in names[:8]
        ]
    return {'summary': summary, 'questions': questions}

def generate_meeting_intelligence(db, company, meeting_id, title, meeting_date, now, notes_text):
    attendees = db.execute(
        "SELECT team_member_key, external_name FROM meeting_attendees WHERE meeting_id=?",
        (meeting_id,)
    ).fetchall()
    label_to_key = {}
    labels = []
    internal_keys = []
    for a in attendees:
        if a['team_member_key']:
            key = a['team_member_key']
            label = pretty_member_name(key)
            labels.append(label)
            internal_keys.append(key)
            aliases = {label.lower(), key.lower(),
                       label.split()[0].lower(), label.split()[-1].lower()}
            for alias in aliases:
                if alias:
                    label_to_key.setdefault(alias, key)
        elif a['external_name']:
            labels.append(a['external_name'])

    def resolve_key(att):
        a = (att or '').strip().lower()
        if not a:
            return None
        if a in label_to_key:
            return label_to_key[a]
        # fuzzy: any alias contained in the attendee string or vice-versa
        for alias, key in label_to_key.items():
            if alias and (alias in a or a in alias):
                return key
        return None

    try:
        gov_text = governance_context(company, max_chars=8000)
    except Exception:
        gov_text = ''
    prompt = build_meeting_ai_prompt(title, meeting_date, labels, notes_text, governance_text=gov_text)
    _gov = governance_context(company, max_chars=8000)
    if _gov:
        prompt = _gov + "\n\n" + prompt
    text, engine = run_meeting_ai(prompt)
    data = parse_meeting_ai_json(text) if text else None

    summary = ''
    questions = []
    if data:
        summary = (data.get('summary') or '').strip()
        questions = data.get('questions') or []
    # backfill from the content-aware heuristic if the AI gave no summary/questions
    if not summary or not questions:
        fb = heuristic_meeting_summary(title, labels, notes_text)
        if not summary:
            summary = fb['summary']
        if not questions:
            questions = fb['questions']
            engine = engine or 'heuristic'
    engine = engine or 'heuristic'

    norm_questions = []
    questions_created = 0
    rr = 0
    for q in questions:
        qtext = str((q or {}).get('question') or '').strip()
        if not qtext:
            continue
        priority = str((q or {}).get('priority') or 'MEDIUM').strip().upper()
        if priority not in ('HIGH', 'MEDIUM', 'LOW'):
            priority = 'MEDIUM'
        att = str((q or {}).get('attendee') or '').strip()
        member_key = resolve_key(att)
        # if the AI named someone not on the roster, route round-robin to a real internal attendee
        if not member_key and internal_keys:
            member_key = internal_keys[rr % len(internal_keys)]
            rr += 1
            if not att:
                att = pretty_member_name(member_key)
        norm_questions.append({
            'attendee': att or (pretty_member_name(member_key) if member_key else 'Team'),
            'member_key': member_key,
            'priority': priority,
            'question': qtext,
        })
        if member_key:
            body = f"From meeting **{title}** ({meeting_date}).\n\n{qtext}"
            try:
                create_team_member_question(
                    db, company, member_key, qtext[:160], body,
                    priority=priority, status='NEW', generated_by='Meeting AI',
                )
                questions_created += 1
            except Exception:
                pass

    status = 'generated' if summary else 'partial'
    db.execute(
        """UPDATE meetings
           SET summary_text=?, summary_status=?, summary_engine=?, priority_questions_json=?,
               summary_generated_at=?, updated_at=?
           WHERE id=?""",
        (summary, status, engine or '', json.dumps(norm_questions), now, now, meeting_id),
    )
    db.commit()
    return {
        'summary': summary,
        'summary_status': status,
        'engine': engine,
        'questions': norm_questions,
        'questions_created': questions_created,
    }


@app.route('/api/meetings')
def api_meetings():
    company = request.args.get('company')
    attendee = request.args.get('attendee') or None
    db = get_db()
    rows = list_meetings_for_company(db, company, attendee=attendee)
    return jsonify({
        'company': company,
        'rows': rows,
        'count': len(rows),
        'roadmap_note': 'Microsoft Teams direct integration is on the roadmap. For now, upload meeting notes manually; the file and attendees route to each attendee workspace automatically.',
    })

@app.route('/api/meetings', methods=['POST'])
def api_meetings_create():
    company = request.form.get('company')
    title = (request.form.get('title') or '').strip()
    meeting_type = (request.form.get('meeting_type') or 'other').strip() or 'other'
    meeting_date = (request.form.get('meeting_date') or datetime.date.today().isoformat()).strip()
    organizer = (request.form.get('organizer') or '').strip()
    note = (request.form.get('note') or '').strip()
    attendees_raw = request.form.get('attendees_json') or '[]'
    action_items_raw = request.form.get('action_items_json') or '[]'
    if not company or not title:
        abort(400, 'company and title required')
    try:
        attendees = json.loads(attendees_raw)
    except json.JSONDecodeError:
        abort(400, 'attendees_json invalid')
    try:
        action_items = json.loads(action_items_raw)
    except json.JSONDecodeError:
        abort(400, 'action_items_json invalid')
    notes_file = request.files.get('notes_file')
    notes_file_path = ''
    if notes_file and notes_file.filename:
        notes_file_path = save_meeting_notes_file(company, notes_file, meeting_date, title)
    now = datetime.datetime.now().isoformat()
    db = get_db()
    cur = db.cursor()
    cur.execute(
        """INSERT INTO meetings(company, title, meeting_type, organizer, meeting_date, note, notes_file_path, created_at, updated_at)
           VALUES(?,?,?,?,?,?,?,?,?)""",
        (company, title, meeting_type, organizer, meeting_date, note, notes_file_path, now, now)
    )
    meeting_id = cur.lastrowid
    for attendee in attendees:
        team_member_key = str((attendee or {}).get('team_member_key') or '').strip() or None
        external_name = str((attendee or {}).get('external_name') or '').strip() or None
        external_email = str((attendee or {}).get('external_email') or '').strip() or None
        if not team_member_key and not external_name:
            continue
        db.execute(
            """INSERT INTO meeting_attendees(meeting_id, team_member_key, external_name, external_email, attended, follow_up_done, follow_up_note, created_at, updated_at)
               VALUES(?,?,?,?,?,?,?,?,?)""",
            (meeting_id, team_member_key, external_name, external_email, 1, 0, '', now, now)
        )
    for action_item in action_items:
        description = str((action_item or {}).get('description') or '').strip()
        owner_key = str((action_item or {}).get('owner_key') or '').strip() or None
        if not description:
            continue
        db.execute(
            """INSERT INTO meeting_action_items(meeting_id, owner_key, description, status, created_at, updated_at)
               VALUES(?,?,?,?,?,?)""",
            (meeting_id, owner_key, description, 'open', now, now)
        )
    db.commit()
    # Generate an AI meeting summary + per-attendee priority questions from the notes.
    notes_text = ''
    if notes_file_path:
        try:
            notes_text = extract_member_file_preview(notes_file_path) or ''
        except Exception:
            notes_text = ''
    if not notes_text:
        notes_text = note
    summary_payload = {'summary_status': 'none'}
    if (notes_text or '').strip():
        try:
            summary_payload = generate_meeting_intelligence(db, company, meeting_id, title, meeting_date, now, notes_text)
        except Exception as exc:
            summary_payload = {'summary_status': 'error', 'error': str(exc)}
    return jsonify({
        'ok': True,
        'meeting_id': meeting_id,
        'notes_file_path': notes_file_path,
        'updated_at': now,
        'summary': summary_payload.get('summary'),
        'summary_status': summary_payload.get('summary_status'),
        'questions_created': summary_payload.get('questions_created', 0),
    })

@app.route('/api/meetings/<int:meeting_id>')
def api_meeting_detail(meeting_id):
    company = request.args.get('company')
    db = get_db()
    rows = list_meetings_for_company(db, company)
    meeting = next((row for row in rows if row['id'] == meeting_id), None)
    if not meeting:
        abort(404)
    return jsonify({'ok': True, 'meeting': meeting})

@app.route('/api/meetings/<int:meeting_id>/attendees/<member_key>/follow_up', methods=['POST'])
def api_meeting_follow_up(meeting_id, member_key):
    body = request.get_json() or {}
    follow_up_done = 1 if body.get('follow_up_done') else 0
    follow_up_note = (body.get('follow_up_note') or '').strip()
    now = datetime.datetime.now().isoformat()
    db = get_db()
    row = db.execute(
        "SELECT id FROM meeting_attendees WHERE meeting_id=? AND team_member_key=?",
        (meeting_id, member_key)
    ).fetchone()
    if not row:
        abort(404)
    db.execute(
        """UPDATE meeting_attendees
           SET follow_up_done=?, follow_up_note=?, updated_at=?
           WHERE id=?""",
        (follow_up_done, follow_up_note, now, row['id'])
    )
    db.commit()
    return jsonify({'ok': True, 'updated_at': now, 'follow_up_done': bool(follow_up_done)})

@app.route('/api/meetings/<int:meeting_id>/generate_summary', methods=['POST'])
def api_meeting_generate_summary(meeting_id):
    body = request.get_json() or {}
    company = body.get('company') or request.args.get('company')
    db = get_db()
    meeting = db.execute("SELECT * FROM meetings WHERE id=?", (meeting_id,)).fetchone()
    if not meeting:
        abort(404)
    notes_text = ''
    if meeting['notes_file_path']:
        try:
            notes_text = extract_member_file_preview(meeting['notes_file_path']) or ''
        except Exception:
            notes_text = ''
    if not notes_text:
        notes_text = meeting['note'] or ''
    if not (notes_text or '').strip():
        return jsonify({'ok': False, 'reason': 'No notes text available to summarize. Attach a notes file or add a summary note.'}), 400
    now = datetime.datetime.now().isoformat()
    result = generate_meeting_intelligence(
        db, meeting['company'] or company, meeting_id,
        meeting['title'], meeting['meeting_date'], now, notes_text,
    )
    return jsonify({'ok': True, **result})
def api_question_assignment():
    body = request.get_json() or {}
    company = body.get('company')
    qid = body.get('qid')
    assignee = body.get('assignee')
    note = body.get('note', '')
    if not company or not qid or not assignee:
        abort(400, 'company, qid, and assignee required')
    db = get_db()
    existing = db.execute("SELECT id FROM question_assignment WHERE company=? AND qid=?", (company, qid)).fetchone()
    now = datetime.datetime.now().isoformat()
    if existing:
        db.execute("UPDATE question_assignment SET assignee=?, note=?, updated_at=? WHERE id=?", (assignee, note, now, existing['id']))
    else:
        db.execute("INSERT INTO question_assignment(company, qid, assignee, updated_at, note) VALUES(?,?,?,?,?)",
                   (company, qid, assignee, now, note))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/repo_understanding')
def api_repo_understanding_get():
    company = request.args.get('company')
    if not company:
        abort(400, 'company required')
    db = get_db()
    return jsonify({
        'company': company,
        'rows': list(get_repo_understanding_map(db, company).values()),
    })

@app.route('/api/repo_understanding', methods=['POST'])
def api_repo_understanding_set():
    body = request.get_json() or {}
    company = body.get('company')
    department_key = body.get('department_key')
    repo_name = body.get('repo_name')
    status = (body.get('status') or 'UNKNOWN').strip().upper()
    review_note = (body.get('review_note') or '').strip()
    next_questions_note = (body.get('next_questions_note') or '').strip()
    reviewed_by = (body.get('reviewed_by') or '').strip()
    allowed_statuses = {
        'UNKNOWN',
        'QUESTIONS_OPEN',
        'ANSWERS_IN_REVIEW',
        'FOLLOW_UP_REQUIRED',
        'DEPARTMENT_UNDERSTOOD',
        'FULLY_UNDERSTOOD',
    }
    if not company or not department_key or not repo_name:
        abort(400, 'company, department_key, and repo_name required')
    if status not in allowed_statuses:
        abort(400, 'invalid status')
    db = get_db()
    existing = db.execute(
        "SELECT id FROM repo_understanding WHERE company=? AND department_key=? AND repo_name=?",
        (company, department_key, repo_name),
    ).fetchone()
    now = datetime.datetime.now().isoformat()
    if existing:
        db.execute(
            """UPDATE repo_understanding
               SET status=?, review_note=?, next_questions_note=?, reviewed_by=?, updated_at=?
               WHERE id=?""",
            (status, review_note, next_questions_note, reviewed_by, now, existing['id']),
        )
    else:
        db.execute(
            """INSERT INTO repo_understanding(
                   company, department_key, repo_name, status,
                   review_note, next_questions_note, reviewed_by, updated_at
               ) VALUES(?,?,?,?,?,?,?,?)""",
            (company, department_key, repo_name, status, review_note, next_questions_note, reviewed_by, now),
        )
    db.commit()
    return jsonify({'ok': True, 'updated_at': now})

def _gov_find(cfg, filename):
    """Locate a governance file by exact name. Tries _GOVERNANCE\\<name> directly, then anywhere under
    _GOVERNANCE, then anywhere under the company root (the same scope the file browser uses). This keeps
    the dedicated views (Decision Log, Findings, Inventory) working regardless of how deep the corpus was
    extracted."""
    root = cfg['root']
    base = root / '_GOVERNANCE'
    direct = base / filename
    if direct.exists():
        return direct
    if base.exists():
        for p in base.rglob(filename):
            if '.git' not in p.parts:
                return p
    if root.exists():
        for p in root.rglob(filename):
            if '.git' not in p.parts:
                return p
    return None

def _gov_glob(cfg, pattern):
    """Glob a governance pattern in _GOVERNANCE first, then recursively under _GOVERNANCE, then under the
    whole company root as a last resort (matching the file-browser scope)."""
    root = cfg['root']
    base = root / '_GOVERNANCE'
    if base.exists():
        direct = sorted(base.glob(pattern))
        if direct:
            return direct
        nested = sorted(p for p in base.rglob(pattern) if '.git' not in p.parts)
        if nested:
            return nested
    if root.exists():
        return sorted(p for p in root.rglob(pattern) if '.git' not in p.parts)
    return []

@app.route('/api/findings')
def api_findings():
    company = request.args.get('company')
    cfg = get_company(company)
    f = _gov_find(cfg, '_FINDINGS_FOR_REVIEW.md')
    if not f: return jsonify({'exists': False, 'findings': []})
    text = f.read_text(encoding='utf-8', errors='replace')
    last_updated = re.search(r'Last Updated:\s*([^\n]+)', text)
    try:
        generated_at = datetime.datetime.fromtimestamp(f.stat().st_mtime).isoformat(timespec='minutes')
    except Exception:
        generated_at = ''
    findings = parse_findings(text)
    try:
        db = get_db()
        ensure_finding_reviews_table(db)
        review_map = {
            row['fid']: dict(row)
            for row in db.execute(
                "SELECT fid, decision, reviewer, note, reviewed_at FROM finding_reviews WHERE company=?",
                (company,),
            ).fetchall()
        }
    except Exception:
        review_map = {}
    for item in findings:
        rv = review_map.get(item['fid'])
        item['review'] = ({
            'decision': rv['decision'],
            'reviewer': rv['reviewer'],
            'note': rv['note'],
            'reviewed_at': rv['reviewed_at'],
        } if rv else None)
    return jsonify({
        'exists': True,
        'findings': findings,
        'file': str(f),
        'generated_at': generated_at,
        'last_updated': (last_updated.group(1).strip() if last_updated else ''),
    })


def ensure_finding_reviews_table(db):
    db.execute("""
        CREATE TABLE IF NOT EXISTS finding_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT NOT NULL,
            fid TEXT NOT NULL,
            decision TEXT NOT NULL DEFAULT 'REVIEWED',
            reviewer TEXT NOT NULL,
            note TEXT,
            reviewed_at TEXT NOT NULL,
            UNIQUE(company, fid)
        )
    """)
    db.commit()


@app.route('/api/findings/review', methods=['POST'])
def api_findings_review():
    data = request.get_json(force=True) or {}
    company = (data.get('company') or '').strip()
    fid = (data.get('fid') or '').strip()
    decision = (data.get('decision') or 'REVIEWED').strip().upper()
    reviewer = (data.get('reviewer') or '').strip()
    note = (data.get('note') or '').strip()
    if not company or not fid:
        return jsonify({'ok': False, 'error': 'company and fid are required'}), 400
    if not reviewer:
        return jsonify({'ok': False, 'error': 'Reviewer name is required'}), 400
    allowed = {'PENDING', 'REVIEWED', 'APPROVED', 'DISMISSED'}
    if decision not in allowed:
        decision = 'REVIEWED'
    db = get_db()
    ensure_finding_reviews_table(db)
    now = datetime.datetime.now().isoformat(timespec='minutes')
    db.execute(
        """INSERT INTO finding_reviews (company, fid, decision, reviewer, note, reviewed_at)
           VALUES (?,?,?,?,?,?)
           ON CONFLICT(company, fid) DO UPDATE SET
             decision=excluded.decision,
             reviewer=excluded.reviewer,
             note=excluded.note,
             reviewed_at=excluded.reviewed_at""",
        (company, fid, decision, reviewer, note, now),
    )
    db.commit()
    return jsonify({'ok': True, 'review': {
        'decision': decision, 'reviewer': reviewer, 'note': note, 'reviewed_at': now,
    }})

@app.route('/api/decisions')
def api_decisions():
    company = request.args.get('company')
    cfg = get_company(company)
    f = _gov_find(cfg, 'DECISION_LOG.md')
    if not f: return jsonify({'exists': False, 'content': ''})
    return jsonify({'exists': True, 'content': f.read_text(encoding='utf-8', errors='replace')})

@app.route('/api/glossary')
def api_glossary():
    company = request.args.get('company')
    cfg = get_company(company)
    candidates = _gov_glob(cfg, '*Glossary*.md')
    if not candidates: return jsonify({'exists': False, 'content': ''})
    return jsonify({'exists': True, 'content': candidates[0].read_text(encoding='utf-8', errors='replace'), 'file': candidates[0].name})

@app.route('/api/inventory')
def api_inventory():
    company = request.args.get('company')
    cfg = get_company(company)
    f = _gov_find(cfg, '_REPO_INVENTORY.md')
    if not f: return jsonify({'exists': False})
    return jsonify({'exists': True, 'content': f.read_text(encoding='utf-8', errors='replace')})

@app.route('/api/files')
def api_files():
    company = request.args.get('company')
    return jsonify(build_governance_file_index(company))

@app.route('/api/file')
def api_file_get():
    company = request.args.get('company')
    rel = request.args.get('path')
    if not rel: abort(400)
    cfg = get_company(company)
    target = (cfg['root'] / rel).resolve()
    try: target.relative_to(cfg['root'].resolve())
    except ValueError: abort(403)
    if not target.is_file(): abort(404)
    content = target.read_text(encoding='utf-8', errors='replace')
    index = build_governance_file_index(company)
    file_row = next((row for row in index['rows'] if row['path'] == rel), None)
    if not file_row:
        abort(404)
    related_files = [
        {'path': row['path'], 'name': row['name']}
        for row in index['rows']
        if row['category_key'] == file_row['category_key'] and row['path'] != rel
    ][:8]
    return jsonify({
        'path': rel,
        'name': file_row['name'],
        'content': content,
        'size': file_row['size'],
        'modified': file_row['modified'],
        'category_key': file_row['category_key'],
        'category_label': file_row['category_label'],
        'attention_flags': file_row['attention_flags'],
        'attention_level': file_row['attention_level'],
        'attention_count': file_row['attention_count'],
        'headings': governance_file_headings(content, limit=8),
        'related_files': related_files,
    })

@app.route('/api/files/chat', methods=['POST'])
def api_files_chat():
    body = request.get_json() or {}
    company = body.get('company')
    rel = body.get('path')
    engine = body.get('engine')
    user_prompt = (body.get('prompt') or '').strip()
    if not company or not rel or not engine or not user_prompt:
        abort(400, 'company, path, engine, and prompt are required')

    cfg = get_company(company)
    target = (cfg['root'] / rel).resolve()
    try:
        target.relative_to(cfg['root'].resolve())
    except ValueError:
        abort(403)
    if not target.is_file():
        abort(404)

    index = build_governance_file_index(company)
    file_row = next((row for row in index['rows'] if row['path'] == rel), None)
    if not file_row:
        abort(404)
    related_files = [row for row in index['rows'] if row['category_key'] == file_row['category_key'] and row['path'] != rel][:6]
    content = target.read_text(encoding='utf-8', errors='replace')
    prompt = build_governance_file_chat_prompt(company, file_row, content, related_files, user_prompt)

    if engine == 'Claude Code':
        if not command_exists(CLAUDE_EXE or 'claude'):
            return jsonify({'ok': False, 'reason': 'Claude CLI is not available on this machine.'}), 409
        try:
            result = subprocess.run(
                [CLAUDE_EXE or 'claude', '-p', '--allowedTools', 'Read'],
                capture_output=True,
                text=True, encoding='utf-8', errors='replace',
                input=prompt,
                timeout=180,
                cwd=str(BASE_DIR),
            )
            if result.returncode != 0:
                return jsonify({'ok': False, 'reason': (result.stderr or result.stdout or 'Claude request failed').strip()}), 500
            return jsonify({
                'ok': True,
                'engine': engine,
                'response_text': result.stdout.strip(),
                'category': file_row['category_label'],
            })
        except subprocess.TimeoutExpired:
            return jsonify({'ok': False, 'reason': 'Claude request timed out'}), 504

    if engine == 'OpenAI Codex':
        if not openai_configured():
            return jsonify({'ok': False, 'reason': 'OPENAI_API_KEY not configured.'}), 409
        payload = {
            'model': get_openai_model(),
            'input': prompt,
        }
        headers = {
            'Authorization': f"Bearer {get_openai_api_key()}",
            'Content-Type': 'application/json',
        }
        response = requests.post('https://api.openai.com/v1/responses', headers=headers, json=payload, timeout=180)
        if response.status_code >= 400:
            return jsonify({'ok': False, 'reason': response.text[:4000]}), 500
        data = response.json()
        output_text = data.get('output_text', '')
        if not output_text and 'output' in data:
            output_chunks = []
            for item in data.get('output', []):
                for content_item in item.get('content', []):
                    if content_item.get('type') == 'output_text':
                        output_chunks.append(content_item.get('text', ''))
            output_text = '\n'.join(chunk for chunk in output_chunks if chunk)
        return jsonify({
            'ok': True,
            'engine': engine,
            'response_text': output_text,
            'category': file_row['category_label'],
        })

    abort(400, 'Unsupported engine')

@app.route('/api/repo_questions/chat', methods=['POST'])
def api_repo_questions_chat():
    body = request.get_json() or {}
    company = body.get('company')
    question_code = body.get('question_code')
    engine = body.get('engine')
    user_prompt = (body.get('prompt') or '').strip()
    if not company or not question_code or not engine or not user_prompt:
        abort(400, 'company, question_code, engine, and prompt are required')

    db = get_db()
    row = db.execute(
        "SELECT * FROM repo_questions WHERE company=? AND question_code=?",
        (company, question_code),
    ).fetchone()
    if not row:
        abort(404)
    question_row = dict(row)
    prompt = build_repo_question_chat_prompt(company, question_row, user_prompt)

    if engine == 'Claude Code':
        if not command_exists(CLAUDE_EXE or 'claude'):
            return jsonify({'ok': False, 'reason': 'Claude CLI is not available on this machine.'}), 409
        try:
            result = subprocess.run(
                [CLAUDE_EXE or 'claude', '-p', '--allowedTools', 'Read'],
                capture_output=True,
                text=True, encoding='utf-8', errors='replace',
                input=prompt,
                timeout=180,
                cwd=str(BASE_DIR),
            )
            if result.returncode != 0:
                return jsonify({'ok': False, 'reason': (result.stderr or result.stdout or 'Claude request failed').strip()}), 500
            return jsonify({'ok': True, 'engine': engine, 'response_text': result.stdout.strip()})
        except subprocess.TimeoutExpired:
            return jsonify({'ok': False, 'reason': 'Claude request timed out'}), 504

    if engine == 'OpenAI Codex':
        if not openai_configured():
            return jsonify({'ok': False, 'reason': 'OPENAI_API_KEY not configured.'}), 409
        payload = {'model': get_openai_model(), 'input': prompt}
        headers = {
            'Authorization': f"Bearer {get_openai_api_key()}",
            'Content-Type': 'application/json',
        }
        response = requests.post('https://api.openai.com/v1/responses', headers=headers, json=payload, timeout=180)
        if response.status_code >= 400:
            return jsonify({'ok': False, 'reason': response.text[:4000]}), 500
        data = response.json()
        output_text = data.get('output_text', '')
        if not output_text and 'output' in data:
            output_chunks = []
            for item in data.get('output', []):
                for content_item in item.get('content', []):
                    if content_item.get('type') == 'output_text':
                        output_chunks.append(content_item.get('text', ''))
            output_text = '\n'.join(chunk for chunk in output_chunks if chunk)
        return jsonify({'ok': True, 'engine': engine, 'response_text': output_text})

    abort(400, 'Unsupported engine')

@app.route('/api/git/status')
def api_git_status():
    company = request.args.get('company')
    cfg = get_company(company)
    out = {}
    for label, path in [('governance', cfg['root']), ('legal_vault', cfg['vault'])]:
        if not (path / '.git').exists():
            out[label] = {'exists': False}; continue
        try:
            status = subprocess.run([GIT_EXE, '-C', str(path), 'status', '--short'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=10)
            log = subprocess.run([GIT_EXE, '-C', str(path), 'log', '-1', '--format=%h|%ai|%s'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=10)
            out[label] = {
                'exists': True, 'path': str(path),
                'dirty': bool(status.stdout.strip()),
                'changes': status.stdout.strip().split('\n') if status.stdout.strip() else [],
                'last_commit': log.stdout.strip(),
            }
        except Exception as e:
            out[label] = {'exists': True, 'error': str(e)}
    return jsonify(out)

@app.route('/api/version_history')
def api_version_history():
    company = request.args.get('company')
    cfg = get_company(company)
    out = {'governance': [], 'legal_vault': []}
    for label, path, scoped_path in [
        ('governance', cfg['root'], '_GOVERNANCE'),
        ('legal_vault', cfg['vault'], '.'),
    ]:
        if not (path / '.git').exists():
            continue
        try:
            log_cmd = [
                GIT_EXE, '-C', str(path), 'log', '--date=short',
                '--pretty=format:%h|%ad|%an|%s', '-12'
            ]
            if scoped_path != '.':
                log_cmd.extend(['--', scoped_path])
            log = subprocess.run(log_cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=15)
            commits = []
            for line in log.stdout.splitlines():
                parts = line.split('|', 3)
                if len(parts) != 4:
                    continue
                sha, date, author, subject = parts
                show_cmd = [GIT_EXE, '-C', str(path), 'show', '--name-only', '--format=', sha]
                show = subprocess.run(show_cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=15)
                files = [f for f in show.stdout.splitlines() if f.strip()]
                commits.append({
                    'sha': sha,
                    'date': date,
                    'author': author,
                    'subject': subject,
                    'files': files[:15],
                    'path': str(path),
                })
            out[label] = commits
        except Exception as e:
            out[label] = [{'error': str(e)}]
    return jsonify(out)

def transcribe_audio(path):
    """Transcribe an audio file via OpenAI Whisper. Returns (text, error)."""
    if not openai_configured():
        return None, 'OpenAI key not configured (Whisper is needed to transcribe voice memos).'
    try:
        with open(path, 'rb') as f:
            resp = requests.post(
                'https://api.openai.com/v1/audio/transcriptions',
                headers={'Authorization': f"Bearer {get_openai_api_key()}"},
                files={'file': (os.path.basename(path), f, 'audio/webm')},
                data={'model': 'whisper-1'},
                timeout=180,
            )
        if resp.status_code < 400:
            return (resp.json().get('text') or '').strip(), None
        return None, f'Transcription failed: HTTP {resp.status_code} {resp.text[:200]}'
    except Exception as exc:
        return None, f'Transcription error: {exc}'

def build_voice_memo_prompt(label, transcript):
    return (
        "You are a governance assistant for Mineral View. A team member recorded a short voice memo. "
        "Read the TRANSCRIPT and respond with STRICT JSON only - no prose, no markdown fences. Shape:\n"
        '{ "summary": "3-6 sentence summary of what was said, including any decision or answer", '
        '"questions": [ {"priority": "HIGH|MEDIUM|LOW", "question": "a specific follow-up question raised by the memo"} ] }\n'
        "Rules: base it ONLY on the transcript; 1-4 questions; keep them specific and actionable.\n\n"
        f"MEMO LABEL: {label}\nTRANSCRIPT:\n{(transcript or '')[:6000]}"
    )

def generate_voice_memo_intelligence(db, company, label, transcript, member_key=None):
    prompt = build_voice_memo_prompt(label, transcript)
    _gov = governance_context(company, max_chars=8000)
    if _gov:
        prompt = _gov + "\n\n" + prompt
    text, engine = run_meeting_ai(prompt)
    data = parse_meeting_ai_json(text) if text else None
    if not data:
        flat = ' '.join((transcript or '').split())
        data = {'summary': flat[:500], 'questions': []}
        engine = engine or 'heuristic'
    summary = (data.get('summary') or '').strip()
    questions = []
    created = 0
    for q in (data.get('questions') or []):
        qtext = str((q or {}).get('question') or '').strip()
        if not qtext:
            continue
        priority = str((q or {}).get('priority') or 'MEDIUM').strip().upper()
        if priority not in ('HIGH', 'MEDIUM', 'LOW'):
            priority = 'MEDIUM'
        questions.append({'priority': priority, 'question': qtext, 'member_key': member_key})
        if member_key:
            try:
                create_team_member_question(
                    db, company, member_key, qtext[:160],
                    f"From voice memo '{label}'.\n\n{qtext}",
                    priority=priority, status='NEW', generated_by='Voice Memo AI',
                )
                created += 1
            except Exception:
                pass
    return {'summary': summary, 'questions': questions, 'engine': engine, 'questions_created': created}


def governance_base_dir(cfg):
    """Return the directory that actually holds the governance corpus (the same one the
    file browser reads from), so voice memos land next to the real _GOVERNANCE files even
    when the corpus was extracted into a nested folder."""
    root = cfg['root']
    base = root / '_GOVERNANCE'
    if base.exists():
        return base
    if root.exists():
        for p in root.rglob('_GOVERNANCE'):
            if p.is_dir() and '.git' not in p.parts:
                return p
    return base


@app.route('/api/audio', methods=['POST'])
def api_audio():
    company = request.form.get('company')
    label = (request.form.get('label', 'memo') or 'memo').replace('/', '_').replace('\\', '_')
    cfg = get_company(company)
    if 'audio' not in request.files: abort(400)
    audio = request.files['audio']
    memos_dir = governance_base_dir(cfg) / '_VOICE_MEMOS'
    memos_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.datetime.now().strftime('%Y-%m-%d_%H%M%S')
    filename = f'{ts}_{label}.webm'
    out_path = memos_dir / filename
    audio.save(out_path)
    context_json = request.form.get('context_json')
    context_path = None
    linked_questions = []
    if context_json:
        try:
            context_payload = json.loads(context_json)
            if isinstance(context_payload, dict):
                linked_questions = context_payload.get('question_ids', []) or []
                context_path = memos_dir / f'{ts}_{label}.json'
                context_path.write_text(json.dumps(context_payload, indent=2), encoding='utf-8')
        except Exception:
            context_path = None

    # Resolve a routing target: explicit member_key, else match the label to a team member.
    db = get_db()
    member_key = request.form.get('member_key') or None
    if not member_key:
        label_norm = label.replace('_', ' ').strip().lower()
        for k in list_employees(company):
            if k.lower() == label.lower() or pretty_member_name(k).lower() == label_norm:
                member_key = k
                break

    # Transcribe + summarize + generate priority questions (same AI flow as meetings).
    transcript, transcript_error = transcribe_audio(out_path)
    intel = {'summary': '', 'questions': [], 'questions_created': 0, 'engine': None}
    if transcript:
        intel = generate_voice_memo_intelligence(db, company, label, transcript, member_key=member_key)
        try:
            (memos_dir / f'{ts}_{label}.transcript.txt').write_text(transcript, encoding='utf-8')
            (memos_dir / f'{ts}_{label}.intel.json').write_text(json.dumps(intel, indent=2), encoding='utf-8')
        except Exception:
            pass

    return jsonify({
        'saved': str(out_path),
        'filename': filename,
        'context_saved': str(context_path) if context_path else None,
        'linked_questions': linked_questions,
        'linked_count': len(linked_questions),
        'routed_member': pretty_member_name(member_key) if member_key else None,
        'transcript': transcript or '',
        'transcript_error': transcript_error,
        'summary': intel.get('summary', ''),
        'questions': intel.get('questions', []),
        'questions_created': intel.get('questions_created', 0),
        'engine': intel.get('engine'),
    })


if __name__ == '__main__':
    init_db()
    print('Governance Workbench v2 starting on http://127.0.0.1:5050')
    print('  MView root: ', COMPANIES['MView']['root'])
    print('  DB:         ', DB_PATH)
    app.run(host='127.0.0.1', port=5050, debug=False)
