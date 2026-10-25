import { useState } from 'react'

/** Código da sala em letras grandes, cada uma num "bloquinho" 3D, como no lobby do Among Us. */
export function CodigoGrande({ codigo, tamanho = 'g' }: { codigo: string; tamanho?: 'g' | 'p' }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    } catch {
      /* navegador sem permissão de área de transferência: ignora */
    }
  }

  const caixa = tamanho === 'g' ? 'size-11 text-2xl sm:size-12 sm:text-3xl' : 'size-7 text-base'
  return (
    <button onClick={copiar} title="Copiar código" className="group inline-flex flex-col items-center gap-1" aria-label={`Código ${codigo}. Clique para copiar`}>
      <span className="flex gap-1.5" style={{ perspective: 600 }}>
        {codigo.split('').map((letra, i) => (
          <span
            key={i}
            className={`${caixa} grid place-items-center rounded-lg bg-gradient-to-b from-zinc-100 to-zinc-300 font-mono font-black text-zinc-900 shadow-[0_4px_0_#3b82f6,0_10px_18px_-6px_rgba(59,130,246,0.6)] transition group-hover:-translate-y-0.5`}
            style={{ transform: `rotateX(12deg)`, transitionDelay: `${i * 25}ms` }}
          >
            {letra}
          </span>
        ))}
      </span>
      <span className="text-xs text-zinc-500 group-hover:text-zinc-300">{copiado ? '✓ copiado!' : 'clique para copiar'}</span>
    </button>
  )
}
