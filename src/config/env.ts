// Typed, validated environment configuration for the MongoDB layer.
//
// Phase 1 (foundation) only reads configuration — it never mutates it. All
// values come from environment variables so nothing sensitive is committed to
// the repository (mirrors how the rest of the app reads secrets from env).
//
// The connection string for the MView-Staging cluster is supplied at runtime
// via MONGODB_URI. The database is ALWAYS GovernanceDB unless explicitly
// overridden with MONGODB_DB_NAME (kept configurable for local/dev clusters,
// but defaulting to the approved database name so no other database is touched
// by accident).

/** Default (and approved) database name. Do not change without approval. */
export const DEFAULT_DB_NAME = 'GovernanceDB';

export interface MongoEnvConfig {
  /** Full MongoDB connection string (secret — from env, never hardcoded). */
  uri: string;
  /** Target database name. Defaults to GovernanceDB. */
  dbName: string;
  /** Max pool size for the shared client (tunable for serverless). */
  maxPoolSize: number;
  /** Min pool size. */
  minPoolSize: number;
  /** How long a socket may stay idle before being closed (ms). */
  maxIdleTimeMS: number;
  /** Server selection timeout (ms) — fail fast when the cluster is unreachable. */
  serverSelectionTimeoutMS: number;
  /** True when running on Vercel / a serverless host. */
  isServerless: boolean;
}

function intFromEnv(name: string, fallback: number): number {
  const raw = (process.env[name] || '').trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Whether the MongoDB layer has been configured (a URI is present). */
export function isMongoConfigured(): boolean {
  return Boolean((process.env.MONGODB_URI || '').trim());
}

/**
 * Read and validate the MongoDB configuration from the environment.
 * Throws a clear error when MONGODB_URI is missing so misconfiguration fails
 * loudly at connection time rather than silently later.
 */
export function getMongoEnvConfig(): MongoEnvConfig {
  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    throw new Error(
      'MongoDB is not configured. Set the MONGODB_URI environment variable '
        + '(the MView-Staging connection string). See .env.example.',
    );
  }

  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;
  const isServerless = Boolean(process.env.VERCEL || process.env.WORKBENCH_SERVERLESS);

  return {
    uri,
    dbName,
    // Serverless functions are short-lived and numerous, so keep pools small to
    // avoid exhausting the cluster's connection limit; a longer-lived local
    // process can afford a larger pool.
    maxPoolSize: intFromEnv('MONGODB_MAX_POOL_SIZE', isServerless ? 10 : 20),
    minPoolSize: intFromEnv('MONGODB_MIN_POOL_SIZE', 0),
    maxIdleTimeMS: intFromEnv('MONGODB_MAX_IDLE_TIME_MS', 60_000),
    serverSelectionTimeoutMS: intFromEnv('MONGODB_SERVER_SELECTION_TIMEOUT_MS', 10_000),
    isServerless,
  };
}
