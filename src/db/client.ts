// Singleton MongoClient for Next.js + Vercel.
//
// Why a singleton: on serverless (Vercel) every request may run in a fresh
// function invocation, and in dev the Next.js dev server hot-reloads modules on
// every edit. Creating a new MongoClient each time would open a flood of
// connections and quickly exhaust the cluster's connection limit. The standard
// fix (used by MongoDB's own Next.js example) is to cache a single connection
// promise on the Node.js `globalThis` so it is reused across invocations and
// across HMR reloads.
//
// This module only establishes (and reuses) a connection. It creates NO
// collections and performs NO writes — importing it has no side effects until
// getMongoClient() is actually called.

import { MongoClient, type MongoClientOptions } from 'mongodb';
import { getMongoEnvConfig } from '@/src/config/env';

// A typed slot on globalThis so the cached client survives module reloads in
// development and is shared across the process in production.
type GlobalWithMongo = typeof globalThis & {
  __governanceMongoClientPromise?: Promise<MongoClient>;
};

const globalWithMongo = globalThis as GlobalWithMongo;

function buildClient(): Promise<MongoClient> {
  const cfg = getMongoEnvConfig();
  const options: MongoClientOptions = {
    maxPoolSize: cfg.maxPoolSize,
    minPoolSize: cfg.minPoolSize,
    maxIdleTimeMS: cfg.maxIdleTimeMS,
    serverSelectionTimeoutMS: cfg.serverSelectionTimeoutMS,
    // Retryable writes/reads are safe defaults for a replica set (Atlas).
    retryWrites: true,
    retryReads: true,
    appName: 'governance-workbench',
  };
  const client = new MongoClient(cfg.uri, options);
  return client.connect();
}

/**
 * Return the shared, connected MongoClient promise. Safe to call on every
 * request — the underlying connection is created once and reused thereafter.
 */
export function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalWithMongo.__governanceMongoClientPromise) {
    globalWithMongo.__governanceMongoClientPromise = buildClient();
  }
  return globalWithMongo.__governanceMongoClientPromise;
}

/** Await and return the connected MongoClient. */
export async function getMongoClient(): Promise<MongoClient> {
  return getMongoClientPromise();
}

/**
 * Close the shared client and clear the cache. Intended for scripts, tests, and
 * graceful shutdown — not for the request path (the connection is meant to stay
 * warm and be reused).
 */
export async function closeMongoClient(): Promise<void> {
  const existing = globalWithMongo.__governanceMongoClientPromise;
  if (existing) {
    const client = await existing;
    await client.close();
    globalWithMongo.__governanceMongoClientPromise = undefined;
  }
}
