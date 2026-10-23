/**
 * Contagem regressiva curta para prazos próximos.
 * Devolve null quando falta mais de 24h (aí o "em X dias" já basta).
 */
export function contagem(prazo: Date, agora: Date): string | null {
  const ms = prazo.getTime() - agora.getTime()
  if (ms <= 0) return null
  const minutos = Math.ceil(ms / 60_000)
  if (minutos > 24 * 60) return null
  if (minutos < 60) return `faltam ${minutos}min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m === 0 ? `faltam ${h}h` : `faltam ${h}h${String(m).padStart(2, '0')}`
}
