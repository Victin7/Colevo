import { describe, expect, it } from 'vitest'
import { erroNoNome, limparNome, pareceEmail } from './nome'

describe('nome do perfil', () => {
  it('tira espaços sobrando', () => {
    expect(limparNome('  Victor   Anjos ')).toBe('Victor Anjos')
  })

  it('recusa nome curto demais ou longo demais', () => {
    expect(erroNoNome(' a ')).toMatch(/pelo menos/)
    expect(erroNoNome('x'.repeat(41))).toMatch(/no máximo/)
    expect(erroNoNome('Carol')).toBeNull()
  })

  it('reconhece nome que veio do e-mail', () => {
    expect(pareceEmail('victor.anjos1011')).toBe(true)
    expect(pareceEmail('joao_silva')).toBe(true)
    expect(pareceEmail('Victor Anjos')).toBe(false)
    expect(pareceEmail('Carol')).toBe(false)
  })
})
