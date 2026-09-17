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
          planned_start_time: string | null;
          actual_start_time: string | null;
          completed_at: string | null;
          status: "pending" | "started" | "done" | "missed";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          text: string;
          done?: boolean;
          position?: number;
          planned_start_time?: string | null;
          actual_start_time?: string | null;
          completed_at?: string | null;
          status?: "pending" | "started" | "done" | "missed";
        };
        Update: Partial<{
          text: string;
          done: boolean;
          position: number;
          planned_start_time: string | null;
          actual_start_time: string | null;
          completed_at: string | null;
          status: "pending" | "started" | "done" | "missed";
        }>;
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
      block_config: {
        Row: {
          user_id: string;
          blocked_apps: string[];
          blocked_domains: string[];
          daily_window_start: string | null;
          daily_window_end: string | null;
          ringtone_uri: string | null;
        };
        Insert: {
          user_id: string;
          blocked_apps?: string[];
          blocked_domains?: string[];
          daily_window_start?: string | null;
          daily_window_end?: string | null;
          ringtone_uri?: string | null;
        };
        Update: Partial<{
          blocked_apps: string[];
          blocked_domains: string[];
          daily_window_start: string | null;
          daily_window_end: string | null;
          ringtone_uri: string | null;
        }>;
        Relationships: [];
      };
      block_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: "block_start" | "override_requested" | "override_granted" | "auto_relock";
          reason_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: "block_start" | "override_requested" | "override_granted" | "auto_relock";
          reason_text?: string | null;
        };
        Update: Partial<{
          event_type: "block_start" | "override_requested" | "override_granted" | "auto_relock";
          reason_text: string | null;
        }>;
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
