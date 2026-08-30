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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_feedback: {
        Row: {
          created_at: string
          focus: string
          id: string
          prompt: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          focus: string
          id?: string
          prompt: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          focus?: string
          id?: string
          prompt?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      catalogue_modules: {
        Row: {
          code: string
          created_at: string
          credits: number
          description: string
          faculty: string
          id: string
          level: string
          semester: string
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          credits?: number
          description?: string
          faculty: string
          id?: string
          level: string
          semester?: string
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          credits?: number
          description?: string
          faculty?: string
          id?: string
          level?: string
          semester?: string
          title?: string
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          content: string
          created_at: string
          id: string
          milestone_key: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          milestone_key?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          milestone_key?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          nickname: string
          space_key: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          nickname: string
          space_key: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          nickname?: string
          space_key?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          is_anonymous: boolean
          space_key: string
          user_id: string
        }
        Insert: {
          author_name?: string
          body: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          space_key: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          space_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_space_key_fkey"
            columns: ["space_key"]
            isOneToOne: false
            referencedRelation: "community_spaces"
            referencedColumns: ["key"]
          },
        ]
      }
      community_spaces: {
        Row: {
          description: string
          key: string
          position: number
          title: string
        }
        Insert: {
          description: string
          key: string
          position?: number
          title: string
        }
        Update: {
          description?: string
          key?: string
          position?: number
          title?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          challenge_prompt: string | null
          key: string
          position: number
          requires_challenge: boolean
          subtitle: string
          title: string
          unlock_rule: string | null
        }
        Insert: {
          challenge_prompt?: string | null
          key: string
          position: number
          requires_challenge?: boolean
          subtitle: string
          title: string
          unlock_rule?: string | null
        }
        Update: {
          challenge_prompt?: string | null
          key?: string
          position?: number
          requires_challenge?: boolean
          subtitle?: string
          title?: string
          unlock_rule?: string | null
        }
        Relationships: []
      }
      moderation_events: {
        Row: {
          action: string
          created_at: string
          id: string
          snippet: string
          surface: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          snippet: string
          surface: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          snippet?: string
          surface?: string
          user_id?: string
        }
        Relationships: []
      }
      module_enrolments: {
        Row: {
          created_at: string
          id: string
          module_code: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_code: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_enrolments_module_code_fkey"
            columns: ["module_code"]
            isOneToOne: false
            referencedRelation: "catalogue_modules"
            referencedColumns: ["code"]
          },
        ]
      }
      modules: {
        Row: {
          duration: string
          id: string
          locked: boolean
          position: number
          slug: string
          stage: string
          summary: string
          title: string
          unlock_rule: string | null
        }
        Insert: {
          duration: string
          id?: string
          locked?: boolean
          position?: number
          slug: string
          stage: string
          summary: string
          title: string
          unlock_rule?: string | null
        }
        Update: {
          duration?: string
          id?: string
          locked?: boolean
          position?: number
          slug?: string
          stage?: string
          summary?: string
          title?: string
          unlock_rule?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent: string
          captions: boolean
          created_at: string
          dark_mode: boolean
          display_name: string
          high_contrast: boolean
          id: string
          keyboard_nav: boolean
          nickname: string | null
          offenses: number
          programme: string
          screen_reader: boolean
          suspended_until: string | null
          text_scale: number
          updated_at: string
          warnings: number
        }
        Insert: {
          accent?: string
          captions?: boolean
          created_at?: string
          dark_mode?: boolean
          display_name?: string
          high_contrast?: boolean
          id: string
          keyboard_nav?: boolean
          nickname?: string | null
          offenses?: number
          programme?: string
          screen_reader?: boolean
          suspended_until?: string | null
          text_scale?: number
          updated_at?: string
          warnings?: number
        }
        Update: {
          accent?: string
          captions?: boolean
          created_at?: string
          dark_mode?: boolean
          display_name?: string
          high_contrast?: boolean
          id?: string
          keyboard_nav?: boolean
          nickname?: string | null
          offenses?: number
          programme?: string
          screen_reader?: boolean
          suspended_until?: string | null
          text_scale?: number
          updated_at?: string
          warnings?: number
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          id: string
          kind: string
          meta: string
          position: number
          reason: string | null
          title: string
        }
        Insert: {
          category?: string
          id?: string
          kind: string
          meta: string
          position?: number
          reason?: string | null
          title: string
        }
        Update: {
          category?: string
          id?: string
          kind?: string
          meta?: string
          position?: number
          reason?: string | null
          title?: string
        }
        Relationships: []
      }
      user_milestones: {
        Row: {
          completed_at: string
          id: string
          milestone_key: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          milestone_key: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          milestone_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_milestones_milestone_key_fkey"
            columns: ["milestone_key"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["key"]
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
