import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Cena 3D de fundo: formas geométricas flutuando num "céu" de estrelas.
 * Fica atrás de tudo (z-index negativo) e não captura cliques.
 * Este arquivo é carregado sob demanda (React.lazy) para não pesar o primeiro acesso.
 */

const CORES = ['#a5b4fc', '#c4b5fd', '#f0abfc', '#7dd3fc']

type Forma = 'icosaedro' | 'toro' | 'octaedro' | 'cubo'

const FORMAS: { tipo: Forma; pos: [number, number, number]; escala: number; cor: string; vel: number }[] = [
  { tipo: 'icosaedro', pos: [-4.2, 1.8, -1], escala: 0.9, cor: CORES[0], vel: 0.6 },
  { tipo: 'toro', pos: [4.4, -1.6, -2], escala: 0.8, cor: CORES[2], vel: 0.45 },
  { tipo: 'octaedro', pos: [3.6, 2.4, -3], escala: 0.7, cor: CORES[3], vel: 0.7 },
  { tipo: 'cubo', pos: [-3.4, -2.2, -2], escala: 0.65, cor: CORES[1], vel: 0.5 },
  { tipo: 'icosaedro', pos: [0.6, -3.2, -5], escala: 0.6, cor: CORES[3], vel: 0.55 },
  { tipo: 'octaedro', pos: [-1.2, 3.3, -6], escala: 0.55, cor: CORES[2], vel: 0.65 },
]

function Geometria({ tipo }: { tipo: Forma }) {
  switch (tipo) {
    case 'icosaedro': return <icosahedronGeometry args={[1, 0]} />
    case 'toro': return <torusGeometry args={[0.8, 0.32, 16, 48]} />
    case 'octaedro': return <octahedronGeometry args={[1, 0]} />
    case 'cubo': return <boxGeometry args={[1.3, 1.3, 1.3]} />
  }
}

function Flutuante({ tipo, pos, escala, cor, vel }: (typeof FORMAS)[number]) {
  const ref = useRef<THREE.Mesh>(null)
  const fase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((estado, delta) => {
    const m = ref.current
    if (!m) return
    const t = estado.clock.elapsedTime * vel + fase
    m.rotation.x += delta * 0.25 * vel
    m.rotation.y += delta * 0.35 * vel
    m.position.y = pos[1] + Math.sin(t) * 0.35 // sobe e desce suave
  })

  return (
    <group>
      <mesh ref={ref} position={pos} scale={escala}>
        <Geometria tipo={tipo} />
        <meshStandardMaterial color={cor} metalness={0.35} roughness={0.25} flatShading emissive={cor} emissiveIntensity={0.12} />
      </mesh>
      {/* Contorno em arame levemente maior: dá o ar "tech" */}
      <mesh position={pos} scale={escala * 1.18}>
        <Geometria tipo={tipo} />
        <meshBasicMaterial color={cor} wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

function Estrelas({ quantidade = 900 }) {
  const ref = useRef<THREE.Points>(null)
  const posicoes = useMemo(() => {
    const arr = new Float32Array(quantidade * 3)
    for (let i = 0; i < quantidade; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40
      arr[i * 3 + 2] = -Math.random() * 30
    }
    return arr
  }, [quantidade])

  useFrame((_e, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.01
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[posicoes, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#c7d2fe" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

/** Gira o grupo inteiro levemente na direção do mouse (efeito parallax). */
function Parallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((estado, delta) => {
    const g = ref.current
    if (!g) return
    const k = 1 - Math.exp(-delta * 3) // suavização independente do FPS
    g.rotation.y += (estado.pointer.x * 0.25 - g.rotation.y) * k
    g.rotation.x += (-estado.pointer.y * 0.15 - g.rotation.x) * k
  })
  return <group ref={ref}>{children}</group>
}

export default function Cena3D() {
  const reduzirMovimento = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const celular = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 55 }}
        frameloop={reduzirMovimento ? 'demand' : 'always'}
        // Os eventos vêm da página inteira, assim o parallax funciona mesmo com o canvas atrás do conteúdo
        eventSource={document.getElementById('root')!}
        eventPrefix="client"
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <fog attach="fog" args={['#09090b', 6, 22]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 6, 5]} intensity={1.2} />
        <pointLight position={[-6, -3, 2]} intensity={30} color="#818cf8" />
        <pointLight position={[6, 3, 1]} intensity={25} color="#e879f9" />
        <Parallax>
          {(celular ? FORMAS.slice(0, 4) : FORMAS).map((f, i) => (
            // Tela estreita: aproxima as formas do centro e diminui, para aparecerem atrás do conteúdo
            <Flutuante key={i} {...f} pos={celular ? [f.pos[0] * 0.42, f.pos[1] * 1.25, f.pos[2] - 3] : f.pos} escala={celular ? f.escala * 0.75 : f.escala} />
          ))}
          <Estrelas quantidade={celular ? 450 : 900} />
        </Parallax>
      </Canvas>
    </div>
  )
}
