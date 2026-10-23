import { useState, type FormEvent } from 'react'
import { atraso, Botao, Campo, Cartao, Erro } from '../../components/ui'
import { Tilt } from '../../components/Tilt'
import type { Enums } from '../../lib/database.types'
import { useCriarEvento, useEventos } from '../eventos/api'
import { ordenarPorPrazo, statusDoPrazo, type Urgencia } from '../eventos/prazo'
import { useTurma } from './api'

/** Cada urgência tem cor de selo, de "brilho" atrás do card e do bloco de data. */
const visual: Record<Urgencia, { selo: string; brilho: string; bloco: string }> = {
  atrasado: { selo: 'bg-zinc-800 text-zinc-400', brilho: 'shadow-none', bloco: 'from-zinc-600 to-zinc-700 text-zinc-200' },
  hoje: { selo: 'bg-red-500/20 text-red-300', brilho: 'shadow-[0_0_40px_-12px_rgba(248,113,113,0.8)]', bloco: 'from-red-400 to-rose-500 text-zinc-950' },
  urgente: { selo: 'bg-orange-500/20 text-orange-300', brilho: 'shadow-[0_0_40px_-14px_rgba(251,146,60,0.7)]', bloco: 'from-orange-300 to-amber-400 text-zinc-950' },
  proximo: { selo: 'bg-yellow-500/20 text-yellow-200', brilho: 'shadow-[0_0_36px_-16px_rgba(250,204,21,0.6)]', bloco: 'from-yellow-200 to-lime-300 text-zinc-950' },
  tranquilo: { selo: 'bg-emerald-500/20 text-emerald-300', brilho: 'shadow-[0_0_36px_-18px_rgba(52,211,153,0.6)]', bloco: 'from-emerald-300 to-teal-400 text-zinc-950' },
}

const rotulos: Record<Enums<'tipo_evento'>, string> = { prova: 'Prova', entrega: 'Entrega', apresentacao: 'Apresentação' }
const icones: Record<Enums<'tipo_evento'>, string> = { prova: '📝', entrega: '📦', apresentacao: '🎤' }

export function PaginaTurma({ id, onVoltar }: { id: string; onVoltar: () => void }) {
  const turma = useTurma(id)
  const eventos = useEventos(id)

  return (
    <div className="space-y-6">
      <div className="entrar-3d">
        <Botao variante="fantasma" onClick={onVoltar} className="-ml-4 text-sm">← Minhas turmas</Botao>
        <h2 className="text-3xl font-extrabold tracking-tight">{turma.data?.nome ?? '…'}</h2>
        {turma.data && (
          <p className="mt-1 text-zinc-400">
            Convide a turma com o código{' '}
            <button
              title="Copiar código"
              onClick={() => navigator.clipboard?.writeText(turma.data.codigo_convite)}
              className="rounded-md border border-indigo-400/30 bg-indigo-400/10 px-2 py-0.5 font-mono text-indigo-300 transition hover:bg-indigo-400/20"
            >
              {turma.data.codigo_convite}
            </button>
          </p>
        )}
      </div>

      <NovoEventoForm turmaId={id} />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Próximos prazos</h3>
        {eventos.isPending && <p className="text-zinc-500">Carregando…</p>}
        <Erro erro={eventos.error} />
        {eventos.data?.length === 0 && <p className="text-zinc-500">Nenhuma prova ou entrega cadastrada ainda.</p>}
        <ul className="space-y-4">
          {eventos.data &&
            ordenarPorPrazo(eventos.data).map((ev, i) => {
              const status = statusDoPrazo(ev.prazo)
              const v = visual[status.urgencia]
              return (
                <li key={ev.id} className="entrar-3d" style={atraso(i)}>
                  <Tilt className={`rounded-2xl ${v.brilho}`}>
                    <Cartao className={`flex items-center gap-4 ${status.urgencia === 'atrasado' ? 'opacity-60' : ''}`}>
                      {/* Bloco de data "sai" do card em direção à tela */}
                      <div className={`profundidade-2 grid w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br py-2 leading-none shadow-xl shadow-black/40 ${v.bloco}`}>
                        <span className="text-2xl font-black">{ev.prazo.getDate()}</span>
                        <span className="mt-1 text-[11px] font-semibold uppercase">
                          {ev.prazo.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                        </span>
                      </div>
                      <div className="profundidade-1 min-w-0 flex-1">
                        <span className="text-xs uppercase tracking-wide text-zinc-500">{icones[ev.tipo]} {rotulos[ev.tipo]}</span>
                        <p className="truncate font-medium">{ev.titulo}</p>
                        <p className="text-sm capitalize text-zinc-500">{ev.prazo.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                      </div>
                      <span className={`profundidade-1 shrink-0 rounded-full px-3 py-1 text-sm font-medium ${v.selo}`}>{status.texto}</span>
                    </Cartao>
                  </Tilt>
                </li>
              )
            })}
        </ul>
      </section>
    </div>
  )
}

function NovoEventoForm({ turmaId }: { turmaId: string }) {
  const criar = useCriarEvento()
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<Enums<'tipo_evento'>>('prova')
  const [data, setData] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    // "2026-11-10" vira 10/11 às 23:59 no horário local: prazo vale o dia todo.
    const [a, m, d] = data.split('-').map(Number)
    await criar.mutateAsync({ turmaId, titulo, tipo, prazo: new Date(a, m - 1, d, 23, 59) })
    setTitulo('')
    setData('')
  }

  return (
    <Cartao className="entrar-3d" style={atraso(1)}>
      <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_11rem_auto] sm:items-end">
        <Campo rotulo="O que é" placeholder="P1 — Banco de Dados" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Tipo</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Enums<'tipo_evento'>)}
            className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2"
          >
            {Object.entries(rotulos).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
          </select>
        </label>
        <Campo rotulo="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        <Botao type="submit" disabled={criar.isPending}>Adicionar</Botao>
      </form>
      <div className="mt-3"><Erro erro={criar.error} /></div>
    </Cartao>
  )
}
