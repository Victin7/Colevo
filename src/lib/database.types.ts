// Gerado a partir do schema do Supabase e compactado à mão.
// Para regenerar: npx supabase gen types typescript --project-id ygahwxxzzqmqcdenjqiz > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Rel<Nome extends string, Col extends string, Tabela extends string> = {
  foreignKeyName: Nome
  columns: [Col]
  isOneToOne: false
  referencedRelation: Tabela
  referencedColumns: ['id']
}

type E = Database['public']['Enums']

type SalaRow = { codigo: string; criado_em: string; criado_por: string; id: string; nome: string }

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.18' }
  public: {
    Tables: {
      salas: {
        Row: SalaRow
        Insert: { codigo?: string; criado_em?: string; criado_por: string; id?: string; nome: string }
        Update: Partial<SalaRow>
        Relationships: [Rel<'turmas_criado_por_fkey', 'criado_por', 'perfis'>]
      }
      sala_membros: {
        Row: { entrou_em: string; papel: E['papel_membro']; sala_id: string; user_id: string }
        Insert: { entrou_em?: string; papel?: E['papel_membro']; sala_id: string; user_id: string }
        Update: { entrou_em?: string; papel?: E['papel_membro']; sala_id?: string; user_id?: string }
        Relationships: [
          Rel<'turma_membros_turma_id_fkey', 'sala_id', 'salas'>,
          Rel<'turma_membros_user_id_fkey', 'user_id', 'perfis'>,
        ]
      }
      perfis: {
        Row: { criado_em: string; id: string; nome: string }
        Insert: { criado_em?: string; id: string; nome: string }
        Update: { criado_em?: string; id?: string; nome?: string }
        Relationships: []
      }
      materias: {
        Row: { cor: string; id: string; nome: string; professor: string | null; sala_id: string }
        Insert: { cor?: string; id?: string; nome: string; professor?: string | null; sala_id: string }
        Update: { cor?: string; id?: string; nome?: string; professor?: string | null; sala_id?: string }
        Relationships: [Rel<'materias_turma_id_fkey', 'sala_id', 'salas'>]
      }
      eventos: {
        Row: { criado_em: string; criado_por: string; descricao: string | null; id: string; materia_id: string | null; prazo: string; sala_id: string; tipo: E['tipo_evento']; titulo: string }
        Insert: { criado_em?: string; criado_por: string; descricao?: string | null; id?: string; materia_id?: string | null; prazo: string; sala_id: string; tipo: E['tipo_evento']; titulo: string }
        Update: { criado_em?: string; criado_por?: string; descricao?: string | null; id?: string; materia_id?: string | null; prazo?: string; sala_id?: string; tipo?: E['tipo_evento']; titulo?: string }
        Relationships: [
          Rel<'eventos_criado_por_fkey', 'criado_por', 'perfis'>,
          Rel<'eventos_materia_id_fkey', 'materia_id', 'materias'>,
          Rel<'eventos_turma_id_fkey', 'sala_id', 'salas'>,
        ]
      }
      eventos_concluidos: {
        Row: { concluido_em: string; evento_id: string; user_id: string }
        Insert: { concluido_em?: string; evento_id: string; user_id?: string }
        Update: { concluido_em?: string; evento_id?: string; user_id?: string }
        Relationships: [
          Rel<'eventos_concluidos_evento_id_fkey', 'evento_id', 'eventos'>,
          Rel<'eventos_concluidos_user_id_fkey', 'user_id', 'perfis'>,
        ]
      }
      materiais: {
        Row: { arquivo_path: string | null; conteudo: string | null; criado_em: string; criado_por: string; id: string; materia_id: string; sala_id: string; tipo: E['tipo_material']; titulo: string; url: string | null }
        Insert: { arquivo_path?: string | null; conteudo?: string | null; criado_em?: string; criado_por: string; id?: string; materia_id: string; sala_id: string; tipo: E['tipo_material']; titulo: string; url?: string | null }
        Update: { arquivo_path?: string | null; conteudo?: string | null; criado_em?: string; criado_por?: string; id?: string; materia_id?: string; sala_id?: string; tipo?: E['tipo_material']; titulo?: string; url?: string | null }
        Relationships: [
          Rel<'materiais_criado_por_fkey', 'criado_por', 'perfis'>,
          Rel<'materiais_materia_id_fkey', 'materia_id', 'materias'>,
          Rel<'materiais_turma_id_fkey', 'sala_id', 'salas'>,
        ]
      }
      materiais_curtidas: {
        Row: { material_id: string; user_id: string }
        Insert: { material_id: string; user_id?: string }
        Update: { material_id?: string; user_id?: string }
        Relationships: [
          Rel<'materiais_curtidas_material_id_fkey', 'material_id', 'materiais'>,
          Rel<'materiais_curtidas_user_id_fkey', 'user_id', 'perfis'>,
        ]
      }
      preferencias_lembrete: {
        Row: { dias_antes: number[]; email_ativo: boolean; user_id: string }
        Insert: { dias_antes?: number[]; email_ativo?: boolean; user_id: string }
        Update: { dias_antes?: number[]; email_ativo?: boolean; user_id?: string }
        Relationships: []
      }
      lembretes_enviados: {
        Row: { dias_antes: number; enviado_em: string; evento_id: string; user_id: string }
        Insert: { dias_antes: number; enviado_em?: string; evento_id: string; user_id: string }
        Update: { dias_antes?: number; enviado_em?: string; evento_id?: string; user_id?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      criar_sala: { Args: { p_nome: string; p_senha: string }; Returns: SalaRow; SetofOptions: { from: '*'; to: 'salas'; isOneToOne: true; isSetofReturn: false } }
      entrar_na_sala: { Args: { p_codigo: string; p_senha: string }; Returns: SalaRow | null; SetofOptions: { from: '*'; to: 'salas'; isOneToOne: true; isSetofReturn: false } }
      sair_da_sala: { Args: { p_sala: string }; Returns: undefined }
      lider_definir_senha: { Args: { p_sala: string; p_senha: string }; Returns: undefined }
      lider_novo_codigo: { Args: { p_sala: string }; Returns: string }
      lider_renomear: { Args: { p_nome: string; p_sala: string }; Returns: undefined }
      lider_remover_membro: { Args: { p_sala: string; p_user: string }; Returns: undefined }
      lider_tornar_lider: { Args: { p_sala: string; p_user: string }; Returns: undefined }
      lider_excluir_sala: { Args: { p_sala: string }; Returns: undefined }
    }
    Enums: {
      papel_membro: 'lider' | 'membro'
      tipo_evento: 'prova' | 'entrega' | 'apresentacao'
      tipo_material: 'link' | 'arquivo' | 'nota'
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
