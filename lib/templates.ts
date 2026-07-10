// Faithful port of templates/index.html. The markup is byte-for-byte the same as
// the original Jinja template (minus the removed log-out control), so the
// frontend renders identically and app.js runs unchanged.

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
  <link rel="stylesheet" href="/static/styles.css?v=20260710c">
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
    <div class="text-light small text-end" id="statusBar"></div>
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

  <script src="/static/app.js?v=20260710c"></script>
</body>
</html>`;
}

export function htmlResponse(html: string, status = 200): Response {
  return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}
