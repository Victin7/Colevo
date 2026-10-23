import { differenceInCalendarDays } from 'date-fns'

export type Urgencia = 'atrasado' | 'hoje' | 'urgente' | 'proximo' | 'tranquilo'

export interface StatusPrazo {
  dias: number          // dias de calendário até o prazo (negativo = já passou)
  urgencia: Urgencia
  texto: string         // pronto para mostrar na tela
}

/**
 * Calcula quanto falta para um prazo e o quão urgente ele é.
 * Função pura: recebe "agora" como parâmetro para ser fácil de testar.
 */
export function statusDoPrazo(prazo: Date, agora: Date = new Date()): StatusPrazo {
  const dias = differenceInCalendarDays(prazo, agora)

  if (dias < 0) {
    const n = Math.abs(dias)
    return { dias, urgencia: 'atrasado', texto: n === 1 ? 'venceu ontem' : `venceu há ${n} dias` }
  }
  if (dias === 0) return { dias, urgencia: 'hoje', texto: 'é hoje!' }
  if (dias === 1) return { dias, urgencia: 'urgente', texto: 'amanhã' }
  if (dias <= 3) return { dias, urgencia: 'urgente', texto: `em ${dias} dias` }
  if (dias <= 7) return { dias, urgencia: 'proximo', texto: `em ${dias} dias` }
  return { dias, urgencia: 'tranquilo', texto: `em ${dias} dias` }
}

/** Ordena eventos: os que vencem primeiro vêm antes; atrasados vão para o fim. */
export function ordenarPorPrazo<T extends { prazo: Date }>(eventos: T[], agora: Date = new Date()): T[] {
  return [...eventos].sort((a, b) => {
    const aAtrasado = a.prazo < agora
    const bAtrasado = b.prazo < agora
    if (aAtrasado !== bAtrasado) return aAtrasado ? 1 : -1
    return a.prazo.getTime() - b.prazo.getTime()
  })
}
