import { useEffect, type ButtonHTMLAttributes, type CSSProperties, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

export function Botao({ variante = 'primario', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'fantasma' | 'perigo' | 'contorno' }) {
  const estilos = {
    primario:
      'bg-gradient-to-r from-indigo-400 to-fuchsia-400 text-zinc-950 shadow-[0_8px_24px_-8px_rgba(165,180,252,0.7)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(232,121,249,0.7)] active:translate-y-0',
    fantasma: 'text-zinc-300 hover:bg-white/5',
    perigo: 'border border-red-400/30 text-red-300 hover:bg-red-500/10',
    contorno: 'border border-white/10 text-zinc-200 hover:border-indigo-400/50 hover:bg-white/5',
  }
  return (
    <button
      className={`rounded-lg px-4 py-2 font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    />
  )
}

const estiloEntrada =
  'w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 outline-none transition focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(129,140,248,0.2)]'

export function Campo({ rotulo, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { rotulo: string }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-sm text-zinc-400">{rotulo}</span>
      <input className={estiloEntrada} {...props} />
    </label>
  )
}

export function AreaTexto({ rotulo, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { rotulo: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-400">{rotulo}</span>
      <textarea className={`${estiloEntrada} min-h-24`} {...props} />
    </label>
  )
}

export function Seletor({ rotulo, children, className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement> & { rotulo: string }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="text-sm text-zinc-400">{rotulo}</span>
      <select className={estiloEntrada} {...props}>{children}</select>
    </label>
  )
}

export function Cartao({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`vidro rounded-2xl p-4 ${className}`} style={style}>{children}</div>
}

export function Erro({ erro }: { erro: unknown }) {
  if (!erro) return null
  const msg = erro instanceof Error ? erro.message : typeof erro === 'object' && erro && 'message' in erro ? String(erro.message) : String(erro)
  return <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{msg}</p>
}

export function Vazio({ icone, titulo, children }: { icone: string; titulo: string; children?: ReactNode }) {
  return (
    <div className="vidro entrar-3d rounded-2xl px-6 py-10 text-center">
      <div className="mb-2 text-4xl">{icone}</div>
      <p className="font-semibold">{titulo}</p>
      {children && <div className="mt-1 text-sm text-zinc-400">{children}</div>}
    </div>
  )
}

/** Janela sobreposta simples. Fecha com Esc ou clicando fora. */
export function Modal({ aberto, aoFechar, titulo, children }: { aberto: boolean; aoFechar: () => void; titulo: string; children: ReactNode }) {
  useEffect(() => {
    if (!aberto) return
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [aberto, aoFechar])

  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={aoFechar}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className="vidro entrar-3d w-full max-w-md rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{titulo}</h2>
          <button onClick={aoFechar} aria-label="Fechar" className="rounded-md px-2 text-xl text-zinc-400 hover:bg-white/5">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function BarraProgresso({ valor, total }: { valor: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((valor / total) * 100)
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-300 transition-[width] duration-700" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Atraso escalonado para a animação de entrada: cada item entra um pouco depois do anterior. */
export const atraso = (i: number): CSSProperties => ({ animationDelay: `${Math.min(i, 8) * 70}ms` })

/** Bolinha com a cor da matéria. */
export function PontoCor({ cor, className = '' }: { cor: string; className?: string }) {
  return <span className={`inline-block size-2.5 shrink-0 rounded-full ${className}`} style={{ background: cor, boxShadow: `0 0 10px ${cor}` }} />
}
