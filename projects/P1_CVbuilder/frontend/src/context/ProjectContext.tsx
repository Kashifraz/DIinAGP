import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Project, CreateProjectData, UpdateProjectData, ProjectStats, projectService } from '../services/projectService';

interface ProjectState {
  projects: Project[];
  stats: ProjectStats | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  reordering: boolean;
}

type ProjectAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_STATS'; payload: ProjectStats | null }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'REMOVE_PROJECT'; payload: string }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_REORDERING'; payload: boolean }
  | { type: 'REORDER_PROJECTS'; payload: Project[] };

const initialState: ProjectState = {
  projects: [],
  stats: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  reordering: false,
};

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(proj =>
          proj._id === action.payload._id ? action.payload : proj
        ),
      };
    case 'REMOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(proj => proj._id !== action.payload),
      };
    case 'SET_CREATING':
      return { ...state, creating: action.payload };
    case 'SET_UPDATING':
      return { ...state, updating: action.payload };
    case 'SET_DELETING':
      return { ...state, deleting: action.payload };
    case 'SET_REORDERING':
      return { ...state, reordering: action.payload };
    case 'REORDER_PROJECTS':
      return { ...state, projects: action.payload };
    default:
      return state;
  }
};

interface ProjectContextType extends ProjectState {
  createProject: (data: CreateProjectData) => Promise<Project | null>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  reorderProjects: (projectIds: string[]) => Promise<boolean>;
  moveProjectUp: (id: string) => Promise<boolean>;
  moveProjectDown: (id: string) => Promise<boolean>;
  exportProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  useEffect(() => {
    refreshProjects();
    refreshStats();
  }, []);

  const createProject = async (data: CreateProjectData): Promise<Project | null> => {
    try {
      dispatch({ type: 'SET_CREATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const project = await projectService.createProject(data);
      dispatch({ type: 'ADD_PROJECT', payload: project });
      await refreshStats();
      return project;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_CREATING', payload: false });
    }
  };

  const updateProject = async (id: string, data: UpdateProjectData): Promise<Project | null> => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const project = await projectService.updateProject(id, data);
      dispatch({ type: 'UPDATE_PROJECT', payload: project });
      await refreshStats();
      return project;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update project';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_UPDATING', payload: false });
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_DELETING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      await projectService.deleteProject(id);
      dispatch({ type: 'REMOVE_PROJECT', payload: id });
      await refreshStats();
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  };

  const reorderProjects = async (projectIds: string[]): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const projects = await projectService.reorderProjects(projectIds);
      dispatch({ type: 'REORDER_PROJECTS', payload: projects });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reorder projects';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  };

  const moveProjectUp = async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const projects = await projectService.moveProjectUp(id);
      dispatch({ type: 'REORDER_PROJECTS', payload: projects });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move project up';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  };

  const moveProjectDown = async (id: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_REORDERING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const projects = await projectService.moveProjectDown(id);
      dispatch({ type: 'REORDER_PROJECTS', payload: projects });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to move project down';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_REORDERING', payload: false });
    }
  };

  const exportProjects = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const { data, filename } = await projectService.exportProjects();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to export projects';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const refreshProjects = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const projects = await projectService.getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load projects';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshStats = async (): Promise<void> => {
    try {
      const stats = await projectService.getProjectsStats();
      dispatch({ type: 'SET_STATS', payload: stats });
    } catch (error: any) {
      console.error('Failed to load project stats:', error);
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: ProjectContextType = {
    ...state,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    moveProjectUp,
    moveProjectDown,
    exportProjects,
    refreshProjects,
    refreshStats,
    clearError,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
