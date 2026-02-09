import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages base path (https://<user>.github.io/copilot-metrics/)
  base: '/copilot-metrics/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'GitHub Copilot Metrics - Accenture',
        short_name: 'Copilot Metrics',
        description: 'Dashboard ejecutivo de métricas de GitHub Copilot para Accenture',
        theme_color: '#A100FF',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/copilot-metrics/',
        start_url: '/copilot-metrics/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['business', 'productivity'],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '640x1136',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        globIgnores: ['**/ai-development*.png', '**/pwa-*.png', '**/apple-touch-icon*.png'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false  // Disabled in dev to prevent reload issues
      }
    })
  ],
  // Environment variables for WebSocket mode
  define: {
    // Set to 'true' to enable WebSocket mode, 'false' for polling mode
    // Can be overridden with VITE_USE_WEBSOCKET env var
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // GitHub API proxy (for polling mode)
      '/github-api': {
        target: 'https://bbva.ghe.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/github-api/, '/api/v3'),
        secure: false,
        headers: {
          'Origin': 'https://bbva.ghe.com'
        }
      },
      // Backend API proxy (for REST fallback)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      // WebSocket proxy
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
