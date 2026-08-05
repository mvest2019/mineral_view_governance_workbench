import { json, route } from '@/lib/http';
import { probeMongoConnectivity } from '@/lib/mongo_connectivity';

export const dynamic = 'force-dynamic';
// Node runtime so the `net` module + mongodb driver are available (not Edge).
export const runtime = 'nodejs';

// TEMPORARY diagnostic endpoint. Probes the CONFIGURED MongoDB from inside the
// running (e.g. Vercel) server and reports parsed connection details, raw TCP
// reachability, driver connect/ping (configured + directConnection), topology,
// the full driver error, and a classification. Writes nothing. Remove once the
// connectivity issue is resolved.
//
// GET /api/health/mongo/connectivity
export const GET = route(async () => {
  const startedAt = Date.now();
  const report = await probeMongoConnectivity();

  // Server-log the key facts (masked — no password).
  console.log('[mongo-connectivity] uri:', report.maskedUri);
  console.log('[mongo-connectivity] host:', report.host, 'port:', report.port, 'db:', report.database);
  console.log('[mongo-connectivity] tls:', report.tls, 'directConnection:', report.directConnection, 'replicaSet:', report.replicaSet, 'authSource:', report.authSource);
  console.log('[mongo-connectivity] tcp:', JSON.stringify(report.tcp));
  console.log('[mongo-connectivity] connected:', report.connected, 'pingMs:', report.pingMs, 'isReplicaSet:', report.isReplicaSet);
  console.log('[mongo-connectivity] classification:', report.classification);
  if (report.driverConfigured?.error) {
    console.error('[mongo-connectivity] driver error:', JSON.stringify(report.driverConfigured.error));
  }

  return json(
    {
      mongoEnabled: report.mongoEnabled,
      host: report.host,
      port: report.port,
      database: report.database,
      connected: report.connected,
      elapsedMs: report.elapsedMs,
      pingMs: report.pingMs,
      topology: {
        isReplicaSet: report.isReplicaSet,
        configuredHelloOrDirectHello: report.driverConfigured?.hello ?? report.driverDirect?.hello ?? null,
        configuredError: report.driverConfigured?.error?.topologyReason ?? null,
      },
      error: report.driverConfigured?.error ?? null,
      classification: report.classification,
      // Extra context (all non-secret) to answer the full checklist in one call.
      details: {
        maskedUri: report.maskedUri,
        scheme: report.scheme,
        srv: report.srv,
        allHosts: report.allHosts,
        username: report.username,
        hasPassword: report.hasPassword,
        authSource: report.authSource,
        tls: report.tls,
        directConnection: report.directConnection,
        replicaSet: report.replicaSet,
        retryWrites: report.retryWrites,
        tcp: report.tcp,
        driverConfigured: report.driverConfigured,
        driverDirect: report.driverDirect,
        recommendation: report.recommendation,
        totalProbeMs: Date.now() - startedAt,
      },
    },
    report.connected ? 200 : 503,
  );
});
