// Document finalizer. Turns a mapper's candidate (module fields + companyKey +
// legacy provenance) into an INSERT-READY document: stamps the full V1 base
// envelope, normalizes metadata, attaches metadata.migration.{runId,batchId},
// and assigns an _id (via the crossref so a natural key always maps to the same
// ObjectId within a run). Pure — no I/O, no MongoDB connection.

import { ObjectId } from 'mongodb';
import { MIGRATION_CONFIG } from '../config.mjs';

export function finalizeDocument(collection, candidate, opts) {
  const { runId, batchId, crossref, naturalKey } = opts;
  const actor = opts.actor || 'migration';
  const now = opts.now || new Date();

  // Normalize provenance: accept either `_legacy` or `metadata.legacy`.
  const legacy = (candidate.metadata && candidate.metadata.legacy) || candidate._legacy || {};
  const baseMeta = { ...(candidate.metadata || {}) };
  delete baseMeta.legacy;

  const doc = { ...candidate };
  delete doc._legacy;
  delete doc.metadata;

  // Base envelope (V1 §2.2).
  doc.companyKey = doc.companyKey || MIGRATION_CONFIG.companyKey;
  doc.createdAt = now;
  doc.createdBy = actor;
  doc.updatedAt = now;
  doc.updatedBy = actor;
  doc.isDeleted = false;
  doc.deletedAt = null;
  doc.deletedBy = null;
  doc.version = 1;

  // Metadata: preserve any candidate metadata, attach legacy + migration tags.
  doc.metadata = {
    ...baseMeta,
    legacy,
    migration: { runId, batchId },
  };

  // Deterministic-per-run _id via the crossref (natural key → ObjectId). On an
  // idempotent re-run the upsert filter matches the existing doc, so this _id is
  // only used for brand-new inserts.
  doc._id = crossref && naturalKey != null
    ? crossref.objectIdFor(collection, naturalKey)
    : new ObjectId();

  return doc;
}
