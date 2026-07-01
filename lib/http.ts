import { NextResponse } from 'next/server';

/** Mirror of Flask's abort(status, description). */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message = '') {
    super(message);
    this.status = status;
  }
}

export function abort(status: number, message = ''): never {
  throw new HttpError(status, message);
}

/** Mirror of Flask's jsonify(...) / (payload, status). */
export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data as object, { status });
}

/**
 * Wrap a route handler so thrown HttpErrors become HTTP responses, matching
 * Flask's abort() semantics. Any other error becomes a 500.
 */
export function route<A extends unknown[]>(
  handler: (...args: A) => Promise<NextResponse> | NextResponse,
) {
  return async (...args: A): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message || 'error' }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
  };
}

/** ISO-ish timestamp matching Python datetime.datetime.now().isoformat(). */
export function nowIso(): string {
  // Python's isoformat() yields e.g. 2026-07-01T05:03:12.123456 (local, no tz).
  const d = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `.${pad(d.getMilliseconds(), 3)}000`
  );
}
