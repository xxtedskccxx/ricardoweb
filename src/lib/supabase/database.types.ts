export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      media_cleanup_queue: {
        Row: {
          attempts: number
          created_at: string
          last_error: string | null
          public_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          last_error?: string | null
          public_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          last_error?: string | null
          public_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          bytes: number
          created_at: string
          format: string
          height: number
          id: string
          position: number
          product_id: string
          public_id: string
          width: number
        }
        Insert: {
          alt?: string | null
          bytes: number
          created_at?: string
          format: string
          height: number
          id?: string
          position?: number
          product_id: string
          public_id: string
          width: number
        }
        Update: {
          alt?: string | null
          bytes?: number
          created_at?: string
          format?: string
          height?: number
          id?: string
          position?: number
          product_id?: string
          public_id?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_slug_history: {
        Row: {
          created_at: string
          product_id: string
          slug: string
        }
        Insert: {
          created_at?: string
          product_id: string
          slug: string
        }
        Update: {
          created_at?: string
          product_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_slug_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          attributes: Json
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          description: string | null
          featured: boolean
          homepage_position: number | null
          id: string
          location: string | null
          location_normalized: string | null
          price: number | null
          price_mode: Database["public"]["Enums"]["product_price_mode"]
          published_at: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          title: string
          type: string
          type_normalized: string | null
          updated_at: string
        }
        Insert: {
          attributes?: Json
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          featured?: boolean
          homepage_position?: number | null
          id?: string
          location?: string | null
          location_normalized?: string | null
          price?: number | null
          price_mode?: Database["public"]["Enums"]["product_price_mode"]
          published_at?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          type: string
          type_normalized?: string | null
          updated_at?: string
        }
        Update: {
          attributes?: Json
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          featured?: boolean
          homepage_position?: number | null
          id?: string
          location?: string | null
          location_normalized?: string | null
          price?: number | null
          price_mode?: Database["public"]["Enums"]["product_price_mode"]
          published_at?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          type?: string
          type_normalized?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      immutable_unaccent: { Args: { "": string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      reorder_product_images: {
        Args: { p_ordered_image_ids: string[]; p_product_id: string }
        Returns: undefined
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      currency_code: "DOP" | "USD"
      product_price_mode: "FIXED" | "NEGOTIABLE" | "CONTACT"
      product_status: "DRAFT" | "AVAILABLE" | "RESERVED" | "SOLD"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      currency_code: ["DOP", "USD"],
      product_price_mode: ["FIXED", "NEGOTIABLE", "CONTACT"],
      product_status: ["DRAFT", "AVAILABLE", "RESERVED", "SOLD"],
    },
  },
} as const

