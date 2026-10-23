import { describe, expect, it } from 'vitest'
import { gerarMes } from './mes'

describe('gerarMes', () => {
  it('outubro de 2026 começa numa quinta e ocupa 5 semanas', () => {
    const semanas = gerarMes(2026, 9)
    expect(semanas).toHaveLength(5)
    expect(semanas[0][0].data.getDate()).toBe(27)   // domingo, 27/09
    expect(semanas[0][0].doMes).toBe(false)
    expect(semanas[0][4].data.getDate()).toBe(1)    // quinta, 01/10
    expect(semanas[0][4].doMes).toBe(true)
  })

  it('usa 6 semanas quando o mês precisa', () => {
    // Agosto de 2026 começa num sábado e tem 31 dias
    expect(gerarMes(2026, 7)).toHaveLength(6)
  })

  it('toda semana tem 7 dias e os dias são consecutivos', () => {
    const dias = gerarMes(2026, 1).flat()
    dias.forEach((d, i) => {
      if (i === 0) return
      const diff = (d.data.getTime() - dias[i - 1].data.getTime()) / 86_400_000
      expect(Math.round(diff)).toBe(1)
    })
  })
})
