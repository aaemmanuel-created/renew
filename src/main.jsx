import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import Renew from './Renew.jsx'

// Sentry — initialize before any React render so init errors are captured.
// DSN is a public client identifier (safe to ship in the bundle); the actual
// authorization for ingest is rate-limit/project-scoped on Sentry's end.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 0.0,
  })
}

// Bug 5 fix: Remove StrictMode — canvas/audio apps break with double-mounting
ReactDOM.createRoot(document.getElementById('root')).render(
  <Sentry.ErrorBoundary
    fallback={({ error, resetError }) => (
      <div style={{
        background: '#000', color: '#E8E8E8', width: '100%', height: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', padding: 32,
      }}>
        <div style={{ fontSize: 13, letterSpacing: 6, fontWeight: 700, marginBottom: 16 }}>RENEW</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 24, lineHeight: 1.6 }}>
          Something went wrong. The error was reported.
        </div>
        <button onClick={() => { resetError(); window.location.reload(); }} style={{
          background: 'linear-gradient(135deg, #7C6AFF 0%, #6355D8 100%)',
          color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 2,
        }}>RELOAD</button>
      </div>
    )}
  >
    <Renew />
  </Sentry.ErrorBoundary>
)

// Debug-only Sentry verification: visit any URL with ?sentryTest=1 to fire a
// test event 5s after mount. Lets preview-URL validation confirm wiring without
// polluting production. Search-param check is intentionally explicit so a typo
// is a no-op rather than a silent error.
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('sentryTest') === '1') {
  setTimeout(() => {
    throw new Error('Sentry test event from ?sentryTest=1 — wiring check, ignore.')
  }, 5000)
}

// #24 fix: Removed duplicate SW/cache clearing — already runs in index.html inline script (earliest possible)

// Bug 6 fix: Check for app updates (PWA cache-busting on iPhone)
// v2026.05.15a fix: guard with sessionStorage so the check can only reload once
// per tab session. Without this, a GH Pages CDN that serves a stale index.html
// (referencing a bundle hash different from the one actually loaded) caused an
// infinite reload loop every ~2s on production.
if (navigator.onLine && !sessionStorage.getItem('renew_bundle_reload_attempted')) {
  setTimeout(() => {
    fetch(import.meta.env.BASE_URL + 'index.html?_=' + Date.now(), { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        const match = html.match(/assets\/index-([^.]+)\.js/);
        const currentBundle = document.querySelector('script[type="module"]')?.src;
        if (match && currentBundle && !currentBundle.includes(match[1])) {
          sessionStorage.setItem('renew_bundle_reload_attempted', '1');
          window.location.reload();
        }
      })
      .catch(() => {});
  }, 2000);
}
