import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

export function Botao({ variante = 'primario', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'fantasma' }) {
  const estilos = {
    primario:
      'bg-gradient-to-r from-indigo-400 to-fuchsia-400 text-zinc-950 shadow-[0_8px_24px_-8px_rgba(165,180,252,0.7)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(232,121,249,0.7)] active:translate-y-0',
    fantasma: 'text-zinc-300 hover:bg-white/5',
  }
  return (
    <button
      className={`rounded-lg px-4 py-2 font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    />
  )
}

export function Campo({ rotulo, ...props }: InputHTMLAttributes<HTMLInputElement> & { rotulo: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-400">{rotulo}</span>
      <input
        className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2 outline-none transition focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(129,140,248,0.2)]"
        {...props}
      />
    </label>
  )
}

export function Cartao({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`vidro rounded-2xl p-4 ${className}`} style={style}>{children}</div>
}

export function Erro({ erro }: { erro: unknown }) {
  if (!erro) return null
  const msg = erro instanceof Error ? erro.message : String(erro)
  return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{msg}</p>
}

/** Atraso escalonado para a animação de entrada: cada item entra um pouco depois do anterior. */
export const atraso = (i: number): CSSProperties => ({ animationDelay: `${Math.min(i, 8) * 70}ms` })
