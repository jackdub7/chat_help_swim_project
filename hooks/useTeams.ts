import { useState, useEffect } from 'react';
import { 
  createTeam as createTeamAPI,
  getTeamsByCoach,
  getTeamByCode,
  joinTeam as joinTeamAPI,
  getSwimmerTeams,
} from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  team_code: string;
  coach_id: string;
  created_at: string;
  updated_at: string;
}

interface TeamWithMembers extends Team {
  team_members: Array<{
    id: string;
    user_id: string;
    users: {
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
    };
  }>;
}

interface SwimmerTeam {
  teams: Team & {
    users: {
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
    };
  };
}

export const useTeams = (userId: string | null, userRole: 'swimmer' | 'coach' | null) => {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [swimmerTeams, setSwimmerTeams] = useState<SwimmerTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId && userRole) {
      loadTeams();
    }
  }, [userId, userRole]);

  const loadTeams = async () => {
    if (!userId || !userRole) return;

    setIsLoading(true);
    setError(null);

    try {
      if (userRole === 'coach') {
        const { data, error } = await getTeamsByCoach(userId);
        if (error) throw error;
        setTeams(data || []);
      } else {
        const { data, error } = await getSwimmerTeams(userId);
        if (error) throw error;
        setSwimmerTeams(data || []);
      }
    } catch (err: any) {
      console.error('Error loading teams:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (teamData: {
    name: string;
    description?: string;
    logo_url?: string;
  }) => {
    if (!userId) return { success: false, error: 'No user logged in' };

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await createTeamAPI({
        ...teamData,
        coach_id: userId,
      });

      if (error) throw error;

      // Reload teams to get updated list
      await loadTeams();
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error creating team:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const joinTeamByCode = async (teamCode: string) => {
    if (!userId) return { success: false, error: 'No user logged in' };

    setIsLoading(true);
    setError(null);

    try {
      // First, get team by code to verify it exists
      const { data: team, error: teamError } = await getTeamByCode(teamCode);
      if (teamError) throw new Error('Invalid team code');

      // Join the team
      const { data, error } = await joinTeamAPI(team.id, userId);
      if (error) throw error;

      // Reload teams to get updated list
      await loadTeams();
      
      return { success: true, data: team };
    } catch (err: any) {
      console.error('Error joining team:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTeams = () => {
    loadTeams();
  };

  return {
    teams,
    swimmerTeams,
    isLoading,
    error,
    createTeam,
    joinTeamByCode,
    refreshTeams,
  };
};