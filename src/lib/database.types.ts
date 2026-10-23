// Gerado a partir do schema do Supabase (mcp generate_typescript_types).
// Para regenerar: npx supabase gen types typescript --project-id ygahwxxzzqmqcdenjqiz > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Rel = { foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] }

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.18' }
  public: {
    Tables: {
      eventos: {
        Row: { criado_em: string; criado_por: string; descricao: string | null; id: string; materia_id: string | null; prazo: string; tipo: Database['public']['Enums']['tipo_evento']; titulo: string; turma_id: string }
        Insert: { criado_em?: string; criado_por: string; descricao?: string | null; id?: string; materia_id?: string | null; prazo: string; tipo: Database['public']['Enums']['tipo_evento']; titulo: string; turma_id: string }
        Update: { criado_em?: string; criado_por?: string; descricao?: string | null; id?: string; materia_id?: string | null; prazo?: string; tipo?: Database['public']['Enums']['tipo_evento']; titulo?: string; turma_id?: string }
        Relationships: [
          { foreignKeyName: 'eventos_criado_por_fkey'; columns: ['criado_por']; isOneToOne: false; referencedRelation: 'perfis'; referencedColumns: ['id'] },
          { foreignKeyName: 'eventos_materia_id_fkey'; columns: ['materia_id']; isOneToOne: false; referencedRelation: 'materias'; referencedColumns: ['id'] },
          { foreignKeyName: 'eventos_turma_id_fkey'; columns: ['turma_id']; isOneToOne: false; referencedRelation: 'turmas'; referencedColumns: ['id'] },
        ]
      }
      lembretes_enviados: {
        Row: { dias_antes: number; enviado_em: string; evento_id: string; user_id: string }
        Insert: { dias_antes: number; enviado_em?: string; evento_id: string; user_id: string }
        Update: { dias_antes?: number; enviado_em?: string; evento_id?: string; user_id?: string }
        Relationships: Rel[]
      }
      materiais: {
        Row: { conteudo: string | null; criado_em: string; criado_por: string; id: string; materia_id: string; tipo: Database['public']['Enums']['tipo_material']; titulo: string; turma_id: string; url: string | null }
        Insert: { conteudo?: string | null; criado_em?: string; criado_por: string; id?: string; materia_id: string; tipo: Database['public']['Enums']['tipo_material']; titulo: string; turma_id: string; url?: string | null }
        Update: { conteudo?: string | null; criado_em?: string; criado_por?: string; id?: string; materia_id?: string; tipo?: Database['public']['Enums']['tipo_material']; titulo?: string; turma_id?: string; url?: string | null }
        Relationships: [
          { foreignKeyName: 'materiais_criado_por_fkey'; columns: ['criado_por']; isOneToOne: false; referencedRelation: 'perfis'; referencedColumns: ['id'] },
          { foreignKeyName: 'materiais_materia_id_fkey'; columns: ['materia_id']; isOneToOne: false; referencedRelation: 'materias'; referencedColumns: ['id'] },
          { foreignKeyName: 'materiais_turma_id_fkey'; columns: ['turma_id']; isOneToOne: false; referencedRelation: 'turmas'; referencedColumns: ['id'] },
        ]
      }
      materias: {
        Row: { cor: string; id: string; nome: string; professor: string | null; turma_id: string }
        Insert: { cor?: string; id?: string; nome: string; professor?: string | null; turma_id: string }
        Update: { cor?: string; id?: string; nome?: string; professor?: string | null; turma_id?: string }
        Relationships: [
          { foreignKeyName: 'materias_turma_id_fkey'; columns: ['turma_id']; isOneToOne: false; referencedRelation: 'turmas'; referencedColumns: ['id'] },
        ]
      }
      perfis: {
        Row: { criado_em: string; id: string; nome: string }
        Insert: { criado_em?: string; id: string; nome: string }
        Update: { criado_em?: string; id?: string; nome?: string }
        Relationships: []
      }
      preferencias_lembrete: {
        Row: { dias_antes: number[]; email_ativo: boolean; user_id: string }
        Insert: { dias_antes?: number[]; email_ativo?: boolean; user_id: string }
        Update: { dias_antes?: number[]; email_ativo?: boolean; user_id?: string }
        Relationships: Rel[]
      }
      turma_membros: {
        Row: { entrou_em: string; papel: Database['public']['Enums']['papel_membro']; turma_id: string; user_id: string }
        Insert: { entrou_em?: string; papel?: Database['public']['Enums']['papel_membro']; turma_id: string; user_id: string }
        Update: { entrou_em?: string; papel?: Database['public']['Enums']['papel_membro']; turma_id?: string; user_id?: string }
        Relationships: [
          { foreignKeyName: 'turma_membros_turma_id_fkey'; columns: ['turma_id']; isOneToOne: false; referencedRelation: 'turmas'; referencedColumns: ['id'] },
          { foreignKeyName: 'turma_membros_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'perfis'; referencedColumns: ['id'] },
        ]
      }
      turmas: {
        Row: { codigo_convite: string; criado_em: string; criado_por: string; id: string; nome: string }
        Insert: { codigo_convite?: string; criado_em?: string; criado_por: string; id?: string; nome: string }
        Update: { codigo_convite?: string; criado_em?: string; criado_por?: string; id?: string; nome?: string }
        Relationships: Rel[]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      criar_turma: {
        Args: { p_nome: string }
        Returns: Database['public']['Tables']['turmas']['Row']
        SetofOptions: { from: '*'; to: 'turmas'; isOneToOne: true; isSetofReturn: false }
      }
      entrar_na_turma: {
        Args: { p_codigo: string }
        Returns: Database['public']['Tables']['turmas']['Row']
        SetofOptions: { from: '*'; to: 'turmas'; isOneToOne: true; isSetofReturn: false }
      }
    }
    Enums: {
      papel_membro: 'admin' | 'membro'
      tipo_evento: 'prova' | 'entrega' | 'apresentacao'
      tipo_material: 'link' | 'arquivo' | 'nota'
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
