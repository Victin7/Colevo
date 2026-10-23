import { useState, type FormEvent } from 'react'
import { Botao, Campo, Cartao, Erro } from '../../components/ui'
import type { Enums } from '../../lib/database.types'
import { useCriarEvento, useEventos } from '../eventos/api'
import { ordenarPorPrazo, statusDoPrazo, type Urgencia } from '../eventos/prazo'
import { useTurma } from './api'

const cores: Record<Urgencia, string> = {
  atrasado: 'bg-zinc-800 text-zinc-400',
  hoje: 'bg-red-500/20 text-red-300',
  urgente: 'bg-orange-500/20 text-orange-300',
  proximo: 'bg-yellow-500/20 text-yellow-200',
  tranquilo: 'bg-emerald-500/20 text-emerald-300',
}

const rotulos: Record<Enums<'tipo_evento'>, string> = { prova: 'Prova', entrega: 'Entrega', apresentacao: 'Apresentação' }

export function PaginaTurma({ id, onVoltar }: { id: string; onVoltar: () => void }) {
  const turma = useTurma(id)
  const eventos = useEventos(id)

  return (
    <div className="space-y-6">
      <div>
        <Botao variante="fantasma" onClick={onVoltar} className="-ml-4 text-sm">← Minhas turmas</Botao>
        <h2 className="text-2xl font-bold">{turma.data?.nome ?? '…'}</h2>
        {turma.data && (
          <p className="text-zinc-400">
            Convide a turma com o código <code className="rounded bg-zinc-800 px-2 py-0.5 text-indigo-300">{turma.data.codigo_convite}</code>
          </p>
        )}
      </div>

      <NovoEventoForm turmaId={id} />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Próximos prazos</h3>
        {eventos.isPending && <p className="text-zinc-500">Carregando…</p>}
        <Erro erro={eventos.error} />
        {eventos.data?.length === 0 && <p className="text-zinc-500">Nenhuma prova ou entrega cadastrada ainda.</p>}
        <ul className="space-y-3">
          {eventos.data &&
            ordenarPorPrazo(eventos.data).map((ev) => {
              const status = statusDoPrazo(ev.prazo)
              return (
                <li key={ev.id}>
                  <Cartao className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-zinc-500">{rotulos[ev.tipo]}</span>
                      <p className="font-medium">{ev.titulo}</p>
                      <p className="text-sm text-zinc-500">{ev.prazo.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-sm ${cores[status.urgencia]}`}>{status.texto}</span>
                  </Cartao>
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
    <Cartao>
      <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <Campo rotulo="O que é" placeholder="P1 — Banco de Dados" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        <label className="block space-y-1">
          <span className="text-sm text-zinc-400">Tipo</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Enums<'tipo_evento'>)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
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
