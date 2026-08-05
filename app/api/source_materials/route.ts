import { NextRequest } from 'next/server';
import { json, route } from '@/lib/http';
import { saveSourceMaterial, listSourceMaterials } from '@/lib/source_materials_mongo';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Isolated Source Material API. Stores uploaded Markdown files in
// GovernanceDB.sourceMaterials only. It does not touch any other collection,
// route, or feature.

// Guard against absurdly large payloads (Markdown files are small). 12 MB.
const MAX_CONTENT_BYTES = 12 * 1024 * 1024;

/** GET /api/source_materials?company=MView → recent uploads (newest first). */
export const GET = route(async (req: NextRequest) => {
  const company = req.nextUrl.searchParams.get('company');
  try {
    const items = await listSourceMaterials(company);
    return json(items);
  } catch (err) {
    return json(
      { error: 'Unable to load source materials from MongoDB', detail: err instanceof Error ? err.message : String(err) },
      503,
    );
  }
});

/** POST /api/source_materials → save one uploaded Markdown file. */
export const POST = route(async (req: NextRequest) => {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const employeeKey = String(body.employee ?? body.employeeKey ?? '').trim();
  const employeeName = String(body.employeeName ?? '').trim();
  const fileName = String(body.fileName ?? '').trim();
  const content = typeof body.content === 'string' ? body.content : '';

  // Validation (mirrors the UI; returns 400 so the page can show the message).
  if (!employeeKey) return json({ error: 'Please select an employee.' }, 400);
  if (!fileName || !/\.md$/i.test(fileName)) return json({ error: 'A Markdown (.md) file is required.' }, 400);
  if (!content) return json({ error: 'The file is empty or could not be read.' }, 400);
  if (Buffer.byteLength(content, 'utf8') > MAX_CONTENT_BYTES) {
    return json({ error: 'File is too large (max 12 MB).' }, 413);
  }

  try {
    const saved = await saveSourceMaterial({ company: body.company as string, employeeKey, employeeName, fileName, content });
    return json({ ok: true, id: saved.id, fileName: saved.fileName, uploadedAt: saved.uploadedAt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isValidation = err instanceof Error && err.name === 'SourceMaterialValidationError';
    return json(
      { error: isValidation ? msg : 'Unable to save source material to MongoDB', detail: msg },
      isValidation ? 400 : 503,
    );
  }
});
