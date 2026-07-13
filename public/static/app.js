let CURRENT_COMPANY = null;
let CURRENT_VIEW = 'dashboard';
let WORKFLOW_STAGES = [];
let CURRENT_QUESTION_CONTEXT = null;
let CURRENT_QUESTION_DETAIL = null;
let CURRENT_QUESTION_SOURCE_VIEW = 'questions';
let CURRENT_REPO_QUESTION_DETAIL = null;
let CURRENT_REPO_QUESTION_SOURCE_VIEW = 'departments';
let CURRENT_MEMBER_QUESTION_DOCUMENT = null;
let CURRENT_MEMBER_QUESTION_SOURCE_VIEW = 'team';
let CURRENT_TEAM_MEMBER = null;
let CURRENT_DEPARTMENT = null;
let CURRENT_DEPARTMENT_CATALOG = [];
let CURRENT_MEETING_ID = null;
let CURRENT_MEETINGS_CACHE = [];
let CURRENT_NAV_COUNTS = {};
let CURRENT_GOVERNANCE_FILES = [];
let CURRENT_GOVERNANCE_FILE_CATEGORIES = [];
let CURRENT_GOVERNANCE_FILE_FILTER = 'all';
let CURRENT_GOVERNANCE_FILE_SEARCH = '';
let CURRENT_GOVERNANCE_FILE_PATH = null;
let CURRENT_GOVERNANCE_FILE_DETAILS = {};
const BRANDING = {
  MView: {
    full: 'Mineral View',
    short: 'MView',
    subtitle: 'Structured intake for data, repo, and governance work',
    navMark: '/static/brand/mview-logo.png?v=20260617b',
    heroVisual: '/static/brand/mview-logo-green.png?v=20260617b',
    heroWordmark: '/static/brand/mview-logo.png?v=20260617b',
    heroClass: 'mview',
    themeClass: 'company-mview',
    kicker: 'Mineral intelligence governance',
    copy: 'Move technical work from upload to reviewed findings, approved questions, and decision-ready governance updates with clear ownership at every step.',
  },
};

// ---------- In-UI modal (replaces native alert / confirm / prompt) ----------
function openGwModal({ kind = 'info', title = '', message = '', detail = '', okLabel = 'OK', cancelLabel = 'Cancel', showCancel = true, showInput = false, inputPlaceholder = '', inputDefault = '' } = {}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'gw-modal-backdrop';

    const inputHtml = showInput
      ? `<input type="text" class="gw-modal-input" placeholder="${(inputPlaceholder || '').replace(/"/g, '&quot;')}" value="${(inputDefault || '').replace(/"/g, '&quot;')}">`
      : '';
    const detailHtml = detail ? `<div class="gw-modal-detail">${escapeHtml(detail)}</div>` : '';
    const cancelHtml = showCancel
      ? `<button type="button" class="btn btn-outline-secondary btn-sm gw-modal-cancel">${escapeHtml(cancelLabel)}</button>`
      : '';

    backdrop.innerHTML = `
      <div class="gw-modal" role="dialog" aria-modal="true">
        <div class="gw-modal-header">
          <span class="gw-modal-icon ${kind}" aria-hidden="true">${kind === 'alert' ? '!' : kind === 'confirm' ? '?' : kind === 'prompt' ? '+' : 'i'}</span>
          <h3 class="gw-modal-title">${escapeHtml(title || (kind === 'alert' ? 'Heads up' : kind === 'confirm' ? 'Please confirm' : kind === 'prompt' ? 'Enter a value' : 'Notice'))}</h3>
        </div>
        <div class="gw-modal-body">
          <p class="gw-modal-message">${escapeHtml(message)}</p>
          ${detailHtml}
          ${inputHtml}
        </div>
        <div class="gw-modal-footer">
          ${cancelHtml}
          <button type="button" class="btn btn-primary btn-sm gw-modal-ok">${escapeHtml(okLabel)}</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('visible'));

    const inputEl = backdrop.querySelector('.gw-modal-input');
    const okBtn = backdrop.querySelector('.gw-modal-ok');
    const cancelBtn = backdrop.querySelector('.gw-modal-cancel');

    function close(result) {
      backdrop.classList.remove('visible');
      setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        document.removeEventListener('keydown', onKey);
      }, 180);
      resolve(result);
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(showInput ? null : false); }
      else if (e.key === 'Enter' && (!showInput || document.activeElement === inputEl || document.activeElement === okBtn)) {
        e.preventDefault();
        close(showInput ? (inputEl ? inputEl.value : '') : true);
      }
    }
    okBtn.addEventListener('click', () => close(showInput ? (inputEl ? inputEl.value : '') : true));
    if (cancelBtn) cancelBtn.addEventListener('click', () => close(showInput ? null : false));
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(showInput ? null : false); });
    document.addEventListener('keydown', onKey);

    setTimeout(() => { (inputEl || okBtn).focus(); }, 30);
  });
}

function showAlert(message, opts = {}) {
  return openGwModal({ kind: opts.kind || 'alert', title: opts.title || 'Heads up', message, detail: opts.detail || '', okLabel: opts.okLabel || 'OK', showCancel: false });
}
function showConfirm(message, opts = {}) {
  return openGwModal({ kind: 'confirm', title: opts.title || 'Please confirm', message, detail: opts.detail || '', okLabel: opts.okLabel || 'Yes, continue', cancelLabel: opts.cancelLabel || 'Cancel', showCancel: true });
}
function showPrompt(message, opts = {}) {
  return openGwModal({ kind: 'prompt', title: opts.title || 'Enter a value', message, detail: opts.detail || '', okLabel: opts.okLabel || 'Save', cancelLabel: opts.cancelLabel || 'Cancel', showCancel: true, showInput: true, inputPlaceholder: opts.placeholder || '', inputDefault: opts.defaultValue || '' });
}
// ----------------------------------------------------------------------------

const NAV_LAYOUTS = {
  default: [
    {
      label: 'Intake & Workflow',
      items: [
        { type: 'view', key: 'dashboard', label: 'Dashboard', countKey: 'dashboard' },
        { type: 'view', key: 'tasktracker', label: 'Task Tracker' },
        { type: 'view', key: 'board', label: 'Workflow Board', countKey: 'board' },
      ],
    },
    {
      label: 'People & Departments',
      items: [
        { type: 'view', key: 'team', label: 'Team Members', countKey: 'team' },
        { type: 'view', key: 'departments', label: 'Departments', countKey: 'departments' },
        { type: 'view', key: 'meetings', label: 'Meetings', countKey: 'meetings' },
        { type: 'view', key: 'questions', label: 'Priority Questions', countKey: 'questions' },
        { type: 'view', key: 'findings', label: 'Findings for Review', countKey: 'findings' },
      ],
    },
    {
      label: 'Knowledge & Repos',
      items: [
        { type: 'view', key: 'classification', label: 'Repo Classification', countKey: 'classification' },
        { type: 'view', key: 'decisions', label: 'Decision Log', countKey: 'decisions' },
        { type: 'view', key: 'glossary', label: 'Glossary', countKey: 'glossary' },
        { type: 'view', key: 'inventory', label: 'Repo Inventory', countKey: 'inventory' },
        { type: 'view', key: 'customers', label: 'Customer Relations', countKey: 'customers' },
        { type: 'view', key: 'aspects', label: 'Aspect Groups', countKey: 'aspect_groups' },
        { type: 'view', key: 'files', label: 'All Governance Files', countKey: 'files' },
        { type: 'view', key: 'git', label: 'Git Status', countKey: 'git' },
      ],
    },
    {
      label: 'AI & Control',
      items: [
        { type: 'view', key: 'exchange', label: 'AI Exchange', countKey: 'exchange' },
        { type: 'view', key: 'history', label: 'Version History' },
        { type: 'view', key: 'constitution', label: 'Constitution Gate', countKey: 'constitution' },
        { type: 'view', key: 'record', label: 'Voice Memo', countKey: 'record' },
      ],
    },
  ],
};

document.querySelectorAll('input[name="company"]').forEach((el) => {
  el.addEventListener('change', async (e) => {
    CURRENT_COMPANY = e.target.value;
    updateStatus();
    await refreshNavCounts();
    renderNavMenu();
    showView(CURRENT_VIEW);
  });
});

function setNavActive(view) {
  CURRENT_VIEW = view;
  renderNavMenu();
}

function updateStatus() {
  document.getElementById('statusBar').textContent = CURRENT_COMPANY ? `Company: ${CURRENT_COMPANY}` : 'No company selected';
  applyBranding();
  renderNavMenu();
}

function currentNavLayout() {
  return NAV_LAYOUTS.default;
}

function navItemBadge(item) {
  if (!item.countKey) return '';
  const value = CURRENT_NAV_COUNTS[item.countKey] || 0;
  return value > 0 ? `<span class="nav-count badge text-bg-secondary">${value}</span>` : '<span class="nav-count badge text-bg-secondary"></span>';
}

function navItemIsActive(item) {
  if (item.type === 'view') {
    return CURRENT_VIEW === item.key && !(CURRENT_VIEW === 'departments' && CURRENT_DEPARTMENT);
  }
  if (item.type === 'department') {
    return CURRENT_VIEW === 'departments' && CURRENT_DEPARTMENT === item.key;
  }
  return false;
}

function navItemAction(item) {
  if (item.type === 'department') {
    return `openDepartmentWorkspace('${escapeJs(item.key)}')`;
  }
  return `showView('${escapeJs(item.key)}')`;
}

function renderNavMenu() {
  const menu = document.getElementById('navMenu');
  if (!menu) return;
  const layout = currentNavLayout();
  menu.innerHTML = layout.map((group) => `
    <div class="nav-group-label">${escapeHtml(group.label)}</div>
    ${group.items.map((item) => `
      <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${navItemIsActive(item) ? 'active' : ''}" type="button" onclick="${navItemAction(item)}">
        <span>${escapeHtml(item.label)}</span>
        ${navItemBadge(item)}
      </button>
    `).join('')}
  `).join('');
}

function applyBranding() {
  const body = document.body;
  body.classList.remove('company-bold', 'company-mview');
  const mark = document.getElementById('navBrandMark');
  const subtitle = document.getElementById('brandSubtitle');
  if (!CURRENT_COMPANY || !BRANDING[CURRENT_COMPANY]) {
    mark.classList.add('d-none');
    subtitle.textContent = 'Workflow-first governance intake and approval';
    return;
  }
  const brand = BRANDING[CURRENT_COMPANY];
  body.classList.add(brand.themeClass);
  mark.src = brand.navMark;
  mark.alt = `${brand.full} mark`;
  mark.classList.remove('d-none');
  subtitle.textContent = brand.subtitle;
}

async function activateCompany(company) {
  const radio = document.querySelector(`input[name="company"][value="${company}"]`);
  if (radio) radio.checked = true;
  CURRENT_COMPANY = company;
  updateStatus();
  await refreshNavCounts();
  renderNavMenu();
  await showView('dashboard');
}

function prettyDepartmentName(value) {
  const text = Array.isArray(value) ? value.join(' / ') : String(value ?? '');
  return text
    .replaceAll('_', ' ')
    .replace(/\bBi\b/g, 'BI')
    .replace(/\bHr\b/g, 'HR')
    .replace(/\bIra\b/g, 'IRA')
    .replace(/\bOps\b/g, 'Ops')
    .replace(/\bCrm\b/g, 'CRM')
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
    .replace(/\bBi\b/g, 'BI')
    .replace(/\bHr\b/g, 'HR')
    .replace(/\bIra\b/g, 'IRA')
    .replace(/\bCrm\b/g, 'CRM');
}

function questionIsUnanswered(statusText) {
  const normalized = String(statusText ?? 'OPEN').trim().toUpperCase();
  return ![
    'ANSWERED',
    'APPROVED',
    'APPROVED_ANSWER',
    'READY_FOR_DEPARTMENT_USE',
    'READY_FOR_CONSTITUTION_QUEUE',
    'CLOSED_NO_ANSWER',
  ].includes(normalized);
}

function questionsUnanswered(statusText) {
  return questionIsUnanswered(statusText);
}

async function fetchJSON(url, opts) {
  const response = await fetch(url, { cache: 'no-store', ...(opts || {}) });
  if (!response.ok) throw new Error(`${url} -> ${response.status}`);
  return response.json();
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

async function loadStages() {
  if (!WORKFLOW_STAGES.length) {
    WORKFLOW_STAGES = await fetchJSON('/api/workflow/stages');
  }
  return WORKFLOW_STAGES;
}

async function refreshNavCounts() {
  if (!CURRENT_COMPANY) {
    CURRENT_NAV_COUNTS = {};
    document.querySelectorAll('.nav-count').forEach((el) => { el.textContent = ''; });
    return;
  }
  CURRENT_NAV_COUNTS = await fetchJSON(`/api/nav_counts?company=${CURRENT_COMPANY}`);
  renderNavMenu();
}

async function loadIntegrations() {
  if (!CURRENT_COMPANY) return null;
  return fetchJSON(`/api/integrations?company=${CURRENT_COMPANY}`);
}

function renderIntegrationCards(items, dashboardMode = false) {
  return items.map((item) => `
    <div class="integration-card ${dashboardMode ? 'dashboard' : ''}">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div class="integration-title">${escapeHtml(item.name)}</div>
        <span class="integration-badge ${item.connected ? 'integration-active' : 'integration-pending'}">${escapeHtml(item.status)}</span>
      </div>
      <div class="integration-detail">${escapeHtml(item.detail)}</div>
    </div>
  `).join('');
}

function summarizeRunStatus(runs, engineName) {
  const run = (runs || []).find((item) => item.engine === engineName);
  if (!run) return 'No runs yet';
  return `${run.status}${run.completed_at ? ` at ${run.completed_at.slice(11, 16)}` : ''}`;
}

async function refreshIntegrationSidebar() {
  const sidebar = document.getElementById('integrationSidebar');
  if (!sidebar) return;
  if (!CURRENT_COMPANY) {
    sidebar.innerHTML = 'Pick a company to load integration status.';
    return;
  }
  const integrations = await loadIntegrations();
  sidebar.innerHTML = renderIntegrationCards(integrations.items, false);
}

// Monotonic navigation token. Bumped on every showView so a slow render started
// for a previous page can detect it is stale and skip its write.
let VIEW_REQUEST = 0;
function viewRequestIsStale(req) {
  return req !== VIEW_REQUEST;
}

async function showView(view) {
  const reqId = ++VIEW_REQUEST;
  CURRENT_VIEW = view;
  if (view !== 'departments') {
    CURRENT_DEPARTMENT = null;
  }
  renderNavMenu();
  const main = document.getElementById('mainView');
  if (!CURRENT_COMPANY) {
    renderLandingView();
    return;
  }
  main.innerHTML = '<div class="text-muted">Loading...</div>';
  try {
    await loadStages();
    await refreshNavCounts();
    await refreshIntegrationSidebar();
    if (viewRequestIsStale(reqId)) return; // navigated away during the prefix
    if (view === 'dashboard') return renderDashboard();
    if (view === 'tasktracker') return renderTaskTracker();
    if (view === 'board') return renderBoard();
    if (view === 'team') return renderTeamMembers();
    if (view === 'departments') return renderDepartments();
    if (view === 'meetings') return renderMeetings();
    if (view === 'questions') return renderQuestions();
    if (view === 'question-detail') return renderQuestionWorkspace();
    if (view === 'repo-question-detail') return renderRepoQuestionWorkspace();
    if (view === 'member-question-document') return renderMemberQuestionDocument();
    if (view === 'findings') return renderFindings();
    if (view === 'classification') return renderClassification();
    if (view === 'decisions') return renderDecisions();
    if (view === 'glossary') return renderGlossary();
    if (view === 'inventory') return renderInventory();
    if (view === 'customers') return renderCustomers();
    if (view === 'aspects') return renderAspectGroups();
    if (view === 'files') return renderFiles();
    if (view === 'git') return renderGit();
    if (view === 'exchange') return renderExchanges();
    if (view === 'history') return renderHistory();
    if (view === 'constitution') return renderConstitution();
    if (view === 'record') return renderRecorder();
  } catch (error) {
    main.innerHTML = `<div class="alert alert-danger">Error: ${escapeHtml(error.message)}</div>`;
  }
}

function renderLandingView() {
  const main = document.getElementById('mainView');
  main.innerHTML = `
    <section class="hero-panel landing-hero">
      <div class="hero-grid landing-grid">
        <div>
          <span class="hero-kicker">Governance framework</span>
          <div class="hero-title">Structured intake, review, and approval.</div>
          <div class="hero-copy">Choose a company to enter its governed workspace. Team members, departments, repos, questions, and customer work all stay company-scoped.</div>
          <div class="hero-actions">
            <button class="btn btn-light btn-sm fw-semibold" type="button" onclick="activateCompany('MView')">Enter Mineral View</button>
          </div>
        </div>
        <div class="brand-visual landing">
          <img src="/static/brand/dashboard-hero.svg" alt="Governance Workbench hero">
        </div>
      </div>
    </section>
    <div class="row g-3">
      <div class="col-md-12">
        <div class="dash-card company-select-card">
          <div class="small text-uppercase text-muted">Company Workspace</div>
          <h3 class="mb-1">Mineral View</h3>
          <div class="small text-muted mb-3">Reservoir, land and title, operators, investor relations, and royalty accounting workflows.</div>
          <button class="btn btn-primary btn-sm" type="button" onclick="activateCompany('MView')">Open Mineral View workspace</button>
        </div>
      </div>
    </div>
    <div class="dash-card mt-3">
      <div class="fw-semibold mb-2">Governance principles</div>
      <div class="repo-chip-row">
        <span class="repo-chip">Company-scoped isolation</span>
        <span class="repo-chip">Findings before decisions</span>
        <span class="repo-chip">Questions routed to people</span>
        <span class="repo-chip">Commit gate stays separate</span>
        <span class="repo-chip">Constitution requires Ryan approval</span>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function escapeJs(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}

function getStageClass(index, currentIndex) {
  if (index < currentIndex) return 'done';
  if (index === currentIndex) return 'current';
  return '';
}

function miniStageRibbon(currentStage) {
  const currentIndex = WORKFLOW_STAGES.indexOf(currentStage);
  return `
    <div class="stage-ribbon compact">
      ${WORKFLOW_STAGES.map((stage, index) => `
        <span class="stage-pill ${getStageClass(index, currentIndex)}" title="${escapeHtml(stage)}">${index + 1}</span>
      `).join('')}
    </div>
  `;
}

function fullStageRibbon(currentStage) {
  const currentIndex = WORKFLOW_STAGES.indexOf(currentStage);
  return `
    <div class="stage-ribbon">
      ${WORKFLOW_STAGES.map((stage, index) => `
        <span class="stage-pill ${getStageClass(index, currentIndex)}">${index + 1}. ${escapeHtml(stage)}</span>
      `).join('')}
    </div>
  `;
}

function renderEngineBadges(aiEngines, stage) {
  const engines = (aiEngines || '').toLowerCase();
  const badges = [];
  if (engines.includes('claude') || engines.includes('both')) {
    badges.push(`<span class="engine-badge engine-claude">Claude: ${stageRank(stage) >= stageRank('AI Reviewed') ? 'done' : 'queued'}</span>`);
  }
  if (engines.includes('openai') || engines.includes('both')) {
    badges.push(`<span class="engine-badge engine-openai">OpenAI: ${stageRank(stage) >= stageRank('Decision Drafting') ? 'active' : 'queued'}</span>`);
  }
  badges.push(`<span class="engine-badge engine-github">GitHub: ${stageRank(stage) >= stageRank('Committed') ? 'dirty/history' : 'not ready'}</span>`);
  return `<div class="engine-panel">${badges.join('')}</div>`;
}

function stageRank(stage) {
  return WORKFLOW_STAGES.indexOf(stage);
}

function renderArtifactAction(path, label) {
  if (!path) return '';
  return `<button class="btn btn-sm btn-outline-secondary artifact-action" type="button" onclick="openArtifact('${escapeJs(path)}', '${escapeJs(label || 'Artifact')}')">${escapeHtml(label || 'Artifact')}</button>`;
}

function renderTeamCountPills(teamCounts) {
  if (!teamCounts || !teamCounts.length) return '<div class="text-muted small">No team-member question queues found yet.</div>';
  return `<div class="team-pill-row">${teamCounts.map((member) => `
    <button class="team-pill" type="button" onclick="scrollToQuestionGroup('${escapeJs(member.key)}')">
      ${escapeHtml(member.display_name)} <span class="team-pill-count">${member.unanswered_count}</span>
    </button>
  `).join('')}</div>`;
}

function renderExchangeStatusChip(status) {
  const cls = status === 'completed' ? 'status-approved'
    : status === 'failed' ? 'status-blocked'
    : status === 'running' ? 'status-waiting'
    : 'status-info';
  return `<span class="status-chip ${cls}">${escapeHtml(status)}</span>`;
}

function renderExchangeCard(exchange) {
  return `
    <div class="exchange-card">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">Exchange #${exchange.id} - ${escapeHtml(exchange.topic || '(no topic)')}</div>
          <div class="small text-muted">
            Intake #${exchange.intake_id} | ${escapeHtml(exchange.source_engine)} -> ${escapeHtml(exchange.target_engine)}
          </div>
        </div>
        ${renderExchangeStatusChip(exchange.status)}
      </div>
      <div class="small mt-2"><strong>Agreement:</strong> ${escapeHtml(exchange.agreement_status || 'Needs review')}</div>
      <div class="small"><strong>Next action:</strong> ${escapeHtml(exchange.next_action || 'Hold')}</div>
      <div class="small text-muted mt-2">${escapeHtml((exchange.target_output || exchange.error_text || '').slice(0, 280))}</div>
      <div class="mt-2 d-flex gap-2 flex-wrap">
        ${exchange.target_output_path ? renderArtifactAction(exchange.target_output_path, 'Open exchange output') : ''}
        ${exchange.source_output_path ? renderArtifactAction(exchange.source_output_path, 'Open source output') : ''}
      </div>
    </div>
  `;
}

function renderInlineArtifactLink(link) {
  if (!link || !link.ref) return '';
  if (link.kind !== 'draft' && link.kind !== 'commit_review') return '';
  return `<button class="btn btn-link btn-sm p-0 ms-1 align-baseline" type="button" onclick="openArtifact('${escapeJs(link.ref)}', '${escapeJs(link.kind)}')">open</button>`;
}

function nextRequiredAction(intake) {
  const stage = intake.stage;
  if (stage === 'Uploaded' || stage === 'Stored') return 'Parser should run next';
  if (stage === 'Parsed') return 'AI review should run next';
  if (stage === 'AI Reviewed') return 'Review findings or route questions';
  if (stage === 'Findings Pending') return 'Approve, reject, refine, or convert findings';
  if (stage === 'Employee Questions Pending') return 'Collect employee answers';
  if (stage === 'Ryan Questions Pending' || stage === 'Awaiting Ryan Approval') return 'Ryan approval required';
  if (stage === 'Decision Drafting') return 'Draft D-entry and governance update';
  if (stage === 'Draft Governance Updated') return 'Open commit gate';
  if (stage === 'Awaiting Commit Approval') return 'Review diff and approve commit';
  if (stage === 'Committed') return 'Push to GitHub';
  if (stage === 'Pushed') return 'Assess constitution eligibility';
  if (stage === 'Constitution Candidate') return 'Ryan constitution approval required';
  if (stage === 'Constitution Approved') return 'Complete';
  return 'Review intake';
}

function renderQuickIntakeSection() {
  return `
    <div class="quick-intake">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h3 class="mb-1">Drop today's work here</h3>
          <div class="small text-muted">Uploads create intake records first. Nothing commits until every required gate is approved.</div>
        </div>
        <button class="btn btn-outline-primary btn-sm" type="button" onclick="showView('intake')">Open full intake form</button>
      </div>
      ${renderIntakeForm('quick')}
      <div id="quickIntakeStatus" class="mt-2"></div>
    </div>
  `;
}

function showProcessing(message) {
  hideProcessing();
  const el = document.createElement('div');
  el.id = 'gwProcessing';
  el.className = 'gw-processing';
  const sp = document.createElement('span'); sp.className = 'gw-spinner';
  const tx = document.createElement('span'); tx.textContent = message;
  el.appendChild(sp); el.appendChild(tx);
  document.body.appendChild(el);
}
function hideProcessing() {
  const el = document.getElementById('gwProcessing');
  if (el) el.remove();
}

function toggleSectionFullscreen(btn) {
  const panel = btn.closest('.gw-expandable');
  if (!panel) return;
  const entering = !panel.classList.contains('gw-fullscreen');
  panel.classList.toggle('gw-fullscreen', entering);
  document.body.classList.toggle('gw-fullscreen-open', entering);
  const toggle = panel.querySelector('[data-fs-toggle]');
  if (toggle) toggle.textContent = entering ? 'Exit full view' : 'Full view';
  let backdrop = document.getElementById('gwFsBackdrop');
  if (entering) {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'gwFsBackdrop';
      backdrop.className = 'gw-fs-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.onclick = () => toggleSectionFullscreen(btn);
    panel.scrollTop = 0;
    const onKey = (event) => {
      if (event.key === 'Escape') { toggleSectionFullscreen(btn); }
    };
    document.addEventListener('keydown', onKey);
    panel._fsKeyHandler = onKey;
  } else {
    if (backdrop) backdrop.remove();
    if (panel._fsKeyHandler) {
      document.removeEventListener('keydown', panel._fsKeyHandler);
      panel._fsKeyHandler = null;
    }
  }
}

function showToast(message, type = 'info') {
  const t = document.createElement('div');
  t.className = `app-toast app-toast-${type}`;
  t.textContent = message;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, 3200);
}

function showConfirmDialog(message, options = {}) {
  const { title = 'Please confirm', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = options;
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'app-modal-overlay';
    overlay.innerHTML = `
      <div class="app-modal" role="dialog" aria-modal="true">
        <div class="app-modal-title">${escapeHtml(title)}</div>
        <div class="app-modal-body">${escapeHtml(message)}</div>
        <div class="app-modal-actions">
          <button type="button" class="btn btn-outline-secondary btn-sm" data-act="cancel">${escapeHtml(cancelLabel)}</button>
          <button type="button" class="btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>`;
    const done = (val) => { overlay.remove(); document.removeEventListener('keydown', onKey); resolve(val); };
    const onKey = (e) => { if (e.key === 'Escape') done(false); else if (e.key === 'Enter') done(true); };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) return done(false);
      const act = e.target.getAttribute('data-act');
      if (act === 'ok') done(true);
      else if (act === 'cancel') done(false);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
  });
}

function showPromptDialog(message, options = {}) {
  const { title = 'Enter a value', defaultValue = '', confirmLabel = 'OK', cancelLabel = 'Cancel', placeholder = '' } = options;
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'app-modal-overlay';
    overlay.innerHTML = `
      <div class="app-modal" role="dialog" aria-modal="true">
        <div class="app-modal-title">${escapeHtml(title)}</div>
        <div class="app-modal-body">${escapeHtml(message)}</div>
        <textarea class="form-control form-control-sm mt-2" rows="3" placeholder="${escapeHtml(placeholder)}">${escapeHtml(defaultValue)}</textarea>
        <div class="app-modal-actions">
          <button type="button" class="btn btn-outline-secondary btn-sm" data-act="cancel">${escapeHtml(cancelLabel)}</button>
          <button type="button" class="btn btn-primary btn-sm" data-act="ok">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>`;
    const ta = overlay.querySelector('textarea');
    const done = (val) => { overlay.remove(); resolve(val); };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) return done(null);
      const act = e.target.getAttribute('data-act');
      if (act === 'ok') done((ta.value || '').trim());
      else if (act === 'cancel') done(null);
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.classList.add('show'); ta.focus(); });
  });
}

function renderOpenAiActivationPanel(integrations) {
  const openai = (integrations.items || []).find((item) => item.name === 'OpenAI Codex');
  const connected = !!(openai && openai.connected);
  const masked = (openai && openai.masked_key) || '';
  const model = (openai && openai.model) || 'gpt-5';
  const inputForm = `
    <div class="row mt-3">
      <div class="col-md-7">
        <label class="form-label small">OpenAI API key</label>
        <input id="openAiApiKey" type="password" class="form-control form-control-sm" placeholder="sk-...">
      </div>
      <div class="col-md-3">
        <label class="form-label small">Model</label>
        <input id="openAiModel" type="text" class="form-control form-control-sm" value="${escapeHtml(model)}">
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-success btn-sm w-100" type="button" onclick="saveOpenAiSettings()">Save</button>
      </div>
    </div>
    <div id="openAiSaveStatus" class="small mt-2 text-muted">The key is stored locally in the Governance UI settings on this machine.</div>`;

  if (connected) {
    return `
      <div class="dash-card mt-3">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <h3 class="mb-1">OpenAI Codex</h3>
            <div class="small text-muted">Used for transcript intake, question drafting, voice memo, and AI Exchange.</div>
          </div>
          <span class="integration-badge integration-active">Connected</span>
        </div>
        <div class="row mt-3 align-items-end">
          <div class="col-md-7">
            <label class="form-label small">Saved API key</label>
            <div class="form-control form-control-sm" style="font-family:monospace;background:#f5f7fa">${escapeHtml(masked || '************')}</div>
          </div>
          <div class="col-md-3">
            <label class="form-label small">Model</label>
            <div class="form-control form-control-sm" style="background:#f5f7fa">${escapeHtml(model)}</div>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-primary btn-sm w-100" type="button" onclick="toggleOpenAiUpdate()">Update key</button>
          </div>
        </div>
        <div class="mt-2">
          <button class="btn btn-link btn-sm text-danger p-0" type="button" onclick="removeOpenAiKey()">Remove key</button>
        </div>
        <div id="openAiUpdateForm" class="d-none">${inputForm}</div>
      </div>`;
  }
  return `
    <div class="dash-card mt-3">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h3 class="mb-1">Activate OpenAI Codex</h3>
          <div class="small text-muted">Store a local API key for this machine so transcript intake, question drafting, and AI Exchange can use OpenAI directly from the workbench.</div>
        </div>
        <span class="integration-badge integration-pending">Awaiting API key</span>
      </div>
      ${inputForm}
    </div>
  `;
}

function toggleOpenAiUpdate() {
  const form = document.getElementById('openAiUpdateForm');
  if (form) form.classList.toggle('d-none');
}

async function removeOpenAiKey() {
  const ok = await showConfirmDialog('This removes the saved OpenAI API key from this machine. You can add it again anytime.', { title: 'Remove API key?', confirmLabel: 'Remove key', danger: true });
  if (!ok) return;
  try {
    const response = await fetch('/api/openai_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remove: true }),
    });
    if (response.ok) {
      await refreshIntegrationSidebar();
      await refreshNavCounts();
      await renderDashboard();
    } else {
      showToast('Could not remove the key. Please try again.', 'error');
    }
  } catch (error) {
    showToast(`Remove error: ${error.message || error}`, 'error');
  }
}

function renderHeroSection(overview, intakes) {
  const brand = BRANDING[CURRENT_COMPANY];
  const blocked = intakes.filter((item) => item.stage === 'Employee Questions Pending' || item.stage === 'Ryan Questions Pending' || item.stage === 'Awaiting Ryan Approval').length;
  return `
    <section class="hero-panel">
      <div class="hero-grid">
        <div>
          <span class="hero-kicker">${escapeHtml(brand.kicker)}</span>
          <div class="hero-title">${escapeHtml(brand.full)} Governance Workbench</div>
          <div class="hero-copy">${escapeHtml(brand.copy)}</div>
          <div class="hero-actions">
            <button class="btn btn-light btn-sm fw-semibold" type="button" onclick="showView('board')">Open workflow board</button>
            <button class="btn btn-outline-light btn-sm" type="button" onclick="showView('classification')">Review repo categories</button>
          </div>
          <div class="hero-metrics mt-4">
            <div class="hero-metric">
              <div class="hero-metric-label">Mirror repos</div>
              <div class="hero-metric-value">${overview.counts.mirror_repos}</div>
            </div>
            <div class="hero-metric">
              <div class="hero-metric-label">Open intakes</div>
              <div class="hero-metric-value">${overview.counts.intakes_total}</div>
            </div>
            <div class="hero-metric">
              <div class="hero-metric-label">Blocked items</div>
              <div class="hero-metric-value">${blocked}</div>
            </div>
          </div>
        </div>
        <div class="brand-visual ${brand.heroClass}">
          <img src="/static/brand/dashboard-hero.svg" alt="Governance framework hero">
        </div>
      </div>
    </section>
  `;
}

function renderDepartmentCard(department, opts = {}) {
  const compact = opts.compact || false;
  return `
    <div class="department-card ${compact ? 'compact' : ''}">
      <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
        <div>
          <div class="department-title">${escapeHtml(department.name)}</div>
          <div class="small text-muted mt-1">${escapeHtml(department.description || '')}</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <span class="badge text-bg-light">${department.member_count} team</span>
          <span class="badge text-bg-light">${department.repo_count} repos</span>
        </div>
      </div>
      ${department.member_names && department.member_names.length ? `
        <div class="small text-muted mt-3 mb-1">Team members</div>
        <div class="repo-chip-row">
          ${department.member_names.map((name) => `<span class="repo-chip">${escapeHtml(name)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="small text-muted mt-3 mb-1">Likely repos</div>
      <div class="repo-chip-row">
        ${(department.repos || []).length ? department.repos.map((repo) => `<span class="repo-chip">${escapeHtml(repo)}</span>`).join('') : '<span class="text-muted small">No repos mapped yet.</span>'}
      </div>
      <div class="mt-3">
        <button class="btn btn-sm btn-outline-primary" type="button" onclick="openDepartmentWorkspace('${escapeJs(department.key)}')">Open related workspace</button>
      </div>
    </div>
  `;
}

function renderDepartmentDirectory(departmentData) {
  return `
    <div class="dash-card mt-3">
      <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-3">
        <div>
          <h3 class="mb-1">Department Directory</h3>
          <div class="small text-muted">Use departments as the main operating map underneath each company. Team Members, Customer Relations, Questions, and Repos all hang off this structure.</div>
        </div>
        <button class="btn btn-sm btn-outline-primary" type="button" onclick="showView('departments')">Open all departments</button>
      </div>
      <div class="row g-3">
        <div class="col-lg-4">
          <div class="directory-column">
            <div class="directory-column-title">Governance & System</div>
            <div class="directory-links">
              <button class="directory-link" type="button" onclick="showView('team')">Team Members</button>
              <button class="directory-link" type="button" onclick="showView('questions')">Priority Questions</button>
              <button class="directory-link" type="button" onclick="showView('findings')">Findings for Review</button>
              <button class="directory-link" type="button" onclick="showView('classification')">Repo Classification</button>
              <button class="directory-link" type="button" onclick="showView('aspects')">Aspect Groups</button>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="directory-column">
            <div class="directory-column-title">${escapeHtml(CURRENT_COMPANY)} departments</div>
            <div class="directory-card-stack">
              ${departmentData.company_specific.map((dept) => renderDepartmentCard(dept, { compact: true })).join('')}
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="directory-column">
            <div class="directory-column-title">Shared departments</div>
            <div class="directory-card-stack">
              ${departmentData.shared.map((dept) => renderDepartmentCard(dept, { compact: true })).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderIntakeForm(prefix) {
  return `
    <div class="row">
      <div class="col-md-4">
        <label class="form-label small">Employee</label>
        <select id="${prefix}Employee" class="form-select form-select-sm"></select>
      </div>
      <div class="col-md-4">
        <label class="form-label small">Source type</label>
        <select id="${prefix}Source" class="form-select form-select-sm">
          <option value="document">Document</option>
          <option value="repo_scan">Repo scan</option>
          <option value="transcript">Transcript</option>
          <option value="voice_memo">Voice memo</option>
          <option value="screenshot">Screenshot</option>
          <option value="mixed">Mixed intake</option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label small">AI routing</label>
        <select id="${prefix}AI" class="form-select form-select-sm">
          <option value="Claude">Claude</option>
          <option value="OpenAI">OpenAI</option>
          <option value="Both">Both</option>
        </select>
      </div>
    </div>
    <div class="mt-2">
      <label class="form-label small">What is this work about?</label>
      <input type="text" id="${prefix}Note" class="form-control form-control-sm" placeholder="Example: Christos review package, repo findings batch, typed transcript">
    </div>
    <div id="${prefix}Dropzone" class="dropzone mt-3">
      <div class="dropzone-icon">Drop files here (or click to choose)</div>
      <div class="small text-muted">Documents, zips, transcripts, screenshots, or mixed work packages</div>
      <input type="file" id="${prefix}FileInput" multiple class="d-none">
    </div>
    <div id="${prefix}Staged" class="small text-muted mt-2">No files selected yet.</div>
    <div class="mt-2">
      <button type="button" id="${prefix}CreateBtn" class="btn btn-primary btn-sm" disabled>Create intake</button>
      <span class="small text-muted ms-2">Fill the fields, choose your file(s), then click Create intake.</span>
    </div>
  `;
}

let LAST_TEAM_MEMBERS = [];

function rosterForCurrentCompany() {
  if (CURRENT_COMPANY === 'MView') return MVIEW_TEAM_ROSTER;
  return null;
}

function rosterEmployeeKeys() {
  if (CURRENT_COMPANY === 'MView' && LAST_TEAM_MEMBERS.length) {
    return LAST_TEAM_MEMBERS.map((m) => m.key).filter(Boolean);
  }
  const roster = rosterForCurrentCompany();
  if (!roster) return null;
  const seen = new Set();
  const keys = [];
  roster.forEach((entry) => {
    const key = (entry.display_name || '').trim().replace(/\s+/g, '_');
    if (!key || seen.has(key)) return;
    seen.add(key);
    keys.push(key);
  });
  return keys;
}

function rosterAttendeeList() {
  if (CURRENT_COMPANY === 'MView' && LAST_TEAM_MEMBERS.length) {
    return LAST_TEAM_MEMBERS.map((m) => ({ key: m.key, display_name: m.display_name, role: m.role || '' }));
  }
  const roster = rosterForCurrentCompany();
  if (!roster) return null;
  const seen = new Set();
  const list = [];
  roster.forEach((entry) => {
    const name = (entry.display_name || '').trim();
    const key = name.replace(/\s+/g, '_');
    if (!key || seen.has(key)) return;
    seen.add(key);
    list.push({ key, display_name: name, role: entry.role || '' });
  });
  return list;
}

function fileBaseName(pathValue) {
  if (!pathValue) return '';
  return String(pathValue).split(/[\\/]/).filter(Boolean).slice(-1)[0] || String(pathValue);
}

function showSelectedMeetingFile(input) {
  const el = document.getElementById('meetingNotesFileName');
  if (!el) return;
  if (input && input.files && input.files.length) {
    el.innerHTML = `<span class="meeting-notes-file-icon" aria-hidden="true">DOC</span> <span class="meeting-file-chosen-name">${escapeHtml(input.files[0].name)}</span>`;
    el.classList.add('has-file');
  } else {
    el.textContent = 'No file chosen yet.';
    el.classList.remove('has-file');
  }
}

function meetingNotesFileBlock(meeting) {
  const path = meeting && meeting.notes_file_path;
  if (!path) {
    return `<div class="meeting-notes-file empty"><span class="meeting-notes-file-label">Notes file</span><span class="text-muted">No notes file attached.</span></div>`;
  }
  const name = fileBaseName(path);
  return `
    <div class="meeting-notes-file">
      <span class="meeting-notes-file-label">Notes file</span>
      <button type="button" class="meeting-notes-file-name" title="Open ${escapeHtml(path)}" onclick="openArtifact('${escapeJs(path)}', '${escapeJs(name)}')">
        <span class="meeting-notes-file-icon" aria-hidden="true">DOC</span>
        <span class="meeting-notes-file-text">${escapeHtml(name)}</span>
      </button>
    </div>
  `;
}

async function initIntakeForm(prefix) {
  const rosterKeys = rosterEmployeeKeys();
  const employees = rosterKeys || await fetchJSON(`/api/employees?company=${CURRENT_COMPANY}`);
  const employeeSelect = document.getElementById(`${prefix}Employee`);
  employeeSelect.innerHTML = `<option value="">- (org-wide / no employee) -</option>${employees.map((employee) => `<option value="${escapeHtml(employee)}">${escapeHtml(prettyName(employee))}</option>`).join('')}`;

  const dropzone = document.getElementById(`${prefix}Dropzone`);
  const input = document.getElementById(`${prefix}FileInput`);
  const staged = document.getElementById(`${prefix}Staged`);
  const createBtn = document.getElementById(`${prefix}CreateBtn`);
  const noteInput = document.getElementById(`${prefix}Note`);
  if (!dropzone || !input) return;
  if (!window.__stagedIntake) window.__stagedIntake = {};

  // Create intake requires an employee, a task description (note), and file(s).
  function intakeFormValid() {
    const files = (window.__stagedIntake && window.__stagedIntake[prefix]) || [];
    const employee = (employeeSelect && employeeSelect.value || '').trim();
    const note = (noteInput && noteInput.value || '').trim();
    return files.length > 0 && !!employee && !!note;
  }

  function refreshCreateEnabled() {
    if (createBtn) createBtn.disabled = !intakeFormValid();
  }

  function setStaged(fileList) {
    const files = Array.from(fileList || []);
    window.__stagedIntake[prefix] = files;
    if (staged) {
      staged.innerHTML = files.length
        ? `<strong>${files.length} file(s) ready:</strong> ${files.map((f) => escapeHtml(f.name)).join(', ')}`
        : 'No files selected yet.';
    }
    refreshCreateEnabled();
  }

  dropzone.addEventListener('click', () => input.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('over');
    setStaged(e.dataTransfer.files);
  });
  input.addEventListener('change', (e) => setStaged(e.target.files));
  if (employeeSelect) employeeSelect.addEventListener('change', refreshCreateEnabled);
  if (noteInput) noteInput.addEventListener('input', refreshCreateEnabled);
  refreshCreateEnabled();

  if (createBtn) {
    createBtn.addEventListener('click', async () => {
      const files = (window.__stagedIntake && window.__stagedIntake[prefix]) || [];
      if (!intakeFormValid()) {
        if (!files.length) showToast('Please attach at least one file.', 'error');
        else if (!(employeeSelect && employeeSelect.value)) showToast('Please select an employee.', 'error');
        else showToast('Please enter a task description.', 'error');
        return;
      }
      createBtn.disabled = true;
      await uploadFiles(prefix, files);
      window.__stagedIntake[prefix] = [];
    });
  }
}

async function uploadFiles(prefix, fileList) {
  if (!fileList || !fileList.length) return;
  const status = document.getElementById(`${prefix}IntakeStatus`);
  status.innerHTML = `<div class="alert alert-info">Uploading ${fileList.length} file(s)...</div>`;
  const form = new FormData();
  form.append('company', CURRENT_COMPANY);
  form.append('employee', document.getElementById(`${prefix}Employee`).value);
  form.append('source_type', document.getElementById(`${prefix}Source`).value);
  form.append('ai_engines', document.getElementById(`${prefix}AI`).value);
  form.append('note', document.getElementById(`${prefix}Note`).value);
  for (const file of fileList) form.append('files', file);
  try {
    const response = await fetch('/api/intake', { method: 'POST', body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const failed = (payload.failed_files || []).map((f) => `<li><code>${escapeHtml(f.filename)}</code> — ${escapeHtml(f.reason || 'unknown reason')}</li>`).join('');
      const detail = failed ? `<ul class="mb-0 mt-1 small">${failed}</ul>` : '';
      status.innerHTML = `<div class="alert alert-danger">${escapeHtml(payload.error || 'Upload failed.')}${detail}</div>`;
      await showAlert(payload.error || 'Upload failed.', {
        title: 'Intake upload failed',
        kind: 'alert',
        detail: (payload.failed_files || []).map((f) => `${f.filename}: ${f.reason}`).join('\n') || 'No files were saved.',
      });
      return;
    }
    const savedFiles = payload.saved_files || [];
    const failedFiles = payload.failed_files || [];
    const failedBlock = failedFiles.length
      ? `<div class="mt-2 small text-danger"><strong>${failedFiles.length} file(s) skipped:</strong><ul class="mb-0">${failedFiles.map((f) => `<li><code>${escapeHtml(f.filename)}</code> — ${escapeHtml(f.reason || 'locked or unwritable')}</li>`).join('')}</ul></div>`
      : '';
    status.innerHTML = `
      <div class="alert ${failedFiles.length ? 'alert-warning' : 'alert-success'}">
        Intake #${payload.intake_id} created with ${savedFiles.length} file(s).<br>
        Saved to <code>${escapeHtml(payload.saved_to)}</code><br>
        Next step: parser and AI review routing.
        ${failedBlock}
      </div>
    `;
    await refreshNavCounts();
    showToast(`Intake #${payload.intake_id} created — continue on the Workflow Board.`, 'success');
    showView('board');
  } catch (error) {
    status.innerHTML = `<div class="alert alert-danger">Upload failed: ${escapeHtml(error.message)}</div>`;
    await showAlert('The intake upload could not complete.', { title: 'Upload failed', kind: 'alert', detail: error.message });
  }
}

function renderIntakeRow(intake) {
  return `
    <div class="dash-card intake-card" onclick="openIntake(${intake.id})">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">#${intake.id} - ${escapeHtml(intake.note || '(no note)')}</div>
          <div class="small text-muted">
            ${intake.employee ? `Employee: ${escapeHtml(prettyName(intake.employee))} | ` : ''}
            Source: ${escapeHtml(intake.source_type || 'document')} | Files: ${intake.file_count} | Stage: <strong>${escapeHtml(intake.stage)}</strong>
          </div>
        </div>
        <span class="status-chip ${statusChipClass(intake.stage)}">${escapeHtml(intake.stage)}</span>
      </div>
      ${renderEngineBadges(intake.ai_engines, intake.stage)}
      <div class="small mt-2"><strong>Next action:</strong> ${escapeHtml(nextRequiredAction(intake))}</div>
      ${intake.blocker ? `<div class="small text-danger mt-1"><strong>Blocked:</strong> ${escapeHtml(intake.blocker)}</div>` : ''}
      ${miniStageRibbon(intake.stage)}
      <div class="mt-2">
        <button class="btn btn-sm btn-primary" type="button" onclick="event.stopPropagation(); openIntake(${intake.id})">Open / process this intake &rarr;</button>
      </div>
    </div>
  `;
}

function statusChipClass(stage) {
  if (stage.includes('Employee Questions')) return 'status-blocked';
  if (stage.includes('Ryan')) return 'status-blocked';
  if (stage.includes('Commit')) return 'status-waiting';
  if (stage.includes('Constitution')) return 'status-special';
  if (stage === 'Pushed' || stage === 'Committed') return 'status-approved';
  return 'status-info';
}

async function renderDashboard() {
  const _r = VIEW_REQUEST;
  const overview = await fetchJSON(`/api/overview?company=${CURRENT_COMPANY}`);
  const intakes = await fetchJSON(`/api/intake?company=${CURRENT_COMPANY}`);
  const integrations = await loadIntegrations();
  const questionData = await fetchJSON(`/api/questions?company=${CURRENT_COMPANY}`);
  const departmentData = await fetchJSON(`/api/departments?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  const blockedOnEmployee = intakes.filter((i) => i.stage === 'Employee Questions Pending').length;
  const blockedOnRyan = intakes.filter((i) => i.stage === 'Ryan Questions Pending' || i.stage === 'Awaiting Ryan Approval').length;
  const readyCommit = intakes.filter((i) => i.stage === 'Awaiting Commit Approval').length;
  const constitutionCandidates = intakes.filter((i) => i.stage === 'Constitution Candidate').length;

  document.getElementById('mainView').innerHTML = `
    ${renderHeroSection(overview, intakes)}
    <h2>Dashboard - ${escapeHtml(overview.company_full)}</h2>
    <div class="small text-muted mb-3">GitHub account: <code>${escapeHtml(overview.gh_account)}</code></div>

    <div class="row mt-4">
      <div class="col-md-3"><div class="dash-card stat-card"><div class="label">Total intakes</div><div class="value">${overview.counts.intakes_total}</div></div></div>
      <div class="col-md-3"><div class="dash-card stat-card alert-bold"><div class="label">Blocked on Employee</div><div class="value">${blockedOnEmployee}</div></div></div>
      <div class="col-md-3"><div class="dash-card stat-card alert-bold"><div class="label">Blocked on Ryan</div><div class="value">${blockedOnRyan}</div></div></div>
      <div class="col-md-3"><div class="dash-card stat-card"><div class="label">Ready to Commit</div><div class="value">${readyCommit}</div></div></div>
    </div>

    <div class="row">
      <div class="col-md-3"><div class="dash-card stat-card"><div class="label">Constitution Candidates</div><div class="value">${constitutionCandidates}</div></div></div>
      <div class="col-md-3"><div class="dash-card stat-card"><div class="label">Departments</div><div class="value">${overview.counts.departments}</div><div class="small text-muted mt-1">${overview.department_summary.shared} shared / ${overview.department_summary.company_specific} ${escapeHtml(CURRENT_COMPANY)}</div></div></div>
      <div class="col-md-3"><div class="dash-card stat-card"><div class="label">Employees</div><div class="value">${overview.counts.employees}</div></div></div>
      <div class="col-md-3"><div class="dash-card stat-card"><div class="label">Code repos (mirror)</div><div class="value">${overview.counts.mirror_repos}</div></div></div>
    </div>

    <div class="row">
      <div class="col-md-3"><div class="dash-card stat-card"><div class="label">Uploaded files</div><div class="value">${overview.counts.intake_files_total}</div></div></div>
      <div class="col-md-9">
        <div class="dash-card">
          <div class="label mb-2">Team question queues</div>
          ${renderTeamCountPills(questionData.team_counts)}
        </div>
      </div>
    </div>

    <div class="row mt-2">
      <div class="col-md-8">
        <h3>Stage distribution</h3>
        <div class="stage-ribbon">
          ${WORKFLOW_STAGES.map((stage) => {
            const count = overview.by_stage[stage] || 0;
            return `<span class="stage-pill ${count > 0 ? 'done' : ''}">${escapeHtml(stage)}: <strong>${count}</strong></span>`;
          }).join('')}
        </div>
      </div>
      <div class="col-md-4">
        <div class="dash-card queue-card-grid">
          <button class="queue-card" onclick="showBoardFiltered('Employee Questions Pending')"><span>Blocked on Employee</span><strong>${blockedOnEmployee}</strong></button>
          <button class="queue-card" onclick="showBoardFiltered('Ryan Questions Pending')"><span>Blocked on Ryan</span><strong>${blockedOnRyan}</strong></button>
          <button class="queue-card" onclick="showBoardFiltered('Awaiting Commit Approval')"><span>Ready to Commit</span><strong>${readyCommit}</strong></button>
          <button class="queue-card" onclick="showBoardFiltered('Constitution Candidate')"><span>Constitution Candidates</span><strong>${constitutionCandidates}</strong></button>
        </div>
      </div>
    </div>

    <h3 class="mt-3">Integration status</h3>
    <div class="row">
      ${integrations.items.map((item) => `
        <div class="col-md-4">
          ${renderIntegrationCards([item], true)}
        </div>
      `).join('')}
    </div>
    ${renderOpenAiActivationPanel(integrations)}

    ${renderDepartmentDirectory(departmentData)}

    <h3 class="mt-3">Recent intakes</h3>
    ${intakes.slice(0, 10).map(renderIntakeRow).join('') || '<div class="text-muted">No intakes yet.</div>'}
  `;
}

// ============================================================================
// Task Tracker
// Captures a task for a team member and stores it as a Markdown note under
// Governance_Files/task_tracker/. Reuses the existing employee source, toast,
// card, and button styles. Self-contained — no existing view is affected.
// ============================================================================

// Temporary fallback list, used only if the employee source returns nothing.
// Replace once a richer employee source is wired in.
const TASK_TRACKER_FALLBACK_EMPLOYEES = ['Ryan', 'John', 'Aboli', 'Pragati', 'Pooja'];

function taskTrackerEmployeeLabel(raw) {
  return String(raw || '').replace(/_+/g, ' ').trim();
}

async function renderTaskTracker() {
  const _r = VIEW_REQUEST;
  const main = document.getElementById('mainView');
  let employees = [];
  try {
    employees = await fetchJSON(`/api/employees?company=${CURRENT_COMPANY}`);
  } catch (error) {
    employees = [];
  }
  if (viewRequestIsStale(_r)) return;
  if (!Array.isArray(employees) || !employees.length) {
    employees = TASK_TRACKER_FALLBACK_EMPLOYEES;
  }
  // Task Tracker only: hide Ryan Cochran and Sachin Shinde from the dropdown.
  const TASK_TRACKER_EXCLUDED = ['ryancochran', 'sachinshinde'];
  employees = employees.filter(
    (emp) => !TASK_TRACKER_EXCLUDED.includes(String(emp || '').toLowerCase().replace(/[^a-z]/g, '')),
  );

  const options = employees
    .map((emp) => `<option value="${escapeHtml(emp)}">${escapeHtml(taskTrackerEmployeeLabel(emp))}</option>`)
    .join('');

  main.innerHTML = `
    <h2>Task Tracker</h2>
    <div class="small text-muted mb-3">Capture a task for a team member. Saved as a Markdown note under <code>Governance_Files/task_tracker/</code>.</div>
    <div class="dash-card task-tracker-card">
      <div class="mb-3">
        <label class="form-label fw-semibold" for="ttEmployee">Employee Name</label>
        <select class="form-select" id="ttEmployee">
          <option value="">Select Employee</option>
          ${options}
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Task Description</label>
        <div class="task-editor">
          <div class="task-editor-toolbar" id="ttToolbar">
            <button type="button" class="task-tool" data-cmd="bold" title="Bold"><strong>B</strong></button>
            <button type="button" class="task-tool" data-cmd="italic" title="Italic"><em>I</em></button>
            <button type="button" class="task-tool" data-cmd="underline" title="Underline"><span style="text-decoration:underline">U</span></button>
            <button type="button" class="task-tool" data-cmd="strikeThrough" title="Strikethrough"><span style="text-decoration:line-through">S</span></button>
            <span class="task-tool-sep"></span>
            <button type="button" class="task-tool" data-cmd="insertUnorderedList" title="Bullet list">&bull;&nbsp;List</button>
            <button type="button" class="task-tool" data-cmd="insertOrderedList" title="Numbered list">1.&nbsp;List</button>
            <button type="button" class="task-tool" data-cmd="quote" title="Quote">&ldquo;&nbsp;Quote</button>
            <span class="task-tool-sep"></span>
            <button type="button" class="task-tool" data-cmd="link" title="Insert link">&#128279;&nbsp;Link</button>
            <button type="button" class="task-tool" data-cmd="code" title="Inline code">&lt;/&gt;</button>
          </div>
          <div class="task-editor-body is-empty" id="ttEditor" contenteditable="true"
               data-placeholder="Type task details..." role="textbox" aria-multiline="true"></div>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-primary" id="ttSaveBtn" type="button" disabled onclick="saveTaskTracker()">Save Task</button>
        <span class="small text-muted" id="ttStatus"></span>
      </div>
    </div>
  `;
  initTaskTrackerEditor();
}

function initTaskTrackerEditor() {
  const emp = document.getElementById('ttEmployee');
  const editor = document.getElementById('ttEditor');
  const toolbar = document.getElementById('ttToolbar');
  if (!emp || !editor || !toolbar) return;
  toolbar.querySelectorAll('.task-tool').forEach((btn) => {
    // Keep the editor selection intact when a toolbar button is pressed.
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', () => taskEditorExec(btn.dataset.cmd));
  });
  emp.addEventListener('change', updateTaskTrackerSaveState);
  editor.addEventListener('input', updateTaskTrackerSaveState);
  editor.addEventListener('blur', updateTaskTrackerSaveState);
  updateTaskTrackerSaveState();
}

function taskEditorExec(cmd) {
  const editor = document.getElementById('ttEditor');
  if (!editor || !cmd) return;
  editor.focus();
  if (cmd === 'quote') {
    document.execCommand('formatBlock', false, 'blockquote');
  } else if (cmd === 'link') {
    const url = window.prompt('Enter link URL', 'https://');
    if (url) document.execCommand('createLink', false, url);
  } else if (cmd === 'code') {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed) {
      document.execCommand('insertHTML', false, `<code>${escapeHtml(sel.toString())}</code>`);
    }
  } else {
    document.execCommand(cmd, false, null);
  }
  updateTaskTrackerSaveState();
}

function taskEditorHasContent(editor) {
  return editor.textContent.trim().length > 0 || !!editor.querySelector('li, img');
}

function updateTaskTrackerSaveState() {
  const emp = document.getElementById('ttEmployee');
  const editor = document.getElementById('ttEditor');
  const btn = document.getElementById('ttSaveBtn');
  if (!emp || !editor || !btn) return;
  const hasContent = taskEditorHasContent(editor);
  editor.classList.toggle('is-empty', !hasContent);
  btn.disabled = !(emp.value && hasContent);
}

// Convert the editor's rich-text HTML into Markdown. Handles the formatting the
// toolbar produces: bold, italic, underline, strikethrough, inline code, links,
// bullet/numbered lists (incl. nesting), and blockquotes.
function taskHtmlToMarkdown(root) {
  const lines = [];

  function inlineChildren(node) {
    let out = '';
    node.childNodes.forEach((child) => { out += inlineNode(child); });
    return out;
  }

  function inlineNode(node) {
    if (node.nodeType === 3) return node.nodeValue;
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') return '\n';
    const inner = inlineChildren(node);
    switch (tag) {
      case 'strong': case 'b': return inner.trim() ? `**${inner}**` : inner;
      case 'em': case 'i': return inner.trim() ? `*${inner}*` : inner;
      case 'u': return inner.trim() ? `<u>${inner}</u>` : inner;
      case 's': case 'strike': case 'del': return inner.trim() ? `~~${inner}~~` : inner;
      case 'code': return inner ? `\`${inner}\`` : inner;
      case 'a': {
        const href = node.getAttribute('href') || '';
        return href ? `[${inner || href}](${href})` : inner;
      }
      default: return inner;
    }
  }

  function walkList(listEl, ordered, depth) {
    let index = 1;
    listEl.childNodes.forEach((li) => {
      if (li.nodeType !== 1 || li.tagName.toLowerCase() !== 'li') return;
      const nested = [];
      let text = '';
      li.childNodes.forEach((child) => {
        const childTag = child.nodeType === 1 ? child.tagName.toLowerCase() : '';
        if (childTag === 'ul' || childTag === 'ol') nested.push(child);
        else text += inlineNode(child);
      });
      const prefix = ordered ? `${index}. ` : '- ';
      lines.push(`${'  '.repeat(depth)}${prefix}${text.trim()}`);
      nested.forEach((n) => walkList(n, n.tagName.toLowerCase() === 'ol', depth + 1));
      index += 1;
    });
  }

  function walkBlock(container) {
    container.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        if (child.nodeValue.trim()) lines.push(child.nodeValue.trim());
        return;
      }
      if (child.nodeType !== 1) return;
      const tag = child.tagName.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        walkList(child, tag === 'ol', 0);
        lines.push('');
      } else if (tag === 'blockquote') {
        inlineChildren(child).trim().split('\n').forEach((l) => lines.push(`> ${l}`.trimEnd()));
        lines.push('');
      } else if (tag === 'p' || tag === 'div') {
        if (child.querySelector('ul, ol, blockquote')) {
          walkBlock(child);
        } else {
          const text = inlineChildren(child).trim();
          if (text) { lines.push(text); lines.push(''); }
        }
      } else if (tag === 'br') {
        // stray line break between blocks — ignore
      } else {
        const text = inlineNode(child).trim();
        if (text) { lines.push(text); lines.push(''); }
      }
    });
  }

  walkBlock(root);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function saveTaskTracker() {
  const emp = document.getElementById('ttEmployee');
  const editor = document.getElementById('ttEditor');
  const btn = document.getElementById('ttSaveBtn');
  const status = document.getElementById('ttStatus');
  if (!emp || !editor) return;

  const employee = emp.value;
  if (!employee) { showToast('Please select an employee.', 'error'); return; }
  const markdown = taskHtmlToMarkdown(editor);
  if (!markdown.trim()) { showToast('Please enter a task description.', 'error'); return; }

  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Saving...';
  try {
    const response = await fetch('/api/task_tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: CURRENT_COMPANY, employee, markdown }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Save failed');
    showToast('Task saved successfully.', 'success');
    // Return the page to its initial state.
    emp.value = '';
    editor.innerHTML = '';
    if (status) status.textContent = '';
    updateTaskTrackerSaveState();
    // Task is safely committed. Now automatically send it to Claude to analyze
    // the governance repo and generate Priority Questions (best-effort; never
    // affects the completed save).
    generatePriorityQuestionsFromTask(employee, markdown);
  } catch (error) {
    if (status) status.textContent = '';
    showToast(`Save failed: ${error.message}`, 'error');
    updateTaskTrackerSaveState();
  }
}

// Fire-and-report: ask Claude to analyze Governance_Files + this task and
// generate deduplicated Priority Questions. Runs after the task is saved, so a
// slow or unavailable Claude engine cannot block the save.
async function generatePriorityQuestionsFromTask(employee, markdown) {
  const status = document.getElementById('ttStatus');
  if (status) status.textContent = 'Analyzing governance and generating priority questions…';
  try {
    const response = await fetch('/api/priority_questions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: CURRENT_COMPANY, employee, task: markdown }),
    });
    const payload = await response.json().catch(() => ({}));
    if (payload && payload.ok && payload.count) {
      showToast(`${payload.count} priority question(s) generated from this task.`, 'success');
      if (status) status.textContent = `${payload.count} new priority question(s) added — open Priority Questions to review.`;
    } else if (payload && payload.ok) {
      if (status) status.textContent = 'No new priority questions were needed from this task.';
    } else {
      // Skipped/failed generation is non-fatal — the task is already saved.
      if (status) status.textContent = payload && payload.reason ? `Priority question generation skipped: ${payload.reason}` : '';
    }
  } catch (error) {
    if (status) status.textContent = '';
  }
}

async function renderDepartments() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/departments?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  if (CURRENT_DEPARTMENT) {
    const department = (data.all || []).find((dept) => dept.key === CURRENT_DEPARTMENT);
    if (department) {
      return renderDepartmentWorkspace(data, department);
    }
    CURRENT_DEPARTMENT = null;
  }
  document.getElementById('mainView').innerHTML = `
    <div class="departments-directory">
    <h2>Departments</h2>
    <div class="alert alert-info">
      Start with the department, then move into team members, customer work, questions, findings, repos, and AI workflows that belong to that operating area.
    </div>
    <div class="row g-3 mb-3">
      <div class="col-md-4"><div class="dash-card h-100"><div class="small text-muted">Total departments</div><div class="display-6 fw-semibold">${data.count}</div></div></div>
      <div class="col-md-4"><div class="dash-card h-100"><div class="small text-muted">Shared departments</div><div class="display-6 fw-semibold">${data.shared.length}</div></div></div>
      <div class="col-md-4"><div class="dash-card h-100"><div class="small text-muted">${escapeHtml(CURRENT_COMPANY)}-specific</div><div class="display-6 fw-semibold">${data.company_specific.length}</div></div></div>
    </div>
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="fw-semibold mb-2">Shared departments</div>
        <div class="department-grid">
          ${data.shared.map((dept) => renderDepartmentCard(dept)).join('')}
        </div>
      </div>
      <div class="col-lg-6">
        <div class="fw-semibold mb-2">${escapeHtml(CURRENT_COMPANY)} departments</div>
        <div class="department-grid">
          ${data.company_specific.map((dept) => renderDepartmentCard(dept)).join('')}
        </div>
      </div>
    </div>
    </div>
  `;
}

function collectDepartmentQuestions(questionData, department) {
  const memberKeys = department.member_keys || [];
  const memberNames = department.member_names || [];
  const byId = new Map();
  (questionData.org_wide || []).forEach((question) => {
    if (memberNames.includes(question.assignee)) {
      byId.set(question.qid, question);
    }
  });
  memberKeys.forEach((memberKey) => {
    const bucket = (questionData.employees || {})[memberKey];
    (bucket?.questions || []).forEach((question) => {
      byId.set(question.qid, question);
    });
  });
  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
  return Array.from(byId.values()).sort((a, b) => {
    const aOrder = order[a.priority || 'UNKNOWN'] ?? 9;
    const bOrder = order[b.priority || 'UNKNOWN'] ?? 9;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.qid || '').localeCompare(b.qid || '');
  });
}

function collectAllQuestions(questionData) {
  const items = [];
  (questionData.org_wide || []).forEach((question) => items.push(question));
  Object.values(questionData.employees || {}).forEach((bucket) => {
    (bucket?.questions || []).forEach((question) => items.push(question));
  });
  return items;
}

function sortQuestionsByPriority(a, b) {
  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
  const aOrder = order[a.priority || 'UNKNOWN'] ?? 9;
  const bOrder = order[b.priority || 'UNKNOWN'] ?? 9;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return (a.qid || '').localeCompare(b.qid || '');
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function repoSearchAliases(repoName) {
  const normalized = normalizeSearchText(repoName);
  const pieces = normalized.split(' ').filter(Boolean);
  const aliases = new Set();
  const ignored = new Set(['bpm', 'bold', 'repo']);

  if (normalized) aliases.add(normalized);

  const trimmed = pieces.filter((part) => !ignored.has(part));
  if (trimmed.length) aliases.add(trimmed.join(' '));

  const infraTrimmed = trimmed.filter((part) => !['app', 'private', 'master'].includes(part));
  if (infraTrimmed.length) aliases.add(infraTrimmed.join(' '));

  trimmed.forEach((token) => {
    if (token === 'quickbook' || token === 'quickbooks') {
      aliases.add('quickbook');
      aliases.add('quickbooks');
    }
    if (token === 'wishlist') aliases.add('wish list');
    if (token === 'dillongage') aliases.add('dillon gage');
    if (token === 'lateorders') aliases.add('late orders');
    if (token === 'vendororders') aliases.add('vendor orders');
    if (token === 'checkoutreminder') aliases.add('checkout reminder');
    if (token === 'customercheckoutreminder') aliases.add('customer checkout reminder');
  });

  return Array.from(aliases).filter((alias) => alias.length >= 4);
}

function buildQuestionSearchText(question) {
  const contextText = (question.context_items || []).flatMap((item) => [
    item.file,
    item.summary,
    ...((item.items || []).slice(0, 8)),
  ]);
  return normalizeSearchText([
    question.qid,
    question.title,
    question.short_question,
    question.body,
    question.blocks,
    question.assignee,
    ...contextText,
  ].filter(Boolean).join(' '));
}

function questionMatchesRepo(question, repoName) {
  const haystack = buildQuestionSearchText(question);
  return repoSearchAliases(repoName).some((alias) => haystack.includes(alias));
}

function findingMatchesRepo(finding, repoName) {
  const haystack = normalizeSearchText([
    finding.id,
    finding.title,
    finding.type,
    finding.source,
    finding.observation,
    finding.proposed_action,
    finding.status,
  ].filter(Boolean).join(' '));
  return repoSearchAliases(repoName).some((alias) => haystack.includes(alias));
}

function dedupeQuestions(questions) {
  const byId = new Map();
  (questions || []).forEach((question) => {
    if (question?.qid) byId.set(question.qid, question);
  });
  return Array.from(byId.values()).sort(sortQuestionsByPriority);
}

function sortRepoQuestions(questions) {
  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
  return Array.from(questions || []).sort((a, b) => {
    const aOrder = order[a.priority || 'UNKNOWN'] ?? 9;
    const bOrder = order[b.priority || 'UNKNOWN'] ?? 9;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a.question_code || '').localeCompare(String(b.question_code || ''));
  });
}

function repoQuestionIsUnanswered(question) {
  return questionIsUnanswered(question?.status || 'OPEN');
}

function humanRepoQuestionSource(source) {
  const labels = {
    repo_sheet_section_3: 'Deep-read sheet, section 3',
    repo_sheet_section_5: 'Deep-read sheet, section 5',
    repo_sheet_section_8: 'Deep-read sheet, section 8',
    finding: 'Findings for review',
    security_finding: 'Security risk register',
    manual: 'Manual',
  };
  return labels[source] || source || 'Unknown source';
}

const REPO_UNDERSTANDING_STAGES = [
  { value: 'UNKNOWN', label: 'Unknown' },
  { value: 'QUESTIONS_OPEN', label: 'Questions open' },
  { value: 'ANSWERS_IN_REVIEW', label: 'Answers in review' },
  { value: 'FOLLOW_UP_REQUIRED', label: 'Follow-up required' },
  { value: 'DEPARTMENT_UNDERSTOOD', label: 'Department understood' },
  { value: 'FULLY_UNDERSTOOD', label: 'Fully understood' },
];

function buildRepoUnderstandingStateMap(rows) {
  const map = new Map();
  (rows || []).forEach((row) => {
    if (!row?.department_key || !row?.repo_name) return;
    map.set(`${row.department_key}::${row.repo_name}`, row);
  });
  return map;
}

function humanRepoUnderstandingStatus(statusValue) {
  return REPO_UNDERSTANDING_STAGES.find((item) => item.value === statusValue)?.label || prettyDepartmentName(statusValue || 'UNKNOWN');
}

function toneForRecordedRepoStatus(statusValue) {
  if (statusValue === 'FOLLOW_UP_REQUIRED') return 'critical';
  if (statusValue === 'QUESTIONS_OPEN') return 'warning';
  if (statusValue === 'ANSWERS_IN_REVIEW') return 'review';
  if (statusValue === 'DEPARTMENT_UNDERSTOOD' || statusValue === 'FULLY_UNDERSTOOD') return 'progress';
  return 'neutral';
}

function repoUnderstandingDomKey(departmentKey, repoName) {
  return `${String(departmentKey || '')}__${String(repoName || '')}`.replace(/[^A-Za-z0-9_-]/g, '_');
}

function buildRepoUnderstandingStatus(repoInsight) {
  if (repoInsight.openCriticalCount > 0) {
    return {
      label: 'Critical questions open',
      tone: 'critical',
      summary: 'Critical repo understanding gaps still need answers before this repo can be treated as understood.',
      nextStep: 'Resolve the critical repo questions first, then decide what follow-up questions are still needed.',
    };
  }
  if (repoInsight.openQuestions.length > 0) {
    return {
      label: 'Questions open',
      tone: 'warning',
      summary: 'This repo already has known understanding gaps and still needs answers before it is fully understood.',
      nextStep: 'Answer the unresolved repo questions, then evaluate the answers for missing follow-up questions.',
    };
  }
  if (repoInsight.totalQuestions > 0 && repoInsight.findings.length > 0) {
    return {
      label: 'Evaluate after answers',
      tone: 'review',
      summary: 'Current repo questions appear answered, but findings still need to be reconciled before the repo is treated as stable.',
      nextStep: 'Review the findings against the current answers and create follow-up repo questions where behavior is still unclear.',
    };
  }
  if (repoInsight.totalQuestions > 0) {
    return {
      label: 'Review for follow-up',
      tone: 'progress',
      summary: 'This repo already has question coverage. The next step is to decide whether the answers are enough or whether new questions should be asked.',
      nextStep: 'Review the existing answers and ask new repo questions if ownership, runtime behavior, dependencies, or business rules are still vague.',
    };
  }
  if (repoInsight.findings.length > 0) {
    return {
      label: 'Findings without questions',
      tone: 'warning',
      summary: 'This repo has findings attached to it, but no direct repo-question coverage yet.',
      nextStep: 'Generate repo questions from the findings so the team can explain what this repo does and how it should behave.',
    };
  }
  return {
    label: 'No repo questions yet',
    tone: 'neutral',
    summary: 'This repo is mapped to the department, but there is no direct repo-question packet yet.',
    nextStep: 'Start with baseline repo questions: purpose, owner, trigger, systems touched, and business rules encoded.',
  };
}

function buildDepartmentRepoInsights(repoQuestionData, findingData, department, savedRepoUnderstandingMap) {
  const repoQuestionMap = repoQuestionData?.repos || {};
  const repoInsights = (department.repos || []).map((repoName) => {
    const repoBucket = repoQuestionMap[repoName] || { questions: [] };
    const questions = sortRepoQuestions(repoBucket.questions || []);
    const openQuestions = questions.filter((question) => repoQuestionIsUnanswered(question));
    const findings = (findingData.findings || []).filter((finding) => findingMatchesRepo(finding, repoName));
    const priorityCounts = questions.reduce((acc, question) => {
      const key = question.priority || 'UNKNOWN';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const openCriticalCount = openQuestions.filter((question) => (question.priority || 'UNKNOWN') === 'CRITICAL').length;
    const relatedAssignees = Array.from(new Set(questions.map((question) => question.primary_assignee || question.assignee).filter(Boolean))).sort();
    const suggestedStatus = buildRepoUnderstandingStatus({
      openCriticalCount,
      openQuestions,
      totalQuestions: questions.length,
      findings,
    });
    const savedState = savedRepoUnderstandingMap?.get(`${department.key}::${repoName}`) || null;
    const recordedStatusValue = savedState?.status || '';
    const recordedStatus = recordedStatusValue ? {
      value: recordedStatusValue,
      label: humanRepoUnderstandingStatus(recordedStatusValue),
      tone: toneForRecordedRepoStatus(recordedStatusValue),
    } : null;
    return {
      repo: repoName,
      questions,
      openQuestions,
      totalQuestions: questions.length,
      openQuestionCount: openQuestions.length,
      openCriticalCount,
      findings,
      priorityCounts,
      relatedAssignees,
      status: recordedStatus || suggestedStatus,
      suggestedStatus,
      recordedStatus,
      savedState,
      displayQuestions: openQuestions.length ? openQuestions : questions,
      suggestedNextQuestions: [
        `What is ${repoName} specifically responsible for in practice?`,
        `Who currently owns ${repoName}, and when does it run?`,
        `What systems, vendors, or datasets does ${repoName} touch?`,
        `What business rules or exceptions are encoded in ${repoName}?`,
      ],
    };
  });
  return { repoInsights };
}

function collectDepartmentFindings(findingData, department) {
  const repos = department.repos || [];
  const name = department.name || '';
  return (findingData.findings || []).filter((finding) => {
    const haystack = [
      finding.id,
      finding.title,
      finding.type,
      finding.source,
      finding.observation,
      finding.proposed_action,
      finding.status,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(name.toLowerCase()) || repos.some((repo) => haystack.includes(repo.toLowerCase()));
  });
}

function collectDepartmentAspectGroups(aspectData, department) {
  const repos = department.repos || [];
  return (aspectData.groups || []).filter((group) => (group.repos || []).some((repo) => repos.includes(repo)));
}

function scrollDepartmentSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function backToDepartmentDirectory() {
  CURRENT_DEPARTMENT = null;
  renderDepartments();
}

function openDepartmentWorkspace(departmentKey) {
  CURRENT_DEPARTMENT = departmentKey;
  CURRENT_VIEW = 'departments';
  document.querySelectorAll('#navMenu button').forEach((b) => b.classList.toggle('active', b.dataset.view === 'departments'));
  showView('departments');
}

async function saveRepoUnderstanding(departmentKey, repoName) {
  const domKey = repoUnderstandingDomKey(departmentKey, repoName);
  const stageEl = document.getElementById(`repoStage_${domKey}`);
  const reviewEl = document.getElementById(`repoReview_${domKey}`);
  const nextEl = document.getElementById(`repoNext_${domKey}`);
  const reviewerEl = document.getElementById(`repoReviewer_${domKey}`);
  const statusEl = document.getElementById(`repoSaveStatus_${domKey}`);
  if (!stageEl || !reviewEl || !nextEl || !reviewerEl) return;
  if (statusEl) statusEl.textContent = 'Saving...';
  try {
    const response = await fetch('/api/repo_understanding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        department_key: departmentKey,
        repo_name: repoName,
        status: stageEl.value,
        review_note: reviewEl.value,
        next_questions_note: nextEl.value,
        reviewed_by: reviewerEl.value,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || payload.reason || 'Save failed');
    }
    if (statusEl) statusEl.textContent = `Saved ${String(payload.updated_at || '').replace('T', ' ').slice(0, 16)}`;
    setTimeout(() => {
      if (statusEl && statusEl.textContent.startsWith('Saved')) statusEl.textContent = '';
    }, 2400);
    if (CURRENT_VIEW === 'departments' && CURRENT_DEPARTMENT === departmentKey) {
      setTimeout(() => showView('departments'), 250);
    }
  } catch (error) {
    if (statusEl) statusEl.textContent = `Save failed: ${error.message}`;
  }
}

async function renderDepartmentWorkspace(allDepartmentData, department) {
  const mainView = document.getElementById('mainView');
  mainView.innerHTML = `
    <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-3">
      <div>
        <h2>${escapeHtml(department.name)} Workspace</h2>
        <div class="small text-muted">Loading team members, repo coverage, questions, findings, and intake lanes for this department...</div>
      </div>
      <button class="btn btn-sm btn-outline-secondary" type="button" onclick="backToDepartmentDirectory()">Back to departments</button>
    </div>
    <div class="dash-card">
      <div class="text-muted">Loading department workspace...</div>
    </div>
  `;

  const dataSpecs = [
    ['team members', `/api/team_members?company=${CURRENT_COMPANY}`, []],
    ['questions', `/api/questions?company=${CURRENT_COMPANY}`, { employees: {}, org_wide: [], team_counts: [] }],
    ['repo questions', `/api/repo_questions?company=${CURRENT_COMPANY}`, { repos: {}, rows: [] }],
    ['findings', `/api/findings?company=${CURRENT_COMPANY}`, { findings: [] }],
    ['intake', `/api/intake?company=${CURRENT_COMPANY}`, []],
    ['aspect groups', `/api/aspect_groups?company=${CURRENT_COMPANY}`, { groups: [] }],
    ['repo understanding', `/api/repo_understanding?company=${CURRENT_COMPANY}`, { rows: [] }],
  ];

  const settled = await Promise.allSettled(
    dataSpecs.map(([label, url]) => withTimeout(fetchJSON(url), 12000, label)),
  );

  const warnings = [];
  const [
    teamData,
    questionData,
    repoQuestionData,
    findingData,
    intakeData,
    aspectData,
    repoStateData,
  ] = settled.map((result, index) => {
    const [label, , fallback] = dataSpecs[index];
    if (result.status === 'fulfilled') return result.value;
    warnings.push(`${label}: ${result.reason?.message || 'failed to load'}`);
    return fallback;
  });

  try {
    const memberAssignedQuestions = collectDepartmentQuestions(questionData, department);
    const relatedFindings = collectDepartmentFindings(findingData, department);
    const relatedAspectGroups = collectDepartmentAspectGroups(aspectData, department);
    const repoUnderstandingMap = buildRepoUnderstandingStateMap(repoStateData.rows);
    const repoUnderstanding = buildDepartmentRepoInsights(repoQuestionData, findingData, department, repoUnderstandingMap);
    const relatedQuestions = dedupeQuestions([
      ...memberAssignedQuestions,
    ]);
    const memberKeys = department.member_keys || [];
    const relatedIntakes = (intakeData || []).filter((item) => memberKeys.includes(item.employee) || ((item.note || '').toLowerCase().includes((department.name || '').toLowerCase())));
    const fileCount = relatedIntakes.reduce((sum, item) => sum + (item.file_count || 0), 0);
    const priorityCounts = relatedQuestions.reduce((acc, question) => {
      const key = question.priority || 'UNKNOWN';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const relatedMembers = (teamData || []).filter((member) => memberKeys.includes(member.key));

    mainView.innerHTML = `
    <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-3">
      <div>
        <h2>${escapeHtml(department.name)} Workspace</h2>
        <div class="small text-muted">This department lane is where team members, repos, files, questions, findings, and AI-assisted governance work come together for this operating area.</div>
      </div>
      <button class="btn btn-sm btn-outline-secondary" type="button" onclick="backToDepartmentDirectory()">Back to departments</button>
    </div>
    ${warnings.length ? `
      <div class="alert alert-warning">
        <div class="fw-semibold mb-1">Some department data did not load cleanly.</div>
        <div class="small">${escapeHtml(warnings.join(' | '))}</div>
      </div>
    ` : ''}
    <div class="row g-3">
      <div class="col-xl-3">
        <div class="dash-card dept-workspace-nav">
          <div class="fw-semibold mb-2">Departments</div>
          <div class="small text-muted mb-3">Switch operating lanes without leaving the department workspace.</div>
          <div class="dept-workspace-switcher">
            ${(allDepartmentData.all || []).map((dept) => `
              <button class="dept-switch-btn ${dept.key === department.key ? 'active' : ''}" type="button" onclick="openDepartmentWorkspace('${escapeJs(dept.key)}')">
                <span>${escapeHtml(dept.name)}</span>
                <span class="small text-muted">${dept.repo_count} repos</span>
              </button>
            `).join('')}
          </div>
          <div class="fw-semibold mt-4 mb-2">Department sections</div>
          <div class="dept-section-links">
            <button class="directory-link" type="button" onclick="scrollDepartmentSection('deptOverview')">Overview</button>
            <button class="directory-link" type="button" onclick="scrollDepartmentSection('deptRepoUnderstanding')">Repo Understanding</button>
            <button class="directory-link" type="button" onclick="scrollDepartmentSection('deptMembers')">Team Members</button>
            <button class="directory-link" type="button" onclick="scrollDepartmentSection('deptRepos')">Repos</button>
            <button class="directory-link" type="button" onclick="scrollDepartmentSection('deptQuestions')">Questions</button>
            <button class="directory-link" type="button" onclick="scrollDepartmentSection('deptFindings')">Findings</button>
            <button class="directory-link" type="button" onclick="scrollDepartmentSection('deptIntake')">Drop Files</button>
            <button class="directory-link" type="button" onclick="scrollDepartmentSection('deptAI')">AI Workflow</button>
          </div>
        </div>
      </div>
      <div class="col-xl-9">
        <div id="deptOverview" class="dash-card dept-section-card mb-3">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <div class="small text-uppercase text-muted">${escapeHtml(department.bucket || '')}</div>
              <div class="department-title">${escapeHtml(department.name)}</div>
              <div class="small text-muted mt-1">${escapeHtml(department.description || '')}</div>
            </div>
            <div class="repo-chip-row">
              <span class="repo-chip">${department.member_count} team member(s)</span>
              <span class="repo-chip">${department.repo_count} repos</span>
              <span class="repo-chip">${relatedQuestions.length} routed questions</span>
              <span class="repo-chip">${relatedFindings.length} related findings</span>
              <span class="repo-chip">${relatedIntakes.length} intakes / ${fileCount} files</span>
            </div>
          </div>
          ${relatedAspectGroups.length ? `
            <div class="mt-3">
              <div class="fw-semibold mb-2">Related aspect groups</div>
              <div class="repo-chip-row">
                ${relatedAspectGroups.map((group) => `<span class="repo-chip">${escapeHtml(group.name)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div id="deptRepoUnderstanding" class="dash-card dept-section-card mb-3">
          <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
            <div>
              <div class="fw-semibold mb-2">Repo understanding coverage</div>
              <div class="small text-muted">Review each repo in this department through its own question lane. As answers come in, use this view to decide whether the repo is actually understood yet or whether new follow-up questions still need to be asked.</div>
            </div>
            <div class="repo-chip-row">
              <span class="repo-chip">${repoUnderstanding.repoInsights.length} repos tracked</span>
              <span class="repo-chip">${repoUnderstanding.repoInsights.reduce((sum, repo) => sum + repo.openQuestionCount, 0)} unresolved repo questions</span>
              <span class="repo-chip">${repoUnderstanding.repoInsights.reduce((sum, repo) => sum + repo.openCriticalCount, 0)} critical repo questions</span>
            </div>
          </div>
          ${repoUnderstanding.repoInsights.length ? `
            <div class="repo-understanding-grid mt-3">
              ${repoUnderstanding.repoInsights.map((repo) => `
                <div class="repo-understanding-card">
                  ${(() => {
                    const domKey = repoUnderstandingDomKey(department.key, repo.repo);
                    return `
                  <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                      <div class="fw-semibold">${escapeHtml(repo.repo)}</div>
                      <div class="small text-muted mt-1">${escapeHtml((repo.recordedStatus ? `Recorded stage: ${repo.recordedStatus.label}. ` : '') + repo.status.summary)}</div>
                    </div>
                    <span class="repo-understanding-status ${repo.status.tone}">${escapeHtml(repo.status.label)}</span>
                  </div>
                  <div class="repo-chip-row mt-3">
                    <span class="repo-chip">${repo.totalQuestions} total questions</span>
                    <span class="repo-chip">${repo.openQuestionCount} unresolved</span>
                    <span class="repo-chip">${repo.openCriticalCount} critical open</span>
                    <span class="repo-chip">${repo.findings.length} findings</span>
                    ${repo.relatedAssignees.length ? `<span class="repo-chip">Assignees: ${escapeHtml(repo.relatedAssignees.join(', '))}</span>` : ''}
                    <span class="repo-chip">Suggested: ${escapeHtml(repo.suggestedStatus.label)}</span>
                  </div>
                  <div class="repo-understanding-next mt-3">
                    <div class="fw-semibold small mb-1">What still needs to happen</div>
                    <div class="small text-muted">${escapeHtml(repo.status.nextStep)}</div>
                  </div>
                  <div class="repo-understanding-split mt-3">
                    <div>
                      <div class="d-flex justify-content-between align-items-center gap-2 mb-2 flex-wrap">
                        <div class="fw-semibold small">${repo.displayQuestions.length ? 'Most important repo questions' : 'Suggested first repo questions'}</div>
                        <div class="d-flex gap-2 flex-wrap">
                          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="generateRepoQuestions('${escapeJs(repo.repo)}')">${repo.totalQuestions ? 'Regenerate' : 'Generate'} questions</button>
                        </div>
                      </div>
                      ${repo.displayQuestions.length ? `
                        <div class="repo-question-list">
                          ${repo.displayQuestions.slice(0, 4).map((question) => `
                            <div class="repo-question-item">
                              <div class="d-flex justify-content-between gap-2 flex-wrap align-items-start">
                                <button class="btn btn-link p-0 text-start fw-semibold small repo-question-link" type="button" onclick="openRepoQuestionWorkspace('${escapeJs(question.question_code)}', { sourceView: 'departments' })">${escapeHtml(question.question_code)} - ${escapeHtml(question.title)}</button>
                                <span class="badge badge-${(question.priority || 'unknown').toLowerCase()}">${escapeHtml(question.priority || 'UNKNOWN')}</span>
                              </div>
                              <div class="small mt-1">${escapeHtml(question.short_question || question.title || '')}</div>
                              <div class="small text-muted mt-1">Assigned to ${escapeHtml(question.primary_assignee || 'Ryan Cochran')} - ${escapeHtml(question.status || 'OPEN')}</div>
                              <div class="small text-muted mt-1">Source: ${escapeHtml(humanRepoQuestionSource(question.source))} - ${escapeHtml(question.source_ref || '')}</div>
                            </div>
                          `).join('')}
                        </div>
                      ` : `
                        <div class="small text-muted mb-2">No repo-specific question packet exists yet for this repo.</div>
                        <ul class="small repo-understanding-list mb-0">
                          ${repo.suggestedNextQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
                        </ul>
                      `}
                    </div>
                    <div>
                      <div class="fw-semibold small mb-2">Related findings / evidence</div>
                      ${repo.findings.length ? `
                        <div class="repo-question-list">
                          ${repo.findings.slice(0, 3).map((finding) => `
                            <div class="repo-question-item">
                              <div class="d-flex justify-content-between gap-2 flex-wrap">
                                <div class="fw-semibold small">${escapeHtml(finding.fid || finding.id || '')} - ${escapeHtml(finding.title || 'Untitled finding')}</div>
                                <span class="badge bg-secondary">${escapeHtml(finding.status || 'PENDING')}</span>
                              </div>
                              <div class="small mt-1">${escapeHtml(finding.observation || finding.proposed || '')}</div>
                            </div>
                          `).join('')}
                        </div>
                      ` : '<div class="small text-muted">No repo findings matched yet. If this repo is still unclear, the next step is usually to answer or generate repo questions.</div>'}
                    </div>
                  </div>
                  <div class="repo-understanding-review mt-3">
                    <div class="fw-semibold small mb-2">Evaluate this repo understanding</div>
                    <div class="row g-2">
                      <div class="col-md-4">
                        <label class="form-label small mb-1">Recorded stage</label>
                        <select class="form-select form-select-sm" id="repoStage_${domKey}">
                          ${REPO_UNDERSTANDING_STAGES.map((stage) => `<option value="${stage.value}" ${(repo.savedState?.status || 'UNKNOWN') === stage.value ? 'selected' : ''}>${escapeHtml(stage.label)}</option>`).join('')}
                        </select>
                      </div>
                      <div class="col-md-8">
                        <label class="form-label small mb-1">Reviewed by</label>
                        <input class="form-control form-control-sm" id="repoReviewer_${domKey}" value="${escapeHtml(repo.savedState?.reviewed_by || 'Ryan Cochran')}" placeholder="Reviewer name">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small mb-1">What did we learn?</label>
                        <textarea class="form-control form-control-sm repo-understanding-textarea" id="repoReview_${domKey}" placeholder="Summarize what is now understood about this repo...">${escapeHtml(repo.savedState?.review_note || '')}</textarea>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small mb-1">Next questions / remaining gaps</label>
                        <textarea class="form-control form-control-sm repo-understanding-textarea" id="repoNext_${domKey}" placeholder="List follow-up questions or unresolved areas...">${escapeHtml(repo.savedState?.next_questions_note || '')}</textarea>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mt-2">
                      <div class="small text-muted">${repo.savedState?.updated_at ? `Last saved ${escapeHtml(repo.savedState.updated_at.replace('T', ' ').slice(0, 16))}` : 'No saved repo evaluation yet.'}</div>
                      <div class="d-flex gap-2 align-items-center flex-wrap">
                        <span class="small text-muted" id="repoSaveStatus_${domKey}"></span>
                        <button class="btn btn-sm btn-outline-primary" type="button" onclick="saveRepoUnderstanding('${escapeJs(department.key)}', '${escapeJs(repo.repo)}')">Save evaluation</button>
                      </div>
                    </div>
                  </div>
                  `;
                  })()}
                </div>
              `).join('')}
            </div>
          ` : '<div class="text-muted small mt-3">No repos are mapped to this department yet, so there is no repo understanding coverage to evaluate.</div>'}
        </div>

        <div id="deptMembers" class="dash-card dept-section-card mb-3">
          <div class="fw-semibold mb-2">Team members in this department</div>
          ${relatedMembers.length ? `
            <div class="member-list-stack">
              ${relatedMembers.map((member) => `
                <button class="member-list-card" type="button" onclick="openTeamMemberWorkspace('${escapeJs(member.key)}')">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <div class="text-start">
                      <div class="fw-semibold">${escapeHtml(member.display_name)}</div>
                      <div class="small text-muted">${member.unanswered_questions} unanswered / ${member.total_questions} total questions</div>
                      <div class="small text-muted">${member.assigned_intakes} intakes - ${member.assigned_files} files</div>
                    </div>
                    <span class="team-pill-count">${member.unanswered_questions}</span>
                  </div>
                </button>
              `).join('')}
            </div>
          ` : '<div class="text-muted small">No team members mapped to this department yet.</div>'}
        </div>

        <div id="deptRepos" class="dash-card dept-section-card mb-3">
          <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
            <div class="fw-semibold mb-2">Likely repos in this department</div>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showView('classification')">Open repo classification</button>
          </div>
          <div class="repo-chip-row">
            ${(department.repos || []).length ? department.repos.map((repo) => `<span class="repo-chip">${escapeHtml(repo)}</span>`).join('') : '<span class="text-muted small">No repos mapped yet.</span>'}
          </div>
        </div>

        <div id="deptQuestions" class="dash-card dept-section-card mb-3">
          <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
            <div>
              <div class="fw-semibold mb-2">Priority questions</div>
              <div class="small text-muted">This section is for department-level questions that are not obviously tied to one specific repo. Repo-specific understanding questions are surfaced above under each repo card.</div>
            </div>
            <div class="repo-chip-row">
              ${Object.keys(priorityCounts).length ? Object.entries(priorityCounts).map(([priority, count]) => `<span class="repo-chip">${escapeHtml(priority)}: ${count}</span>`).join('') : '<span class="text-muted small">No routed questions yet.</span>'}
            </div>
          </div>
          ${memberAssignedQuestions.length ? `
            <div class="member-question-list mt-3">
              ${memberAssignedQuestions.slice(0, 8).map((question) => `
                <div class="member-question-row">
                  <div class="d-flex justify-content-between gap-2">
                    <div>
                      <div class="fw-semibold">${escapeHtml(question.qid)} — ${escapeHtml(question.title)}</div>
                      <div class="small">${escapeHtml(question.short_question || '')}</div>
                      <div class="small text-muted mt-1">Assigned to ${escapeHtml(question.assignee || 'Unassigned')}</div>
                    </div>
                    <span class="badge badge-${(question.priority || 'unknown').toLowerCase()}">${escapeHtml(question.priority || 'UNKNOWN')}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<div class="text-muted small mt-3">No general department-only questions are currently routed here. The main repo understanding work is shown in the repo coverage section above.</div>'}
        </div>

        <div id="deptFindings" class="dash-card dept-section-card mb-3">
          <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
            <div>
              <div class="fw-semibold mb-2">Related findings</div>
              <div class="small text-muted">Findings are matched here when they reference this department or one of its mapped repos.</div>
            </div>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showView('findings')">Open findings review</button>
          </div>
          ${relatedFindings.length ? `
            <div class="member-question-list mt-3">
              ${relatedFindings.slice(0, 8).map((finding) => `
                <div class="member-question-row">
                  <div class="d-flex justify-content-between gap-2">
                    <div>
                      <div class="fw-semibold">${escapeHtml(finding.id || '')} — ${escapeHtml(finding.title || 'Untitled finding')}</div>
                      <div class="small">${escapeHtml(finding.observation || '')}</div>
                    </div>
                    <span class="badge bg-secondary">${escapeHtml(finding.status || 'PENDING')}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<div class="text-muted small mt-3">No findings currently matched to this department.</div>'}
        </div>

        <div id="deptIntake" class="dash-card dept-section-card mb-3">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
            <div>
              <div class="fw-semibold mb-1">Drop files for ${escapeHtml(department.name)}</div>
              <div class="small text-muted">Route screenshots, documents, repo scans, transcripts, and work packages into this department lane before they move into questions, findings, or commits.</div>
            </div>
            <div class="member-lane-steps">
              <span class="member-lane-step">1. Drop files</span>
              <span class="member-lane-step">2. AI review</span>
              <span class="member-lane-step">3. Route questions</span>
              <span class="member-lane-step">4. Approve updates</span>
              <span class="member-lane-step">5. Commit gate</span>
            </div>
          </div>
          ${renderIntakeForm('dept')}
          <div id="deptIntakeStatus" class="mt-3"></div>
        </div>

        <div id="deptAI" class="dash-card dept-section-card">
          <div class="fw-semibold mb-2">AI workflow for this department</div>
          <div class="small text-muted mb-3">Use this lane when the work is specific to ${escapeHtml(department.name)}. Files can be routed here first, then processed through Claude or OpenAI before they become questions, findings, or governance changes.</div>
          <div class="repo-chip-row mb-3">
            <span class="repo-chip">Department-scoped intake first</span>
            <span class="repo-chip">Questions routed to people</span>
            <span class="repo-chip">Findings reviewed before decisions</span>
            <span class="repo-chip">Commit gate stays separate</span>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showView('exchange')">Open AI Exchange</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showView('files')">Open governance files</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showView('board')">Open workflow board</button>
          </div>
        </div>
      </div>
    </div>
  `;
    await initIntakeForm('dept');
    const deptEmployee = document.getElementById('deptEmployee');
    if (deptEmployee && memberKeys.length === 1) {
      deptEmployee.value = memberKeys[0];
    }
    const deptNote = document.getElementById('deptNote');
    if (deptNote && !deptNote.value) {
      deptNote.value = `${department.name} workspace upload`;
    }
  } catch (error) {
    mainView.innerHTML = `
      <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-3">
        <div>
          <h2>${escapeHtml(department.name)} Workspace</h2>
          <div class="small text-muted">The department shell opened, but the full workspace failed to render.</div>
        </div>
        <button class="btn btn-sm btn-outline-secondary" type="button" onclick="backToDepartmentDirectory()">Back to departments</button>
      </div>
      <div class="alert alert-danger">
        <div class="fw-semibold mb-1">Department workspace failed to render</div>
        <div class="small">${escapeHtml(error.message || 'Unknown error')}</div>
      </div>
      ${warnings.length ? `
        <div class="alert alert-warning">
          <div class="fw-semibold mb-1">Partial data load warnings</div>
          <div class="small">${escapeHtml(warnings.join(' | '))}</div>
        </div>
      ` : ''}
      <div class="dash-card">
        <div class="fw-semibold mb-2">Department details</div>
        <div class="small text-muted mb-2">${escapeHtml(department.description || '')}</div>
        <div class="repo-chip-row">
          <span class="repo-chip">${department.member_count} team member(s)</span>
          <span class="repo-chip">${department.repo_count} repos</span>
        </div>
      </div>
    `;
  }
}

async function renderIntake() {
  const intakes = await fetchJSON(`/api/intake?company=${CURRENT_COMPANY}`);
  const brand = BRANDING[CURRENT_COMPANY];
  document.getElementById('mainView').innerHTML = `
    <div class="dash-card mb-3">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <div class="small text-muted text-uppercase">${escapeHtml(brand.short)} intake lane</div>
          <h2 class="mb-1">Daily Intake</h2>
          <div class="small text-muted">
            Route employee work, transcripts, repo evidence, and screenshots into a tracked review pipeline before anything reaches governance.
          </div>
        </div>
        <img src="${brand.heroWordmark}" alt="${escapeHtml(brand.full)} wordmark" style="max-width:320px; width:100%; height:auto; border-radius:8px;">
      </div>
    </div>
    <p class="small text-muted">
      Drop files here. They land in <code>_GOVERNANCE/_INTAKE/intake_NNNNN/</code> first and create a tracked intake record.
      Nothing is committed from this page.
    </p>
    ${renderIntakeForm('i')}
    <div class="mt-2" id="iIntakeStatus"></div>

    <h3 class="mt-4">Recent intakes (${intakes.length})</h3>
    ${intakes.map(renderIntakeRow).join('') || '<div class="text-muted">No intakes yet.</div>'}
  `;
  await initIntakeForm('i');
}

async function renderBoard() {
  const _r = VIEW_REQUEST;
  const intakes = await fetchJSON(`/api/intake?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  renderBoardWithItems(intakes, null);
}

function renderBoardWithItems(intakes, filterLabel) {
  const columns = [
    ['Uploaded', ['Uploaded', 'Stored', 'Parsed', 'AI Reviewed']],
    ['Findings and Questions', ['Findings Pending', 'Employee Questions Pending', 'Ryan Questions Pending']],
    ['Decision', ['Decision Drafting', 'Awaiting Ryan Approval', 'Draft Governance Updated']],
    ['Commit', ['Awaiting Commit Approval', 'Committed', 'Pushed']],
    ['Constitution', ['Constitution Candidate', 'Constitution Approved']],
  ];
  const heading = filterLabel ? `Workflow Board - filtered to ${filterLabel}` : 'Workflow Board';
  let html = `
    <h2>${escapeHtml(heading)}</h2>
    <p class="small text-muted">
      Each intake card moves through visible gates. Cards cannot be treated as committed governance until they pass findings, question, decision, and commit approval steps.
    </p>
    <div class="kanban">
  `;
  columns.forEach(([title, stages]) => {
    const cards = intakes.filter((item) => stages.includes(item.stage));
    html += `
      <div class="kanban-col">
        <h6>${escapeHtml(title)} (${cards.length})</h6>
        ${cards.map((item) => `
          <div class="kanban-card" onclick="openIntake(${item.id})">
            <div class="fw-semibold">#${item.id} ${escapeHtml((item.note || '').slice(0, 38))}</div>
            <div class="small text-muted">${escapeHtml(item.stage)}</div>
            ${item.employee ? `<div class="small">${escapeHtml(prettyName(item.employee))}</div>` : ''}
          </div>
        `).join('') || '<div class="small text-muted">No items</div>'}
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('mainView').innerHTML = html;
}

async function showBoardFiltered(stage) {
  CURRENT_VIEW = 'board';
  document.querySelectorAll('#navMenu button').forEach((b) => b.classList.toggle('active', b.dataset.view === 'board'));
  const intakes = await fetchJSON(`/api/intake?company=${CURRENT_COMPANY}`);
  renderBoardWithItems(intakes.filter((item) => item.stage === stage), stage);
}

async function openIntake(intakeId) {
  const data = await fetchJSON(`/api/intake/${intakeId}`);
  const integrations = await loadIntegrations();
  const intake = data.intake;
  const integrationMap = Object.fromEntries((integrations?.items || []).map((item) => [item.name, item]));
  const claudeReady = Boolean(integrationMap['Claude Code']?.connected);
  const openaiReady = Boolean(integrationMap['OpenAI Codex']?.connected);
  const githubReady = Boolean(integrationMap['GitHub / local git']?.connected);
  const integrationCards = [
    {
      name: 'Claude Code',
      status: summarizeRunStatus(data.runs, 'Claude Code'),
      connected: claudeReady,
      detail: integrationMap['Claude Code']?.detail || 'Run repo/document analysis directly from the intake folder and save the result back into the audit trail.',
    },
    {
      name: 'OpenAI Codex',
      status: summarizeRunStatus(data.runs, 'OpenAI Codex'),
      connected: openaiReady,
      detail: integrationMap['OpenAI Codex']?.detail || 'Use for transcript parsing, question drafting, and decision-structure generation when the API key is present.',
    },
    {
      name: 'GitHub / local git',
      status: summarizeRunStatus(data.runs, 'GitHub / local git'),
      connected: githubReady,
      detail: integrationMap['GitHub / local git']?.detail || 'Capture repo dirtiness, local status, and GitHub auth readiness as a snapshot on the intake.',
    },
  ];
  const latestClaudeRun = (data.runs || []).find((run) => run.engine === 'Claude Code' && run.status === 'completed' && run.output_path);
  const latestOpenAiRun = (data.runs || []).find((run) => run.engine === 'OpenAI Codex' && run.status === 'completed' && run.output_path);
  const latestGitRun = (data.runs || []).find((run) => run.engine === 'GitHub / local git' && run.status === 'completed' && run.output_path);
  const draftLinks = (data.links || []).filter((link) => link.kind === 'draft' || link.kind === 'commit_review');
  const exchanges = data.exchanges || [];
  document.getElementById('mainView').innerHTML = `
    <button class="btn btn-sm btn-outline-secondary mb-2" onclick="showView('${CURRENT_VIEW}')">Back</button>
    <h2>Intake #${intake.id} <span class="small text-muted">${escapeHtml(intake.uploaded_at.slice(0, 10))}</span></h2>
    ${renderEngineBadges(intake.ai_engines, intake.stage)}

    <div class="detail-grid">
      <div><strong>Note</strong><div>${escapeHtml(intake.note || '(none)')}</div></div>
      <div><strong>Employee</strong><div>${escapeHtml(intake.employee ? prettyName(intake.employee) : '(none)')}</div></div>
      <div><strong>Source</strong><div>${escapeHtml(intake.source_type || 'document')}</div></div>
      <div><strong>Current stage</strong><div>${escapeHtml(intake.stage)}</div></div>
      <div><strong>Next action</strong><div>${escapeHtml(nextRequiredAction(intake))}</div></div>
      <div><strong>Blocked by</strong><div>${escapeHtml(intake.blocker || '(none)')}</div></div>
    </div>

    <h3>Workflow progress</h3>
    ${fullStageRibbon(intake.stage)}
    <div class="mt-2">
      <button class="btn btn-sm btn-primary" onclick="advanceStage(${intake.id})">Advance to next stage</button>
    </div>

    <h3>Direct integrations</h3>
    <div class="row">
      <div class="col-md-4">${renderIntegrationCards([integrationCards[0]], true)}</div>
      <div class="col-md-4">${renderIntegrationCards([integrationCards[1]], true)}</div>
      <div class="col-md-4">${renderIntegrationCards([integrationCards[2]], true)}</div>
    </div>
    <div class="mt-2 d-flex gap-2 flex-wrap">
      <button class="btn btn-sm btn-dark" onclick="runClaude(${intake.id})" ${claudeReady ? '' : 'disabled'}>Run Claude analysis</button>
      <button class="btn btn-sm btn-success" onclick="runOpenAI(${intake.id})" ${openaiReady ? '' : 'disabled'}>Run OpenAI analysis</button>
      <button class="btn btn-sm btn-outline-secondary" onclick="runGitHubSnapshot(${intake.id})" ${githubReady ? '' : 'disabled'}>Capture GitHub snapshot</button>
    </div>
    <div class="small text-muted mt-2">
      ${claudeReady ? 'Claude is ready.' : 'Claude CLI is not available on this machine.'}
      ${openaiReady ? ' OpenAI is ready.' : ' OpenAI is waiting on OPENAI_API_KEY.'}
      ${githubReady ? ' GitHub/local snapshot is available.' : ' GitHub/local snapshot is unavailable.'}
    </div>
    <div id="runStatus" class="mt-2"></div>

    <h3>AI Exchange</h3>
    <div class="small text-muted mb-2">
      Use this turn-based review loop to send one engine's output to the other for challenge, refinement, and logged disagreement. This does not bypass human approval gates.
    </div>
    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-sm btn-outline-dark" onclick="runExchange(${intake.id}, 'Claude Code', 'OpenAI Codex')" ${(latestClaudeRun && openaiReady && data.exchange_ready) ? '' : 'disabled'}>Claude -> OpenAI review</button>
      <button class="btn btn-sm btn-outline-success" onclick="runExchange(${intake.id}, 'OpenAI Codex', 'Claude Code')" ${(latestOpenAiRun && claudeReady && data.exchange_ready) ? '' : 'disabled'}>OpenAI -> Claude review</button>
    </div>
    <div class="mt-2">
      <label class="form-label small mb-1">Follow-up question for the exchange</label>
      <input id="exchangeTopicInput" class="form-control form-control-sm" placeholder="Example: Which conclusions here are inferred and should become Q-#### items?">
      <div class="small text-muted mt-1">This becomes the explicit topic the target engine must answer or challenge.</div>
    </div>
    <div class="small text-muted mt-2">
      ${latestClaudeRun ? 'Claude has source output available.' : 'Run Claude first to create a source output.'}
      ${latestOpenAiRun ? ' OpenAI has source output available.' : ' Run OpenAI first to create a source output.'}
      ${data.exchange_ready ? ' Exchange lane is open for this intake.' : ` Exchange lane is locked at stage "${escapeHtml(intake.stage)}".`}
    </div>
    <div id="exchangeStatus" class="mt-2"></div>
    ${exchanges.length ? `
      <div class="exchange-list mt-3">
        ${exchanges.map((exchange) => `
          <div class="exchange-card">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div class="fw-semibold">Exchange #${exchange.id} - ${escapeHtml(exchange.topic || '(no topic)')}</div>
                <div class="small text-muted">${escapeHtml(exchange.source_engine)} -> ${escapeHtml(exchange.target_engine)} | ${escapeHtml(exchange.created_at.slice(0, 16))}</div>
              </div>
              ${renderExchangeStatusChip(exchange.status)}
            </div>
            <div class="row mt-2">
              <div class="col-md-4">
                <label class="form-label small mb-1">Agreement status</label>
                <select class="form-select form-select-sm" onchange="updateExchange(${exchange.id}, this.value, null)">
                  ${['Needs review', 'Agrees', 'Partially agrees', 'Disagrees', 'Human review required'].map((value) => `<option ${(exchange.agreement_status || 'Needs review') === value ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small mb-1">Next action</label>
                <select class="form-select form-select-sm" onchange="updateExchange(${exchange.id}, null, this.value)">
                  ${['Hold', 'Convert to Finding', 'Convert to Q', 'Draft Decision', 'Return to Intake Review'].map((value) => `<option ${(exchange.next_action || 'Hold') === value ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label small mb-1">Artifacts</label>
                <div class="d-flex gap-2 flex-wrap">
                  ${exchange.target_output_path ? renderArtifactAction(exchange.target_output_path, 'Target output') : ''}
                  ${exchange.source_output_path ? renderArtifactAction(exchange.source_output_path, 'Source output') : ''}
                </div>
              </div>
            </div>
            ${(exchange.target_output || exchange.error_text) ? `<details class="mt-2"><summary class="small text-muted">Show exchange result</summary><pre class="small mt-2">${escapeHtml((exchange.target_output || exchange.error_text || '').slice(0, 5000))}</pre></details>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '<div class="text-muted small mt-2">No AI exchanges yet for this intake.</div>'}

    <h3>Draft propagation</h3>
    <div class="small text-muted mb-2">
      These actions create review drafts only. They do not update live governance files automatically.
    </div>
    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-sm btn-outline-dark" onclick="promoteClaudeFindings(${intake.id})" ${latestClaudeRun ? '' : 'disabled'}>Send Claude output to Findings Draft</button>
      <button class="btn btn-sm btn-outline-success" onclick="promoteOpenAIQuestions(${intake.id})" ${latestOpenAiRun ? '' : 'disabled'}>Send OpenAI output to Question Draft</button>
      <button class="btn btn-sm ${data.commit_review_ready ? 'btn-primary' : 'btn-outline-primary'}" onclick="prepareCommitReview(${intake.id})" ${data.commit_review_ready ? '' : 'disabled'}>Prepare Commit Review</button>
    </div>
    <div class="small text-muted mt-2">
      ${latestClaudeRun ? 'Latest Claude run can be promoted into a findings draft.' : 'Run Claude first before creating a findings draft.'}
      ${latestOpenAiRun ? ' Latest OpenAI run can be promoted into a question draft.' : ' Run OpenAI first before creating a question draft.'}
      ${data.commit_review_ready ? ' Commit review gate is open for this intake.' : ` Commit review stays locked until stage reaches "Awaiting Commit Approval" (current: ${escapeHtml(intake.stage)}).`}
    </div>
    <div id="draftStatus" class="mt-2"></div>

    <h3>Generated artifacts</h3>
    ${latestClaudeRun || latestOpenAiRun || latestGitRun || draftLinks.length ? `
      <div class="artifact-list">
        ${latestClaudeRun ? renderArtifactAction(latestClaudeRun.output_path, 'Claude output') : ''}
        ${latestOpenAiRun ? renderArtifactAction(latestOpenAiRun.output_path, 'OpenAI output') : ''}
        ${latestGitRun ? renderArtifactAction(latestGitRun.output_path, 'GitHub snapshot') : ''}
        ${draftLinks.map((link) => renderArtifactAction(link.ref, link.kind === 'commit_review' ? 'Commit review draft' : 'Draft artifact')).join('')}
      </div>
    ` : '<div class="text-muted small">No generated artifacts yet.</div>'}
    <div id="artifactPreview" class="mt-2"></div>

    <h3>Approval Gates</h3>
    <div class="card p-2">
      ${data.gates.map((gate) => `
        <div class="gate-row">
          <span>
            <strong>${escapeHtml(gate.gate_name)}</strong>
            ${gate.note ? `<span class="small text-muted"> - ${escapeHtml(gate.note)}</span>` : ''}
          </span>
          <span>
            <span class="gate-status gate-status-${(gate.status || 'Not Started').toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(gate.status)}</span>
            <select onchange="updateGate(${intake.id}, '${escapeJs(gate.gate_name)}', this.value)" class="form-select form-select-sm d-inline-block ms-2" style="width:auto">
              ${['Not Started', 'Pending', 'Blocked', 'Approved', 'Rejected'].map((status) => `
                <option ${gate.status === status ? 'selected' : ''}>${status}</option>
              `).join('')}
            </select>
          </span>
        </div>
      `).join('')}
    </div>

    <h3>Files (${data.files.length})</h3>
    <ul class="small">
      ${data.files.map((file) => `<li><code>${escapeHtml(file.filename)}</code> - ${(file.size_bytes / 1024).toFixed(1)} KB</li>`).join('')}
    </ul>

    <h3>Linked items</h3>
    ${data.links.length
      ? `<ul>${data.links.map((link) => `<li><strong>${escapeHtml(link.kind)}:</strong> ${escapeHtml(link.ref)} ${renderInlineArtifactLink(link)}</li>`).join('')}</ul>`
      : '<div class="text-muted small">No links yet.</div>'}
    <div class="mt-2">
      <button class="btn btn-sm btn-outline-secondary" onclick="addLink(${intake.id})">+ Link F-####, Q-####, D-####, or commit SHA</button>
    </div>

    <h3>AI / integration runs</h3>
    ${data.runs.length
      ? data.runs.map((run) => `
          <div class="history-card">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div class="fw-semibold">${escapeHtml(run.engine)}</div>
                <div class="small text-muted">${escapeHtml(run.status)} | started ${escapeHtml(run.started_at || '')}</div>
                ${run.output_path ? `<div class="small text-muted"><code>${escapeHtml(run.output_path)}</code></div>` : ''}
              </div>
              <span class="status-chip ${run.status === 'completed' ? 'status-approved' : run.status === 'failed' ? 'status-blocked' : 'status-waiting'}">${escapeHtml(run.status)}</span>
            </div>
            ${run.error_text ? `<div class="small text-danger mt-2">${escapeHtml(run.error_text)}</div>` : ''}
            ${run.output_path ? `<div class="mt-2">${renderArtifactAction(run.output_path, 'Open output')}</div>` : ''}
            ${run.output_text ? `<details class="mt-2"><summary class="small text-muted">Show output</summary><pre class="small mt-2">${escapeHtml(run.output_text.slice(0, 4000))}</pre></details>` : ''}
          </div>
        `).join('')
      : '<div class="text-muted small">No AI or integration runs yet.</div>'}

    <h3>Workflow events (audit log)</h3>
    <pre class="small">${data.events.map((event) => `${event.ts.slice(0, 19)}  ${event.actor || ''}  ->  ${event.stage}  ${event.note || ''}`).join('\n')}</pre>
  `;
}

async function runClaude(intakeId) {
  await triggerRun(`/api/intake/${intakeId}/run_claude`, intakeId, 'Claude analysis');
}

async function runOpenAI(intakeId) {
  await triggerRun(`/api/intake/${intakeId}/run_openai`, intakeId, 'OpenAI analysis');
}

async function runGitHubSnapshot(intakeId) {
  await triggerRun(`/api/intake/${intakeId}/github_snapshot`, intakeId, 'GitHub snapshot');
}

async function triggerRun(url, intakeId, label) {
  const status = document.getElementById('runStatus');
  if (status) status.innerHTML = `<div class="alert alert-info">${escapeHtml(label)} running...</div>`;
  const response = await fetch(url, { method: 'POST' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    await openIntake(intakeId);
    const freshStatus = document.getElementById('runStatus');
    if (freshStatus) freshStatus.innerHTML = `<div class="alert alert-warning">${escapeHtml(label)} blocked: ${escapeHtml(payload.reason || payload.error || 'unknown error')}</div>`;
  } else {
    await openIntake(intakeId);
    const freshStatus = document.getElementById('runStatus');
    if (freshStatus) {
      freshStatus.innerHTML = `
        <div class="alert alert-success">
          ${escapeHtml(label)} completed.
          ${payload.output_path ? `<div class="mt-2">${renderArtifactAction(payload.output_path, 'Open output')}</div>` : ''}
        </div>
      `;
    }
    if (payload.output_path) {
      await openArtifact(payload.output_path, `${label} output`);
    }
  }
  await refreshNavCounts();
}

async function runExchange(intakeId, sourceEngine, targetEngine) {
  const exchangeStatus = document.getElementById('exchangeStatus');
  const topicInput = document.getElementById('exchangeTopicInput');
  const topic = (topicInput?.value || '').trim() || await showPromptDialog(`What should ${sourceEngine} challenge ${targetEngine} on?`, { title: 'AI Exchange topic', defaultValue: 'Challenge the latest analysis and flag anything that needs human review.' });
  if (!topic) return;
  if (exchangeStatus) exchangeStatus.innerHTML = `<div class="alert alert-info">Running AI exchange: ${escapeHtml(sourceEngine)} -> ${escapeHtml(targetEngine)}...</div>`;
  const response = await fetch(`/api/intake/${intakeId}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_engine: sourceEngine, target_engine: targetEngine, topic }),
  });
  const payload = await response.json().catch(() => ({}));
  await openIntake(intakeId);
  const freshStatus = document.getElementById('exchangeStatus');
  if (!response.ok) {
    if (freshStatus) freshStatus.innerHTML = `<div class="alert alert-warning">AI exchange blocked: ${escapeHtml(payload.reason || payload.error || 'unknown error')}</div>`;
  } else {
    if (freshStatus) freshStatus.innerHTML = `<div class="alert alert-success">AI exchange complete.${payload.output_path ? `<div class="mt-2">${renderArtifactAction(payload.output_path, 'Open exchange output')}</div>` : ''}</div>`;
    if (topicInput) topicInput.value = '';
    if (payload.output_path) {
      await openArtifact(payload.output_path, 'AI exchange output');
    }
  }
  await refreshNavCounts();
}

async function updateExchange(exchangeId, agreementStatus, nextAction) {
  const currentIntakeId = document.querySelector('h2')?.textContent?.match(/Intake #(\d+)/)?.[1];
  let intakeId = currentIntakeId ? Number(currentIntakeId) : null;
  if (!agreementStatus || !nextAction) {
    if (intakeId) {
      const detail = await fetchJSON(`/api/intake/${intakeId}`);
      const exchange = (detail.exchanges || []).find((item) => item.id === exchangeId);
      if (exchange) {
        agreementStatus = agreementStatus || exchange.agreement_status || 'Needs review';
        nextAction = nextAction || exchange.next_action || 'Hold';
      }
    } else {
      const exchanges = await fetchJSON(`/api/exchanges?company=${CURRENT_COMPANY}`);
      const exchange = exchanges.find((item) => item.id === exchangeId);
      if (exchange) {
        agreementStatus = agreementStatus || exchange.agreement_status || 'Needs review';
        nextAction = nextAction || exchange.next_action || 'Hold';
      }
    }
  }
  await fetch(`/api/exchange/${exchangeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agreement_status: agreementStatus, next_action: nextAction }),
  });
  if (intakeId) {
    await openIntake(intakeId);
  } else {
    await renderExchanges();
  }
}

async function promoteClaudeFindings(intakeId) {
  await triggerDraftAction(`/api/intake/${intakeId}/promote_claude_findings`, intakeId, 'Claude findings draft');
}

async function promoteOpenAIQuestions(intakeId) {
  await triggerDraftAction(`/api/intake/${intakeId}/promote_openai_questions`, intakeId, 'OpenAI question draft');
}

async function prepareCommitReview(intakeId) {
  await triggerDraftAction(`/api/intake/${intakeId}/commit_review`, intakeId, 'Commit review package');
}

async function triggerDraftAction(url, intakeId, label) {
  const status = document.getElementById('draftStatus');
  if (status) status.innerHTML = `<div class="alert alert-info">${escapeHtml(label)} running...</div>`;
  const response = await fetch(url, { method: 'POST' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    await openIntake(intakeId);
    const freshStatus = document.getElementById('draftStatus');
    if (freshStatus) freshStatus.innerHTML = `<div class="alert alert-warning">${escapeHtml(label)} blocked: ${escapeHtml(payload.reason || payload.error || 'unknown error')}</div>`;
  } else {
    await openIntake(intakeId);
    const freshStatus = document.getElementById('draftStatus');
    if (freshStatus) freshStatus.innerHTML = `
      <div class="alert alert-success">
        ${escapeHtml(label)} created at <code>${escapeHtml(payload.output_path || '')}</code>
        ${payload.output_path ? `<div class="mt-2">${renderArtifactAction(payload.output_path, 'Open generated draft')}</div>` : ''}
      </div>
    `;
    if (payload.output_path) {
      await openArtifact(payload.output_path, `${label} artifact`);
    }
  }
}

async function openArtifact(path, label) {
  const target = document.getElementById('artifactPreview') || document.getElementById('draftStatus') || document.getElementById('runStatus');
  if (target) target.innerHTML = `<div class="alert alert-info">Opening ${escapeHtml(label || 'artifact')}...</div>`;
  try {
    const payload = await fetchJSON(`/api/artifact?path=${encodeURIComponent(path)}`);
    if (target) {
      const content = payload.content || '';
      const sample = content.slice(0, 1000);
      const replacementCount = (sample.match(/�/g) || []).length;
      const looksBinary = sample.length > 0 && replacementCount / sample.length > 0.05;
      const bodyHtml = looksBinary
        ? `<div class="alert alert-secondary small mt-3 mb-0">This file is not plain text, so it cannot be previewed here. The file is attached at the path above — open it directly from disk to view its contents.</div>`
        : `<pre class="small mt-3">${escapeHtml(content.slice(0, 20000))}</pre>`;
      target.innerHTML = `
        <div class="artifact-preview-card">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <div class="fw-semibold">${escapeHtml(label || payload.name || 'Artifact')}</div>
              <div class="small text-muted"><code>${escapeHtml(payload.path)}</code></div>
            </div>
            <span class="status-chip status-info">${((payload.size_bytes || 0) / 1024).toFixed(1)} KB</span>
          </div>
          ${bodyHtml}
        </div>
      `;
    }
  } catch (error) {
    if (target) target.innerHTML = `<div class="alert alert-danger">Could not open artifact: ${escapeHtml(error.message)}</div>`;
  }
}

async function advanceStage(intakeId) {
  const data = await fetchJSON(`/api/intake/${intakeId}`);
  const currentIndex = WORKFLOW_STAGES.indexOf(data.intake.stage);
  if (currentIndex + 1 >= WORKFLOW_STAGES.length) {
    await showAlert('This intake is already at the final workflow stage.', { title: 'Already at final stage', kind: 'info' });
    return;
  }
  const next = WORKFLOW_STAGES[currentIndex + 1];
  const ok = await showConfirm(`Advance this intake from "${data.intake.stage}" to "${next}"?`, {
    title: 'Advance workflow stage',
    detail: 'The next stage will only be entered if its approval gate is approved. You can cancel to return to the intake.',
    okLabel: `Advance to ${next}`,
  });
  if (!ok) return;
  const response = await fetch(`/api/intake/${intakeId}/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_stage: next, actor: 'user' }),
  });
  if (response.ok) {
    await refreshNavCounts();
    openIntake(intakeId);
  } else {
    const payload = await response.json().catch(() => ({}));
    await showAlert(`This intake cannot advance to "${next}" yet.`, {
      title: 'Advance blocked by approval gate',
      kind: 'alert',
      detail: payload.reason || 'Unknown reason. Open the Approval Gates card on this intake and set the required gate to Approved before retrying.',
    });
  }
}

async function updateGate(intakeId, gateName, status) {
  await fetch(`/api/intake/${intakeId}/gate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gate_name: gateName, status, approver: 'user' }),
  });
  await refreshNavCounts();
  openIntake(intakeId);
}

async function addLink(intakeId) {
  const kind = await showPrompt('Choose the link type for this reference.', {
    title: 'Add link to intake',
    detail: 'Allowed values: finding, question, decision, or commit.',
    placeholder: 'finding | question | decision | commit',
    okLabel: 'Next',
  });
  if (!kind) return;
  const trimmedKind = kind.trim().toLowerCase();
  if (!['finding', 'question', 'decision', 'commit'].includes(trimmedKind)) {
    await showAlert('Link type must be one of: finding, question, decision, or commit.', { title: 'Invalid link type', kind: 'alert' });
    return;
  }
  const ref = await showPrompt(`Enter the reference for this ${trimmedKind}.`, {
    title: 'Reference identifier',
    detail: 'Examples: F-0001, Q-0001, D-0001, or a commit SHA.',
    placeholder: 'F-0001 / Q-0001 / D-0001 / commit SHA',
    okLabel: 'Add link',
  });
  if (!ref) return;
  await fetch(`/api/intake/${intakeId}/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: trimmedKind, ref: ref.trim() }),
  });
  openIntake(intakeId);
}

async function renderClassification() {
  const _r = VIEW_REQUEST;
  const rows = await fetchJSON(`/api/classification?company=${CURRENT_COMPANY}`);
  const categories = await fetchJSON('/api/categories');
  if (viewRequestIsStale(_r)) return;
  document.getElementById('mainView').innerHTML = `
    <h2>Repo Classification</h2>
    <p class="small text-muted">
      Use this table to decide what each repo is designed for and which business category it belongs to.
      This is where pricing, vendor feeds, notifications, payments, and other groupings become explicit.
    </p>
    <div class="classification-toolbar">
      <div class="small text-muted">
        Changes are now staged in the table until you save them. Rows marked <strong>Unsaved</strong> have local edits.
      </div>
      <div class="classification-toolbar-actions">
        <span id="classificationSaveSummary" class="small text-muted">No unsaved changes.</span>
        <button class="btn btn-sm btn-outline-secondary" type="button" onclick="renderClassification()">Reload</button>
        <button class="btn btn-sm btn-primary" type="button" onclick="saveAllClassificationRows()">Save all changes</button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-sm classification-table">
        <thead>
          <tr>
            <th>Repo</th>
            <th>Observed purpose</th>
            <th>Category</th>
            <th>Confidence</th>
            <th>Status</th>
            <th>Evidence</th>
            <th>Finding</th>
            <th>Question</th>
            <th>Approval</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr data-repo="${escapeHtml(row.repo_name)}" data-state="clean">
              <td><strong>${escapeHtml(row.repo_name)}</strong></td>
              <td><input class="form-control form-control-sm" data-field="observed_purpose" value="${escapeHtml(row.observed_purpose || '')}"></td>
              <td>
                <select class="form-select form-select-sm" data-field="proposed_category">
                  ${categories.map((category) => `<option ${(row.proposed_category || '') === category ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}
                </select>
              </td>
              <td>
                <select class="form-select form-select-sm" data-field="confidence">
                  <option value=""></option>
                  ${['High', 'Medium', 'Low'].map((value) => `<option ${(row.confidence || '') === value ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
              </td>
              <td>
                <select class="form-select form-select-sm" data-field="canonical_status">
                  <option value=""></option>
                  ${['canonical', 'duplicate', 'placeholder', 'dormant'].map((value) => `<option ${(row.canonical_status || '') === value ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
              </td>
              <td><input class="form-control form-control-sm" data-field="evidence" value="${escapeHtml(row.evidence || '')}"></td>
              <td><input class="form-control form-control-sm" data-field="finding_link" placeholder="F-####" value="${escapeHtml(row.finding_link || '')}"></td>
              <td><input class="form-control form-control-sm" data-field="question_link" placeholder="Q-####" value="${escapeHtml(row.question_link || '')}"></td>
              <td>
                <select class="form-select form-select-sm" data-field="approval_status">
                  ${['PENDING', 'APPROVED', 'REJECTED', 'REFINED'].map((value) => `<option ${(row.approval_status || 'PENDING') === value ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
              </td>
              <td class="classification-save-cell">
                <div class="classification-save-stack">
                  <span class="classification-row-status status-clean">Saved</span>
                  <button class="btn btn-sm btn-outline-primary" type="button" onclick="saveClassificationRow('${escapeJs(row.repo_name)}')">Save</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.querySelectorAll('.classification-table tr[data-repo] input, .classification-table tr[data-repo] select').forEach((el) => {
    const markDirty = () => {
      const tr = el.closest('tr');
      setClassificationRowState(tr, 'dirty');
    };
    el.addEventListener('input', markDirty);
    el.addEventListener('change', markDirty);
  });
  updateClassificationSaveSummary();
}

function getClassificationPayload(tr) {
  const payload = {
    company: CURRENT_COMPANY,
    repo_name: tr.dataset.repo,
  };
  tr.querySelectorAll('[data-field]').forEach((field) => {
    payload[field.dataset.field] = field.value;
  });
  return payload;
}

function setClassificationRowState(tr, state, message) {
  tr.dataset.state = state;
  tr.classList.remove('classification-row-dirty', 'classification-row-saving', 'classification-row-error');
  const status = tr.querySelector('.classification-row-status');
  if (!status) return;
  status.classList.remove('status-clean', 'status-dirty', 'status-saving', 'status-error');

  if (state === 'dirty') {
    tr.classList.add('classification-row-dirty');
    status.classList.add('status-dirty');
    status.textContent = message || 'Unsaved';
  } else if (state === 'saving') {
    tr.classList.add('classification-row-saving');
    status.classList.add('status-saving');
    status.textContent = message || 'Saving...';
  } else if (state === 'error') {
    tr.classList.add('classification-row-error');
    status.classList.add('status-error');
    status.textContent = message || 'Save failed';
  } else {
    status.classList.add('status-clean');
    status.textContent = message || 'Saved';
  }
  updateClassificationSaveSummary();
}

function updateClassificationSaveSummary() {
  const summary = document.getElementById('classificationSaveSummary');
  if (!summary) return;
  const dirtyCount = document.querySelectorAll('.classification-table tr[data-repo][data-state="dirty"]').length;
  const savingCount = document.querySelectorAll('.classification-table tr[data-repo][data-state="saving"]').length;
  const errorCount = document.querySelectorAll('.classification-table tr[data-repo][data-state="error"]').length;

  if (savingCount) {
    summary.textContent = `Saving ${savingCount} row${savingCount === 1 ? '' : 's'}...`;
    return;
  }
  if (errorCount) {
    summary.textContent = `${errorCount} row${errorCount === 1 ? '' : 's'} failed to save.`;
    return;
  }
  if (dirtyCount) {
    summary.textContent = `${dirtyCount} unsaved row${dirtyCount === 1 ? '' : 's'}. Click "Save all changes" when ready.`;
    return;
  }
  summary.textContent = 'All classification changes are saved.';
}

async function saveClassificationRow(repoName) {
  const tr = document.querySelector(`.classification-table tr[data-repo="${CSS.escape(repoName)}"]`);
  if (!tr) return;
  setClassificationRowState(tr, 'saving');
  try {
    const response = await fetch('/api/classification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getClassificationPayload(tr)),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    setClassificationRowState(tr, 'clean');
  } catch (error) {
    setClassificationRowState(tr, 'error', 'Save failed');
  }
}

async function saveAllClassificationRows() {
  const dirtyRows = Array.from(document.querySelectorAll('.classification-table tr[data-repo][data-state="dirty"], .classification-table tr[data-repo][data-state="error"]'));
  if (!dirtyRows.length) {
    updateClassificationSaveSummary();
    return;
  }
  for (const tr of dirtyRows) {
    await saveClassificationRow(tr.dataset.repo);
  }
}

let LAST_CONSTITUTION_APPROVER = '';

async function approveConstitution(intakeId) {
  const approver = (document.getElementById(`capprover-${intakeId}`)?.value || '').trim();
  const statusEl = document.getElementById(`cstatus-${intakeId}`);
  if (!approver) {
    if (statusEl) statusEl.textContent = 'Enter an approver name first.';
    return;
  }
  if (statusEl) statusEl.textContent = 'Approving…';
  try {
    let res = await fetch(`/api/intake/${intakeId}/gate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gate_name: 'Constitution Eligible', status: 'Approved', approver, note: 'Approved via Constitution Gate' }),
    });
    if (!res.ok) throw new Error(`Gate approval failed (HTTP ${res.status})`);
    res = await fetch(`/api/intake/${intakeId}/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_stage: 'Constitution Approved', actor: approver, note: 'Approved into Constitution' }),
    });
    const jd = await res.json().catch(() => ({}));
    if (!res.ok || jd.error) throw new Error(jd.reason || jd.error || `Advance failed (HTTP ${res.status})`);
    LAST_CONSTITUTION_APPROVER = approver;
    if (typeof showToast === 'function') showToast(`Intake #${intakeId} approved into the Constitution`, 'success');
    renderConstitution();
  } catch (e) {
    if (statusEl) statusEl.textContent = e.message || 'Approval failed';
  }
}

function renderConstitutionCard(intake) {
  const isApproved = intake.stage === 'Constitution Approved';
  return `
    <div class="constitution-card${isApproved ? ' is-approved' : ''}">
      <div class="constitution-card-head">
        <div>
          <div class="constitution-card-title">#${intake.id} — ${escapeHtml(intake.note || '(no note)')}</div>
          <div class="small text-muted">${intake.employee ? `Employee: ${escapeHtml(prettyName(intake.employee))} &middot; ` : ''}Stage: <strong>${escapeHtml(intake.stage)}</strong></div>
        </div>
        <span class="constitution-state ${isApproved ? 'approved' : 'pending'}">${isApproved ? 'In Constitution' : 'Awaiting approval'}</span>
      </div>
      ${isApproved ? '' : `
        <div class="constitution-action">
          <input type="text" class="form-control form-control-sm" id="capprover-${intake.id}" placeholder="Approver (e.g. Ryan Cochran)" value="${escapeHtml(LAST_CONSTITUTION_APPROVER || '')}">
          <button class="btn btn-sm btn-primary" type="button" onclick="approveConstitution(${intake.id})">Approve into Constitution</button>
        </div>
        <div class="small text-muted mt-1" id="cstatus-${intake.id}"></div>
      `}
      <button class="btn btn-sm btn-link p-0 mt-2" type="button" onclick="openIntake(${intake.id})">Open intake detail</button>
    </div>`;
}

async function renderConstitution() {
  const _r = VIEW_REQUEST;
  const intakes = await fetchJSON(`/api/intake?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  const candidates = intakes.filter((item) => item.stage === 'Constitution Candidate' || item.stage === 'Constitution Approved');
  const pending = candidates.filter((c) => c.stage === 'Constitution Candidate');
  const approved = candidates.filter((c) => c.stage === 'Constitution Approved');
  document.getElementById('mainView').innerHTML = `
    <div class="constitution-view">
      <h2>Constitution Gate</h2>
      <div class="constitution-note"><strong>Hard rule:</strong> nothing enters the Constitution without an explicit approval here.</div>
      <div class="constitution-checklist">
        <div>1. Findings approved</div>
        <div>2. Questions resolved</div>
        <div>3. Decisions approved</div>
        <div>4. Governance draft reviewed</div>
        <div>5. Commit approved</div>
        <div>6. Constitution approval</div>
      </div>
      <h3 class="constitution-section-head">Awaiting approval (${pending.length})</h3>
      ${pending.length ? pending.map(renderConstitutionCard).join('') : '<div class="text-muted small mb-2">No candidates are waiting at the gate right now.</div>'}
      <h3 class="constitution-section-head">In the Constitution (${approved.length})</h3>
      ${approved.length ? approved.map(renderConstitutionCard).join('') : '<div class="text-muted small">Nothing has been approved into the Constitution yet.</div>'}
    </div>
  `;
}

function renderTeamMembersShell() {
  document.getElementById('mainView').innerHTML = `
    <h2>Team Members</h2>
    <p class="small text-muted">This is the top of the decision tree. Start with the team member, then review their departments, daily work model, repos, and question load.</p>
    <div class="row g-3">
      <div class="col-xl-4">
        <div class="dash-card">
          <div class="fw-semibold mb-2">Team member list</div>
          <div class="small text-muted mb-3">Each card shows unanswered questions first so the team can see who is currently blocking governance progress.</div>
          <div id="teamMemberList" class="member-list-stack">
            <div class="dash-card text-muted">Loading team members...</div>
          </div>
        </div>
        <div class="dash-card mt-3">
          <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
            <div>
              <div class="fw-semibold">Assigned question packet</div>
              <div class="small text-muted">Work from one packet document and one AI chat surface. The urgent items below are only the top of Ryan's full queue.</div>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-sm btn-outline-primary" type="button" onclick="showQuestionsForCurrentMember()">Open packet</button>
              <button class="btn btn-sm btn-outline-secondary" type="button" onclick="scrollToTeamQuickChat()">Ask AI here</button>
            </div>
          </div>
          <div id="teamMemberQuestionRail" class="member-question-rail">
            <div class="text-muted small">Loading assigned packet overview...</div>
          </div>
        </div>
      </div>
      <div class="col-xl-8">
        <div id="teamMemberWorkspace"><div class="dash-card text-muted">Loading workspace...</div></div>
      </div>
    </div>
  `;
}

const MVIEW_TEAM_ROSTER = [
  { display_name: 'Ryan Cochran', role: '' },
  { display_name: 'Sachin Shinde', role: '' },
  { display_name: 'Nikhil Salunke', role: 'Data Scientist' },
  { display_name: 'Pranav Nandeshwar', role: 'Data Scientist' },
  { display_name: 'Gabor Korosi', role: 'Data Scientist' },
  { display_name: 'Christos Batsios', role: 'Data Scientist' },
  { display_name: 'Aboli Mundralkar', role: 'Developer' },
  { display_name: 'Utkarsha Chougule', role: 'QA' },
  { display_name: 'Shubham Kamble', role: 'Content Writer' },
  { display_name: 'Pragati Dhumal', role: 'Developer' },
  { display_name: 'Pooja Wable', role: 'Developer' },
  { display_name: 'Vaishnavi Dhawale', role: 'Developer' },
  { display_name: 'Riya Wankhade', role: 'Web Scraper' },
  { display_name: 'Sanskriti Choudante', role: 'Developer' },
  { display_name: 'Rohit Pandey', role: 'Marketing' },
  { display_name: 'Tushar Patil', role: 'Developer' },
  { display_name: 'Ajay Landge', role: 'Marketing' },
  { display_name: 'Tejas Zurange', role: 'Graphic' },
  { display_name: 'Krishna Sable', role: 'Marketing' },
  { display_name: 'Gautammi Kamath', role: 'Sales' },
];

const MVIEW_ROLE_ORDER = ['Data Scientist', 'Developer', 'QA', 'Web Scraper', 'Content Writer', 'Marketing', 'Graphic', 'Sales'];

function renderTeamMemberCard(member) {
  return `
    <button class="member-list-card ${member.key === CURRENT_TEAM_MEMBER ? 'active' : ''}" type="button" onclick="openTeamMemberWorkspace('${escapeJs(member.key)}')">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div class="text-start">
          <div class="fw-semibold">${escapeHtml(member.display_name)}</div>
          <div class="small text-muted">${member.unanswered_questions} unanswered / ${member.total_questions} total questions</div>
          <div class="small text-muted">${member.assigned_intakes} intakes - ${member.assigned_files} files</div>
        </div>
        <span class="team-pill-count">${member.unanswered_questions}</span>
      </div>
    </button>
  `;
}

function renderTeamMembersByRole(members, roster, roleOrder) {
  const memberByName = new Map();
  (members || []).forEach((m) => {
    if (m && m.display_name) {
      memberByName.set(m.display_name.toLowerCase().trim(), m);
    }
  });

  const seen = new Set();
  const individuals = [];
  const byRole = new Map();

  roster.forEach((entry) => {
    const nameKey = entry.display_name.toLowerCase().trim();
    if (seen.has(nameKey)) return;
    seen.add(nameKey);
    const apiMember = memberByName.get(nameKey);
    const member = apiMember || {
      key: entry.display_name.replace(/\s+/g, '_'),
      display_name: entry.display_name,
      unanswered_questions: 0,
      total_questions: 0,
      assigned_intakes: 0,
      assigned_files: 0,
    };
    if (!entry.role) {
      individuals.push(member);
    } else {
      if (!byRole.has(entry.role)) byRole.set(entry.role, []);
      byRole.get(entry.role).push(member);
    }
  });

  const parts = individuals.map(renderTeamMemberCard);

  const orderedRoles = (roleOrder || []).filter((role) => byRole.has(role));
  Array.from(byRole.keys()).forEach((role) => {
    if (!orderedRoles.includes(role)) orderedRoles.push(role);
  });

  orderedRoles.forEach((role) => {
    const list = byRole.get(role) || [];
    if (!list.length) return;
    parts.push(`
      <div class="member-role-group">
        <div class="member-role-heading">${escapeHtml(role)} <span class="member-role-count">${list.length}</span></div>
        <div class="member-role-stack">${list.map(renderTeamMemberCard).join('')}</div>
      </div>
    `);
  });

  if (!parts.length) {
    return '<div class="text-muted">No team members found yet.</div>';
  }
  return parts.join('');
}

function renderTeamMembersByGroup(members, roleOrder) {
  const seen = new Set();
  const individuals = [];
  const byRole = new Map();
  (members || []).forEach((m) => {
    if (!m || !m.key || seen.has(m.key)) return;
    seen.add(m.key);
    const group = (m.group || '').trim();
    if (!group) {
      individuals.push(m);
    } else {
      if (!byRole.has(group)) byRole.set(group, []);
      byRole.get(group).push(m);
    }
  });
  const byOrder = (a, b) => (a.order ?? 9999) - (b.order ?? 9999);
  individuals.sort(byOrder);
  const parts = individuals.map(renderTeamMemberCard);
  const orderedRoles = (roleOrder || []).filter((role) => byRole.has(role));
  Array.from(byRole.keys()).forEach((role) => {
    if (!orderedRoles.includes(role)) orderedRoles.push(role);
  });
  orderedRoles.forEach((role) => {
    const list = (byRole.get(role) || []).slice().sort(byOrder);
    if (!list.length) return;
    parts.push(`
      <div class="member-role-group">
        <div class="member-role-heading">${escapeHtml(role)} <span class="member-role-count">${list.length}</span></div>
        <div class="member-role-stack">${list.map(renderTeamMemberCard).join('')}</div>
      </div>
    `);
  });
  return parts.length ? parts.join('') : '<div class="text-muted">No team members found yet.</div>';
}

function renderMviewTeamMembersByRole(members) {
  // Single source of truth: roles/groups now come from the backend (TEAM_MEMBER_PROFILES),
  // not a hardcoded roster. Edit profiles in governance_ui.py only.
  return renderTeamMembersByGroup(members, MVIEW_ROLE_ORDER);
}

function renderTeamMembersList(members) {
  if (CURRENT_COMPANY === 'MView') {
    return renderMviewTeamMembersByRole(members);
  }
  if (!members.length) {
    return '<div class="text-muted">No team members found yet.</div>';
  }
  return members.map(renderTeamMemberCard).join('');
}

function renderTeamMemberQuestionRail(detail) {
  const urgent = (detail.top_questions || [])
    .filter((question) => (question.status || 'OPEN') !== 'ANSWERED')
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
    })
    .slice(0, 8);

  if (!urgent.length) {
    return '<div class="text-muted small">No urgent unanswered questions are assigned to this team member right now.</div>';
  }

  return `
    <div class="member-packet-summary">
      <div>
        <div class="fw-semibold">One document for ${escapeHtml(detail.display_name)}</div>
        <div class="small text-muted">Use one packet document for repo approvals, operational questions, governance approvals, and anything else currently assigned.</div>
      </div>
      <div class="member-packet-summary-metrics">
        <span class="repo-chip">${detail.question_unanswered} unanswered</span>
        <span class="repo-chip">${detail.question_total} total</span>
      </div>
    </div>
    <div class="member-packet-actions">
      <button class="btn btn-sm btn-primary" type="button" onclick="showQuestionsForCurrentMember()">Open packet document</button>
      <button class="btn btn-sm btn-outline-secondary" type="button" onclick="scrollToTeamQuickChat()">Ask Claude / OpenAI here</button>
    </div>
    <div class="small text-muted mb-2">Urgent first in the packet. Click a question to jump to it inside the single packet document:</div>
    <div class="member-question-list compact">
      ${urgent.map((question) => `
        <button class="member-question-row rail member-question-open" type="button" onclick="openMemberQuestionDocument('${escapeJs(detail.key)}', { anchorQid: '${escapeJs(question.qid)}', sourceView: 'team' })">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <div class="fw-semibold">${escapeHtml(question.qid)}</div>
            <span class="badge badge-${(question.priority || 'unknown').toLowerCase()}">${escapeHtml(question.priority || 'UNKNOWN')}</span>
          </div>
          <div class="small fw-semibold mb-1">${escapeHtml(question.title || '')}</div>
          <div class="small text-muted">${escapeHtml(question.short_question || '')}</div>
          <div class="small text-muted mt-2">Opens inside the shared packet document</div>
        </button>
      `).join('')}
    </div>
  `;
}

async function ensureMemberQuestionPacket(memberKey) {
  const hasCurrent = CURRENT_MEMBER_QUESTION_DOCUMENT
    && CURRENT_MEMBER_QUESTION_DOCUMENT.memberKey === memberKey
    && CURRENT_MEMBER_QUESTION_DOCUMENT.company === CURRENT_COMPANY;
  if (hasCurrent) return CURRENT_MEMBER_QUESTION_DOCUMENT;
  const data = await fetchJSON(`/api/questions?company=${CURRENT_COMPANY}`);
  const packet = buildMemberQuestionPacket(data, memberKey);
  CURRENT_MEMBER_QUESTION_DOCUMENT = {
    ...packet,
    company: CURRENT_COMPANY,
    team_counts: data.team_counts || [],
    anchor_qid: '',
  };
  return CURRENT_MEMBER_QUESTION_DOCUMENT;
}

function setActiveTeamQuickChatEngine(engine) {
  const input = document.getElementById('teamQuickChatEngine');
  if (input) input.value = engine;
  document.querySelectorAll('[data-team-quick-chat-engine]').forEach((button) => {
    button.classList.toggle('active', button.dataset.teamQuickChatEngine === engine);
  });
}

function useTeamQuickChatSuggestion(promptText) {
  const composer = document.getElementById('teamQuickChatComposer');
  if (composer) {
    composer.value = promptText;
    composer.focus();
  }
}

async function sendTeamMemberQuickChat(memberKey) {
  const composer = document.getElementById('teamQuickChatComposer');
  const engine = document.getElementById('teamQuickChatEngine')?.value || 'Claude Code';
  const prompt = composer?.value?.trim();
  if (!prompt) return;
  const status = document.getElementById('teamQuickChatStatus');
  try {
    const packet = await ensureMemberQuestionPacket(memberKey);
    const state = loadMemberQuestionDocumentState(packet);
    appendMemberQuestionChatMessage('user', engine, prompt);
    if (composer) composer.value = '';
    if (status) status.textContent = `Sending to ${engine}...`;
    const response = await fetch('/api/member_question_chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        member_key: memberKey,
        engine,
        prompt,
        session_notes: state.session_notes || '',
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.reason || payload.error || `HTTP ${response.status}`);
    }
    appendMemberQuestionChatMessage('assistant', engine, payload.response_text || '(No response text returned)');
    if (status) status.textContent = `${engine} responded using ${payload.question_count || packet.totalCount} assigned questions.`;
  } catch (error) {
    appendMemberQuestionChatMessage('system', engine, `Error: ${error.message}`);
    if (status) status.textContent = `${engine} failed: ${error.message}`;
  }
  await renderTeamMembers();
}

function scrollToTeamQuickChat() {
  const target = document.getElementById('teamQuickChatCard');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function renderDepartmentTagEditor(detail) {
  const departments = CURRENT_DEPARTMENT_CATALOG || [];
  if (!departments.length) {
    return '<div class="small text-muted">Department catalog still loading.</div>';
  }
  const selected = new Set(detail.departments || []);
  const chips = departments.map((department) => `
    <label class="member-tag-option">
      <input type="checkbox" class="form-check-input me-2" data-member-dept-tag="${escapeHtml(department.key)}" ${selected.has(department.key) ? 'checked' : ''}>
      <span>${escapeHtml(department.name)}</span>
    </label>
  `).join('');
  return `
    <div class="member-tag-editor">
      <div class="small text-muted mb-2">These tags drive department routing, department workspace membership, and PM demo filtering.</div>
      <div class="member-tag-option-grid">${chips}</div>
      <div class="d-flex justify-content-between align-items-center gap-2 mt-3 flex-wrap">
        <div id="memberDeptTagStatus" class="small text-muted">Current tags: ${(detail.departments || []).map((item) => escapeHtml(prettyDepartmentName(item))).join(', ') || 'None'}</div>
        <button class="btn btn-sm btn-outline-primary" type="button" onclick="saveTeamMemberDepartmentTags('${escapeJs(detail.key)}')">Save department tags</button>
      </div>
    </div>
  `;
}

async function saveTeamMemberDepartmentTags(memberKey) {
  const checked = Array.from(document.querySelectorAll('[data-member-dept-tag]:checked')).map((el) => el.dataset.memberDeptTag);
  const status = document.getElementById('memberDeptTagStatus');
  if (status) status.textContent = 'Saving department tags...';
  try {
    const response = await fetch('/api/team_member_department_tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        member_key: memberKey,
        departments: checked,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = `Saved ${checked.length} department tag(s).`;
    await refreshNavCounts();
    await renderTeamMembers();
  } catch (error) {
    if (status) status.textContent = `Save failed: ${error.message}`;
  }
}

function teamMemberQuestionStatusClass(status) {
  if (status === 'APPROVED') return 'badge-approved';
  if (status === 'ANSWERED') return 'badge-info';
  if (status === 'ANSWER_PENDING_REVIEW' || status === 'NEEDS_FOLLOW_UP') return 'badge-high';
  if (status === 'SENT_TO_TEAM_MEMBER') return 'badge-medium';
  if (status === 'SUGGESTED_FOLLOW_UP') return 'badge-low';
  if (status === 'CLOSED') return 'badge-unknown';
  return 'badge-medium';
}

function renderTeamMemberQuestionPacketStatus(detail) {
  const counts = detail.team_member_question_counts || {};
  const packets = detail.team_member_question_packets || [];
  const latestPacket = packets[0] || null;
  const activeQuestions = (detail.team_member_questions || [])
    .filter((row) => !['APPROVED', 'CLOSED', 'SUGGESTED_FOLLOW_UP'].includes(row.status || ''))
    .slice(0, 50);
  const approvedQuestions = (detail.team_member_questions || [])
    .filter((row) => (row.status || '') === 'APPROVED');
  return `
    <div class="dash-card member-roundtrip-card ms-packetstatus mb-3 gw-expandable">
      <button class="gw-fs-close" type="button" onclick="toggleSectionFullscreen(this)" title="Close full view">&#10005;</button>
      <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
        <div>
          <div class="member-section-title">Question packet status</div>
          <div class="small text-muted">Type an answer, then Save it or use "Save &amp; Ryan approves" in one step. Approved items move to the "Approved by Ryan" list below and stay visible, and every action is logged in the correspondence log.</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-outline-primary" type="button" onclick="exportTeamMemberQuestionPacket('${escapeJs(detail.key)}')">Export packet</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="bulkAcceptTeamMemberAnswers('${escapeJs(detail.key)}')">Accept HIGH-confidence answers</button>
          <button class="btn btn-sm btn-outline-secondary fs-corner-btn" type="button" data-fs-toggle onclick="toggleSectionFullscreen(this)">Full view</button>
        </div>
      </div>
      <div class="repo-chip-row mb-3">
        ${Object.entries(counts).filter(([, value]) => value).map(([key, value]) => `<span class="repo-chip">${escapeHtml(key)}: ${value}</span>`).join('') || '<span class="text-muted small">No team-member questions yet.</span>'}
      </div>
      <div class="small text-muted mb-2">${latestPacket ? `Latest packet: v${latestPacket.packet_version} exported ${escapeHtml(latestPacket.exported_at || '')}` : 'No packet exported yet.'}</div>
      <div class="member-question-list compact member-question-scroll">
        ${activeQuestions.length ? activeQuestions.map((row) => {
          const code = row.question_code;
          const answered = !!row.latest_answer_markdown;
          return `
          <div class="member-question-row compact">
            <div class="d-flex justify-content-between gap-2">
              <div>
                <div class="fw-semibold">${escapeHtml(code)} - ${escapeHtml(row.title || '')}</div>
                <div class="small text-muted">${escapeHtml((row.latest_answer_confidence || '').toUpperCase() || row.priority || 'MEDIUM')} ${answered ? '- answer staged' : ''}</div>
              </div>
              <span class="badge ${teamMemberQuestionStatusClass(row.status || 'NEW')}">${escapeHtml(row.status || 'NEW')}</span>
            </div>
            <textarea id="ans_${escapeHtml(code)}" class="form-control form-control-sm mt-2" rows="2" placeholder="Type the answer here...">${escapeHtml(row.latest_answer_markdown || '')}</textarea>
            <div class="d-flex gap-2 mt-2 flex-wrap align-items-center">
              <button class="btn btn-sm btn-outline-primary" type="button" onclick="saveInlineAnswer('${escapeJs(detail.key)}','${escapeJs(code)}', false)">Save answer</button>
              <button class="btn btn-sm btn-success" type="button" onclick="saveInlineAnswer('${escapeJs(detail.key)}','${escapeJs(code)}', true)">Save &amp; Ryan approves</button>
              ${answered ? `<button class="btn btn-sm btn-outline-success" type="button" onclick="acceptTeamMemberQuestion('${escapeJs(detail.key)}','${escapeJs(code)}')">Ryan approves &#10003;</button><span class="small text-muted">Answered - awaiting Ryan approval</span>` : ''}
            </div>
          </div>
        `; }).join('') : '<div class="small text-muted">No active packet questions yet.</div>'}
      </div>
      ${approvedQuestions.length ? `
        <div class="mt-3">
          <div class="fw-semibold small mb-2">Approved by Ryan <span class="repo-chip">${approvedQuestions.length}</span></div>
          <div class="member-question-list compact member-question-scroll">
            ${approvedQuestions.map((row) => `
              <div class="member-question-row compact" style="border-left:3px solid #1f9d55">
                <div class="d-flex justify-content-between gap-2">
                  <div>
                    <div class="fw-semibold">${escapeHtml(row.question_code)} - ${escapeHtml(row.title || '')}</div>
                    ${row.latest_answer_markdown ? `<div class="small mt-1">${escapeHtml(row.latest_answer_markdown)}</div>` : ''}
                  </div>
                  <span class="badge badge-approved" style="white-space:nowrap">&#10003; Approved by Ryan</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}
    </div>
  `;
}

async function saveInlineAnswer(memberKey, code, accept) {
  const ta = document.getElementById(`ans_${code}`);
  const answer = (ta && ta.value || '').trim();
  if (!answer) { showToast('Type an answer first.', 'error'); return; }
  if (ta) ta.disabled = true;
  try {
    const resp = await fetch(`/api/${encodeURIComponent(CURRENT_COMPANY)}/team-members/${encodeURIComponent(memberKey)}/questions/${encodeURIComponent(code)}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer_markdown: answer, accept: !!accept }),
    });
    if (resp.ok) {
      await renderTeamMembers();
    } else {
      if (ta) ta.disabled = false;
      showToast(`Save failed: ${resp.status}`, 'error');
    }
  } catch (error) {
    if (ta) ta.disabled = false;
    showToast(`Save error: ${error.message || error}`, 'error');
  }
}

async function acceptTeamMemberQuestion(memberKey, code) {
  try {
    const resp = await fetch(`/api/${encodeURIComponent(CURRENT_COMPANY)}/team-members/${encodeURIComponent(memberKey)}/questions/${encodeURIComponent(code)}/accept`, { method: 'POST' });
    if (resp.ok) {
      await renderTeamMembers();
    } else {
      showToast(`Approve failed: ${resp.status}`, 'error');
    }
  } catch (error) {
    showToast(`Approve error: ${error.message || error}`, 'error');
  }
}

function renderTeamMemberCorrespondence(detail) {
  const rows = detail.team_member_correspondence || [];
  return `
    <div class="dash-card member-roundtrip-card ms-correspondence mb-3">
      <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
        <div>
          <div class="member-section-title">Correspondence log</div>
          <div class="small text-muted">Append-only timeline of what was uploaded, generated, sent, parsed, and approved for this team member.</div>
        </div>
        <button class="btn btn-sm btn-outline-secondary" type="button" onclick="renderTeamMembers()">Refresh timeline</button>
      </div>
      <div class="member-correspondence-list">
        ${rows.length ? rows.map((row) => `
          <div class="member-correspondence-row">
            <div class="member-correspondence-time">${escapeHtml(row.created_at || '')}</div>
            <div>
              <div class="fw-semibold">${escapeHtml(row.event_type || '')}</div>
              <div class="small text-muted">${escapeHtml(row.event_summary || '')}</div>
              <div class="small text-muted">${escapeHtml(row.actor || 'system')}</div>
            </div>
          </div>
        `).join('') : '<div class="small text-muted">No correspondence logged yet.</div>'}
      </div>
    </div>
  `;
}

function renderMemberFileWorkspace(detail) {
  const files = detail.member_file_items || [];
  const rows = files.length ? files.map((file) => {
    const suggestions = file.suggested_departments || [];
    const suggestionChips = suggestions.length
      ? suggestions.map((item) => `
          <span class="repo-chip">
            ${escapeHtml(prettyDepartmentName(item.key))}
            <span class="text-muted">(${escapeHtml(item.confidence || 'medium')})</span>
          </span>
        `).join('')
      : '<span class="text-muted small">No suggested department tags yet.</span>';
    const summary = file.analysis_summary
      ? `<div class="member-file-summary"><div class="mf-label">AI summary</div>${escapeHtml(file.analysis_summary)}</div>`
      : '<div class="member-file-summary mf-empty">No analysis yet. Click <strong>Process with AI</strong> to generate a grounded summary and suggested department tags.</div>';
    const engineLabel = file.analysis_engine ? `${file.analysis_engine} - ${file.analysis_status || 'completed'}` : 'Pending analysis';
    return `
      <div class="member-file-row">
        <div class="member-file-head">
          <div class="member-file-headinfo">
            <div class="member-file-name">${escapeHtml(file.original_filename)}</div>
            <div class="member-file-meta">
              <span class="mf-tag">${escapeHtml(file.file_purpose || 'other')}</span>
              <span class="mf-tag">${escapeHtml(file.source_type || 'document')}</span>
              <span class="mf-status ${file.analysis_engine ? 'mf-status-done' : 'mf-status-pending'}">${file.analysis_engine ? 'Analyzed - ' + escapeHtml(file.analysis_engine) : 'Pending analysis'}</span>
            </div>
          </div>
          <div class="member-file-actions">
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="analyzeTeamMemberFile(${file.id}, '${escapeJs(detail.key)}', 'Claude')">Process with AI</button>
            ${['initial_doc', 'supporting_evidence'].includes(file.file_purpose || 'other') ? `<button class="btn btn-sm btn-outline-primary" type="button" onclick="generateTeamMemberQuestions('${escapeJs(detail.key)}', ${file.id}, 'Claude')">Generate questions</button>` : ''}
            ${(file.file_purpose || '') === 'answer_packet' ? `<button class="btn btn-sm btn-outline-primary" type="button" onclick="parseTeamMemberAnswers('${escapeJs(detail.key)}', ${file.id}, 'Claude')">Parse answers</button>` : ''}
            ${suggestions.length ? `<button class="btn btn-sm btn-outline-secondary" type="button" onclick="applySuggestedDepartments('${escapeJs(detail.key)}', ${file.id})">Apply suggested tags</button>` : ''}
          </div>
        </div>
        <div class="member-file-metrics">
          <span class="mf-metric"><strong>${file.generated_question_count || 0}</strong> questions generated</span>
          <span class="mf-metric"><strong>${file.parsed_answer_count || 0}</strong> answers parsed</span>
        </div>
        ${summary}
        <div class="member-file-suggestions">
          <div class="mf-label">Suggested department tags</div>
          <div class="repo-chip-row">${suggestionChips}</div>
        </div>
        ${file.analysis_error_text ? `<div class="mf-error">${escapeHtml(file.analysis_error_text)}</div>` : ''}
      </div>
    `;
  }).join('') : '<div class="small text-muted">No files uploaded to this member workspace yet.</div>';

  return `
    <div class="member-file-workspace">
      <div id="memberFileDropzone" class="dropzone">
        <div class="dropzone-icon">Drop file here (or click to choose)</div>
        <div class="small text-muted">Job descriptions, SOPs, screenshots, notes, or mixed work packages for ${escapeHtml(detail.display_name)}</div>
        <input type="file" id="memberFileInput" multiple class="d-none">
      </div>
      <div id="memberFileStaged" class="small text-muted mt-2">No file selected yet.</div>
      <div class="row mt-3 g-3">
        <div class="col-md-4">
          <label class="form-label small">File purpose</label>
          <select id="memberFilePurpose" class="form-select form-select-sm">
            <option value="initial_doc">Initial documentation</option>
            <option value="answer_packet">Answers to existing questions</option>
            <option value="supporting_evidence">Supporting evidence</option>
            <option value="meeting_note">Meeting note</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Source type</label>
          <select id="memberFileSource" class="form-select form-select-sm">
            <option value="document">Document</option>
            <option value="job_description">Job description</option>
            <option value="screenshot">Screenshot</option>
            <option value="meeting_notes">Meeting notes</option>
            <option value="mixed">Mixed intake</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">AI routing</label>
          <select id="memberFileAI" class="form-select form-select-sm">
            <option value="Claude" selected>Claude</option>
            <option value="OpenAI">OpenAI</option>
            <option value="Both">Both</option>
          </select>
        </div>
      </div>
      <div class="mt-2">
        <label class="form-label small">What is this file about?</label>
        <input type="text" id="memberFileNote" class="form-control form-control-sm" placeholder="Example: Corey state filing process, support SOP, developer job description">
      </div>
      <div class="d-flex justify-content-between align-items-center gap-2 mt-3 flex-wrap">
        <div id="memberFileStatus" class="small text-muted">Choose the file purpose explicitly, upload the file, then generate questions or parse answers from the same workspace.</div>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <button type="button" id="memberFileUploadBtn" class="btn btn-sm btn-primary" disabled>Upload file</button>
          <span class="member-file-count">${files.length} tracked file(s)</span>
          <button class="btn btn-sm btn-outline-primary" type="button" onclick="exportTeamMemberQuestionPacket('${escapeJs(detail.key)}')">Export packet</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="suggestTeamMemberFollowUps('${escapeJs(detail.key)}', 'Claude')">Suggest follow-ups</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="renderTeamMembers()">Refresh</button>
        </div>
      </div>
      <div class="member-file-list mt-3">${rows}</div>
    </div>
  `;
}

function initMemberFileWorkspace(memberKey) {
  const dropzone = document.getElementById('memberFileDropzone');
  const input = document.getElementById('memberFileInput');
  const staged = document.getElementById('memberFileStaged');
  const uploadBtn = document.getElementById('memberFileUploadBtn');
  if (!dropzone || !input) return;
  let stagedFiles = [];

  function setStaged(fileList) {
    stagedFiles = Array.from(fileList || []);
    if (staged) {
      staged.innerHTML = stagedFiles.length
        ? `<strong>${stagedFiles.length} file(s) ready:</strong> ${stagedFiles.map((f) => escapeHtml(f.name)).join(', ')}`
        : 'No file selected yet.';
    }
    if (uploadBtn) uploadBtn.disabled = stagedFiles.length === 0;
  }

  dropzone.addEventListener('click', () => input.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('over');
    setStaged(e.dataTransfer.files);
  });
  input.addEventListener('change', (e) => setStaged(e.target.files));
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      if (!stagedFiles.length) return;
      uploadBtn.disabled = true;
      await uploadTeamMemberFiles(memberKey, stagedFiles);
      stagedFiles = [];
    });
  }
}

async function uploadTeamMemberFiles(memberKey, fileList) {
  if (!fileList || !fileList.length) return;
  const status = document.getElementById('memberFileStatus');
  if (status) status.textContent = `Uploading ${fileList.length} file(s) to ${prettyName(memberKey)}...`;
  showProcessing(`Uploading ${fileList.length} file(s)\u2026`);
  const filePurpose = document.getElementById('memberFilePurpose')?.value || '';
  if (!filePurpose) {
    if (status) status.textContent = 'Choose a file purpose before uploading.';
    return;
  }
  const form = new FormData();
  form.append('company', CURRENT_COMPANY);
  form.append('member_key', memberKey);
  form.append('source_type', document.getElementById('memberFileSource')?.value || 'document');
  form.append('ai_engines', document.getElementById('memberFileAI')?.value || 'Claude');
  form.append('file_purpose', filePurpose);
  form.append('note', document.getElementById('memberFileNote')?.value || '');
  for (const file of fileList) form.append('files', file);
  try {
    const response = await fetch(`/api/${encodeURIComponent(CURRENT_COMPANY)}/team-members/${encodeURIComponent(memberKey)}/files/upload-with-purpose`, { method: 'POST', body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = `Uploaded ${payload.count} file(s) as ${filePurpose}. Continue with AI analysis, question generation, or answer parsing below.`;
    await renderTeamMembers();
  } catch (error) {
    hideProcessing();
    showToast(`Upload failed: ${error.message}`, 'error');
    if (status) status.textContent = `Upload failed: ${error.message}`;
  }
}

async function analyzeTeamMemberFile(fileId, memberKey, engine) {
  const status = document.getElementById('memberFileStatus');
  if (status) status.textContent = `Processing file ${fileId} with ${engine}...`;
  showProcessing(`Processing with ${engine}\u2026 this can take a moment.`);
  try {
    const response = await fetch(`/api/team_member_files/${fileId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        engine,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = `${payload.analysis.engine} completed. Review the summary and apply suggested tags if they look right.`;
    await renderTeamMembers();
  } catch (error) {
    hideProcessing();
    showToast(`Analysis failed: ${error.message}`, 'error');
    if (status) status.textContent = `Analysis failed: ${error.message}`;
  }
}

async function generateTeamMemberQuestions(memberKey, fileId, engine) {
  const status = document.getElementById('memberFileStatus');
  if (status) status.textContent = `Generating team-member questions from file ${fileId}...`;
  showProcessing(`Generating questions with ${engine}\u2026 this can take a moment.`);
  try {
    const response = await fetch(`/api/${encodeURIComponent(CURRENT_COMPANY)}/team-members/${encodeURIComponent(memberKey)}/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, engine, cap: 10 }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = `Generated ${payload.count} questions. Overflow items stay in suggested follow-up instead of crowding the active queue.`;
    await renderTeamMembers();
  } catch (error) {
    hideProcessing();
    showToast(`Question generation failed: ${error.message}`, 'error');
    if (status) status.textContent = `Question generation failed: ${error.message}`;
  }
}

async function exportTeamMemberQuestionPacket(memberKey) {
  const status = document.getElementById('memberFileStatus');
  if (status) status.textContent = 'Exporting the current question packet...';
  showProcessing('Exporting question packet\u2026');
  try {
    const response = await fetch(`/api/${encodeURIComponent(CURRENT_COMPANY)}/team-members/${encodeURIComponent(memberKey)}/export-packet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.empty) {
      // Expected empty state — inform, do not treat as a failure.
      hideProcessing();
      showToast(payload.reason || 'No questions to export yet.', 'info');
      if (status) status.textContent = payload.reason || 'No questions to export yet.';
      return;
    }
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = `Exported packet v${payload.packet_version} with ${payload.question_count} questions.`;
    await renderTeamMembers();
  } catch (error) {
    hideProcessing();
    showToast(`Export failed: ${error.message}`, 'error');
    if (status) status.textContent = `Packet export failed: ${error.message}`;
  }
}

async function parseTeamMemberAnswers(memberKey, fileId, engine) {
  const status = document.getElementById('memberFileStatus');
  if (status) status.textContent = `Parsing answers from file ${fileId}...`;
  showProcessing(`Parsing answers with ${engine}\u2026`);
  try {
    const response = await fetch(`/api/${encodeURIComponent(CURRENT_COMPANY)}/team-members/${encodeURIComponent(memberKey)}/parse-answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId, engine }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = `Parsed ${payload.count} answer(s). ${payload.unmatched_count || 0} unmatched answers need Ryan review.`;
    await renderTeamMembers();
  } catch (error) {
    hideProcessing();
    showToast(`Answer parsing failed: ${error.message}`, 'error');
    if (status) status.textContent = `Answer parsing failed: ${error.message}`;
  }
}

async function suggestTeamMemberFollowUps(memberKey, engine) {
  const status = document.getElementById('memberFileStatus');
  if (status) status.textContent = 'Generating follow-up questions...';
  showProcessing('Generating follow-ups with Claude\u2026');
  try {
    const response = await fetch(`/api/${encodeURIComponent(CURRENT_COMPANY)}/team-members/${encodeURIComponent(memberKey)}/suggest-follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engine }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = payload.count ? `Generated ${payload.count} follow-up question(s).` : 'No follow-up questions were needed from the current answers.';
    await renderTeamMembers();
  } catch (error) {
    hideProcessing();
    showToast(`Follow-up generation failed: ${error.message}`, 'error');
    if (status) status.textContent = `Follow-up generation failed: ${error.message}`;
  }
}

async function bulkAcceptTeamMemberAnswers(memberKey) {
  const status = document.getElementById('memberFileStatus');
  if (status) status.textContent = 'Accepting HIGH-confidence answered items...';
  try {
    const response = await fetch(`/api/${encodeURIComponent(CURRENT_COMPANY)}/team-members/${encodeURIComponent(memberKey)}/questions/bulk-accept-high-confidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = payload.count ? `Approved ${payload.count} HIGH-confidence answered question(s).` : 'No HIGH-confidence answered questions were eligible for bulk approval.';
    await renderTeamMembers();
  } catch (error) {
    if (status) status.textContent = `Bulk acceptance failed: ${error.message}`;
  }
}

async function applySuggestedDepartments(memberKey, fileId) {
  const detail = CURRENT_TEAM_MEMBER?.detail;
  if (!detail) return;
  const targetFile = (detail.member_file_items || []).find((item) => String(item.id) === String(fileId));
  if (!targetFile) return;
  const merged = new Set(detail.departments || []);
  (targetFile.suggested_departments || []).forEach((item) => {
    if (item && item.key) merged.add(item.key);
  });
  const status = document.getElementById('memberFileStatus');
  if (status) status.textContent = `Applying ${targetFile.suggested_departments.length} suggested department tag(s)...`;
  try {
    const response = await fetch('/api/team_member_department_tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        member_key: memberKey,
        departments: Array.from(merged),
        note: `Applied from file analysis ${fileId}`,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    if (status) status.textContent = `Applied suggested tags from file ${fileId}.`;
    await refreshNavCounts();
    await renderTeamMembers();
  } catch (error) {
    if (status) status.textContent = `Could not apply suggested tags: ${error.message}`;
  }
}

async function markMeetingFollowUp(memberKey, meetingId, followUpDone, inputEl) {
  const labelSpan = inputEl && inputEl.parentElement ? inputEl.parentElement.querySelector('.meeting-followup-label') : null;
  if (inputEl) inputEl.disabled = true;
  if (labelSpan) {
    labelSpan.textContent = 'Saving...';
    labelSpan.classList.remove('saved');
  }
  try {
    const response = await fetch(`/api/meetings/${meetingId}/attendees/${encodeURIComponent(memberKey)}/follow_up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follow_up_done: followUpDone }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    // Keep in-memory state in sync so a later re-render preserves the value.
    const meeting = (CURRENT_MEETINGS_CACHE || []).find((m) => m.id === meetingId);
    if (meeting && Array.isArray(meeting.attendees)) {
      const att = meeting.attendees.find((a) => a.team_member_key === memberKey);
      if (att) att.follow_up_done = followUpDone ? 1 : 0;
    }
    if (labelSpan) {
      labelSpan.textContent = followUpDone ? 'Follow-up done — saved' : 'Follow-up done';
      labelSpan.classList.toggle('saved', !!followUpDone);
    }
  } catch (error) {
    if (inputEl) inputEl.checked = !followUpDone;
    if (labelSpan) {
      labelSpan.textContent = 'Follow-up done';
      labelSpan.classList.remove('saved');
    }
    await showAlert('Could not update meeting follow-up.', { title: 'Update failed', kind: 'alert', detail: error.message });
  } finally {
    if (inputEl) inputEl.disabled = false;
  }
}

function openMeetingsView(meetingId = null) {
  CURRENT_MEETING_ID = meetingId;
  CURRENT_VIEW = 'meetings';
  setNavActive('meetings');
  showView('meetings');
}

function collectMeetingAttendeesFromForm() {
  const selectedMembers = Array.from(document.querySelectorAll('[data-meeting-attendee]:checked')).map((el) => ({
    team_member_key: el.dataset.meetingAttendee,
  }));
  const externalName = document.getElementById('meetingExternalName')?.value?.trim();
  const externalEmail = document.getElementById('meetingExternalEmail')?.value?.trim();
  if (externalName) {
    selectedMembers.push({
      external_name: externalName,
      external_email: externalEmail || '',
    });
  }
  return selectedMembers;
}

async function submitMeetingForm() {
  const title = document.getElementById('meetingTitle')?.value?.trim();
  const meetingDate = document.getElementById('meetingDate')?.value?.trim();
  const meetingType = document.getElementById('meetingType')?.value || 'other';
  const organizer = document.getElementById('meetingOrganizer')?.value?.trim() || '';
  const note = document.getElementById('meetingNote')?.value?.trim() || '';
  const actionLines = (document.getElementById('meetingActionItems')?.value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((description) => ({ description }));
  const attendees = collectMeetingAttendeesFromForm();
  const fileInput = document.getElementById('meetingNotesFile');
  const status = document.getElementById('meetingUploadStatus');
  if (!title || !meetingDate) {
    if (status) status.textContent = 'Meeting title and date are required.';
    return;
  }
  if (!attendees.length) {
    if (status) status.textContent = 'Choose at least one attendee.';
    return;
  }
  if (status) status.textContent = 'Saving meeting...';
  const formData = new FormData();
  formData.append('company', CURRENT_COMPANY);
  formData.append('title', title);
  formData.append('meeting_date', meetingDate);
  formData.append('meeting_type', meetingType);
  formData.append('organizer', organizer);
  formData.append('note', note);
  formData.append('attendees_json', JSON.stringify(attendees));
  formData.append('action_items_json', JSON.stringify(actionLines));
  if (fileInput?.files?.[0]) {
    formData.append('notes_file', fileInput.files[0]);
  }
  try {
    const response = await fetch('/api/meetings', {
      method: 'POST',
      body: formData,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    CURRENT_MEETING_ID = payload.meeting_id;
    if (status) status.textContent = 'Meeting saved.';
    // Commit the meeting Markdown to GitHub and generate Priority Questions for
    // the attendees (reuses the Task Tracker workflow). Capture the form details
    // before renderMeetings() resets the form.
    const meetingDetails = {
      company: CURRENT_COMPANY,
      title,
      meeting_date: meetingDate,
      uploaded_by: organizer || 'Ryan Cochran',
      summary: note,
      // Claude's summary of the uploaded document, produced by the existing
      // meeting-intelligence flow in POST /api/meetings.
      claude_summary: String(payload.summary || ''),
      // Raw transcript text so Claude can assign questions by conversation ownership.
      transcript: String(payload.notes_preview || ''),
      uploaded_file: (fileInput?.files?.[0]?.name) || '',
      additional_details: (document.getElementById('meetingActionItems')?.value || '').trim(),
      attendees,
    };
    await refreshNavCounts();
    await renderMeetings();
    analyzeMeetingAndGenerate(meetingDetails);
  } catch (error) {
    if (status) status.textContent = `Save failed: ${error.message}`;
  }
}

// After a meeting is saved: commit the Meeting Markdown to
// Governance_Files/Meetings/ and run Claude analysis to generate Priority
// Questions for the attendees. Best-effort — never blocks the completed upload.
async function analyzeMeetingAndGenerate(details) {
  const status = document.getElementById('meetingUploadStatus');
  if (status) status.textContent = 'Committing meeting note and analyzing for priority questions…';
  try {
    const response = await fetch('/api/meetings/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      if (status) status.textContent = `Meeting saved. Analysis skipped: ${payload.error || payload.reason || `HTTP ${response.status}`}`;
      return;
    }
    const qc = payload.question_count || 0;
    if (qc > 0) {
      showToast(`${qc} priority question(s) generated for the attendees.`, 'success');
      if (status) status.textContent = `Meeting committed. ${qc} priority question(s) added — open Priority Questions to review.`;
    } else if (payload.generation_skipped) {
      if (status) status.textContent = `Meeting committed. Priority question generation skipped: ${payload.generation_reason || 'Claude unavailable'}`;
    } else {
      if (status) status.textContent = 'Meeting committed. No new priority questions were needed.';
    }
    await refreshNavCounts();
  } catch (error) {
    if (status) status.textContent = `Meeting saved. Analysis failed: ${error.message}`;
  }
}

function renderMeetingSummaryBlock(meeting) {
  let questions = [];
  try {
    questions = meeting.priority_questions_json ? JSON.parse(meeting.priority_questions_json) : [];
  } catch (err) {
    questions = [];
  }
  const hasSummary = meeting.summary_text && meeting.summary_text.trim();
  const engine = meeting.summary_engine ? `<span class="meeting-summary-engine">${escapeHtml(meeting.summary_engine)}</span>` : '';
  const regenLabel = hasSummary ? 'Regenerate' : 'Generate summary';
  const summaryBody = hasSummary
    ? `<div class="meeting-summary-text">${escapeHtml(meeting.summary_text)}</div>`
    : `<div class="small text-muted">No AI summary yet. Attach a notes file (or add a summary note) and click "Generate summary".</div>`;

  // group questions by attendee
  const groups = {};
  questions.forEach((q) => {
    const name = q.attendee || 'Team';
    if (!groups[name]) groups[name] = [];
    groups[name].push(q);
  });
  const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const questionsHtml = Object.keys(groups).length
    ? Object.keys(groups).map((name) => {
        const items = groups[name]
          .sort((a, b) => (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1))
          .map((q) => `
            <li class="meeting-question">
              <span class="meeting-q-priority ${escapeHtml((q.priority || 'MEDIUM').toLowerCase())}">${escapeHtml(q.priority || 'MEDIUM')}</span>
              <span class="meeting-q-text">${escapeHtml(q.question || '')}</span>
            </li>`).join('');
        const routed = groups[name][0] && groups[name][0].member_key
          ? '<span class="meeting-q-routed">routed to workspace</span>' : '';
        return `
          <div class="meeting-question-group">
            <div class="meeting-question-attendee">${escapeHtml(name)} ${routed}</div>
            <ul class="meeting-question-list">${items}</ul>
          </div>`;
      }).join('')
    : '<div class="small text-muted">No priority questions generated yet.</div>';

  return `
    <div class="meeting-summary-block">
      <div class="meeting-summary-head">
        <span class="meeting-summary-title">AI meeting summary ${engine}</span>
        <button class="btn btn-sm btn-outline-secondary" type="button" onclick="regenerateMeetingSummary(${meeting.id}, this)">${regenLabel}</button>
      </div>
      ${summaryBody}
      <div class="meeting-summary-subhead">Priority questions by attendee</div>
      <div class="meeting-question-groups">${questionsHtml}</div>
    </div>
  `;
}

async function regenerateMeetingSummary(meetingId, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Generating...'; }
  try {
    const response = await fetch(`/api/meetings/${meetingId}/generate_summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: CURRENT_COMPANY }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.reason || payload.error || `HTTP ${response.status}`);
    }
    CURRENT_MEETING_ID = meetingId;
    await renderMeetings();
  } catch (error) {
    if (btn) { btn.disabled = false; btn.textContent = 'Generate summary'; }
    showToast(`Summary generation failed: ${error.message}`, 'error');
  }
}

async function renderMeetings() {
  const _r = VIEW_REQUEST;
  const main = document.getElementById('mainView');
  main.innerHTML = '<div class="text-muted">Loading meetings...</div>';
  let meetingsPayload, teamMembers;
  try {
    [meetingsPayload, teamMembers] = await Promise.all([
      withTimeout(fetchJSON(`/api/meetings?company=${CURRENT_COMPANY}`), 12000, 'Meetings request'),
      withTimeout(fetchJSON(`/api/team_members?company=${CURRENT_COMPANY}`), 12000, 'Team members request'),
    ]);
  } catch (error) {
    main.innerHTML = `
      <h2>Meetings</h2>
      <div class="alert alert-danger">
        <div class="fw-semibold mb-1">Meetings did not load</div>
        <div class="small mb-2">${escapeHtml(error.message || String(error))}</div>
        <button class="btn btn-sm btn-outline-secondary" type="button" onclick="renderMeetings()">Retry</button>
      </div>`;
    return;
  }
  if (viewRequestIsStale(_r)) return;
  LAST_TEAM_MEMBERS = teamMembers || [];
  const meetings = (meetingsPayload && meetingsPayload.rows) || [];
  CURRENT_MEETINGS_CACHE = meetings;
  const selectedMeeting = meetings.find((meeting) => meeting.id === CURRENT_MEETING_ID) || meetings[0] || null;
  if (selectedMeeting) CURRENT_MEETING_ID = selectedMeeting.id;
  const rosterAttendees = rosterAttendeeList();
  const attendeeSource = rosterAttendees || (teamMembers || []).map((member) => ({
    key: member.key,
    display_name: member.display_name,
    role: member.detail?.role || '',
  }));
  const attendeeChecklist = attendeeSource.map((member) => `
    <label class="meeting-attendee-option">
      <input type="checkbox" class="form-check-input" data-meeting-attendee="${escapeHtml(member.key)}" onchange="updateMeetingUploadState()">
      <span class="meeting-attendee-meta">
        <span class="meeting-attendee-name">${escapeHtml(member.display_name)}</span>
        ${member.role ? `<span class="meeting-attendee-role">${escapeHtml(member.role)}</span>` : ''}
      </span>
    </label>
  `).join('');
  const meetingCards = meetings.map((meeting) => `
    <button class="meeting-list-card ${selectedMeeting && selectedMeeting.id === meeting.id ? 'active' : ''}" type="button" onclick="openMeetingsView(${meeting.id})">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${escapeHtml(meeting.title)}</div>
          <div class="small text-muted">${escapeHtml(meeting.meeting_date)} - ${escapeHtml(meeting.meeting_type)}</div>
        </div>
        <span class="repo-chip">${meeting.attendee_count || 0} attendee(s)</span>
      </div>
      ${meeting.notes_file_path ? `<div class="meeting-list-file small mt-2"><span class="meeting-notes-file-icon" aria-hidden="true">DOC</span> ${escapeHtml(fileBaseName(meeting.notes_file_path))}</div>` : ''}
      <div class="small text-muted mt-2">${escapeHtml(meeting.note || 'No summary note captured.')}</div>
    </button>
  `).join('');
  const selectedAttendees = selectedMeeting ? (selectedMeeting.attendees || []).map((attendee) => `
    <div class="meeting-attendee-row">
      <div>
        <div class="fw-semibold">${escapeHtml(attendee.team_member_key ? prettyName(attendee.team_member_key) : (attendee.external_name || 'External attendee'))}</div>
        <div class="small text-muted">${escapeHtml(attendee.external_email || attendee.team_member_key || '')}</div>
      </div>
      ${attendee.team_member_key ? `
        <label class="form-check-label small d-flex align-items-center gap-2">
          <input class="form-check-input" type="checkbox" ${attendee.follow_up_done ? 'checked' : ''} onchange="markMeetingFollowUp('${escapeJs(attendee.team_member_key)}', ${selectedMeeting.id}, this.checked, this)">
          <span class="meeting-followup-label ${attendee.follow_up_done ? 'saved' : ''}">${attendee.follow_up_done ? 'Follow-up done — saved' : 'Follow-up done'}</span>
        </label>
      ` : '<span class="small text-muted">External attendee</span>'}
    </div>
  `).join('') : '<div class="small text-muted">No meeting selected yet.</div>';
  const actionItems = selectedMeeting && selectedMeeting.action_items?.length
    ? selectedMeeting.action_items.map((item) => `<li>${escapeHtml(item.description)}${item.owner_key ? ` - ${escapeHtml(prettyName(item.owner_key))}` : ''}</li>`).join('')
    : '<li class="text-muted">No action items captured yet.</li>';
  main.innerHTML = `
    <div class="meetings-view">
    <h2>Meetings</h2>
    <p class="small text-muted">Upload a meeting note once, attach multiple attendees, then let each attendee see the same meeting inside their own workspace.</p>
    <div class="alert alert-info small mb-3">${escapeHtml(meetingsPayload.roadmap_note || '')}</div>
    <div class="meetings-layout">
      <div class="dash-card">
        <div class="fw-semibold mb-2">Upload meeting</div>
        <div class="small text-muted mb-3">This is the PM-demo flow: one meeting, many attendees, one source of truth.</div>
        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label small mb-1">Meeting title</label>
            <input id="meetingTitle" class="form-control" placeholder="Weekly PM sync" oninput="updateMeetingUploadState()">
          </div>
          <div class="col-md-4">
            <label class="form-label small mb-1">Date</label>
            <input id="meetingDate" class="form-control" type="date" value="${new Date().toISOString().slice(0, 10)}" oninput="updateMeetingUploadState()">
          </div>
          <div class="col-md-4">
            <label class="form-label small mb-1">Type</label>
            <select id="meetingType" class="form-select">
              <option value="team">Team</option>
              <option value="one_on_one">1:1</option>
              <option value="vendor">Vendor</option>
              <option value="customer">Customer</option>
              <option value="governance_review">Governance review</option>
              <option value="dev_sync">Dev sync</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small mb-1">Organizer</label>
            <input id="meetingOrganizer" class="form-control" value="Ryan Cochran">
          </div>
          <div class="col-md-4">
            <label class="form-label small mb-1">Notes file</label>
            <input id="meetingNotesFile" class="form-control" type="file" onchange="showSelectedMeetingFile(this)">
            <div id="meetingNotesFileName" class="meeting-file-chosen small mt-1">No file chosen yet.</div>
          </div>
          <div class="col-12">
            <label class="form-label small mb-1">Summary note <span class="text-muted">(optional)</span></label>
            <textarea id="meetingNote" class="form-control" rows="3" placeholder="What this meeting covered, what changed, and what needs follow-up."></textarea>
          </div>
          <div class="col-md-7">
            <label class="form-label small mb-1">Team attendees</label>
            <div class="meeting-attendee-grid">${attendeeChecklist}</div>
          </div>
          <div class="col-md-5">
            <label class="form-label small mb-1">External attendee</label>
            <input id="meetingExternalName" class="form-control mb-2" placeholder="Name (optional)">
            <input id="meetingExternalEmail" class="form-control" placeholder="Email (optional)">
            <label class="form-label small mt-3 mb-1">Action items</label>
            <textarea id="meetingActionItems" class="form-control" rows="6" placeholder="One action item per line"></textarea>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center gap-2 mt-3 flex-wrap">
          <div id="meetingUploadStatus" class="small text-muted">Ready.</div>
          <button id="meetingUploadBtn" class="btn btn-primary btn-sm" type="button" onclick="submitMeetingForm()" disabled>Upload meeting</button>
        </div>
      </div>
      <div class="dash-card">
        <div class="fw-semibold mb-2">Meetings this week</div>
        <div class="small text-muted mb-3">${meetings.length} meeting(s) captured in the current company lane.</div>
        <div class="meeting-list-stack">${meetingCards || '<div class="small text-muted">No meetings saved yet.</div>'}</div>
      </div>
      <div class="dash-card">
        <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-2">
          <div>
            <div class="fw-semibold">${selectedMeeting ? escapeHtml(selectedMeeting.title) : 'Meeting detail'}</div>
            <div class="small text-muted">${selectedMeeting ? `${escapeHtml(selectedMeeting.meeting_date)} - ${escapeHtml(selectedMeeting.meeting_type)}` : 'Select a meeting to inspect attendee fan-out.'}</div>
          </div>
        </div>
        ${selectedMeeting ? meetingNotesFileBlock(selectedMeeting) : ''}
        <div id="artifactPreview" class="mt-2"></div>
        <div class="small text-muted mb-3">${escapeHtml(selectedMeeting?.note || 'No detail note captured yet.')}</div>
        ${selectedMeeting ? renderMeetingSummaryBlock(selectedMeeting) : ''}
        <div class="fw-semibold small mb-2">Attendees and follow-up</div>
        <div class="meeting-attendee-rows mb-3">${selectedAttendees}</div>
        <div class="fw-semibold small mb-2">Action items</div>
        <ul class="small mb-0">${actionItems}</ul>
      </div>
    </div>
    </div>
  `;
  updateMeetingUploadState();
}

// Enable "Upload meeting" only when the required fields are filled: title, date,
// and at least one attendee. Summary is optional.
function updateMeetingUploadState() {
  const btn = document.getElementById('meetingUploadBtn');
  if (!btn) return;
  const title = document.getElementById('meetingTitle')?.value?.trim();
  const date = document.getElementById('meetingDate')?.value?.trim();
  const hasAttendee = document.querySelectorAll('[data-meeting-attendee]:checked').length > 0;
  btn.disabled = !(title && date && hasAttendee);
}

async function renderTeamMembers() {
  const _r = VIEW_REQUEST;
  hideProcessing();
  renderTeamMembersShell();
  let members;
  let departmentsPayload;
  try {
    [members, departmentsPayload] = await Promise.all([
      withTimeout(
        fetchJSON(`/api/team_members?company=${CURRENT_COMPANY}`),
        8000,
        'Team members request',
      ),
      withTimeout(
        fetchJSON(`/api/departments?company=${CURRENT_COMPANY}`),
        8000,
        'Departments request',
      ),
    ]);
    CURRENT_DEPARTMENT_CATALOG = departmentsPayload.all || [];
    LAST_TEAM_MEMBERS = members || [];
  } catch (error) {
    const workspace = document.getElementById('teamMemberWorkspace');
    const list = document.getElementById('teamMemberList');
    if (list) list.innerHTML = '<div class="alert alert-warning">Team members did not load.</div>';
    if (workspace) {
      workspace.innerHTML = `
        <div class="alert alert-danger">
          <div class="fw-semibold mb-1">Team member data failed to load</div>
          <div class="small mb-2">${escapeHtml(error.message || String(error))}</div>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="renderTeamMembers()">Retry</button>
        </div>
      `;
    }
    return;
  }

  if (viewRequestIsStale(_r)) return;
  if (!CURRENT_TEAM_MEMBER || !members.find((member) => member.key === CURRENT_TEAM_MEMBER)) {
    CURRENT_TEAM_MEMBER = members[0]?.key || null;
  }
  const selectedMember = members.find((member) => member.key === CURRENT_TEAM_MEMBER);
  const detail = selectedMember?.detail || null;

  const list = document.getElementById('teamMemberList');
  if (list) {
    list.innerHTML = renderTeamMembersList(members);
  }
  const questionRail = document.getElementById('teamMemberQuestionRail');
  if (questionRail && detail) {
    questionRail.innerHTML = renderTeamMemberQuestionRail(detail);
  }

  const workspace = document.getElementById('teamMemberWorkspace');
  if (!detail) {
    if (workspace) workspace.innerHTML = '<div class="dash-card text-muted">No team member selected.</div>';
    return;
  }

  try {
    workspace.innerHTML = renderTeamMemberDetail(detail);
  } catch (error) {
    console.error('renderTeamMemberDetail failed', error, detail);
    workspace.innerHTML = `
      <div class="alert alert-danger">
        <div class="fw-semibold mb-1">Team member workspace failed to render</div>
        <div class="small">${escapeHtml(error.message || String(error))}</div>
      </div>
    `;
    return;
  }

  initMemberFileWorkspace(detail.key);

  if (detail.member_hub && detail.member_hub.gmail_auth_enabled) {
    refreshMemberHubGmailAuth(detail.key, true);
  }
}

function renderTeamMemberDetail(detail) {
  const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];
  const prioritySummary = priorityOrder
    .filter((priority) => detail.priority_counts && detail.priority_counts[priority])
    .map((priority) => `<span class="badge badge-${priority.toLowerCase()}">${priority}: ${detail.priority_counts[priority]}</span>`)
    .join(' ');
  const taskLaneCards = detail.task_lanes && detail.task_lanes.length ? detail.task_lanes.map((task) => `
    <details class="member-task-card">
      <summary>
        <div class="member-task-card-head">
          <div>
            <span class="member-task-number">Task ${task.number}</span>
            <div class="member-task-name">${escapeHtml(task.task)}</div>
          </div>
          <div class="member-task-meta">
            <span>${escapeHtml(task.type)}</span>
            <span>${escapeHtml(task.time)}</span>
          </div>
        </div>
      </summary>
      <div class="member-task-card-body">
        <div class="small text-muted mb-2"><strong>Depends on:</strong> ${escapeHtml(task.depends_on || 'None')}</div>
        <div class="small text-muted mb-3">${escapeHtml(task.focus || 'Use this lane when the file or question is specifically tied to this task in the daily workflow.')}</div>
        <div class="row g-3">
          <div class="col-md-6">
            <div class="member-task-subcard">
              <div class="fw-semibold mb-2">Departments for this task</div>
              <div class="repo-chip-row">
                ${(task.departments || []).map((item) => `<span class="repo-chip">${escapeHtml(prettyDepartmentName(item))}</span>`).join('') || '<span class="text-muted small">No departments mapped yet.</span>'}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="member-task-subcard">
              <div class="fw-semibold mb-2">Repos most likely involved</div>
              <div class="repo-chip-row">
                ${(task.repos || []).map((item) => `<span class="repo-chip">${escapeHtml(item)}</span>`).join('') || '<span class="text-muted small">No repos mapped yet.</span>'}
              </div>
            </div>
          </div>
        </div>
        <div class="member-task-subcard mt-3">
          <div class="fw-semibold mb-2">Feature change checklist</div>
          <ul class="small mb-0">
            ${(task.checklist || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No checklist captured yet.</li>'}
          </ul>
        </div>
        <div class="member-task-subcard mt-3">
          <div class="fw-semibold mb-2">Current work routed to ${escapeHtml(detail.display_name)}</div>
          ${(detail.assigned_intake_items || []).length ? `
            <div class="member-task-worklist">
              ${detail.assigned_intake_items.slice(0, 4).map((item) => `
                <div class="member-task-workrow">
                  <div class="fw-semibold">Intake #${item.id}</div>
                  <div class="small text-muted">${escapeHtml(item.note || '(no note)')} - ${escapeHtml(item.stage || '')} - ${item.file_count} file(s)</div>
                </div>
              `).join('')}
            </div>
          ` : '<div class="small text-muted">No intake items routed to this team member yet.</div>'}
        </div>
        <div class="d-flex gap-2 flex-wrap mt-3">
          <button class="btn btn-sm btn-outline-primary" type="button" onclick="focusMemberTaskUpload('${escapeJs(task.number)}', '${escapeJs(task.task)}')">Route files to this task</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showQuestionsForMember('${escapeJs(detail.key)}')">Open member questions</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showIntakesForMember('${escapeJs(detail.key)}')">Open member intakes</button>
        </div>
      </div>
    </details>
  `).join('') : '';
  const packetState = loadMemberQuestionDocumentState({ memberKey: detail.key });
  const recentChatMessages = (packetState.ai_messages || []).slice(-4);
  const quickChatMessages = recentChatMessages.length
    ? recentChatMessages.map((message) => `
        <div class="member-chat-message role-${escapeHtml(message.role)} compact">
          <div class="member-chat-meta">${escapeHtml(message.engine)} - ${escapeHtml(message.ts || '')}</div>
          <div class="member-chat-body"><pre>${escapeHtml(message.text || '')}</pre></div>
        </div>
      `).join('')
    : '<div class="text-muted small">Type here like chat. Claude or OpenAI will answer using the full assigned question packet for this team member.</div>';

  return `
    <div class="dash-card member-workspace">
      <div class="member-hero-head d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <div class="small text-uppercase text-muted">Team Member Workspace</div>
          <h3 class="mb-1">${escapeHtml(detail.display_name)}</h3>
          <div class="small text-muted">${escapeHtml(detail.role || 'No role captured yet')}</div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-outline-primary" type="button" onclick="openMemberQuestionDocument('${escapeJs(detail.key)}', { sourceView: 'team' })">Open packet document</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="scrollToTeamQuickChat()">Open AI chat</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showIntakesForMember('${escapeJs(detail.key)}')">Open intakes</button>
        </div>
      </div>

      <p class="mt-3 mb-3">${escapeHtml(detail.purpose || 'No member purpose captured yet.')}</p>

      <div class="member-workflow-card ms-files mb-3" id="memberIntakeLane">
        <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
          <div>
            <div class="member-section-title">Files — upload &amp; process</div>
            <div class="small text-muted">Drop documents from ${escapeHtml(detail.display_name)} here first. Save them with an explicit purpose, then generate questions, export packets, or parse returned answers from the same lane.</div>
          </div>
          <div class="member-lane-steps">
            <span class="member-lane-step">1. Drop files</span>
            <span class="member-lane-step">2. Generate / parse</span>
            <span class="member-lane-step">3. Export packet</span>
            <span class="member-lane-step">4. Ryan approves</span>
          </div>
        </div>
        <div id="memberTaskHint" class="small text-muted mb-2">This is now the top-of-page round-trip workflow for ${escapeHtml(detail.display_name)}.</div>
        ${renderMemberFileWorkspace(detail)}
      </div>

      ${renderTeamMemberQuestionPacketStatus(detail)}

      ${renderTeamMemberCorrespondence(detail)}

      <div class="dash-card member-packet-entry-card ms-packet mb-3">
        <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
          <div>
            <div class="member-section-title">Question packet</div>
            <div class="small text-muted">This is the main answer document for everything ${escapeHtml(detail.display_name)} needs to approve or explain. Work from one packet and one chat thread instead of opening every question separately.</div>
          </div>
          <div class="member-packet-summary-metrics">
            <span class="repo-chip">${detail.question_unanswered} unanswered</span>
            <span class="repo-chip">${detail.question_total} total</span>
          </div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-primary" type="button" onclick="openMemberQuestionDocument('${escapeJs(detail.key)}', { sourceView: 'team' })">Open packet document</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showQuestionsForMember('${escapeJs(detail.key)}')">Open raw queue</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="scrollToTeamQuickChat()">Jump to AI chat</button>
        </div>
      </div>

      <div class="dash-card member-quick-chat-card ms-ai mb-3 gw-expandable" id="teamQuickChatCard">
        <button class="gw-fs-close" type="button" onclick="toggleSectionFullscreen(this)" title="Close full view">&#10005;</button>
        <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
          <div>
            <div class="member-section-title">Ask Claude about this packet</div>
            <div class="small text-muted">Type here the same way you would in chat. The AI will use ${escapeHtml(detail.display_name)}'s full assigned question packet, current session notes, and recent packet work as context.</div>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="openMemberQuestionDocument('${escapeJs(detail.key)}', { sourceView: 'team' })">Open full packet</button>
            <button class="btn btn-sm btn-outline-secondary fs-corner-btn" type="button" data-fs-toggle onclick="toggleSectionFullscreen(this)">Full view</button>
          </div>
        </div>
        <div class="member-chat-engine-row mb-2">
          <input type="hidden" id="teamQuickChatEngine" value="Claude Code">
          <button class="btn btn-sm btn-outline-primary active" data-team-quick-chat-engine="Claude Code" type="button" onclick="setActiveTeamQuickChatEngine('Claude Code')">Claude</button>
          <button class="btn btn-sm btn-outline-primary" data-team-quick-chat-engine="OpenAI Codex" type="button" onclick="setActiveTeamQuickChatEngine('OpenAI Codex')">OpenAI</button>
        </div>
        <div class="member-chat-thread compact" id="teamQuickChatThread">${quickChatMessages}</div>
        <div class="member-chat-suggestions compact mt-3">
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useTeamQuickChatSuggestion('Group these assigned questions into the fewest answer themes and tell me which can be answered together.')">Group related questions</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useTeamQuickChatSuggestion('Draft a concise answer packet for Ryan using the current queue and what is already known.')">Draft answer packet</button>
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useTeamQuickChatSuggestion('Tell me which questions still need human clarification before they can be answered confidently.')">Find missing clarifications</button>
        </div>
        <label class="form-label small mt-3 mb-1">Prompt</label>
        <textarea class="form-control" id="teamQuickChatComposer" rows="5" placeholder="Ask Claude or OpenAI about Ryan Cochran's full question packet..."></textarea>
        <div class="d-flex justify-content-between align-items-center gap-2 mt-2 flex-wrap">
          <div id="teamQuickChatStatus" class="small text-muted">Ready.</div>
          <button class="btn btn-sm btn-primary" type="button" onclick="sendTeamMemberQuickChat('${escapeJs(detail.key)}')">Send</button>
        </div>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="mini-stat-card">
            <div class="mini-stat-label">Questions</div>
            <div class="mini-stat-value">${detail.question_unanswered} / ${detail.question_total}</div>
            <div class="small text-muted">Unanswered / total</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mini-stat-card">
            <div class="mini-stat-label">Assigned intakes</div>
            <div class="mini-stat-value">${detail.assigned_intakes}</div>
            <div class="small text-muted">Tracked work items</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="mini-stat-card">
            <div class="mini-stat-label">Assigned files</div>
            <div class="mini-stat-value">${detail.assigned_files}</div>
            <div class="small text-muted">Files routed here</div>
          </div>
        </div>
      </div>

      <div class="member-section ms-priority mb-3">
        <div class="member-section-title">Priority load</div>
        <div class="d-flex gap-2 flex-wrap">${prioritySummary || '<span class="text-muted small">No assigned questions yet.</span>'}</div>
      </div>

      <div class="member-section ms-departments mb-3">
        <div class="member-section-title">Departments touched</div>
        <div class="repo-chip-row">
          ${(detail.departments || []).map((item) => `<span class="repo-chip">${escapeHtml(prettyDepartmentName(item))}</span>`).join('') || '<span class="text-muted small">No departments mapped yet.</span>'}
        </div>
      </div>

      <div class="dash-card ms-routing mb-3">
        <div class="member-section-title">Department routing tags</div>
        ${renderDepartmentTagEditor(detail)}
      </div>

      <div class="member-section ms-repos mb-3">
        <div class="member-section-title">Core repos</div>
        <div class="repo-chip-row">
          ${(detail.repos || []).map((item) => `<span class="repo-chip">${escapeHtml(item)}</span>`).join('') || '<span class="text-muted small">No repos mapped yet.</span>'}
        </div>
      </div>

      <div class="dash-card ms-meetings mb-3">
        <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-2">
          <div>
            <div class="member-section-title">Recent meetings</div>
            <div class="small text-muted">Meetings uploaded once should appear here for every assigned attendee.</div>
          </div>
          <div class="repo-chip-row">
            <span class="repo-chip">${detail.meeting_count_30d || 0} in last 30 days</span>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="openMeetingsView()">Open Meetings</button>
          </div>
        </div>
        ${(detail.recent_meetings || []).length ? `
          <div class="meeting-member-list">
            ${detail.recent_meetings.map((meeting) => `
              <div class="meeting-member-row">
                <div>
                  <div class="fw-semibold">${escapeHtml(meeting.title)}</div>
                  <div class="small text-muted">${escapeHtml(meeting.meeting_date)} - ${escapeHtml(meeting.meeting_type)} - ${meeting.attendee_count || 0} attendee(s)</div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <label class="form-check-label small d-flex align-items-center gap-2">
                    <input class="form-check-input" type="checkbox" ${meeting.follow_up_done ? 'checked' : ''} onchange="markMeetingFollowUp('${escapeJs(detail.key)}', ${meeting.id}, this.checked)">
                    Follow-up done
                  </label>
                  <button class="btn btn-sm btn-outline-primary" type="button" onclick="openMeetingsView(${meeting.id})">View meeting</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<div class="small text-muted">No meetings routed to this team member yet.</div>'}
      </div>

      ${detail.member_hub && detail.member_hub.enabled ? `
        <div class="member-hub-card mb-3">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
            <div>
              <div class="fw-semibold mb-1">${escapeHtml(detail.member_hub.title)}</div>
              <div class="small text-muted">${escapeHtml(detail.member_hub.description || '')}</div>
            </div>
            <div class="d-flex gap-2 flex-wrap align-items-center">
              <span class="badge ${detail.member_hub.running ? 'text-bg-success' : 'text-bg-warning'}">${detail.member_hub.running ? 'Running' : 'Not running'}</span>
              <button class="btn btn-sm btn-outline-primary" type="button" onclick="launchMemberHub('${escapeJs(detail.key)}')">Launch hub</button>
              <button class="btn btn-sm btn-outline-secondary" type="button" onclick="refreshMemberHub('${escapeJs(detail.key)}')">Refresh hub</button>
              <button class="btn btn-sm btn-outline-secondary" type="button" onclick="window.open('${escapeJs(detail.member_hub.url)}', '_blank')">Open full hub</button>
            </div>
          </div>
          ${detail.member_hub.gmail_auth_enabled ? `
            <div class="member-hub-auth-card mb-3">
              <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <div class="fw-semibold mb-1">Gmail Authentication</div>
                  <div id="memberHubGmailText" class="small text-muted">Checking Gmail auth status for the embedded Ryan workflow...</div>
                </div>
                <div class="d-flex gap-2 flex-wrap align-items-center">
                  <span id="memberHubGmailBadge" class="badge text-bg-secondary">Checking...</span>
                  <button class="btn btn-sm btn-outline-secondary" type="button" onclick="refreshMemberHubGmailAuth('${escapeJs(detail.key)}')">Refresh status</button>
                  <button class="btn btn-sm btn-outline-primary" type="button" onclick="reauthMemberHubGmail('${escapeJs(detail.key)}')">Re-Auth Gmail</button>
                </div>
              </div>
            </div>
          ` : ''}
          <div id="memberHubStatus" class="small text-muted mb-2">${detail.member_hub.running ? 'The live operations board is available below.' : 'Launch the hub to bring the live task board into this workspace.'}</div>
          <div class="member-hub-frame-wrap">
            ${detail.member_hub.running ? `
              <iframe id="memberHubFrame" class="member-hub-frame" src="${escapeHtml(detail.member_hub.url)}" title="${escapeHtml(detail.member_hub.title)}"></iframe>
            ` : `
              <div class="member-hub-empty">
                <div class="fw-semibold mb-2">Daily Operations Hub not started</div>
                <div class="small text-muted">Use the launch button above to start the live Ryan workflow app, then refresh this panel.</div>
              </div>
            `}
          </div>
        </div>
      ` : ''}

      ${detail.daily_tasks && detail.daily_tasks.length ? `
        <div class="mb-3">
          <div class="fw-semibold mb-2">Daily task stack</div>
          <div class="small text-muted mb-2">This is Ryan's current operating workflow.</div>
          <div class="table-responsive">
            <table class="table table-sm align-middle member-task-table">
              <thead>
                <tr><th>#</th><th>Task</th><th>Type</th><th>Time</th><th>Depends On</th></tr>
              </thead>
              <tbody>
                ${detail.daily_tasks.map((task) => `
                  <tr>
                    <td>${task.number}</td>
                    <td>${escapeHtml(task.task)}</td>
                    <td>${escapeHtml(task.type)}</td>
                    <td>${escapeHtml(task.time)}</td>
                    <td>${escapeHtml(task.depends_on)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="mb-3">
          <div class="fw-semibold mb-2">Open each task lane</div>
          <div class="small text-muted mb-2">Open a task below to see its routing path, linked repos, current work, and feature-change checklist. Then send the related file drop into this member workspace.</div>
          <div class="member-task-card-stack">
            ${taskLaneCards}
          </div>
        </div>
      ` : ''}

      ${detail.critical_rules && detail.critical_rules.length ? `
        <div class="mb-3">
          <div class="fw-semibold mb-2">Critical sequencing rules</div>
          <ul class="mb-0">
            ${detail.critical_rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${detail.immutable_rules && detail.immutable_rules.length ? `
        <div class="mb-3">
          <div class="fw-semibold mb-2">Current immutable rules</div>
          <ul class="mb-0">
            ${detail.immutable_rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${detail.top_questions && detail.top_questions.length ? `
        <div class="mb-3 member-section ms-urgent gw-expandable">
          <button class="gw-fs-close" type="button" onclick="toggleSectionFullscreen(this)" title="Close full view">&#10005;</button>
          <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-2">
            <div class="member-section-title">Most urgent assigned questions</div>
            <button class="btn btn-sm btn-outline-secondary fs-corner-btn" type="button" data-fs-toggle onclick="toggleSectionFullscreen(this)">Full view</button>
          </div>
          <div class="member-question-list member-question-scroll">
            ${detail.top_questions.map((question) => `
              <div class="member-question-row">
                <div class="d-flex justify-content-between gap-2">
                  <div>
                    <div class="fw-semibold">${escapeHtml(question.qid)} — ${escapeHtml(question.title)}</div>
                    <div class="small">${escapeHtml(question.short_question || '')}</div>
                  </div>
                  <span class="badge badge-${(question.priority || 'unknown').toLowerCase()}">${escapeHtml(question.priority || 'UNKNOWN')}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div>
        <div class="fw-semibold mb-2">Workspace sources</div>
        <ul class="small mb-0">
          ${(detail.workspace_sources || detail.operating_sources || []).map((src) => `<li>${escapeHtml(src)}</li>`).join('') || '<li class="text-muted">No source files linked yet.</li>'}
        </ul>
      </div>
    </div>
  `;
}

function focusMemberTaskUpload(taskNumber, taskName) {
  const note = document.getElementById('memberFileNote');
  const hint = document.getElementById('memberTaskHint');
  const lane = document.getElementById('memberIntakeLane');
  if (note) {
    note.value = `Task ${taskNumber}: ${taskName}`;
  }
  if (hint) {
    hint.textContent = `Current routing target: Task ${taskNumber} - ${taskName}. Drop the related files here to create a member-file review packet for this task.`;
  }
  if (lane) {
    lane.classList.add('member-lane-focus');
    lane.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => lane.classList.remove('member-lane-focus'), 1800);
  }
}

async function launchMemberHub(memberKey) {
  const status = document.getElementById('memberHubStatus');
  if (status) status.textContent = 'Launching Daily Operations Hub...';
  try {
    const response = await fetch('/api/member_hub/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: CURRENT_COMPANY, member: memberKey }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.message || `HTTP ${response.status}`);
    }
    if (status) status.textContent = payload.message || 'Hub launched.';
    await renderTeamMembers();
  } catch (error) {
    if (status) status.textContent = `Launch failed: ${error.message}`;
  }
}

async function refreshMemberHub(memberKey) {
  const status = document.getElementById('memberHubStatus');
  if (status) status.textContent = 'Refreshing hub status...';
  try {
    const payload = await fetchJSON(`/api/member_hub?company=${CURRENT_COMPANY}&member=${encodeURIComponent(memberKey)}`);
    if (payload.running) {
      if (status) status.textContent = 'The live operations board is available below.';
    } else {
      if (status) status.textContent = 'The hub is not responding yet. Try launching it again.';
    }
    await renderTeamMembers();
  } catch (error) {
    if (status) status.textContent = `Refresh failed: ${error.message}`;
  }
}

async function refreshMemberHubGmailAuth(memberKey, quiet = false) {
  const badge = document.getElementById('memberHubGmailBadge');
  const text = document.getElementById('memberHubGmailText');
  if (badge) {
    badge.className = 'badge text-bg-secondary';
    badge.textContent = 'Checking...';
  }
  if (text && !quiet) {
    text.textContent = 'Checking Gmail auth status for the embedded Ryan workflow...';
  }
  try {
    const response = await fetch('http://127.0.0.1:5000/check-gmail-auth');
    const payload = await response.json();
    if (badge) {
      if (payload.authenticated) {
        badge.className = 'badge text-bg-success';
        badge.textContent = 'Authenticated';
      } else {
        badge.className = 'badge text-bg-danger';
        badge.textContent = 'Needs re-auth';
      }
    }
    if (text) {
      text.textContent = payload.message || (payload.authenticated
        ? 'Authenticated - token available.'
        : 'Token expired or missing - launch Gmail re-auth.');
    }
  } catch (error) {
    if (badge) {
      badge.className = 'badge text-bg-warning';
      badge.textContent = 'Hub not running';
    }
    if (text) {
      text.textContent = `Could not check Gmail auth status from the embedded workflow: ${error.message}`;
    }
  }
}

async function reauthMemberHubGmail(memberKey) {
  const badge = document.getElementById('memberHubGmailBadge');
  const text = document.getElementById('memberHubGmailText');
  if (badge) {
    badge.className = 'badge text-bg-warning';
    badge.textContent = 'Launching...';
  }
  if (text) {
    text.textContent = 'Launching Gmail re-auth flow. Complete the browser sign-in, then refresh status here.';
  }
  try {
    const response = await fetch('http://127.0.0.1:5000/reauth-gmail', {
      method: 'POST',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.message || `HTTP ${response.status}`);
    }
    if (badge) {
      badge.className = 'badge text-bg-warning';
      badge.textContent = 'Auth running';
    }
    if (text) {
      text.textContent = payload.message || 'Gmail re-auth launched. Complete sign-in in the browser, then refresh status here.';
    }
    setTimeout(() => refreshMemberHubGmailAuth(memberKey, true), 5000);
  } catch (error) {
    if (badge) {
      badge.className = 'badge text-bg-danger';
      badge.textContent = 'Launch failed';
    }
    if (text) {
      text.textContent = `Gmail re-auth failed to launch: ${error.message}`;
    }
  }
}

function openTeamMemberWorkspace(memberKey) {
  CURRENT_TEAM_MEMBER = memberKey;
  renderTeamMembers();
}

function showQuestionsForCurrentMember(anchorQid = '') {
  if (!CURRENT_TEAM_MEMBER) {
    showView('questions');
    return;
  }
  openMemberQuestionDocument(CURRENT_TEAM_MEMBER, { anchorQid, sourceView: 'team' });
}

function memberKeyFromAssigneeName(name = '') {
  return String(name || '').trim().replace(/\s+/g, '_');
}

function buildMemberQuestionPacket(data, memberKey) {
  const displayName = prettyName(memberKey);
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
  const questions = flattenQuestionPayload(data)
    .filter((question) => String(question.assignee || '').trim().toLowerCase() === displayName.toLowerCase())
    .map((question) => ({
      ...question,
      scope_label: question.owner_scope === 'employee' ? prettyName(question.employee || question.source_employee || '') || 'Employee scope' : 'Org-wide',
    }))
    .sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));

  const priorityCounts = questions.reduce((acc, question) => {
    const priority = question.priority || 'UNKNOWN';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  return {
    memberKey,
    displayName,
    questions,
    totalCount: questions.length,
    unansweredCount: questions.filter((question) => (question.status || 'OPEN').toUpperCase() !== 'ANSWERED').length,
    priorityCounts,
  };
}

function getMemberQuestionDocumentStorageKey(packet) {
  return `member-question-document:${CURRENT_COMPANY}:${packet.memberKey}`;
}

function getDefaultMemberQuestionDocumentState(packet) {
  const perQuestionAnswers = {};
  (packet.questions || []).forEach((question) => {
    perQuestionAnswers[question.qid] = '';
  });
  return {
    session_notes: '',
    per_question_answers: perQuestionAnswers,
    ai_messages: [],
    last_saved_at: '',
  };
}

function loadMemberQuestionDocumentState(packet) {
  const key = getMemberQuestionDocumentStorageKey(packet);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return getDefaultMemberQuestionDocumentState(packet);
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultMemberQuestionDocumentState(packet),
      ...(parsed || {}),
      per_question_answers: {
        ...getDefaultMemberQuestionDocumentState(packet).per_question_answers,
        ...((parsed || {}).per_question_answers || {}),
      },
    };
  } catch (error) {
    return getDefaultMemberQuestionDocumentState(packet);
  }
}

function persistMemberQuestionDocumentState(packet, state) {
  localStorage.setItem(getMemberQuestionDocumentStorageKey(packet), JSON.stringify(state));
}

async function openMemberQuestionDocument(memberKey, options = {}) {
  try {
    const packet = await ensureMemberQuestionPacket(memberKey);
    CURRENT_MEMBER_QUESTION_DOCUMENT = {
      ...packet,
      anchor_qid: options.anchorQid || '',
    };
    CURRENT_MEMBER_QUESTION_SOURCE_VIEW = options.sourceView || CURRENT_VIEW || 'team';
    CURRENT_TEAM_MEMBER = memberKey;
    CURRENT_VIEW = 'member-question-document';
    setNavActive('team');
    await showView('member-question-document');
    if (options.anchorQid) {
      const target = document.getElementById(`member-packet-${options.anchorQid}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    await showAlert('Unable to open the member question document.', { title: 'Open failed', kind: 'alert', detail: error.message });
  }
}

function collectMemberQuestionDocumentStateFromDom() {
  if (!CURRENT_MEMBER_QUESTION_DOCUMENT) return null;
  const state = loadMemberQuestionDocumentState(CURRENT_MEMBER_QUESTION_DOCUMENT);
  state.session_notes = document.getElementById('memberQuestionSessionNotes')?.value || state.session_notes || '';
  document.querySelectorAll('[data-member-question-answer]').forEach((el) => {
    state.per_question_answers[el.dataset.memberQuestionAnswer] = el.value || '';
  });
  return state;
}

function saveMemberQuestionDocument() {
  if (!CURRENT_MEMBER_QUESTION_DOCUMENT) return;
  const state = collectMemberQuestionDocumentStateFromDom();
  state.last_saved_at = new Date().toLocaleString();
  persistMemberQuestionDocumentState(CURRENT_MEMBER_QUESTION_DOCUMENT, state);
  const status = document.getElementById('memberQuestionDocSaveStatus');
  if (status) status.textContent = `Saved ${state.last_saved_at}`;
}

function appendMemberQuestionChatMessage(role, engine, text) {
  if (!CURRENT_MEMBER_QUESTION_DOCUMENT) return;
  const state = collectMemberQuestionDocumentStateFromDom();
  state.ai_messages.push({
    role,
    engine,
    text,
    ts: new Date().toLocaleString(),
  });
  persistMemberQuestionDocumentState(CURRENT_MEMBER_QUESTION_DOCUMENT, state);
}

function setActiveMemberChatEngine(engine) {
  const input = document.getElementById('memberQuestionChatEngine');
  if (input) input.value = engine;
  document.querySelectorAll('[data-member-chat-engine]').forEach((button) => {
    button.classList.toggle('active', button.dataset.memberChatEngine === engine);
  });
}

function useMemberQuestionPromptSuggestion(promptText) {
  const composer = document.getElementById('memberQuestionChatComposer');
  if (composer) {
    composer.value = promptText;
    composer.focus();
  }
}

async function sendMemberQuestionChat() {
  if (!CURRENT_MEMBER_QUESTION_DOCUMENT) return;
  const composer = document.getElementById('memberQuestionChatComposer');
  const engine = document.getElementById('memberQuestionChatEngine')?.value || 'Claude Code';
  const prompt = composer?.value?.trim();
  if (!prompt) return;
  appendMemberQuestionChatMessage('user', engine, prompt);
  composer.value = '';
  renderMemberQuestionDocument();
  const status = document.getElementById('memberQuestionChatStatus');
  if (status) status.textContent = `Sending to ${engine}...`;
  try {
    const state = collectMemberQuestionDocumentStateFromDom();
    const response = await fetch('/api/member_question_chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        member_key: CURRENT_MEMBER_QUESTION_DOCUMENT.memberKey,
        engine,
        prompt,
        session_notes: state.session_notes || '',
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.reason || payload.error || `HTTP ${response.status}`);
    }
    appendMemberQuestionChatMessage('assistant', engine, payload.response_text || '(No response text returned)');
    renderMemberQuestionDocument();
    if (status) status.textContent = `${engine} responded using ${payload.question_count || CURRENT_MEMBER_QUESTION_DOCUMENT.totalCount} assigned questions.`;
  } catch (error) {
    appendMemberQuestionChatMessage('system', engine, `Error: ${error.message}`);
    renderMemberQuestionDocument();
    if (status) status.textContent = `${engine} failed: ${error.message}`;
  }
}

function renderMemberQuestionDocument() {
  if (!CURRENT_MEMBER_QUESTION_DOCUMENT) {
    document.getElementById('mainView').innerHTML = '<div class="alert alert-warning">No team-member question packet selected.</div>';
    return;
  }
  const packet = CURRENT_MEMBER_QUESTION_DOCUMENT;
  const state = loadMemberQuestionDocumentState(packet);
  const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];
  const outlineHtml = priorityOrder
    .filter((priority) => packet.priorityCounts[priority])
    .map((priority) => `<div class="member-doc-priority-chip priority-${priority.toLowerCase()}">${priority}: ${packet.priorityCounts[priority]}</div>`)
    .join('');
  const questionOutline = packet.questions.map((question) => `
    <button class="member-doc-outline-item" type="button" onclick="document.getElementById('member-packet-${escapeJs(question.qid)}')?.scrollIntoView({behavior:'smooth', block:'start'})">
      <span class="member-doc-outline-qid">${escapeHtml(question.qid)}</span>
      <span class="member-doc-outline-title">${escapeHtml(question.title || question.short_question || '')}</span>
      <span class="badge badge-${(question.priority || 'unknown').toLowerCase()}">${escapeHtml(question.priority || 'UNKNOWN')}</span>
    </button>
  `).join('');
  const questionSections = packet.questions.map((question) => `
    <section class="member-packet-question" id="member-packet-${escapeJs(question.qid)}">
      <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
        <div>
          <div class="member-packet-qid">${escapeHtml(question.qid)}</div>
          <h4 class="member-packet-title">${escapeHtml(question.title || '')}</h4>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <span class="badge badge-${(question.priority || 'unknown').toLowerCase()}">${escapeHtml(question.priority || 'UNKNOWN')}</span>
          <span class="badge bg-secondary">${escapeHtml(question.status || 'OPEN')}</span>
        </div>
      </div>
      <div class="small text-muted mb-2">Scope: ${escapeHtml(question.scope_label || question.owner_scope || 'Question packet')}</div>
      <div class="member-packet-question-text">${escapeHtml(question.short_question || '')}</div>
      <details class="mt-2">
        <summary class="small text-muted">Show full context</summary>
        <pre class="small mt-2">${escapeHtml(question.body || '')}</pre>
      </details>
      <label class="form-label small mt-3 mb-1">Working answer / notes</label>
      <textarea class="form-control member-packet-answer" rows="4" data-member-question-answer="${escapeHtml(question.qid)}" placeholder="Capture your answer, clarifications, or decision notes for this question here...">${escapeHtml(state.per_question_answers[question.qid] || '')}</textarea>
    </section>
  `).join('');
  const chatMessages = (state.ai_messages || []).length
    ? state.ai_messages.map((message) => `
        <div class="member-chat-message role-${escapeHtml(message.role)}">
          <div class="member-chat-meta">${escapeHtml(message.engine)} - ${escapeHtml(message.ts || '')}</div>
          <div class="member-chat-body"><pre>${escapeHtml(message.text || '')}</pre></div>
        </div>
      `).join('')
    : '<div class="text-muted small">Start a conversation with Claude or OpenAI about this full question packet. The AI will use all assigned questions and your session notes as context.</div>';

  document.getElementById('mainView').innerHTML = `
    <h2>${escapeHtml(packet.displayName)} Question Packet</h2>
    <p class="small text-muted">Work through every question assigned to ${escapeHtml(packet.displayName)} in one document. Use the right-side AI pane the way you would in chat, but grounded in the full queued question packet.</p>
    <div class="member-question-doc-grid">
      <div class="member-question-doc-left">
        <div class="dash-card">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
            <div>
              <div class="fw-semibold">Question packet</div>
              <div class="small text-muted">${packet.unansweredCount} unanswered / ${packet.totalCount} total</div>
            </div>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showView('team')">Back</button>
          </div>
          <div class="member-doc-priority-row">${outlineHtml}</div>
          <div class="small text-muted mt-3 mb-2">Jump to a question</div>
          <div class="member-doc-outline-list">${questionOutline}</div>
        </div>
      </div>
      <div class="member-question-doc-center">
        <div class="dash-card">
          <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-2">
            <div>
              <div class="fw-semibold">Session answer document</div>
              <div class="small text-muted">Use one working packet for repo questions, approvals, daily ops, and anything else Ryan needs to answer.</div>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-sm btn-primary" type="button" onclick="saveMemberQuestionDocument()">Save packet</button>
              <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showQuestionsForMember('${escapeJs(packet.memberKey)}')">Open raw queue</button>
            </div>
          </div>
          <label class="form-label small mb-1">Session notes / combined answer draft</label>
          <textarea class="form-control member-packet-session-notes" id="memberQuestionSessionNotes" rows="7" placeholder="Draft one combined answer narrative that can cover multiple questions in this packet...">${escapeHtml(state.session_notes || '')}</textarea>
          <div class="small text-muted mt-2" id="memberQuestionDocSaveStatus">${escapeHtml(state.last_saved_at ? `Last saved ${state.last_saved_at}` : 'Not saved yet')}</div>
        </div>
        <div class="member-packet-sections mt-3">${questionSections}</div>
      </div>
      <div class="member-question-doc-right">
        <div class="dash-card member-chat-card gw-expandable">
          <button class="gw-fs-close" type="button" onclick="toggleSectionFullscreen(this)" title="Close full view">&#10005;</button>
          <button class="btn btn-sm btn-outline-secondary fs-corner-btn" type="button" data-fs-toggle onclick="toggleSectionFullscreen(this)">Full view</button>
          <div class="fw-semibold mb-2">Ask Claude / OpenAI</div>
          <div class="small text-muted mb-3">Type here like chat. The AI will see Ryan's assigned question packet and your current session notes.</div>
          <div class="member-chat-engine-row mb-3">
            <input type="hidden" id="memberQuestionChatEngine" value="Claude Code">
            <button class="btn btn-sm btn-outline-primary active" data-member-chat-engine="Claude Code" type="button" onclick="setActiveMemberChatEngine('Claude Code')">Claude</button>
            <button class="btn btn-sm btn-outline-primary" data-member-chat-engine="OpenAI Codex" type="button" onclick="setActiveMemberChatEngine('OpenAI Codex')">OpenAI</button>
          </div>
          <div class="member-chat-suggestions mb-3">
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useMemberQuestionPromptSuggestion('Group these questions into the smallest number of answer themes and tell me which can be answered together.')">Group related questions</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useMemberQuestionPromptSuggestion('Draft a concise answer packet for Ryan using the current notes and all open questions.')">Draft answer packet</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useMemberQuestionPromptSuggestion('Tell me which questions still require human clarification before I can answer them confidently.')">Find missing clarifications</button>
          </div>
          <div class="member-chat-thread" id="memberQuestionChatThread">${chatMessages}</div>
          <label class="form-label small mt-3 mb-1">Prompt</label>
          <textarea class="form-control" id="memberQuestionChatComposer" rows="5" placeholder="Ask Claude or OpenAI about Ryan's full question packet..."></textarea>
          <div class="d-flex justify-content-between align-items-center gap-2 mt-2 flex-wrap">
            <div id="memberQuestionChatStatus" class="small text-muted">Ready.</div>
            <button class="btn btn-sm btn-primary" type="button" onclick="sendMemberQuestionChat()">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;
  setActiveMemberChatEngine('Claude Code');
}

function getQuestionWorkspaceStorageKey(qid) {
  return `gw:${CURRENT_COMPANY}:question:${qid}`;
}

function getDefaultQuestionWorkspaceState(question) {
  return {
    draft: '',
    transcript: '',
    state: question.status || 'NEW',
    revisions: [],
    approved_snapshot: '',
    feedback: '',
    ai_preview: '',
    last_saved_at: '',
    linked_questions: [],
  };
}

function loadQuestionWorkspaceState(question) {
  try {
    const raw = localStorage.getItem(getQuestionWorkspaceStorageKey(question.qid));
    if (!raw) return getDefaultQuestionWorkspaceState(question);
    return { ...getDefaultQuestionWorkspaceState(question), ...JSON.parse(raw) };
  } catch (error) {
    return getDefaultQuestionWorkspaceState(question);
  }
}

function persistQuestionWorkspaceState(question, state) {
  localStorage.setItem(getQuestionWorkspaceStorageKey(question.qid), JSON.stringify(state));
}

function flattenQuestionPayload(data) {
  const employeeQuestions = Object.values(data.employees || {}).flatMap((employee) => employee.questions || []);
  return [...(data.org_wide || []), ...employeeQuestions];
}

function findQuestionRecord(data, qid) {
  return flattenQuestionPayload(data).find((question) => question.qid === qid);
}

async function openQuestionWorkspace(qid, options = {}) {
  try {
    const data = await fetchJSON(`/api/questions?company=${CURRENT_COMPANY}`);
    const question = findQuestionRecord(data, qid);
    if (!question) {
      document.getElementById('mainView').innerHTML = `<div class="alert alert-danger">Question ${escapeHtml(qid)} could not be found in the current company queue.</div>`;
      return;
    }
    CURRENT_QUESTION_DETAIL = {
      ...question,
      team_counts: data.team_counts || [],
    };
    CURRENT_QUESTION_SOURCE_VIEW = options.sourceView || CURRENT_VIEW || 'questions';
    CURRENT_VIEW = 'question-detail';
    setNavActive('questions');
    await showView('question-detail');
    if (options.focus) {
      const target = document.getElementById(`question-pane-${options.focus}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (error) {
    document.getElementById('mainView').innerHTML = `
      <div class="alert alert-danger">
        <div class="fw-semibold mb-1">Question workspace failed to load</div>
        <div class="small">${escapeHtml(error.message || String(error))}</div>
      </div>
    `;
  }
}

async function generateRepoQuestions(repoName) {
  showProcessing(`Generating questions for ${repoName} with Claude\u2026 this can take a moment.`);
  try {
    const payload = await fetchJSON('/api/repo_questions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        repo_name: repoName,
        actor: 'Ryan Cochran',
      }),
    });
    if (!payload.ok) throw new Error(payload.reason || 'Generation failed');
    if (CURRENT_VIEW === 'departments' && CURRENT_DEPARTMENT) {
      await showView('departments');
    }
    hideProcessing();
    const created = payload.created || 0;
    const engineLabel = payload.engine === 'claude' ? 'Claude' : 'baseline set';
    if (created > 0) {
      showToast(`Generated ${created} question(s) for ${repoName} using ${engineLabel}.`, 'success');
    } else {
      showToast(`No new questions for ${repoName} — they may already exist.`, 'info');
    }
  } catch (error) {
    hideProcessing();
    showToast(`Question generation failed for ${repoName}: ${error.message}`, 'error');
    await showAlert(`Repo question generation failed for ${repoName}.`, { title: 'Generation failed', kind: 'alert', detail: error.message });
  }
}

async function openRepoQuestionWorkspace(questionCode, options = {}) {
  try {
    const data = await fetchJSON(`/api/repo_questions/detail?company=${CURRENT_COMPANY}&question_code=${encodeURIComponent(questionCode)}`);
    CURRENT_REPO_QUESTION_DETAIL = data.question;
    CURRENT_REPO_QUESTION_SOURCE_VIEW = options.sourceView || CURRENT_VIEW || 'departments';
    CURRENT_VIEW = 'repo-question-detail';
    setNavActive('departments');
    await showView('repo-question-detail');
  } catch (error) {
    document.getElementById('mainView').innerHTML = `<div class="alert alert-danger">Repo question ${escapeHtml(questionCode)} could not be loaded.</div>`;
  }
}

async function saveRepoQuestionDetail() {
  if (!CURRENT_REPO_QUESTION_DETAIL) return;
  const statusEl = document.getElementById('repoQuestionStatusSelect');
  const assigneeEl = document.getElementById('repoQuestionAssignee');
  const answerEl = document.getElementById('repoQuestionAnswer');
  const reviewEl = document.getElementById('repoQuestionReview');
  const reviewerEl = document.getElementById('repoQuestionReviewer');
  const saveStateEl = document.getElementById('repoQuestionSaveState');
  if (saveStateEl) saveStateEl.textContent = 'Saving...';
  try {
    const payload = await fetchJSON('/api/repo_questions/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        question_code: CURRENT_REPO_QUESTION_DETAIL.question_code,
        status: statusEl?.value || 'OPEN',
        primary_assignee: assigneeEl?.value || 'Ryan Cochran',
        answer_markdown: answerEl?.value || '',
        review_note: reviewEl?.value || '',
        reviewed_by: reviewerEl?.value || '',
      }),
    });
    CURRENT_REPO_QUESTION_DETAIL = {
      ...CURRENT_REPO_QUESTION_DETAIL,
      status: statusEl?.value || 'OPEN',
      primary_assignee: assigneeEl?.value || 'Ryan Cochran',
      answer_markdown: answerEl?.value || '',
      review_note: reviewEl?.value || '',
      reviewed_by: reviewerEl?.value || '',
      updated_at: payload.updated_at,
    };
    if (saveStateEl) saveStateEl.textContent = `Saved ${String(payload.updated_at || '').replace('T', ' ').slice(0, 16)}`;
  } catch (error) {
    if (saveStateEl) saveStateEl.textContent = `Save failed: ${error.message}`;
  }
}

async function sendRepoQuestionChat() {
  if (!CURRENT_REPO_QUESTION_DETAIL) return;
  const promptEl = document.getElementById('repoQuestionChatPrompt');
  const engineEl = document.getElementById('repoQuestionChatEngine');
  const threadEl = document.getElementById('repoQuestionChatThread');
  const statusEl = document.getElementById('repoQuestionChatStatus');
  const prompt = String(promptEl?.value || '').trim();
  if (!prompt) return;
  if (statusEl) statusEl.textContent = 'Sending...';
  try {
    const payload = await fetchJSON('/api/repo_questions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        question_code: CURRENT_REPO_QUESTION_DETAIL.question_code,
        engine: engineEl?.value || 'Claude Code',
        prompt,
      }),
    });
    if (threadEl) {
      threadEl.innerHTML = `
        <div class="small text-muted mb-2">You asked ${escapeHtml(engineEl?.value || 'Claude Code')} to review this repo question.</div>
        <pre class="small mb-0">${escapeHtml(payload.response_text || '')}</pre>
      `;
    }
    if (promptEl) promptEl.value = '';
    if (statusEl) statusEl.textContent = 'Response ready.';
  } catch (error) {
    if (statusEl) statusEl.textContent = `Request failed: ${error.message}`;
  }
}

function renderRepoQuestionWorkspace() {
  const mainView = document.getElementById('mainView');
  if (!CURRENT_REPO_QUESTION_DETAIL) {
    mainView.innerHTML = '<div class="alert alert-warning">No repo question selected.</div>';
    return;
  }
  const question = CURRENT_REPO_QUESTION_DETAIL;
  mainView.innerHTML = `
    <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-3">
      <div>
        <h2>${escapeHtml(question.question_code)} - ${escapeHtml(question.title)}</h2>
        <div class="small text-muted">Repo-specific governance question for ${escapeHtml(question.repo_name)}.</div>
      </div>
      <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showView('${escapeJs(CURRENT_REPO_QUESTION_SOURCE_VIEW || 'departments')}')">Back</button>
    </div>
    <div class="row g-3">
      <div class="col-xl-3">
        <div class="dash-card">
          <div class="fw-semibold mb-2">Evidence and source</div>
          <div class="small text-muted mb-2">Source: ${escapeHtml(humanRepoQuestionSource(question.source))}</div>
          <div class="small text-muted mb-2">Reference: ${escapeHtml(question.source_ref || '')}</div>
          <div class="small text-muted mb-2">Priority: ${escapeHtml(question.priority || 'UNKNOWN')}</div>
          <div class="small text-muted mb-3">Assigned to: ${escapeHtml(question.primary_assignee || 'Ryan Cochran')}</div>
          <div class="fw-semibold small mb-1">Source excerpt</div>
          <pre class="small repo-question-pre">${escapeHtml(question.source_excerpt || '(no source excerpt captured)')}</pre>
          <div class="fw-semibold small mt-3 mb-1">Question body</div>
          <pre class="small repo-question-pre">${escapeHtml(question.body_markdown || '')}</pre>
        </div>
      </div>
      <div class="col-xl-5">
        <div class="dash-card">
          <div class="fw-semibold mb-2">Working answer and review</div>
          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label small mb-1">Status</label>
              <select class="form-select form-select-sm" id="repoQuestionStatusSelect">
                ${['OPEN', 'DRAFTING', 'ANSWERED', 'FOLLOW_UP_REQUIRED', 'CLOSED'].map((value) => `<option value="${value}" ${String(question.status || 'OPEN') === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label small mb-1">Assignee</label>
              <input class="form-control form-control-sm" id="repoQuestionAssignee" value="${escapeHtml(question.primary_assignee || 'Ryan Cochran')}">
            </div>
            <div class="col-md-12">
              <label class="form-label small mb-1">Working answer</label>
              <textarea class="form-control" id="repoQuestionAnswer" rows="10" placeholder="Capture the answer, clarification, or remediation path here...">${escapeHtml(question.answer_markdown || '')}</textarea>
            </div>
            <div class="col-md-12">
              <label class="form-label small mb-1">Review note</label>
              <textarea class="form-control" id="repoQuestionReview" rows="5" placeholder="Summarize what remains unclear or what follow-up is still needed...">${escapeHtml(question.review_note || '')}</textarea>
            </div>
            <div class="col-md-8">
              <label class="form-label small mb-1">Reviewed by</label>
              <input class="form-control form-control-sm" id="repoQuestionReviewer" value="${escapeHtml(question.reviewed_by || 'Ryan Cochran')}">
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <button class="btn btn-sm btn-primary w-100" type="button" onclick="saveRepoQuestionDetail()">Save repo question</button>
            </div>
          </div>
          <div class="small text-muted mt-2" id="repoQuestionSaveState">${question.updated_at ? `Last updated ${escapeHtml(String(question.updated_at).replace('T', ' ').slice(0, 16))}` : 'Not saved yet.'}</div>
        </div>
      </div>
      <div class="col-xl-4">
        <div class="dash-card">
          <div class="fw-semibold mb-2">Ask Claude / OpenAI</div>
          <div class="small text-muted mb-3">Use the stored repo question, source reference, and current working answer as context.</div>
          <input type="hidden" id="repoQuestionChatEngine" value="Claude Code">
          <div class="member-chat-engine-row mb-3">
            <button class="btn btn-sm btn-outline-primary active" type="button" onclick="setRepoQuestionChatEngine('Claude Code')">Claude</button>
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="setRepoQuestionChatEngine('OpenAI Codex')">OpenAI</button>
          </div>
          <div id="repoQuestionChatThread" class="member-chat-thread compact"><div class="text-muted small">No AI review yet.</div></div>
          <label class="form-label small mt-3 mb-1">Prompt</label>
          <textarea class="form-control" id="repoQuestionChatPrompt" rows="5" placeholder="Ask Claude or OpenAI whether this repo question is clear, complete, or drifting..."></textarea>
          <div class="d-flex justify-content-between align-items-center gap-2 mt-2 flex-wrap">
            <div id="repoQuestionChatStatus" class="small text-muted">Ready.</div>
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="sendRepoQuestionChat()">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setRepoQuestionChatEngine(engine) {
  const input = document.getElementById('repoQuestionChatEngine');
  if (input) input.value = engine;
  document.querySelectorAll('#mainView [onclick^="setRepoQuestionChatEngine"]').forEach((button) => {
    button.classList.toggle('active', button.textContent.trim() === (engine === 'Claude Code' ? 'Claude' : 'OpenAI'));
  });
}

function getQuestionWorkspaceState() {
  if (!CURRENT_QUESTION_DETAIL) return null;
  return loadQuestionWorkspaceState(CURRENT_QUESTION_DETAIL);
}

function renderQuestionRevisionList(state) {
  if (!state.revisions.length) {
    return '<div class="small text-muted">No revisions yet. Save a draft or submit an answer to begin the audit trail.</div>';
  }
  return state.revisions.slice(0, 6).map((revision, index) => `
    <div class="question-revision-row">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${escapeHtml(revision.label || `Revision ${index + 1}`)}</div>
          <div class="small text-muted">${escapeHtml(revision.state || 'DRAFTING')} - ${escapeHtml(revision.saved_at || '')}</div>
        </div>
        ${revision.final_snapshot ? '<span class="status-chip status-approved">Approved</span>' : ''}
      </div>
      <div class="small text-muted mt-1">${escapeHtml(revision.summary || 'No summary yet.')}</div>
    </div>
  `).join('');
}

function buildQuestionAiPreview(question, state, mode) {
  const transcript = (state.transcript || '').trim();
  const currentDraft = (state.draft || '').trim();
  const base = [
    `Question: ${question.qid} - ${question.title}`,
    '',
    'Suggested answer structure:',
    '1. Direct answer',
    '2. Operational detail',
    '3. Exceptions / escalation',
    '4. Follow-up questions',
    '',
    `Direct answer draft: Based on current operating practice, ${question.short_question || question.title}.`,
  ];
  if (mode === 'transcript' && transcript) {
    base.push('', 'Transcript cues:', transcript.slice(0, 500));
  }
  if (mode === 'followups') {
    base.push('', 'Follow-up questions to confirm:', '- What exception cases exist?', '- Who owns approval?', '- What evidence or file is the source of truth?');
  }
  if (currentDraft) {
    base.push('', 'Current draft for comparison:', currentDraft.slice(0, 500));
  }
  return base.join('\n');
}

function saveQuestionWorkspace(action = 'draft') {
  if (!CURRENT_QUESTION_DETAIL) return;
  const state = getQuestionWorkspaceState();
  if (!state) return;
  const draftEl = document.getElementById('questionAnswerEditor');
  const transcriptEl = document.getElementById('questionTranscriptEditor');
  state.draft = draftEl ? draftEl.value : state.draft;
  state.transcript = transcriptEl ? transcriptEl.value : state.transcript;

  const transitionMap = {
    draft: 'DRAFTING',
    submit: 'ANSWER_SUBMITTED',
    self: 'SELF_APPROVED',
    review: 'RYAN_REVIEW',
    defer: 'DEFERRED',
    cannot: 'CANNOT_ANSWER',
  };
  state.state = transitionMap[action] || state.state || 'DRAFTING';
  state.last_saved_at = new Date().toLocaleString();
  if (action === 'self' || action === 'review') {
    state.approved_snapshot = state.draft;
  }
  state.revisions.unshift({
    label: ({
      draft: 'Draft saved',
      submit: 'Answer submitted',
      self: 'Self-approved',
      review: 'Sent to Ryan review',
      defer: 'Deferred',
      cannot: 'Cannot answer',
    })[action] || 'Draft saved',
    state: state.state,
    saved_at: state.last_saved_at,
    summary: (state.draft || state.transcript || '').trim().slice(0, 140) || 'Blank draft',
    final_snapshot: action === 'self' || action === 'review',
  });
  persistQuestionWorkspaceState(CURRENT_QUESTION_DETAIL, state);
  renderQuestionWorkspace();
}

async function flagRelatedQuestion() {
  if (!CURRENT_QUESTION_DETAIL) return;
  const shortQuestion = await showPromptDialog('Enter the new linked question that surfaced while answering this one:', { title: 'Add linked question' });
  if (!shortQuestion) return;
  const state = getQuestionWorkspaceState();
  state.linked_questions.unshift({
    qid: `Draft-${state.linked_questions.length + 1}`,
    short_question: shortQuestion,
    link_type: 'follow-up',
  });
  state.last_saved_at = new Date().toLocaleString();
  persistQuestionWorkspaceState(CURRENT_QUESTION_DETAIL, state);
  renderQuestionWorkspace();
}

function insertTranscriptIntoAnswer() {
  const draftEl = document.getElementById('questionAnswerEditor');
  const transcriptEl = document.getElementById('questionTranscriptEditor');
  if (!draftEl || !transcriptEl || !transcriptEl.value.trim()) return;
  draftEl.value = `${draftEl.value.trim()}\n\nTranscript notes:\n${transcriptEl.value.trim()}`.trim();
}

function generateQuestionAiPreview(mode = 'answer') {
  if (!CURRENT_QUESTION_DETAIL) return;
  const state = getQuestionWorkspaceState();
  state.draft = document.getElementById('questionAnswerEditor')?.value || state.draft;
  state.transcript = document.getElementById('questionTranscriptEditor')?.value || state.transcript;
  state.ai_preview = buildQuestionAiPreview(CURRENT_QUESTION_DETAIL, state, mode);
  persistQuestionWorkspaceState(CURRENT_QUESTION_DETAIL, state);
  renderQuestionWorkspace();
}

function insertAiPreviewIntoAnswer() {
  const state = getQuestionWorkspaceState();
  const draftEl = document.getElementById('questionAnswerEditor');
  if (!state || !state.ai_preview || !draftEl) return;
  draftEl.value = `${draftEl.value.trim()}\n\n${state.ai_preview}`.trim();
}

function launchQuestionVoiceMemo() {
  if (!CURRENT_QUESTION_DETAIL) return;
  CURRENT_QUESTION_SOURCE_VIEW = 'question-detail';
  recordQuestionAnswer(
    CURRENT_QUESTION_DETAIL.qid,
    CURRENT_QUESTION_DETAIL.title || '',
    CURRENT_QUESTION_DETAIL.short_question || '',
    CURRENT_QUESTION_DETAIL.assignee || 'Ryan Cochran',
  );
}

async function renderQuestionWorkspace() {
  if (!CURRENT_QUESTION_DETAIL) {
    document.getElementById('mainView').innerHTML = '<div class="alert alert-warning">No question selected.</div>';
    return;
  }
  const question = CURRENT_QUESTION_DETAIL;
  const state = getQuestionWorkspaceState();
  const linkedQuestions = (state.linked_questions || []).map((item) => `
    <div class="question-link-row">
      <div class="fw-semibold">${escapeHtml(item.qid)}</div>
      <div class="small text-muted">${escapeHtml(item.link_type || 'follow-up')}</div>
      <div class="small">${escapeHtml(item.short_question || '')}</div>
    </div>
  `).join('');

  document.getElementById('mainView').innerHTML = `
    <div class="question-workspace-shell">
      <div class="question-workspace-header">
        <div>
          <div class="small text-uppercase text-muted">Question Workspace</div>
          <h2 class="mb-1">${escapeHtml(question.qid)} - ${escapeHtml(question.title || 'Untitled question')}</h2>
          <div class="small text-muted">${escapeHtml(question.short_question || '')}</div>
        </div>
        <div class="question-workspace-actions">
          <button class="btn btn-sm btn-outline-secondary" type="button" onclick="backToQuestionSource()">Back</button>
          <button class="btn btn-sm btn-outline-primary" type="button" onclick="showView('questions')">Open full queue</button>
          <button class="btn btn-sm btn-primary" type="button" onclick="launchQuestionVoiceMemo()">Record voice memo</button>
        </div>
      </div>
      <div class="alert alert-info small mb-3">
        This is the governed answer workspace preview. Use it to capture evidence, draft the answer, review revision history, and prepare the item for Ryan review without promoting it into the constitution automatically.
      </div>
      <div class="question-workspace-grid">
        <div class="question-pane" id="question-pane-evidence">
          <div class="question-pane-title">Evidence and voice memo</div>
          <div class="question-meta-row"><strong>Assigned to:</strong> ${escapeHtml(question.assignee || 'Ryan Cochran')}</div>
          <div class="question-meta-row"><strong>Priority:</strong> <span class="badge badge-${escapeHtml((question.priority || 'UNKNOWN').toLowerCase())}">${escapeHtml(question.priority || 'UNKNOWN')}</span></div>
          <div class="question-meta-row"><strong>Current state:</strong> <span class="status-chip status-waiting">${escapeHtml(state.state || 'NEW')}</span></div>
          <div class="question-support-block">
            <div class="small fw-semibold mb-1">Question context</div>
            <div class="small text-muted">${escapeHtml(question.body || question.short_question || '')}</div>
          </div>
          <label class="form-label small mt-3">Transcript or spoken notes</label>
          <textarea class="form-control question-transcript-editor" id="questionTranscriptEditor" rows="10" placeholder="Paste or type transcript notes here so they can be inserted into the answer draft.">${escapeHtml(state.transcript || '')}</textarea>
          <div class="question-inline-actions">
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="launchQuestionVoiceMemo()">Record / attach memo</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="insertTranscriptIntoAnswer()">Insert transcript into answer</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="flagRelatedQuestion()">Flag new question</button>
          </div>
          <div class="small text-muted mt-2">Voice memos continue to save under the existing company-scoped <code>_VOICE_MEMOS</code> folder. This workspace keeps the question context visible while you route answers and evidence.</div>
          ${linkedQuestions ? `<div class="question-links-block mt-3"><div class="small fw-semibold mb-2">Linked questions</div>${linkedQuestions}</div>` : ''}
        </div>

        <div class="question-pane" id="question-pane-editor">
          <div class="question-pane-title">Answer draft and revisions</div>
          <div class="small text-muted mb-2">Build the operating answer here. Drafts stay editable; approved answers are snapshotted separately.</div>
          <label class="form-label small">Current answer draft</label>
          <textarea class="form-control question-answer-editor" id="questionAnswerEditor" rows="16" placeholder="Describe how this works in practice, not how it should work in theory.">${escapeHtml(state.draft || '')}</textarea>
          <div class="question-inline-actions mt-3">
            <button class="btn btn-sm btn-primary" type="button" onclick="saveQuestionWorkspace('draft')">Save draft</button>
            <button class="btn btn-sm btn-outline-primary" type="button" onclick="saveQuestionWorkspace('submit')">Submit answer</button>
            <button class="btn btn-sm btn-outline-success" type="button" onclick="saveQuestionWorkspace('self')">Self-approve</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="saveQuestionWorkspace('review')">Send to Ryan</button>
          </div>
          <div class="question-inline-actions">
            <button class="btn btn-sm btn-outline-warning" type="button" onclick="saveQuestionWorkspace('defer')">Defer</button>
            <button class="btn btn-sm btn-outline-danger" type="button" onclick="saveQuestionWorkspace('cannot')">Cannot answer</button>
          </div>
          <div class="small text-muted mt-2">Last saved: ${escapeHtml(state.last_saved_at || 'Not saved yet')}</div>
          ${state.approved_snapshot ? `
            <div class="question-support-block mt-3">
              <div class="small fw-semibold mb-1">Approved answer snapshot</div>
              <pre class="question-approved-preview">${escapeHtml(state.approved_snapshot)}</pre>
            </div>
          ` : ''}
          <div class="question-support-block mt-3">
            <div class="small fw-semibold mb-2">Revision history</div>
            ${renderQuestionRevisionList(state)}
          </div>
        </div>

        <div class="question-pane" id="question-pane-ai">
          <div class="question-pane-title">AI assist and workflow status</div>
          <div class="question-status-grid">
            <div><div class="small text-uppercase text-muted">State</div><div class="fw-semibold">${escapeHtml(state.state || 'NEW')}</div></div>
            <div><div class="small text-uppercase text-muted">Reviewer</div><div class="fw-semibold">Ryan</div></div>
            <div><div class="small text-uppercase text-muted">Company</div><div class="fw-semibold">${escapeHtml(CURRENT_COMPANY)}</div></div>
            <div><div class="small text-uppercase text-muted">Assignee</div><div class="fw-semibold">${escapeHtml(question.assignee || 'Ryan Cochran')}</div></div>
          </div>
          <div class="question-support-block mt-3">
            <div class="small fw-semibold mb-2">AI draft assist</div>
            <div class="question-inline-actions">
              <button class="btn btn-sm btn-outline-primary" type="button" onclick="generateQuestionAiPreview('answer')">Draft answer from question</button>
              <button class="btn btn-sm btn-outline-primary" type="button" onclick="generateQuestionAiPreview('transcript')">Draft from transcript</button>
              <button class="btn btn-sm btn-outline-primary" type="button" onclick="generateQuestionAiPreview('followups')">Suggest follow-ups</button>
            </div>
            <div class="small text-muted mt-2">This pane is the reviewable layout preview. The governed question schema and real AI run logging land in the formal Phase 1 build.</div>
          </div>
          <label class="form-label small mt-3">AI preview</label>
          <textarea class="form-control question-ai-preview" id="questionAiPreview" rows="14" readonly>${escapeHtml(state.ai_preview || '')}</textarea>
          <div class="question-inline-actions mt-3">
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="insertAiPreviewIntoAnswer()">Insert into answer</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="showQuestionsForCurrentMember('${escapeJs(question.qid)}')">Open assigned queue</button>
          </div>
          <div class="question-support-block mt-3">
            <div class="small fw-semibold mb-1">Workflow guardrails</div>
            <ul class="small mb-0">
              <li>Answers and evidence stay company-scoped.</li>
              <li>Ryan review is separate from constitution promotion.</li>
              <li>AI drafts never overwrite the human answer automatically.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

function backToQuestionSource() {
  const source = CURRENT_QUESTION_SOURCE_VIEW || 'questions';
  if (source === 'team') {
    setNavActive('team');
    CURRENT_VIEW = 'team';
    renderTeamMembers();
    return;
  }
  setNavActive('questions');
  CURRENT_VIEW = 'questions';
  showView('questions');
}

// Paginated state for the Priority Questions page (infinite scroll).
let PRIORITY_QUESTIONS_STATE = { all: [], rendered: 0, memberOptions: [], pageSize: 10, _observer: null };

function priorityQuestionSeq(q) {
  const m = /Q-AI-(\d+)/.exec(q.qid || '');
  return m ? parseInt(m[1], 10) : 0;
}

async function renderQuestions() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/questions?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, UNKNOWN: 4 };
  // Flatten every question into one list, tagged with the team member it belongs
  // to, then sort newest generated first (then by priority).
  const flat = [];
  (data.org_wide || []).forEach((q) => flat.push({ ...q, employeeLabel: q.assignee || 'Org-wide' }));
  Object.values(data.employees || {}).forEach((emp) => {
    (emp.questions || []).forEach((q) => flat.push({ ...q, employeeLabel: emp.display_name || q.assignee || '' }));
  });
  flat.sort((a, b) => {
    const sa = priorityQuestionSeq(a);
    const sb = priorityQuestionSeq(b);
    if (sa !== sb) return sb - sa;
    return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
  });

  const memberOptions = (data.team_counts || []).map((m) => ({ value: m.display_name, label: m.display_name }));
  if (!memberOptions.find((m) => m.value === 'Ryan Cochran')) {
    memberOptions.unshift({ value: 'Ryan Cochran', label: 'Ryan Cochran' });
  }
  PRIORITY_QUESTIONS_STATE = { all: flat, rendered: 0, memberOptions, pageSize: 10, _observer: null };

  let html = '<h2>Priority Questions</h2>';
  html += '<div class="small text-muted mb-3">Latest generated questions first. Each card shows the team member it belongs to. Scroll to load more.</div>';
  html += renderQuestionPrioritySummary(data);
  html += renderTeamCountPills(data.team_counts);
  html += '<div class="q-card-grid" id="priorityQuestionsGrid"></div>';
  html += '<div id="priorityQuestionsSentinel" class="text-center text-muted small py-3"></div>';
  document.getElementById('mainView').innerHTML = `<div class="priority-questions-view">${html}</div>`;

  appendPriorityQuestionsPage(); // render the first page (10)
  setupPriorityQuestionsInfiniteScroll();
  refreshPriorityQuestionScoreboard();
}

// Card markup for a single Priority Question (shared by every page).
function renderQuestionCard(question, memberOptions) {
  return `
    <div class="q-card priority-${question.priority}" id="qcard-${escapeHtml(question.qid)}">
      <div class="q-card-head">
        <span class="qid">${escapeHtml(question.qid)}</span>
        <span class="q-card-badges">
          <span class="badge badge-${question.priority.toLowerCase()}">${escapeHtml(question.priority)}</span>
          <span class="badge bg-secondary">${escapeHtml(question.status)}</span>
        </span>
      </div>
      <div class="q-card-employee">${escapeHtml(question.employeeLabel || question.assignee || '')}</div>
      <div class="q-card-title">${escapeHtml(question.title)}</div>
      <div class="q-card-text">${escapeHtml(question.short_question)}</div>
      <details class="q-card-details">
        <summary>Show full context</summary>
        <pre class="small mt-2">${escapeHtml(question.body)}</pre>
      </details>
      <div class="q-card-foot">
        <select class="form-select form-select-sm q-card-select" title="Route to team member" onchange="saveQuestionAssignment('${escapeJs(question.qid)}', this.value)">
          ${memberOptions.map((member) => `<option ${member.value === (question.assignee || 'Ryan Cochran') ? 'selected' : ''} value="${escapeHtml(member.value)}">${escapeHtml(member.label)}</option>`).join('')}
        </select>
      </div>
      <details class="q-card-answer">
        <summary>Answer this question</summary>
        <textarea class="form-control form-control-sm q-answer-input mt-2" id="qanswer-${escapeHtml(question.qid)}" rows="3" placeholder="Type the answer. On save it is committed to the assignee's folder under Governance_Files/Priority_Questions/."></textarea>
        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-sm btn-primary q-answer-save" type="button" onclick="savePriorityQuestionAnswer('${escapeJs(question.qid)}')">Save Answer</button>
        </div>
      </details>
    </div>`;
}

// Append the next page of questions (no duplicates — slices by rendered count).
function appendPriorityQuestionsPage() {
  const state = PRIORITY_QUESTIONS_STATE;
  const grid = document.getElementById('priorityQuestionsGrid');
  const sentinel = document.getElementById('priorityQuestionsSentinel');
  if (!grid) return;
  const next = state.all.slice(state.rendered, state.rendered + state.pageSize);
  if (next.length) {
    grid.insertAdjacentHTML('beforeend', next.map((q) => renderQuestionCard(q, state.memberOptions)).join(''));
    state.rendered += next.length;
  }
  if (sentinel) {
    sentinel.textContent = state.rendered >= state.all.length
      ? (state.all.length ? 'All priority questions loaded.' : 'No priority questions yet.')
      : `Showing ${state.rendered} of ${state.all.length} — scroll for more…`;
  }
}

// Load the next page when the sentinel scrolls into view.
function setupPriorityQuestionsInfiniteScroll() {
  const sentinel = document.getElementById('priorityQuestionsSentinel');
  if (!sentinel || typeof IntersectionObserver === 'undefined') return;
  if (PRIORITY_QUESTIONS_STATE._observer) PRIORITY_QUESTIONS_STATE._observer.disconnect();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && CURRENT_VIEW === 'questions'
          && PRIORITY_QUESTIONS_STATE.rendered < PRIORITY_QUESTIONS_STATE.all.length) {
        appendPriorityQuestionsPage();
      }
    });
  }, { rootMargin: '250px' });
  observer.observe(sentinel);
  PRIORITY_QUESTIONS_STATE._observer = observer;
}

// Recompute the Priority Questions counts from the full in-memory list (not just
// the paginated cards) and update the sidebar badge. Called on render and after a
// question is answered, so the scores stay correct with infinite scroll.
function refreshPriorityQuestionScoreboard() {
  const view = document.querySelector('.priority-questions-view');
  if (!view) return;
  const all = (PRIORITY_QUESTIONS_STATE && PRIORITY_QUESTIONS_STATE.all) || [];
  const total = all.length;
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  let open = 0;
  all.forEach((q) => {
    const p = (q.priority || '').toUpperCase();
    if (counts[p] !== undefined) counts[p] += 1;
    if (question_is_unanswered_client(q.status)) open += 1;
  });
  const setVal = (selector, value) => {
    const el = view.querySelector(selector);
    if (el) el.textContent = value;
  };
  setVal('.q-summary-chip.total .q-summary-value', total);
  setVal('.q-summary-chip.open .q-summary-value', open);
  setVal('.q-summary-chip.critical .q-summary-value', counts.CRITICAL);
  setVal('.q-summary-chip.high .q-summary-value', counts.HIGH);
  setVal('.q-summary-chip.medium .q-summary-value', counts.MEDIUM);
  setVal('.q-summary-chip.low .q-summary-value', counts.LOW);
  // Sidebar badge reflects the total priority questions.
  CURRENT_NAV_COUNTS.questions = total;
  renderNavMenu();
}

function renderQuestionPrioritySummary(data) {
  const all = [...(data.org_wide || [])];
  Object.values(data.employees || {}).forEach((employee) => {
    (employee.questions || []).forEach((q) => all.push(q));
  });
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  let openCount = 0;
  all.forEach((q) => {
    const p = (q.priority || '').toUpperCase();
    if (counts[p] !== undefined) counts[p] += 1;
    if (question_is_unanswered_client(q.status)) openCount += 1;
  });
  const chip = (label, value, cls) => `
    <div class="q-summary-chip ${cls}">
      <span class="q-summary-value">${value}</span>
      <span class="q-summary-label">${label}</span>
    </div>`;
  return `
    <div class="q-summary-row">
      ${chip('Total', all.length, 'total')}
      ${chip('Open', openCount, 'open')}
      ${chip('Critical', counts.CRITICAL, 'critical')}
      ${chip('High', counts.HIGH, 'high')}
      ${chip('Medium', counts.MEDIUM, 'medium')}
      ${chip('Low', counts.LOW, 'low')}
    </div>`;
}

function question_is_unanswered_client(status) {
  const s = (status || '').trim().toUpperCase();
  return !['RESOLVED', 'ANSWERED', 'CLOSED', 'DONE'].includes(s);
}

async function saveQuestionAssignment(qid, assignee) {
  await fetch('/api/question_assignment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company: CURRENT_COMPANY, qid, assignee }),
  });
}

// Answer a Priority Question: commit a Markdown answer to the assignee's folder
// under Governance_Files/Priority_Questions/ (reuses the Task Tracker GitHub
// integration), then remove only this answered question from the UI.
async function savePriorityQuestionAnswer(qid) {
  const card = document.getElementById(`qcard-${qid}`);
  if (!card) return;
  const answerEl = document.getElementById(`qanswer-${qid}`);
  const answer = (answerEl && answerEl.value || '').trim();
  if (!answer) {
    showToast('Please enter an answer.', 'error');
    return;
  }
  const select = card.querySelector('.q-card-select');
  const employee = (select && select.value) || 'Ryan Cochran';
  const title = (card.querySelector('.q-card-title')?.textContent || '').trim();
  const shortText = (card.querySelector('.q-card-text')?.textContent || '').trim();
  const question = [title, shortText].filter(Boolean).join(' — ');
  const btn = card.querySelector('.q-answer-save');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  // Same loading state as the other network-backed save flows in the app.
  showProcessing('Saving answer…');
  try {
    const response = await fetch('/api/priority_questions/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: CURRENT_COMPANY, qid, employee, answered_by: employee, question, answer }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || payload.reason || `HTTP ${response.status}`);
    }
    hideProcessing();
    showToast('Answer saved successfully.', 'success');
    // Remove only this answered question; the rest of the list is untouched.
    card.remove();
    // Keep the paginated in-memory list in sync so counts stay correct.
    if (PRIORITY_QUESTIONS_STATE && PRIORITY_QUESTIONS_STATE.all) {
      const idx = PRIORITY_QUESTIONS_STATE.all.findIndex((q) => q.qid === qid);
      if (idx >= 0) {
        PRIORITY_QUESTIONS_STATE.all.splice(idx, 1);
        if (PRIORITY_QUESTIONS_STATE.rendered > 0) PRIORITY_QUESTIONS_STATE.rendered -= 1;
      }
    }
    // Update the summary chips and sidebar badge live.
    refreshPriorityQuestionScoreboard();
  } catch (error) {
    hideProcessing();
    if (btn) { btn.disabled = false; btn.textContent = 'Save Answer'; }
    showToast(`Save failed: ${error.message}`, 'error');
  }
}

function scrollToQuestionGroup(memberKey) {
  const target = document.getElementById(`member-${memberKey}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    CURRENT_VIEW = 'questions';
    document.querySelectorAll('#navMenu button').forEach((b) => b.classList.toggle('active', b.dataset.view === 'questions'));
    showView('questions').then(() => {
      const retry = document.getElementById(`member-${memberKey}`);
      if (retry) retry.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function showQuestionsForMember(memberKey) {
  CURRENT_VIEW = 'questions';
  document.querySelectorAll('#navMenu button').forEach((b) => b.classList.toggle('active', b.dataset.view === 'questions'));
  showView('questions').then(() => scrollToQuestionGroup(memberKey));
}

async function showIntakesForMember(memberKey) {
  CURRENT_VIEW = 'board';
  document.querySelectorAll('#navMenu button').forEach((b) => b.classList.toggle('active', b.dataset.view === 'board'));
  const intakes = await fetchJSON(`/api/intake?company=${CURRENT_COMPANY}`);
  renderBoardWithItems(intakes.filter((item) => item.employee === memberKey), prettyName(memberKey));
}

function prettyName(memberKey) {
  return (memberKey || '').replaceAll('_', ' ');
}

async function renderCustomers() {
  const _r = VIEW_REQUEST;
  const departmentData = await fetchJSON(`/api/departments?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  const customerWorkspace = (departmentData.company_specific || []).find((dept) => dept.key === 'CUSTOMER_RELATIONS');
  if (customerWorkspace) {
    CURRENT_DEPARTMENT = 'CUSTOMER_RELATIONS';
    return renderDepartmentWorkspace(departmentData, customerWorkspace);
  }

  const data = await fetchJSON(`/api/customers?company=${CURRENT_COMPANY}`);
  const aspectData = await fetchJSON(`/api/aspect_groups?company=${CURRENT_COMPANY}`);
  const sourceData = await fetchJSON(`/api/customer_source?company=${CURRENT_COMPANY}`);
  const customerGroup = (aspectData.groups || []).find((group) => /customer|portal|experience|marketing/i.test(group.name));
  const customerDepartments = (departmentData.company_specific || []).filter((dept) => ['CUSTOMER_RELATIONS', 'CUSTOMER_SUPPORT'].includes(dept.key));
  document.getElementById('mainView').innerHTML = `
        <h2>Customer Relations</h2>
        <div class="alert alert-info">
          This page is the landing zone for customer-relations work, customer segmentation, support routing, and future persona classification. Once the customer data source is connected, this is where we can decide who should receive which outreach when inventory or offers become available.
        </div>
    ${customerDepartments.length ? `
      <div class="row g-3 mb-3">
        ${customerDepartments.map((dept) => `
          <div class="col-md-6">
            ${renderDepartmentCard(dept, { compact: true })}
          </div>
        `).join('')}
      </div>
    ` : ''}
    <div class="row g-3 mb-3">
      <div class="col-md-6">
        <div class="dash-card h-100">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <div class="fw-semibold mb-1">Customer data source</div>
              <div class="small text-muted">Save the database source here so this page can become the canonical customer workspace.</div>
            </div>
            <span class="badge ${sourceData.configured ? 'text-bg-success' : 'text-bg-warning'}">${sourceData.configured ? 'Configured' : 'Not configured'}</span>
          </div>
          <div class="small mt-3 mb-2"><strong>Connector status:</strong> ${sourceData.driver_ready ? 'SQL client library detected on this machine.' : 'No SQL client library installed on this machine yet.'}</div>
          <div class="small text-muted mb-3">Detected drivers: ${Object.entries(sourceData.drivers).map(([name, ok]) => `${name}=${ok ? 'yes' : 'no'}`).join(', ')}</div>
          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label small mb-1">Server</label>
              <input class="form-control form-control-sm" id="customerSourceServer" value="${escapeHtml(sourceData.source.server || '')}" placeholder="SQL host or server name">
            </div>
            <div class="col-md-6">
              <label class="form-label small mb-1">Database</label>
              <input class="form-control form-control-sm" id="customerSourceDatabase" value="${escapeHtml(sourceData.source.database || '')}" placeholder="BPMProd or other source DB">
            </div>
            <div class="col-12">
              <label class="form-label small mb-1">Table or view</label>
              <input class="form-control form-control-sm" id="customerSourceTable" value="${escapeHtml(sourceData.source.table_or_view || '')}" placeholder="Customer view, export table, or CRM source">
            </div>
            <div class="col-12">
              <label class="form-label small mb-1">Notes</label>
              <textarea class="form-control form-control-sm" id="customerSourceNotes" rows="2" placeholder="How this source should be used, access notes, or open questions">${escapeHtml(sourceData.source.notes || '')}</textarea>
            </div>
          </div>
          <div class="mt-3 d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-primary" type="button" onclick="saveCustomerSourceSettings()">Save source settings</button>
            <span id="customerSourceSaveStatus" class="small text-muted"></span>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="dash-card h-100">
          <div class="fw-semibold mb-2">Likely source candidates</div>
          <ul class="small mb-0">
            ${sourceData.candidates.map((item) => `<li><strong>${escapeHtml(item.label)}</strong> <span class="text-muted">(${escapeHtml(item.type)})</span> - ${escapeHtml(item.notes)}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <div class="dash-card">
          <div class="fw-semibold mb-2">Customer-related governance files</div>
          ${data.governance_files.length ? `<ul class="small mb-0">${data.governance_files.map((file) => `<li><code>${escapeHtml(file.name)}</code></li>`).join('')}</ul>` : '<div class="text-muted small">No customer governance files found yet.</div>'}
        </div>
      </div>
      <div class="col-md-6">
        <div class="dash-card">
          <div class="fw-semibold mb-2">Customer-related repos</div>
          ${data.customer_repos.length ? `<ul class="small mb-0">${data.customer_repos.map((repo) => `<li><code>${escapeHtml(repo.name)}</code></li>`).join('')}</ul>` : '<div class="text-muted small">No customer repos found yet.</div>'}
        </div>
      </div>
    </div>
    <div class="dash-card mt-3">
      <div class="fw-semibold mb-2">Customer fields we will want for segmentation</div>
      <div class="repo-chip-row">
        ${sourceData.profile_fields.map((field) => `<span class="repo-chip">${escapeHtml(field)}</span>`).join('')}
      </div>
      <div class="small text-muted mt-3">These are the working customer attributes this page should eventually use for persona grouping, target outreach, and immediate sell-through actions.</div>
    </div>
    <div class="dash-card mt-3">
      <div class="d-flex justify-content-between align-items-center gap-2">
        <div>
          <div class="fw-semibold mb-1">Closest current aspect group</div>
          <div class="small text-muted">This is the current working category that most closely matches customer/persona work for ${escapeHtml(CURRENT_COMPANY)}.</div>
        </div>
        <button class="btn btn-sm btn-outline-primary" type="button" onclick="showView('aspects')">Open all aspect groups</button>
      </div>
      ${customerGroup ? `
        <div class="aspect-mini mt-3">
          <div class="d-flex justify-content-between flex-wrap gap-2">
            <div>
              <div class="fw-semibold">${escapeHtml(customerGroup.name)}</div>
              <div class="small text-muted">${escapeHtml(customerGroup.description || '')}</div>
            </div>
            <span class="badge text-bg-light">${customerGroup.count} repos</span>
          </div>
          <div class="repo-chip-row mt-3">
            ${customerGroup.repos.map((repo) => `<span class="repo-chip">${escapeHtml(repo)}</span>`).join('')}
          </div>
        </div>
      ` : '<div class="text-muted small mt-3">No customer-adjacent aspect group is defined yet.</div>'}
    </div>
    <div class="dash-card mt-3">
      <div class="fw-semibold mb-2">Next step</div>
      <div class="small text-muted">Once you decide the canonical customer export source, this page can become the place for customer counts, persona buckets, and customer-to-team routing.</div>
    </div>
  `;
}

async function saveCustomerSourceSettings() {
  const payload = {
    company: CURRENT_COMPANY,
    server: document.getElementById('customerSourceServer')?.value || '',
    database: document.getElementById('customerSourceDatabase')?.value || '',
    table_or_view: document.getElementById('customerSourceTable')?.value || '',
    notes: document.getElementById('customerSourceNotes')?.value || '',
  };
  const status = document.getElementById('customerSourceSaveStatus');
  const response = await fetch('/api/customer_source', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (status) status.innerHTML = `<span class="text-danger">Save failed: ${escapeHtml(result.error || 'unknown error')}</span>`;
    return;
  }
  if (status) status.innerHTML = `<span class="text-success">Customer source settings saved. Live DB pull will be available once the SQL connector is installed and the source is confirmed.</span>`;
  await renderCustomers();
}

let LAST_ASPECT_REVIEWER = '';

async function saveAspectReview(encodedName) {
  const name = decodeURIComponent(encodedName);
  const key = btoa(unescape(encodeURIComponent(name))).replace(/[^a-zA-Z0-9]/g, '');
  const reviewer = (document.getElementById(`arev-${key}`)?.value || '').trim();
  const decision = document.getElementById(`adec-${key}`)?.value || 'CONFIRMED';
  const note = (document.getElementById(`anote-${key}`)?.value || '').trim();
  const statusEl = document.getElementById(`astatus-${key}`);
  if (!reviewer) {
    if (statusEl) statusEl.textContent = 'Enter a reviewer name first.';
    return;
  }
  if (statusEl) statusEl.textContent = 'Saving…';
  try {
    const res = await fetch('/api/aspect_groups/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: CURRENT_COMPANY, group_name: name, decision, reviewer, note }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Save failed');
    LAST_ASPECT_REVIEWER = reviewer;
    if (typeof showToast === 'function') showToast(`${name} marked ${decision.replace('_', ' ').toLowerCase()}`, 'success');
    renderAspectGroups();
  } catch (e) {
    if (statusEl) statusEl.textContent = e.message || 'Save failed';
  }
}

function aspectKey(name) {
  try { return btoa(unescape(encodeURIComponent(name))).replace(/[^a-zA-Z0-9]/g, ''); }
  catch (e) { return name.replace(/[^a-zA-Z0-9]/g, ''); }
}

async function renderAspectGroups() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/aspect_groups?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  const groups = data.groups || [];
  const totalRepos = groups.reduce((sum, group) => sum + (group.count || 0), 0);
  const reviewGroup = groups.find((group) => (group.confidence || '').toLowerCase().includes('review'));
  const ungrouped = reviewGroup ? reviewGroup.count : 0;
  const confirmedCount = groups.filter((group) => group.review && group.review.decision === 'CONFIRMED').length;
  const decisions = [['CONFIRMED', 'Confirmed'], ['NEEDS_WORK', 'Needs work'], ['PENDING', 'Pending']];

  const cards = groups.map((group, index) => {
    const needsReview = (group.confidence || '').toLowerCase().includes('review');
    const accent = needsReview ? 'review' : `c${(index % 6) + 1}`;
    const key = aspectKey(group.name);
    const enc = encodeURIComponent(group.name);
    const rv = group.review;
    const chips = group.repos.length
      ? group.repos.map((repo) => `<span class="aspect-chip">${escapeHtml(repo)}</span>`).join('')
      : '<span class="aspect-empty">No repos currently grouped here.</span>';
    const stateLine = rv
      ? `<span class="aspect-state decision-${escapeHtml((rv.decision || '').toLowerCase())}">
           <span class="aspect-state-badge">${escapeHtml((rv.decision || '').replace('_', ' '))}</span>
           <span class="aspect-state-by">by <strong>${escapeHtml(rv.reviewer)}</strong> &middot; ${escapeHtml(formatFindingDate(rv.reviewed_at) || rv.reviewed_at || '')}</span>
         </span>`
      : `<span class="aspect-state not-reviewed"><span class="aspect-state-badge pending">Not reviewed</span></span>`;
    return `
      <div class="aspect-card accent-${accent}${rv && rv.decision === 'CONFIRMED' ? ' is-confirmed' : ''}">
        <div class="aspect-card-head">
          <div class="aspect-title">${escapeHtml(group.name)}</div>
          <span class="aspect-count" title="repos in this group">${group.count}</span>
        </div>
        ${group.description ? `<div class="aspect-desc">${escapeHtml(group.description)}</div>` : ''}
        <div class="aspect-chip-row">${chips}</div>
        <div class="aspect-card-foot">
          <div class="aspect-foot-top">
            <span class="aspect-conf ${needsReview ? 'review' : 'ok'}">${escapeHtml(group.confidence || 'Unspecified')}</span>
            ${stateLine}
          </div>
          <details class="aspect-actions">
            <summary>${rv ? 'Update review' : 'Review this group'}</summary>
            <div class="aspect-action-grid">
              <input type="text" class="form-control form-control-sm" id="arev-${key}" placeholder="Reviewer name" value="${escapeHtml(rv ? rv.reviewer : (LAST_ASPECT_REVIEWER || ''))}">
              <select class="form-select form-select-sm" id="adec-${key}">
                ${decisions.map(([value, label]) => `<option value="${value}" ${rv && rv.decision === value ? 'selected' : ''}>${label}</option>`).join('')}
              </select>
              <input type="text" class="form-control form-control-sm aspect-note-input" id="anote-${key}" placeholder="Note (optional)" value="${escapeHtml(rv && rv.note ? rv.note : '')}">
              <button class="btn btn-sm btn-primary" type="button" onclick="saveAspectReview('${enc}')">Save</button>
            </div>
            <div class="small text-muted mt-1" id="astatus-${key}"></div>
          </details>
        </div>
      </div>`;
  }).join('');

  document.getElementById('mainView').innerHTML = `
    <div class="aspect-groups-view">
      <h2>Aspect Groups</h2>
      <div class="aspect-intro">Working groupings for <strong>${escapeHtml(CURRENT_COMPANY)}</strong> &mdash; each bucket shows the repos that appear to belong to that aspect of the business. Review and confirm each grouping to turn it from a hypothesis into a stable map.</div>
      <div class="aspect-stats">
        <div class="aspect-stat"><span class="aspect-stat-value">${groups.length}</span><span class="aspect-stat-label">Groups</span></div>
        <div class="aspect-stat"><span class="aspect-stat-value">${totalRepos}</span><span class="aspect-stat-label">Grouped repos</span></div>
        <div class="aspect-stat ok"><span class="aspect-stat-value">${confirmedCount}</span><span class="aspect-stat-label">Confirmed</span></div>
        <div class="aspect-stat ${ungrouped ? 'warn' : ''}"><span class="aspect-stat-value">${ungrouped}</span><span class="aspect-stat-label">Needs review</span></div>
      </div>
      <div class="aspect-grid">${cards}</div>
    </div>
  `;
}

async function saveOpenAiSettings() {
  const key = document.getElementById('openAiApiKey')?.value?.trim();
  const model = document.getElementById('openAiModel')?.value?.trim() || 'gpt-5';
  const status = document.getElementById('openAiSaveStatus');
  if (!key) {
    if (status) status.innerHTML = '<span class="text-danger">Enter an API key first.</span>';
    return;
  }
  const response = await fetch('/api/openai_settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, model }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (status) status.innerHTML = `<span class="text-danger">Save failed: ${escapeHtml(payload.error || 'unknown error')}</span>`;
    return;
  }
  if (status) status.innerHTML = `<span class="text-success">OpenAI Codex is now configured for this machine using model ${escapeHtml(model)}.</span>`;
  await refreshIntegrationSidebar();
  await refreshNavCounts();
  await renderDashboard();
}

let LAST_FINDING_REVIEWER = '';

async function saveFindingReview(fid) {
  const reviewer = (document.getElementById(`freviewer-${fid}`)?.value || '').trim();
  const decision = document.getElementById(`fdecision-${fid}`)?.value || 'REVIEWED';
  const note = (document.getElementById(`fnote-${fid}`)?.value || '').trim();
  const statusEl = document.getElementById(`freviewstatus-${fid}`);
  if (!reviewer) {
    if (statusEl) statusEl.textContent = 'Enter a reviewer name first.';
    return;
  }
  if (statusEl) statusEl.textContent = 'Saving…';
  try {
    const res = await fetch('/api/findings/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: CURRENT_COMPANY, fid, decision, reviewer, note }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Save failed');
    LAST_FINDING_REVIEWER = reviewer;
    if (typeof showToast === 'function') {
      showToast(`${fid} marked ${decision.toLowerCase()} by ${reviewer}`, 'success');
    }
    renderFindings();
  } catch (e) {
    if (statusEl) statusEl.textContent = e.message || 'Save failed';
  }
}

async function renderFindings() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/findings?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  if (!data.exists) {
    document.getElementById('mainView').innerHTML = '<div class="findings-view"><h2>Findings for Review</h2><div class="alert alert-info">No findings file yet.</div></div>';
    return;
  }
  const generatedLabel = formatFindingDate(data.generated_at) || data.last_updated || '';
  const byType = {};
  data.findings.forEach((finding) => {
    if (!byType[finding.type]) byType[finding.type] = [];
    byType[finding.type].push(finding);
  });
  let html = `
    <div class="findings-view">
      <div class="findings-head">
        <div>
          <h2>Findings for Review <span class="findings-count">${data.findings.length}</span></h2>
          <div class="small text-muted">AI-flagged observations to review before they become questions or governance changes.</div>
        </div>
        ${generatedLabel ? `<div class="findings-generated"><span class="findings-generated-label">Generated</span><span class="findings-generated-value">${escapeHtml(generatedLabel)}</span></div>` : ''}
      </div>
      <div class="findings-note">Approving a finding here lets it propagate to <strong>draft governance only</strong>. Commit approval is still separate.</div>
  `;
  ['INCONSISTENCY', 'PATTERN', 'INFERENCE', 'FACT', 'UNKNOWN'].forEach((type) => {
    if (!byType[type]) return;
    html += `<h3 class="findings-type-head">${escapeHtml(type)} <span class="findings-type-count">${byType[type].length}</span></h3>`;
    html += '<div class="findings-grid">';
    byType[type].forEach((finding) => {
      const when = finding.date || generatedLabel;
      const rv = finding.review;
      const reviewState = rv
        ? `<div class="f-review-state decision-${escapeHtml((rv.decision || 'reviewed').toLowerCase())}">
             <span class="f-review-badge">${escapeHtml(rv.decision)}</span>
             <span class="f-review-by">Reviewed by <strong>${escapeHtml(rv.reviewer)}</strong> &middot; ${escapeHtml(formatFindingDate(rv.reviewed_at) || rv.reviewed_at || '')}</span>
             ${rv.note ? `<span class="f-review-note">&ldquo;${escapeHtml(rv.note)}&rdquo;</span>` : ''}
           </div>`
        : `<div class="f-review-state not-reviewed"><span class="f-review-badge pending">Not reviewed yet</span></div>`;
      const decisions = ['REVIEWED', 'APPROVED', 'DISMISSED', 'PENDING'];
      const fidJs = escapeJs(finding.fid);
      const reviewForm = `
        <details class="f-review-form">
          <summary>${rv ? 'Update review' : 'Review this finding'}</summary>
          <div class="f-review-grid">
            <input type="text" class="form-control form-control-sm" id="freviewer-${fidJs}" placeholder="Reviewer name" value="${escapeHtml(rv ? rv.reviewer : (LAST_FINDING_REVIEWER || ''))}">
            <select class="form-select form-select-sm" id="fdecision-${fidJs}">
              ${decisions.map((d) => `<option value="${d}" ${rv && rv.decision === d ? 'selected' : ''}>${d.charAt(0) + d.slice(1).toLowerCase()}</option>`).join('')}
            </select>
            <input type="text" class="form-control form-control-sm f-review-note-input" id="fnote-${fidJs}" placeholder="Note (optional)" value="${escapeHtml(rv && rv.note ? rv.note : '')}">
            <button class="btn btn-sm btn-primary" type="button" onclick="saveFindingReview('${fidJs}')">Save review</button>
          </div>
          <div class="small text-muted mt-1" id="freviewstatus-${fidJs}"></div>
        </details>`;
      html += `
        <div class="f-card f-type-${escapeHtml((finding.type || 'unknown').toLowerCase())}${rv ? ' is-reviewed' : ''}">
          <div class="f-card-head">
            <span class="fid">${escapeHtml(finding.fid)}</span>
            <span class="f-card-badges">
              <span class="badge f-badge-type">${escapeHtml(finding.type)}</span>
              <span class="badge f-badge-status">${escapeHtml(finding.status)}</span>
              ${finding.confidence ? `<span class="badge f-badge-conf">conf: ${escapeHtml(finding.confidence)}</span>` : ''}
            </span>
          </div>
          <div class="f-card-title">${escapeHtml(finding.title)}</div>
          <div class="f-card-meta">
            ${when ? `<span class="f-when" title="When this finding was generated / added">Added ${escapeHtml(when)}</span>` : ''}
            ${finding.scope ? `<span class="f-scope">Scope: ${escapeHtml(finding.scope)}</span>` : ''}
          </div>
          <div class="f-card-section"><span class="f-label">Observation</span><span>${escapeHtml(finding.observation)}</span></div>
          ${finding.why_matters ? `<div class="f-card-section"><span class="f-label">Why it matters</span><span>${escapeHtml(finding.why_matters)}</span></div>` : ''}
          ${finding.proposed ? `<div class="f-card-section"><span class="f-label">Proposed</span><span>${escapeHtml(finding.proposed)}</span></div>` : ''}
          <div class="f-review">${reviewState}${reviewForm}</div>
        </div>
      `;
    });
    html += '</div>';
  });
  html += '</div>';
  document.getElementById('mainView').innerHTML = html;
}

function formatFindingDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return iso;
  }
}

async function renderDecisions() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/decisions?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  document.getElementById('mainView').innerHTML = data.exists
    ? `<h2>Decision Log</h2><pre>${escapeHtml(data.content)}</pre>`
    : '<h2>Decision Log</h2><div class="alert alert-info">No decision log yet.</div>';
}

async function renderGlossary() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/glossary?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  document.getElementById('mainView').innerHTML = data.exists
    ? `<h2>Glossary <span class="small text-muted">(${escapeHtml(data.file)})</span></h2><pre>${escapeHtml(data.content)}</pre>`
    : '<h2>Glossary</h2><div class="alert alert-info">No glossary yet.</div>';
}

async function renderInventory() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/inventory?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  document.getElementById('mainView').innerHTML = data.exists
    ? `<h2>Repo Inventory</h2><pre>${escapeHtml(data.content)}</pre>`
    : '<h2>Repo Inventory</h2><div class="alert alert-info">No inventory yet.</div>';
}

function governanceFileChatStorageKey(path) {
  return `gw:${CURRENT_COMPANY}:govfile:${path}`;
}

function loadGovernanceFileChatState(path) {
  if (!path) return { messages: [], engine: 'Claude Code' };
  try {
    const raw = localStorage.getItem(governanceFileChatStorageKey(path));
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      engine: parsed.engine || 'Claude Code',
    };
  } catch (_error) {
    return { messages: [], engine: 'Claude Code' };
  }
}

function persistGovernanceFileChatState(path, state) {
  if (!path) return;
  localStorage.setItem(governanceFileChatStorageKey(path), JSON.stringify({
    messages: state.messages || [],
    engine: state.engine || 'Claude Code',
  }));
}

function selectedGovernanceFileRow() {
  return CURRENT_GOVERNANCE_FILES.find((row) => row.path === CURRENT_GOVERNANCE_FILE_PATH) || null;
}

function governanceFilesFilteredRows() {
  const needle = CURRENT_GOVERNANCE_FILE_SEARCH.trim().toLowerCase();
  return CURRENT_GOVERNANCE_FILES.filter((row) => {
    if (CURRENT_GOVERNANCE_FILE_FILTER !== 'all' && row.category_key !== CURRENT_GOVERNANCE_FILE_FILTER) {
      return false;
    }
    if (!needle) return true;
    return [
      row.path,
      row.name,
      row.category_label,
      row.attention_summary || '',
      ...(row.headings || []),
    ].join(' ').toLowerCase().includes(needle);
  });
}

function governanceAttentionBadge(row) {
  if (!row.attention_count) return '';
  const label = row.attention_level === 'high'
    ? 'Needs clarity'
    : row.attention_level === 'medium'
      ? 'Review'
      : row.attention_level === 'info'
        ? 'Draft'
        : 'Watch';
  return `<span class="gov-file-flag gov-file-flag-${escapeHtml(row.attention_level)}">${label}${row.attention_count > 1 ? ` (${row.attention_count})` : ''}</span>`;
}

function groupedGovernanceFileMarkup(rows) {
  const activePath = CURRENT_GOVERNANCE_FILE_PATH;
  const groups = new Map();
  rows.forEach((row) => {
    const key = row.category_key;
    if (!groups.has(key)) {
      groups.set(key, { label: row.category_label, rows: [] });
    }
    groups.get(key).rows.push(row);
  });
  return Array.from(groups.entries()).map(([key, group]) => `
    <div class="gov-file-group">
      ${CURRENT_GOVERNANCE_FILE_FILTER === 'all' ? `<div class="gov-file-group-label">${escapeHtml(group.label)} <span class="text-muted">(${group.rows.length})</span></div>` : ''}
      ${group.rows.map((row) => `
        <button class="gov-file-row ${activePath === row.path ? 'active' : ''}" type="button" onclick="selectGovernanceFile('${escapeJs(row.path)}')">
          <div class="gov-file-row-main">
            <div class="gov-file-row-name">${escapeHtml(row.name)}</div>
            <div class="gov-file-row-meta">${escapeHtml(row.path)} - ${(row.size / 1024).toFixed(1)} KB</div>
          </div>
          <div class="gov-file-row-side">
            ${governanceAttentionBadge(row)}
          </div>
        </button>
      `).join('')}
    </div>
  `).join('');
}

function renderGovernanceFilePreviewPane() {
  const row = selectedGovernanceFileRow();
  if (!row) {
    return `
      <div class="gov-file-empty-state">
        <div class="fw-semibold mb-2">Select a governance file</div>
        <div class="small text-muted">Choose a file from the left rail to read it here.</div>
      </div>
    `;
  }
  const detail = CURRENT_GOVERNANCE_FILE_DETAILS[row.path];
  const relatedList = (detail?.related_files || []);
  const relatedMarkup = relatedList.map((item) => `
    <button class="gov-rel-item" type="button" onclick="selectGovernanceFile('${escapeJs(item.path)}')">${escapeHtml(item.name)}</button>
  `).join('');
  const alertFlags = (detail?.attention_flags || row.attention_flags || []);
  const alertsMarkup = alertFlags.map((flag) => `
    <div class="gov-file-alert gov-file-alert-${escapeHtml(flag.level)}">
      <strong>${escapeHtml(flag.label)}</strong>
      <span>${escapeHtml(flag.reason)}</span>
    </div>
  `).join('');
  const headingsList = (detail?.headings || row.headings || []);
  const headingsMarkup = headingsList.map((heading) => `<li>${escapeHtml(heading)}</li>`).join('');
  const modified = escapeHtml((detail?.modified || row.modified || '').slice(0, 16).replace('T', ' '));
  return `
    <div class="gov-file-pane-head gov-preview-head">
      <div class="gov-preview-title">${escapeHtml(row.name)}</div>
      <div class="gov-preview-meta">
        <span class="gov-preview-cat">${escapeHtml(row.category_label)}</span>
        <span>${(row.size / 1024).toFixed(1)} KB</span>
        ${modified ? `<span>${modified}</span>` : ''}
      </div>
      <div class="gov-preview-path">${escapeHtml(row.path)}</div>
    </div>
    ${alertFlags.length ? `<div class="gov-file-alert-stack mb-3">${alertsMarkup}</div>` : ''}
    <div class="gov-file-preview-scroll">
      <pre id="fileContent" class="gov-file-content small">${detail ? escapeHtml(detail.content || '') : 'Loading file...'}</pre>
    </div>
    <div class="gov-preview-extras">
      <details class="gov-extra">
        <summary>On this page${headingsList.length ? ` (${headingsList.length})` : ''}</summary>
        ${headingsMarkup ? `<ul class="gov-heading-list">${headingsMarkup}</ul>` : '<div class="small text-muted mt-2">No headings detected.</div>'}
      </details>
      <details class="gov-extra">
        <summary>Related files${relatedList.length ? ` (${relatedList.length})` : ''}</summary>
        <div class="gov-rel-list">${relatedMarkup || '<span class="small text-muted">No related files in this category.</span>'}</div>
      </details>
    </div>
  `;
}

function renderGovernanceFileChatPane() {
  const row = selectedGovernanceFileRow();
  if (!row) {
    return `
      <div class="gov-file-empty-state">
        <div class="fw-semibold mb-2">Ask Claude or OpenAI about a file</div>
        <div class="small text-muted">Select a file first, then use the prompt box here to ask about drift, clarity, or related docs.</div>
      </div>
    `;
  }
  const state = loadGovernanceFileChatState(row.path);
  const chatMessages = state.messages.length ? state.messages.map((message) => `
    <div class="member-chat-message ${message.role === 'user' ? 'user' : 'assistant'}">
      <div class="member-chat-meta">${escapeHtml(message.engine)} - ${escapeHtml(message.ts || '')}</div>
      <div class="member-chat-body">${escapeHtml(message.text || '')}</div>
    </div>
  `).join('') : '<div class="small text-muted">No file review chat yet. Try one of the prompts below.</div>';
  return `
    <div class="gov-file-pane-head">
      <div>
        <div class="gov-file-pane-title">Document Review Assist</div>
        <div class="small text-muted">Ask about the selected file, its clarity alerts, and possible drift.</div>
      </div>
    </div>
    <div class="member-chat-engine-row mb-3">
      <input type="hidden" id="governanceFileChatEngine" value="${escapeHtml(state.engine || 'Claude Code')}">
      <button class="btn btn-sm btn-outline-primary ${state.engine !== 'OpenAI Codex' ? 'active' : ''}" type="button" data-gov-file-engine="Claude Code" onclick="setGovernanceFileChatEngine('Claude Code')">Claude</button>
      <button class="btn btn-sm btn-outline-primary ${state.engine === 'OpenAI Codex' ? 'active' : ''}" type="button" data-gov-file-engine="OpenAI Codex" onclick="setGovernanceFileChatEngine('OpenAI Codex')">OpenAI</button>
    </div>
    <div class="member-chat-suggestions mb-3">
      <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useGovernanceFilePromptSuggestion('Summarize this file for an operator and tell me what it is for.')">Summarize file</button>
      <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useGovernanceFilePromptSuggestion('What in this file appears to be drifting, stale, contradictory, or unclear?')">Check drift / clarity</button>
      <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useGovernanceFilePromptSuggestion('Tell me which related files I should review with this file and why.')">Find related files</button>
      <button class="btn btn-sm btn-outline-secondary" type="button" onclick="useGovernanceFilePromptSuggestion('List the owner decisions, TODOs, or unresolved items still hiding in this file.')">Find unresolved items</button>
    </div>
    <div class="member-chat-thread gov-file-chat-thread" id="governanceFileChatThread">${chatMessages}</div>
    <label class="form-label small mt-3 mb-1">Prompt</label>
    <textarea class="form-control" id="governanceFileChatComposer" rows="5" placeholder="Ask Claude or OpenAI about the selected governance file..."></textarea>
    <div class="d-flex justify-content-between align-items-center gap-2 mt-2 flex-wrap">
      <div id="governanceFileChatStatus" class="small text-muted">Ready.</div>
      <button class="btn btn-sm btn-primary" type="button" onclick="sendGovernanceFileChat()">Send</button>
    </div>
  `;
}

function renderGovernanceFilesWorkspace() {
  const main = document.getElementById('mainView');
  const filteredRows = governanceFilesFilteredRows();
  if (!filteredRows.length) {
    CURRENT_GOVERNANCE_FILE_PATH = null;
  } else if (!filteredRows.some((row) => row.path === CURRENT_GOVERNANCE_FILE_PATH)) {
    CURRENT_GOVERNANCE_FILE_PATH = filteredRows[0].path;
  }
  const selectedRow = selectedGovernanceFileRow();
  const selectedPath = selectedRow?.path || '';
  main.innerHTML = `
    <div class="gov-files-shell">
      <div class="gov-files-header">
        <div>
          <h2>Governance Files (${CURRENT_GOVERNANCE_FILES.length})</h2>
          <div class="small text-muted">Browse by category, read the file without losing the list, and ask Claude or OpenAI about drift or clarity in context.</div>
        </div>
        <div class="gov-files-summary-row">
          <div class="mini-stat-card">
            <div class="mini-stat-label">Categories</div>
            <div class="mini-stat-value">${CURRENT_GOVERNANCE_FILE_CATEGORIES.length}</div>
          </div>
          <div class="mini-stat-card">
            <div class="mini-stat-label">Needs review</div>
            <div class="mini-stat-value">${CURRENT_GOVERNANCE_FILES.filter((row) => row.attention_count).length}</div>
          </div>
          <div class="mini-stat-card">
            <div class="mini-stat-label">Drafts</div>
            <div class="mini-stat-value">${CURRENT_GOVERNANCE_FILES.filter((row) => row.category_key === 'drafts').length}</div>
          </div>
        </div>
      </div>

      <div class="gov-files-toolbar">
        <div class="gov-files-toolbar-search">
          <input class="form-control" type="search" value="${escapeHtml(CURRENT_GOVERNANCE_FILE_SEARCH)}" placeholder="Search files, headings, or alert labels..." oninput="updateGovernanceFileSearch(this.value)">
        </div>
        <div class="repo-chip-row">
          <button class="repo-chip-button ${CURRENT_GOVERNANCE_FILE_FILTER === 'all' ? 'active' : ''}" type="button" onclick="setGovernanceFileCategory('all')">All files</button>
          ${CURRENT_GOVERNANCE_FILE_CATEGORIES.map((category) => `
            <button class="repo-chip-button ${CURRENT_GOVERNANCE_FILE_FILTER === category.key ? 'active' : ''}" type="button" onclick="setGovernanceFileCategory('${escapeJs(category.key)}')">
              ${escapeHtml(category.label)} (${category.count})
            </button>
          `).join('')}
        </div>
      </div>

      <div class="gov-files-workspace">
        <div class="gov-file-pane">
          <div class="gov-file-pane-head">
            <div class="gov-file-pane-title">Document rail</div>
            <div class="small text-muted">${filteredRows.length} visible</div>
          </div>
          <div class="gov-file-list-scroll">
            ${groupedGovernanceFileMarkup(filteredRows) || '<div class="small text-muted p-3">No files match this filter.</div>'}
          </div>
        </div>
        <div class="gov-file-pane">
          ${renderGovernanceFilePreviewPane()}
        </div>
        <div class="gov-file-pane member-chat-card gw-expandable">
          <button class="gw-fs-close" type="button" onclick="toggleSectionFullscreen(this)" title="Close full view">&#10005;</button>
          <button class="btn btn-sm btn-outline-secondary fs-corner-btn" type="button" data-fs-toggle onclick="toggleSectionFullscreen(this)">Full view</button>
          ${renderGovernanceFileChatPane()}
        </div>
      </div>
    </div>
  `;
  if (selectedPath && !CURRENT_GOVERNANCE_FILE_DETAILS[selectedPath]) {
    openFile(selectedPath);
  }
}

function setGovernanceFileCategory(categoryKey) {
  CURRENT_GOVERNANCE_FILE_FILTER = categoryKey || 'all';
  renderGovernanceFilesWorkspace();
}

function updateGovernanceFileSearch(value) {
  CURRENT_GOVERNANCE_FILE_SEARCH = value || '';
  renderGovernanceFilesWorkspace();
}

function selectGovernanceFile(path) {
  CURRENT_GOVERNANCE_FILE_PATH = path;
  renderGovernanceFilesWorkspace();
  if (!CURRENT_GOVERNANCE_FILE_DETAILS[path]) {
    openFile(path);
  }
}

function appendGovernanceFileChatMessage(role, engine, text) {
  const row = selectedGovernanceFileRow();
  if (!row) return;
  const state = loadGovernanceFileChatState(row.path);
  state.messages.push({
    role,
    engine,
    text,
    ts: new Date().toLocaleString(),
  });
  persistGovernanceFileChatState(row.path, state);
}

function setGovernanceFileChatEngine(engine) {
  const row = selectedGovernanceFileRow();
  if (!row) return;
  const state = loadGovernanceFileChatState(row.path);
  state.engine = engine;
  persistGovernanceFileChatState(row.path, state);
  const input = document.getElementById('governanceFileChatEngine');
  if (input) input.value = engine;
  document.querySelectorAll('[data-gov-file-engine]').forEach((button) => {
    button.classList.toggle('active', button.dataset.govFileEngine === engine);
  });
}

function useGovernanceFilePromptSuggestion(promptText) {
  const composer = document.getElementById('governanceFileChatComposer');
  if (composer) {
    composer.value = promptText;
    composer.focus();
  }
}

async function renderFiles() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/files?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  CURRENT_GOVERNANCE_FILES = data.rows || [];
  CURRENT_GOVERNANCE_FILE_CATEGORIES = data.categories || [];
  CURRENT_GOVERNANCE_FILE_DETAILS = {};
  CURRENT_GOVERNANCE_FILE_FILTER = 'all';
  CURRENT_GOVERNANCE_FILE_SEARCH = '';
  if (!CURRENT_GOVERNANCE_FILE_PATH || !CURRENT_GOVERNANCE_FILES.some((row) => row.path === CURRENT_GOVERNANCE_FILE_PATH)) {
    CURRENT_GOVERNANCE_FILE_PATH = CURRENT_GOVERNANCE_FILES[0]?.path || null;
  }
  renderGovernanceFilesWorkspace();
}

async function openFile(path) {
  CURRENT_GOVERNANCE_FILE_PATH = path;
  const contentNode = document.getElementById('fileContent');
  if (contentNode) {
    contentNode.textContent = 'Loading file...';
  }
  try {
    const data = await fetchJSON(`/api/file?company=${CURRENT_COMPANY}&path=${encodeURIComponent(path)}`);
    CURRENT_GOVERNANCE_FILE_DETAILS[path] = data;
    if (CURRENT_VIEW === 'files') {
      renderGovernanceFilesWorkspace();
    }
  } catch (error) {
    CURRENT_GOVERNANCE_FILE_DETAILS[path] = {
      path,
      content: `Could not load file.\n${error.message || error}`,
      related_files: [],
      headings: [],
      attention_flags: [{
        level: 'high',
        label: 'Preview failed',
        reason: error.message || String(error),
      }],
      category_label: selectedGovernanceFileRow()?.category_label || 'Unknown',
      modified: '',
    };
    if (CURRENT_VIEW === 'files') {
      renderGovernanceFilesWorkspace();
    }
  }
}

function reRenderGovFilesPreservingFullView() {
  const wasFull = document.body.classList.contains('gw-fullscreen-open');
  const oldBackdrop = document.getElementById('gwFsBackdrop');
  if (oldBackdrop) oldBackdrop.remove();
  document.body.classList.remove('gw-fullscreen-open');
  renderGovernanceFilesWorkspace();
  if (wasFull) {
    const btn = document.querySelector('.gov-file-pane.gw-expandable [data-fs-toggle]');
    if (btn) toggleSectionFullscreen(btn);
  }
  const thread = document.getElementById('governanceFileChatThread');
  if (thread) thread.scrollTop = thread.scrollHeight;
}

async function sendGovernanceFileChat() {
  const row = selectedGovernanceFileRow();
  if (!row) return;
  const composer = document.getElementById('governanceFileChatComposer');
  const state = loadGovernanceFileChatState(row.path);
  const engine = document.getElementById('governanceFileChatEngine')?.value || state.engine || 'Claude Code';
  const prompt = composer?.value?.trim();
  if (!prompt) return;
  appendGovernanceFileChatMessage('user', engine, prompt);
  state.engine = engine;
  persistGovernanceFileChatState(row.path, state);
  if (composer) composer.value = '';
  reRenderGovFilesPreservingFullView();
  const status = document.getElementById('governanceFileChatStatus');
  if (status) status.textContent = `Sending to ${engine}...`;
  try {
    const response = await fetch('/api/files/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: CURRENT_COMPANY,
        path: row.path,
        engine,
        prompt,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.reason || `HTTP ${response.status}`);
    }
    appendGovernanceFileChatMessage('assistant', engine, payload.response_text || '(No response text returned)');
    reRenderGovFilesPreservingFullView();
    const okStatus = document.getElementById('governanceFileChatStatus');
    if (okStatus) okStatus.textContent = `${engine} replied.`;
  } catch (error) {
    appendGovernanceFileChatMessage('assistant', engine, `Request failed: ${error.message || error}`);
    reRenderGovFilesPreservingFullView();
    const failStatus = document.getElementById('governanceFileChatStatus');
    if (failStatus) failStatus.textContent = `Request failed for ${engine}.`;
  }
}

async function renderGit() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/git/status?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  let html = '<h2>Git Status</h2>';
  ['governance', 'legal_vault'].forEach((label) => {
    const repo = data[label];
    if (!repo || !repo.exists) {
      html += `<div class="mb-3"><h3>${escapeHtml(label)}</h3><div class="alert alert-secondary">Not a git repo.</div></div>`;
      return;
    }
    html += `
      <div class="mb-3">
        <h3>${escapeHtml(label)} <span class="small text-muted">${escapeHtml(repo.path || '')}</span></h3>
        <div>Status: ${repo.dirty ? '<span class="badge bg-warning text-dark">DIRTY</span>' : '<span class="badge bg-success">clean</span>'}</div>
        <div class="small mt-1">Last commit: <code>${escapeHtml(repo.last_commit || '')}</code></div>
        ${repo.changes && repo.changes.length ? `<details class="mt-1"><summary class="small">Changes (${repo.changes.length})</summary><pre class="small">${escapeHtml(repo.changes.join('\n'))}</pre></details>` : ''}
      </div>
    `;
  });
  document.getElementById('mainView').innerHTML = html;
}

async function renderExchanges() {
  const _r = VIEW_REQUEST;
  const exchanges = await fetchJSON(`/api/exchanges?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  const grouped = {
    pending: exchanges.filter((item) => (item.agreement_status || 'Needs review') === 'Needs review' || item.status === 'running'),
    reviewed: exchanges.filter((item) => (item.agreement_status || 'Needs review') !== 'Needs review' && item.status !== 'running'),
  };
  document.getElementById('mainView').innerHTML = `
    <h2>AI Exchange</h2>
    <p class="small text-muted">
      This lane captures turn-based Claude/OpenAI review loops. Engines do not free-chat here. One engine responds, the other challenges, and a human chooses the next action.
    </p>
    <div class="alert alert-warning small">
      AI exchange results are research artifacts. They do not auto-create findings, questions, decisions, commits, or constitution changes.
    </div>
    <h3>Needs review (${grouped.pending.length})</h3>
    ${grouped.pending.length ? grouped.pending.map((exchange) => `
      <div class="exchange-card">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div class="fw-semibold">Exchange #${exchange.id} - ${escapeHtml(exchange.topic || '(no topic)')}</div>
            <div class="small text-muted">Intake #${exchange.intake_id} | ${escapeHtml(exchange.source_engine)} -> ${escapeHtml(exchange.target_engine)}</div>
          </div>
          ${renderExchangeStatusChip(exchange.status)}
        </div>
        <div class="row mt-2">
          <div class="col-md-4">
            <label class="form-label small mb-1">Agreement status</label>
            <select class="form-select form-select-sm" onchange="updateExchange(${exchange.id}, this.value, null)">
              ${['Needs review', 'Agrees', 'Partially agrees', 'Disagrees', 'Human review required'].map((value) => `<option ${(exchange.agreement_status || 'Needs review') === value ? 'selected' : ''}>${value}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label small mb-1">Next action</label>
            <select class="form-select form-select-sm" onchange="updateExchange(${exchange.id}, null, this.value)">
              ${['Hold', 'Convert to Finding', 'Convert to Q', 'Draft Decision', 'Return to Intake Review'].map((value) => `<option ${(exchange.next_action || 'Hold') === value ? 'selected' : ''}>${value}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-4 d-flex align-items-end gap-2 flex-wrap">
            ${exchange.target_output_path ? renderArtifactAction(exchange.target_output_path, 'Open target output') : ''}
            ${exchange.source_output_path ? renderArtifactAction(exchange.source_output_path, 'Open source output') : ''}
          </div>
        </div>
        ${(exchange.target_output || exchange.error_text) ? `<details class="mt-2"><summary class="small text-muted">Show exchange result</summary><pre class="small mt-2">${escapeHtml((exchange.target_output || exchange.error_text || '').slice(0, 5000))}</pre></details>` : ''}
      </div>
    `).join('') : '<div class="text-muted">No exchanges need review right now.</div>'}
    <h3 class="mt-4">Reviewed (${grouped.reviewed.length})</h3>
    ${grouped.reviewed.length ? grouped.reviewed.map(renderExchangeCard).join('') : '<div class="text-muted">No reviewed exchanges yet.</div>'}
  `;
}

async function renderHistory() {
  const _r = VIEW_REQUEST;
  const data = await fetchJSON(`/api/version_history?company=${CURRENT_COMPANY}`);
  if (viewRequestIsStale(_r)) return;
  document.getElementById('mainView').innerHTML = `
    <h2>Version History</h2>
    <p class="small text-muted">
      Use this screen to review recent governance and legal-vault history before deciding whether a draft should be restored, compared, or superseded.
    </p>
    ${renderHistorySection('Governance repo history', data.governance)}
    ${renderHistorySection('Legal vault history', data.legal_vault)}
  `;
}

function renderHistorySection(title, commits) {
  if (!commits || !commits.length) {
    return `<h3>${escapeHtml(title)}</h3><div class="alert alert-secondary">No history available.</div>`;
  }
  if (commits[0].error) {
    return `<h3>${escapeHtml(title)}</h3><div class="alert alert-danger">${escapeHtml(commits[0].error)}</div>`;
  }
  return `
    <h3>${escapeHtml(title)}</h3>
    ${commits.map((commit) => `
      <div class="history-card">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <div class="fw-semibold"><code>${escapeHtml(commit.sha)}</code> ${escapeHtml(commit.subject)}</div>
            <div class="small text-muted">${escapeHtml(commit.date)} | ${escapeHtml(commit.author)}</div>
            <div class="small text-muted">${escapeHtml(commit.path)}</div>
          </div>
          <span class="status-chip status-info">Revert available</span>
        </div>
        <div class="small mt-2"><strong>Changed files:</strong></div>
        <ul class="small mb-0">
          ${commit.files.map((file) => `<li>${escapeHtml(file)}</li>`).join('') || '<li>No file list available</li>'}
        </ul>
      </div>
    `).join('')}
  `;
}

let mediaRecorder;
let chunks = [];
let recStartTime = null;
let timerInterval = null;

function renderRecorder() {
  const questionPrompt = CURRENT_QUESTION_CONTEXT ? `
    <div class="alert alert-info">
      <div><strong>Question:</strong> ${escapeHtml(CURRENT_QUESTION_CONTEXT.qid)} - ${escapeHtml(CURRENT_QUESTION_CONTEXT.title)}</div>
      <div class="mt-1"><strong>Ask this out loud:</strong> ${escapeHtml(CURRENT_QUESTION_CONTEXT.shortQuestion)}</div>
      <div class="mt-1"><strong>Assigned to:</strong> ${escapeHtml(CURRENT_QUESTION_CONTEXT.assignee)}</div>
      <div class="small mt-2">Treadmill-friendly prompt: say the question number, answer in 1-3 sentences, and correct yourself out loud if needed.</div>
    </div>
  ` : '';
  document.getElementById('mainView').innerHTML = `
    <h2>Voice Memo</h2>
    <p>Records to <code>_GOVERNANCE/_VOICE_MEMOS/</code>, then transcribes it and runs the same AI flow as meetings - producing a summary and priority questions. If the label matches a team member, the questions are routed to their workspace. <span class="text-muted">(Transcription needs an OpenAI key; the summary uses Claude if available.)</span></p>
    ${questionPrompt}
    <div class="mb-3">
      <label class="form-label">Label (for example <code>Q-0001</code> or <code>memo</code>)</label>
      <input type="text" class="form-control" id="recLabel" value="memo">
    </div>
    <div class="recorder">
      <button id="recBtn" class="rec-button" onclick="toggleRecording()">REC</button>
      <div class="rec-time" id="recTime">00:00</div>
      <div id="recStatus" class="text-muted small mt-2">Click REC to start.</div>
      <audio id="playback" controls class="d-none mt-3"></audio>
      <div id="saveActions" class="mt-3 d-none">
        <button class="btn btn-success" onclick="saveRecording()">Save</button>
        <button class="btn btn-secondary" onclick="discardRecording()">Discard</button>
      </div>
    </div>
  `;
}

function pickAudioMime() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

async function toggleRecording() {
  const button = document.getElementById('recBtn');
  const statusEl = document.getElementById('recStatus');
  const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };
  const resetButton = () => { if (button) { button.classList.remove('recording'); button.textContent = 'REC'; } };

  // Already recording -> stop.
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    return;
  }

  // Feature / context checks with clear guidance.
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus('Microphone not available here. Open the app at http://127.0.0.1:5050 (or https) in Chrome/Edge and try again.');
    return;
  }
  if (typeof MediaRecorder === 'undefined') {
    setStatus('This browser cannot record audio. Try Chrome or Edge.');
    return;
  }

  try {
    setStatus('Requesting microphone…');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = pickAudioMime();
    mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    chunks = [];
    window.lastBlob = null;

    mediaRecorder.ondataavailable = (event) => { if (event.data && event.data.size) chunks.push(event.data); };
    mediaRecorder.onstop = () => {
      clearInterval(timerInterval);
      stream.getTracks().forEach((track) => track.stop());
      resetButton();
      const blob = new Blob(chunks, { type: (mediaRecorder && mediaRecorder.mimeType) || 'audio/webm' });
      if (!blob.size) { setStatus('Nothing was captured. Check your mic and try again.'); return; }
      window.lastBlob = blob;
      const audio = document.getElementById('playback');
      if (audio) { audio.src = URL.createObjectURL(blob); audio.classList.remove('d-none'); }
      const saveActions = document.getElementById('saveActions');
      if (saveActions) saveActions.classList.remove('d-none');
      setStatus('Stopped. Review the clip, then Save or Discard.');
    };
    mediaRecorder.onerror = (event) => {
      clearInterval(timerInterval);
      resetButton();
      setStatus(`Recording error: ${(event.error && event.error.name) || 'unknown'}`);
    };

    mediaRecorder.start();
    if (button) { button.classList.add('recording'); button.textContent = 'STOP'; }
    recStartTime = Date.now();
    const timeEl = document.getElementById('recTime');
    if (timeEl) timeEl.textContent = '00:00';
    timerInterval = setInterval(() => {
      const seconds = Math.floor((Date.now() - recStartTime) / 1000);
      const el = document.getElementById('recTime');
      if (el) el.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }, 250);
    setStatus('Recording… click STOP when you are done.');
  } catch (error) {
    resetButton();
    const name = error && error.name;
    let msg = (error && (error.message || error.name)) || String(error);
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      msg = 'Microphone access was blocked. Click the lock/site icon in the address bar, allow the microphone for this site, then click REC again.';
    } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
      msg = 'No microphone was found. Connect/enable a mic and try again.';
    } else if (name === 'NotReadableError' || name === 'AbortError') {
      msg = 'The microphone is busy in another app. Close that app and try again.';
    }
    setStatus(msg);
  }
}

async function saveRecording() {
  if (!window.lastBlob) return;
  const label = (document.getElementById('recLabel').value || 'memo').trim();
  const form = new FormData();
  form.append('company', CURRENT_COMPANY);
  form.append('label', label);
  form.append('audio', window.lastBlob, 'recording.webm');
  const response = await fetch('/api/audio', { method: 'POST', body: form });
  if (response.ok) {
    const payload = await response.json();
    const statusEl = document.getElementById('recStatus');
    document.getElementById('saveActions').classList.add('d-none');
    let html = `Saved: <code>${escapeHtml(payload.saved)}</code>`;
    if (payload.transcript) {
      const qs = payload.questions || [];
      const routed = payload.routed_member
        ? `<div class="small text-muted mb-2">${qs.length} question(s) generated, routed to <strong>${escapeHtml(payload.routed_member)}</strong>.</div>`
        : (qs.length ? `<div class="small text-muted mb-2">${qs.length} question(s) generated (not routed - label didn't match a team member).</div>` : '');
      const qHtml = qs.map((q) => `
        <li class="meeting-question">
          <span class="meeting-q-priority ${escapeHtml((q.priority || 'MEDIUM').toLowerCase())}">${escapeHtml(q.priority || 'MEDIUM')}</span>
          <span class="meeting-q-text">${escapeHtml(q.question || '')}</span>
        </li>`).join('');
      html += `
        <div class="meeting-summary-block mt-3">
          <div class="meeting-summary-head"><span class="meeting-summary-title">Transcript &amp; AI summary</span>
            ${payload.engine ? `<span class="meeting-summary-engine">${escapeHtml(payload.engine)}</span>` : ''}</div>
          ${payload.summary ? `<div class="meeting-summary-text">${escapeHtml(payload.summary)}</div>` : ''}
          ${qs.length ? `<div class="meeting-summary-subhead">Priority questions</div>${routed}<ul class="meeting-question-list">${qHtml}</ul>` : ''}
          <details class="mt-2"><summary class="small text-muted">Show full transcript</summary><pre class="small mt-2" style="white-space:pre-wrap">${escapeHtml(payload.transcript)}</pre></details>
        </div>`;
    } else if (payload.transcript_error) {
      html += `<div class="small text-muted mt-2">Audio saved, but no transcript: ${escapeHtml(payload.transcript_error)}</div>`;
    }
    statusEl.innerHTML = html;
  } else {
    document.getElementById('recStatus').textContent = `Save failed: ${response.status}`;
  }
}

function discardRecording() {
  window.lastBlob = null;
  document.getElementById('playback').classList.add('d-none');
  document.getElementById('saveActions').classList.add('d-none');
  document.getElementById('recStatus').textContent = 'Discarded.';
}

function recordForLabel(label) {
  CURRENT_QUESTION_CONTEXT = null;
  CURRENT_VIEW = 'record';
  document.querySelectorAll('#navMenu button').forEach((b) => b.classList.toggle('active', b.dataset.view === 'record'));
  showView('record').then(() => {
    document.getElementById('recLabel').value = label;
  });
}

function recordQuestionAnswer(qid, title, shortQuestion, assignee) {
  CURRENT_QUESTION_CONTEXT = { qid, title, shortQuestion, assignee };
  CURRENT_VIEW = 'record';
  document.querySelectorAll('#navMenu button').forEach((b) => b.classList.toggle('active', b.dataset.view === 'record'));
  showView('record').then(() => {
    document.getElementById('recLabel').value = qid;
  });
}

updateStatus();
activateCompany('MView');
refreshIntegrationSidebar();
