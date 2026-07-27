// TEMPORARY diagnostics for the "MongoDB is not configured" issue.
//
// Reports, from inside the running server process, exactly why
// process.env.MONGODB_URI may be missing even though `npm run mongo:health`
// (a standalone `node --env-file-if-exists=.env.local` process) can read it.
//
// Reads NO secrets into the output — only presence flags, the (non-secret)
// database name, NODE_ENV, cwd, the Next.js runtime, and which .env* files exist
// in the working directory (and whether each declares a MONGODB_URI line).
//
// Remove once the environment issue is resolved.

import fs from 'fs';
import path from 'path';
import { mongoEnabled } from '@/lib/mongo_bridge';

// Next.js env-file precedence (later entries are overridden by earlier ones).
// A value in `.env.<NODE_ENV>.local` WINS over `.env.local`; `.env.local` is
// skipped entirely when NODE_ENV === 'test'.
const ENV_FILES = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
] as const;

export interface EnvFileInfo {
  file: string;
  exists: boolean;
  /** true if the file contains an uncommented `MONGODB_URI=` line. */
  declaresMongoUri: boolean;
}

export interface MongoEnvDiagnostics {
  mongodbUri: 'SET' | 'NOT SET';
  mongodbUriLength: number;
  mongodbDbName: string | undefined;
  mongoEnabled: boolean;
  cwd: string;
  nodeEnv: string | undefined;
  /** 'nodejs' | 'edge' | undefined — set by Next.js for the current runtime. */
  nextRuntime: string | undefined;
  cwdHasEnvLocal: boolean;
  envFilesDetected: EnvFileInfo[];
  mongoClientInitialized: boolean;
  reason: string;
}

function declaresMongoUri(file: string): boolean {
  try {
    const text = fs.readFileSync(file, 'utf8');
    // Uncommented MONGODB_URI assignment on any line.
    return /^[ \t]*MONGODB_URI[ \t]*=/m.test(text);
  } catch {
    return false;
  }
}

export function mongoEnvDiagnostics(): MongoEnvDiagnostics {
  const cwd = process.cwd();
  const uri = process.env.MONGODB_URI || '';
  const enabled = mongoEnabled();

  const envFilesDetected: EnvFileInfo[] = ENV_FILES.map((f) => {
    const full = path.join(cwd, f);
    const exists = fs.existsSync(full);
    return { file: f, exists, declaresMongoUri: exists ? declaresMongoUri(full) : false };
  });

  const cwdHasEnvLocal = envFilesDetected.find((e) => e.file === '.env.local')?.exists ?? false;
  const localDeclares = envFilesDetected.find((e) => e.file === '.env.local')?.declaresMongoUri ?? false;
  const masking = envFilesDetected.filter(
    (e) => e.exists && (e.file === '.env.development.local' || e.file === '.env.production.local'),
  );
  const mongoClientInitialized = Boolean(
    (globalThis as { __governanceMongoClientPromise?: unknown }).__governanceMongoClientPromise,
  );

  let reason: string;
  if (enabled) {
    reason = 'MONGODB_URI is present in the server runtime — Mongo is configured.';
  } else if (!cwdHasEnvLocal) {
    reason = `No .env.local in the server's working directory (${cwd}). The server is not being `
      + 'run from the project root, so Next.js cannot load it. Start the server from the project root.';
  } else if (String(process.env.NODE_ENV) === 'test') {
    reason = 'NODE_ENV=test — Next.js intentionally does NOT load .env.local in test mode. '
      + 'Unset NODE_ENV (or set it to development/production) and restart.';
  } else if (masking.length) {
    reason = `A higher-precedence env file (${masking.map((m) => m.file).join(', ')}) exists and `
      + 'overrides .env.local. If it sets MONGODB_URI empty/absent, that wins. Fix or remove it.';
  } else if (localDeclares) {
    reason = '.env.local exists here and declares MONGODB_URI, but the running server process does '
      + 'NOT have it. The server was almost certainly started BEFORE the value was added — restart it. '
      + '(Or it was started from a different directory / with a different env than this process sees.)';
  } else {
    reason = '.env.local exists but does not declare an uncommented MONGODB_URI line in this directory.';
  }

  return {
    mongodbUri: uri.trim() ? 'SET' : 'NOT SET',
    mongodbUriLength: uri.length,
    mongodbDbName: process.env.MONGODB_DB_NAME,
    mongoEnabled: enabled,
    cwd,
    nodeEnv: process.env.NODE_ENV,
    nextRuntime: process.env.NEXT_RUNTIME,
    cwdHasEnvLocal,
    envFilesDetected,
    mongoClientInitialized,
    reason,
  };
}

/** Emit the diagnostics to the server console (temporary). */
export function logMongoEnvDiagnostics(tag: string): MongoEnvDiagnostics {
  const d = mongoEnvDiagnostics();
  console.log(`[${tag}] MONGODB_URI:`, d.mongodbUri);
  console.log(`[${tag}] MONGODB_DB_NAME:`, d.mongodbDbName);
  console.log(`[${tag}] mongoEnabled:`, d.mongoEnabled);
  console.log(`[${tag}] cwd:`, d.cwd);
  console.log(`[${tag}] NODE_ENV:`, d.nodeEnv, '| NEXT_RUNTIME:', d.nextRuntime);
  console.log(`[${tag}] mongoClientInitialized:`, d.mongoClientInitialized);
  console.log(
    `[${tag}] env files:`,
    d.envFilesDetected
      .filter((e) => e.exists)
      .map((e) => `${e.file}${e.declaresMongoUri ? '(MONGODB_URI)' : ''}`)
      .join(', ') || '(none in cwd)',
  );
  console.log(`[${tag}] reason:`, d.reason);
  return d;
}
