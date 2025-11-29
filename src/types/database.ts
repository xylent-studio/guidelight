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
      board_items: {
        Row: {
          asset_id: string | null
          attribution_style: string | null
          board_id: string
          created_at: string
          id: string
          layout_variant: string | null
          pick_id: string | null
          position_x: number | null
          position_y: number | null
          sort_index: number | null
          text_content: string | null
          text_variant: string | null
          type: Database["public"]["Enums"]["board_item_type"]
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          attribution_style?: string | null
          board_id: string
          created_at?: string
          id?: string
          layout_variant?: string | null
          pick_id?: string | null
          position_x?: number | null
          position_y?: number | null
          sort_index?: number | null
          text_content?: string | null
          text_variant?: string | null
          type: Database["public"]["Enums"]["board_item_type"]
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          attribution_style?: string | null
          board_id?: string
          created_at?: string
          id?: string
          layout_variant?: string | null
          pick_id?: string | null
          position_x?: number | null
          position_y?: number | null
          sort_index?: number | null
          text_content?: string | null
          text_variant?: string | null
          type?: Database["public"]["Enums"]["board_item_type"]
          updated_at?: string
        }
        Relationships: []
      }
      boards: {
        Row: {
          channel: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_user_id: string | null
          purpose: string | null
          status: Database["public"]["Enums"]["board_status"]
          theme: string | null
          type: Database["public"]["Enums"]["board_type"]
          updated_at: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_user_id?: string | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["board_status"]
          theme?: string | null
          type?: Database["public"]["Enums"]["board_type"]
          updated_at?: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["board_status"]
          theme?: string | null
          type?: Database["public"]["Enums"]["board_type"]
          updated_at?: string
        }
        Relationships: []
      }
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
          show_in_customer_view: boolean
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
          show_in_customer_view?: boolean
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
          show_in_customer_view?: boolean
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
          created_at: string
          description: string
          id: string
          is_anonymous: boolean
          notes: string | null
          page_context: string | null
          reviewed_at: string | null
          status: string
          submitter_id: string | null
          submitter_name: string | null
          type: string
          urgency: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_anonymous?: boolean
          notes?: string | null
          page_context?: string | null
          reviewed_at?: string | null
          status?: string
          submitter_id?: string | null
          submitter_name?: string | null
          type: string
          urgency?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_anonymous?: boolean
          notes?: string | null
          page_context?: string | null
          reviewed_at?: string | null
          status?: string
          submitter_id?: string | null
          submitter_name?: string | null
          type?: string
          urgency?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          file_size: number | null
          filename: string
          height: number | null
          id: string
          kind: string
          label: string | null
          mime_type: string | null
          tags: string[] | null
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          filename: string
          height?: number | null
          id?: string
          kind?: string
          label?: string | null
          mime_type?: string | null
          tags?: string[] | null
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string
          file_size?: number | null
          filename?: string
          height?: number | null
          id?: string
          kind?: string
          label?: string | null
          mime_type?: string | null
          tags?: string[] | null
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      pick_drafts: {
        Row: {
          created_at: string
          data: Json
          id: string
          pick_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          pick_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          pick_id?: string | null
          updated_at?: string
          user_id?: string
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
          custom_tags: string[] | null
          deal_applies_to: string | null
          deal_days: string[] | null
          deal_fine_print: string | null
          deal_title: string | null
          deal_type: string | null
          deal_value: string | null
          doodle_key: string | null
          effect_tags: string[] | null
          experience_level: string | null
          format: string | null
          id: string
          image_asset_id: string | null
          intensity: string | null
          is_active: boolean
          is_infused: boolean | null
          last_active_at: string | null
          one_liner: string | null
          package_size: string | null
          potency_summary: string | null
          pre_roll_subtype: string | null
          product_id: string | null
          product_name: string
          product_type: string
          rank: number
          rating: number | null
          special_role: string | null
          status: Database["public"]["Enums"]["pick_status"]
          strain_type: string | null
          time_of_day: string
          top_terpenes: string | null
          updated_at: string
          visible_fields: string[] | null
          why_i_love_it: string | null
        }
        Insert: {
          brand?: string | null
          budget_level?: string | null
          budtender_id: string
          category_id: string
          category_line?: string | null
          created_at?: string
          custom_tags?: string[] | null
          deal_applies_to?: string | null
          deal_days?: string[] | null
          deal_fine_print?: string | null
          deal_title?: string | null
          deal_type?: string | null
          deal_value?: string | null
          doodle_key?: string | null
          effect_tags?: string[] | null
          experience_level?: string | null
          format?: string | null
          id?: string
          image_asset_id?: string | null
          intensity?: string | null
          is_active?: boolean
          is_infused?: boolean | null
          last_active_at?: string | null
          one_liner?: string | null
          package_size?: string | null
          potency_summary?: string | null
          pre_roll_subtype?: string | null
          product_id?: string | null
          product_name: string
          product_type: string
          rank?: number
          rating?: number | null
          special_role?: string | null
          status?: Database["public"]["Enums"]["pick_status"]
          strain_type?: string | null
          time_of_day?: string
          top_terpenes?: string | null
          updated_at?: string
          visible_fields?: string[] | null
          why_i_love_it?: string | null
        }
        Update: {
          brand?: string | null
          budget_level?: string | null
          budtender_id?: string
          category_id?: string
          category_line?: string | null
          created_at?: string
          custom_tags?: string[] | null
          deal_applies_to?: string | null
          deal_days?: string[] | null
          deal_fine_print?: string | null
          deal_title?: string | null
          deal_type?: string | null
          deal_value?: string | null
          doodle_key?: string | null
          effect_tags?: string[] | null
          experience_level?: string | null
          format?: string | null
          id?: string
          image_asset_id?: string | null
          intensity?: string | null
          is_active?: boolean
          is_infused?: boolean | null
          last_active_at?: string | null
          one_liner?: string | null
          package_size?: string | null
          potency_summary?: string | null
          pre_roll_subtype?: string | null
          product_id?: string | null
          product_name?: string
          product_type?: string
          rank?: number
          rating?: number | null
          special_role?: string | null
          status?: Database["public"]["Enums"]["pick_status"]
          strain_type?: string | null
          time_of_day?: string
          top_terpenes?: string | null
          updated_at?: string
          visible_fields?: string[] | null
          why_i_love_it?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category_id: string | null
          cbd_percent: number | null
          created_at: string
          description: string | null
          id: string
          image_asset_id: string | null
          image_url: string | null
          in_stock: boolean | null
          is_active: boolean
          last_synced_at: string | null
          name: string
          price_member: number | null
          price_retail: number | null
          price_sale: number | null
          product_type: string | null
          sku: string | null
          source: string
          source_data: Json | null
          source_id: string | null
          stock_quantity: number | null
          strain_name: string | null
          strain_type: string | null
          terpenes: Json | null
          thc_percent: number | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          cbd_percent?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_asset_id?: string | null
          image_url?: string | null
          in_stock?: boolean | null
          is_active?: boolean
          last_synced_at?: string | null
          name: string
          price_member?: number | null
          price_retail?: number | null
          price_sale?: number | null
          product_type?: string | null
          sku?: string | null
          source?: string
          source_data?: Json | null
          source_id?: string | null
          stock_quantity?: number | null
          strain_name?: string | null
          strain_type?: string | null
          terpenes?: Json | null
          thc_percent?: number | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          cbd_percent?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_asset_id?: string | null
          image_url?: string | null
          in_stock?: boolean | null
          is_active?: boolean
          last_synced_at?: string | null
          name?: string
          price_member?: number | null
          price_retail?: number | null
          price_sale?: number | null
          product_type?: string | null
          sku?: string | null
          source?: string
          source_data?: Json | null
          source_id?: string | null
          stock_quantity?: number | null
          strain_name?: string | null
          strain_type?: string | null
          terpenes?: Json | null
          thc_percent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      releases: {
        Row: {
          created_at: string
          details_md: string | null
          id: string
          summary: string | null
          title: string
          version: string
        }
        Insert: {
          created_at?: string
          details_md?: string | null
          id?: string
          summary?: string | null
          title: string
          version: string
        }
        Update: {
          created_at?: string
          details_md?: string | null
          id?: string
          summary?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          last_board_id: string | null
          last_route: string | null
          last_seen_release_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          last_board_id?: string | null
          last_route?: string | null
          last_seen_release_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          last_board_id?: string | null
          last_route?: string | null
          last_seen_release_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_budtender_id: { Args: never; Returns: string }
      is_current_user_manager: { Args: never; Returns: boolean }
    }
    Enums: {
      board_item_type: "pick" | "text" | "image"
      board_status: "published" | "unpublished"
      board_type: "auto_store" | "auto_user" | "custom"
      pick_status: "published" | "archived"
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
      board_item_type: ["pick", "text", "image"],
      board_status: ["published", "unpublished"],
      board_type: ["auto_store", "auto_user", "custom"],
      pick_status: ["published", "archived"],
    },
  },
} as const
