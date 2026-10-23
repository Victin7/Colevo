import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { normalizarCodigo } from './codigo'

/**
 * Toda conversa com o banco sobre salas fica aqui.
 * As telas só chamam os hooks e não sabem que existe Supabase.
 */

export const chavesSala = {
  todas: ['salas'] as const,
  sala: (id: string) => ['salas', id] as const,
  membros: (id: string) => ['salas', id, 'membros'] as const,
}

export function useMinhasSalas() {
  return useQuery({
    queryKey: chavesSala.todas,
    queryFn: async () => {
      // O RLS já filtra: só voltam as salas em que sou membro.
      const { data, error } = await supabase.from('salas').select('*, sala_membros(count)').order('criado_em')
      if (error) throw error
      return data.map((s) => ({ ...s, total: (s.sala_membros as unknown as { count: number }[])[0]?.count ?? 0 }))
    },
  })
}

export function useSala(id: string) {
  return useQuery({
    queryKey: chavesSala.sala(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('salas').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return data // null = não existe ou não sou membro
    },
  })
}

export function useMembros(salaId: string) {
  return useQuery({
    queryKey: chavesSala.membros(salaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sala_membros')
        .select('user_id, papel, entrou_em, perfis(nome)')
        .eq('sala_id', salaId)
        .order('entrou_em')
      if (error) throw error
      return data.map((m) => ({ ...m, nome: m.perfis?.nome ?? 'Aluno' }))
    },
  })
}

/** Meu id e meu papel nesta sala (para mostrar botões de líder). */
export function useEu(salaId: string) {
  const membros = useMembros(salaId)
  const sessao = useQuery({
    queryKey: ['usuario'],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
    staleTime: Infinity,
  })
  const id = sessao.data?.id
  const eu = membros.data?.find((m) => m.user_id === id)
  return { id, lider: eu?.papel === 'lider' }
}

export function useCriarSala() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ nome, senha }: { nome: string; senha: string }) => {
      const { data, error } = await supabase.rpc('criar_sala', { p_nome: nome.trim(), p_senha: senha })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chavesSala.todas }),
  })
}

export function useEntrarNaSala() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ codigo, senha }: { codigo: string; senha: string }) => {
      const { data, error } = await supabase.rpc('entrar_na_sala', { p_codigo: normalizarCodigo(codigo), p_senha: senha })
      if (error) throw new Error(error.message)
      // A função devolve vazio quando código ou senha não batem (de propósito, sem dizer qual dos dois).
      if (!data?.id) throw new Error('Código ou senha incorretos.')
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chavesSala.todas }),
  })
}

/** Ações que só mudam algo no servidor e depois recarregam a sala. */
function useAcaoSala<Args>(fn: (args: Args) => PromiseLike<{ error: { message: string } | null }>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: Args) => {
      const { error } = await fn(args)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chavesSala.todas }),
  })
}

export const useSairDaSala = () => useAcaoSala((salaId: string) => supabase.rpc('sair_da_sala', { p_sala: salaId }))
export const useExcluirSala = () => useAcaoSala((salaId: string) => supabase.rpc('lider_excluir_sala', { p_sala: salaId }))
export const useRenomearSala = () =>
  useAcaoSala(({ salaId, nome }: { salaId: string; nome: string }) => supabase.rpc('lider_renomear', { p_sala: salaId, p_nome: nome }))
export const useDefinirSenha = () =>
  useAcaoSala(({ salaId, senha }: { salaId: string; senha: string }) => supabase.rpc('lider_definir_senha', { p_sala: salaId, p_senha: senha }))
export const useNovoCodigo = () => useAcaoSala((salaId: string) => supabase.rpc('lider_novo_codigo', { p_sala: salaId }))
export const useRemoverMembro = () =>
  useAcaoSala(({ salaId, userId }: { salaId: string; userId: string }) => supabase.rpc('lider_remover_membro', { p_sala: salaId, p_user: userId }))
export const useTornarLider = () =>
  useAcaoSala(({ salaId, userId }: { salaId: string; userId: string }) => supabase.rpc('lider_tornar_lider', { p_sala: salaId, p_user: userId }))
