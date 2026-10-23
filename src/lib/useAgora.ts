import { useEffect, useState } from 'react'

/** Data/hora atual que se atualiza sozinha (padrão: a cada 30s). Usado na contagem regressiva. */
export function useAgora(intervaloMs = 30_000): Date {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), intervaloMs)
    return () => clearInterval(id)
  }, [intervaloMs])
  return agora
}
