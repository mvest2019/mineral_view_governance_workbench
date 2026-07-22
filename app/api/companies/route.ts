import { COMPANIES } from '@/lib/config';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(() =>
  json(
    Object.entries(COMPANIES).map(([k, v]) => ({
      key: k,
      name: v.name_full,
      gh_account: v.gh_account,
    })),
  ),
);
