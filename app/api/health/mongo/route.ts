import { json, route } from '@/lib/http';
import { mongoHealthStatus } from '@/lib/mongo_required';

export const dynamic = 'force-dynamic';

// Read-only diagnostic: reports whether MongoDB (GovernanceDB) is configured,
// reachable, and whether mandatory mode (MONGO_REQUIRED) is on. Writes nothing.
// Additive route — does not affect any existing endpoint.
export const GET = route(async () => {
  const status = await mongoHealthStatus();
  return json(status, status.ok || !status.required ? 200 : 503);
});
