import { useState, useEffect } from 'react';
import { TimeEntry, Team, TeamMember } from '@/types/swimming';

export const useSwimmingData = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Simulate API calls and data persistence
  const addTimeEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    setIsLoading(true);
    try {
      const newEntry: TimeEntry = {
        ...entry,
        id: Date.now().toString(),
      };
      setTimeEntries(prev => [newEntry, ...prev]);
      
      // In a real app, this would sync to server
      await simulateAPICall();
    } catch (error) {
      console.error('Error adding time entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimeEntry = async (id: string, updates: Partial<TimeEntry>) => {
    setIsLoading(true);
    try {
      setTimeEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        )
      );
      await simulateAPICall();
    } catch (error) {
      console.error('Error updating time entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTimeEntry = async (id: string) => {
    setIsLoading(true);
    try {
      setTimeEntries(prev => prev.filter(entry => entry.id !== id));
      await simulateAPICall();
    } catch (error) {
      console.error('Error deleting time entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (name: string, coachId: string) => {
    setIsLoading(true);
    try {
      const newTeam: Team = {
        id: Date.now().toString(),
        name,
        coachId,
        joinCode: generateJoinCode(),
        createdAt: new Date().toISOString(),
        members: [],
      };
      setTeams(prev => [...prev, newTeam]);
      await simulateAPICall();
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinTeam = async (joinCode: string, member: TeamMember) => {
    setIsLoading(true);
    try {
      setTeams(prev => 
        prev.map(team => 
          team.joinCode === joinCode 
            ? { ...team, members: [...team.members, member] }
            : team
        )
      );
      await simulateAPICall();
    } catch (error) {
      console.error('Error joining team:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncData = async () => {
    if (isOffline) return;
    
    setIsLoading(true);
    try {
      // Simulate syncing with server
      await simulateAPICall();
      console.log('Data synced successfully');
    } catch (error) {
      console.error('Error syncing data:', error);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions
  const simulateAPICall = () => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Auto-sync on app load
  useEffect(() => {
    syncData();
  }, []);

  return {
    timeEntries,
    teams,
    isLoading,
    isOffline,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    createTeam,
    joinTeam,
    syncData,
  };
};