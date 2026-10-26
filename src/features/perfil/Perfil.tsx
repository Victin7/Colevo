import { useEffect, useState, type FormEvent } from 'react'
import { Botao, Campo, Cartao, Erro, Modal } from '../../components/ui'
import { useMeuPerfil, useSalvarNome } from './api'
import { erroNoNome, limparNome, NOME_MAX, pareceEmail } from './nome'

export function ModalPerfil({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const perfil = useMeuPerfil()
  const salvar = useSalvarNome()
  const [nome, setNome] = useState('')

  useEffect(() => {
    if (aberto && perfil.data) setNome(perfil.data.nome)
  }, [aberto, perfil.data])

  const problema = erroNoNome(nome)

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (problema) return
    salvar.mutate(limparNome(nome), { onSuccess: aoFechar })
  }

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Seu perfil">
      <form onSubmit={enviar} className="space-y-4">
        <Campo rotulo="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={NOME_MAX} autoFocus autoComplete="name" />
        <p className="text-sm text-zinc-400">É assim que o líder e os colegas veem você nas salas e nos e-mails de lembrete.</p>
        {nome !== '' && problema && <p role="alert" className="text-sm text-rose-300">{problema}</p>}
        <Erro erro={salvar.error} />
        <Botao type="submit" className="w-full" disabled={!!problema || salvar.isPending}>
          {salvar.isPending ? 'Salvando…' : 'Salvar'}
        </Botao>
      </form>
    </Modal>
  )
}

/** Botão no topo com o nome da pessoa; abre o perfil. */
export function BotaoPerfil({ nomeReserva }: { nomeReserva: string }) {
  const perfil = useMeuPerfil()
  const [aberto, setAberto] = useState(false)
  const nome = perfil.data?.nome ?? nomeReserva
  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label={`Seu perfil: ${nome}`}
        title="Seu perfil"
        className="max-w-48 truncate rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white"
      >
        👤<span className="hidden md:inline"> {nome}</span>
      </button>
      <ModalPerfil aberto={aberto} aoFechar={() => setAberto(false)} />
    </>
  )
}

/** Aviso para quem ficou com o começo do e-mail como nome. */
export function DicaNome() {
  const perfil = useMeuPerfil()
  const [aberto, setAberto] = useState(false)
  if (!perfil.data || !pareceEmail(perfil.data.nome)) return null
  return (
    <>
      <Cartao className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-300">
          Seus colegas veem você como <b className="text-white">{perfil.data.nome}</b>. Quer colocar seu nome?
        </p>
        <Botao variante="contorno" className="shrink-0 text-sm" onClick={() => setAberto(true)}>
          Trocar nome
        </Botao>
      </Cartao>
      <ModalPerfil aberto={aberto} aoFechar={() => setAberto(false)} />
    </>
  )
}
