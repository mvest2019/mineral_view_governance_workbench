// Batch processing helper. Splits work into bounded chunks and processes each
// (with a callback), returning aggregated results. Used so both dry-run and the
// future execution phase share the same batching semantics.

export function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Process items in batches. `fn(batch, batchIndex)` may be async; its return
 * value is collected. Errors in one batch are captured (not thrown) so the run
 * continues and reports them.
 */
export async function processInBatches(items, size, fn, onProgress) {
  const batches = chunk(items, size);
  const results = [];
  for (let i = 0; i < batches.length; i += 1) {
    try {
      results.push(await fn(batches[i], i));
    } catch (err) {
      results.push({ error: err && err.message ? err.message : String(err), batchIndex: i });
    }
    if (onProgress) onProgress(i + 1, batches.length, batches[i].length);
  }
  return results;
}
