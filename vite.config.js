import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace 'renew' with your actual GitHub repo name
  base: '/renew/',
})
