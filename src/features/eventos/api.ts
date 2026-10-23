import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Enums } from '../../lib/database.types'

const chave = (turmaId: string) => ['eventos', turmaId] as const

export function useEventos(turmaId: string) {
  return useQuery({
    queryKey: chave(turmaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('id, titulo, tipo, prazo, descricao')
        .eq('turma_id', turmaId)
        .order('prazo')
      if (error) throw error
      // O banco devolve texto (ISO); a tela trabalha com Date.
      return data.map((ev) => ({ ...ev, prazo: new Date(ev.prazo) }))
    },
  })
}

export interface NovoEvento {
  turmaId: string
  titulo: string
  tipo: Enums<'tipo_evento'>
  prazo: Date
}

export function useCriarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ev: NovoEvento) => {
      const { data: usuario } = await supabase.auth.getUser()
      if (!usuario.user) throw new Error('Sessão expirada. Entre de novo.')

      const { error } = await supabase.from('eventos').insert({
        turma_id: ev.turmaId,
        titulo: ev.titulo.trim(),
        tipo: ev.tipo,
        prazo: ev.prazo.toISOString(),
        criado_por: usuario.user.id,
      })
      if (error) throw error
    },
    onSuccess: (_d, ev) => qc.invalidateQueries({ queryKey: chave(ev.turmaId) }),
  })
}
