import fs from 'fs';
import path from 'path';

// Repo root (this Next.js app lives at the repo root).
export const REPO_ROOT = process.cwd();

// The original Flask app lived at Governance_UI/governance-ui; its BASE_DIR is
// used to resolve the bundled governance files two levels up.
export const APP_BASE_DIR = path.join(REPO_ROOT, 'Governance_UI', 'governance-ui');

// Where runtime state (DB, settings, secret) is written. Locally this is the
// repo root; on a read-only serverless host (Vercel) fall back to /tmp. Mirrors
// the DATA_DIR logic from the Flask app.
export function getDataDir(): string {
  let dir: string;
  if (process.env.WORKBENCH_DATA_DIR) {
    dir = process.env.WORKBENCH_DATA_DIR;
  } else if (process.env.VERCEL || process.env.WORKBENCH_SERVERLESS) {
    dir = '/tmp/governance-workbench';
  } else {
    dir = REPO_ROOT;
  }
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    // ignore
  }
  return dir;
}

export const DATA_DIR = getDataDir();
export const DB_PATH = path.join(DATA_DIR, 'governance.db');
export const SETTINGS_PATH = path.join(DATA_DIR, 'local_settings.json');
export const SECRET_FILE = path.join(DATA_DIR, '.workbench_secret');

// Windows-only executables from the original app; unused off Windows but kept
// for parity with integration-status checks.
export const GH_EXE = 'C:\\Program Files\\GitHub CLI\\gh.exe';
export const GIT_EXE = 'C:\\Program Files\\Git\\cmd\\git.exe';

export function loadLocalSettings(): Record<string, unknown> {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) return {};
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveLocalSettings(data: Record<string, unknown>): void {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
