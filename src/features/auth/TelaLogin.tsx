import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { Botao, Campo, Cartao, Erro } from '../../components/ui'

export function TelaLogin() {
  const [modo, setModo] = useState<'entrar' | 'cadastrar'>('entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<unknown>(null)
  const [aviso, setAviso] = useState('')

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
    <main className="grid min-h-screen place-items-center bg-zinc-950 px-4 text-zinc-100">
      <Cartao className="w-full max-w-sm space-y-5 p-6">
        <div>
          <h1 className="text-2xl font-bold">Turma ADS</h1>
          <p className="text-zinc-400">Provas, entregas e materiais da turma num lugar só.</p>
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
    </main>
  )
}

function traduzirErro(msg: string) {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('already registered')) return 'Esse e-mail já tem conta. Tente entrar.'
  return msg
}
