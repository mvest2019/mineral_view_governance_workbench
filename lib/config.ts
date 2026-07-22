import path from 'path';
import fs from 'fs';
import { loadLocalSettings } from '@/lib/paths';

export interface CompanyConfig {
  root: string;
  vault: string;
  mirror: string;
  gh_account: string;
  name_full: string;
}

export const COMPANIES: Record<string, CompanyConfig> = {
  MView: {
    root: 'C:\\MineralView-Org',
    vault: 'C:\\MineralView-LegalVault',
    mirror: 'C:\\MineralView-Repos',
    gh_account: 'mvest2019',
    name_full: 'Mineral View (MVest LLC)',
  },
};

export const REPO_CATEGORIES: string[] = [
  'Pricing', 'Vendor Feeds', 'Payments / Finance', 'Tax / Compliance',
  'Orders / Checkout', 'Shipping / Fulfillment', 'Notifications / Email',
  'Customer / CRM / Marketing', 'Web / Storefront', 'Mobile',
  'Analytics / ML', 'Admin / Ops', 'Governance / Legal', 'Unknown',
];

export const GOVERNANCE_FILE_CATEGORY_ORDER: [string, string][] = [
  ['core', 'Core Governance'],
  ['drafts', 'Drafts & Build Prompts'],
  ['reviews', 'Reviews, Findings & Drift'],
  ['systems', 'Repo & System Maps'],
  ['operations', 'Operations & Department Guides'],
  ['archive', 'Archive & Historical'],
  ['general', 'General'],
];

export const ASPECT_GROUP_RULES: Record<string, Array<{ name: string; description: string; repos: string[] }>> = {
  MView: [
    {
      name: 'Portal and Customer Experience',
      description: 'Portal, customer-facing web experiences, messaging, and mobile touchpoints.',
      repos: ['MineralView-Portal-Next', 'mview-platform-next15', 'Mview-Portal-Next', 'Mview-Portal-NextJS', 'MViewPortalUI', 'MViewPortalAPI', 'MView-Community-FE', 'mviewmessageAPI', 'mview-iOSApp', 'Mview-Cerebro-web'],
    },
    {
      name: 'Data Ingestion and Scrapers',
      description: 'Source-data ingestion, scraping, and inbound data collection.',
      repos: ['CompletionScraper', 'DirectionalSurveyScraper', 'G5FormScraper', 'InvestorPresentationScraper', 'MarketUpdatesScraper', 'MineralRollScraper', 'ProductPricingScraper', 'Scrapers', 'W1PermitScraper', 'WellboreScraper', 'WellLocationScraper'],
    },
    {
      name: 'Analytics, Estimation, and Modeling',
      description: 'Valuation, decline curves, exploration notebooks, and analytical pipelines.',
      repos: ['mvestimateAPI', 'MVestimateCalculator', 'MView-Analytics', 'MViewDataExploration', 'MviewDataExploreAPI', 'Decline_curve', 'DeclineCurve2026', 'DeclineCurveManualAnalysis2025', 'BuildSearchData4LeaseNWellRpts', 'VolumeReaderfromxls', 'OneTimeMonthlyVolumePopulation'],
    },
    {
      name: 'GIS and Spatial Workflows',
      description: 'Lease, well, GIS, and geospatial enrichment pipelines.',
      repos: ['gis-poc', 'OTPopulateLeaseGISInfo', 'WellLocationScraper', 'DirectionalSurveyScraper'],
    },
    {
      name: 'Presentations and Investor Outputs',
      description: 'Investor decks, presentation sites, and presentation generation.',
      repos: ['GenerateInvestorPresentations', 'Mview-Presentation-Next', 'PresentationSiteAPI', 'InvestorPresentationScraper'],
    },
    {
      name: 'News and Market Updates',
      description: 'Content generation and update distribution for news and market changes.',
      repos: ['W1NewsGeneration', 'W2NewsGeneration', 'mineralview-weekly', 'MarketUpdatesScraper'],
    },
    {
      name: 'Ops, Backups, and Utility Jobs',
      description: 'Operational maintenance, backups, and recurring platform utility jobs.',
      repos: ['Daily-Production-Backup', 'Daily-Production-Backups', 'OneTimeMonthlyVolumePopulation'],
    },
    {
      name: 'APIs and Internal Services',
      description: 'Service APIs, Cerebro surfaces, and internal platform services.',
      repos: ['CerebroAPI', 'CerebroAPIs', 'W2API'],
    },
  ],
};

export const TEAM_MEMBER_PROFILES: Record<string, Record<string, { role: string; purpose: string; departments: string[]; repos: string[]; operating_sources: string[] }>> = {
  MView: {
    Ryan_Cochran: {
      role: 'Owner / Operator',
      purpose: 'Owns governance, final business decisions, and cross-team routing for Mineral View.',
      departments: [
        'DATA_SCIENCE',
        'PLATFORM_INFRASTRUCTURE',
        'INVESTOR_RELATIONS',
        'LAND_TITLE',
        'RESERVOIR',
        'ROYALTY_ACCOUNTING',
        'DEVELOPMENT',
      ],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\EMPLOYEE_TASKS\\Ryan_Cochran\\_README.md',
      ],
    },
    Sachin_Shinde: {
      role: '',
      purpose: 'Mineral View team member.',
      departments: [],
      repos: [],
      operating_sources: [],
    },
    Nikhil_Salunke: {
      role: 'Data Scientist',
      purpose: 'Leads large-scale oil and gas data collection, processing, validation, analytics, workflow verification, and AI-driven data-solution work across Mineral View, with strong hands-on ownership of production, lease, well, ownership, and Mvestimate-related data systems.',
      departments: ['DATA_SCIENCE', 'DATA_ACQUISITION', 'DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE', 'RESERVOIR', 'LAND_TITLE', 'REPORTING', 'RISK_SECURITY'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\EMPLOYEE_TASKS\\Nikhil_Salunke\\PRIORITY_QUESTIONS_FOR_NIKHIL_SALUNKE_RESOLVED_v1.md',
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Gabor_Korosi: {
      role: 'Data Scientist',
      purpose: 'Works with Nikhil Salunke and Christos Batsios on Mineral View process improvements, data quality, and insight generation. Confirmed as MView contractor (memory: bold_dev_team.md, 2026-05-02).',
      departments: ['DATA_SCIENCE', 'RESERVOIR', 'DEVELOPMENT'],
      repos: [],
      operating_sources: [],
    },
    Christos_Batsios: {
      role: 'Data Scientist',
      purpose: 'Works with Nikhil Salunke and Gabor Korosi on Mineral View process improvements, data quality, and insight generation. Confirmed as MView contractor (memory: bold_dev_team.md, 2026-05-02).',
      departments: ['DATA_SCIENCE', 'LAND_TITLE', 'DEVELOPMENT'],
      repos: [],
      operating_sources: [],
    },
    Pranav_Nandeshwar: {
      role: 'Data Scientist',
      purpose: 'Builds production-grade data systems and AI-driven analytical engines across Mineral View, including production allocation, BOE forecasting, linkage optimization, geospatial workflows, cashflow modeling, monthly reporting, and activity notification systems.',
      departments: ['DATA_SCIENCE', 'DATA_ACQUISITION'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Aboli_Mundralkar: {
      role: 'Frontend Developer',
      purpose: 'Builds responsive and scalable frontend interfaces, interactive UI components, API-integrated features, debugging and testing support, and continuous frontend improvements for Mineral View.',
      departments: ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\EMPLOYEE_TASKS\\Aboli_Mundralkar\\PRIORITY_QUESTIONS_FOR_ABOLI_MUNDRALKAR_RESOLVED_v1.md',
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Utkarsha_Chougule: {
      role: 'QA Tester',
      purpose: 'Handles manual testing, regression and functional validation, UI responsiveness checks, API testing, and bug verification across lease data, owner records, production data, notifications, GIS maps, and related Mineral View workflows.',
      departments: ['DEVELOPMENT', 'LAND_TITLE', 'RESERVOIR', 'PLATFORM_INFRASTRUCTURE'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Shubham_Kamble: {
      role: 'Content Writer',
      purpose: 'Creates SEO-optimized Mineral View content around mineral rights, valuation, and energy-market topics, while supporting keyword strategy, guest posting, and digital content marketing initiatives.',
      departments: ['MARKETING', 'CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Pragati_Dhumal: {
      role: 'Frontend Developer',
      purpose: 'Builds Next.js and React frontend features, reusable UI components, SSR and routing workflows, responsive layouts, performance improvements, and deployment validation for Mineral View.',
      departments: ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\EMPLOYEE_TASKS\\Pragati_Dhumal\\PRIORITY_QUESTIONS_FOR_PRAGATI_DHUMAL_RESOLVED_v1.md',
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Pooja_Wable: {
      role: 'Frontend Developer',
      purpose: 'Builds responsive React and Next.js frontend workflows, dynamic data-visualization features, API integrations, performance improvements, and usability fixes across the Mineral View platform.',
      departments: ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE', 'RESERVOIR'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\EMPLOYEE_TASKS\\Pooja_Wable\\PRIORITY_QUESTIONS_FOR_POOJA_WABLE_RESOLVED_v1.md',
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Vaishnavi_Dhawale: {
      role: 'Backend Developer',
      purpose: 'Builds and optimizes backend APIs, query performance, database structures, and business logic for owner search, lease claiming, reporting, and search workflows on Mineral View.',
      departments: ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE', 'LAND_TITLE', 'REPORTING'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\EMPLOYEE_TASKS\\Vaishnavi_Dhawale\\PRIORITY_QUESTIONS_FOR_VAISHNAVI_DHAWALE_RESOLVED_v1.md',
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Riya_Wankhade: {
      role: 'Web Scraper',
      purpose: 'Extracts oil and gas data from RRC and related sources, reruns failed scrapers, resolves data mismatches, and maintains scraper output accuracy and production readiness.',
      departments: ['DATA_ACQUISITION', 'DATA_SCIENCE', 'DEVELOPMENT'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Sanskriti_Choudante: {
      role: 'Backend Developer',
      purpose: 'Builds scalable backend systems and high-performance APIs with a focus on authentication, data-driven workflows, user activity tracking, and backend optimization.',
      departments: ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE', 'DATA_SCIENCE'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Rohit_Pandey: {
      role: 'Digital Marketing Executive',
      purpose: 'Handles SEO, website-visibility improvements, analytics, technical optimization, and user-behavior monitoring for Mineral View.',
      departments: ['MARKETING', 'CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Tushar_Patil: {
      role: 'Backend Developer',
      purpose: 'Builds and maintains scalable backend services and APIs, database schemas, performance tuning, backend debugging, and production issue resolution for Mineral View.',
      departments: ['DEVELOPMENT', 'PLATFORM_INFRASTRUCTURE'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\EMPLOYEE_TASKS\\Tushar_Patil\\PRIORITY_QUESTIONS_FOR_TUSHAR_PATIL_RESOLVED_v1.md',
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Ajay_Landge: {
      role: 'Business Development Executive',
      purpose: 'Supports SEO, technical optimization, analytics, social media, and broader digital-growth activities to improve Mineral View visibility and engagement.',
      departments: ['MARKETING', 'CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Tejas_Zurange: {
      role: 'Video Editor',
      purpose: 'Creates video content and AI-assisted visual storytelling assets for Mineral View digital marketing and audience engagement.',
      departments: ['MARKETING'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Krishna_Sable: {
      role: 'Business Development Executive',
      purpose: 'Handles SEO, blog and landing-page optimization, link building, off-page SEO, and digital-growth activities to improve Mineral View visibility and engagement.',
      departments: ['MARKETING', 'CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Gautammi_Kamath: {
      role: 'Sales Team Lead',
      purpose: 'Leads sales and marketing efforts, customer calls, content and social activity, and product-feedback coordination to improve customer satisfaction and growth.',
      departments: ['CUSTOMER_RELATIONS', 'INVESTOR_RELATIONS', 'MARKETING'],
      repos: [],
      operating_sources: [
        'C:\\MineralView-Org\\_GOVERNANCE\\team_members\\MVIEW_TEAM_ASSIGNMENTS_AND_QUESTIONS_2026-05-12.md',
      ],
    },
    Prasad_Shinde: {
      role: 'Developer',
      purpose: 'Mineral View team member.',
      departments: ['DEVELOPMENT'],
      repos: [],
      operating_sources: [],
    },
    Sanket_Nandanwar: {
      role: 'Developer',
      purpose: 'Mineral View team member.',
      departments: ['DEVELOPMENT'],
      repos: [],
      operating_sources: [],
    },
  },
};

export const DEPARTMENT_ARCHITECTURE: {
  shared: Array<{ key: string; name: string; description: string; repos_by_company: Record<string, string[]> }>;
  MView: Array<{ key: string; name: string; description: string; repos: string[] }>;
} = {
  shared: [
    {
      key: 'ACCOUNTING',
      name: 'Accounting',
      description: 'GL, reconciliations, A/R, A/P, and accounting-system workflows.',
      repos_by_company: {
        MView: [],
      },
    },
    {
      key: 'TAX_COMPLIANCE',
      name: 'Tax & Compliance',
      description: 'Tax filings, compliance checks, notices, and regulator-facing workflows.',
      repos_by_company: {
        MView: [],
      },
    },
    {
      key: 'MARKETING',
      name: 'Marketing',
      description: 'Email campaigns, content, SEO, social, and audience targeting.',
      repos_by_company: {
        MView: ['mineralview-weekly', 'W1NewsGeneration', 'W2NewsGeneration'],
      },
    },
    {
      key: 'DEVELOPMENT',
      name: 'Development',
      description: 'Engineering roster, code delivery, sprint work, and technical debt.',
      repos_by_company: {
        MView: ['MViewPortalAPI', 'MineralView-Portal-Next', 'CerebroAPI'],
      },
    },
    {
      key: 'LEGAL',
      name: 'Legal',
      description: 'Contracts, legal vault indexing, terms, privacy, and dispute handling.',
      repos_by_company: {
        MView: [],
      },
    },
    {
      key: 'PEOPLE',
      name: 'People',
      description: 'Employees, contractors, training, reviews, and people operations.',
      repos_by_company: {
        MView: [],
      },
    },
    {
      key: 'FINANCE_TREASURY',
      name: 'Finance / Treasury',
      description: 'Cash flow, banking relationships, treasury policy, and exposure management.',
      repos_by_company: {
        MView: [],
      },
    },
    {
      key: 'RISK_SECURITY',
      name: 'Risk & Security',
      description: 'Security incidents, fraud alerts, blacklist handling, and continuity planning.',
      repos_by_company: {
        MView: [],
      },
    },
    {
      key: 'REPORTING',
      name: 'Reporting / BI',
      description: 'Executive dashboards, KPIs, reporting pipelines, and board-pack support.',
      repos_by_company: {
        MView: ['MView-Analytics', 'mvestimateAPI'],
      },
    },
  ],
  MView: [
    {
      key: 'DATA_SCIENCE',
      name: 'Data Science',
      description: 'Decline curve analysis, mineral estimation models, predictive analytics, and model workflows.',
      repos: ['mvestimateAPI', 'MVestimateCalculator', 'Decline_curve', 'DeclineCurve2026', 'DeclineCurveManualAnalysis2025', 'MView-Analytics'],
    },
    {
      key: 'DATA_ACQUISITION',
      name: 'Data Acquisition',
      description: 'Scrapers, ETL, and ingestion of permit, well, market, and production data.',
      repos: ['CompletionScraper', 'DirectionalSurveyScraper', 'G5FormScraper', 'MarketUpdatesScraper', 'MineralRollScraper', 'ProductPricingScraper', 'Scrapers', 'W1PermitScraper', 'WellboreScraper', 'WellLocationScraper'],
    },
    {
      key: 'PLATFORM_INFRASTRUCTURE',
      name: 'Platform Infrastructure',
      description: 'Shared backend, APIs, portal frameworks, authentication, and cross-product platform services.',
      repos: ['mview-platform-next15', 'MineralView-Portal-Next', 'MViewPortalUI', 'MViewPortalAPI', 'MView-Community-FE', 'mviewmessageAPI', 'mview-iOSApp', 'Mview-Cerebro-web', 'CerebroAPI', 'CerebroAPIs'],
    },
    {
      key: 'DEVOPS',
      name: 'DevOps',
      description: 'Deployments, backups, scheduled jobs, and environment operations.',
      repos: ['Daily-Production-Backup', 'Daily-Production-Backups', 'OneTimeMonthlyVolumePopulation'],
    },
    {
      key: 'INVESTOR_RELATIONS',
      name: 'Investor Relations',
      description: 'Investor-facing communications, updates, and presentation outputs.',
      repos: ['GenerateInvestorPresentations', 'Mview-Presentation-Next', 'PresentationSiteAPI', 'InvestorPresentationScraper'],
    },
    {
      key: 'RESERVOIR',
      name: 'Reservoir',
      description: 'Reservoir analysis, valuation, decline curves, and production interpretation.',
      repos: ['mvestimateAPI', 'MVestimateCalculator', 'Decline_curve', 'DeclineCurve2026', 'MView-Analytics'],
    },
    {
      key: 'LAND_TITLE',
      name: 'Land & Title',
      description: 'Lease, title, GIS, and land-positioning workflows.',
      repos: ['OTPopulateLeaseGISInfo', 'gis-poc', 'WellLocationScraper', 'DirectionalSurveyScraper'],
    },
    {
      key: 'OPERATORS',
      name: 'Operators',
      description: 'Operator-side data sources, well activity, and operational field intelligence.',
      repos: ['WellboreScraper', 'W1PermitScraper', 'CompletionScraper', 'MarketUpdatesScraper'],
    },
    {
      key: 'ROYALTY_ACCOUNTING',
      name: 'Royalty Accounting',
      description: 'Royalty statement handling, production backups, and periodic accounting workflows.',
      repos: ['Daily-Production-Backup', 'Daily-Production-Backups', 'OneTimeMonthlyVolumePopulation', 'VolumeReaderfromxls'],
    },
  ],
};

export const WORKFLOW_STAGES: string[] = [
  'Uploaded', 'Stored', 'Parsed', 'AI Reviewed',
  'Findings Pending', 'Employee Questions Pending',
  'Ryan Questions Pending', 'Decision Drafting',
  'Awaiting Ryan Approval', 'Draft Governance Updated',
  'Awaiting Commit Approval', 'Committed', 'Pushed',
  'Constitution Candidate', 'Constitution Approved',
];

export const GATE_NAMES: string[] = [
  'Findings Approved', 'Employee Answered', 'Ryan Answered',
  'Decision Approved', 'Draft Governance Updated',
  'Commit Approved', 'Constitution Eligible',
];

export const TEAM_MEMBER_FILE_PURPOSE_BUCKETS: Record<string, string> = {
  initial_doc: 'inbound',
  answer_packet: 'answers',
  supporting_evidence: 'supporting',
  meeting_note: 'supporting',
  outbound_packet: 'outbound',
  other: 'inbound',
};

export const TEAM_MEMBER_QUESTION_STATUS_ORDER: string[] = [
  'NEW',
  'SUGGESTED_FOLLOW_UP',
  'SENT_TO_TEAM_MEMBER',
  'ANSWERED',
  'ANSWER_PENDING_REVIEW',
  'NEEDS_FOLLOW_UP',
  'APPROVED',
  'CLOSED',
];

function resolveCompanyPaths(): void {
  const settings = loadLocalSettings();
  const root = settings.governance_root;
  const vault = settings.vault_root;
  const mirror = settings.repos_root;
  if (root) {
    COMPANIES['MView'].root = String(root);
  } else {
    const bundleFiles = path.join(process.cwd(), 'Governance_Files');
    if (fs.existsSync(path.join(bundleFiles, '_GOVERNANCE'))) {
      COMPANIES['MView'].root = bundleFiles;
    }
  }
  if (vault) {
    COMPANIES['MView'].vault = String(vault);
  }
  if (mirror) {
    COMPANIES['MView'].mirror = String(mirror);
  }
}

resolveCompanyPaths();

export { resolveCompanyPaths };
