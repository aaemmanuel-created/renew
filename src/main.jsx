import React from 'react'
import ReactDOM from 'react-dom/client'
import Renew from './Renew.jsx'

// Bug 5 fix: Remove StrictMode — canvas/audio apps break with double-mounting
ReactDOM.createRoot(document.getElementById('root')).render(
  <Renew />
)

// Bug 1 fix: Unregister all service workers (old SW was caching stale builds)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister());
  });
}

// Fix 6: Clear orphaned caches (renew-v1 etc.) that persist after SW self-destruct
if (window.caches) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}

// Bug 6 fix: Check for app updates (PWA cache-busting on iPhone)
if (navigator.onLine) {
  setTimeout(() => {
    fetch('/renew/index.html?_=' + Date.now(), { cache: 'no-store' })
      .then(r => r.text())
      .then(html => {
        const match = html.match(/assets\/index-([^.]+)\.js/);
        const currentBundle = document.querySelector('script[type="module"]')?.src;
        if (match && currentBundle && !currentBundle.includes(match[1])) {
          window.location.reload();
        }
      })
      .catch(() => {});
  }, 2000);
}
