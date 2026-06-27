import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: process.env.PORT ? parseInt(process.env.PORT) : 3000, host: true },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react:   ['react', 'react-dom', 'react-router-dom'],
          xlsx:    ['xlsx'],
          pdfjs:   ['pdfjs-dist'],
        }
      }
    }
  }
})
