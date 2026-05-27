import { getStore } from '@netlify/blobs';

/**
 * GET /api/visit-count -> /.netlify/functions/visit-count
 *
 * Returns the current shared visitor count WITHOUT incrementing or
 * mutating anything. Used by the homepage on repeat sessions and by
 * the /admin page. Strictly read-only.
 */

const BASELINE = -1;
const STORE_NAME = 'bananafans-visitor-counter';
const KEY = 'count';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export default async (): Promise<Response> => {
  try {
    const store = getStore({ name: STORE_NAME, consistency: 'strong' });
    const current = await store.get(KEY);
    const parsed = current !== null && current !== undefined ? Number(current) : BASELINE;
    const safe = Number.isFinite(parsed) ? parsed : BASELINE;
    return jsonResponse({ count: safe });
  } catch (err: any) {
    console.error('[visit-count] failed:', err?.name, err?.message || err);
    return jsonResponse({ error: 'Failed to read counter' }, 500);
  }
};
