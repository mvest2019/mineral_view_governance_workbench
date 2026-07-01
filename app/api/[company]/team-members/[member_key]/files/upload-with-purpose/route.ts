import { NextRequest } from 'next/server';
import { abort, route } from '@/lib/http';
import { normalize_team_member_file_purpose } from '@/lib/helpers';
import { POST as filesCreatePost } from '@/app/api/team_member_files/route';

export const dynamic = 'force-dynamic';

export const POST = route(
  async (req: NextRequest, ctx: { params: Promise<{ company: string; member_key: string }> }) => {
    const { company } = await ctx.params;
    // Read the multipart form once; re-used for validation and for delegation.
    const form = await req.formData();
    const body_company = (form.get('company') as string | null) || company;
    if (body_company !== company) {
      abort(400, 'company mismatch');
    }
    normalize_team_member_file_purpose((form.get('file_purpose') as string | null) || '');
    if (!form.get('file_purpose')) {
      abort(400, 'file_purpose required');
    }
    // Delegate to api_team_member_files_create() with the same parsed form.
    // The create handler re-parses req.formData(); reconstruct a request that
    // exposes the already-read form.
    const delegated = new Request(req.url, {
      method: 'POST',
      headers: req.headers,
      body: form as any,
    }) as unknown as NextRequest;
    return filesCreatePost(delegated);
  },
);
