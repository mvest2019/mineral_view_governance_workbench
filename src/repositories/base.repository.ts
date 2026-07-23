// Generic base repository.
//
// This is the reusable data-access foundation every V1 collection repository
// will extend in later phases. It centralizes the cross-cutting rules from the
// spec so feature repositories can't forget them:
//   - companyKey injection on every read and write
//   - audit-envelope stamping (createdAt/By, updatedAt/By, version)
//   - soft-delete filtering by default (isDeleted:false)
//   - optimistic-concurrency updates (match on _id + version, $inc version)
//
// IMPORTANT (Phase 1): this class is defined but NOT instantiated against any
// real collection yet. Defining it creates nothing in MongoDB. Concrete
// repositories (EmployeeRepository, etc.) arrive with their collections in
// later phases. Nothing here runs at import time.

import {
  ObjectId,
  type Collection,
  type Document,
  type Filter,
  type OptionalUnlessRequiredId,
  type UpdateFilter,
  type WithId,
} from 'mongodb';
import { getCollection } from '@/src/db/connection';
import { DEFAULT_COMPANY_KEY } from '@/src/constants/enums';
import {
  auditedUpdate,
  newBaseDocument,
  softDeletePatch,
  type BaseDocument,
} from '@/src/models/base';

export interface RepositoryOptions {
  /** Company discriminator to scope all operations to. Defaults to MView. */
  companyKey?: string;
}

/**
 * Base repository over a single GovernanceDB collection whose documents extend
 * BaseDocument. Generic on the concrete document type.
 */
export abstract class BaseRepository<TDoc extends BaseDocument & Document> {
  /** The collection name (from src/constants/collections). */
  protected readonly collectionName: string;
  protected readonly companyKey: string;

  protected constructor(collectionName: string, options?: RepositoryOptions) {
    this.collectionName = collectionName;
    this.companyKey = options?.companyKey ?? DEFAULT_COMPANY_KEY;
  }

  /** Resolve the underlying typed collection handle (creates nothing). */
  protected async collection(): Promise<Collection<TDoc>> {
    return getCollection<TDoc>(this.collectionName);
  }

  /** Merge a caller filter with the mandatory company + not-deleted scope. */
  protected scopedFilter(filter: Filter<TDoc> = {}): Filter<TDoc> {
    return {
      ...(filter as object),
      companyKey: this.companyKey,
      isDeleted: false,
    } as Filter<TDoc>;
  }

  /**
   * Insert a new document, stamping the audit envelope automatically. The caller
   * supplies only the collection-specific fields.
   */
  async create(
    fields: Omit<TDoc, keyof BaseDocument | '_id'>,
    actor?: string,
  ): Promise<TDoc> {
    const base = newBaseDocument({ actor, companyKey: this.companyKey });
    const doc = { ...base, ...(fields as object) } as unknown as TDoc;
    const col = await this.collection();
    const res = await col.insertOne(doc as OptionalUnlessRequiredId<TDoc>);
    return { ...doc, _id: res.insertedId } as TDoc;
  }

  /** Find one live document by id within the company scope. */
  async findById(id: string | ObjectId): Promise<WithId<TDoc> | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const col = await this.collection();
    return col.findOne(this.scopedFilter({ _id } as Filter<TDoc>));
  }

  /** Find one live document by an arbitrary (company-scoped) filter. */
  async findOne(filter: Filter<TDoc>): Promise<WithId<TDoc> | null> {
    const col = await this.collection();
    return col.findOne(this.scopedFilter(filter));
  }

  /**
   * Optimistic-concurrency update: matches on _id + expected version, applies
   * the caller's $set fields, refreshes the audit envelope and bumps version.
   * Returns the updated document, or null if the version did not match (=> the
   * caller should treat as a 409 conflict).
   */
  async updateById(
    id: string | ObjectId,
    expectedVersion: number,
    set: Partial<Omit<TDoc, keyof BaseDocument | '_id'>>,
    actor?: string,
  ): Promise<WithId<TDoc> | null> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const audit = auditedUpdate({ actor });
    const col = await this.collection();
    const update = {
      $set: { ...(set as object), ...audit.set },
      $inc: audit.inc,
    } as unknown as UpdateFilter<TDoc>;
    return col.findOneAndUpdate(
      this.scopedFilter({ _id, version: expectedVersion } as Filter<TDoc>),
      update,
      { returnDocument: 'after' },
    );
  }

  /** Soft-delete a document (sets the tombstone; keeps it for audit/restore). */
  async softDelete(id: string | ObjectId, actor?: string): Promise<boolean> {
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const col = await this.collection();
    const update = { $set: softDeletePatch({ actor }) } as unknown as UpdateFilter<TDoc>;
    const res = await col.updateOne(this.scopedFilter({ _id } as Filter<TDoc>), update);
    return res.modifiedCount === 1;
  }

  /** Count live documents matching a company-scoped filter. */
  async count(filter: Filter<TDoc> = {}): Promise<number> {
    const col = await this.collection();
    return col.countDocuments(this.scopedFilter(filter));
  }
}
