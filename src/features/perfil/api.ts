import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

const chave = ['perfil'] as const

async function meuId() {
  const { data } = await supabase.auth.getSession()
  const id = data.session?.user.id
  if (!id) throw new Error('Sessão expirada. Entre de novo.')
  return id
}

export function useMeuPerfil() {
  return useQuery({
    queryKey: chave,
    queryFn: async () => {
      const { data, error } = await supabase.from('perfis').select('nome').eq('id', await meuId()).single()
      if (error) throw error
      return data
    },
  })
}

export function useSalvarNome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.from('perfis').update({ nome }).eq('id', await meuId())
      if (error) throw error
    },
    // O nome aparece em membros, materiais e no topo: recarrega tudo
    onSuccess: () => qc.invalidateQueries(),
  })
}
