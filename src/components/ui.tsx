import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export function Botao({ variante = 'primario', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'fantasma' }) {
  const estilos = {
    primario: 'bg-indigo-400 text-zinc-950 hover:bg-indigo-300',
    fantasma: 'text-zinc-300 hover:bg-zinc-800',
  }
  return (
    <button
      className={`rounded-lg px-4 py-2 font-medium transition disabled:opacity-50 ${estilos[variante]} ${className}`}
      {...props}
    />
  )
}

export function Campo({ rotulo, ...props }: InputHTMLAttributes<HTMLInputElement> & { rotulo: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-400">{rotulo}</span>
      <input
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-indigo-400"
        {...props}
      />
    </label>
  )
}

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-zinc-800 bg-zinc-900 p-4 ${className}`}>{children}</div>
}

export function Erro({ erro }: { erro: unknown }) {
  if (!erro) return null
  const msg = erro instanceof Error ? erro.message : String(erro)
  return <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{msg}</p>
}
