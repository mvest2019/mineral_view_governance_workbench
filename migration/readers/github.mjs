// GitHub markdown readers. Read LOCAL Governance_Files/** (the working tree
// mirror of the GitHub repo). Strictly read-only — no file is modified. These
// return parsed source records; mapping to documents happens in the mappers.

import path from 'path';
import { MIGRATION_CONFIG } from '../config.mjs';
import { readFileSafe, listFiles, parseLabeledBlocks } from '../lib/utils.mjs';

const P = MIGRATION_CONFIG.paths;

/** Task Tracker: one record per markdown file. */
export function readTaskTrackerFiles() {
  return listFiles(P.taskTracker, (f) => f.endsWith('.md')).map((file) => ({
    path: file,
    blocks: parseLabeledBlocks(readFileSafe(file) || ''),
    raw: readFileSafe(file) || '',
  }));
}

/** Priority answers: one record per markdown file, member from folder name. */
export function readPriorityAnswerFiles() {
  const out = [];
  const dirs = listFiles(P.priorityQuestionsDir).filter((d) => d.endsWith('_answers'));
  for (const dir of dirs) {
    const memberSlug = path.basename(dir).replace(/_answers$/, '');
    for (const file of listFiles(dir, (f) => f.endsWith('.md'))) {
      out.push({
        path: file,
        memberSlug,
        blocks: parseLabeledBlocks(readFileSafe(file) || ''),
      });
    }
  }
  return out;
}

/** Answered-qid ledger: Set of question codes marked answered. */
export function readAnsweredQids() {
  const text = readFileSafe(P.answeredLedger) || '';
  const set = new Set();
  for (const line of text.split('\n')) {
    const m = line.match(/\bQ-[A-Z0-9-]+\b/);
    if (m) set.add(m[0]);
  }
  return set;
}

/** AI-generated priority questions: parse `### Q-AI-#### — title` blocks. */
export function readGeneratedQuestions() {
  const text = (readFileSafe(P.generatedQuestions) || '').replace(/\r\n/g, '\n');
  const headRe = /^###\s+(Q-[A-Z0-9-]+)\s+—\s+(.+?)\s*$/gm;
  const heads = [...text.matchAll(headRe)];
  const out = [];
  for (let i = 0; i < heads.length; i += 1) {
    const code = heads[i][1];
    const title = heads[i][2].trim();
    const start = heads[i].index + heads[i][0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : text.length;
    const body = text.slice(start, end);
    out.push({
      questionCode: code,
      title,
      status: field(body, /\*\*Status:\*\*\s*(.+)/),
      priority: field(body, /\*\*6\.\s*Priority\*\*\s*[—-]\s*(.+)/),
      employee: field(body, /\*\*Employee:\*\*\s*(.+)/),
      shortQuestion: field(body, /\*\*1\.\s*Short Question\*\*\s*[—-]\s*(.+)/),
      body: body
        .replace(/\*\*[^*]+\*\*\s*[—-]?[^\n]*\n?/g, '')
        .trim(),
    });
  }
  return out;
}

/** Meeting uploads: one record per markdown file. */
export function readMeetingFiles() {
  return listFiles(P.meetings, (f) => f.endsWith('.md')).map((file) => ({
    path: file,
    blocks: parseLabeledBlocks(readFileSafe(file) || ''),
  }));
}

/** Team-member governance profiles: memberKey from filename + table fields. */
export function readTeamMemberProfiles() {
  return listFiles(P.teamMembers, (f) => /^team-member-.*\.md$/.test(f)).map((file) => {
    const base = path.basename(file).replace(/^team-member-/, '').replace(/\.md$/, '');
    const memberKey = base.replace(/-/g, '_');
    const raw = readFileSafe(file) || '';
    return {
      path: file,
      memberKey,
      fullName: tableCell(raw, 'Member Name') || headingName(raw) || deSlug(base),
      title: tableCell(raw, 'Role / Title') || tableCell(raw, 'Role'),
      departments: splitList(tableCell(raw, 'Department(s)') || tableCell(raw, 'Departments')),
      reportsTo: tableCell(raw, 'Reports To'),
    };
  });
}

// ---- helpers ----
function field(body, re) { const m = body.match(re); return m ? m[1].trim() : undefined; }
function tableCell(raw, label) {
  const re = new RegExp(`\\|\\s*\\*\\*${escapeRe(label)}\\*\\*\\s*\\|\\s*([^|]+?)\\s*\\|`, 'i');
  const m = raw.match(re);
  return m ? m[1].trim() : undefined;
}
function headingName(raw) {
  const m = raw.match(/^#\s+Team Member Governance\s+—\s+(.+?)\s*$/m);
  return m ? m[1].trim() : undefined;
}
function splitList(s) {
  if (!s) return [];
  return s.split(/[,/]/).map((x) => x.trim()).filter((x) => x && x !== '—');
}
function deSlug(base) {
  return base.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'); }
