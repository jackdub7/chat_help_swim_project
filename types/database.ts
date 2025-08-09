export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'swimmer' | 'coach';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: 'swimmer' | 'coach';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'swimmer' | 'coach';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          team_code: string;
          coach_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          team_code: string;
          coach_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          team_code?: string;
          coach_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          swimmer_id: string;
          stroke: string;
          distance: number;
          time: string;
          test_set: string;
          notes: string | null;
          team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          swimmer_id: string;
          stroke: string;
          distance: number;
          time: string;
          test_set: string;
          notes?: string | null;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          swimmer_id?: string;
          stroke?: string;
          distance?: number;
          time?: string;
          test_set?: string;
          notes?: string | null;
          team_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}