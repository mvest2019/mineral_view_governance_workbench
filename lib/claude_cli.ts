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
