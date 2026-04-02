import React from 'react'
import ReactDOM from 'react-dom/client'
import Renew from './Renew.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Renew />
  </React.StrictMode>,
)

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/renew/sw.js').catch(() => {});
  });
}
