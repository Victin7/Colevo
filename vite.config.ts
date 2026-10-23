/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Caminhos relativos: funciona em localhost e em victin7.github.io/turma-ads
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
  },
})
