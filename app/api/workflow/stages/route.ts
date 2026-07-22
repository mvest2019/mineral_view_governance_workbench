import { WORKFLOW_STAGES } from '@/lib/config';
import { json, route } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const GET = route(() => json(WORKFLOW_STAGES));
