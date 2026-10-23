import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Enums } from '../../lib/database.types'
import { nomeSeguro } from './nome'

const chave = (salaId: string) => ['materiais', salaId] as const
const BUCKET = 'materiais'
export const TAMANHO_MAXIMO = 10 * 1024 * 1024 // 10 MB (mesmo limite do bucket)

export function useMateriais(salaId: string) {
  return useQuery({
    queryKey: chave(salaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais')
        .select('*, materias(nome, cor), perfis(nome), materiais_curtidas(user_id)')
        .eq('sala_id', salaId)
        .order('criado_em', { ascending: false })
      if (error) throw error
      return data.map((m) => ({
        ...m,
        autor: m.perfis?.nome ?? 'Aluno',
        curtidas: m.materiais_curtidas.map((c) => c.user_id),
      }))
    },
  })
}

export type Material = NonNullable<ReturnType<typeof useMateriais>['data']>[number]

export interface NovoMaterial {
  materiaId: string
  tipo: Enums<'tipo_material'>
  titulo: string
  url?: string
  conteudo?: string
  arquivo?: File
}

export function useCriarMaterial(salaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (m: NovoMaterial) => {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) throw new Error('Sessão expirada. Entre de novo.')

      let arquivo_path: string | null = null
      if (m.tipo === 'arquivo') {
        if (!m.arquivo) throw new Error('Escolha um arquivo.')
        if (m.arquivo.size > TAMANHO_MAXIMO) throw new Error('Arquivo maior que 10 MB.')
        // A primeira pasta é o id da sala: é isso que a regra de segurança do Storage confere.
        arquivo_path = `${salaId}/${crypto.randomUUID()}-${nomeSeguro(m.arquivo.name)}`
        const { error } = await supabase.storage.from(BUCKET).upload(arquivo_path, m.arquivo, { contentType: m.arquivo.type })
        if (error) throw new Error(error.message.includes('mime') ? 'Tipo de arquivo não aceito (use PDF, imagem, Word ou PowerPoint).' : error.message)
      }

      const url = m.tipo === 'link' && m.url ? (/^https?:\/\//i.test(m.url) ? m.url : `https://${m.url}`) : null
      const { error } = await supabase.from('materiais').insert({
        sala_id: salaId,
        materia_id: m.materiaId,
        tipo: m.tipo,
        titulo: m.titulo.trim(),
        url,
        conteudo: m.tipo === 'nota' ? m.conteudo?.trim() : null,
        arquivo_path,
        criado_por: u.user.id,
      })
      if (error) {
        if (arquivo_path) await supabase.storage.from(BUCKET).remove([arquivo_path]) // não deixa arquivo órfão
        throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chave(salaId) }),
  })
}

export function useApagarMaterial(salaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (m: Material) => {
      const { error, count } = await supabase.from('materiais').delete({ count: 'exact' }).eq('id', m.id)
      if (error) throw error
      if (count === 0) throw new Error('Só quem enviou ou o líder pode apagar.')
      if (m.arquivo_path) await supabase.storage.from(BUCKET).remove([m.arquivo_path])
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chave(salaId) }),
  })
}

export function useCurtir(salaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ materialId, curtir }: { materialId: string; curtir: boolean }) => {
      const { error } = curtir
        ? await supabase.from('materiais_curtidas').insert({ material_id: materialId })
        : await supabase.from('materiais_curtidas').delete().eq('material_id', materialId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chave(salaId) }),
  })
}

/** Links de arquivo são temporários (1h): ninguém de fora da sala consegue abrir. */
export async function abrirArquivo(path: string) {
  const janela = window.open('', '_blank') // abre já, para o navegador não bloquear o pop-up
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error || !data) {
    janela?.close()
    throw error ?? new Error('Não foi possível abrir o arquivo.')
  }
  if (janela) janela.location.href = data.signedUrl
  else window.location.href = data.signedUrl
}
