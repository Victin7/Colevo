import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { normalizarCodigo } from './codigo'

/**
 * Toda conversa com o banco sobre turmas fica aqui.
 * As telas só chamam os hooks e não sabem que existe Supabase:
 * se um dia trocar o backend, só este arquivo muda.
 */

export const chaves = {
  turmas: ['turmas'] as const,
  turma: (id: string) => ['turmas', id] as const,
}

export function useMinhasTurmas() {
  return useQuery({
    queryKey: chaves.turmas,
    queryFn: async () => {
      // O RLS já filtra: só voltam as turmas em que sou membro.
      const { data, error } = await supabase.from('turmas').select('*').order('criado_em')
      if (error) throw error
      return data
    },
  })
}

export function useTurma(id: string) {
  return useQuery({
    queryKey: chaves.turma(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('turmas').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
  })
}

export function useCriarTurma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase.rpc('criar_turma', { p_nome: nome.trim() })
      if (error) throw error
      return data
    },
    // Depois de criar, a lista de turmas está desatualizada: manda recarregar.
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.turmas }),
  })
}

export function useEntrarNaTurma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (codigo: string) => {
      const { data, error } = await supabase.rpc('entrar_na_turma', { p_codigo: normalizarCodigo(codigo) })
      if (error) throw new Error(error.message.includes('inválido') ? 'Código de convite inválido.' : error.message)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chaves.turmas }),
  })
}
