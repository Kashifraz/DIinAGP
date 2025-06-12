import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Template, TemplateCategory, TemplateFilters, templateService } from '../services/templateService';

// Context interface
interface TemplateContextType {
  templates: Template[];
  categories: TemplateCategory[];
  selectedTemplate: Template | null;
  loading: boolean;
  error: string | null;
  filters: TemplateFilters;
  getTemplates: (filters?: TemplateFilters) => Promise<void>;
  getTemplateById: (id: string) => Promise<Template | null>;
  getFullTemplate: (id: string) => Promise<Template | null>;
  getTemplatesByCategory: (category: string) => Promise<void>;
  getTemplateCategories: () => Promise<void>;
  setSelectedTemplate: (template: Template | null) => void;
  setFilters: (filters: TemplateFilters) => void;
  clearError: () => void;
  refreshTemplates: () => Promise<void>;
}

// Create context
const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Provider component
export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TemplateFilters>({});

  // Get templates
  const getTemplates = useCallback(async (newFilters?: TemplateFilters): Promise<void> => {
    try {
      console.log('TemplateContext: getTemplates called with filters:', newFilters);
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const templatesData = await templateService.getTemplates(currentFilters);
      console.log('TemplateContext: received templates data:', templatesData);
      
      setTemplates(templatesData || []);
      
      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (err: any) {
      console.error('TemplateContext: error fetching templates:', err);
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get single template
  const getTemplateById = useCallback(async (id: string): Promise<Template | null> => {
    try {
      console.log('TemplateContext: getTemplateById called with id:', id);
      setLoading(true);
      setError(null);
      
      const template = await templateService.getTemplateById(id);
      console.log('TemplateContext: received template:', template);
      
      return template;
    } catch (err: any) {
      console.error('TemplateContext: error fetching template:', err);
      setError(err.response?.data?.message || 'Failed to fetch template');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get full template
  const getFullTemplate = useCallback(async (id: string): Promise<Template | null> => {
    try {
      console.log('TemplateContext: getFullTemplate called with id:', id);
      setLoading(true);
      setError(null);
      
      const template = await templateService.getFullTemplate(id);
      console.log('TemplateContext: received full template:', template);
      
      return template;
    } catch (err: any) {
      console.error('TemplateContext: error fetching full template:', err);
      setError(err.response?.data?.message || 'Failed to fetch full template');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get templates by category
  const getTemplatesByCategory = useCallback(async (category: string): Promise<void> => {
    try {
      console.log('TemplateContext: getTemplatesByCategory called with category:', category);
      setLoading(true);
      setError(null);
      
      const templatesData = await templateService.getTemplatesByCategory(category);
      console.log('TemplateContext: received category templates:', templatesData);
      
      setTemplates(templatesData || []);
      setFilters({ category });
    } catch (err: any) {
      console.error('TemplateContext: error fetching templates by category:', err);
      setError(err.response?.data?.message || 'Failed to fetch templates by category');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get template categories
  const getTemplateCategories = useCallback(async (): Promise<void> => {
    try {
      console.log('TemplateContext: getTemplateCategories called');
      setLoading(true);
      setError(null);
      
      const categoriesData = await templateService.getTemplateCategories();
      console.log('TemplateContext: received categories:', categoriesData);
      
      setCategories(categoriesData || []);
    } catch (err: any) {
      console.error('TemplateContext: error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch template categories');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh templates
  const refreshTemplates = useCallback(async (): Promise<void> => {
    console.log('TemplateContext: refreshTemplates called');
    await getTemplates();
  }, [getTemplates]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('TemplateContext: useEffect triggered - fetching templates and categories');
      getTemplates();
      getTemplateCategories();
    }
  }, [getTemplates, getTemplateCategories]);

  // Context value
  const contextValue: TemplateContextType = useMemo(() => ({
    templates: templates || [],
    categories: categories || [],
    selectedTemplate,
    loading,
    error,
    filters,
    getTemplates,
    getTemplateById,
    getFullTemplate,
    getTemplatesByCategory,
    getTemplateCategories,
    setSelectedTemplate,
    setFilters,
    clearError,
    refreshTemplates
  }), [
    templates,
    categories,
    selectedTemplate,
    loading,
    error,
    filters,
    getTemplates,
    getTemplateById,
    getFullTemplate,
    getTemplatesByCategory,
    getTemplateCategories,
    setSelectedTemplate,
    clearError,
    refreshTemplates
  ]);

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
};

// Hook to use template context
export const useTemplate = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};
