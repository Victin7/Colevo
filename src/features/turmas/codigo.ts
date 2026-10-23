/** Códigos de convite têm 6 caracteres hexadecimais (ex: "A1B2C3"). */
export const TAMANHO_CODIGO = 6

/** Limpa o que o colega digitou ou colou: espaços, traços, minúsculas. */
export function normalizarCodigo(entrada: string): string {
  return entrada.replace(/[\s-]/g, '').toUpperCase()
}

export function codigoValido(entrada: string): boolean {
  return /^[0-9A-F]{6}$/.test(normalizarCodigo(entrada))
}
