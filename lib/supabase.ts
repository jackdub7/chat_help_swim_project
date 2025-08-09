import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Auth helper functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'exp://localhost:8081',
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// User profile functions
export const createUserProfile = async (userId: string, userData: {
  email: string;
  name: string;
  role: 'swimmer' | 'coach';
  avatar_url?: string;
}) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: userId,
      ...userData,
    }])
    .select()
    .single();
  
  return { data, error };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<{
  name: string;
  role: 'swimmer' | 'coach';
  avatar_url: string;
}>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Team management functions
export const createTeam = async (teamData: {
  name: string;
  description?: string;
  logo_url?: string;
  coach_id: string;
}) => {
  // Generate unique team code
  const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const { data, error } = await supabase
    .from('teams')
    .insert([{
      ...teamData,
      team_code: teamCode,
    }])
    .select()
    .single();
  
  return { data, error };
};

export const getTeamsByCoach = async (coachId: string) => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        id,
        user_id,
        users (
          id,
          name,
          email,
          avatar_url
        )
      )
    `)
    .eq('coach_id', coachId);
  
  return { data, error };
};

export const getTeamByCode = async (teamCode: string) => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      users!teams_coach_id_fkey (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('team_code', teamCode)
    .single();
  
  return { data, error };
};

export const joinTeam = async (teamId: string, userId: string) => {
  const { data, error } = await supabase
    .from('team_members')
    .insert([{
      team_id: teamId,
      user_id: userId,
    }])
    .select()
    .single();
  
  return { data, error };
};

export const getSwimmerTeams = async (userId: string) => {
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      teams (
        *,
        users!teams_coach_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId);
  
  return { data, error };
};

// Time entries functions
export const addTimeEntry = async (timeData: {
  swimmer_id: string;
  stroke: string;
  distance: number;
  time: string;
  test_set: string;
  notes?: string;
  team_id?: string;
}) => {
  const { data, error } = await supabase
    .from('time_entries')
    .insert([timeData])
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .single();
  
  return { data, error };
};

export const getTimeEntries = async (userId: string, teamId?: string) => {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      users (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (teamId) {
    // Coach viewing team times
    query = query.eq('team_id', teamId);
  } else {
    // Swimmer viewing their own times
    query = query.eq('swimmer_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const updateTimeEntry = async (entryId: string, updates: Partial<{
  stroke: string;
  distance: number;
  time: string;
  test_set: string;
  notes: string;
}>) => {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  
  return { data, error };
};

export const deleteTimeEntry = async (entryId: string) => {
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId);
  
  return { error };
};