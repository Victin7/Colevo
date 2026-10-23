import { Component, lazy, Suspense, type ReactNode } from 'react'

// Three.js só é baixado quando o fundo aparece (chunk separado no build).
const Cena3D = lazy(() => import('./Cena3D'))

/** Gradiente estático: aparece enquanto o 3D carrega e se o aparelho não tiver WebGL. */
function GradienteFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_10%,rgba(129,140,248,0.18),transparent_50%),radial-gradient(ellipse_at_80%_90%,rgba(232,121,249,0.14),transparent_50%)]"
    />
  )
}

function temWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Se a cena 3D quebrar por qualquer motivo, o app continua funcionando com o gradiente. */
class LimiteDeErro extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false }
  static getDerivedStateFromError() {
    return { erro: true }
  }
  render() {
    return this.state.erro ? <GradienteFallback /> : this.props.children
  }
}

export function Fundo3D() {
  if (!temWebGL()) return <GradienteFallback />
  return (
    <>
      <GradienteFallback />
      <LimiteDeErro>
        <Suspense fallback={null}>
          <Cena3D />
        </Suspense>
      </LimiteDeErro>
    </>
  )
}
