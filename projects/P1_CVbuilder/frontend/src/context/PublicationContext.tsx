import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Publication, CreatePublicationData, UpdatePublicationData, PublicationStats, publicationService } from '../services/publicationService';

// Context interface
interface PublicationContextType {
  publications: Publication[];
  stats: PublicationStats | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
  createPublication: (data: CreatePublicationData) => Promise<Publication | null>;
  updatePublication: (id: string, data: UpdatePublicationData) => Promise<Publication | null>;
  deletePublication: (id: string) => Promise<boolean>;
  movePublicationUp: (id: string) => Promise<boolean>;
  movePublicationDown: (id: string) => Promise<boolean>;
  refreshPublications: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

// Create context
const PublicationContext = createContext<PublicationContextType | undefined>(undefined);

// Provider component
export const PublicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [stats, setStats] = useState<PublicationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Refresh publications
  const refreshPublications = useCallback(async (): Promise<void> => {
    try {
      console.log('PublicationContext: refreshPublications called');
      setLoading(true);
      setError(null);
      const publicationsData = await publicationService.getPublications();
      console.log('PublicationContext: received publications data:', publicationsData);
      console.log('PublicationContext: publications data type:', typeof publicationsData);
      console.log('PublicationContext: publications data is array:', Array.isArray(publicationsData));
      console.log('PublicationContext: publications data length:', publicationsData?.length);
      setPublications(publicationsData || []);
    } catch (err: any) {
      console.error('PublicationContext: error fetching publications:', err);
      setError(err.response?.data?.message || 'Failed to fetch publications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh stats
  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const statsData = await publicationService.getPublicationsStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('PublicationContext: error fetching stats:', err);
    }
  }, []);

  // Create publication
  const createPublication = useCallback(async (data: CreatePublicationData): Promise<Publication | null> => {
    try {
      setCreating(true);
      setError(null);
      const newPublication = await publicationService.createPublication(data);
      if (newPublication) {
        setPublications(prev => [...(prev || []), newPublication]);
        await refreshStats();
      }
      return newPublication;
    } catch (err: any) {
      console.error('PublicationContext: error creating publication:', err);
      setError(err.response?.data?.message || 'Failed to create publication');
      return null;
    } finally {
      setCreating(false);
    }
  }, [refreshStats]);

  // Update publication
  const updatePublication = useCallback(async (id: string, data: UpdatePublicationData): Promise<Publication | null> => {
    try {
      setUpdating(true);
      setError(null);
      const updatedPublication = await publicationService.updatePublication(id, data);
      if (updatedPublication) {
        setPublications(prev => 
          (prev || []).map(pub => 
            pub._id === id ? updatedPublication : pub
          )
        );
        await refreshStats();
      }
      return updatedPublication;
    } catch (err: any) {
      console.error('PublicationContext: error updating publication:', err);
      setError(err.response?.data?.message || 'Failed to update publication');
      return null;
    } finally {
      setUpdating(false);
    }
  }, [refreshStats]);

  // Delete publication
  const deletePublication = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      await publicationService.deletePublication(id);
      setPublications(prev => (prev || []).filter(pub => pub._id !== id));
      await refreshStats();
      return true;
    } catch (err: any) {
      console.error('PublicationContext: error deleting publication:', err);
      setError(err.response?.data?.message || 'Failed to delete publication');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [refreshStats]);

  // Move publication up
  const movePublicationUp = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('PublicationContext: movePublicationUp called with id:', id);
      setReordering(true);
      setError(null);
      const updatedPublications = await publicationService.movePublicationUp(id);
      console.log('PublicationContext: received updated publications:', updatedPublications);
      console.log('PublicationContext: updated publications length:', updatedPublications?.length);
      
      if (updatedPublications && updatedPublications.length > 0) {
        setPublications(updatedPublications);
        return true;
      } else {
        console.error('PublicationContext: received empty publications array, refreshing...');
        await refreshPublications();
        return false;
      }
    } catch (err: any) {
      console.error('PublicationContext: error moving publication up:', err);
      setError(err.response?.data?.message || 'Failed to move publication up');
      return false;
    } finally {
      setReordering(false);
    }
  }, [refreshPublications]);

  // Move publication down
  const movePublicationDown = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('PublicationContext: movePublicationDown called with id:', id);
      setReordering(true);
      setError(null);
      const updatedPublications = await publicationService.movePublicationDown(id);
      console.log('PublicationContext: received updated publications:', updatedPublications);
      console.log('PublicationContext: updated publications length:', updatedPublications?.length);
      
      if (updatedPublications && updatedPublications.length > 0) {
        setPublications(updatedPublications);
        return true;
      } else {
        console.error('PublicationContext: received empty publications array, refreshing...');
        await refreshPublications();
        return false;
      }
    } catch (err: any) {
      console.error('PublicationContext: error moving publication down:', err);
      setError(err.response?.data?.message || 'Failed to move publication down');
      return false;
    } finally {
      setReordering(false);
    }
  }, [refreshPublications]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Load publications on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('PublicationContext: useEffect triggered - fetching publications');
      refreshPublications();
    }
  }, [refreshPublications]);

  // Context value
  const contextValue: PublicationContextType = useMemo(() => ({
    publications: publications || [],
    stats,
    loading,
    error,
    creating,
    updating,
    deleting,
    reordering,
    createPublication,
    updatePublication,
    deletePublication,
    movePublicationUp,
    movePublicationDown,
    refreshPublications,
    refreshStats,
    clearError
  }), [
    publications,
    stats,
    loading,
    error,
    creating,
    updating,
    deleting,
    reordering,
    createPublication,
    updatePublication,
    deletePublication,
    movePublicationUp,
    movePublicationDown,
    refreshPublications,
    refreshStats,
    clearError
  ]);

  return (
    <PublicationContext.Provider value={contextValue}>
      {children}
    </PublicationContext.Provider>
  );
};

// Hook to use publication context
export const usePublications = (): PublicationContextType => {
  const context = useContext(PublicationContext);
  if (context === undefined) {
    throw new Error('usePublications must be used within a PublicationProvider');
  }
  return context;
};