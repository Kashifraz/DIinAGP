import api from './api';

// Types
export interface CVSection {
  name: string;
  order: number;
  visible: boolean;
  data: Record<string, any>;
}

export interface CVSettings {
  colorScheme: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  font: {
    name: string;
    family: string;
  };
}

export interface CV {
  _id: string;
  user: string;
  name: string;
  template: {
    _id: string;
    name: string;
    description: string;
    html?: string;
    css?: string;
  };
  templateName: string;
  sections: CVSection[];
  settings: CVSettings;
  status: 'draft' | 'published' | 'archived';
  lastModified: string;
  version: number;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCVData {
  name: string;
  templateId: string;
  sections?: CVSection[];
}

export interface UpdateCVData {
  name?: string;
  status?: 'draft' | 'published' | 'archived';
  settings?: CVSettings;
}

export interface ReorderSectionsData {
  sectionOrders: string[];
}

export interface UpdateSectionData {
  data: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
  errors?: any[];
}

// CV Service
const cvService = {
  // Get all CVs for the authenticated user
  async getCVs(status?: string): Promise<ApiResponse<CV[]>> {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/cvs${params}`);
    return response.data;
  },

  // Get a specific CV by ID
  async getCVById(id: string): Promise<ApiResponse<CV>> {
    const response = await api.get(`/cvs/${id}`);
    return response.data;
  },

  // Create a new CV
  async createCV(data: CreateCVData): Promise<ApiResponse<CV>> {
    const response = await api.post('/cvs', data);
    return response.data;
  },

  // Update a CV
  async updateCV(id: string, data: UpdateCVData): Promise<ApiResponse<CV>> {
    const response = await api.put(`/cvs/${id}`, data);
    return response.data;
  },

  // Delete a CV
  async deleteCV(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/cvs/${id}`);
    return response.data;
  },

  // Reorder sections
  async reorderSections(id: string, data: ReorderSectionsData): Promise<ApiResponse<CV>> {
    const response = await api.patch(`/cvs/${id}/sections/reorder`, data);
    return response.data;
  },

  // Toggle section visibility
  async toggleSectionVisibility(id: string, sectionName: string): Promise<ApiResponse<CV>> {
    const response = await api.patch(`/cvs/${id}/sections/${sectionName}/visibility`);
    return response.data;
  },

  // Update section data
  async updateSectionData(id: string, sectionName: string, data: UpdateSectionData): Promise<ApiResponse<CV>> {
    const response = await api.patch(`/cvs/${id}/sections/${sectionName}/data`, data);
    return response.data;
  },

  // Generate PDF from CV data
  async generatePDF(cvData: any): Promise<Blob> {
    const response = await api.post('/pdf/generate', cvData, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Debug HTML generation
  async debugHTML(cvData: any): Promise<string> {
    const response = await api.post('/pdf/debug', cvData);
    return response.data;
  },


  // Helper function to create default sections
  createDefaultSections(): CVSection[] {
    return [
      { name: 'Profile', order: 0, visible: true, data: {} },
      { name: 'Experience', order: 1, visible: true, data: {} },
      { name: 'Education', order: 2, visible: true, data: {} },
      { name: 'Skills', order: 3, visible: true, data: {} },
      { name: 'Languages', order: 4, visible: false, data: {} },
      { name: 'Projects', order: 5, visible: false, data: {} },
      { name: 'Publications', order: 6, visible: false, data: {} },
      { name: 'Awards', order: 7, visible: false, data: {} },
      { name: 'References', order: 8, visible: false, data: {} }
    ];
  },

  // Helper function to get section by name
  getSectionByName(cv: CV, sectionName: string): CVSection | undefined {
    return cv.sections.find(section => section.name === sectionName);
  },

  // Helper function to get visible sections
  getVisibleSections(cv: CV): CVSection[] {
    const visibleSections = cv.sections.filter(section => section.visible);
    return visibleSections.sort((a, b) => a.order - b.order);
  },

  // Helper function to get section order
  getSectionOrder(cv: CV): string[] {
    const sortedSections = [...cv.sections];
    const sorted = sortedSections.sort((a, b) => a.order - b.order);
    return sorted.map(section => section.name);
  },

  // Helper function to validate section name
  isValidSectionName(sectionName: string): boolean {
    const validSections = ['Profile', 'Experience', 'Education', 'Skills', 'Languages', 'Projects', 'Publications', 'Awards', 'References'];
    return validSections.includes(sectionName);
  }
};

export default cvService;
