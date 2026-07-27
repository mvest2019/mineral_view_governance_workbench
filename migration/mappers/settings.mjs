// settings mapper (dry-run). Source: local_settings.json (git-ignored runtime
// state; often absent). Secrets are flagged (value redacted → secret manager),
// never migrated raw.
import path from 'path';
import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG, REPO_ROOT } from '../config.mjs';
import { readLocalSettings } from '../readers/config.mjs';

const SECRET_RE = /(key|token|secret|password)/i;

export function dryRun(ctx) {
  const report = createCollectionReport('settings');
  const settingsPath = path.join(REPO_ROOT, 'local_settings.json');
  report.sources = ['local_settings.json'];
  const pairs = readLocalSettings(settingsPath);
  if (!pairs.length) {
    report.sourceAvailable = false;
    report.warnings.push('local_settings.json is absent/empty (git-ignored runtime state) — no settings to migrate here.');
    return report;
  }

  const companyKey = MIGRATION_CONFIG.companyKey;
  const dupes = createDuplicateTracker();
  for (const { key, value } of pairs) {
    report.recordsRead += 1;
    if (dupes.check(`APP|${companyKey}|${key}`, key).duplicate) { report.duplicateRecords += 1; continue; }
    const isSecret = SECRET_RE.test(key);
    const candidate = {
      companyKey,
      scope: 'APP',
      ownerKey: companyKey,
      key,
      value: isSecret ? '[REDACTED — stored in secret manager]' : value,
      isSecret,
      metadata: { legacy: { source: 'local_settings.json' } },
    };
    const v = validateDocument('settings', candidate);
    if (v.ok) {
      report.validRecords += 1; report.estimatedDocuments += 1;
      if (ctx && ctx.sink) ctx.sink('settings', candidate, { scope: 'APP', ownerKey: companyKey, key });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1; v.errors.forEach((e) => report.errors.push(`${key}: ${e}`));
    }
  }
  return report;
}
