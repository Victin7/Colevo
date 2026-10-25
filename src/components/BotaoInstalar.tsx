import { useEffect, useState } from 'react'

// Evento que o Chrome/Android dispara quando o site pode ser instalado como app
type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

/** Botão "Instalar app" que só aparece quando o navegador permite instalar. */
export function BotaoInstalar() {
  const [evento, setEvento] = useState<EventoInstalar | null>(null)

  useEffect(() => {
    const guardar = (e: Event) => {
      e.preventDefault() // segura o aviso padrão do navegador para mostrar o nosso botão
      setEvento(e as EventoInstalar)
    }
    const instalado = () => setEvento(null)
    window.addEventListener('beforeinstallprompt', guardar)
    window.addEventListener('appinstalled', instalado)
    return () => {
      window.removeEventListener('beforeinstallprompt', guardar)
      window.removeEventListener('appinstalled', instalado)
    }
  }, [])

  if (!evento) return null
  return (
    <button
      onClick={async () => {
        await evento.prompt()
        await evento.userChoice
        setEvento(null)
      }}
      className="rounded-lg px-3 py-2 text-blue-300 hover:bg-white/5"
      title="Instalar como app"
    >
      📲<span className="hidden sm:inline"> Instalar</span>
    </button>
  )
}
