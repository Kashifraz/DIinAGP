import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Reference, CreateReferenceData, UpdateReferenceData, ReferenceStats, referenceService } from '../services/referenceService';

// Context interface
interface ReferenceContextType {
  references: Reference[];
  stats: ReferenceStats | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
  createReference: (data: CreateReferenceData) => Promise<Reference | null>;
  updateReference: (id: string, data: UpdateReferenceData) => Promise<Reference | null>;
  deleteReference: (id: string) => Promise<boolean>;
  moveReferenceUp: (id: string) => Promise<boolean>;
  moveReferenceDown: (id: string) => Promise<boolean>;
  refreshReferences: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

// Create context
const ReferenceContext = createContext<ReferenceContextType | undefined>(undefined);

// Provider component
export const ReferenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [stats, setStats] = useState<ReferenceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Refresh references
  const refreshReferences = useCallback(async (): Promise<void> => {
    try {
      console.log('ReferenceContext: refreshReferences called');
      setLoading(true);
      setError(null);
      const referencesData = await referenceService.getReferences();
      console.log('ReferenceContext: received references data:', referencesData);
      console.log('ReferenceContext: references data type:', typeof referencesData);
      console.log('ReferenceContext: references data is array:', Array.isArray(referencesData));
      console.log('ReferenceContext: references data length:', referencesData?.length);
      setReferences(referencesData || []);
    } catch (err: any) {
      console.error('ReferenceContext: error fetching references:', err);
      setError(err.response?.data?.message || 'Failed to fetch references');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh stats
  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const statsData = await referenceService.getReferencesStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('ReferenceContext: error fetching stats:', err);
    }
  }, []);

  // Create reference
  const createReference = useCallback(async (data: CreateReferenceData): Promise<Reference | null> => {
    try {
      console.log('ReferenceContext: creating reference with data:', data);
      setCreating(true);
      setError(null);
      const newReference = await referenceService.createReference(data);
      console.log('ReferenceContext: received created reference:', newReference);
      if (newReference) {
        setReferences(prev => [...(prev || []), newReference]);
        await refreshStats();
      }
      return newReference;
    } catch (err: any) {
      console.error('ReferenceContext: error creating reference:', err);
      setError(err.response?.data?.message || 'Failed to create reference');
      return null;
    } finally {
      setCreating(false);
    }
  }, [refreshStats]);

  // Update reference
  const updateReference = useCallback(async (id: string, data: UpdateReferenceData): Promise<Reference | null> => {
    try {
      console.log('ReferenceContext: updating reference with id:', id, 'data:', data);
      setUpdating(true);
      setError(null);
      const updatedReference = await referenceService.updateReference(id, data);
      console.log('ReferenceContext: received updated reference:', updatedReference);
      if (updatedReference) {
        setReferences(prev => 
          (prev || []).map(reference => 
            reference._id === id ? updatedReference : reference
          )
        );
        await refreshStats();
      }
      return updatedReference;
    } catch (err: any) {
      console.error('ReferenceContext: error updating reference:', err);
      setError(err.response?.data?.message || 'Failed to update reference');
      return null;
    } finally {
      setUpdating(false);
    }
  }, [refreshStats]);

  // Delete reference
  const deleteReference = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      await referenceService.deleteReference(id);
      setReferences(prev => (prev || []).filter(reference => reference._id !== id));
      await refreshStats();
      return true;
    } catch (err: any) {
      console.error('ReferenceContext: error deleting reference:', err);
      setError(err.response?.data?.message || 'Failed to delete reference');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [refreshStats]);

  // Move reference up
  const moveReferenceUp = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('ReferenceContext: moveReferenceUp called with id:', id);
      setReordering(true);
      setError(null);
      const updatedReferences = await referenceService.moveReferenceUp(id);
      console.log('ReferenceContext: received updated references:', updatedReferences);
      console.log('ReferenceContext: updated references length:', updatedReferences?.length);
      
      if (updatedReferences && updatedReferences.length > 0) {
        setReferences(updatedReferences);
        return true;
      } else {
        console.error('ReferenceContext: received empty references array, refreshing...');
        await refreshReferences();
        return false;
      }
    } catch (err: any) {
      console.error('ReferenceContext: error moving reference up:', err);
      setError(err.response?.data?.message || 'Failed to move reference up');
      return false;
    } finally {
      setReordering(false);
    }
  }, [refreshReferences]);

  // Move reference down
  const moveReferenceDown = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('ReferenceContext: moveReferenceDown called with id:', id);
      setReordering(true);
      setError(null);
      const updatedReferences = await referenceService.moveReferenceDown(id);
      console.log('ReferenceContext: received updated references:', updatedReferences);
      console.log('ReferenceContext: updated references length:', updatedReferences?.length);
      
      if (updatedReferences && updatedReferences.length > 0) {
        setReferences(updatedReferences);
        return true;
      } else {
        console.error('ReferenceContext: received empty references array, refreshing...');
        await refreshReferences();
        return false;
      }
    } catch (err: any) {
      console.error('ReferenceContext: error moving reference down:', err);
      setError(err.response?.data?.message || 'Failed to move reference down');
      return false;
    } finally {
      setReordering(false);
    }
  }, [refreshReferences]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Load references on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('ReferenceContext: useEffect triggered - fetching references');
      refreshReferences();
    }
  }, [refreshReferences]);

  // Context value
  const contextValue: ReferenceContextType = useMemo(() => ({
    references: references || [],
    stats,
    loading,
    error,
    creating,
    updating,
    deleting,
    reordering,
    createReference,
    updateReference,
    deleteReference,
    moveReferenceUp,
    moveReferenceDown,
    refreshReferences,
    refreshStats,
    clearError
  }), [
    references,
    stats,
    loading,
    error,
    creating,
    updating,
    deleting,
    reordering,
    createReference,
    updateReference,
    deleteReference,
    moveReferenceUp,
    moveReferenceDown,
    refreshReferences,
    refreshStats,
    clearError
  ]);

  return (
    <ReferenceContext.Provider value={contextValue}>
      {children}
    </ReferenceContext.Provider>
  );
};

// Hook to use reference context
export const useReference = (): ReferenceContextType => {
  const context = useContext(ReferenceContext);
  if (context === undefined) {
    throw new Error('useReference must be used within a ReferenceProvider');
  }
  return context;
};