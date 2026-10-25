import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { atraso, Botao, Campo, Cartao, Erro } from '../../components/ui'
import { useDefinirSenha, useExcluirSala, useMembros, useNovoCodigo, useRemoverMembro, useRenomearSala, useSairDaSala, useTornarLider } from './api'
import { SENHA_MINIMA } from './codigo'

export function AbaMembros({ salaId, nomeSala, euId, lider }: { salaId: string; nomeSala: string; euId?: string; lider: boolean }) {
  const membros = useMembros(salaId)
  const remover = useRemoverMembro()
  const tornarLider = useTornarLider()
  const sair = useSairDaSala()
  const navigate = useNavigate()

  async function sairDaSala() {
    const aviso = lider ? '\n\nVocê é líder: se não houver outro líder, o aluno mais antigo assume.' : ''
    if (!confirm(`Sair da sala "${nomeSala}"?${aviso}`)) return
    await sair.mutateAsync(salaId)
    navigate({ to: '/' })
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="font-semibold">{membros.data?.length ?? '…'} {membros.data?.length === 1 ? 'aluno' : 'alunos'} na sala</h3>
        <Erro erro={membros.error ?? remover.error ?? tornarLider.error} />
        <ul className="grid gap-2 sm:grid-cols-2">
          {membros.data?.map((m, i) => (
            <li key={m.user_id} className="entrar-3d" style={atraso(i)}>
              <Cartao className="flex items-center gap-3 py-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 font-bold text-white">
                  {m.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {m.nome} {m.user_id === euId && <span className="text-xs text-zinc-500">(você)</span>}
                  </p>
                  <p className="text-xs text-zinc-500">{m.papel === 'lider' ? '👑 Líder' : '🎓 Aluno'} · desde {new Date(m.entrou_em).toLocaleDateString('pt-BR')}</p>
                </div>
                {lider && m.user_id !== euId && (
                  <div className="flex flex-col gap-1 text-xs">
                    {m.papel !== 'lider' && (
                      <button className="text-zinc-400 hover:text-amber-300" onClick={() => confirm(`Tornar ${m.nome} líder também?`) && tornarLider.mutate({ salaId, userId: m.user_id })}>
                        👑 Tornar líder
                      </button>
                    )}
                    <button className="text-zinc-400 hover:text-red-300" onClick={() => confirm(`Remover ${m.nome} da sala?`) && remover.mutate({ salaId, userId: m.user_id })}>
                      Remover
                    </button>
                  </div>
                )}
              </Cartao>
            </li>
          ))}
        </ul>
      </section>

      {lider && <PainelLider salaId={salaId} nomeSala={nomeSala} />}

      <Cartao className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">Não faz mais parte dessa turma?</p>
        <Botao variante="perigo" onClick={sairDaSala} disabled={sair.isPending}>Sair da sala</Botao>
      </Cartao>
      <Erro erro={sair.error} />
    </div>
  )
}

function PainelLider({ salaId, nomeSala }: { salaId: string; nomeSala: string }) {
  const renomear = useRenomearSala()
  const definirSenha = useDefinirSenha()
  const novoCodigo = useNovoCodigo()
  const excluir = useExcluirSala()
  const navigate = useNavigate()
  const [nome, setNome] = useState(nomeSala)
  const [senha, setSenha] = useState('')
  const [ok, setOk] = useState('')

  const avisar = (msg: string) => {
    setOk(msg)
    setTimeout(() => setOk(''), 2500)
  }

  async function salvarNome(e: FormEvent) {
    e.preventDefault()
    await renomear.mutateAsync({ salaId, nome })
    avisar('Nome atualizado!')
  }

  async function salvarSenha(e: FormEvent) {
    e.preventDefault()
    await definirSenha.mutateAsync({ salaId, senha })
    setSenha('')
    avisar('Senha trocada! Avise a turma.')
  }

  async function trocarCodigo() {
    if (!confirm('Gerar um novo código? O código antigo para de funcionar (quem já está na sala continua).')) return
    await novoCodigo.mutateAsync(salaId)
    avisar('Código novo gerado!')
  }

  async function excluirSala() {
    const digitado = prompt(`Isso apaga a sala, as provas e os materiais para TODO MUNDO.\n\nDigite o nome da sala para confirmar:\n${nomeSala}`)
    if (digitado?.trim() !== nomeSala.trim()) return
    await excluir.mutateAsync(salaId)
    navigate({ to: '/' })
  }

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">👑 Painel do líder</h3>
      {ok && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{ok}</p>}
      <Erro erro={renomear.error ?? definirSenha.error ?? novoCodigo.error ?? excluir.error} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Cartao>
          <form onSubmit={salvarNome} className="space-y-3">
            <Campo rotulo="Nome da sala" maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} required />
            <Botao type="submit" variante="contorno" disabled={renomear.isPending || nome.trim() === nomeSala}>Renomear</Botao>
          </form>
        </Cartao>
        <Cartao>
          <form onSubmit={salvarSenha} className="space-y-3">
            <Campo rotulo="Nova senha da sala" minLength={SENHA_MINIMA} value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <Botao type="submit" variante="contorno" disabled={definirSenha.isPending}>Trocar senha</Botao>
          </form>
        </Cartao>
      </div>
      <Cartao className="flex flex-wrap gap-2">
        <Botao variante="contorno" onClick={trocarCodigo} disabled={novoCodigo.isPending}>🔄 Gerar novo código</Botao>
        <Botao variante="perigo" onClick={excluirSala} disabled={excluir.isPending}>Excluir sala</Botao>
      </Cartao>
    </section>
  )
}
