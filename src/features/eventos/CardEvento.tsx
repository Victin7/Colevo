import { Tilt } from '../../components/Tilt'
import { Cartao, PontoCor } from '../../components/ui'
import type { Enums } from '../../lib/database.types'
import { horaCurta, semHora } from '../../lib/datas'
import { linkGoogleAgenda } from './agenda-externa'
import type { Evento } from './api'
import { contagem } from './contagem'
import { statusDoPrazo, type Urgencia } from './prazo'

/** Cada urgência tem cor de selo, de "brilho" atrás do card e do bloco de data. */
export const visualUrgencia: Record<Urgencia, { selo: string; brilho: string; bloco: string }> = {
  atrasado: { selo: 'bg-zinc-800 text-zinc-400', brilho: 'shadow-none', bloco: 'from-zinc-600 to-zinc-700 text-zinc-200' },
  hoje: { selo: 'bg-red-500/20 text-red-300', brilho: 'shadow-[0_0_40px_-12px_rgba(248,113,113,0.8)]', bloco: 'from-red-400 to-rose-500 text-zinc-950' },
  urgente: { selo: 'bg-orange-500/20 text-orange-300', brilho: 'shadow-[0_0_40px_-14px_rgba(251,146,60,0.7)]', bloco: 'from-orange-300 to-amber-400 text-zinc-950' },
  proximo: { selo: 'bg-yellow-500/20 text-yellow-200', brilho: 'shadow-[0_0_36px_-16px_rgba(250,204,21,0.6)]', bloco: 'from-yellow-200 to-lime-300 text-zinc-950' },
  tranquilo: { selo: 'bg-emerald-500/20 text-emerald-300', brilho: 'shadow-[0_0_36px_-18px_rgba(52,211,153,0.6)]', bloco: 'from-emerald-300 to-teal-400 text-zinc-950' },
}

export const rotulosTipo: Record<Enums<'tipo_evento'>, string> = { prova: 'Prova', entrega: 'Entrega', apresentacao: 'Apresentação' }
export const iconesTipo: Record<Enums<'tipo_evento'>, string> = { prova: '📝', entrega: '📦', apresentacao: '🎤' }

interface Props {
  evento: Evento
  agora: Date
  feito: boolean
  podeApagar: boolean
  nomeSala: string
  aoAlternarFeito: () => void
  aoApagar: () => void
}

export function CardEvento({ evento: ev, agora, feito, podeApagar, nomeSala, aoAlternarFeito, aoApagar }: Props) {
  const status = statusDoPrazo(ev.prazo, agora)
  const v = visualUrgencia[feito ? 'tranquilo' : status.urgencia]
  const falta = feito ? null : contagem(ev.prazo, agora)
  const cor = ev.materia?.cor

  return (
    <Tilt className={`rounded-2xl ${feito ? '' : v.brilho}`}>
      <Cartao className={`flex items-center gap-3 sm:gap-4 ${feito || status.urgencia === 'atrasado' ? 'opacity-60' : ''}`}>
        {/* Bloco de data "sai" do card em direção à tela */}
        <div className={`profundidade-2 grid w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br py-2 leading-none shadow-xl shadow-black/40 ${v.bloco}`}>
          <span className="text-2xl font-black">{ev.prazo.getDate()}</span>
          <span className="mt-1 text-[11px] font-semibold uppercase">{ev.prazo.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
        </div>

        <div className="profundidade-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
            <span>{iconesTipo[ev.tipo]} {rotulosTipo[ev.tipo]}</span>
            {ev.materia && (
              <span className="flex min-w-0 items-center gap-1.5 normal-case tracking-normal" style={{ color: cor }}>
                <PontoCor cor={cor!} /> <span className="truncate">{ev.materia.nome}</span>
              </span>
            )}
          </div>
          <p className={`truncate font-medium ${feito ? 'line-through decoration-emerald-400/70' : ''}`}>{ev.titulo}</p>
          <p className="text-sm text-zinc-500">
            <span className="capitalize">{ev.prazo.toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
            {!semHora(ev.prazo) && <> · {horaCurta(ev.prazo)}</>}
            {ev.materia?.professor && <span className="hidden sm:inline"> · {ev.materia.professor}</span>}
          </p>
          {ev.descricao && <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{ev.descricao}</p>}
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <a href={linkGoogleAgenda({ ...ev, materia: ev.materia?.nome }, nomeSala)} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-blue-300">
              📅 Google Agenda
            </a>
            {podeApagar && (
              <button onClick={aoApagar} className="text-zinc-500 hover:text-red-300">🗑 Apagar</button>
            )}
          </div>
        </div>

        <div className="profundidade-1 flex shrink-0 flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${feito ? 'bg-emerald-500/20 text-emerald-300' : v.selo}`}>
            {feito ? 'feito ✓' : falta ?? status.texto}
          </span>
          <button
            onClick={aoAlternarFeito}
            aria-pressed={feito}
            className={`rounded-lg border px-2.5 py-1 text-xs transition ${feito ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-white/10 text-zinc-400 hover:border-emerald-400/40 hover:text-emerald-300'}`}
          >
            {feito ? '✓ Já fiz' : 'Marcar feito'}
          </button>
        </div>
      </Cartao>
    </Tilt>
  )
}
