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

/**
 * Read GitHub settings from the environment. Returns a fully-populated config or
 * throws GitHubConfigError listing the missing variables. GITHUB_BRANCH defaults
 * to "Development".
 */
export function getGitHubConfig(): GitHubConfig {
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim();
  const owner = (process.env.GITHUB_OWNER || '').trim();
  const repo = (process.env.GITHUB_REPO || '').trim();
  const branch = (process.env.GITHUB_BRANCH || 'Development').trim() || 'Development';

  const missing: string[] = [];
  if (!token) missing.push('GITHUB_TOKEN');
  if (!owner) missing.push('GITHUB_OWNER');
  if (!repo) missing.push('GITHUB_REPO');
  if (missing.length) {
    throw new GitHubConfigError(
      `GitHub is not configured. Set the following environment variable(s): ${missing.join(', ')}.`,
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

// Encode each path segment but keep the slashes that separate folders.
function contentsUrl(cfg: GitHubConfig, repoPath: string): string {
  const encoded = repoPath
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${encoded}`;
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
