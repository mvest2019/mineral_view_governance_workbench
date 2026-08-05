// Source Material persistence seam (MongoDB only).
//
// The Source Material feature saves uploaded Markdown files to
// GovernanceDB.sourceMaterials and reads them back. MongoDB is the ONLY store —
// there is no GitHub/markdown/SQLite path. Throws when MongoDB/the bridge is
// unavailable so the API returns a proper error (503) instead of failing
// silently. Fully isolated: touches only the sourceMaterials collection.

import { mongoEnabled } from '@/lib/mongo_bridge';

const COMPANY_DEFAULT = 'MView';

function companyKeyOf(company?: string | null): string {
  return (company && String(company).trim()) || COMPANY_DEFAULT;
}

export interface SaveSourceMaterialInput {
  company?: string | null;
  employeeKey: string;
  employeeName?: string;
  fileName: string;
  content: string;
  uploadedBy?: string;
}

export interface SavedSourceMaterial {
  id: string;
  fileName: string;
  uploadedAt: string;
}

/** Persist one uploaded Markdown file. Throws if MongoDB is unavailable. */
export async function saveSourceMaterial(input: SaveSourceMaterialInput): Promise<SavedSourceMaterial> {
  if (!mongoEnabled()) {
    throw new Error('MongoDB is not configured (set MONGODB_BRIDGE_URL or MONGODB_URI).');
  }
  const companyKey = companyKeyOf(input.company);
  const { SourceMaterialService } = await import('@/src/services/source_material.service');
  const { SourceMaterialRepository } = await import('@/src/repositories/source_material.repository');
  const svc = new SourceMaterialService(new SourceMaterialRepository({ companyKey }));

  const employeeName = (input.employeeName || input.employeeKey || '').replace(/_+/g, ' ').trim();
  const actor = input.uploadedBy?.trim() || input.employeeKey || 'system';
  const doc = await svc.createSourceMaterial(
    {
      employeeKey: input.employeeKey,
      employeeName,
      fileName: input.fileName,
      originalFileName: input.fileName,
      content: input.content,
      uploadedBy: input.uploadedBy,
    },
    actor,
  );
  return { id: String(doc._id), fileName: doc.fileName, uploadedAt: doc.uploadedAt.toISOString() };
}

export interface SourceMaterialSummary {
  id: string;
  employeeKey: string;
  employeeName: string;
  fileName: string;
  contentBytes: number;
  uploadedAt: string;
  status: string;
}

/** List recent uploads for a company (newest first). Throws if MongoDB is unavailable. */
export async function listSourceMaterials(company?: string | null, limit = 50): Promise<SourceMaterialSummary[]> {
  if (!mongoEnabled()) {
    throw new Error('MongoDB is not configured (set MONGODB_BRIDGE_URL or MONGODB_URI).');
  }
  const companyKey = companyKeyOf(company);
  const { SourceMaterialRepository } = await import('@/src/repositories/source_material.repository');
  const repo = new SourceMaterialRepository({ companyKey });
  const docs = await repo.listRecent(limit);
  return docs.map((d) => ({
    id: String(d._id),
    employeeKey: d.employeeKey,
    employeeName: d.employeeName,
    fileName: d.fileName,
    contentBytes: d.contentBytes,
    uploadedAt: d.uploadedAt instanceof Date ? d.uploadedAt.toISOString() : String(d.uploadedAt),
    status: d.status,
  }));
}
