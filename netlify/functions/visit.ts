import { getStore } from '@netlify/blobs';

/**
 * POST /api/visit -> /.netlify/functions/visit
 *
 * Increments the shared visitor count by 1 and returns the new count.
 * Persistence: Netlify Blobs (key-value store, auto-wired in Netlify env).
 *
 * Uses the Netlify Functions v2 (Request/Response) format for cleaner
 * runtime context wiring than the legacy Handler format.
 */

// Initial baseline used the first time the store has no value.
// Matches CONFIGURABLE_STARTING_NUMBER in src/App.tsx.
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
    const safeCurrent = Number.isFinite(parsed) ? parsed : BASELINE;
    const next = safeCurrent + 1;
    await store.set(KEY, String(next));
    return jsonResponse({ count: next });
  } catch (err: any) {
    const message = err?.message || String(err);
    const name = err?.name || 'Error';
    console.error('[visit] increment failed:', name, message);
    return jsonResponse(
      { error: 'Failed to increment counter', name, message },
      500,
    );
  }
};
