// TEMPORARY MongoDB connectivity diagnostics (no business logic).
//
// Probes the CONFIGURED MONGODB_URI from inside the running server and reports,
// without leaking the password:
//   • parsed host(s)/port/db/authSource/tls/directConnection/replicaSet/retryWrites
//   • raw TCP reachability to host:port (network layer — firewall / bindIp / route)
//   • driver connect + ping (as configured) with full topology + error
//   • driver connect + ping with directConnection=true (bypasses replica-set
//     discovery — reveals a replica set that advertises unreachable member hosts)
//   • a plain-English classification of the failure
//
// Remove once the connectivity issue is resolved.

import net from 'net';
import { MongoClient } from 'mongodb';
import { getMongoEnvConfig, isMongoConfigured } from '@/src/config/env';

const PROBE_TIMEOUT_MS = 6000;

export interface ParsedUri {
  scheme: string;
  srv: boolean;
  username: string | null;
  hasPassword: boolean;
  hosts: Array<{ host: string; port: number | null }>;
  database: string | null;
  params: Record<string, string>;
}

/** Parse a mongodb:// or mongodb+srv:// URI (single or multi-host). No secrets returned. */
export function parseMongoUri(uri: string): ParsedUri {
  const out: ParsedUri = { scheme: '', srv: false, username: null, hasPassword: false, hosts: [], database: null, params: {} };
  const m = uri.trim().match(/^(mongodb\+srv|mongodb):\/\//);
  if (!m) return out;
  out.scheme = m[1];
  out.srv = m[1] === 'mongodb+srv';
  let rest = uri.trim().slice(m[0].length);

  const qIdx = rest.indexOf('?');
  let query = '';
  if (qIdx >= 0) { query = rest.slice(qIdx + 1); rest = rest.slice(0, qIdx); }

  const atIdx = rest.lastIndexOf('@');
  if (atIdx >= 0) {
    const userinfo = rest.slice(0, atIdx);
    rest = rest.slice(atIdx + 1);
    const colon = userinfo.indexOf(':');
    if (colon >= 0) { out.username = safeDecode(userinfo.slice(0, colon)); out.hasPassword = userinfo.length > colon + 1; }
    else { out.username = safeDecode(userinfo); }
  }

  const slashIdx = rest.indexOf('/');
  let hostPart = rest;
  if (slashIdx >= 0) { hostPart = rest.slice(0, slashIdx); out.database = safeDecode(rest.slice(slashIdx + 1)) || null; }
  for (const h of hostPart.split(',')) {
    if (!h) continue;
    const c = h.lastIndexOf(':');
    if (c >= 0 && h.indexOf(']') < 0) out.hosts.push({ host: h.slice(0, c), port: Number(h.slice(c + 1)) || null });
    else out.hosts.push({ host: h, port: out.srv ? null : 27017 });
  }
  for (const kv of query.split('&')) {
    if (!kv) continue;
    const eq = kv.indexOf('=');
    if (eq >= 0) out.params[safeDecode(kv.slice(0, eq)).toLowerCase()] = safeDecode(kv.slice(eq + 1));
  }
  return out;
}

function safeDecode(s: string): string { try { return decodeURIComponent(s); } catch { return s; } }

/** Mask credentials in a URI for safe logging. */
export function maskUri(uri: string): string {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@/]+)@/i, (_all, scheme, userinfo: string) => {
    const colon = userinfo.indexOf(':');
    const user = colon >= 0 ? userinfo.slice(0, colon) : userinfo;
    return `${scheme}${user}:****@`;
  });
}

interface TcpResult { ok: boolean; ms: number; error: string | null }

function tcpProbe(host: string, port: number, timeoutMs = PROBE_TIMEOUT_MS): Promise<TcpResult> {
  return new Promise((resolve) => {
    const started = Date.now();
    let done = false;
    const finish = (ok: boolean, error: string | null) => {
      if (done) return; done = true;
      try { sock.destroy(); } catch { /* ignore */ }
      resolve({ ok, ms: Date.now() - started, error });
    };
    const sock = net.connect({ host, port });
    sock.setTimeout(timeoutMs);
    sock.on('connect', () => finish(true, null));
    sock.on('timeout', () => finish(false, `TCP connect timed out after ${timeoutMs} ms`));
    sock.on('error', (e: Error) => finish(false, e.message));
  });
}

function serializeError(err: unknown): Record<string, unknown> {
  const e = err as { name?: string; message?: string; code?: unknown; codeName?: string; stack?: string; reason?: unknown };
  const out: Record<string, unknown> = {
    name: e?.name ?? null,
    message: e?.message ?? String(err),
    code: e?.code ?? null,
    codeName: e?.codeName ?? null,
    stack: e?.stack ?? null,
  };
  // MongoServerSelectionError carries a TopologyDescription in `reason`.
  const reason = e?.reason as { type?: string; setName?: string; servers?: Map<string, unknown>; compatible?: boolean } | undefined;
  if (reason) {
    const servers: Array<Record<string, unknown>> = [];
    try {
      for (const [address, desc] of (reason.servers as Map<string, { type?: string; error?: { message?: string }; roundTripTime?: number }>) ?? []) {
        servers.push({ address, type: desc?.type, error: desc?.error?.message ?? null, roundTripTimeMs: desc?.roundTripTime ?? null });
      }
    } catch { /* ignore */ }
    out.topologyReason = { type: reason.type, setName: reason.setName ?? null, compatible: reason.compatible, servers };
  }
  return out;
}

interface DriverResult {
  ok: boolean;
  elapsedMs: number;
  pingMs: number | null;
  hello: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
}

async function driverProbe(uri: string, dbName: string, direct: boolean): Promise<DriverResult> {
  const started = Date.now();
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: PROBE_TIMEOUT_MS,
    connectTimeoutMS: PROBE_TIMEOUT_MS,
    ...(direct ? { directConnection: true } : {}),
    appName: 'gov-connectivity-probe',
  });
  try {
    await client.connect();
    const admin = client.db(dbName).admin();
    const pingStart = Date.now();
    await admin.command({ ping: 1 });
    const pingMs = Date.now() - pingStart;
    let hello: Record<string, unknown> | null = null;
    try {
      const h = await admin.command({ hello: 1 });
      hello = {
        isWritablePrimary: h.isWritablePrimary ?? h.ismaster ?? null,
        setName: h.setName ?? null,          // present ⇒ replica set
        hosts: h.hosts ?? null,              // advertised member hosts (the discovery targets)
        me: h.me ?? null,
        primary: h.primary ?? null,
        maxWireVersion: h.maxWireVersion ?? null,
      };
    } catch { /* hello optional */ }
    return { ok: true, elapsedMs: Date.now() - started, pingMs, hello, error: null };
  } catch (err) {
    return { ok: false, elapsedMs: Date.now() - started, pingMs: null, hello: null, error: serializeError(err) };
  } finally {
    try { await client.close(true); } catch { /* ignore */ }
  }
}

export interface ConnectivityReport {
  mongoEnabled: boolean;
  maskedUri: string | null;
  scheme: string | null;
  srv: boolean;
  host: string | null;
  port: number | null;
  allHosts: Array<{ host: string; port: number | null }>;
  database: string;
  username: string | null;
  hasPassword: boolean;
  authSource: string | null;
  tls: string;
  directConnection: string;
  replicaSet: string | null;
  retryWrites: string;
  tcp: TcpResult | { skipped: true; reason: string };
  driverConfigured: DriverResult | null;
  driverDirect: DriverResult | null;
  connected: boolean;
  elapsedMs: number | null;
  pingMs: number | null;
  isReplicaSet: boolean | null;
  classification: string;
  recommendation: string;
}

export async function probeMongoConnectivity(): Promise<ConnectivityReport> {
  if (!isMongoConfigured()) {
    return {
      mongoEnabled: false, maskedUri: null, scheme: null, srv: false, host: null, port: null, allHosts: [],
      database: '', username: null, hasPassword: false, authSource: null, tls: 'n/a', directConnection: 'n/a',
      replicaSet: null, retryWrites: 'n/a', tcp: { skipped: true, reason: 'MONGODB_URI not set' },
      driverConfigured: null, driverDirect: null, connected: false, elapsedMs: null, pingMs: null,
      isReplicaSet: null, classification: 'not_configured',
      recommendation: 'MONGODB_URI is not set in this server runtime. Set it and redeploy.',
    };
  }

  const { uri, dbName } = getMongoEnvConfig();
  const parsed = parseMongoUri(uri);
  const first = parsed.hosts[0] || { host: null, port: null };

  // 1) Raw TCP reachability (network layer) — only for a concrete host:port.
  const tcp: ConnectivityReport['tcp'] = parsed.srv || !first.host || !first.port
    ? { skipped: true, reason: parsed.srv ? 'mongodb+srv resolves hosts via DNS SRV; skipped raw TCP' : 'no concrete host:port' }
    : await tcpProbe(first.host, first.port);

  // 2) & 3) Driver probes (configured + direct) in parallel to stay within limits.
  const [driverConfigured, driverDirect] = await Promise.all([
    driverProbe(uri, dbName, false),
    driverProbe(uri, dbName, true),
  ]);

  const connected = driverConfigured.ok;
  const helloSrc = driverConfigured.hello || driverDirect.hello;
  const isReplicaSet = helloSrc ? Boolean(helloSrc.setName) : null;

  // Classification.
  const tcpOk = 'ok' in tcp ? tcp.ok : null;
  let classification = 'unknown';
  let recommendation = '';
  if (connected) {
    classification = 'ok';
    recommendation = 'Connected and authenticated. No action needed.';
  } else if (tcpOk === false) {
    classification = 'network_unreachable';
    recommendation = 'The server cannot open a TCP socket to the Mongo host:port. This is a NETWORK '
      + 'block, not auth. On self-hosted Mongo: open the port in the firewall/security group to Vercel '
      + 'egress (Vercel serverless IPs are dynamic → allow 0.0.0.0/0 on the DB port, or use a static-IP '
      + 'egress / VPN / SSH tunnel / Atlas PrivateLink), and set mongod bindIp to 0.0.0.0 (or the public NIC).';
  } else if (tcpOk === true && !driverConfigured.ok && driverDirect.ok) {
    classification = 'replica_set_advertised_hosts_unreachable';
    recommendation = 'TCP works and a DIRECT connection works, but normal (topology-discovery) connect '
      + 'times out. The node is a replica set whose advertised member hostnames are not resolvable/'
      + 'routable from Vercel. Fix server-side (advertise public hostnames in the replica set config) OR '
      + 'append ?directConnection=true to MONGODB_URI to bypass discovery (single-node access).';
  } else if (tcpOk === true && !driverConfigured.ok && !driverDirect.ok) {
    classification = 'handshake_or_tls_failure';
    recommendation = 'TCP connects but the Mongo handshake never completes (both normal and direct time '
      + 'out). Likely a TLS mismatch (server requires TLS but the URI has none → add tls=true; or the '
      + 'reverse), or the port is answering but not mongod. Verify TLS requirement and that mongod (not '
      + 'another service) listens on that port.';
  } else {
    const errName = (driverConfigured.error?.name as string) || '';
    if (errName === 'MongoServerError' && [18, 13].includes(Number(driverConfigured.error?.code))) {
      classification = 'auth_failed';
      recommendation = 'Reached the server but authentication/authorization failed. Verify username/'
        + 'password and authSource (add ?authSource=admin if the user lives in admin).';
    } else {
      classification = 'unresolved';
      recommendation = 'See driverConfigured.error and topologyReason for specifics.';
    }
  }

  return {
    mongoEnabled: true,
    maskedUri: maskUri(uri),
    scheme: parsed.scheme,
    srv: parsed.srv,
    host: first.host,
    port: first.port,
    allHosts: parsed.hosts,
    database: dbName,
    username: parsed.username,
    hasPassword: parsed.hasPassword,
    authSource: parsed.params.authsource ?? (parsed.database || null),
    tls: parsed.params.tls ?? parsed.params.ssl ?? (parsed.srv ? 'true (implied by +srv)' : 'not set'),
    directConnection: parsed.params.directconnection ?? 'not set',
    replicaSet: parsed.params.replicaset ?? null,
    retryWrites: parsed.params.retrywrites ?? (parsed.srv ? 'true (default)' : 'not set'),
    tcp,
    driverConfigured,
    driverDirect,
    connected,
    elapsedMs: driverConfigured.elapsedMs,
    pingMs: driverConfigured.pingMs,
    isReplicaSet,
    classification,
    recommendation,
  };
}
