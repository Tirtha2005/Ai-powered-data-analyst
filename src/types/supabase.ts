export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      datasets: {
        Row: {
          id: string;
          user_id: string;
          analysis_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          analysis_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          analysis_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          analysis_id: string;
          user_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          user_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          user_id?: string;
          role?: "user" | "assistant" | "system";
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      analysis_results: {
        Row: {
          id: string;
          analysis_id: string;
          user_id: string;
          dataset_id: string | null;
          question: string | null;
          answer: string | null;
          analysis_type:
            | "summary"
            | "chart"
            | "anomaly"
            | "question"
            | "python"
            | "custom";
          chart_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          user_id: string;
          dataset_id?: string | null;
          question?: string | null;
          answer?: string | null;
          analysis_type:
            | "summary"
            | "chart"
            | "anomaly"
            | "question"
            | "python"
            | "custom";
          chart_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          user_id?: string;
          dataset_id?: string | null;
          question?: string | null;
          answer?: string | null;
          analysis_type?:
            | "summary"
            | "chart"
            | "anomaly"
            | "question"
            | "python"
            | "custom";
          chart_data?: Json | null;
          created_at?: string;
        };
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
