/**
 * Database types for Volvox.Sober
 * Generated from Supabase schema - Features 001-auth-screens + 002-app-screens
 */

export interface Database {
  public: {
    Tables: {
      // ============================================================
      // Existing tables (from 001-auth-screens)
      // ============================================================
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string
          avatar_url?: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      check_ins: {
        Row: {
          id: string
          connection_id: string
          created_at: string
          updated_at: string
          recurrence: 'daily' | 'weekly' | 'custom'
          custom_interval_days?: number
          scheduled_time: string // TIME format
          timezone: string
          questions: string[]
          is_active: boolean
          next_scheduled_at: string
        }
        Insert: Omit<Database['public']['Tables']['check_ins']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['check_ins']['Insert']>
      }
      check_in_responses: {
        Row: {
          id: string
          check_in_id: string
          connection_id: string
          created_at: string
          scheduled_for: string
          response_status: 'completed' | 'missed'
          responses: CheckInResponseAnswer[]
        }
        Insert: Omit<Database['public']['Tables']['check_in_responses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['check_in_responses']['Insert']>
      }

      // ============================================================
      // New tables (from 002-app-screens)
      // ============================================================
      profiles: {
        Row: {
          id: string
          name: string
          bio?: string
          profile_photo_url?: string
          role: 'sponsor' | 'sponsee' | 'both'
          recovery_program: string
          sobriety_start_date?: string // ISO date string
          city?: string
          state?: string
          country: string
          availability: string[] // Array of availability strings
          preferences: Record<string, unknown>
          profile_completion_percentage: number
          created_at: string
          updated_at: string
          deleted_at?: string
        }
        Insert: {
          id: string
          name: string
          bio?: string
          profile_photo_url?: string
          role: 'sponsor' | 'sponsee' | 'both'
          recovery_program: string
          sobriety_start_date?: string
          city?: string
          state?: string
          country?: string
          availability?: string[]
          preferences?: Record<string, unknown>
          profile_completion_percentage?: number
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      onboarding_progress: {
        Row: {
          id: string
          user_id: string
          welcome_completed: boolean
          role_selected: boolean
          profile_form_completed: boolean
          onboarding_completed: boolean
          last_step?: string
          created_at: string
          updated_at: string
          completed_at?: string
        }
        Insert: {
          user_id: string
          welcome_completed?: boolean
          role_selected?: boolean
          profile_form_completed?: boolean
          onboarding_completed?: boolean
          last_step?: string
        }
        Update: Partial<Database['public']['Tables']['onboarding_progress']['Insert']>
      }
      sobriety_records: {
        Row: {
          id: string
          user_id: string
          current_sobriety_start_date: string // ISO date string
          previous_sobriety_dates: string[] // Array of ISO date strings
          milestones: SobrietyMilestone[]
          reflections: SobrietyReflection[]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          current_sobriety_start_date: string
          previous_sobriety_dates?: string[]
          milestones?: SobrietyMilestone[]
          reflections?: SobrietyReflection[]
        }
        Update: Partial<Database['public']['Tables']['sobriety_records']['Insert']>
      }
      matches: {
        Row: {
          id: string
          user_id: string
          candidate_id: string
          compatibility_score: number
          status: 'suggested' | 'requested' | 'declined' | 'connected'
          last_shown_at?: string
          requested_at?: string
          declined_at?: string
          connected_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          candidate_id: string
          compatibility_score: number
          status?: 'suggested' | 'requested' | 'declined' | 'connected'
          last_shown_at?: string
          requested_at?: string
          declined_at?: string
          connected_at?: string
        }
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      connections: {
        Row: {
          id: string
          sponsor_id: string
          sponsee_id: string
          status: 'pending' | 'active' | 'ended'
          created_at: string
          accepted_at?: string
          declined_at?: string
          ended_at?: string
          last_interaction_at?: string
          end_feedback?: string
          ended_by?: string
          updated_at: string
        }
        Insert: {
          sponsor_id: string
          sponsee_id: string
          status?: 'pending' | 'active' | 'ended'
          accepted_at?: string
          declined_at?: string
          ended_at?: string
          last_interaction_at?: string
          end_feedback?: string
          ended_by?: string
        }
        Update: Partial<Database['public']['Tables']['connections']['Insert']>
      }
      messages: {
        Row: {
          id: string
          connection_id: string
          sender_id: string
          text: string
          status: 'sending' | 'sent' | 'delivered' | 'read'
          created_at: string
          delivered_at?: string
          read_at?: string
          updated_at: string
        }
        Insert: {
          connection_id: string
          sender_id: string
          text: string
          status?: 'sending' | 'sent' | 'delivered' | 'read'
          delivered_at?: string
          read_at?: string
        }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          new_message_notifications: boolean
          milestone_notifications: boolean
          connection_request_notifications: boolean
          push_notifications_enabled: boolean
          email_notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          new_message_notifications?: boolean
          milestone_notifications?: boolean
          connection_request_notifications?: boolean
          push_notifications_enabled?: boolean
          email_notifications_enabled?: boolean
        }
        Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>
      }
    }
  }
}

// ============================================================
// Helper types for JSONB fields
// ============================================================

export interface SobrietyMilestone {
  days: number
  achieved_at: string // ISO datetime string
}

export interface SobrietyReflection {
  date: string // ISO date string
  text: string
}

export interface CheckInResponseAnswer {
  question: string
  answer: string
}

// ============================================================
// Utility types for table access
// ============================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
