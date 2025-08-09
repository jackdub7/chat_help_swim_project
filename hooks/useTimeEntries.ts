import { useState, useEffect } from 'react';
import { 
  addTimeEntry as addTimeEntryAPI,
  getTimeEntries,
  updateTimeEntry as updateTimeEntryAPI,
  deleteTimeEntry as deleteTimeEntryAPI,
} from '@/lib/supabase';

interface TimeEntry {
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
  users: {
    id: string;
    name: string;
    email: string;
  };
}

export const useTimeEntries = (userId: string | null, teamId?: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadTimeEntries();
    }
  }, [userId, teamId]);

  const loadTimeEntries = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await getTimeEntries(userId, teamId);
      if (error) throw error;
      setTimeEntries(data || []);
    } catch (err: any) {
      console.error('Error loading time entries:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTimeEntry = async (timeData: {
    stroke: string;
    distance: number;
    time: string;
    test_set: string;
    notes?: string;
    team_id?: string;
  }) => {
    if (!userId) return { success: false, error: 'No user logged in' };

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await addTimeEntryAPI({
        swimmer_id: userId,
        ...timeData,
      });

      if (error) throw error;

      // Add to local state
      setTimeEntries(prev => [data, ...prev]);
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding time entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const addBulkTimeEntries = async (entries: Array<{
    swimmer_name: string;
    stroke: string;
    distance: number;
    time: string;
    test_set: string;
    notes?: string;
  }>, teamId?: string) => {
    if (!userId) return { success: false, error: 'No user logged in' };

    setIsLoading(true);
    setError(null);

    try {
      const results = [];
      
      for (const entry of entries) {
        const { data, error } = await addTimeEntryAPI({
          swimmer_id: userId, // For now, all bulk entries are for the current user
          stroke: entry.stroke,
          distance: entry.distance,
          time: entry.time,
          test_set: entry.test_set,
          notes: entry.notes,
          team_id: teamId,
        });

        if (error) {
          console.error('Error adding bulk entry:', error);
          continue;
        }

        results.push(data);
      }

      // Reload all time entries
      await loadTimeEntries();
      
      return { success: true, count: results.length };
    } catch (err: any) {
      console.error('Error adding bulk time entries:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimeEntry = async (entryId: string, updates: Partial<{
    stroke: string;
    distance: number;
    time: string;
    test_set: string;
    notes: string;
  }>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await updateTimeEntryAPI(entryId, updates);
      if (error) throw error;

      // Update local state
      setTimeEntries(prev => 
        prev.map(entry => 
          entry.id === entryId ? { ...entry, ...updates } : entry
        )
      );
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating time entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTimeEntry = async (entryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await deleteTimeEntryAPI(entryId);
      if (error) throw error;

      // Remove from local state
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
      
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting time entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTimeEntries = () => {
    loadTimeEntries();
  };

  return {
    timeEntries,
    isLoading,
    error,
    addTimeEntry,
    addBulkTimeEntries,
    updateTimeEntry,
    deleteTimeEntry,
    refreshTimeEntries,
  };
};