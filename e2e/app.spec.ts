import { expect, test } from '@playwright/test'
import { prepararMock } from './mock'

test.describe('sem login', () => {
  test('mostra a tela de login e alterna para cadastro', async ({ page }) => {
    await prepararMock(page, { logado: false })
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'Turma ADS' })).toBeVisible()
    await page.getByText('Não tem conta? Cadastre-se').click()
    await expect(page.getByLabel('Seu nome')).toBeVisible()
  })
})

test.describe('logado', () => {
  test('lista as salas e abre a agenda com os prazos', async ({ page }) => {
    await prepararMock(page)
    await page.goto('./')
    await page.getByText('ADS 3º sem — Noite').click()
    await expect(page.getByRole('heading', { name: 'ADS 3º sem — Noite' })).toBeVisible()
    await expect(page.getByRole('paragraph').filter({ hasText: 'P1 — Modelagem de dados' })).toBeVisible()
    await expect(page.getByText(/faltam \d+h/)).toBeVisible() // contagem regressiva ao vivo
    await expect(page.getByText('1 de 5 feitos')).toBeVisible()
  })

  test('marcar como feito atualiza o progresso na hora', async ({ page }) => {
    await prepararMock(page)
    await page.goto('./#/sala/s1')
    await expect(page.getByText('1 de 5 feitos')).toBeVisible()
    await page.getByRole('button', { name: 'Marcar feito' }).first().click()
    await expect(page.getByText('2 de 5 feitos')).toBeVisible()
  })

  test('link de convite abre "Entrar na sala" com o código, e senha errada é recusada', async ({ page }) => {
    await prepararMock(page, { semSalas: true })
    await page.goto('./#/?codigo=K7QX2M')
    const dialogo = page.getByRole('dialog', { name: 'Entrar na sala' })
    await expect(dialogo.getByLabel('Código da sala')).toHaveValue('K7QX2M')
    await dialogo.getByLabel('Senha').fill('errada')
    await dialogo.getByRole('button', { name: 'Entrar' }).click()
    await expect(dialogo.getByRole('alert')).toHaveText('Código ou senha incorretos.')
    await dialogo.getByLabel('Senha').fill('amongus')
    await dialogo.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/#\/sala\/s1/)
  })

  test('criar sala mostra o código e a senha para compartilhar', async ({ page }) => {
    await prepararMock(page)
    await page.goto('./')
    await page.getByRole('button', { name: /Criar sala/ }).first().click()
    const dialogo = page.getByRole('dialog', { name: 'Criar sala' })
    await dialogo.getByLabel('Nome da sala').fill('Grupo do TCC')
    await dialogo.getByLabel(/Senha da sala/).fill('segredo')
    await dialogo.getByRole('button', { name: 'Criar sala' }).click()
    const criada = page.getByRole('dialog', { name: /Sala criada/ })
    await expect(criada.getByText('segredo')).toBeVisible()
    await expect(criada.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /NEW4ZZ/)
  })

  test('calendário, matérias, materiais e painel do líder', async ({ page }) => {
    await prepararMock(page)
    await page.goto('./#/sala/s1?aba=calendario')
    await expect(page.locator('.calendario-3d')).toBeVisible()
    await page.getByRole('button', { name: /Matérias/ }).click()
    await expect(page.getByText('Prof. Andrea')).toBeVisible()
    await page.getByRole('button', { name: /Materiais/ }).click()
    await expect(page.getByText('Resumo: formas normais')).toBeVisible()
    await page.getByRole('button', { name: /Membros/ }).click()
    await expect(page.getByText('Painel do líder')).toBeVisible()
  })
})
