export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          text: string;
          done: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          text: string;
          done?: boolean;
          position?: number;
        };
        Update: Partial<{ text: string; done: boolean; position: number }>;
        Relationships: [];
      };
      streaks: {
        Row: { user_id: string; count: number; last_complete_date: string | null };
        Insert: { user_id: string; count?: number; last_complete_date?: string | null };
        Update: Partial<{ count: number; last_complete_date: string | null }>;
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          notify_enabled: boolean;
          reminder_dismissed_date: string | null;
          notified_date: string | null;
        };
        Insert: {
          user_id: string;
          notify_enabled?: boolean;
          reminder_dismissed_date?: string | null;
          notified_date?: string | null;
        };
        Update: Partial<{
          notify_enabled: boolean;
          reminder_dismissed_date: string | null;
          notified_date: string | null;
        }>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: { id?: string; user_id: string; endpoint: string; p256dh: string; auth: string };
        Update: Partial<{ endpoint: string; p256dh: string; auth: string }>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
