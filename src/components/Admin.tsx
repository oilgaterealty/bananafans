import React, { useEffect, useState } from 'react';

/**
 * Admin — private read-only visitor count view.
 *
 * Lives at /admin?key=oilgate-private-count.
 *
 * - Reads the shared visitor count only (GET /api/visit-count).
 * - NEVER calls /api/visit, so it cannot increment the counter.
 * - Renders nothing but the number itself when the key is valid,
 *   or the words "Access Denied" when it is missing or wrong.
 * - No labels, logos, charts, buttons, links, or navigation.
 */

const ADMIN_KEY = 'oilgate-private-count';

export const Admin: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  const params = new URLSearchParams(window.location.search);
  const isAuthorized = params.get('key') === ADMIN_KEY;

  useEffect(() => {
    if (!isAuthorized) return;
    let cancelled = false;

    (async () => {
      try {
        // READ ONLY. Never POST. The increment endpoint is /api/visit
        // and must never be called from this page.
        const res = await fetch('/api/visit-count', { method: 'GET' });
        if (!res.ok) throw new Error('bad response');
        const data = await res.json();
        const n = Number(data?.count);
        if (!Number.isFinite(n)) throw new Error('bad number');
        if (!cancelled) setCount(n);
      } catch {
        if (!cancelled) setError(true);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div style={containerStyle}>
        <div style={deniedStyle}>Access Denied</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={numberStyle}>
        {error
          ? '—'
          : count === null
            ? ''
            : count.toLocaleString()}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#000000',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const numberStyle: React.CSSProperties = {
  color: '#f5c542',
  fontWeight: 800,
  fontSize: 'clamp(80px, 18vw, 280px)',
  letterSpacing: '-0.02em',
  lineHeight: 1,
  textAlign: 'center',
  userSelect: 'text',
};

const deniedStyle: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 500,
  fontSize: 'clamp(20px, 3vw, 32px)',
  textAlign: 'center',
  letterSpacing: '0.02em',
};
