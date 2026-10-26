import { useEffect, useState, type ReactNode } from 'react'
import { aoMudarInstalar, eventoInstalar, plataforma, rodandoComoApp, usarEventoInstalar, type Plataforma } from '../lib/instalar'
import { Botao, Modal } from './ui'

const PASSOS: Record<Exclude<Plataforma, 'computador'>, { titulo: string; passos: ReactNode[] }> = {
  'iphone-safari': {
    titulo: 'No iPhone (Safari)',
    passos: [
      <>Toque em <b>Compartilhar</b> (o quadrado com a seta ⬆️, embaixo ou no topo da tela).</>,
      <>Role e toque em <b>Adicionar à Tela de Início</b>.</>,
      <>Toque em <b>Adicionar</b>. O Colevo aparece como app na sua tela.</>,
    ],
  },
  'iphone-outro': {
    titulo: 'No iPhone',
    passos: [
      <>Toque em <b>Compartilhar</b> ⬆️ (no Chrome fica na barra de endereço).</>,
      <>Toque em <b>Adicionar à Tela de Início</b>.</>,
      <>Se não aparecer, abra <b>victin7.github.io/Colevo</b> no <b>Safari</b> e faça por lá.</>,
    ],
  },
  android: {
    titulo: 'No Android',
    passos: [
      <>Toque no menu <b>⋮</b> do navegador (canto de cima).</>,
      <>Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</>,
      <>Confirme. O Colevo aparece como app na sua tela.</>,
    ],
  },
  'app-interno': {
    titulo: 'Abra no navegador primeiro',
    passos: [
      <>Você abriu o link dentro de outro app (WhatsApp, Instagram…), e ele não deixa instalar.</>,
      <>Toque no menu <b>⋮</b> ou <b>…</b> e escolha <b>Abrir no navegador</b> (Chrome ou Safari).</>,
      <>Lá, toque em 📲 <b>Instalar</b> de novo.</>,
    ],
  },
}

/**
 * Botão "Instalar". Onde o navegador deixa instalar direto (Chrome/Android/computador),
 * abre o aviso do sistema; no iPhone e nos outros casos, mostra o passo a passo.
 */
export function BotaoInstalar() {
  const [evento, setEvento] = useState(eventoInstalar)
  const [ajuda, setAjuda] = useState(false)
  useEffect(() => aoMudarInstalar(() => setEvento(eventoInstalar())), [])

  if (rodandoComoApp()) return null
  const onde = plataforma(navigator.userAgent, navigator.maxTouchPoints)
  // No computador sem suporte (ex: Firefox), não vale mostrar nada
  if (!evento && onde === 'computador') return null

  async function instalar() {
    if (!evento) return setAjuda(true)
    await evento.prompt()
    await evento.userChoice
    usarEventoInstalar()
  }

  const guia = onde === 'computador' ? null : PASSOS[onde]
  return (
    <>
      <button onClick={instalar} className="rounded-lg px-3 py-2 text-blue-300 hover:bg-white/5" title="Instalar como app" aria-label="Instalar como app">
        📲<span className="hidden sm:inline"> Instalar</span>
      </button>
      {guia && (
        <Modal aberto={ajuda} aoFechar={() => setAjuda(false)} titulo="Instalar o Colevo">
          <p className="mb-3 font-semibold text-zinc-200">{guia.titulo}</p>
          <ol className="list-decimal space-y-3 pl-5 text-zinc-300">
            {guia.passos.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
          <Botao className="mt-6 w-full" onClick={() => setAjuda(false)}>Entendi</Botao>
        </Modal>
      )}
    </>
  )
}
