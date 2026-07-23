// Intake document type + edge (DTO) validation.
//
// Implements docs/MONGODB_V1_SPECIFICATION.md §3.13. The intake pipeline
// (upload → AI review → gates → advance) modeled as ONE document with EMBEDDED
// files / links / gates / stage history (not a generalized workflow engine).
// Extends BaseDocument. Phase 6 defines shape + pure validators only; no I/O.

import type { BaseDocument } from '@/src/models/base';
import { APPROVAL_STATUS, type ApprovalStatus } from '@/src/constants/enums';

export interface IntakeFile {
  filename: string;
  storageRef?: { provider?: string; bucket?: string; key?: string };
  sizeBytes?: number;
}

export interface IntakeLink {
  kind: string;
  ref: string;
}

export interface IntakeGate {
  name: string;
  status: ApprovalStatus;
  approverKey?: string;
  decidedAt?: Date | null;
  note?: string;
}

export interface IntakeStageEvent {
  stage: string;
  at: Date;
  actorKey?: string;
  note?: string;
}

/** An Intake as stored in GovernanceDB.intakes. */
export interface IntakeDoc extends BaseDocument {
  /** → employees.memberKey (submitter). */
  employeeKey?: string;
  sourceType?: string;
  aiEngines: string[];
  note?: string;
  /** Current workflow stage (free label, default "Uploaded"). */
  stage: string;
  blocker?: string;
  files: IntakeFile[];
  links: IntakeLink[];
  gates: IntakeGate[];
  stageHistory: IntakeStageEvent[];
}

export interface CreateIntakeInput {
  employeeKey?: string;
  sourceType?: string;
  aiEngines?: string[];
  note?: string;
  stage?: string;
  blocker?: string;
  files?: IntakeFile[];
  links?: IntakeLink[];
  gates?: Array<Partial<IntakeGate> & { name: string }>;
}

export type UpdateIntakeInput = Partial<CreateIntakeInput>;

const EMPLOYEE_KEY_RE = /^[a-z0-9]+(_[a-z0-9]+)*$/;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateCreateIntakeInput(input: CreateIntakeInput): ValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { ok: false, errors: ['input must be an object'] };
  if (input.employeeKey !== undefined && !EMPLOYEE_KEY_RE.test(String(input.employeeKey))) {
    errors.push('employeeKey, when provided, must be a lowercase slug');
  }
  if (input.stage !== undefined && (typeof input.stage !== 'string' || input.stage.trim().length === 0)) {
    errors.push('stage, when provided, must be a non-empty string');
  }
  (input.gates ?? []).forEach((g, i) => {
    if (!g || typeof g.name !== 'string' || g.name.trim().length === 0) {
      errors.push(`gates[${i}].name is required`);
    }
    if (g?.status !== undefined && !APPROVAL_STATUS.includes(g.status)) {
      errors.push(`gates[${i}].status must be one of: ${APPROVAL_STATUS.join(', ')}`);
    }
  });
  return { ok: errors.length === 0, errors };
}

function normalizeGate(g: Partial<IntakeGate> & { name: string }): IntakeGate {
  return {
    name: g.name,
    status: g.status ?? 'NOT_STARTED',
    approverKey: g.approverKey,
    decidedAt: g.decidedAt ?? null,
    note: g.note,
  };
}

export function toIntakeFields(
  input: CreateIntakeInput,
): Omit<IntakeDoc, keyof BaseDocument | '_id'> {
  return {
    employeeKey: input.employeeKey,
    sourceType: input.sourceType,
    aiEngines: input.aiEngines ?? [],
    note: input.note,
    stage: input.stage ?? 'Uploaded',
    blocker: input.blocker,
    files: input.files ?? [],
    links: input.links ?? [],
    gates: (input.gates ?? []).map(normalizeGate),
    stageHistory: [],
  };
}
