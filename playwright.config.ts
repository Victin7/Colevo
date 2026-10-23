import { defineConfig, devices } from '@playwright/test'

const PORTA = 4173

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORTA}/`,
    trace: 'retain-on-failure',
    // O service worker do PWA esconderia as requisições do mock
    serviceWorkers: 'block',
    launchOptions: {
      // Permite usar um Chromium já instalado (ex: CHROMIUM_PATH=/opt/pw-browsers/chromium)
      executablePath: process.env.CHROMIUM_PATH || undefined,
      // WebGL por software, para a cena 3D rodar em máquinas sem GPU (como o CI)
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // Build apontando para um Supabase falso (.env.e2e): os testes nunca tocam no banco real
    command: `npm run build:e2e && npx vite preview --port ${PORTA} --strictPort`,
    url: `http://localhost:${PORTA}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
