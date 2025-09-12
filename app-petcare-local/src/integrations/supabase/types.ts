export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alimentacao: {
        Row: {
          created_at: string
          data_registro: string
          horarios: string[] | null
          id: string
          marca: string | null
          observacoes: string | null
          pet_id: string
          quantidade: string | null
          tipo_alimento: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_registro?: string
          horarios?: string[] | null
          id?: string
          marca?: string | null
          observacoes?: string | null
          pet_id: string
          quantidade?: string | null
          tipo_alimento: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_registro?: string
          horarios?: string[] | null
          id?: string
          marca?: string | null
          observacoes?: string | null
          pet_id?: string
          quantidade?: string | null
          tipo_alimento?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alimentacao_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas: {
        Row: {
          created_at: string
          data_consulta: string
          descricao: string | null
          diagnostico: string | null
          hora_consulta: string | null
          id: string
          observacoes: string | null
          pet_id: string
          status: string
          tipo: string
          tratamento: string | null
          updated_at: string
          user_id: string
          valor: number | null
          veterinario_id: string | null
        }
        Insert: {
          created_at?: string
          data_consulta: string
          descricao?: string | null
          diagnostico?: string | null
          hora_consulta?: string | null
          id?: string
          observacoes?: string | null
          pet_id: string
          status?: string
          tipo: string
          tratamento?: string | null
          updated_at?: string
          user_id: string
          valor?: number | null
          veterinario_id?: string | null
        }
        Update: {
          created_at?: string
          data_consulta?: string
          descricao?: string | null
          diagnostico?: string | null
          hora_consulta?: string | null
          id?: string
          observacoes?: string | null
          pet_id?: string
          status?: string
          tipo?: string
          tratamento?: string | null
          updated_at?: string
          user_id?: string
          valor?: number | null
          veterinario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "veterinarios"
            referencedColumns: ["id"]
          },
        ]
      }
      convites_pendentes: {
        Row: {
          authorized_data: string[]
          created_at: string
          expires_at: string | null
          id: string
          pet_id: string
          status: string
          tutor_user_id: string
          veterinario_email: string
        }
        Insert: {
          authorized_data?: string[]
          created_at?: string
          expires_at?: string | null
          id?: string
          pet_id: string
          status?: string
          tutor_user_id: string
          veterinario_email: string
        }
        Update: {
          authorized_data?: string[]
          created_at?: string
          expires_at?: string | null
          id?: string
          pet_id?: string
          status?: string
          tutor_user_id?: string
          veterinario_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "convites_pendentes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      galeria: {
        Row: {
          created_at: string
          data_foto: string | null
          descricao: string | null
          id: string
          pet_id: string | null
          titulo: string | null
          url_imagem: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_foto?: string | null
          descricao?: string | null
          id?: string
          pet_id?: string | null
          titulo?: string | null
          url_imagem: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_foto?: string | null
          descricao?: string | null
          id?: string
          pet_id?: string | null
          titulo?: string | null
          url_imagem?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "galeria_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes: {
        Row: {
          created_at: string
          data_lembrete: string
          descricao: string | null
          hora_lembrete: string | null
          id: string
          pet_id: string | null
          status: string
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_lembrete: string
          descricao?: string | null
          hora_lembrete?: string | null
          id?: string
          pet_id?: string | null
          status?: string
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_lembrete?: string
          descricao?: string | null
          hora_lembrete?: string | null
          id?: string
          pet_id?: string | null
          status?: string
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medicamentos: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          dosagem: string | null
          frequencia: string | null
          id: string
          nome: string
          observacoes: string | null
          pet_id: string
          status: string
          tipo: string | null
          updated_at: string
          user_id: string
          veterinario: string | null
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          dosagem?: string | null
          frequencia?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          pet_id: string
          status?: string
          tipo?: string | null
          updated_at?: string
          user_id: string
          veterinario?: string | null
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          dosagem?: string | null
          frequencia?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          pet_id?: string
          status?: string
          tipo?: string | null
          updated_at?: string
          user_id?: string
          veterinario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicamentos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      peso: {
        Row: {
          created_at: string
          data_pesagem: string
          id: string
          observacoes: string | null
          peso: number
          pet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_pesagem?: string
          id?: string
          observacoes?: string | null
          peso: number
          pet_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_pesagem?: string
          id?: string
          observacoes?: string | null
          peso?: number
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peso_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_authorizations: {
        Row: {
          authorized_at: string | null
          authorized_data: string[]
          created_at: string
          expires_at: string | null
          id: string
          pet_id: string
          status: string
          tutor_user_id: string
          updated_at: string
          veterinario_profile_id: string
        }
        Insert: {
          authorized_at?: string | null
          authorized_data?: string[]
          created_at?: string
          expires_at?: string | null
          id?: string
          pet_id: string
          status?: string
          tutor_user_id: string
          updated_at?: string
          veterinario_profile_id: string
        }
        Update: {
          authorized_at?: string | null
          authorized_data?: string[]
          created_at?: string
          expires_at?: string | null
          id?: string
          pet_id?: string
          status?: string
          tutor_user_id?: string
          updated_at?: string
          veterinario_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_authorizations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_authorizations_veterinario_profile_id_fkey"
            columns: ["veterinario_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          castrado: boolean | null
          cor: string | null
          created_at: string
          data_nascimento: string | null
          especie: string
          foto_url: string | null
          id: string
          idade: number | null
          microchip: string | null
          nome: string
          observacoes: string | null
          peso: number | null
          raca: string | null
          sexo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          castrado?: boolean | null
          cor?: string | null
          created_at?: string
          data_nascimento?: string | null
          especie: string
          foto_url?: string | null
          id?: string
          idade?: number | null
          microchip?: string | null
          nome: string
          observacoes?: string | null
          peso?: number | null
          raca?: string | null
          sexo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          castrado?: boolean | null
          cor?: string | null
          created_at?: string
          data_nascimento?: string | null
          especie?: string
          foto_url?: string | null
          id?: string
          idade?: number | null
          microchip?: string | null
          nome?: string
          observacoes?: string | null
          peso?: number | null
          raca?: string | null
          sexo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          endereco: string | null
          foto_url: string | null
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["user_role"]
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          endereco?: string | null
          foto_url?: string | null
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vacinas: {
        Row: {
          created_at: string
          data_aplicacao: string
          data_proxima: string | null
          id: string
          laboratorio: string | null
          local_aplicacao: string | null
          lote: string | null
          nome: string
          observacoes: string | null
          pet_id: string
          updated_at: string
          user_id: string
          veterinario: string | null
        }
        Insert: {
          created_at?: string
          data_aplicacao: string
          data_proxima?: string | null
          id?: string
          laboratorio?: string | null
          local_aplicacao?: string | null
          lote?: string | null
          nome: string
          observacoes?: string | null
          pet_id: string
          updated_at?: string
          user_id: string
          veterinario?: string | null
        }
        Update: {
          created_at?: string
          data_aplicacao?: string
          data_proxima?: string | null
          id?: string
          laboratorio?: string | null
          local_aplicacao?: string | null
          lote?: string | null
          nome?: string
          observacoes?: string | null
          pet_id?: string
          updated_at?: string
          user_id?: string
          veterinario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacinas_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarios: {
        Row: {
          clinica: string | null
          created_at: string
          crmv: string | null
          email: string | null
          endereco: string | null
          especialidade: string | null
          id: string
          nome: string
          profile_id: string
          telefone: string | null
        }
        Insert: {
          clinica?: string | null
          created_at?: string
          crmv?: string | null
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          id?: string
          nome: string
          profile_id: string
          telefone?: string | null
        }
        Update: {
          clinica?: string | null
          created_at?: string
          crmv?: string | null
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          id?: string
          nome?: string
          profile_id?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "veterinarios_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_authorized_veterinarians_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          clinica: string
          created_at: string
          crmv: string
          especialidade: string
          id: string
          nome: string
          profile_id: string
        }[]
      }
      get_user_role: {
        Args: { user_id_param?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      veterinarian_has_pet_access: {
        Args: { data_type_param?: string; pet_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "tutor" | "veterinario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["tutor", "veterinario"],
    },
  },
} as const
