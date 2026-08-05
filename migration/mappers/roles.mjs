// roles mapper (dry-run). Source: seed (the 5 V1 system roles). No source table.
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';

const SYSTEM_ROLES = [
  { key: 'SUPER_ADMIN', name: 'Super Admin' },
  { key: 'ADMIN', name: 'Admin' },
  { key: 'MANAGER', name: 'Manager' },
  { key: 'EMPLOYEE', name: 'Employee' },
  { key: 'VIEWER', name: 'Viewer' },
];

export function dryRun(ctx) {
  const report = createCollectionReport('roles');
  report.sources = ['seed: V1 system roles'];
  for (const r of SYSTEM_ROLES) {
    report.recordsRead += 1;
    const candidate = {
      companyKey: MIGRATION_CONFIG.companyKey,
      key: r.key,
      name: r.name,
      permissionKeys: [],
      isSystem: true,
      metadata: { legacy: { seed: 'system-role' } },
    };
    const v = validateDocument('roles', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('roles', r.key);
      if (ctx && ctx.sink) ctx.sink('roles', candidate, { key: r.key });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${r.key}: ${e}`));
    }
  }
  return report;
}
