import { getStore } from '@netlify/blobs';

/**
 * POST /api/visit -> /.netlify/functions/visit
 *
 * Increments the shared visitor count by 1 and returns the new count.
 * Persistence: Netlify Blobs (auto-wired in the Netlify runtime).
 *
 * Admin-only reset:
 *   POST /api/visit?reset=oilgate-private-count
 *   Sets the counter back to the BASELINE without incrementing.
 *   Same key that protects /admin. Lets the owner restore the testing
 *   baseline without exposing a separate, less-protected endpoint.
 */

// Initial baseline used the first time the store has no value, and the
// value the admin reset returns to. Matches CONFIGURABLE_STARTING_NUMBER
// in src/App.tsx.
const BASELINE = -1;
const STORE_NAME = 'bananafans-visitor-counter';
const KEY = 'count';
const RESET_KEY = 'oilgate-private-count';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export default async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const isReset = url.searchParams.get('reset') === RESET_KEY;

    const store = getStore({ name: STORE_NAME, consistency: 'strong' });

    if (isReset) {
      await store.set(KEY, String(BASELINE));
      return jsonResponse({ count: BASELINE, reset: true });
    }

    const current = await store.get(KEY);
    const parsed = current !== null && current !== undefined ? Number(current) : BASELINE;
    const safeCurrent = Number.isFinite(parsed) ? parsed : BASELINE;
    const next = safeCurrent + 1;
    await store.set(KEY, String(next));
    return jsonResponse({ count: next });
  } catch (err: any) {
    console.error('[visit] failed:', err?.name, err?.message || err);
    return jsonResponse({ error: 'Failed to update counter' }, 500);
  }
};
