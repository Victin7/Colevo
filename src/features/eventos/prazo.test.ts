import { describe, expect, it } from 'vitest'
import { ordenarPorPrazo, statusDoPrazo } from './prazo'

// "Agora" fixo: sexta, 23/10/2026 às 20h (horário de aula da noite)
const agora = new Date(2026, 9, 23, 20, 0)
const dia = (d: number, h = 23, m = 59) => new Date(2026, 9, d, h, m)

describe('statusDoPrazo', () => {
  it('prazo hoje, mesmo que já seja de noite', () => {
    expect(statusDoPrazo(dia(23), agora)).toMatchObject({ dias: 0, urgencia: 'hoje', texto: 'é hoje!' })
  })

  it('conta dias de calendário, não 24h corridas', () => {
    // Amanhã às 8h faltam só 12h, mas para o aluno é "amanhã"
    expect(statusDoPrazo(dia(24, 8, 0), agora)).toMatchObject({ dias: 1, texto: 'amanhã' })
  })

  it('até 3 dias é urgente', () => {
    expect(statusDoPrazo(dia(26), agora).urgencia).toBe('urgente')
  })

  it('de 4 a 7 dias é próximo', () => {
    expect(statusDoPrazo(dia(27), agora).urgencia).toBe('proximo')
    expect(statusDoPrazo(dia(30), agora).urgencia).toBe('proximo')
  })

  it('mais de uma semana é tranquilo', () => {
    expect(statusDoPrazo(new Date(2026, 10, 10), agora)).toMatchObject({ urgencia: 'tranquilo', texto: 'em 18 dias' })
  })

  it('prazos vencidos', () => {
    expect(statusDoPrazo(dia(22), agora).texto).toBe('venceu ontem')
    expect(statusDoPrazo(dia(20), agora).texto).toBe('venceu há 3 dias')
  })
})

describe('ordenarPorPrazo', () => {
  it('próximos primeiro, atrasados no fim, sem alterar a lista original', () => {
    const lista = [
      { titulo: 'P1', prazo: dia(30) },
      { titulo: 'Trabalho atrasado', prazo: dia(20) },
      { titulo: 'Entrega amanhã', prazo: dia(24) },
    ]
    const ordenada = ordenarPorPrazo(lista, agora).map((e) => e.titulo)
    expect(ordenada).toEqual(['Entrega amanhã', 'P1', 'Trabalho atrasado'])
    expect(lista[0].titulo).toBe('P1')
  })
})
