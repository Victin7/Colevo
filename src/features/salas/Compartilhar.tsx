import { useState } from 'react'
import { Botao } from '../../components/ui'
import { linkConvite, linkWhatsApp, textoConvite } from './convite'

/** Botões para chamar a turma: WhatsApp e copiar link. */
export function Compartilhar({ nome, codigo, senha }: { nome: string; codigo: string; senha?: string }) {
  const [copiado, setCopiado] = useState(false)
  const link = linkConvite(codigo)
  const texto = textoConvite(nome, codigo, link, senha)

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    } catch {
      /* ignora */
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={linkWhatsApp(texto)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-zinc-950 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.9)] transition hover:-translate-y-0.5"
      >
        <span aria-hidden>💬</span> Chamar no WhatsApp
      </a>
      <Botao variante="contorno" onClick={copiarLink}>{copiado ? '✓ Convite copiado' : '🔗 Copiar convite'}</Botao>
    </div>
  )
}
