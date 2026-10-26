import { useEffect } from 'react'
import { createHashHistory, createRootRoute, createRoute, createRouter, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Botao } from './components/ui'
import { BotaoInstalar } from './components/BotaoInstalar'
import { Logo } from './components/Logo'
import { Fundo3D } from './components/Fundo3D'
import { supabase } from './lib/supabase'
import { TelaLogin } from './features/auth/TelaLogin'
import { useSessao } from './features/auth/useSessao'
import { limparCodigoDaUrl, nomeDoUsuario, retirarConvitePendente } from './features/auth/loginGoogle'
import { TelaLembretes } from './features/lembretes/TelaLembretes'
import { ABAS, PaginaSala, type Aba } from './features/salas/PaginaSala'
import { TelaSalas } from './features/salas/TelaSalas'

/**
 * Rotas do app. Usa "hash history" (#/sala/...) porque o GitHub Pages
 * só serve arquivos: sem o #, recarregar /sala/123 daria 404.
 */

function Raiz() {
  const sessao = useSessao()
  const qc = useQueryClient()
  const navigate = useNavigate()

  // Voltando do Google: limpa o ?code= do endereço e, se a pessoa veio de um convite, reabre o "Entrar na sala"
  useEffect(() => {
    if (!sessao) return
    limparCodigoDaUrl()
    const codigo = retirarConvitePendente()
    if (codigo) navigate({ to: '/', search: { codigo } })
  }, [sessao, navigate])

  return (
    <>
      <Fundo3D />
      {sessao === undefined ? (
        <main className="min-h-screen" />
      ) : sessao === null ? (
        <TelaLogin />
      ) : (
        <main className="min-h-screen px-4 py-6 text-zinc-100">
          <div className="mx-auto max-w-3xl space-y-8">
            <header className="vidro sticky top-4 z-20 flex items-center justify-between rounded-2xl px-4 py-2">
              <Link to="/" aria-label="Colevo — início"><Logo /></Link>
              <nav className="flex items-center gap-1 text-sm text-zinc-400">
                <BotaoInstalar />
                <Link to="/lembretes" className="rounded-lg px-3 py-2 hover:bg-white/5 [&.active]:text-white" title="Lembretes">🔔<span className="hidden sm:inline"> Lembretes</span></Link>
                <span className="hidden px-2 md:inline">{nomeDoUsuario(sessao.user.user_metadata, sessao.user.email)}</span>
                <Botao
                  variante="fantasma"
                  className="text-sm"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    qc.clear() // não deixa dados de um usuário aparecerem para o próximo
                  }}
                >
                  Sair
                </Botao>
              </nav>
            </header>
            <Outlet />
          </div>
        </main>
      )}
    </>
  )
}

const raiz = createRootRoute({ component: Raiz })

const rotaSalas = createRoute({
  getParentRoute: () => raiz,
  path: '/',
  // String(...) porque um código só de números (ex: 234567) viria como number
  validateSearch: (s: Record<string, unknown>): { codigo?: string } => (s.codigo != null && s.codigo !== '' ? { codigo: String(s.codigo) } : {}),
  component: TelaSalas,
})

const rotaSala = createRoute({
  getParentRoute: () => raiz,
  path: '/sala/$salaId',
  validateSearch: (s: Record<string, unknown>): { aba?: Aba } => (ABAS.some((a) => a.id === s.aba) ? { aba: s.aba as Aba } : {}),
  component: PaginaSala,
})

const rotaLembretes = createRoute({ getParentRoute: () => raiz, path: '/lembretes', component: TelaLembretes })

export const router = createRouter({
  routeTree: raiz.addChildren([rotaSalas, rotaSala, rotaLembretes]),
  history: createHashHistory(),
  defaultNotFoundComponent: () => (
    <p className="text-center text-zinc-400">
      Página não encontrada. <Link to="/" className="text-blue-300 underline">Voltar</Link>
    </p>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
