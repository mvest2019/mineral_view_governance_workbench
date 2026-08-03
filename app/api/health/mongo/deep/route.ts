import { json, route } from '@/lib/http';
import { mongoHealthStatus } from '@/lib/mongo_required';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// TEMPORARY deep diagnostic for the "works on staging, times out on production"
// split. Reports — from inside the running Vercel function — the exact
// configuration fingerprint that decides WHICH MongoDB path this environment
// uses, plus the bounded reachability probe. Hit it on BOTH staging and
// production and diff the `config` blocks: the field that differs is the cause.
//
// Reads NO secrets: only presence flags and masked hosts (never the URI/token).
// Remove once the environment split is resolved.

function maskHost(u: string): string | null {
  if (!u) return null;
  try { return new URL(u).host; } catch { return '(unparseable)'; }
}

export const GET = route(async () => {
  const startedAt = Date.now();

  const bridgeCanonical = (process.env.MONGODB_BRIDGE_URL || '').trim();
  const bridgeAlias = (process.env.MONGO_BRIDGE_URL || '').trim();
  const bridgeUrlRaw = bridgeCanonical || bridgeAlias;
  const uri = (process.env.MONGODB_URI || '').trim();

  const config = {
    // Which Vercel environment answered — the split usually lives here.
    vercelEnv: process.env.VERCEL_ENV || null,        // 'production' | 'preview' | 'development'
    vercelRegion: process.env.VERCEL_REGION || null,  // function region → tunnel latency
    nodeEnv: process.env.NODE_ENV || null,
    nextRuntime: process.env.NEXT_RUNTIME || null,
    // Which path this env will take. bridge URL set → HTTP bridge; else direct.
    resolvedMode: bridgeUrlRaw ? 'http_bridge' : (uri ? 'direct' : 'unconfigured'),
    bridgeUrlSource: bridgeCanonical ? 'MONGODB_BRIDGE_URL' : (bridgeAlias ? 'MONGO_BRIDGE_URL(alias)' : 'NONE'),
    bridgeHost: maskHost(bridgeUrlRaw),
    mongodbUri: uri ? 'SET' : 'NOT SET',
    mongodbUriHost: maskHost(uri),
    readTimeoutMs: Number(process.env.MONGO_READ_TIMEOUT_MS) || 4000,
    mongoRequired: String(process.env.MONGO_REQUIRED || '').trim().toLowerCase() === 'true',
    dbName: (process.env.MONGODB_DB_NAME || '').trim() || 'GovernanceDB',
    hasBridgeToken: Boolean(
      (process.env.MONGODB_BRIDGE_TOKEN || process.env.MONGO_BRIDGE_TOKEN || process.env.REMOTE_CLAUDE_TOKEN || '').trim(),
    ),
  };

  // Bounded reachability probe (same path Employees/Task Tracker use). Its
  // pingMs is the key number: if it is > readTimeoutMs, the employees read can
  // NEVER succeed under the current timeout — the bridge round-trip is too slow.
  const health = await mongoHealthStatus();

  return json({
    ok: health.ok,
    elapsedMs: Date.now() - startedAt,
    config,
    health,
    hint:
      config.resolvedMode === 'http_bridge' && health.mongoOk && (health.pingMs ?? 0) > config.readTimeoutMs
        ? `Bridge reachable but pingMs=${health.pingMs}ms exceeds readTimeoutMs=${config.readTimeoutMs}ms — the bridge→Mongo round-trip is slower than the employees read timeout. Warm the bridge (deploy the latest server.js) or the tunnel/region is too far.`
        : config.resolvedMode === 'http_bridge' && !health.mongoOk
          ? 'Bridge path selected but MongoDB ping failed — the Windows bridge cannot reach MongoDB (URI/auth/allowlist on the bridge machine). See health.error.'
          : 'Compare this config block against the other environment; the differing field explains the split.',
  }, health.ok ? 200 : 503);
});
