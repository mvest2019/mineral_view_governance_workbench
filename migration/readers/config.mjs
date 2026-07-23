// Config reader. Extracts config-derived source data (employee roster keys,
// department keys) from lib/config.ts by reading it as TEXT and regex-scanning.
// Read-only; never imports or executes the TS. Best-effort — used to cross-check
// and enrich the markdown-derived roster.

import { MIGRATION_CONFIG } from '../config.mjs';
import { readFileSafe, slugify } from '../lib/utils.mjs';

let _text = null;
function text() {
  if (_text == null) _text = readFileSafe(MIGRATION_CONFIG.paths.configTs) || '';
  return _text;
}

/**
 * Employee profile keys from TEAM_MEMBER_PROFILES.MView — the object keys look
 * like `Ryan_Cochran: {`. Returns [{ profileKey, memberKey }].
 */
export function readConfigEmployeeKeys() {
  const t = text();
  const start = t.indexOf('TEAM_MEMBER_PROFILES');
  if (start < 0) return [];
  const slice = t.slice(start);
  const out = [];
  const re = /^\s{4,}([A-Z][A-Za-z]+_[A-Za-z_]+):\s*\{/gm;
  for (const m of slice.matchAll(re)) {
    out.push({ profileKey: m[1], memberKey: slugify(m[1]) });
  }
  return out;
}

/** Department keys referenced in config (e.g. 'DATA_SCIENCE'). Deduped. */
export function readConfigDepartments() {
  const t = text();
  const set = new Set();
  for (const m of t.matchAll(/'([A-Z][A-Z0-9_]{2,})'/g)) {
    // Heuristic: department-looking tokens (all caps snake).
    if (/^[A-Z0-9_]+$/.test(m[1]) && m[1].includes('_')) set.add(m[1]);
  }
  return [...set];
}

/** True if lib/config.ts was readable. */
export function configAvailable() {
  return text().length > 0;
}
