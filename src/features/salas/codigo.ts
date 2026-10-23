/** Códigos têm 6 caracteres, como no Among Us (ex: "K7QX2M"). */
export const TAMANHO_CODIGO = 6

/** Limpa o que o colega digitou ou colou: espaços, traços, minúsculas. */
export function normalizarCodigo(entrada: string): string {
  return entrada.replace(/[\s-]/g, '').toUpperCase()
}

/** Aceita letras e números (as salas antigas usam hexadecimal, as novas evitam O/0 e I/1). */
export function codigoValido(entrada: string): boolean {
  return /^[A-Z0-9]{6}$/.test(normalizarCodigo(entrada))
}

export const SENHA_MINIMA = 4
