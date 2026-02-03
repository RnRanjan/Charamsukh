import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Charamsukh/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-404',
      generateBundle() {
        if (process.env.NODE_ENV === 'production') {
          try {
            copyFileSync(
              resolve(__dirname, 'public/404.html'),
              resolve(__dirname, 'dist/404.html')
            )
          } catch (err) {
            console.warn('Could not copy 404.html:', err)
          }
        }
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
