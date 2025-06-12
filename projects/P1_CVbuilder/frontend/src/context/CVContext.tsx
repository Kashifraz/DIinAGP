import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import cvService, { CV, CreateCVData, UpdateCVData } from '../services/cvService';
import toast from 'react-hot-toast';

// Types
interface CVState {
  cvs: CV[];
  currentCV: CV | null;
  loading: boolean;
  error: string | null;
  lastSaved: Date | null;
  isDirty: boolean;
}

type CVAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CVS'; payload: CV[] }
  | { type: 'SET_CURRENT_CV'; payload: CV | null }
  | { type: 'ADD_CV'; payload: CV }
  | { type: 'UPDATE_CV'; payload: CV }
  | { type: 'DELETE_CV'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: { cvId: string; sectionOrders: string[] } }
  | { type: 'TOGGLE_SECTION_VISIBILITY'; payload: { cvId: string; sectionName: string } }
  | { type: 'UPDATE_SECTION_DATA'; payload: { cvId: string; sectionName: string; data: Record<string, any> } }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

interface CVContextType {
  state: CVState;
  // CV Management
  getCVs: (status?: string) => Promise<void>;
  getCVById: (id: string) => Promise<void>;
  createCV: (data: CreateCVData) => Promise<CV | null>;
  updateCV: (id: string, data: UpdateCVData) => Promise<CV | null>;
  deleteCV: (id: string) => Promise<boolean>;
  setCurrentCV: (cv: CV | null) => void;
  
  // Section Management
  reorderSections: (cvId: string, sectionOrders: string[]) => Promise<void>;
  toggleSectionVisibility: (cvId: string, sectionName: string) => Promise<void>;
  updateSectionData: (cvId: string, sectionName: string, data: Record<string, any>) => Promise<void>;
  
  
  // Utility
  clearError: () => void;
  getVisibleSections: (cv: CV) => any[];
  getSectionOrder: (cv: CV) => string[];
}

// Initial State
const initialState: CVState = {
  cvs: [],
  currentCV: null,
  loading: false,
  error: null,
  lastSaved: null,
  isDirty: false
};

// Reducer
const cvReducer = (state: CVState, action: CVAction): CVState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_CVS':
      return { ...state, cvs: action.payload };
    
    case 'SET_CURRENT_CV':
      return { ...state, currentCV: action.payload };
    
    case 'ADD_CV':
      return { ...state, cvs: [...state.cvs, action.payload] };
    
    case 'UPDATE_CV':
      return {
        ...state,
        cvs: state.cvs.map(cv => cv._id === action.payload._id ? action.payload : cv),
        currentCV: state.currentCV?._id === action.payload._id ? action.payload : state.currentCV
      };
    
    case 'DELETE_CV':
      return {
        ...state,
        cvs: state.cvs.filter(cv => cv._id !== action.payload),
        currentCV: state.currentCV?._id === action.payload ? null : state.currentCV
      };
    
    case 'REORDER_SECTIONS':
      return {
        ...state,
        cvs: state.cvs.map(cv => {
          if (cv._id === action.payload.cvId) {
            const sectionMap = new Map(cv.sections.map(s => [s.name, s]));
            const reorderedSections = action.payload.sectionOrders.map((name, index) => {
              const section = sectionMap.get(name);
              return section ? { ...section, order: index } : null;
            }).filter(Boolean) as any[];
            
            return { ...cv, sections: reorderedSections };
          }
          return cv;
        }),
        currentCV: state.currentCV?._id === action.payload.cvId ? {
          ...state.currentCV,
          sections: state.currentCV.sections.map(section => {
            const newOrder = action.payload.sectionOrders.indexOf(section.name);
            return newOrder === -1 ? section : { ...section, order: newOrder };
          }).sort((a, b) => a.order - b.order)
        } : state.currentCV
      };
    
    case 'TOGGLE_SECTION_VISIBILITY':
      return {
        ...state,
        cvs: state.cvs.map(cv => {
          if (cv._id === action.payload.cvId) {
            return {
              ...cv,
              sections: cv.sections.map(section =>
                section.name === action.payload.sectionName
                  ? { ...section, visible: !section.visible }
                  : section
              )
            };
          }
          return cv;
        }),
        currentCV: state.currentCV?._id === action.payload.cvId ? {
          ...state.currentCV,
          sections: state.currentCV.sections.map(section =>
            section.name === action.payload.sectionName
              ? { ...section, visible: !section.visible }
              : section
          )
        } : state.currentCV
      };
    
    case 'UPDATE_SECTION_DATA':
      return {
        ...state,
        cvs: state.cvs.map(cv => {
          if (cv._id === action.payload.cvId) {
            return {
              ...cv,
              sections: cv.sections.map(section =>
                section.name === action.payload.sectionName
                  ? { ...section, data: { ...section.data, ...action.payload.data } }
                  : section
              )
            };
          }
          return cv;
        }),
        currentCV: state.currentCV?._id === action.payload.cvId ? {
          ...state.currentCV,
          sections: state.currentCV.sections.map(section =>
            section.name === action.payload.sectionName
              ? { ...section, data: { ...section.data, ...action.payload.data } }
              : section
          )
        } : state.currentCV
      };
    
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    
    default:
      return state;
  }
};

// Context
const CVContext = createContext<CVContextType | undefined>(undefined);

// Provider
export const CVProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cvReducer, initialState);

  // CV Management
  const getCVs = useCallback(async (status?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await cvService.getCVs(status);
      if (response.success) {
        dispatch({ type: 'SET_CVS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch CVs';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const getCVById = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await cvService.getCVById(id);
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_CV', payload: response.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch CV';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const createCV = useCallback(async (data: CreateCVData): Promise<CV | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await cvService.createCV(data);
      if (response.success) {
        dispatch({ type: 'ADD_CV', payload: response.data });
        dispatch({ type: 'SET_CURRENT_CV', payload: response.data });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
        toast.success('CV created successfully');
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create CV';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateCV = useCallback(async (id: string, data: UpdateCVData): Promise<CV | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await cvService.updateCV(id, data);
      if (response.success) {
        dispatch({ type: 'UPDATE_CV', payload: response.data });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
        dispatch({ type: 'SET_DIRTY', payload: false });
        toast.success('CV updated successfully');
        return response.data;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update CV';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteCV = useCallback(async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await cvService.deleteCV(id);
      if (response.success) {
        dispatch({ type: 'DELETE_CV', payload: id });
        toast.success('CV deleted successfully');
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete CV';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const setCurrentCV = useCallback((cv: CV | null) => {
    dispatch({ type: 'SET_CURRENT_CV', payload: cv });
  }, []);

  // Section Management
  const reorderSections = useCallback(async (cvId: string, sectionOrders: string[]) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await cvService.reorderSections(cvId, { sectionOrders });
      if (response.success) {
        dispatch({ type: 'REORDER_SECTIONS', payload: { cvId, sectionOrders } });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
        dispatch({ type: 'SET_DIRTY', payload: true });
        toast.success('Sections reordered successfully');
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reorder sections';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const toggleSectionVisibility = useCallback(async (cvId: string, sectionName: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await cvService.toggleSectionVisibility(cvId, sectionName);
      if (response.success) {
        dispatch({ type: 'TOGGLE_SECTION_VISIBILITY', payload: { cvId, sectionName } });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
        dispatch({ type: 'SET_DIRTY', payload: true });
        toast.success('Section visibility updated');
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle section visibility';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const updateSectionData = useCallback(async (cvId: string, sectionName: string, data: Record<string, any>) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await cvService.updateSectionData(cvId, sectionName, { data });
      if (response.success) {
        dispatch({ type: 'UPDATE_SECTION_DATA', payload: { cvId, sectionName, data } });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
        dispatch({ type: 'SET_DIRTY', payload: true });
        toast.success('Section data updated');
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        toast.error(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update section data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);


  // Utility functions
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const getVisibleSections = useCallback((cv: CV) => {
    return cvService.getVisibleSections(cv);
  }, []);

  const getSectionOrder = useCallback((cv: CV) => {
    return cvService.getSectionOrder(cv);
  }, []);

  const value: CVContextType = useMemo(() => ({
    state,
    getCVs,
    getCVById,
    createCV,
    updateCV,
    deleteCV,
    setCurrentCV,
    reorderSections,
    toggleSectionVisibility,
    updateSectionData,
    clearError,
    getVisibleSections,
    getSectionOrder
  }), [
    state,
    getCVs,
    getCVById,
    createCV,
    updateCV,
    deleteCV,
    setCurrentCV,
    reorderSections,
    toggleSectionVisibility,
    updateSectionData,
    clearError,
    getVisibleSections,
    getSectionOrder
  ]);

  return (
    <CVContext.Provider value={value}>
      {children}
    </CVContext.Provider>
  );
};

// Hook
export const useCV = (): CVContextType => {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
};

export default CVContext;
