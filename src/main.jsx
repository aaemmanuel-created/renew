import React from 'react'
import ReactDOM from 'react-dom/client'
import Renew from './Renew.jsx'

// Bug 5 fix: Remove StrictMode — canvas/audio apps break with double-mounting
ReactDOM.createRoot(document.getElementById('root')).render(
  <Renew />
)

// #24 fix: Removed duplicate SW/cache clearing — already runs in index.html inline script (earliest possible)

// Bug 6 fix: Check for app updates (PWA cache-busting on iPhone)
// v2026.05.15a fix: guard with sessionStorage so the check can only reload once
// per tab session. Without this, a GH Pages CDN that serves a stale index.html
// (referencing a bundle hash different from the one actually loaded) caused an
// infinite reload loop every ~2s on production.
if (navigator.onLine && !sessionStorage.getItem('renew_bundle_reload_attempted')) {
  setTimeout(() => {
    fetch('/renew/index.html?_=' + Date.now(), { cache: 'no-store' })
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
