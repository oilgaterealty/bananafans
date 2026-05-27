import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {Admin} from './components/Admin.tsx';
import './index.css';

// Simple pathname-based routing.
// /admin renders the read-only visitor count view (no homepage logic mounts,
// so /admin can never trigger an increment of the shared counter).
// Everything else renders the public BananaFans page.
const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <Admin /> : <App />}
  </StrictMode>,
);
