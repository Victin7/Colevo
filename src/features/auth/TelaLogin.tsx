import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { Botao, Campo, Cartao, Erro } from '../../components/ui'
import { Tilt } from '../../components/Tilt'
import { Logo } from '../../components/Logo'
import { entrarComGoogle } from './loginGoogle'

export function TelaLogin() {
  const [modo, setModo] = useState<'entrar' | 'cadastrar'>('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<unknown>(null)
  const [aviso, setAviso] = useState('')
  const [indoProGoogle, setIndoProGoogle] = useState(false)

  async function google() {
    setErro(null)
    setIndoProGoogle(true)
    try {
      await entrarComGoogle() // o navegador sai para a página do Google
    } catch (e) {
      setErro(e)
      setIndoProGoogle(false)
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    setAviso('')

    const { data, error } =
      modo === 'entrar'
        ? await supabase.auth.signInWithPassword({ email, password: senha })
        // O "nome" vai em options.data e o trigger ao_criar_usuario usa ele para criar o perfil.
        : await supabase.auth.signUp({ email, password: senha, options: { data: { nome } } })

    setCarregando(false)
    if (error) return setErro(traduzirErro(error.message))
    if (modo === 'cadastrar' && !data.session) {
      setAviso('Conta criada! Confirme pelo link que enviamos para o seu e-mail.')
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 text-zinc-100">
      <Tilt max={6} className="entrar-3d w-full max-w-sm rounded-2xl">
      <Cartao className="space-y-5 p-6">
        <div className="profundidade-1">
          <h1 className="mb-3"><Logo variante="completa" /></h1>
          <p className="text-zinc-400">Crie uma sala, passe o código e a senha pra turma, e ninguém mais esquece prova, trabalho ou entrega.</p>
        </div>

        <button
          type="button"
          onClick={google}
          disabled={indoProGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-2.5 font-medium text-zinc-800 shadow-md transition hover:bg-zinc-100 disabled:opacity-60"
        >
          <IconeGoogle />
          {indoProGoogle ? 'Abrindo o Google…' : 'Continuar com Google'}
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-zinc-500">
          <span className="h-px flex-1 bg-white/10" /> ou com e-mail <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={enviar} className="space-y-3">
          {modo === 'cadastrar' && (
            <Campo rotulo="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          )}
          <Campo rotulo="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Campo rotulo="Senha" type="password" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} required />
          <Erro erro={erro} />
          {aviso && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{aviso}</p>}
          <Botao type="submit" disabled={carregando} className="w-full">
            {carregando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </Botao>
        </form>

        <button
          className="w-full text-sm text-zinc-400 hover:text-zinc-200"
          onClick={() => setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')}
        >
          {modo === 'entrar' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
        </button>
      </Cartao>
      </Tilt>
    </main>
  )
}

/** Logo oficial do "G" do Google (as cores fazem parte das regras de marca deles). */
function IconeGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

function traduzirErro(msg: string) {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('already registered')) return 'Esse e-mail já tem conta. Tente entrar.'
  return msg
}
