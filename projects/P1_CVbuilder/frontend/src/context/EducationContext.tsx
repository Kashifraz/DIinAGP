import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { educationService, Education, CreateEducationData, UpdateEducationData, EducationStats } from '../services/educationService';
import toast from 'react-hot-toast';

// Types
interface EducationState {
  education: Education[];
  stats: EducationStats | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
}

type EducationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EDUCATION'; payload: Education[] }
  | { type: 'SET_STATS'; payload: EducationStats | null }
  | { type: 'ADD_EDUCATION'; payload: Education }
  | { type: 'UPDATE_EDUCATION'; payload: Education }
  | { type: 'REMOVE_EDUCATION'; payload: string }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_REORDERING'; payload: boolean };

// Initial state
const initialState: EducationState = {
  education: [],
  stats: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  reordering: false,
};

// Simple reducer
const educationReducer = (state: EducationState, action: EducationAction): EducationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_EDUCATION':
      return { ...state, education: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'ADD_EDUCATION':
      return { ...state, education: [...state.education, action.payload] };
    
    case 'UPDATE_EDUCATION':
      return {
        ...state,
        education: state.education.map(edu =>
          edu._id === action.payload._id ? action.payload : edu
        ),
      };
    
    case 'REMOVE_EDUCATION':
      return {
        ...state,
        education: state.education.filter(edu => edu._id !== action.payload),
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
const EducationContext = createContext<EducationContextType | undefined>(undefined);

// Provider component
interface EducationProviderProps {
  children: ReactNode;
}

interface EducationContextType extends EducationState {
  loadEducation: () => Promise<void>;
  loadStats: () => Promise<void>;
  createEducation: (data: CreateEducationData) => Promise<boolean>;
  updateEducation: (id: string, data: UpdateEducationData) => Promise<boolean>;
  deleteEducation: (id: string) => Promise<boolean>;
  reorderEducation: (educationIds: string[]) => Promise<boolean>;
  moveEducationUp: (id: string) => Promise<boolean>;
  moveEducationDown: (id: string) => Promise<boolean>;
  exportEducation: () => Promise<void>;
  clearError: () => void;
}

export const EducationProvider: React.FC<EducationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(educationReducer, initialState);

  // Load education entries
  const loadEducation = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const education = await educationService.getEducation();
      dispatch({ type: 'SET_EDUCATION', payload: education });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load education';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading education:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load education statistics (removed - not needed)
  const loadStats = useCallback(async (): Promise<void> => {
    // Stats functionality removed
  }, []);

  // Create education entry
  const createEducation = useCallback(async (data: CreateEducationData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_CREATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newEducation = await educationService.createEducation(data);
      dispatch({ type: 'ADD_EDUCATION', payload: newEducation });
      
      // Stats functionality removed
      
      toast.success('Education entry created successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create education entry';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_CREATING', payload: false });
    }
  }, []);

  // Update education entry
  const updateEducation = useCallback(async (id: string, data: UpdateEducationData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEducation = await educationService.updateEducation(id, data);
      dispatch({ type: 'UPDATE_EDUCATION', payload: updatedEducation });
      
      // Stats functionality removed
      
      toast.success('Education entry updated successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update education entry';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  }, []);

  // Delete education entry
  const deleteEducation = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_DELETING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await educationService.deleteEducation(id);
      dispatch({ type: 'REMOVE_EDUCATION', payload: id });
      
      // Stats functionality removed
      
      toast.success('Education entry deleted successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete education entry';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  }, []);

  // Reorder education entries
  const reorderEducation = useCallback(async (educationIds: string[]): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const reorderedEducation = await educationService.reorderEducation({ educationIds });
      dispatch({ type: 'SET_EDUCATION', payload: reorderedEducation });
      
      toast.success('Education entries reordered successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reorder education entries';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Move education entry up
  const moveEducationUp = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEducation = await educationService.moveEducationUp(id);
      dispatch({ type: 'SET_EDUCATION', payload: updatedEducation });
      
      toast.success('Education entry moved up!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move education entry';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Move education entry down
  const moveEducationDown = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedEducation = await educationService.moveEducationDown(id);
      dispatch({ type: 'SET_EDUCATION', payload: updatedEducation });
      
      toast.success('Education entry moved down!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move education entry';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Export education data
  const exportEducation = useCallback(async (): Promise<void> => {
    try {
      const exportData = await educationService.exportEducation();
      
      // Create and download file
      const dataStr = JSON.stringify(exportData.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `education-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      toast.success('Education data exported successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to export education data';
      toast.error(errorMessage);
    }
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Load data on mount
  useEffect(() => {
    loadEducation();
  }, [loadEducation]);

  const contextValue: EducationContextType = useMemo(() => ({
    ...state,
    loadEducation,
    loadStats,
    createEducation,
    updateEducation,
    deleteEducation,
    reorderEducation,
    moveEducationUp,
    moveEducationDown,
    exportEducation,
    clearError,
  }), [state, loadEducation, loadStats, createEducation, updateEducation, deleteEducation, reorderEducation, moveEducationUp, moveEducationDown, exportEducation, clearError]);

  return (
    <EducationContext.Provider value={contextValue}>
      {children}
    </EducationContext.Provider>
  );
};

// Hook to use education context
export const useEducation = (): EducationContextType => {
  const context = useContext(EducationContext);
  if (context === undefined) {
    throw new Error('useEducation must be used within an EducationProvider');
  }
  return context;
};