import { useState, type FormEvent } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { atraso, Botao, Campo, Cartao, Erro, Modal, Vazio } from '../../components/ui'
import { Tilt } from '../../components/Tilt'
import { useCriarSala, useEntrarNaSala, useMinhasSalas } from './api'
import { codigoValido, SENHA_MINIMA } from './codigo'
import { CodigoGrande } from './CodigoGrande'
import { Compartilhar } from './Compartilhar'

type SalaCriada = { id: string; nome: string; codigo: string; senha: string }

export function TelaSalas() {
  const { codigo: codigoDoLink } = useSearch({ from: '/' })
  const navigate = useNavigate()
  const salas = useMinhasSalas()
  const [modal, setModal] = useState<'criar' | 'entrar' | null>(codigoDoLink ? 'entrar' : null)
  const [criada, setCriada] = useState<SalaCriada | null>(null)

  const abrirSala = (id: string) => navigate({ to: '/sala/$salaId', params: { salaId: id } })
  function fechar() {
    setModal(null)
    if (codigoDoLink) navigate({ to: '/', search: {}, replace: true }) // limpa o código da URL
  }

  return (
    <div className="space-y-8">
      <section className="entrar-3d text-center">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Suas <span className="texto-degrade">salas</span>
        </h1>
        <p className="mt-2 text-zinc-400">Crie uma sala para a turma ou entre com o código e a senha que o líder passou.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <BotaoGrande icone="✨" titulo="Criar sala" texto="Você vira o líder e recebe o código" onClick={() => setModal('criar')} i={1} />
        <BotaoGrande icone="🚪" titulo="Entrar na sala" texto="Use o código e a senha da turma" onClick={() => setModal('entrar')} i={2} />
      </div>

      <section className="space-y-3">
        {salas.isPending && <p className="text-center text-zinc-500">Carregando salas…</p>}
        <Erro erro={salas.error} />
        {salas.data?.length === 0 && (
          <Vazio icone="🛸" titulo="Você ainda não está em nenhuma sala">Crie a da sua turma ou peça o código para o líder.</Vazio>
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {salas.data?.map((s, i) => (
            <li key={s.id} className="entrar-3d" style={atraso(i + 3)}>
              <button onClick={() => abrirSala(s.id)} className="w-full text-left">
                <Tilt className="rounded-2xl">
                  <Cartao className="flex items-center gap-4 transition hover:border-blue-400/50">
                    <div className="profundidade-1 grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 text-lg font-black text-white shadow-lg shadow-blue-500/30">
                      {s.nome.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{s.nome}</p>
                      <p className="text-sm text-zinc-500">
                        <span className="font-mono text-blue-300">{s.codigo}</span> · {s.total} {s.total === 1 ? 'aluno' : 'alunos'}
                      </p>
                    </div>
                    <span className="text-zinc-500" aria-hidden>→</span>
                  </Cartao>
                </Tilt>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Modal aberto={modal === 'criar'} aoFechar={fechar} titulo="Criar sala">
        <FormCriar aoCriar={(s) => { setModal(null); setCriada(s) }} />
      </Modal>
      <Modal aberto={modal === 'entrar'} aoFechar={fechar} titulo="Entrar na sala">
        <FormEntrar codigoInicial={codigoDoLink ?? ''} aoEntrar={(id) => { setModal(null); abrirSala(id) }} />
      </Modal>
      <Modal aberto={!!criada} aoFechar={() => setCriada(null)} titulo="Sala criada! 🎉">
        {criada && (
          <div className="space-y-5 text-center">
            <p className="text-zinc-400">Passe o código e a senha para a turma:</p>
            <CodigoGrande codigo={criada.codigo} />
            <p>
              Senha: <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-violet-300">{criada.senha}</span>
            </p>
            <p className="text-xs text-zinc-500">Guarde a senha: por segurança ela não fica visível depois. Você pode trocar no painel do líder.</p>
            <div className="flex justify-center"><Compartilhar nome={criada.nome} codigo={criada.codigo} senha={criada.senha} /></div>
            <Botao className="w-full" onClick={() => abrirSala(criada.id)}>Ir para a sala →</Botao>
          </div>
        )}
      </Modal>
    </div>
  )
}

function BotaoGrande({ icone, titulo, texto, onClick, i }: { icone: string; titulo: string; texto: string; onClick: () => void; i: number }) {
  return (
    <button onClick={onClick} className="entrar-3d text-left" style={atraso(i)}>
      <Tilt className="rounded-2xl" max={12}>
        <Cartao className="relative overflow-hidden p-6 transition hover:border-violet-400/50">
          <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-violet-400/10 blur-2xl" />
          <div className="profundidade-2 text-4xl">{icone}</div>
          <p className="profundidade-1 mt-3 text-xl font-black uppercase tracking-wide">{titulo}</p>
          <p className="profundidade-1 text-sm text-zinc-400">{texto}</p>
        </Cartao>
      </Tilt>
    </button>
  )
}

function FormCriar({ aoCriar }: { aoCriar: (s: SalaCriada) => void }) {
  const criar = useCriarSala()
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const sala = await criar.mutateAsync({ nome, senha })
    aoCriar({ id: sala.id, nome: sala.nome, codigo: sala.codigo, senha })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo rotulo="Nome da sala" placeholder="Turma de Cálculo — 2º sem" maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
      <Campo rotulo={`Senha da sala (mín. ${SENHA_MINIMA} caracteres)`} placeholder="ex: turma2026" minLength={SENHA_MINIMA} value={senha} onChange={(e) => setSenha(e.target.value)} required />
      <p className="text-xs text-zinc-500">A senha impede que alguém entre só chutando o código.</p>
      <Erro erro={criar.error} />
      <Botao type="submit" disabled={criar.isPending} className="w-full">{criar.isPending ? 'Criando…' : 'Criar sala'}</Botao>
    </form>
  )
}

function FormEntrar({ codigoInicial, aoEntrar }: { codigoInicial: string; aoEntrar: (id: string) => void }) {
  const entrar = useEntrarNaSala()
  const [codigo, setCodigo] = useState(codigoInicial)
  const [senha, setSenha] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const sala = await entrar.mutateAsync({ codigo, senha })
    aoEntrar(sala.id)
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo
        rotulo="Código da sala"
        placeholder="K7QX2M"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
        className="[&_input]:text-center [&_input]:font-mono [&_input]:text-2xl [&_input]:tracking-[0.4em] [&_input]:uppercase"
        maxLength={8}
        required
        autoFocus={!codigoInicial}
      />
      <Campo rotulo="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus={!!codigoInicial} />
      <Erro erro={entrar.error} />
      <Botao type="submit" disabled={entrar.isPending || !codigoValido(codigo)} className="w-full">{entrar.isPending ? 'Entrando…' : 'Entrar'}</Botao>
    </form>
  )
}
