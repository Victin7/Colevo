import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Enums } from '../../lib/database.types'

export const chavesEvento = {
  lista: (salaId: string) => ['eventos', salaId] as const,
  concluidos: (salaId: string) => ['concluidos', salaId] as const,
}

export function useEventos(salaId: string) {
  return useQuery({
    queryKey: chavesEvento.lista(salaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('id, titulo, tipo, prazo, descricao, criado_por, materia_id, materias(id, nome, cor, professor)')
        .eq('sala_id', salaId)
        .order('prazo')
      if (error) throw error
      // O banco devolve texto (ISO); a tela trabalha com Date.
      return data.map((ev) => ({ ...ev, prazo: new Date(ev.prazo), materia: ev.materias }))
    },
  })
}

export type Evento = NonNullable<ReturnType<typeof useEventos>['data']>[number]

export interface NovoEvento {
  salaId: string
  titulo: string
  tipo: Enums<'tipo_evento'>
  prazo: Date
  materiaId: string | null
  descricao: string
}

export function useCriarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ev: NovoEvento) => {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) throw new Error('Sessão expirada. Entre de novo.')
      const { error } = await supabase.from('eventos').insert({
        sala_id: ev.salaId,
        titulo: ev.titulo.trim(),
        tipo: ev.tipo,
        prazo: ev.prazo.toISOString(),
        materia_id: ev.materiaId,
        descricao: ev.descricao.trim() || null,
        criado_por: u.user.id,
      })
      if (error) throw error
    },
    onSuccess: (_d, ev) => qc.invalidateQueries({ queryKey: chavesEvento.lista(ev.salaId) }),
  })
}

export function useApagarEvento(salaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error, count } = await supabase.from('eventos').delete({ count: 'exact' }).eq('id', id)
      if (error) throw error
      if (count === 0) throw new Error('Só quem criou ou o líder pode apagar.')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chavesEvento.lista(salaId) }),
  })
}

/** Ids das provas/entregas que EU marquei como feitas nesta sala. */
export function useConcluidos(salaId: string) {
  return useQuery({
    queryKey: chavesEvento.concluidos(salaId),
    queryFn: async () => {
      const { data, error } = await supabase.from('eventos_concluidos').select('evento_id, eventos!inner(sala_id)').eq('eventos.sala_id', salaId)
      if (error) throw error
      return new Set(data.map((c) => c.evento_id))
    },
  })
}

/** Marca/desmarca "já fiz" com atualização otimista: a tela muda na hora, sem esperar o servidor. */
export function useAlternarConcluido(salaId: string) {
  const qc = useQueryClient()
  const chave = chavesEvento.concluidos(salaId)
  return useMutation({
    mutationFn: async ({ eventoId, feito }: { eventoId: string; feito: boolean }) => {
      const { error } = feito
        ? await supabase.from('eventos_concluidos').insert({ evento_id: eventoId })
        : await supabase.from('eventos_concluidos').delete().eq('evento_id', eventoId)
      if (error) throw error
    },
    onMutate: async ({ eventoId, feito }) => {
      await qc.cancelQueries({ queryKey: chave })
      const antes = qc.getQueryData<Set<string>>(chave)
      const novo = new Set(antes)
      if (feito) novo.add(eventoId)
      else novo.delete(eventoId)
      qc.setQueryData(chave, novo)
      return { antes }
    },
    onError: (_e, _v, ctx) => ctx?.antes && qc.setQueryData(chave, ctx.antes), // desfaz se o servidor recusar
    onSettled: () => qc.invalidateQueries({ queryKey: chave }),
  })
}
