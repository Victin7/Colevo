import { test } from '@playwright/test'
import { prepararMock } from './mock'

/**
 * Gera os prints do README. Só roda com CAPTURAS=1:
 *   CAPTURAS=1 npx playwright test capturas
 */
test.skip(!process.env.CAPTURAS, 'só gera prints quando CAPTURAS=1')

const pasta = 'docs/prints'

test('prints', async ({ page }, info) => {
  const sufixo = info.project.name
  await prepararMock(page)
  await page.addInitScript(() => document.documentElement.classList.add('sem-animacao-entrada'))

  await page.goto('./')
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${pasta}/salas-${sufixo}.jpg`, quality: 82 })

  await page.goto('./#/sala/s1')
  await page.waitForTimeout(2500)
  const card = page.locator('li.entrar-3d').filter({ hasText: 'Projeto integrador' }).last()
  const caixa = await card.boundingBox()
  if (caixa && sufixo === 'desktop') await page.mouse.move(caixa.x + caixa.width * 0.85, caixa.y + caixa.height * 0.2)
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${pasta}/agenda-${sufixo}.jpg`, quality: 82 })

  await page.goto('./#/sala/s1?aba=calendario')
  await page.waitForTimeout(2000)
  await page.evaluate(() => window.scrollTo(0, 330))
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${pasta}/calendario-${sufixo}.jpg`, quality: 82 })

  await page.goto('./#/sala/s1?aba=materias')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${pasta}/materias-${sufixo}.jpg`, quality: 82 })

  await prepararMock(page, { semSalas: true })
  await page.goto('./#/?codigo=K7QX2M')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${pasta}/entrar-${sufixo}.jpg`, quality: 82 })
})

test('print do login', async ({ page }, info) => {
  await prepararMock(page, { logado: false })
  await page.goto('./')
  await page.waitForTimeout(2500)
  await page.screenshot({ path: `${pasta}/login-${info.project.name}.jpg`, quality: 82 })
})
