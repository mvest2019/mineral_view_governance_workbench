// Faithful ports of templates/index.html and templates/auth.html. The markup is
// byte-for-byte the same as the Jinja templates (with the Jinja conditionals
// resolved here), so the frontend renders identically and app.js runs unchanged.

function esc(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderIndexHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Governance Workbench v3</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="/static/styles.css?v=20260618e">
</head>
<body>

<nav class="navbar navbar-dark bg-dark px-3 py-2 d-flex">
  <div class="d-flex align-items-center">
    <div class="brand-lockup me-2">
      <img id="navBrandMark" class="brand-mark d-none" alt="Brand mark">
    </div>
    <div class="d-flex flex-column">
      <span class="navbar-brand mb-0 h5">Governance Workbench</span>
      <span class="brand-subtitle" id="brandSubtitle">Workflow-first governance intake and approval</span>
    </div>
    <div class="btn-group ms-3">
      <input type="radio" class="btn-check" name="company" id="cMView" value="MView" autocomplete="off">
      <label class="btn btn-outline-light btn-sm" for="cMView">Mineral View</label>
    </div>
  </div>
  <div class="d-flex align-items-center gap-2">
    <button class="btn btn-warning btn-sm fw-semibold" id="newIntakeBtn" type="button">+ New Intake</button>
    <div class="text-light small text-end" id="statusBar"></div>
    <a class="btn btn-outline-light btn-sm" href="/logout">Log out</a>
  </div>
</nav>

<div class="alert alert-warning rounded-0 mb-0 px-3 py-1 small">
  Approval in this UI does not auto-commit. No governance change enters the constitution without Ryan approval.
  Employee uploads stay uncommitted until employee questions are resolved.
</div>

<div class="container-fluid mt-3">
  <div class="row">
    <div class="col-md-3">
      <div class="list-group" id="navMenu"></div>
      <div class="mt-3 small text-muted">
        <strong>Processing engine roles</strong>
        <ul class="ps-3 small mb-0">
          <li><strong>Claude</strong> - repo scans, findings generation, categorization</li>
          <li><strong>OpenAI</strong> - transcript intake, question structuring, decision drafting</li>
          <li><strong>AI Exchange</strong> - turn-based Claude/OpenAI challenge loop with human approval gates</li>
          <li><strong>GitHub</strong> - repo inventory, commit status, history</li>
        </ul>
      </div>
      <div class="mt-3">
        <div class="small text-muted mb-2"><strong>Integration status</strong></div>
        <div id="integrationSidebar" class="integration-stack small text-muted">
          Pick a company to load integration status.
        </div>
      </div>
    </div>

    <div class="col-md-9">
      <div id="mainView">
        <div class="alert alert-info">Pick a company at the top to start.</div>
      </div>
    </div>
  </div>
</div>

  <script src="/static/app.js?v=20260618e"></script>
</body>
</html>`;
}

export interface AuthViewOptions {
  mode: 'login' | 'signup';
  error?: string | null;
  username?: string | null;
  display_name?: string | null;
  has_users?: boolean;
}

export function renderAuthHtml(opts: AuthViewOptions): string {
  const { mode } = opts;
  const isSignup = mode === 'signup';
  const title = isSignup ? 'Create account' : 'Sign in';
  const errorBlock = opts.error ? `<div class="auth-error">${esc(opts.error)}</div>` : '';

  const body = isSignup
    ? `        <div class="auth-title">Create your account</div>
        <p class="auth-sub">Set up access to the Governance Workbench.</p>
        ${errorBlock}
        <form method="POST" action="/signup" autocomplete="off">
          <div class="auth-field">
            <label for="display_name">Name <span style="color:var(--muted);font-weight:400">(optional)</span></label>
            <input type="text" id="display_name" name="display_name" value="${esc(opts.display_name)}" placeholder="e.g. Nikhil Salunke">
          </div>
          <div class="auth-field">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" value="${esc(opts.username)}" placeholder="Choose a username" required minlength="3">
          </div>
          <div class="auth-field">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="At least 6 characters" required minlength="6">
          </div>
          <div class="auth-field">
            <label for="confirm">Confirm password</label>
            <input type="password" id="confirm" name="confirm" placeholder="Re-enter password" required minlength="6">
          </div>
          <button type="submit" class="auth-btn">Create account</button>
        </form>
        <div class="auth-switch">Already have an account? <a href="/login">Sign in</a></div>`
    : `        <div class="auth-title">Sign in</div>
        <p class="auth-sub">Governance Workbench access.</p>
        ${errorBlock}
        <form method="POST" action="/login" autocomplete="off">
          <div class="auth-field">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" value="${esc(opts.username)}" placeholder="Your username" required autofocus>
          </div>
          <div class="auth-field">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Your password" required>
          </div>
          <button type="submit" class="auth-btn">Sign in</button>
        </form>
        <div class="auth-switch">
          ${
            opts.has_users === false
              ? `No accounts yet. <a href="/signup">Create the first account</a>`
              : `Don't have an account? <a href="/signup">Create one</a>`
          }
        </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Governance Workbench</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #0d2438;
      --navy-2: #12304a;
      --teal: #1d9e75;
      --teal-dark: #0f6e56;
      --text: #1b2a39;
      --muted: #6b7c8c;
      --border: #d9e1e8;
      --danger: #b83232;
      --danger-bg: #fbeaea;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Lexend', system-ui, -apple-system, sans-serif;
      background: linear-gradient(160deg, var(--navy) 0%, var(--navy-2) 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: var(--text);
    }
    .auth-wrap { width: 100%; max-width: 400px; }
    .auth-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 36px 32px 30px;
      box-shadow: 0 18px 50px rgba(0,0,0,0.28);
    }
    .auth-brand { text-align: center; margin-bottom: 6px; }
    .auth-brand img { height: 38px; width: auto; }
    .auth-title { font-size: 22px; font-weight: 600; text-align: center; margin: 14px 0 2px; }
    .auth-sub { font-size: 13.5px; color: var(--muted); text-align: center; margin: 0 0 22px; }
    .auth-field { margin-bottom: 16px; }
    .auth-field label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--text); }
    .auth-field input {
      width: 100%;
      padding: 11px 13px;
      font-size: 14.5px;
      font-family: inherit;
      border: 1px solid var(--border);
      border-radius: 9px;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .auth-field input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(29,158,117,0.15); }
    .auth-field .hint { font-size: 11.5px; color: var(--muted); margin-top: 5px; }
    .auth-btn {
      width: 100%;
      padding: 12px;
      font-size: 15px;
      font-weight: 600;
      font-family: inherit;
      color: #fff;
      background: var(--teal);
      border: none;
      border-radius: 9px;
      cursor: pointer;
      transition: background .15s;
      margin-top: 4px;
    }
    .auth-btn:hover { background: var(--teal-dark); }
    .auth-error {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid #f0caca;
      border-radius: 9px;
      padding: 10px 12px;
      font-size: 13px;
      margin-bottom: 18px;
    }
    .auth-switch { text-align: center; font-size: 13.5px; color: var(--muted); margin-top: 20px; }
    .auth-switch a { color: var(--teal-dark); font-weight: 500; text-decoration: none; }
    .auth-switch a:hover { text-decoration: underline; }
    .auth-foot { text-align: center; font-size: 11.5px; color: rgba(255,255,255,0.5); margin-top: 18px; }
  </style>
</head>
<body>
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-brand">
        <img src="/static/brand/mview-logo.png" alt="Mineral View" onerror="this.style.display='none'">
      </div>

${body}
    </div>
    <div class="auth-foot">Mineral View - Governance Workbench</div>
  </div>
</body>
</html>`;
}

export function htmlResponse(html: string, status = 200): Response {
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}
