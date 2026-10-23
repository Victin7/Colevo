/** Nome de arquivo seguro para o Storage: sem acentos, espaços ou símbolos. */
export function nomeSeguro(nome: string): string {
  const [base, ext] = /^(.*?)(\.[^.]+)?$/.exec(nome)!.slice(1)
  const limpo = base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
  return `${limpo.slice(0, 60) || 'arquivo'}${(ext ?? '').toLowerCase()}`
}
