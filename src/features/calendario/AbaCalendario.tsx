import { useMemo, useState } from 'react'
import { Botao, Cartao, PontoCor, Vazio } from '../../components/ui'
import { horaCurta, mesmoDia, semHora } from '../../lib/datas'
import { useConcluidos, useEventos, type Evento } from '../eventos/api'
import { iconesTipo, rotulosTipo } from '../eventos/CardEvento'
import { DIAS_SEMANA, gerarMes, nomeMes } from './mes'

const COR_PADRAO = '#60a5fa'

/**
 * Calendário do mês em 3D: a grade fica inclinada como uma mesa,
 * e os dias com prova "sobem" — quanto mais coisa no dia, mais alto o bloco.
 */
export function AbaCalendario({ salaId }: { salaId: string }) {
  const eventos = useEventos(salaId)
  const concluidos = useConcluidos(salaId)
  const hoje = new Date()
  const [mes, setMes] = useState({ ano: hoje.getFullYear(), mes: hoje.getMonth() })
  const [selecionado, setSelecionado] = useState<Date>(hoje)

  const semanas = useMemo(() => gerarMes(mes.ano, mes.mes), [mes])
  const porDia = useMemo(() => {
    const mapa = new Map<string, Evento[]>()
    for (const ev of eventos.data ?? []) {
      const k = ev.prazo.toDateString()
      mapa.set(k, [...(mapa.get(k) ?? []), ev])
    }
    return mapa
  }, [eventos.data])

  function mudarMes(delta: number) {
    const d = new Date(mes.ano, mes.mes + delta, 1)
    setMes({ ano: d.getFullYear(), mes: d.getMonth() })
  }

  const doDia = porDia.get(selecionado.toDateString()) ?? []
  const feitos = concluidos.data ?? new Set<string>()

  return (
    <div className="space-y-6">
      <div className="entrar-3d flex items-center justify-between">
        <Botao variante="contorno" onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="px-3">←</Botao>
        <div className="text-center">
          <h3 className="text-xl font-bold">{nomeMes(mes.ano, mes.mes)}</h3>
          <button onClick={() => { setMes({ ano: hoje.getFullYear(), mes: hoje.getMonth() }); setSelecionado(hoje) }} className="text-xs text-zinc-500 hover:text-blue-300">
            voltar para hoje
          </button>
        </div>
        <Botao variante="contorno" onClick={() => mudarMes(1)} aria-label="Próximo mês" className="px-3">→</Botao>
      </div>

      <div className="vidro entrar-3d rounded-2xl p-2 sm:p-4" style={{ perspective: 1100 }}>
        <div className="calendario-3d grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{d}</div>
          ))}
          {semanas.flat().map(({ data, doMes }) => {
            const evs = porDia.get(data.toDateString()) ?? []
            const pendentes = evs.filter((e) => !feitos.has(e.id))
            const altura = Math.min(pendentes.length, 3)
            const cor = pendentes[0]?.materia?.cor ?? (pendentes.length ? COR_PADRAO : undefined)
            const ehHoje = mesmoDia(data, hoje)
            const ativo = mesmoDia(data, selecionado)
            return (
              <button
                key={data.toISOString()}
                onClick={() => setSelecionado(data)}
                aria-label={`${data.toLocaleDateString('pt-BR')}: ${evs.length} ${evs.length === 1 ? 'evento' : 'eventos'}`}
                aria-pressed={ativo}
                className={`dia-3d relative flex aspect-square flex-col sm:aspect-[5/4] rounded-lg border p-1 text-left transition sm:rounded-xl sm:p-1.5 ${
                  doMes ? 'border-white/10 bg-zinc-900' : 'border-transparent bg-zinc-950/60 text-zinc-600'
                } ${ativo ? 'ring-2 ring-violet-400' : ''} ${ehHoje ? 'border-blue-400/70' : ''}`}
                style={
                  cor
                    ? {
                        transform: `translateZ(${altura * 10}px)`,
                        boxShadow: `0 ${altura * 4}px 0 ${cor}55, 0 ${altura * 6 + 6}px ${altura * 8 + 8}px -6px ${cor}aa`,
                        borderColor: `${cor}99`,
                        background: `linear-gradient(160deg, ${cor}40, #18181b 70%)`,
                      }
                    : undefined
                }
              >
                <span className={`text-xs font-semibold sm:text-sm ${ehHoje ? 'text-blue-300' : ''}`}>{data.getDate()}</span>
                {evs.length > 0 && (
                  <>
                    <span className="mt-auto flex flex-wrap gap-0.5">
                      {evs.slice(0, 4).map((e) => (
                        <PontoCor key={e.id} cor={e.materia?.cor ?? COR_PADRAO} className={`size-1.5 sm:size-2 ${feitos.has(e.id) ? 'opacity-30' : ''}`} />
                      ))}
                    </span>
                    <span className="hidden truncate text-[10px] leading-tight text-zinc-300 md:block">{evs[0].titulo}</span>
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold capitalize">{selecionado.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
        {doDia.length === 0 ? (
          <Vazio icone="🌤️" titulo="Dia livre">Nenhuma prova ou entrega neste dia.</Vazio>
        ) : (
          <ul className="space-y-2">
            {doDia.map((ev) => (
              <li key={ev.id}>
                <Cartao className={`flex items-center gap-3 ${feitos.has(ev.id) ? 'opacity-60' : ''}`}>
                  <span className="text-2xl">{iconesTipo[ev.tipo]}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${feitos.has(ev.id) ? 'line-through' : ''}`}>{ev.titulo}</p>
                    <p className="flex items-center gap-1.5 text-sm text-zinc-400">
                      {ev.materia && <><PontoCor cor={ev.materia.cor} /> {ev.materia.nome} ·</>} {rotulosTipo[ev.tipo]}
                      {!semHora(ev.prazo) && <> · {horaCurta(ev.prazo)}</>}
                    </p>
                  </div>
                  {feitos.has(ev.id) && <span className="text-sm text-emerald-300">✓</span>}
                </Cartao>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
