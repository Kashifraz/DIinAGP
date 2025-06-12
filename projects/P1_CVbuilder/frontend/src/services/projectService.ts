import { apiClient } from './api';

// Types
export interface ProjectTeamMember {
  name: string;
  role?: string;
  email?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  type: 'personal' | 'academic' | 'professional' | 'open_source' | 'freelance' | 'research' | 'other';
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  startDate: string;
  endDate?: string;
  technologies?: string[];
  teamMembers?: ProjectTeamMember[];
  url?: string;
  repository?: string;
  achievements?: string[];
  order: number;
  isActive: boolean;
  duration?: string;
  dateRange?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  type: 'personal' | 'academic' | 'professional' | 'open_source' | 'freelance' | 'research' | 'other';
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  startDate: string;
  endDate?: string;
  technologies?: string[];
  teamMembers?: ProjectTeamMember[];
  url?: string;
  repository?: string;
  achievements?: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface ProjectStats {
  totalProjects: number;
  projectTypes: Record<string, number>;
  projectStatuses: Record<string, number>;
  totalTechnologies: number;
  uniqueTechnologiesCount: number;
  activeProjects: number;
}

// Project type options
export const projectTypes = [
  { value: 'personal', label: 'Personal' },
  { value: 'academic', label: 'Academic' },
  { value: 'professional', label: 'Professional' },
  { value: 'open_source', label: 'Open Source' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' }
];

// Project status options
export const projectStatuses = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Project type colors
export const projectTypeColors: Record<string, string> = {
  personal: 'bg-blue-100 text-blue-800',
  academic: 'bg-green-100 text-green-800',
  professional: 'bg-purple-100 text-purple-800',
  open_source: 'bg-orange-100 text-orange-800',
  freelance: 'bg-pink-100 text-pink-800',
  research: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800'
};

// Project status colors
export const projectStatusColors: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800'
};

// API Functions
export const projectService = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    console.log('ProjectService: fetching projects from API');
    const response = await apiClient.get('/projects');
    console.log('ProjectService: API response:', response.data);
    console.log('ProjectService: response.data.data:', response.data?.data);
    console.log('ProjectService: response.data type:', typeof response.data);
    console.log('ProjectService: response.data is array:', Array.isArray(response.data));
    const projects = response.data?.data || response.data || [];
    console.log('ProjectService: final projects:', projects);
    return projects;
  },

  // Get single project
  getProjectById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.data;
  },

  // Create project
  createProject: async (data: CreateProjectData): Promise<Project> => {
    console.log('ProjectService: creating project with data:', data);
    const response = await apiClient.post('/projects', data);
    console.log('ProjectService: create response:', response.data);
    console.log('ProjectService: create response.data.data:', response.data?.data);
    const project = response.data?.data || response.data;
    console.log('ProjectService: final created project:', project);
    return project;
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
    console.log('ProjectService: updating project with id:', id, 'data:', data);
    const response = await apiClient.put(`/projects/${id}`, data);
    console.log('ProjectService: update response:', response.data);
    const project = response.data?.data || response.data;
    console.log('ProjectService: final updated project:', project);
    return project;
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  // Reorder projects
  reorderProjects: async (projectIds: string[]): Promise<Project[]> => {
    const response = await apiClient.put('/projects/reorder', { projectIds });
    return response.data.data;
  },

  // Move project up
  moveProjectUp: async (id: string): Promise<Project[]> => {
    console.log('ProjectService: moveProjectUp called with id:', id);
    const response = await apiClient.put(`/projects/${id}/move-up`);
    console.log('ProjectService: moveProjectUp response:', response.data);
    const projects = response.data?.data || response.data || [];
    console.log('ProjectService: final projects after move up:', projects);
    return projects;
  },

  // Move project down
  moveProjectDown: async (id: string): Promise<Project[]> => {
    console.log('ProjectService: moveProjectDown called with id:', id);
    const response = await apiClient.put(`/projects/${id}/move-down`);
    console.log('ProjectService: moveProjectDown response:', response.data);
    const projects = response.data?.data || response.data || [];
    console.log('ProjectService: final projects after move down:', projects);
    return projects;
  },

  // Get projects statistics
  getProjectsStats: async (): Promise<ProjectStats> => {
    const response = await apiClient.get('/projects/stats');
    return response.data.data;
  },

  // Export projects
  exportProjects: async (): Promise<{ data: any; filename: string }> => {
    const response = await apiClient.get('/projects/export');
    return {
      data: response.data.data,
      filename: response.data.filename
    };
  }
};

// Utility functions
export const getProjectTypeColor = (type: string): string => {
  return projectTypeColors[type] || 'bg-gray-100 text-gray-800';
};

export const getProjectStatusColor = (status: string): string => {
  return projectStatusColors[status] || 'bg-gray-100 text-gray-800';
};

export const formatProjectType = (type: string): string => {
  const projectType = projectTypes.find(t => t.value === type);
  return projectType?.label || type;
};

export const formatProjectStatus = (status: string): string => {
  const projectStatus = projectStatuses.find(s => s.value === status);
  return projectStatus?.label || status;
};

export const formatProjectDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
};

export const calculateProjectDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
  }
};

export const downloadProjectsExport = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
