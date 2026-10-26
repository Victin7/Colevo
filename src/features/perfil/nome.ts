export const NOME_MIN = 2
export const NOME_MAX = 40

/** Tira espaços sobrando: "  Victor   Anjos " → "Victor Anjos" */
export function limparNome(nome: string): string {
  return nome.replace(/\s+/g, ' ').trim()
}

export function erroNoNome(nome: string): string | null {
  const n = limparNome(nome)
  if (n.length < NOME_MIN) return `Use pelo menos ${NOME_MIN} letras.`
  if (n.length > NOME_MAX) return `Use no máximo ${NOME_MAX} caracteres.`
  return null
}

/** Nome que veio do começo do e-mail (ex: "victor.anjos1011"): vale sugerir que a pessoa troque. */
export function pareceEmail(nome: string): boolean {
  return !/\s/.test(nome.trim()) && /[\d._-]/.test(nome)
}
