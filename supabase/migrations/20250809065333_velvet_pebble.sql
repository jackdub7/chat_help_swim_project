/*
  # Swimming Team Management Database Schema

  1. New Tables
    - `users` - User profiles with authentication data
      - `id` (uuid, primary key, matches auth.users)
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `role` (enum: swimmer/coach, default swimmer)
      - `avatar_url` (text, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    
    - `teams` - Swimming teams managed by coaches
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, optional)
      - `logo_url` (text, optional)
      - `team_code` (text, unique, 6 characters)
      - `coach_id` (uuid, foreign key to users)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
    
    - `team_members` - Junction table for team membership
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to teams)
      - `user_id` (uuid, foreign key to users)
      - `joined_at` (timestamptz, default now)
    
    - `time_entries` - Swimming time records
      - `id` (uuid, primary key)
      - `swimmer_id` (uuid, foreign key to users)
      - `stroke` (text, not null)
      - `distance` (integer, not null)
      - `time` (text, not null, formatted as mm:ss.ss)
      - `test_set` (text, not null)
      - `notes` (text, optional)
      - `team_id` (uuid, foreign key to teams, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on all tables
    - Users can read/update their own profile
    - Coaches can manage their teams and view team member data
    - Swimmers can only view their own data and team information
    - Time entries are accessible based on team membership and ownership

  3. Indexes
    - Index on team_code for fast team lookups
    - Index on swimmer_id and team_id for time entry queries
    - Index on coach_id for team management queries
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('swimmer', 'coach');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role user_role DEFAULT 'swimmer',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  team_code text UNIQUE NOT NULL,
  coach_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swimmer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stroke text NOT NULL,
  distance integer NOT NULL,
  time text NOT NULL,
  test_set text NOT NULL,
  notes text,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_teams_team_code ON teams(team_code);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_swimmer_id ON time_entries(swimmer_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_team_id ON time_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for teams table
CREATE POLICY "Coaches can manage their teams"
  ON teams
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "Team members can read team info"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for team_members table
CREATE POLICY "Coaches can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their team memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for time_entries table
CREATE POLICY "Users can manage their own time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (swimmer_id = auth.uid());

CREATE POLICY "Coaches can view team time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage team time entries"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE coach_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();