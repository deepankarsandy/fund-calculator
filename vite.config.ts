/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { componentTagger } from 'component-tagger'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(
  ({ mode }) =>
    ({
      plugins: [
        react(),
        tailwindcss() as any,
        mode === 'development' &&
          componentTagger({
            includeId: true,
            includeName: false,
            developmentOnly: true,
            includeContent: false,
            includeFile: false,
            includeLine: false,
            includePath: false,
          }),
      ],
      server: {
        host: '0.0.0.0',
        port: 5173,
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      build: {
        target: 'esnext',
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (id.includes('node_modules')) {
                if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
                  return 'vendor-charts'
                }
                if (id.includes('lucide-react')) {
                  return 'vendor-icons'
                }
              }
            },
          },
        },
      },
      test: {
        environment: 'jsdom',
        globals: true,
      },
    }) as any
)
