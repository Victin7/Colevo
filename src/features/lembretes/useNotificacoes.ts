import { useEffect, useState } from 'react'
import { chaveNotificacao, eventosParaLembrar, type EventoLembravel } from './lembretes'

const suporta = () => typeof window !== 'undefined' && 'Notification' in window

/** Permissão de notificação do navegador. */
export function usePermissaoNotificacao() {
  const [permissao, setPermissao] = useState<NotificationPermission | 'indisponivel'>(() => (suporta() ? Notification.permission : 'indisponivel'))
  async function pedir() {
    if (!suporta()) return
    setPermissao(await Notification.requestPermission())
  }
  return { permissao, pedir }
}

function ler(chave: string) {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}
function gravar(chave: string) {
  try {
    localStorage.setItem(chave, '1')
  } catch {
    /* modo privado: tudo bem notificar de novo */
  }
}

/**
 * Enquanto o app está aberto, avisa pelo sistema (notificação do Windows/Android)
 * das provas que estão chegando. Cada prova notifica no máximo uma vez por dia.
 */
export function useNotificacoes(eventos: EventoLembravel[] | undefined, concluidos: Set<string> | undefined, diasAntes: number[], nomeSala: string) {
  useEffect(() => {
    if (!eventos || !concluidos || !suporta() || Notification.permission !== 'granted') return
    for (const ev of eventosParaLembrar(eventos, concluidos, diasAntes)) {
      if (!diasAntes.includes(ev.dias) && ev.dias !== 0) continue
      const chave = chaveNotificacao(ev.id)
      if (ler(chave)) continue
      const quando = ev.dias === 0 ? 'é HOJE' : ev.dias === 1 ? 'é amanhã' : `é em ${ev.dias} dias`
      new Notification(`${ev.titulo} ${quando}`, { body: `Sala ${nomeSala} — Turma ADS`, tag: ev.id })
      gravar(chave)
    }
  }, [eventos, concluidos, diasAntes, nomeSala])
}
