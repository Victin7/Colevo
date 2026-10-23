import { useState } from 'react'
import { supabase } from './lib/supabase'
import { useSessao } from './features/auth/useSessao'
import { TelaLogin } from './features/auth/TelaLogin'
import { MinhasTurmas } from './features/turmas/MinhasTurmas'
import { PaginaTurma } from './features/turmas/PaginaTurma'
import { Botao } from './components/ui'
import { Fundo3D } from './components/Fundo3D'

export default function App() {
  return (
    <>
      <Fundo3D />
      <Conteudo />
    </>
  )
}

function Conteudo() {
  const sessao = useSessao()
  const [turmaAberta, setTurmaAberta] = useState<string | null>(null)

  if (sessao === undefined) return <main className="min-h-screen" />
  if (sessao === null) return <TelaLogin />

  const nome = (sessao.user.user_metadata.nome as string | undefined) ?? sessao.user.email

  return (
    <main className="min-h-screen px-4 py-6 text-zinc-100">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="vidro sticky top-4 z-10 flex items-center justify-between rounded-2xl px-4 py-2">
          <p className="texto-degrade font-extrabold">Turma ADS</p>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="hidden sm:inline">{nome}</span>
            <Botao variante="fantasma" className="text-sm" onClick={() => supabase.auth.signOut()}>Sair</Botao>
          </div>
        </header>

        {turmaAberta ? (
          <PaginaTurma key={turmaAberta} id={turmaAberta} onVoltar={() => setTurmaAberta(null)} />
        ) : (
          <MinhasTurmas onAbrir={setTurmaAberta} />
        )}
      </div>
    </main>
  )
}
