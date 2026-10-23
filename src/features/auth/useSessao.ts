import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

/**
 * Devolve a sessão atual e reage a login/logout.
 * undefined = ainda carregando; null = deslogado.
 */
export function useSessao() {
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => setSessao(novaSessao))
    // Limpa a inscrição quando o componente sai da tela (evita vazamento).
    return () => data.subscription.unsubscribe()
  }, [])

  return sessao
}
