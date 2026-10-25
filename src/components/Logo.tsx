import simbolo from '../assets/colevo-simbolo.png'
import nome from '../assets/colevo-nome.png'
import logoCompleta from '../assets/colevo-logo.png'

export const MARCA = 'Colevo'
export const SLOGAN = 'Crescemos juntos.'

/**
 * Logo do Colevo (coletivo + evolução).
 * "cabecalho": símbolo + nome, pequeno. "completa": com o slogan, para a tela de entrada.
 * Usa a versão com letras claras, feita para o fundo escuro do app.
 */
export function Logo({ variante = 'cabecalho', className = '' }: { variante?: 'cabecalho' | 'completa'; className?: string }) {
  if (variante === 'completa') {
    return <img src={logoCompleta} alt={`${MARCA} — ${SLOGAN}`} className={`h-auto w-full select-none ${className}`} draggable={false} />
  }
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={simbolo} alt="" className="h-7 w-auto select-none" draggable={false} />
      <img src={nome} alt={MARCA} className="h-4 w-auto select-none" draggable={false} />
    </span>
  )
}
