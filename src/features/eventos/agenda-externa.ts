/**
 * Levar as provas para o Google Agenda / calendário do celular.
 * Assim o próprio celular avisa, mesmo com o app fechado.
 */

export interface EventoExportavel {
  id: string
  titulo: string
  prazo: Date
  materia?: string | null
  descricao?: string | null
}

/** 2026-11-10T22:30:00.000Z → "20261110T223000Z" (formato do Google e do .ics) */
export function formatoUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

const UMA_HORA = 60 * 60 * 1000

export function linkGoogleAgenda(ev: EventoExportavel, nomeSala: string): string {
  const inicio = new Date(ev.prazo.getTime() - UMA_HORA)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.materia ? `${ev.titulo} (${ev.materia})` : ev.titulo,
    dates: `${formatoUtc(inicio)}/${formatoUtc(ev.prazo)}`,
    details: [ev.descricao, `Sala: ${nomeSala} — Turma ADS`].filter(Boolean).join('\n'),
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

/** Escapa texto para o formato iCalendar (RFC 5545). */
function escaparIcs(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/** Arquivo .ics com todas as provas, cada uma com alarme 1 dia antes e 2 horas antes. */
export function gerarIcs(eventos: EventoExportavel[], nomeSala: string, agora: Date = new Date()): string {
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Turma ADS//PT-BR', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${escaparIcs(nomeSala)}`]
  for (const ev of eventos) {
    linhas.push(
      'BEGIN:VEVENT',
      `UID:${ev.id}@turma-ads`,
      `DTSTAMP:${formatoUtc(agora)}`,
      `DTSTART:${formatoUtc(new Date(ev.prazo.getTime() - UMA_HORA))}`,
      `DTEND:${formatoUtc(ev.prazo)}`,
      `SUMMARY:${escaparIcs(ev.materia ? `${ev.titulo} (${ev.materia})` : ev.titulo)}`,
      ...(ev.descricao ? [`DESCRIPTION:${escaparIcs(ev.descricao)}`] : []),
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Amanhã!', 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Daqui a pouco!', 'END:VALARM',
      'END:VEVENT',
    )
  }
  linhas.push('END:VCALENDAR')
  return linhas.join('\r\n')
}

export function baixarArquivo(conteudo: string, nome: string, tipo = 'text/calendar') {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  const a = Object.assign(document.createElement('a'), { href: url, download: nome })
  a.click()
  URL.revokeObjectURL(url)
}
