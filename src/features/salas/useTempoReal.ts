import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

/**
 * Escuta mudanças da sala no banco (Supabase Realtime).
 * Quando um colega adiciona uma prova, a lista de todo mundo atualiza sozinha.
 * O RLS também vale aqui: ninguém recebe mudanças de salas em que não está.
 */
export function useTempoReal(salaId: string) {
  const qc = useQueryClient()

  useEffect(() => {
    const recarregar = (tabela: string) => () => qc.invalidateQueries({ queryKey: [tabela, salaId] })
    const filtro = `sala_id=eq.${salaId}`
    const canal = supabase.channel(`sala:${salaId}`)

    for (const tabela of ['eventos', 'materias', 'materiais'] as const) {
      canal
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: tabela, filter: filtro }, recarregar(tabela))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tabela, filter: filtro }, recarregar(tabela))
        // DELETE não pode ser filtrado por coluna no Realtime; só dispara um recarregamento barato.
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: tabela }, recarregar(tabela))
    }
    canal.subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [salaId, qc])
}
