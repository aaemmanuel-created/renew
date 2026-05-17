import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'pva-6m',
      project: 'renew',
      url: 'https://de.sentry.io/',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: { assets: './dist/**' },
      telemetry: false,
    }),
  ],
  // Replace 'renew' with your actual GitHub repo name
  base: '/renew/',
  build: {
    sourcemap: true,
  },
})
