import { describe, expect, it } from 'vitest'
import { eventosParaLembrar } from './lembretes'

const agora = new Date(2026, 9, 23, 10, 0)
const dia = (d: number, h = 23) => new Date(2026, 9, d, h, 59)

const eventos = [
  { id: 'hoje', titulo: 'Hoje', prazo: dia(23) },
  { id: 'amanha', titulo: 'Amanhã', prazo: dia(24) },
  { id: 'em5', titulo: 'Em 5', prazo: dia(28) },
  { id: 'vencido', titulo: 'Vencido', prazo: dia(22) },
  { id: 'feito', titulo: 'Feito', prazo: dia(24) },
]

describe('eventosParaLembrar', () => {
  it('pega o que vence dentro da janela, sem os feitos e sem os vencidos, em ordem', () => {
    const r = eventosParaLembrar(eventos, new Set(['feito']), [1, 3], agora)
    expect(r.map((e) => e.id)).toEqual(['hoje', 'amanha'])
    expect(r.map((e) => e.dias)).toEqual([0, 1])
  })

  it('janela de 7 dias inclui o de daqui a 5', () => {
    expect(eventosParaLembrar(eventos, new Set(), [7], agora).map((e) => e.id)).toContain('em5')
  })

  it('sem dias escolhidos, lembra só do que é hoje', () => {
    expect(eventosParaLembrar(eventos, new Set(), [], agora).map((e) => e.id)).toEqual(['hoje'])
  })
})
