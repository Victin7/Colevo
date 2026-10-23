import { differenceInCalendarDays } from 'date-fns'

export interface EventoLembravel {
  id: string
  titulo: string
  prazo: Date
}

/**
 * Quais provas merecem um lembrete agora: as que não estão feitas,
 * ainda não venceram e caem dentro da janela de dias que o aluno escolheu.
 */
export function eventosParaLembrar<T extends EventoLembravel>(
  eventos: T[],
  concluidos: Set<string>,
  diasAntes: number[],
  agora: Date = new Date(),
): (T & { dias: number })[] {
  const janela = Math.max(0, ...diasAntes)
  return eventos
    .filter((e) => !concluidos.has(e.id) && e.prazo.getTime() > agora.getTime())
    .map((e) => ({ ...e, dias: differenceInCalendarDays(e.prazo, agora) }))
    .filter((e) => e.dias <= janela)
    .sort((a, b) => a.prazo.getTime() - b.prazo.getTime())
}

/** Chave para não notificar a mesma prova duas vezes no mesmo dia. */
export function chaveNotificacao(eventoId: string, agora: Date = new Date()): string {
  return `notificado:${eventoId}:${agora.toDateString()}`
}
