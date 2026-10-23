import { describe, expect, it } from 'vitest'
import { formatoUtc, gerarIcs, linkGoogleAgenda } from './agenda-externa'

const ev = { id: 'e1', titulo: 'P1', prazo: new Date(Date.UTC(2026, 10, 10, 22, 0)), materia: 'Banco de Dados', descricao: 'Capítulos 1, 2; e 3' }

describe('agenda externa', () => {
  it('formata datas em UTC compacto', () => {
    expect(formatoUtc(ev.prazo)).toBe('20261110T220000Z')
  })

  it('cria link do Google Agenda com 1h de duração terminando no prazo', () => {
    const url = new URL(linkGoogleAgenda(ev, 'ADS'))
    expect(url.searchParams.get('text')).toBe('P1 (Banco de Dados)')
    expect(url.searchParams.get('dates')).toBe('20261110T210000Z/20261110T220000Z')
  })

  it('gera .ics válido com alarmes e texto escapado', () => {
    const ics = gerarIcs([ev], 'ADS', new Date(Date.UTC(2026, 9, 23)))
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(ics).toContain('TRIGGER:-P1D')
    expect(ics).toContain('DESCRIPTION:Capítulos 1\\, 2\\; e 3')
    expect(ics.split('\r\n').filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(1)
  })
})
