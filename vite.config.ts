import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'https://ufcapp-nine.vercel.app'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{
    watch:{
      ignored: ['**/api/**']
    },
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@vercel/node'],
  },
})
