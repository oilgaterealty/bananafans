import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

/**
 * GET /api/visit-count -> /.netlify/functions/visit-count
 *
 * Returns the current shared visitor count WITHOUT incrementing it.
 * Used by the homepage on repeat sessions and by /admin.
 */

const BASELINE = -1;
const STORE_NAME = 'bananafans-visitor-counter';
const KEY = 'count';

function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

export const handler: Handler = async () => {
  try {
    const store = getStore(STORE_NAME);
    const current = await store.get(KEY);
    const n = current !== null && current !== undefined ? Number(current) : BASELINE;
    const safe = Number.isFinite(n) ? n : BASELINE;
    return jsonResponse(200, { count: safe });
  } catch (err: any) {
    console.error('[visit-count] read failed:', err?.message || err);
    return jsonResponse(500, { error: 'Failed to read counter' });
  }
};
