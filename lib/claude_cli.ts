// Shared Claude CLI execution layer.
//
// Every route/helper that used to invoke the Claude CLI directly via
// child_process.spawnSync now goes through run_claude(). The command, flags,
// stdin handling, cwd, and timeout semantics are unchanged; the only thing
// this module changes is WHERE the CLI runs:
//
//   - When REMOTE_CLAUDE_URL (and REMOTE_CLAUDE_TOKEN) are set, the invocation
//     is forwarded over HTTPS to the remote execution bridge
//     (remote-claude-bridge/server.js) which runs the identical CLI command on
//     the machine where Claude Code is installed and authenticated.
//   - When they are not set, the CLI is spawned locally exactly as before, so
//     local/desktop deployments keep their existing behavior.
//
// The result object intentionally mirrors child_process.spawnSync's return
// shape ({ status, signal, stdout, stderr, error }) so call sites keep their
// existing error/timeout handling untouched.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

export interface ClaudeCliOptions {
  /** Text piped to the CLI's stdin (same as spawnSync's `input`). */
  input?: string;
  /** Working directory for the CLI process. */
  cwd?: string;
  /** Timeout in milliseconds (same semantics as spawnSync's `timeout`). */
  timeoutMs?: number;
  /** Local-only stdout/stderr buffer cap (spawnSync's `maxBuffer`). */
  maxBuffer?: number;
}

export interface ClaudeCliResult {
  status: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  error?: Error & { code?: string };
}

/** Extra time allowed for the HTTPS round-trip on top of the CLI timeout. */
const REMOTE_HTTP_GRACE_MS = 30_000;
const DEFAULT_TIMEOUT_MS = 600_000;

function remote_claude_url(): string {
  return String(process.env.REMOTE_CLAUDE_URL || '').trim().replace(/\/+$/, '');
}

function remote_claude_token(): string {
  return String(process.env.REMOTE_CLAUDE_TOKEN || '').trim();
}

/** True when Claude CLI execution is delegated to the remote bridge. */
export function remote_claude_configured(): boolean {
  return Boolean(remote_claude_url());
}

export interface RemoteClaudeHealth {
  /** REMOTE_CLAUDE_URL is set (execution is delegated to the bridge). */
  configured: boolean;
  /** REMOTE_CLAUDE_TOKEN is set. */
  token_present: boolean;
  /** The bridge answered (any HTTP status, including 401). */
  reachable: boolean;
  /** The bridge is up AND the Claude CLI resolved on the remote host. */
  ok: boolean;
  /** HTTP status from /health, or null when the request never completed. */
  status: number | null;
  /** Human-readable explanation suitable for the Integrations UI. */
  reason: string;
  /** Remote host OS string, e.g. "win32 10.0.26100" (when ok). */
  platform?: string;
  /** In-flight / queued CLI runs on the bridge (when ok). */
  active?: number;
  queued?: number;
}

/**
 * Actively probe the bridge's /health endpoint so the Integrations page can
 * report the true remote state (reachable / unauthorized / down) instead of a
 * passive local guess. Read-only; never spawns anything.
 */
export async function check_remote_claude_health(timeoutMs = 8000): Promise<RemoteClaudeHealth> {
  const url = remote_claude_url();
  const token = remote_claude_token();
  if (!url) {
    return {
      configured: false,
      token_present: Boolean(token),
      reachable: false,
      ok: false,
      status: null,
      reason: 'REMOTE_CLAUDE_URL is not set on this deployment, so Claude cannot run (Vercel has no local CLI). Set REMOTE_CLAUDE_URL and REMOTE_CLAUDE_TOKEN and redeploy.',
    };
  }

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${url}/health`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (exc: any) {
    const timedOut = exc && (exc.name === 'TimeoutError' || exc.name === 'AbortError');
    return {
      configured: true,
      token_present: Boolean(token),
      reachable: false,
      ok: false,
      status: null,
      reason: timedOut
        ? `Remote Claude bridge did not respond within ${Math.round(timeoutMs / 1000)}s at ${url} (tunnel down or server unreachable).`
        : `Remote Claude bridge unreachable at ${url}: ${exc?.message || exc}. Check that the bridge is running and the HTTPS tunnel/URL is correct.`,
    };
  }

  if (response.status === 401) {
    return {
      configured: true,
      token_present: Boolean(token),
      reachable: true,
      ok: false,
      status: 401,
      reason: token
        ? 'Remote Claude bridge rejected the token (401). REMOTE_CLAUDE_TOKEN does not match the bridge\'s CLAUDE_BRIDGE_TOKEN.'
        : 'Remote Claude bridge requires a token (401), but REMOTE_CLAUDE_TOKEN is not set on this deployment.',
    };
  }

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.ok !== true) {
    const detail = payload && payload.error_message ? String(payload.error_message) : `HTTP ${response.status}`;
    return {
      configured: true,
      token_present: Boolean(token),
      reachable: true,
      ok: false,
      status: response.status,
      reason: `Remote Claude bridge responded but is not healthy: ${detail}.`,
    };
  }

  return {
    configured: true,
    token_present: Boolean(token),
    reachable: true,
    ok: true,
    status: 200,
    reason: 'Remote Claude bridge is reachable and the Claude CLI is available on the Windows server.',
    platform: payload.platform ? String(payload.platform) : undefined,
    active: typeof payload.active === 'number' ? payload.active : undefined,
    queued: typeof payload.queued === 'number' ? payload.queued : undefined,
  };
}

/** shutil.which equivalent (same resolution the app used before). */
function which(cmd: string): string | null {
  if (!cmd) return null;
  if ((cmd.includes('/') || cmd.includes('\\')) && fs.existsSync(cmd)) return cmd;
  const pathEnv = process.env.PATH || '';
  const exts = process.platform === 'win32'
    ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';')
    : [''];
  for (const dir of pathEnv.split(path.delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const full = path.join(dir, cmd + ext);
      try {
        if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
      } catch {
        // ignore
      }
    }
  }
  return null;
}

/**
 * Availability gate used everywhere the app previously called
 * command_exists(CLAUDE_EXE || 'claude'). Remote configuration counts as
 * available; failures reaching the bridge surface as run errors, exactly like
 * CLI spawn errors did.
 */
export function claude_cli_available(): boolean {
  if (remote_claude_configured()) return true;
  return Boolean(which('claude'));
}

function makeError(message: string, code?: string): Error & { code?: string } {
  const err: Error & { code?: string } = new Error(message);
  if (code) err.code = code;
  return err;
}

function timeoutResult(): ClaudeCliResult {
  // Mirrors spawnSync on timeout: error.code === 'ETIMEDOUT', signal SIGTERM.
  return {
    status: null,
    signal: 'SIGTERM',
    stdout: '',
    stderr: '',
    error: makeError('spawnSync claude ETIMEDOUT', 'ETIMEDOUT'),
  };
}

async function run_claude_remote(args: string[], opts: ClaudeCliOptions): Promise<ClaudeCliResult> {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = remote_claude_token();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${remote_claude_url()}/run`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        args,
        input: opts.input ?? null,
        cwd: opts.cwd ?? null,
        timeout_ms: timeoutMs,
      }),
      signal: AbortSignal.timeout(timeoutMs + REMOTE_HTTP_GRACE_MS),
    });
  } catch (exc: any) {
    if (exc && (exc.name === 'TimeoutError' || exc.name === 'AbortError')) {
      return timeoutResult();
    }
    return {
      status: null,
      signal: null,
      stdout: '',
      stderr: '',
      error: makeError(`Remote Claude bridge unreachable: ${exc?.message || exc}`, exc?.code),
    };
  }

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok || !payload || typeof payload !== 'object') {
    const detail = payload && payload.error_message
      ? String(payload.error_message)
      : `HTTP ${response.status}`;
    return {
      status: null,
      signal: null,
      stdout: '',
      stderr: '',
      error: makeError(`Remote Claude bridge request failed: ${detail}`),
    };
  }
  if (payload.timed_out) {
    return timeoutResult();
  }
  const result: ClaudeCliResult = {
    status: payload.status === null || payload.status === undefined ? null : Number(payload.status),
    signal: payload.signal ? String(payload.signal) : null,
    stdout: String(payload.stdout ?? ''),
    stderr: String(payload.stderr ?? ''),
  };
  if (payload.error_message) {
    result.error = makeError(String(payload.error_message), payload.error_code ? String(payload.error_code) : undefined);
  }
  return result;
}

function run_claude_local(args: string[], opts: ClaudeCliOptions): ClaudeCliResult {
  const exe = which('claude') || 'claude';
  const result = spawnSync(exe, args, {
    input: opts.input,
    encoding: 'utf-8',
    timeout: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    cwd: opts.cwd,
    maxBuffer: opts.maxBuffer,
  });
  return {
    status: result.status,
    signal: result.signal,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error as (Error & { code?: string }) | undefined,
  };
}

/**
 * Execute the Claude CLI with the given args (e.g. ['-p', '--allowedTools',
 * 'Read']). Runs on the remote bridge when configured, otherwise locally.
 */
export async function run_claude(args: string[], opts: ClaudeCliOptions = {}): Promise<ClaudeCliResult> {
  if (remote_claude_configured()) {
    return run_claude_remote(args, opts);
  }
  return run_claude_local(args, opts);
}
