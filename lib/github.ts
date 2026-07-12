// Minimal GitHub REST (Contents API) client for committing files straight to a
// branch. Used by the Task Tracker to persist task notes in the repository so
// every team member sees them after a save. Credentials come only from env vars
// (never hardcoded). A single PUT to /contents both commits and pushes, and it
// creates any missing intermediate folders (e.g. Governance_Files/task_tracker/).

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export class GitHubConfigError extends Error {}

// Non-secret defaults for this repository. Only the token is a credential and
// must be supplied via the environment; owner/repo/branch may be overridden too.
const DEFAULT_OWNER = 'mvest2019';
const DEFAULT_REPO = 'mineral_view_governance_workbench';
const DEFAULT_BRANCH = 'Development';

/**
 * Read GitHub settings from the environment. Only GITHUB_TOKEN is required;
 * owner, repo, and branch fall back to this repository's values but can be
 * overridden with GITHUB_OWNER / GITHUB_REPO / GITHUB_BRANCH. Throws
 * GitHubConfigError when the token is missing.
 */
export function getGitHubConfig(): GitHubConfig {
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
  const owner = (process.env.GITHUB_OWNER || '').trim() || DEFAULT_OWNER;
  const repo = (process.env.GITHUB_REPO || '').trim() || DEFAULT_REPO;
  const branch = (process.env.GITHUB_BRANCH || '').trim() || DEFAULT_BRANCH;

  if (!token) {
    throw new GitHubConfigError(
      'GitHub is not configured. Set the GITHUB_TOKEN environment variable '
        + '(a Personal Access Token with write access to the repository contents).',
    );
  }
  return { token, owner, repo, branch };
}

function ghHeaders(cfg: GitHubConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'governance-workbench',
  };
}

// API base — defaults to public GitHub; override with GITHUB_API_URL for GitHub
// Enterprise (e.g. https://ghe.example.com/api/v3).
function apiBase(): string {
  return (process.env.GITHUB_API_URL || 'https://api.github.com').trim().replace(/\/+$/, '');
}

// Encode each path segment but keep the slashes that separate folders.
function contentsUrl(cfg: GitHubConfig, repoPath: string): string {
  const encoded = repoPath
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  return `${apiBase()}/repos/${cfg.owner}/${cfg.repo}/contents/${encoded}`;
}

export interface PutFileResult {
  ok: boolean;
  status: number;
  data: any;
  error?: string;
}

/**
 * Create a file in the repo on cfg.branch (commit + push in one call).
 * Does not pass a `sha`, so GitHub returns 422 if the path already exists —
 * the caller uses that to keep filenames unique. Never throws on HTTP errors;
 * returns a structured result the caller can branch on.
 */
export async function createFileOnGitHub(
  cfg: GitHubConfig,
  repoPath: string,
  content: string,
  commitMessage: string,
): Promise<PutFileResult> {
  const body = {
    message: commitMessage,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch: cfg.branch,
  };
  const res = await fetch(contentsUrl(cfg, repoPath), {
    method: 'PUT',
    headers: ghHeaders(cfg),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    return { ok: true, status: res.status, data };
  }
  return {
    ok: false,
    status: res.status,
    data,
    error: (data && (data.message as string)) || `GitHub API error (HTTP ${res.status})`,
  };
}

// Read a file from the repo (on cfg.branch). Returns its decoded content and
// blob sha, or null when the file does not exist / is unreadable. Best-effort:
// never throws on HTTP errors so callers can degrade gracefully.
export async function getFileFromGitHub(
  cfg: GitHubConfig,
  repoPath: string,
): Promise<{ content: string; sha: string } | null> {
  const url = `${contentsUrl(cfg, repoPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: ghHeaders(cfg) });
  } catch {
    return null;
  }
  if (!res.ok) return null; // 404 (missing) or any error -> treat as absent
  const data = await res.json().catch(() => null);
  if (!data || typeof data.content !== 'string') return null;
  const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8');
  return { content, sha: String(data.sha) };
}

// Create or update a file on cfg.branch (commit + push in one call). Pass the
// existing blob `sha` to update; omit it to create. Returns a structured result
// (422/409 on sha conflict) rather than throwing.
export async function upsertFileOnGitHub(
  cfg: GitHubConfig,
  repoPath: string,
  content: string,
  commitMessage: string,
  sha?: string,
): Promise<PutFileResult> {
  const body: Record<string, unknown> = {
    message: commitMessage,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(contentsUrl(cfg, repoPath), {
    method: 'PUT',
    headers: ghHeaders(cfg),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true, status: res.status, data };
  return {
    ok: false,
    status: res.status,
    data,
    error: (data && (data.message as string)) || `GitHub API error (HTTP ${res.status})`,
  };
}

// Fetch one page of a repos listing endpoint. Returns null repos on any
// error/network failure so the caller can decide whether to continue.
async function fetchRepoPage(
  cfg: GitHubConfig,
  endpointPath: string,
  page: number,
): Promise<{ status: number; repos: any[] | null }> {
  const sep = endpointPath.includes('?') ? '&' : '?';
  const url = `${apiBase()}${endpointPath}${sep}per_page=100&page=${page}`;
  try {
    const res = await fetch(url, { headers: ghHeaders(cfg) });
    if (!res.ok) return { status: res.status, repos: null };
    const data = await res.json().catch(() => []);
    return { status: res.status, repos: Array.isArray(data) ? data : [] };
  } catch {
    return { status: 0, repos: null };
  }
}

/**
 * List every repository name the configured token can see under cfg.owner.
 * Merges the org endpoint (`/orgs/{owner}/repos`, all types) with the
 * authenticated user's repositories filtered to that owner
 * (`/user/repos?affiliation=owner,collaborator,organization_member`) so the
 * fullest possible list is returned regardless of token type. Follows
 * pagination; best-effort and never throws.
 */
export async function listOrgRepos(cfg: GitHubConfig): Promise<string[]> {
  const owner = cfg.owner.toLowerCase();
  const names = new Set<string>();

  // 1) Organization repositories (public + private the token can access).
  for (let page = 1; page <= 50; page += 1) {
    const { repos } = await fetchRepoPage(cfg, `/orgs/${encodeURIComponent(cfg.owner)}/repos`, page);
    if (repos === null) break; // not an org / no access — the user endpoint below still runs
    for (const repo of repos) {
      if (repo && repo.name) names.add(String(repo.name));
    }
    if (repos.length < 100) break;
  }

  // 2) The authenticated user's repositories that belong to this owner. Catches
  //    repos visible via membership/collaboration that the org endpoint omits.
  for (let page = 1; page <= 50; page += 1) {
    const { repos } = await fetchRepoPage(cfg, '/user/repos?affiliation=owner,collaborator,organization_member', page);
    if (repos === null) break;
    for (const repo of repos) {
      if (repo && repo.name && String(repo.owner?.login || '').toLowerCase() === owner) {
        names.add(String(repo.name));
      }
    }
    if (repos.length < 100) break;
  }

  return [...names];
}

// ---------------------------------------------------------------------------
// Shared helpers reused by the Task Tracker and Priority Questions features:
// filename slugging, local timestamps, and unique-file commits.
// ---------------------------------------------------------------------------

export class GitHubCommitError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// Lowercase, spaces/hyphens -> underscores, drop special characters. Used for
// employee names in file/folder names (e.g. "Pooja Wable" -> "pooja_wable").
export function slugifyName(name: string): string {
  const slug = String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]+/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug || 'unknown';
}

export interface LocalStamp {
  datePart: string; // YYYY-MM-DD
  timePart: string; // HH-mm-ss (filename-safe)
  timeDisplay: string; // h:mm AM/PM
  createdAt: string; // YYYY-MM-DDTHH:mm:ss
}

// Local (server-time) timestamp pieces used for filenames and Markdown bodies.
export function localStamp(now: Date = new Date()): LocalStamp {
  const datePart = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const timePart = `${pad2(now.getHours())}-${pad2(now.getMinutes())}-${pad2(now.getSeconds())}`;
  let hour12 = now.getHours() % 12;
  if (hour12 === 0) hour12 = 12;
  const timeDisplay = `${hour12}:${pad2(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
  const createdAt = `${datePart}T${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  return { datePart, timePart, timeDisplay, createdAt };
}

export interface CommitUniqueResult {
  filename: string;
  repoPath: string;
  data: any;
}

/**
 * Commit `content` as a new Markdown file under `dirPath` in the repo, keeping
 * the filename unique. Tries `<baseName>.md`; on a 422 (path already exists)
 * retries with a numeric suffix. Throws GitHubCommitError on any other failure
 * or if a unique name can't be found. Reused by Task Tracker and Priority
 * Questions so the commit/retry logic lives in one place.
 */
export async function commitUniqueMarkdown(
  cfg: GitHubConfig,
  dirPath: string,
  baseName: string,
  content: string,
  messageFor: (filename: string) => string,
): Promise<CommitUniqueResult> {
  let lastError = '';
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const filename = attempt === 0 ? `${baseName}.md` : `${baseName}_${attempt + 1}.md`;
    const repoPath = `${dirPath}/${filename}`;
    const result = await createFileOnGitHub(cfg, repoPath, content, messageFor(filename));
    if (result.ok) {
      return { filename, repoPath, data: result.data };
    }
    lastError = result.error || `GitHub API error (HTTP ${result.status})`;
    console.error(`[github] commit failed (HTTP ${result.status}): ${lastError}`);
    if (result.status !== 422) {
      throw new GitHubCommitError(lastError, result.status);
    }
  }
  throw new GitHubCommitError(lastError || 'Could not find a unique filename', 409);
}
