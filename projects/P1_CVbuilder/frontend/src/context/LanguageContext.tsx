import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Language, CreateLanguageData, UpdateLanguageData, languageService } from '../services/languageService';

interface LanguageContextType {
  languages: Language[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
  createLanguage: (data: CreateLanguageData) => Promise<Language | null>;
  updateLanguage: (id: string, data: UpdateLanguageData) => Promise<Language | null>;
  deleteLanguage: (id: string) => Promise<boolean>;
  moveLanguageUp: (id: string) => Promise<boolean>;
  moveLanguageDown: (id: string) => Promise<boolean>;
  refreshLanguages: () => Promise<void>;
  forceRefresh: () => void;
  clearError: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Load languages on mount
  useEffect(() => {
    console.log('LanguageContext: useEffect triggered - checking authentication');
    const token = localStorage.getItem('token');
    if (token) {
      console.log('LanguageContext: token found, fetching languages');
      refreshLanguages();
    } else {
      console.log('LanguageContext: no token found, skipping language fetch');
    }
  }, []);

  const refreshLanguages = async (): Promise<void> => {
    try {
      console.log('LanguageContext: refreshLanguages called');
      setLoading(true);
      setError(null);
      const languagesData = await languageService.getLanguages();
      console.log('LanguageContext: received languages data:', languagesData);
      setLanguages(languagesData);
    } catch (err: any) {
      console.error('LanguageContext: error fetching languages:', err);
      setError(err.response?.data?.message || 'Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const createLanguage = async (data: CreateLanguageData): Promise<Language | null> => {
    try {
      setCreating(true);
      setError(null);
      const newLanguage = await languageService.createLanguage(data);
      setLanguages(prev => [...prev, newLanguage]);
      return newLanguage;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create language');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const updateLanguage = async (id: string, data: UpdateLanguageData): Promise<Language | null> => {
    try {
      setUpdating(true);
      setError(null);
      const updatedLanguage = await languageService.updateLanguage(id, data);
      setLanguages(prev => prev.map(lang => lang._id === id ? updatedLanguage : lang));
      return updatedLanguage;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update language');
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const deleteLanguage = async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);
      await languageService.deleteLanguage(id);
      setLanguages(prev => prev.filter(lang => lang._id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete language');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const moveLanguageUp = async (id: string): Promise<boolean> => {
    try {
      console.log('LanguageContext: moveLanguageUp called with id:', id);
      setReordering(true);
      setError(null);
      const updatedLanguages = await languageService.moveLanguageUp(id);
      console.log('LanguageContext: received updated languages:', updatedLanguages);
      console.log('LanguageContext: updated languages length:', updatedLanguages?.length);
      
      if (updatedLanguages && updatedLanguages.length > 0) {
        setLanguages(updatedLanguages);
        return true;
      } else {
        console.error('LanguageContext: received empty languages array, refreshing...');
        await refreshLanguages();
        return false;
      }
    } catch (err: any) {
      console.error('LanguageContext: error moving language up:', err);
      setError(err.response?.data?.message || 'Failed to move language up');
      return false;
    } finally {
      setReordering(false);
    }
  };

  const moveLanguageDown = async (id: string): Promise<boolean> => {
    try {
      console.log('LanguageContext: moveLanguageDown called with id:', id);
      setReordering(true);
      setError(null);
      const updatedLanguages = await languageService.moveLanguageDown(id);
      console.log('LanguageContext: received updated languages:', updatedLanguages);
      console.log('LanguageContext: updated languages length:', updatedLanguages?.length);
      
      if (updatedLanguages && updatedLanguages.length > 0) {
        setLanguages(updatedLanguages);
        return true;
      } else {
        console.error('LanguageContext: received empty languages array, refreshing...');
        await refreshLanguages();
        return false;
      }
    } catch (err: any) {
      console.error('LanguageContext: error moving language down:', err);
      setError(err.response?.data?.message || 'Failed to move language down');
      return false;
    } finally {
      setReordering(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  // Manual refresh function
  const forceRefresh = (): void => {
    console.log('LanguageContext: forceRefresh called');
    refreshLanguages();
  };

  const value: LanguageContextType = useMemo(() => ({
    languages,
    loading,
    error,
    creating,
    updating,
    deleting,
    reordering,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    moveLanguageUp,
    moveLanguageDown,
    refreshLanguages,
    forceRefresh,
    clearError
  }), [languages, loading, error, creating, updating, deleting, reordering, createLanguage, updateLanguage, deleteLanguage, moveLanguageUp, moveLanguageDown, refreshLanguages, forceRefresh, clearError]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};