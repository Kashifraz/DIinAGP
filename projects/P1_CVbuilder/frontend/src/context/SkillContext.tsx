import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { skillService, Skill, CreateSkillData, UpdateSkillData, SkillStats } from '../services/skillService';
import toast from 'react-hot-toast';

// Types
interface SkillState {
  skills: Skill[];
  stats: SkillStats | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
}

type SkillAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SKILLS'; payload: Skill[] }
  | { type: 'SET_STATS'; payload: SkillStats | null }
  | { type: 'ADD_SKILL'; payload: Skill }
  | { type: 'UPDATE_SKILL'; payload: Skill }
  | { type: 'REMOVE_SKILL'; payload: string }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_REORDERING'; payload: boolean };

// Initial state
const initialState: SkillState = {
  skills: [],
  stats: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  reordering: false,
};

// Simple reducer
const skillReducer = (state: SkillState, action: SkillAction): SkillState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_SKILLS':
      return { ...state, skills: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'ADD_SKILL':
      return { ...state, skills: [...state.skills, action.payload] };
    
    case 'UPDATE_SKILL':
      return {
        ...state,
        skills: state.skills.map(skill =>
          skill._id === action.payload._id ? action.payload : skill
        ),
      };
    
    case 'REMOVE_SKILL':
      return {
        ...state,
        skills: state.skills.filter(skill => skill._id !== action.payload),
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
const SkillContext = createContext<SkillContextType | undefined>(undefined);

// Provider component
interface SkillProviderProps {
  children: ReactNode;
}

interface SkillContextType extends SkillState {
  loadSkills: () => Promise<void>;
  loadStats: () => Promise<void>;
  createSkill: (data: CreateSkillData) => Promise<boolean>;
  updateSkill: (id: string, data: UpdateSkillData) => Promise<boolean>;
  deleteSkill: (id: string) => Promise<boolean>;
  reorderSkills: (skillIds: string[]) => Promise<boolean>;
  moveSkillUp: (id: string) => Promise<boolean>;
  moveSkillDown: (id: string) => Promise<boolean>;
  toggleSkillHighlight: (id: string) => Promise<boolean>;
  exportSkills: () => Promise<void>;
  clearError: () => void;
}

export const SkillProvider: React.FC<SkillProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(skillReducer, initialState);

  // Load skills
  const loadSkills = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const skills = await skillService.getSkills();
      dispatch({ type: 'SET_SKILLS', payload: skills });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load skills';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading skills:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load skills statistics
  const loadStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await skillService.getSkillsStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error: any) {
      console.error('Error loading skills stats:', error);
    }
  }, []);

  // Create skill
  const createSkill = useCallback(async (data: CreateSkillData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_CREATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newSkill = await skillService.createSkill(data);
      dispatch({ type: 'ADD_SKILL', payload: newSkill });
      
      // Reload stats after creating
      await loadStats();
      
      toast.success('Skill created successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create skill';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_CREATING', payload: false });
    }
  }, [loadStats]);

  // Update skill
  const updateSkill = useCallback(async (id: string, data: UpdateSkillData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedSkill = await skillService.updateSkill(id, data);
      dispatch({ type: 'UPDATE_SKILL', payload: updatedSkill });
      
      // Reload stats after updating
      await loadStats();
      
      toast.success('Skill updated successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update skill';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  }, [loadStats]);

  // Delete skill
  const deleteSkill = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_DELETING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await skillService.deleteSkill(id);
      dispatch({ type: 'REMOVE_SKILL', payload: id });
      
      // Reload stats after deleting
      await loadStats();
      
      toast.success('Skill deleted successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete skill';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  }, [loadStats]);

  // Reorder skills
  const reorderSkills = useCallback(async (skillIds: string[]): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const reorderedSkills = await skillService.reorderSkills({ skillIds });
      dispatch({ type: 'SET_SKILLS', payload: reorderedSkills });
      
      toast.success('Skills reordered successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reorder skills';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Move skill up
  const moveSkillUp = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedSkills = await skillService.moveSkillUp(id);
      dispatch({ type: 'SET_SKILLS', payload: updatedSkills });
      
      toast.success('Skill moved up!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move skill';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Move skill down
  const moveSkillDown = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedSkills = await skillService.moveSkillDown(id);
      dispatch({ type: 'SET_SKILLS', payload: updatedSkills });
      
      toast.success('Skill moved down!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move skill';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  }, []);

  // Toggle skill highlight
  const toggleSkillHighlight = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedSkill = await skillService.toggleSkillHighlight(id);
      dispatch({ type: 'UPDATE_SKILL', payload: updatedSkill });
      
      // Reload stats after toggling
      await loadStats();
      
      toast.success(updatedSkill.isHighlighted ? 'Skill highlighted!' : 'Skill unhighlighted!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle skill highlight';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  }, [loadStats]);

  // Export skills data
  const exportSkills = useCallback(async (): Promise<void> => {
    try {
      const exportData = await skillService.exportSkills();
      
      // Create and download file
      const dataStr = JSON.stringify(exportData.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `skills-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      toast.success('Skills data exported successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to export skills data';
      toast.error(errorMessage);
    }
  }, []);

  // Clear error
  const clearError = useCallback((): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const contextValue: SkillContextType = useMemo(() => ({
    ...state,
    loadSkills,
    loadStats,
    createSkill,
    updateSkill,
    deleteSkill,
    reorderSkills,
    moveSkillUp,
    moveSkillDown,
    toggleSkillHighlight,
    exportSkills,
    clearError,
  }), [state, loadSkills, loadStats, createSkill, updateSkill, deleteSkill, reorderSkills, moveSkillUp, moveSkillDown, toggleSkillHighlight, exportSkills, clearError]);

  return (
    <SkillContext.Provider value={contextValue}>
      {children}
    </SkillContext.Provider>
  );
};

// Hook to use skill context
export const useSkill = (): SkillContextType => {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkill must be used within a SkillProvider');
  }
  return context;
};
