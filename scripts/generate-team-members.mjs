#!/usr/bin/env node
/*
 * Generate team_members.json from the source of truth:
 *   - Governance_Files/_GOVERNANCE/team_members/team-member-*.md  (full profile)
 *   - lib/config.ts  → TEAM_MEMBER_PROFILES.MView                 (page-facing fields)
 *
 * Each output document preserves ALL Markdown information (every parsed section
 * in `sections[]` plus the untouched `rawMarkdown`) AND carries the exact
 * page-facing fields the UI shows today (role, purpose, departments, repos,
 * operatingSources) sourced from the config for pixel-identical parity.
 *
 * Read-only. Invents nothing. Writes ./team_members.json.
 * Run:  npm run generate:team-members
 */
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const CONFIG_TS = path.join(REPO_ROOT, 'lib', 'config.ts');
const MD_DIR = path.join(REPO_ROOT, 'Governance_Files', '_GOVERNANCE', 'team_members');
const OUT = path.join(REPO_ROOT, 'team_members.json');
const COMPANY = 'MView';

// --- extract TEAM_MEMBER_PROFILES from config.ts (balanced-brace + eval) ------
function extractObjectLiteral(src, fromIndex) {
  const start = src.indexOf('{', fromIndex);
  if (start < 0) return null;
  let depth = 0, inStr = false, quote = '', esc = false;
  for (let j = start; j < src.length; j++) {
    const c = src[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === quote) inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = true; quote = c; }
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, j + 1); }
  }
  return null;
}

function loadConfigProfiles() {
  const text = fs.readFileSync(CONFIG_TS, 'utf8');
  const nameIdx = text.indexOf('export const TEAM_MEMBER_PROFILES');
  if (nameIdx < 0) throw new Error('TEAM_MEMBER_PROFILES not found in lib/config.ts');
  const eqIdx = text.indexOf('=', nameIdx);
  const literal = extractObjectLiteral(text, eqIdx);
  if (!literal) throw new Error('Could not extract TEAM_MEMBER_PROFILES object literal');
  // eslint-disable-next-line no-new-func
  const obj = new Function(`return (${literal})`)();
  return obj[COMPANY] || {};
}

// --- Markdown parsing ---------------------------------------------------------
function splitList(s) {
  if (!s) return [];
  return String(s).split(/[,/]/).map((x) => x.trim()).filter((x) => x && x !== '—' && x !== '-');
}
function tableCell(raw, label) {
  const re = new RegExp(`\\|\\s*\\*\\*${label.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}\\*\\*\\s*\\|\\s*([^|]+?)\\s*\\|`, 'i');
  const m = raw.match(re);
  return m ? m[1].trim() : undefined;
}
function firstMatch(raw, re) { const m = raw.match(re); return m ? m[1].trim() : undefined; }

function parseHeader(raw) {
  const out = {};
  const bq = [];
  for (const line of raw.split(/\r?\n/)) {
    if (line.startsWith('>')) bq.push(line.replace(/^>\s?/, ''));
    else if (line.trim() === '') { if (bq.length) continue; }
    else if (bq.length) break;
  }
  const joined = bq.join(' ');
  const re = /\*\*([^*]+?):\*\*\s*(.+?)(?=\s*\*\*[^*]+?:\*\*|$)/g;
  for (const m of joined.matchAll(re)) {
    out[m[1].trim()] = m[2].replace(/\s*·\s*$/, '').trim();
  }
  return out;
}

function splitSections(raw) {
  const sections = [];
  let cur = null;
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      if (cur) sections.push(cur);
      const heading = m[1];
      const nm = heading.match(/^(\d+(?:\.\d+)?)\.?\s*(.*)$/);
      cur = { number: nm && /^\d+$/.test(nm[1]) ? Number(nm[1]) : null, title: nm ? nm[2].trim() || heading.trim() : heading.trim(), _lines: [] };
    } else if (cur) {
      cur._lines.push(line);
    }
  }
  if (cur) sections.push(cur);
  return sections.map((s) => ({ number: s.number, title: s.title, markdown: s._lines.join('\n').trim() }));
}

function parseSnapshot(raw) {
  const purpose = firstMatch(raw, /\*\*Purpose at Mineral View \(one line\):\*\*\s*(.+)/);
  const focus = firstMatch(raw, /\*\*Focused on right now:\*\*\s*(.+)/);
  const priorities = [];
  const block = raw.match(/\*\*Top priorities:\*\*\s*\n([\s\S]*?)(?:\n\s*\n|\n##\s)/);
  if (block) {
    for (const l of block[1].split(/\r?\n/)) {
      const m = l.match(/^\s*[-*]\s+(.+)/);
      if (m) priorities.push(m[1].trim());
    }
  }
  return { purpose, focus, priorities };
}

function parseSkills(raw) {
  const skills = {};
  const langs = firstMatch(raw, /\*\*Languages\s*\/\s*frameworks:\*\*\s*(.+)/i);
  const tools = firstMatch(raw, /\*\*Tools\s*\/\s*platforms:\*\*\s*(.+)/i);
  const domain = firstMatch(raw, /\*\*Domain knowledge:\*\*\s*(.+)/i);
  if (langs) skills.languages = langs;
  if (tools) skills.tools = tools;
  if (domain) skills.domainKnowledge = domain;
  return Object.keys(skills).length ? skills : undefined;
}

function parseMarkdownFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const slug = path.basename(file).replace(/^team-member-/, '').replace(/\.md$/, '');
  const fullName = firstMatch(raw, /^#\s+Team Member Governance\s+[—-]\s+(.+?)\s*$/m)
    || tableCell(raw, 'Member Name')
    || slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const header = parseHeader(raw);
  const snapshot = parseSnapshot(raw);
  return {
    slug,
    fullName,
    header,
    identity: {
      title: tableCell(raw, 'Role / Title') || tableCell(raw, 'Role'),
      departmentLabel: tableCell(raw, 'Department(s)') || tableCell(raw, 'Departments'),
      reportsTo: tableCell(raw, 'Reports To'),
      experience: tableCell(raw, 'Experience in Project'),
      finalAuthority: tableCell(raw, 'Final authority (governance)') || tableCell(raw, 'Final authority'),
      primarySurfaces: splitList(tableCell(raw, 'Primary surfaces')),
    },
    snapshot,
    skills: parseSkills(raw),
    sections: splitSections(raw),
    raw,
    sourcePath: path.relative(REPO_ROOT, file).replace(/\\/g, '/'),
  };
}

function keyFromName(name) { return name.trim().split(/\s+/).join('_'); }
function deSlugKey(key) { return key.replace(/_/g, ' '); }

// --- build ---------------------------------------------------------------------
function main() {
  const config = loadConfigProfiles();
  const mdFiles = fs.existsSync(MD_DIR)
    ? fs.readdirSync(MD_DIR).filter((f) => /^team-member-.*\.md$/.test(f)).map((f) => path.join(MD_DIR, f))
    : [];
  const mdByNorm = new Map();
  for (const file of mdFiles) {
    const md = parseMarkdownFile(file);
    mdByNorm.set(keyFromName(md.fullName).toLowerCase(), md);
  }

  const docs = [];
  const usedMd = new Set();
  const emit = (memberKey, cfg, md) => {
    if (md) usedMd.add(md.slug);
    docs.push({
      companyKey: COMPANY,
      memberKey,
      slug: md ? md.slug : null,
      fullName: md ? md.fullName : deSlugKey(memberKey),
      // page-facing fields — from CONFIG for pixel-identical UI parity
      role: (cfg && cfg.role) || '',
      purpose: (cfg && cfg.purpose) || '',
      departments: (cfg && cfg.departments) || [],
      repos: (cfg && cfg.repos) || [],
      operatingSources: (cfg && cfg.operating_sources) || [],
      // enrichment — from the Markdown header / §1 / §2 / §11
      title: md ? (md.identity.title || md.header['Role']) : undefined,
      departmentLabel: md ? (md.header['Department(s)'] || md.identity.departmentLabel) : undefined,
      reportsTo: md ? (md.identity.reportsTo || md.header['Reports to']) : undefined,
      experience: md ? (md.identity.experience || md.header['Experience in project']) : undefined,
      finalAuthority: md ? (md.identity.finalAuthority || md.header['Final authority']) : undefined,
      primarySurfaces: md ? md.identity.primarySurfaces : undefined,
      focus: md ? md.snapshot.focus : undefined,
      priorities: md ? md.snapshot.priorities : undefined,
      skills: md ? md.skills : undefined,
      reviewCadence: md ? md.header['Review cadence'] : undefined,
      lastUpdatedLabel: md ? md.header['Last Updated'] : undefined,
      sourceNote: md ? md.header['Source'] : undefined,
      // full-fidelity preservation
      sections: md ? md.sections : [],
      rawMarkdown: md ? md.raw : '',
      sourcePath: md ? md.sourcePath : null,
      hasProfileDoc: Boolean(md),
      status: 'ACTIVE',
    });
  };

  // 1) every config member (drives the roster + page parity)
  for (const [memberKey, cfg] of Object.entries(config)) {
    emit(memberKey, cfg, mdByNorm.get(memberKey.toLowerCase()) || null);
  }
  // 2) any Markdown member not present in config (union — never drop a profile)
  for (const [norm, md] of mdByNorm) {
    if (usedMd.has(md.slug)) continue;
    emit(keyFromName(md.fullName), null, md);
    void norm;
  }

  // strip undefined keys for a clean file
  const clean = docs.map((d) => Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined)));
  fs.writeFileSync(OUT, JSON.stringify(clean, null, 2) + '\n', 'utf8');

  const withMd = clean.filter((d) => d.hasProfileDoc).length;
  console.log(`✔ Wrote ${clean.length} team member document(s) to ${path.relative(REPO_ROOT, OUT)}`);
  console.log(`  ${withMd} enriched from Markdown, ${clean.length - withMd} config-only (no .md file).`);
  console.log(`  Markdown files parsed: ${mdFiles.length}. Company: ${COMPANY}.`);
}

main();
