// Shared migration utilities — pure, deterministic, no I/O side effects beyond
// reading files. No MongoDB connection is ever established here.

import fs from 'fs';
import crypto from 'crypto';

/** Lowercase slug: "Pooja Wable" / "Ajay_Landge" -> "pooja_wable". */
export function slugify(name) {
  const slug = String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]+/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug || 'unknown';
}

/** Normalize a title for dedupe: lowercase, collapse whitespace, trim. */
export function normalizeTitle(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** SHA-256 hex of a string (content hashing / checksums). */
export function sha256(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};
const IST_OFFSET_MIN = 5 * 60 + 30; // Asia/Kolkata = UTC+05:30

/**
 * Parse a governance IST timestamp into a UTC Date.
 * Accepts: "2026-07-21 06:57 PM IST", "2026-07-21", "21 July 2026",
 * or ("21 July 2026", "06:57 PM IST"). Returns { date, ok, raw }.
 */
export function parseISTToUTC(input, timePart) {
  const raw = [input, timePart].filter(Boolean).join(' ');
  const s = String(input || '').trim();
  let y; let mo; let d; let hh = 0; let mm = 0;

  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?/i);
  if (m) {
    y = +m[1]; mo = +m[2] - 1; d = +m[3];
    if (m[4] != null) { hh = +m[4]; mm = +m[5]; hh = to24(hh, m[7]); }
  } else {
    m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (m && MONTHS[m[2].toLowerCase()] != null) {
      d = +m[1]; mo = MONTHS[m[2].toLowerCase()]; y = +m[3];
    } else {
      return { date: null, ok: false, raw };
    }
  }

  const t = String(timePart || '').match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (t) { hh = to24(+t[1], t[4]); mm = +t[2]; }

  const utcMs = Date.UTC(y, mo, d, hh, mm) - IST_OFFSET_MIN * 60 * 1000;
  const date = new Date(utcMs);
  return { date: Number.isNaN(date.getTime()) ? null : date, ok: !Number.isNaN(date.getTime()), raw };
}

function to24(h, ampm) {
  let hh = h % 12;
  if (String(ampm || '').toUpperCase() === 'PM') hh += 12;
  if (!ampm) hh = h; // 24h input
  return hh;
}

/** Upcase + validate against an enum vocabulary. Returns { value, ok }. */
export function upcaseEnum(value, allowed) {
  if (value == null) return { value: undefined, ok: true }; // optional field
  const up = String(value).trim().toUpperCase().replace(/[\s-]+/g, '_');
  return allowed.includes(up) ? { value: up, ok: true } : { value: up, ok: false };
}

/** Read a UTF-8 file, or null if missing/unreadable (never throws). */
export function readFileSafe(p) {
  try { return fs.readFileSync(p, 'utf-8'); } catch { return null; }
}

/** List files in a dir matching an optional predicate; [] if dir missing. */
export function listFiles(dir, predicate) {
  try {
    return fs.readdirSync(dir)
      .filter((f) => (predicate ? predicate(f) : true))
      .map((f) => `${dir}/${f}`);
  } catch { return []; }
}

/** True if a path exists. */
export function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

/**
 * Parse "## Heading\nvalue…" blocks (Task Tracker / Priority answers style) and
 * "Label:\nvalue…" blocks (meeting-upload style) from markdown into a map of
 * heading -> text. Best-effort and forgiving.
 */
export function parseLabeledBlocks(md) {
  const out = {};
  const text = String(md || '').replace(/\r\n/g, '\n');
  // "## Heading" sections
  const secRe = /^##\s+(.+?)\s*$/gm;
  const matches = [...text.matchAll(secRe)];
  if (matches.length) {
    for (let i = 0; i < matches.length; i += 1) {
      const heading = matches[i][1].trim();
      const start = matches[i].index + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      out[heading] = text.slice(start, end).trim();
    }
    return out;
  }
  // "Label:" sections (value on following lines until next "Label:")
  const lines = text.split('\n');
  let curKey = null; let buf = [];
  const flush = () => { if (curKey) out[curKey] = buf.join('\n').trim(); buf = []; };
  const labelRe = /^([A-Z][A-Za-z0-9 /]+):\s*(.*)$/;
  for (const line of lines) {
    const lm = line.match(labelRe);
    if (lm) { flush(); curKey = lm[1].trim(); if (lm[2]) buf.push(lm[2]); }
    else if (curKey) buf.push(line);
  }
  flush();
  return out;
}
