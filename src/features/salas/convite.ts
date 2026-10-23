/**
 * Link de convite: abre o app já com o código preenchido.
 * Usa "#/" porque o GitHub Pages não sabe lidar com rotas sem o "#".
 */
export function linkConvite(codigo: string, base: string = window.location.origin + window.location.pathname): string {
  return `${base.replace(/#.*$/, '')}#/?codigo=${encodeURIComponent(codigo)}`
}

/** Texto pronto para mandar no grupo. A senha só entra se o líder quiser. */
export function textoConvite(nomeSala: string, codigo: string, link: string, senha?: string): string {
  return [
    `🚀 Entra na sala *${nomeSala}* no Turma ADS!`,
    '',
    `🔑 Código: *${codigo}*`,
    senha ? `🔒 Senha: *${senha}*` : '🔒 Senha: pede pro líder da sala',
    '',
    `👉 ${link}`,
  ].join('\n')
}

export function linkWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}
