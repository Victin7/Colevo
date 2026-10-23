import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

/**
 * Card que inclina em 3D seguindo o mouse, com um reflexo de luz.
 * Só reage a mouse (no celular o toque é para rolar, não para inclinar).
 * Atualiza variáveis CSS direto no elemento: nenhum re-render do React a cada movimento.
 */
export function Tilt({
  children,
  className = '',
  max = 9,
  style,
}: {
  children: ReactNode
  className?: string
  max?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  function mover(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width // 0..1
    const y = (e.clientY - r.top) / r.height
    const s = ref.current.style
    s.setProperty('--rx', `${(0.5 - y) * max}deg`)
    s.setProperty('--ry', `${(x - 0.5) * max}deg`)
    s.setProperty('--gx', `${x * 100}%`)
    s.setProperty('--gy', `${y * 100}%`)
    s.setProperty('--brilho', '1')
  }

  function sair() {
    const s = ref.current?.style
    if (!s) return
    s.setProperty('--rx', '0deg')
    s.setProperty('--ry', '0deg')
    s.setProperty('--brilho', '0')
  }

  return (
    <div ref={ref} onPointerMove={mover} onPointerLeave={sair} className={`tilt ${className}`} style={style}>
      {children}
      <div className="tilt-brilho" aria-hidden="true" />
    </div>
  )
}
