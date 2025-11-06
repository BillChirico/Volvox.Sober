/**
 * Database types for Volvox.Sober
 * Generated from Supabase schema - WP07 implementation
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          name: string;
          avatar_url?: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      connections: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          sponsor_id: string;
          sponsee_id: string;
          status: 'pending' | 'active' | 'ended';
          first_message_at?: string;
          last_message_at?: string;
          total_messages: number;
        };
        Insert: Omit<
          Database['public']['Tables']['connections']['Row'],
          'id' | 'created_at' | 'updated_at' | 'total_messages'
        >;
        Update: Partial<Database['public']['Tables']['connections']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          connection_id: string;
          created_at: string;
          sender_id: string;
          recipient_id: string;
          text: string;
          read_at?: string;
          archived: boolean;
        };
        Insert: Omit<
          Database['public']['Tables']['messages']['Row'],
          'id' | 'created_at' | 'archived'
        >;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      check_ins: {
        Row: {
          id: string;
          connection_id: string;
          created_at: string;
          updated_at: string;
          recurrence: 'daily' | 'weekly' | 'custom';
          custom_interval_days?: number;
          scheduled_time: string; // TIME format
          timezone: string;
          questions: string[];
          is_active: boolean;
          next_scheduled_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['check_ins']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['check_ins']['Insert']>;
      };
      check_in_responses: {
        Row: {
          id: string;
          check_in_id: string;
          connection_id: string;
          created_at: string;
          scheduled_for: string;
          response_status: 'completed' | 'missed';
          responses: CheckInResponseAnswer[];
        };
        Insert: Omit<
          Database['public']['Tables']['check_in_responses']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['check_in_responses']['Insert']>;
      };
    };
  };
}

// Helper types
export interface CheckInResponseAnswer {
  question: string;
  answer: string;
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
