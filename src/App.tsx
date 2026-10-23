import { statusDoPrazo, ordenarPorPrazo, type Urgencia } from './features/eventos/prazo'

// Dados de exemplo — na próxima etapa vêm do Supabase.
const hoje = new Date()
const emDias = (n: number) => new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + n, 23, 59)

const eventosExemplo = [
  { id: 1, titulo: 'P1 — Modelagem de Banco de Dados', tipo: 'prova', prazo: emDias(6) },
  { id: 2, titulo: 'Projeto integrador — site da ONG', tipo: 'entrega', prazo: emDias(1) },
  { id: 3, titulo: 'Seminário de Engenharia de Software', tipo: 'apresentacao', prazo: emDias(14) },
  { id: 4, titulo: 'Lista de exercícios 3', tipo: 'entrega', prazo: emDias(-2) },
]

const cores: Record<Urgencia, string> = {
  atrasado: 'bg-zinc-800 text-zinc-400',
  hoje: 'bg-red-500/20 text-red-300',
  urgente: 'bg-orange-500/20 text-orange-300',
  proximo: 'bg-yellow-500/20 text-yellow-200',
  tranquilo: 'bg-emerald-500/20 text-emerald-300',
}

const rotulos: Record<string, string> = { prova: 'Prova', entrega: 'Entrega', apresentacao: 'Apresentação' }

export default function App() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">Próximos prazos</h1>
        <p className="text-zinc-400 mb-6">ADS — dados de exemplo</p>

        <ul className="space-y-3">
          {ordenarPorPrazo(eventosExemplo).map((ev) => {
            const status = statusDoPrazo(ev.prazo)
            return (
              <li key={ev.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div>
                  <span className="text-xs uppercase tracking-wide text-zinc-500">{rotulos[ev.tipo]}</span>
                  <p className="font-medium">{ev.titulo}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-sm ${cores[status.urgencia]}`}>{status.texto}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
