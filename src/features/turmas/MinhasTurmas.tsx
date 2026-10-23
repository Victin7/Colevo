import { useState, type FormEvent } from 'react'
import { atraso, Botao, Campo, Cartao, Erro } from '../../components/ui'
import { Tilt } from '../../components/Tilt'
import { useCriarTurma, useEntrarNaTurma, useMinhasTurmas } from './api'
import { codigoValido } from './codigo'

export function MinhasTurmas({ onAbrir }: { onAbrir: (id: string) => void }) {
  const turmas = useMinhasTurmas()
  const criar = useCriarTurma()
  const entrar = useEntrarNaTurma()
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')

  async function criarTurma(e: FormEvent) {
    e.preventDefault()
    const turma = await criar.mutateAsync(nome)
    setNome('')
    onAbrir(turma.id)
  }

  async function entrarNaTurma(e: FormEvent) {
    e.preventDefault()
    const turma = await entrar.mutateAsync(codigo)
    setCodigo('')
    onAbrir(turma.id)
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="entrar-3d text-3xl font-extrabold tracking-tight">Minhas <span className="texto-degrade">turmas</span></h2>
        {turmas.isPending && <p className="text-zinc-500">Carregando…</p>}
        <Erro erro={turmas.error} />
        {turmas.data?.length === 0 && (
          <p className="text-zinc-500">Você ainda não está em nenhuma turma. Crie uma ou entre com um código.</p>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {turmas.data?.map((t, i) => (
            <li key={t.id} className="entrar-3d" style={atraso(i)}>
              <button onClick={() => onAbrir(t.id)} className="w-full text-left">
                <Tilt className="rounded-2xl">
                  <Cartao className="flex items-center gap-4 transition hover:border-indigo-400/50">
                    <div className="profundidade-1 grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-400 text-lg font-bold text-zinc-950 shadow-lg shadow-indigo-500/30">
                      {t.nome.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.nome}</p>
                      <p className="text-sm text-zinc-500">Código: <span className="font-mono text-indigo-300">{t.codigo_convite}</span></p>
                    </div>
                  </Cartao>
                </Tilt>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Cartao className="entrar-3d" style={atraso(2)}>
          <form onSubmit={criarTurma} className="space-y-3">
            <h3 className="font-semibold">Criar turma</h3>
            <Campo rotulo="Nome" placeholder="ADS 3º sem — Noite" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <Erro erro={criar.error} />
            <Botao type="submit" disabled={criar.isPending} className="w-full">Criar</Botao>
          </form>
        </Cartao>

        <Cartao className="entrar-3d" style={atraso(3)}>
          <form onSubmit={entrarNaTurma} className="space-y-3">
            <h3 className="font-semibold">Entrar com código</h3>
            <Campo rotulo="Código de convite" placeholder="A1B2C3" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            <Erro erro={entrar.error} />
            <Botao type="submit" disabled={entrar.isPending || !codigoValido(codigo)} className="w-full">Entrar</Botao>
          </form>
        </Cartao>
      </div>
    </div>
  )
}
