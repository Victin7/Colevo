/**
 * Instalação como app (PWA).
 *
 * O Chrome/Android avisa que dá para instalar com o evento "beforeinstallprompt",
 * às vezes antes do React montar a tela; por isso ele é capturado aqui, assim que
 * o script carrega. O iPhone nunca dispara esse evento: lá a instalação é manual.
 */

export type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let guardado: EventoInstalar | null = null
const ouvintes = new Set<() => void>()
const avisar = () => ouvintes.forEach((f) => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // segura o aviso padrão para usarmos o nosso botão
    guardado = e as EventoInstalar
    avisar()
  })
  window.addEventListener('appinstalled', () => {
    guardado = null
    avisar()
  })
}

export const eventoInstalar = () => guardado
export function aoMudarInstalar(f: () => void) {
  ouvintes.add(f)
  return () => void ouvintes.delete(f)
}
export function usarEventoInstalar() {
  guardado = null
  avisar()
}

/** Já está aberto como app instalado? */
export function rodandoComoApp(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}

export type Plataforma = 'iphone-safari' | 'iphone-outro' | 'android' | 'app-interno' | 'computador'

/** Descobre o aparelho/navegador para mostrar o passo a passo certo. */
export function plataforma(ua: string, toque = 0): Plataforma {
  if (/Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\/|TikTok|musical_ly|; wv\)/i.test(ua)) return 'app-interno'
  // iPad novo se apresenta como Mac, mas tem tela de toque
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && toque > 1)
  if (ios) return /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua) ? 'iphone-outro' : 'iphone-safari'
  if (/Android/i.test(ua)) return 'android'
  return 'computador'
}
