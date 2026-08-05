// intakes mapper (dry-run). Source: SQLite intake + intake_file + gate +
// workflow_event + link. Child rows are grouped by intake_id and embedded.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG, ENUMS } from '../config.mjs';
import { slugify, parseISTToUTC, upcaseEnum } from '../lib/utils.mjs';
import { readTable, sqliteAvailable } from '../readers/sqlite.mjs';

function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) {
    const k = r[key];
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
}

export async function dryRun(ctx) {
  const report = createCollectionReport('intakes');
  report.sources = ['SQLite: intake (+ intake_file, gate, workflow_event, link)'];
  if (!(await sqliteAvailable())) {
    report.sourceAvailable = false;
    report.warnings.push('SQLite governance.db not present — run where it exists to evaluate intakes.');
    return report;
  }
  const intakes = await readTable('intake');
  const filesByIntake = groupBy(await readTable('intake_file'), 'intake_id');
  const gatesByIntake = groupBy(await readTable('gate'), 'intake_id');
  const eventsByIntake = groupBy(await readTable('workflow_event'), 'intake_id');
  const linksByIntake = groupBy(await readTable('link'), 'intake_id');
  const dupes = createDuplicateTracker();

  for (const row of intakes) {
    report.recordsRead += 1;
    const sqliteId = `intake:${row.id}`;
    const gates = (gatesByIntake.get(row.id) || []).map((g) => {
      const st = upcaseEnum(g.status || 'NOT_STARTED', ENUMS.APPROVAL_STATUS);
      return {
        name: g.gate_name,
        status: st.ok ? st.value : 'NOT_STARTED',
        approverKey: g.approver ? slugify(g.approver) : undefined,
        decidedAt: parseISTToUTC(g.decided_at).date || null,
        note: g.note || undefined,
      };
    });
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      employeeKey: row.employee ? slugify(row.employee) : undefined,
      sourceType: row.source_type || undefined,
      aiEngines: String(row.ai_engines || '').split(',').map((s) => s.trim()).filter(Boolean),
      note: row.note || undefined,
      stage: row.stage || 'Uploaded',
      blocker: row.blocker || undefined,
      files: (filesByIntake.get(row.id) || []).map((f) => ({
        filename: f.filename,
        storageRef: { provider: 'local', key: f.saved_path },
        sizeBytes: f.size_bytes || undefined,
      })),
      links: (linksByIntake.get(row.id) || []).map((l) => ({ kind: l.kind, ref: l.ref })),
      gates,
      stageHistory: (eventsByIntake.get(row.id) || []).map((e) => ({
        stage: e.stage,
        at: parseISTToUTC(e.ts).date || new Date(0),
        actorKey: e.actor ? slugify(e.actor) : undefined,
        note: e.note || undefined,
      })),
      metadata: { legacy: { sqliteTable: 'intake', id: row.id, sqliteId } },
    };
    if (dupes.check(sqliteId, row.id).duplicate) { report.duplicateRecords += 1; continue; }
    const v = validateDocument('intakes', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('intakes', sqliteId);
      if (ctx && ctx.sink) ctx.sink('intakes', candidate, { 'metadata.legacy.sqliteId': sqliteId });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`intake ${row.id}: ${e}`));
    }
  }
  return report;
}
