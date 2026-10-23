import { useState } from 'react'
import { supabase } from './lib/supabase'
import { useSessao } from './features/auth/useSessao'
import { TelaLogin } from './features/auth/TelaLogin'
import { MinhasTurmas } from './features/turmas/MinhasTurmas'
import { PaginaTurma } from './features/turmas/PaginaTurma'
import { Botao } from './components/ui'

export default function App() {
  const sessao = useSessao()
  const [turmaAberta, setTurmaAberta] = useState<string | null>(null)

  if (sessao === undefined) return <main className="min-h-screen bg-zinc-950" />
  if (sessao === null) return <TelaLogin />

  const nome = (sessao.user.user_metadata.nome as string | undefined) ?? sessao.user.email

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="flex items-center justify-between">
          <p className="font-semibold text-indigo-300">Turma ADS</p>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>{nome}</span>
            <Botao variante="fantasma" className="text-sm" onClick={() => supabase.auth.signOut()}>Sair</Botao>
          </div>
        </header>

        {turmaAberta ? (
          <PaginaTurma id={turmaAberta} onVoltar={() => setTurmaAberta(null)} />
        ) : (
          <MinhasTurmas onAbrir={setTurmaAberta} />
        )}
      </div>
    </main>
  )
}
