import { COMPANIES } from '@/lib/config';
import { governance_context } from '@/lib/helpers';

type DB = import('better-sqlite3').Database;

/**
 * Port of check_gate_for_advance (governance_ui.py:4256).
 * Returns a blocking reason string, or null when the transition is allowed.
 */
export function check_gate_for_advance(
  db: DB,
  intake_id: number,
  target: string,
): string | null {
  const gates: Record<string, string> = {};
  for (const r of db.prepare('SELECT * FROM gate WHERE intake_id=?').all(intake_id) as any[]) {
    gates[r.gate_name] = r.status;
  }
  const rules: Record<string, [string, string]> = {
    'Decision Drafting': ['Findings Approved', 'Findings not yet approved'],
    'Awaiting Commit Approval': ['Decision Approved', 'Decision not yet approved'],
    Committed: ['Commit Approved', 'Commit gate not opened'],
    'Constitution Candidate': ['Commit Approved', 'Cannot enter constitution lane until commit approved'],
    'Constitution Approved': ['Constitution Eligible', 'Constitution gate not approved'],
  };
  if (target in rules) {
    const [gate_name, message] = rules[target];
    if (gates[gate_name] !== 'Approved') {
      return `${message} (gate: ${gate_name})`;
    }
  }
  return null;
}

/**
 * Port of build_claude_prompt (governance_ui.py:4271).
 */
export function build_claude_prompt(company: string, intake: any, files: any[]): string {
  const file_list = files.map((f) => `- ${f.filename}`).join('\n');
  const employee_line = intake.employee ? intake.employee : 'org-wide / none';
  return `You are analyzing a governance intake item for ${(COMPANIES as any)[company].name_full}.

Intake metadata:
- Intake ID: ${intake.id}
- Employee: ${employee_line}
- Source type: ${intake.source_type || 'document'}
- Note: ${intake.note || '(none)'}

Files in this intake:
${file_list}

${governance_context(company, 12000)}

Task:
1. Summarize what this intake appears to contain.
2. Identify candidate findings as FACT, PATTERN, INCONSISTENCY, or INFERENCE - mark INCONSISTENCY when the intake conflicts with the approved governance above.
3. Suggest whether anything should route to an employee-specific queue versus Ryan's org-wide queue.
4. Note any likely repo/business categories if the files support that.
5. Treat the governance corpus as authoritative; do not treat your own interpretation as approved governance truth.

Return concise markdown with these headings:
- Summary
- Candidate Findings
- Candidate Questions
- Suggested Routing
- Risks / Unknowns
`;
}
