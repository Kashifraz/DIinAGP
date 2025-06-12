import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { experienceService, Experience, CreateExperienceData, UpdateExperienceData, ExperienceStats } from '../services/experienceService';
import toast from 'react-hot-toast';

// Types
interface ExperienceState {
  experience: Experience[];
  stats: ExperienceStats | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
}

type ExperienceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EXPERIENCE'; payload: Experience[] }
  | { type: 'SET_STATS'; payload: ExperienceStats | null }
  | { type: 'ADD_EXPERIENCE'; payload: Experience }
  | { type: 'UPDATE_EXPERIENCE'; payload: Experience }
  | { type: 'REMOVE_EXPERIENCE'; payload: string }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_REORDERING'; payload: boolean };

// Initial state
const initialState: ExperienceState = {
  experience: [],
  stats: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  reordering: false,
};

// Simple reducer
const experienceReducer = (state: ExperienceState, action: ExperienceAction): ExperienceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_EXPERIENCE':
      return { ...state, experience: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'ADD_EXPERIENCE':
      return { ...state, experience: [...state.experience, action.payload] };
    
    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        experience: state.experience.map(exp =>
          exp._id === action.payload._id ? action.payload : exp
        ),
      };
    
    case 'REMOVE_EXPERIENCE':
      return {
        ...state,
        experience: state.experience.filter(exp => exp._id !== action.payload),
      };
    
    case 'SET_CREATING':
      return { ...state, creating: action.payload };
    
    case 'SET_UPDATING':
      return { ...state, updating: action.payload };
    
    case 'SET_DELETING':
      return { ...state, deleting: action.payload };
    
    case 'SET_REORDERING':
      return { ...state, reordering: action.payload };
    
    default:
      return state;
  }
};

// Context
const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

// Provider component
interface ExperienceProviderProps {
  children: ReactNode;
}

interface ExperienceContextType extends ExperienceState {
  loadExperience: () => Promise<void>;
  loadStats: () => Promise<void>;
  createExperience: (data: CreateExperienceData) => Promise<boolean>;
  updateExperience: (id: string, data: UpdateExperienceData) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  reorderExperience: (experienceIds: string[]) => Promise<boolean>;
  moveExperienceUp: (id: string) => Promise<boolean>;
  moveExperienceDown: (id: string) => Promise<boolean>;
  exportExperience: () => Promise<void>;
  clearError: () => void;
}

export const ExperienceProvider: React.FC<ExperienceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(experienceReducer, initialState);

  // Load experience entries
  const loadExperience = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const experience = await experienceService.getExperience();
      dispatch({ type: 'SET_EXPERIENCE', payload: experience });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load experience';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading experience:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load experience statistics
  const loadStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await experienceService.getExperienceStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error: any) {
      console.error('Error loading experience stats:', error);
    }
  }, []);

  // Create experience entry
  const createExperience = useCallback(async (data: CreateExperienceData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_CREATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newExperience = await experienceService.createExperience(data);
      dispatch({ type: 'ADD_EXPERIENCE', payload: newExperience });
      
      // Reload stats after creating
      await loadStats();
      
      toast.success('Work experience created successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create work experience';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_CREATING', payload: false });
    }
  }, [loadStats]);

  // Update experience entry
  const updateExperience = useCallback(async (id: string, data: UpdateExperienceData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedExperience = await experienceService.updateExperience(id, data);
      dispatch({ type: 'UPDATE_EXPERIENCE', payload: updatedExperience });
      
      // Reload stats after updating
      await loadStats();
      
      toast.success('Work experience updated successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update work experience';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  }, [loadStats]);

  // Delete experience entry
  const deleteExperience = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_DELETING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await experienceService.deleteExperience(id);
      dispatch({ type: 'REMOVE_EXPERIENCE', payload: id });
      
      // Reload stats after deleting
      await loadStats();
      
      toast.success('Work experience deleted successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete work experience';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  }, [loadStats]);

  // Reorder experience entries
  const reorderExperience = useCallback(async (experienceIds: string[]): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const reorderedExperience = await experienceService.reorderExperience({ experienceIds });
      dispatch({ type: 'SET_EXPERIENCE', payload: reorderedExperience });
      
      toast.success('Work experience reordered successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reorder work experience';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Move experience entry up
  const moveExperienceUp = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedExperience = await experienceService.moveExperienceUp(id);
      dispatch({ type: 'SET_EXPERIENCE', payload: updatedExperience });
      
      toast.success('Work experience moved up!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move work experience';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Move experience entry down
  const moveExperienceDown = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedExperience = await experienceService.moveExperienceDown(id);
      dispatch({ type: 'SET_EXPERIENCE', payload: updatedExperience });
      
      toast.success('Work experience moved down!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move work experience';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Export experience data
  const exportExperience = useCallback(async (): Promise<void> => {
    try {
      const exportData = await experienceService.exportExperience();
      
      // Create and download file
      const dataStr = JSON.stringify(exportData.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `experience-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      toast.success('Work experience data exported successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to export work experience data';
      toast.error(errorMessage);
    }
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Load data on mount
  useEffect(() => {
    loadExperience();
  }, [loadExperience]);

  const contextValue: ExperienceContextType = useMemo(() => ({
    ...state,
    loadExperience,
    loadStats,
    createExperience,
    updateExperience,
    deleteExperience,
    reorderExperience,
    moveExperienceUp,
    moveExperienceDown,
    exportExperience,
    clearError,
  }), [state, loadExperience, loadStats, createExperience, updateExperience, deleteExperience, reorderExperience, moveExperienceUp, moveExperienceDown, exportExperience, clearError]);

  return (
    <ExperienceContext.Provider value={contextValue}>
      {children}
    </ExperienceContext.Provider>
  );
};

// Hook to use experience context
export const useExperience = (): ExperienceContextType => {
  const context = useContext(ExperienceContext);
  if (context === undefined) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};
