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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      budtenders: {
        Row: {
          auth_user_id: string
          created_at: string
          id: string
          is_active: boolean
          location: string | null
          name: string
          nickname: string | null
          picks_note_override: string | null
          profile_expertise: string | null
          profile_tolerance: string | null
          profile_vibe: string | null
          role: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          nickname?: string | null
          picks_note_override?: string | null
          profile_expertise?: string | null
          profile_tolerance?: string | null
          profile_vibe?: string | null
          role?: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          nickname?: string | null
          picks_note_override?: string | null
          profile_expertise?: string | null
          profile_tolerance?: string | null
          profile_vibe?: string | null
          role?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          type: string
          description: string
          urgency: string | null
          is_anonymous: boolean
          submitter_id: string | null
          submitter_name: string | null
          page_context: string | null
          created_at: string
          status: string
          reviewed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          type: string
          description: string
          urgency?: string | null
          is_anonymous?: boolean
          submitter_id?: string | null
          submitter_name?: string | null
          page_context?: string | null
          created_at?: string
          status?: string
          reviewed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          type?: string
          description?: string
          urgency?: string | null
          is_anonymous?: boolean
          submitter_id?: string | null
          submitter_name?: string | null
          page_context?: string | null
          created_at?: string
          status?: string
          reviewed_at?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "budtenders"
            referencedColumns: ["id"]
          }
        ]
      }
      picks: {
        Row: {
          brand: string | null
          budget_level: string | null
          budtender_id: string
          category_id: string
          category_line: string | null
          created_at: string
          doodle_key: string | null
          effect_tags: string[] | null
          experience_level: string | null
          id: string
          is_active: boolean
          last_active_at: string | null
          pre_roll_subtype: string | null
          product_name: string
          product_type: string
          rank: number
          rating: number | null
          special_role: string | null
          time_of_day: string
          updated_at: string
          why_i_love_it: string | null
        }
        Insert: {
          brand?: string | null
          budget_level?: string | null
          budtender_id: string
          category_id: string
          category_line?: string | null
          created_at?: string
          doodle_key?: string | null
          effect_tags?: string[] | null
          experience_level?: string | null
          id?: string
          is_active?: boolean
          last_active_at?: string | null
          pre_roll_subtype?: string | null
          product_name: string
          product_type: string
          rank?: number
          rating?: number | null
          special_role?: string | null
          time_of_day?: string
          updated_at?: string
          why_i_love_it?: string | null
        }
        Update: {
          brand?: string | null
          budget_level?: string | null
          budtender_id?: string
          category_id?: string
          category_line?: string | null
          created_at?: string
          doodle_key?: string | null
          effect_tags?: string[] | null
          experience_level?: string | null
          id?: string
          is_active?: boolean
          last_active_at?: string | null
          pre_roll_subtype?: string | null
          product_name?: string
          product_type?: string
          rank?: number
          rating?: number | null
          special_role?: string | null
          time_of_day?: string
          updated_at?: string
          why_i_love_it?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "picks_budtender_id_fkey"
            columns: ["budtender_id"]
            isOneToOne: false
            referencedRelation: "budtenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
