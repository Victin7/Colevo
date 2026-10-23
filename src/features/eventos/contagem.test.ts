import { describe, expect, it } from 'vitest'
import { contagem } from './contagem'

const agora = new Date(2026, 9, 23, 15, 0)
const em = (min: number) => new Date(agora.getTime() + min * 60_000)

describe('contagem', () => {
  it('mostra horas e minutos quando falta menos de um dia', () => {
    expect(contagem(em(4 * 60 + 12), agora)).toBe('faltam 4h12')
    expect(contagem(em(3 * 60), agora)).toBe('faltam 3h')
  })

  it('mostra só minutos na última hora, arredondando para cima', () => {
    expect(contagem(em(35), agora)).toBe('faltam 35min')
    expect(contagem(new Date(agora.getTime() + 30_000), agora)).toBe('faltam 1min')
  })

  it('não mostra nada se faltar mais de 24h ou se já passou', () => {
    expect(contagem(em(25 * 60), agora)).toBeNull()
    expect(contagem(em(-5), agora)).toBeNull()
  })
})
