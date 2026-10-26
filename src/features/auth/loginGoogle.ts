import { supabase } from '../../lib/supabase'

const CHAVE_CONVITE = 'colevo:codigo-pendente'

/** Endereço do app sem o "#/..." — é para onde o Google devolve a pessoa. */
export function enderecoDeRetorno(local: Pick<Location, 'origin' | 'pathname'> = window.location): string {
  return local.origin + local.pathname
}

/** Se a pessoa chegou por um link de convite (#/?codigo=...), devolve o código. */
export function codigoNoEndereco(hash: string = window.location.hash): string | null {
  const consulta = hash.split('?')[1]
  if (!consulta) return null
  const codigo = new URLSearchParams(consulta).get('codigo')
  return codigo ? codigo.replace(/^"|"$/g, '') : null
}

/**
 * Entrar com Google. O Google não preserva o "#/?codigo=" do convite,
 * então o código fica guardado e é recuperado quando a pessoa volta.
 */
export async function entrarComGoogle() {
  const codigo = codigoNoEndereco()
  try {
    if (codigo) sessionStorage.setItem(CHAVE_CONVITE, codigo)
  } catch {
    /* modo privado: segue sem o código */
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: enderecoDeRetorno(), queryParams: { prompt: 'select_account' } },
  })
  if (error) {
    throw new Error(error.message.includes('not enabled') ? 'O login com Google ainda não foi ativado.' : error.message)
  }
}

/** Pega (uma vez só) o código de convite guardado antes de ir para o Google. */
export function retirarConvitePendente(): string | null {
  try {
    const codigo = sessionStorage.getItem(CHAVE_CONVITE)
    sessionStorage.removeItem(CHAVE_CONVITE)
    return codigo
  } catch {
    return null
  }
}

/** Depois do login, tira o "?code=..." da barra de endereço (fica feio e não serve mais). */
export function limparCodigoDaUrl() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('code')) return
  url.searchParams.delete('code')
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

/** Nome para mostrar: o que a pessoa digitou no cadastro ou o nome da conta Google. */
export function nomeDoUsuario(meta: Record<string, unknown>, email?: string): string {
  const nome = [meta.nome, meta.full_name, meta.name].find((v) => typeof v === 'string' && v.trim())
  return (nome as string | undefined) ?? email?.split('@')[0] ?? 'Aluno'
}
