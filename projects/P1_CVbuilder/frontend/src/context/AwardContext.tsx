import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Award, CreateAwardData, UpdateAwardData, AwardStats, awardService } from '../services/awardService';

// Context interface
interface AwardContextType {
  awards: Award[];
  stats: AwardStats | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
  createAward: (data: CreateAwardData) => Promise<Award | null>;
  updateAward: (id: string, data: UpdateAwardData) => Promise<Award | null>;
  deleteAward: (id: string) => Promise<boolean>;
  moveAwardUp: (id: string) => Promise<boolean>;
  moveAwardDown: (id: string) => Promise<boolean>;
  refreshAwards: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AwardContext = createContext<AwardContextType | undefined>(undefined);

// Provider component
export const AwardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [stats, setStats] = useState<AwardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Refresh awards
  const refreshAwards = useCallback(async (): Promise<void> => {
    try {
      console.log('AwardContext: refreshAwards called');
      setLoading(true);
      setError(null);
      const awardsData = await awardService.getAwards();
      console.log('AwardContext: received awards data:', awardsData);
      console.log('AwardContext: awards data type:', typeof awardsData);
      console.log('AwardContext: awards data is array:', Array.isArray(awardsData));
      console.log('AwardContext: awards data length:', awardsData?.length);
      setAwards(awardsData || []);
    } catch (err: any) {
      console.error('AwardContext: error fetching awards:', err);
      setError(err.response?.data?.message || 'Failed to fetch awards');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh stats
  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const statsData = await awardService.getAwardsStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('AwardContext: error fetching stats:', err);
    }
  }, []);

  // Create award
  const createAward = useCallback(async (data: CreateAwardData): Promise<Award | null> => {
    try {
      console.log('AwardContext: creating award with data:', data);
      setCreating(true);
      setError(null);
      const newAward = await awardService.createAward(data);
      console.log('AwardContext: received created award:', newAward);
      if (newAward) {
        setAwards(prev => [...(prev || []), newAward]);
        await refreshStats();
      }
      return newAward;
    } catch (err: any) {
      console.error('AwardContext: error creating award:', err);
      setError(err.response?.data?.message || 'Failed to create award');
      return null;
    } finally {
      setCreating(false);
    }
  }, [refreshStats]);

  // Update award
  const updateAward = useCallback(async (id: string, data: UpdateAwardData): Promise<Award | null> => {
    try {
      console.log('AwardContext: updating award with id:', id, 'data:', data);
      setUpdating(true);
      setError(null);
      const updatedAward = await awardService.updateAward(id, data);
      console.log('AwardContext: received updated award:', updatedAward);
      if (updatedAward) {
        setAwards(prev => 
          (prev || []).map(award => 
            award._id === id ? updatedAward : award
          )
        );
        await refreshStats();
      }
      return updatedAward;
    } catch (err: any) {
      console.error('AwardContext: error updating award:', err);
      setError(err.response?.data?.message || 'Failed to update award');
      return null;
    } finally {
      setUpdating(false);
    }
  }, [refreshStats]);

  // Delete award
  const deleteAward = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      await awardService.deleteAward(id);
      setAwards(prev => (prev || []).filter(award => award._id !== id));
      await refreshStats();
      return true;
    } catch (err: any) {
      console.error('AwardContext: error deleting award:', err);
      setError(err.response?.data?.message || 'Failed to delete award');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [refreshStats]);

  // Move award up
  const moveAwardUp = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('AwardContext: moveAwardUp called with id:', id);
      setReordering(true);
      setError(null);
      const updatedAwards = await awardService.moveAwardUp(id);
      console.log('AwardContext: received updated awards:', updatedAwards);
      console.log('AwardContext: updated awards length:', updatedAwards?.length);
      
      if (updatedAwards && updatedAwards.length > 0) {
        setAwards(updatedAwards);
        return true;
      } else {
        console.error('AwardContext: received empty awards array, refreshing...');
        await refreshAwards();
        return false;
      }
    } catch (err: any) {
      console.error('AwardContext: error moving award up:', err);
      setError(err.response?.data?.message || 'Failed to move award up');
      return false;
    } finally {
      setReordering(false);
    }
  }, [refreshAwards]);

  // Move award down
  const moveAwardDown = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('AwardContext: moveAwardDown called with id:', id);
      setReordering(true);
      setError(null);
      const updatedAwards = await awardService.moveAwardDown(id);
      console.log('AwardContext: received updated awards:', updatedAwards);
      console.log('AwardContext: updated awards length:', updatedAwards?.length);
      
      if (updatedAwards && updatedAwards.length > 0) {
        setAwards(updatedAwards);
        return true;
      } else {
        console.error('AwardContext: received empty awards array, refreshing...');
        await refreshAwards();
        return false;
      }
    } catch (err: any) {
      console.error('AwardContext: error moving award down:', err);
      setError(err.response?.data?.message || 'Failed to move award down');
      return false;
    } finally {
      setReordering(false);
    }
  }, [refreshAwards]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Load awards on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('AwardContext: useEffect triggered - fetching awards');
      refreshAwards();
    }
  }, [refreshAwards]);

  // Context value
  const contextValue: AwardContextType = useMemo(() => ({
    awards: awards || [],
    stats,
    loading,
    error,
    creating,
    updating,
    deleting,
    reordering,
    createAward,
    updateAward,
    deleteAward,
    moveAwardUp,
    moveAwardDown,
    refreshAwards,
    refreshStats,
    clearError
  }), [
    awards,
    stats,
    loading,
    error,
    creating,
    updating,
    deleting,
    reordering,
    createAward,
    updateAward,
    deleteAward,
    moveAwardUp,
    moveAwardDown,
    refreshAwards,
    refreshStats,
    clearError
  ]);

  return (
    <AwardContext.Provider value={contextValue}>
      {children}
    </AwardContext.Provider>
  );
};

// Hook to use award context
export const useAward = (): AwardContextType => {
  const context = useContext(AwardContext);
  if (context === undefined) {
    throw new Error('useAward must be used within an AwardProvider');
  }
  return context;
};