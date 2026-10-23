import { useState, type FormEvent } from 'react'
import { Botao, Campo, Cartao, Erro } from '../../components/ui'
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
        <h2 className="text-xl font-semibold">Minhas turmas</h2>
        {turmas.isPending && <p className="text-zinc-500">Carregando…</p>}
        <Erro erro={turmas.error} />
        {turmas.data?.length === 0 && (
          <p className="text-zinc-500">Você ainda não está em nenhuma turma. Crie uma ou entre com um código.</p>
        )}
        <ul className="space-y-2">
          {turmas.data?.map((t) => (
            <li key={t.id}>
              <button onClick={() => onAbrir(t.id)} className="w-full text-left">
                <Cartao className="transition hover:border-indigo-400/60">
                  <p className="font-medium">{t.nome}</p>
                  <p className="text-sm text-zinc-500">Código: {t.codigo_convite}</p>
                </Cartao>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Cartao>
          <form onSubmit={criarTurma} className="space-y-3">
            <h3 className="font-semibold">Criar turma</h3>
            <Campo rotulo="Nome" placeholder="ADS 3º sem — Noite" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <Erro erro={criar.error} />
            <Botao type="submit" disabled={criar.isPending} className="w-full">Criar</Botao>
          </form>
        </Cartao>

        <Cartao>
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
