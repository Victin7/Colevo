import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Botao, Cartao, Erro } from '../../components/ui'
import { usePreferencias, useSalvarPreferencias } from './api'
import { usePermissaoNotificacao } from './useNotificacoes'

const OPCOES = [
  { dias: 0, rotulo: 'No dia' },
  { dias: 1, rotulo: '1 dia antes' },
  { dias: 3, rotulo: '3 dias antes' },
  { dias: 7, rotulo: '1 semana antes' },
]

export function TelaLembretes() {
  const prefs = usePreferencias()
  const salvar = useSalvarPreferencias()
  const { permissao, pedir } = usePermissaoNotificacao()
  const [email, setEmail] = useState(true)
  const [dias, setDias] = useState<number[]>([1, 3])
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (prefs.data) {
      setEmail(prefs.data.email_ativo)
      setDias(prefs.data.dias_antes)
    }
  }, [prefs.data])

  const alternarDia = (d: number) => setDias((atual) => (atual.includes(d) ? atual.filter((x) => x !== d) : [...atual, d].sort((a, b) => a - b)))

  async function enviar() {
    await salvar.mutateAsync({ email_ativo: email, dias_antes: dias })
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="entrar-3d">
        <Link to="/" className="text-sm text-zinc-400 hover:text-white">← Minhas salas</Link>
        <h1 className="text-3xl font-black tracking-tight">🔔 <span className="texto-degrade">Lembretes</span></h1>
        <p className="text-zinc-400">Escolha quando e como você quer ser avisado das provas e entregas.</p>
      </div>

      <Cartao className="entrar-3d space-y-3">
        <p className="font-semibold">Quando avisar</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {OPCOES.map((o) => (
            <button
              key={o.dias}
              onClick={() => alternarDia(o.dias)}
              aria-pressed={dias.includes(o.dias)}
              className={`rounded-xl border px-3 py-3 text-sm transition ${dias.includes(o.dias) ? 'border-fuchsia-400/60 bg-fuchsia-400/10 text-white' : 'border-white/10 text-zinc-400 hover:text-zinc-200'}`}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
      </Cartao>

      <Cartao className="entrar-3d space-y-4">
        <p className="font-semibold">Como avisar</p>

        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} className="mt-1 size-4 accent-fuchsia-400" />
          <span>
            <span className="font-medium">📧 Por e-mail</span>
            <span className="block text-sm text-zinc-400">Um e-mail de manhã, nos dias escolhidos, para o que você ainda não marcou como feito.</span>
          </span>
        </label>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg">💻</span>
          <div className="flex-1">
            <p className="font-medium">Notificação no computador/celular</p>
            <p className="text-sm text-zinc-400">Aparece enquanto o app estiver aberto (ou instalado na tela inicial).</p>
            {permissao === 'granted' && <p className="mt-1 text-sm text-emerald-300">✓ Ativada</p>}
            {permissao === 'default' && <Botao variante="contorno" className="mt-2 text-sm" onClick={pedir}>Ativar notificações</Botao>}
            {permissao === 'denied' && <p className="mt-1 text-sm text-amber-300">Bloqueada no navegador. Libere no cadeado 🔒 ao lado do endereço do site.</p>}
            {permissao === 'indisponivel' && <p className="mt-1 text-sm text-zinc-500">Seu navegador não suporta notificações.</p>}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg">📅</span>
          <div>
            <p className="font-medium">No calendário do celular</p>
            <p className="text-sm text-zinc-400">
              Na Agenda da sala, use <b>📲 Exportar</b> (todas as provas de uma vez) ou <b>📅 Google Agenda</b> em cada prova. O celular avisa sozinho, mesmo com o app fechado.
            </p>
          </div>
        </div>
      </Cartao>

      <Erro erro={salvar.error ?? prefs.error} />
      <Botao onClick={enviar} disabled={salvar.isPending || prefs.isPending} className="w-full">
        {salvo ? '✓ Salvo!' : salvar.isPending ? 'Salvando…' : 'Salvar preferências'}
      </Botao>
    </div>
  )
}
