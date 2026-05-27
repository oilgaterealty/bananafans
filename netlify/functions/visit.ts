import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

/**
 * POST /api/visit -> /.netlify/functions/visit
 *
 * Increments the shared visitor count by 1 and returns the new count.
 * Persistence: Netlify Blobs (key-value store, auto-wired in Netlify env).
 */

// Initial baseline used the first time the store has no value.
// Matches CONFIGURABLE_STARTING_NUMBER in src/App.tsx.
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
    const safeCurrent = Number.isFinite(n) ? n : BASELINE;
    const next = safeCurrent + 1;
    await store.set(KEY, String(next));
    return jsonResponse(200, { count: next });
  } catch (err: any) {
    console.error('[visit] increment failed:', err?.message || err);
    return jsonResponse(500, { error: 'Failed to increment counter' });
  }
};
