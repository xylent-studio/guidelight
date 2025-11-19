export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      budtenders: {
        Row: {
          archetype: string | null
          auth_user_id: string
          created_at: string
          id: string
          ideal_high: string | null
          is_active: boolean
          name: string
          nickname: string | null
          picks_note_override: string | null
          role: string
          slug: string | null
          tolerance_level: string | null
          updated_at: string
        }
        Insert: {
          archetype?: string | null
          auth_user_id: string
          created_at?: string
          id?: string
          ideal_high?: string | null
          is_active?: boolean
          name: string
          nickname?: string | null
          picks_note_override?: string | null
          role?: string
          slug?: string | null
          tolerance_level?: string | null
          updated_at?: string
        }
        Update: {
          archetype?: string | null
          auth_user_id?: string
          created_at?: string
          id?: string
          ideal_high?: string | null
          is_active?: boolean
          name?: string
          nickname?: string | null
          picks_note_override?: string | null
          role?: string
          slug?: string | null
          tolerance_level?: string | null
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
          pre_roll_subtype: string | null
          product_name: string
          product_type: string
          rank: number
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
          pre_roll_subtype?: string | null
          product_name: string
          product_type: string
          rank?: number
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
          pre_roll_subtype?: string | null
          product_name?: string
          product_type?: string
          rank?: number
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
