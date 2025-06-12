import { apiClient } from './api';

// Template interfaces
export interface TemplateSection {
  name: string;
  order: number;
  required: boolean;
  visible: boolean;
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface Font {
  name: string;
  family: string;
  weights: string[];
}

export interface Template {
  _id?: string;  // Optional for backward compatibility
  id: string;    // Primary ID field as returned by backend
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'modern' | 'classic' | 'minimal';
  preview: string;
  html?: string;
  css?: string;
  sections: TemplateSection[];
  colorSchemes: ColorScheme[];
  fonts: Font[];
  isActive: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategory {
  name: string;
  count: number;
  displayName: string;
}

export interface TemplateFilters {
  category?: string;
  active?: boolean;
}

// API Functions
export const templateService = {
  // Get all templates
  getTemplates: async (filters?: TemplateFilters): Promise<Template[]> => {
    console.log('TemplateService: fetching templates with filters:', filters);
    const params = new URLSearchParams();
    
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.active !== undefined) {
      params.append('active', filters.active.toString());
    }

    const response = await apiClient.get(`/templates?${params.toString()}`);
    console.log('TemplateService: API response:', response.data);
    const templates = response.data?.data || response.data || [];
    console.log('TemplateService: final templates:', templates);
    return templates;
  },

  // Get single template
  getTemplateById: async (id: string): Promise<Template> => {
    console.log('TemplateService: fetching template by id:', id);
    const response = await apiClient.get(`/templates/${id}`);
    console.log('TemplateService: template response:', response.data);
    const template = response.data?.data || response.data;
    console.log('TemplateService: final template:', template);
    return template;
  },

  // Get full template (including HTML/CSS)
  getFullTemplate: async (id: string): Promise<Template> => {
    console.log('TemplateService: fetching full template by id:', id);
    const response = await apiClient.get(`/templates/${id}/full`);
    console.log('TemplateService: full template response:', response.data);
    const template = response.data?.data || response.data;
    console.log('TemplateService: final full template:', template);
    return template;
  },

  // Get templates by category
  getTemplatesByCategory: async (category: string): Promise<Template[]> => {
    console.log('TemplateService: fetching templates by category:', category);
    const response = await apiClient.get(`/templates/category/${category}`);
    console.log('TemplateService: category response:', response.data);
    const templates = response.data?.data || response.data || [];
    console.log('TemplateService: final category templates:', templates);
    return templates;
  },

  // Get template categories
  getTemplateCategories: async (): Promise<TemplateCategory[]> => {
    console.log('TemplateService: fetching template categories');
    const response = await apiClient.get('/templates/categories');
    console.log('TemplateService: categories response:', response.data);
    const categories = response.data?.data || response.data || [];
    console.log('TemplateService: final categories:', categories);
    return categories;
  },

  // Create template (Admin only)
  createTemplate: async (data: Partial<Template>): Promise<Template> => {
    console.log('TemplateService: creating template with data:', data);
    const response = await apiClient.post('/templates', data);
    console.log('TemplateService: create response:', response.data);
    const template = response.data?.data || response.data;
    console.log('TemplateService: final created template:', template);
    return template;
  },

  // Update template (Admin only)
  updateTemplate: async (id: string, data: Partial<Template>): Promise<Template> => {
    console.log('TemplateService: updating template with id:', id, 'data:', data);
    const response = await apiClient.put(`/templates/${id}`, data);
    console.log('TemplateService: update response:', response.data);
    const template = response.data?.data || response.data;
    console.log('TemplateService: final updated template:', template);
    return template;
  },

  // Delete template (Admin only)
  deleteTemplate: async (id: string): Promise<void> => {
    console.log('TemplateService: deleting template with id:', id);
    await apiClient.delete(`/templates/${id}`);
    console.log('TemplateService: template deleted successfully');
  },

  // Toggle template status (Admin only)
  toggleTemplateStatus: async (id: string): Promise<Template> => {
    console.log('TemplateService: toggling template status for id:', id);
    const response = await apiClient.patch(`/templates/${id}/toggle`);
    console.log('TemplateService: toggle response:', response.data);
    const template = response.data?.data || response.data;
    console.log('TemplateService: final toggled template:', template);
    return template;
  }
};

// Helper functions
export const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    professional: 'Professional',
    creative: 'Creative',
    modern: 'Modern',
    classic: 'Classic',
    minimal: 'Minimal'
  };
  return categoryMap[category] || category;
};

export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    professional: 'bg-blue-100 text-blue-800',
    creative: 'bg-purple-100 text-purple-800',
    modern: 'bg-green-100 text-green-800',
    classic: 'bg-gray-100 text-gray-800',
    minimal: 'bg-slate-100 text-slate-800'
  };
  return colorMap[category] || 'bg-gray-100 text-gray-800';
};

export const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    professional: 'Briefcase',
    creative: 'Palette',
    modern: 'Zap',
    classic: 'BookOpen',
    minimal: 'Minimize2'
  };
  return iconMap[category] || 'FileText';
};
