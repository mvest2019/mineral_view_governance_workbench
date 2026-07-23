// Small ObjectId helpers shared across the data layer. Pure functions — no I/O.

import { ObjectId } from 'mongodb';

/** True when a string is a valid 24-char hex ObjectId. */
export function isValidObjectId(value: unknown): value is string {
  return typeof value === 'string' && ObjectId.isValid(value) && String(new ObjectId(value)) === value;
}

/** Coerce a string|ObjectId to an ObjectId, or return null when invalid. */
export function toObjectId(value: string | ObjectId | null | undefined): ObjectId | null {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}
