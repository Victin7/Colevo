export interface DiaDoMes {
  data: Date
  doMes: boolean // false = dia do mês anterior/seguinte que completa a grade
}

/**
 * Monta a grade do mês em semanas completas (domingo a sábado),
 * como num calendário de parede. Sempre 5 ou 6 semanas.
 */
export function gerarMes(ano: number, mes: number): DiaDoMes[][] {
  const primeiro = new Date(ano, mes, 1)
  const inicio = new Date(ano, mes, 1 - primeiro.getDay()) // volta até o domingo
  const ultimo = new Date(ano, mes + 1, 0)
  const totalDias = primeiro.getDay() + ultimo.getDate()
  const semanas = Math.ceil(totalDias / 7)

  return Array.from({ length: semanas }, (_, s) =>
    Array.from({ length: 7 }, (_, d) => {
      const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + s * 7 + d)
      return { data, doMes: data.getMonth() === mes }
    }),
  )
}

export const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function nomeMes(ano: number, mes: number): string {
  const nome = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}
