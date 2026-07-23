// employees mapper (dry-run). Source: team-member profiles (G6) + config roster
// (C1). Builds candidate employee documents in memory, validates, dedupes.

import { createCollectionReport, addSample } from '../lib/report.mjs';
import { validateDocument } from '../lib/validation.mjs';
import { createDuplicateTracker } from '../lib/duplicates.mjs';
import { MIGRATION_CONFIG } from '../config.mjs';
import { slugify } from '../lib/utils.mjs';
import { readTeamMemberProfiles } from '../readers/github.mjs';
import { readConfigEmployeeKeys, configAvailable } from '../readers/config.mjs';

export function dryRun(ctx) {
  const report = createCollectionReport('employees');
  report.sources = ['Governance_Files/_GOVERNANCE/team_members/*.md', 'lib/config.ts'];

  const profiles = readTeamMemberProfiles();
  const configKeys = readConfigEmployeeKeys();
  if (!profiles.length && !configAvailable()) {
    report.sourceAvailable = false;
    return report;
  }

  // Merge roster: profile records are primary; add config-only members.
  const byKey = new Map();
  for (const p of profiles) {
    byKey.set(p.memberKey, {
      memberKey: p.memberKey,
      aliases: [],
      fullName: p.fullName,
      title: p.title,
      departmentKeys: (p.departments || []).map((d) => d.toUpperCase().replace(/[\s-]+/g, '_')),
      reportsToKey: p.reportsTo ? slugify(p.reportsTo) : undefined,
      status: 'ACTIVE',
      roleKeys: ['EMPLOYEE'],
      _legacy: { githubPath: p.path },
    });
  }
  for (const c of configKeys) {
    if (!byKey.has(c.memberKey)) {
      byKey.set(c.memberKey, {
        memberKey: c.memberKey,
        aliases: c.profileKey !== c.memberKey ? [c.profileKey] : [],
        fullName: c.profileKey.replace(/_/g, ' '),
        departmentKeys: [],
        status: 'ACTIVE',
        roleKeys: ['EMPLOYEE'],
        _legacy: { configKey: c.profileKey },
      });
    } else if (c.profileKey !== c.memberKey) {
      byKey.get(c.memberKey).aliases.push(c.profileKey);
    }
  }

  const dupes = createDuplicateTracker();
  for (const [memberKey, doc] of byKey) {
    report.recordsRead += 1;
    const dup = dupes.check(memberKey, memberKey);
    if (dup.duplicate) { report.duplicateRecords += 1; continue; }

    const candidate = { companyKey: MIGRATION_CONFIG.companyKey, ...doc };
    const v = validateDocument('employees', candidate);
    v.warnings.forEach((w) => report.warnings.push(`${memberKey}: ${w}`));
    if (v.ok) {
      report.validRecords += 1;
      report.estimatedDocuments += 1;
      if (ctx && ctx.crossref) ctx.crossref.register('employees', memberKey);
      if (ctx && ctx.sink) ctx.sink('employees', candidate, { memberKey });
      addSample(report, candidate);
    } else {
      report.invalidRecords += 1;
      v.errors.forEach((e) => report.errors.push(`${memberKey}: ${e}`));
    }
  }
  return report;
}
