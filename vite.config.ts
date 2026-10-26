/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Caminhos relativos: funciona em localhost e em victin7.github.io/<repositório>
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // Torna o app instalável no celular (ícone na tela inicial, abre em tela cheia)
    VitePWA({
      registerType: 'autoUpdate', // nova versão publicada = atualiza sozinho
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Colevo — Crescemos juntos',
        short_name: 'Colevo',
        description: 'A turma organizada junto: provas, entregas, matérias e materiais em salas com código e senha.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // a cena 3D tem ~900 KB
        navigateFallback: 'index.html',
        // A página de apresentação é um site à parte: o service worker não deve trocá-la pelo app
        navigateFallbackDenylist: [/\/apresentacao\//],
      },
    }),
  ],
  // A cena 3D (Three.js) é um chunk carregado sob demanda; o tamanho é esperado.
  build: { chunkSizeWarningLimit: 1000 },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
