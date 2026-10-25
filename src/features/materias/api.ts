import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

/** Paleta pensada para o fundo escuro: todas com bom contraste. */
export const CORES_MATERIA = ['#60a5fa', '#a78bfa', '#22d3ee', '#2dd4bf', '#fde047', '#fdba74', '#fca5a5', '#c4b5fd']

const chave = (salaId: string) => ['materias', salaId] as const

export function useMaterias(salaId: string) {
  return useQuery({
    queryKey: chave(salaId),
    queryFn: async () => {
      const { data, error } = await supabase.from('materias').select('*').eq('sala_id', salaId).order('nome')
      if (error) throw error
      return data
    },
  })
}

export function useCriarMateria(salaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (m: { nome: string; professor: string; cor: string }) => {
      const { error } = await supabase.from('materias').insert({ sala_id: salaId, nome: m.nome.trim(), professor: m.professor.trim() || null, cor: m.cor })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chave(salaId) }),
  })
}

export function useEditarMateria(salaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...m }: { id: string; nome: string; professor: string; cor: string }) => {
      const { error } = await supabase.from('materias').update({ nome: m.nome.trim(), professor: m.professor.trim() || null, cor: m.cor }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chave(salaId) })
      qc.invalidateQueries({ queryKey: ['eventos', salaId] }) // eventos mostram a cor da matéria
    },
  })
}

export function useApagarMateria(salaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('materias').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: chave(salaId) })
      qc.invalidateQueries({ queryKey: ['eventos', salaId] })
      qc.invalidateQueries({ queryKey: ['materiais', salaId] })
    },
  })
}
