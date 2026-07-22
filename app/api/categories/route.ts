import { REPO_CATEGORIES } from '@/lib/config';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(() => json(REPO_CATEGORIES));
