import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

const chave = ['preferencias'] as const
const PADRAO = { email_ativo: true, dias_antes: [1, 3] }

export function usePreferencias() {
  return useQuery({
    queryKey: chave,
    queryFn: async () => {
      const { data, error } = await supabase.from('preferencias_lembrete').select('email_ativo, dias_antes').maybeSingle()
      if (error) throw error
      return data ?? PADRAO
    },
  })
}

export function useSalvarPreferencias() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: { email_ativo: boolean; dias_antes: number[] }) => {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) throw new Error('Sessão expirada.')
      const { error } = await supabase.from('preferencias_lembrete').upsert({ user_id: u.user.id, ...p })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chave }),
  })
}
