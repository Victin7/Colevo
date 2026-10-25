import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { Erro, Vazio } from '../../components/ui'
import { AbaCalendario } from '../calendario/AbaCalendario'
import { AbaAgenda } from '../eventos/AbaAgenda'
import { useConcluidos, useEventos } from '../eventos/api'
import { usePreferencias } from '../lembretes/api'
import { useNotificacoes } from '../lembretes/useNotificacoes'
import { AbaMateriais } from '../materiais/AbaMateriais'
import { AbaMaterias } from '../materias/AbaMaterias'
import { AbaMembros } from './AbaMembros'
import { useEu, useSala } from './api'
import { CodigoGrande } from './CodigoGrande'
import { Compartilhar } from './Compartilhar'
import { useTempoReal } from './useTempoReal'

export const ABAS = [
  { id: 'agenda', rotulo: 'Agenda', icone: '🗓️' },
  { id: 'calendario', rotulo: 'Calendário', icone: '📆' },
  { id: 'materias', rotulo: 'Matérias', icone: '📚' },
  { id: 'materiais', rotulo: 'Materiais', icone: '🗂️' },
  { id: 'membros', rotulo: 'Membros', icone: '👥' },
] as const

export type Aba = (typeof ABAS)[number]['id']

export function PaginaSala() {
  const { salaId } = useParams({ from: '/sala/$salaId' })
  const { aba = 'agenda' } = useSearch({ from: '/sala/$salaId' })
  const navigate = useNavigate()
  const sala = useSala(salaId)
  const eu = useEu(salaId)
  const eventos = useEventos(salaId)
  const concluidos = useConcluidos(salaId)
  const prefs = usePreferencias()

  useTempoReal(salaId)
  useNotificacoes(eventos.data, concluidos.data, prefs.data?.dias_antes ?? [1, 3], sala.data?.nome ?? '')

  if (sala.isPending) return <p className="text-center text-zinc-500">Carregando sala…</p>
  if (sala.error) return <Erro erro={sala.error} />
  if (!sala.data) {
    return (
      <Vazio icone="🚫" titulo="Sala não encontrada">
        Ela pode ter sido excluída ou você foi removido. <Link to="/" className="text-blue-300 underline">Voltar às salas</Link>
      </Vazio>
    )
  }

  const s = sala.data
  return (
    <div className="space-y-6">
      <header className="entrar-3d space-y-4">
        <Link to="/" className="text-sm text-zinc-400 hover:text-white">← Minhas salas</Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-zinc-500">{eu.lider ? '👑 Você é líder' : '🎓 Sala da turma'}</p>
            <h1 className="truncate text-3xl font-black tracking-tight sm:text-4xl">{s.nome}</h1>
          </div>
          <CodigoGrande codigo={s.codigo} tamanho="p" />
        </div>
        <Compartilhar nome={s.nome} codigo={s.codigo} />
      </header>

      <nav className="vidro sticky top-20 z-10 -mx-1 flex gap-1 overflow-x-auto rounded-2xl p-1" aria-label="Seções da sala">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => navigate({ to: '/sala/$salaId', params: { salaId }, search: { aba: a.id }, replace: true })}
            aria-current={aba === a.id ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition sm:flex-1 sm:justify-center ${
              aba === a.id ? 'bg-gradient-to-r from-violet-500/30 via-blue-500/25 to-cyan-400/25 text-white shadow-inner' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
            }`}
          >
            <span aria-hidden>{a.icone}</span> {a.rotulo}
          </button>
        ))}
      </nav>

      <div key={aba}>
        {aba === 'agenda' && <AbaAgenda salaId={salaId} nomeSala={s.nome} euId={eu.id} lider={eu.lider} />}
        {aba === 'calendario' && <AbaCalendario salaId={salaId} />}
        {aba === 'materias' && <AbaMaterias salaId={salaId} />}
        {aba === 'materiais' && <AbaMateriais salaId={salaId} euId={eu.id} lider={eu.lider} />}
        {aba === 'membros' && <AbaMembros salaId={salaId} nomeSala={s.nome} euId={eu.id} lider={eu.lider} />}
      </div>
    </div>
  )
}
