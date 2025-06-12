import { apiClient } from './api';

export interface Language {
  _id: string;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native' | 'fluent';
  certifications?: Array<{
    name: string;
    issuer?: string;
    dateObtained?: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLanguageData {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native' | 'fluent';
  certifications?: Array<{
    name: string;
    issuer?: string;
    dateObtained?: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
}

export interface UpdateLanguageData extends Partial<CreateLanguageData> {}

export const languageService = {
  // Get all languages
  getLanguages: async (): Promise<Language[]> => {
    console.log('LanguageService: fetching languages from API');
    const response = await apiClient.get('/languages');
    console.log('LanguageService: Full response:', response);
    console.log('LanguageService: response.data:', response.data);
    console.log('LanguageService: response.data.data:', response.data?.data);
    console.log('LanguageService: response.data type:', typeof response.data);
    console.log('LanguageService: response.data is array:', Array.isArray(response.data));
    
    // Try both approaches
    const languages = response.data?.data || response.data || [];
    console.log('LanguageService: final languages:', languages);
    return languages;
  },

  // Create language
  createLanguage: async (data: CreateLanguageData): Promise<Language> => {
    const response = await apiClient.post('/languages', data);
    return response.data;
  },

  // Update language
  updateLanguage: async (id: string, data: UpdateLanguageData): Promise<Language> => {
    const response = await apiClient.put(`/languages/${id}`, data);
    return response.data;
  },

  // Delete language
  deleteLanguage: async (id: string): Promise<void> => {
    await apiClient.delete(`/languages/${id}`);
  },

  // Move language up
  moveLanguageUp: async (id: string): Promise<Language[]> => {
    console.log('LanguageService: moving language up:', id);
    const response = await apiClient.put(`/languages/${id}/move-up`);
    console.log('LanguageService: move up response:', response);
    console.log('LanguageService: move up data:', response.data);
    console.log('LanguageService: move up data.data:', response.data?.data);
    const languages = response.data?.data || response.data || [];
    console.log('LanguageService: move up final languages:', languages);
    return languages;
  },

  // Move language down
  moveLanguageDown: async (id: string): Promise<Language[]> => {
    console.log('LanguageService: moving language down:', id);
    const response = await apiClient.put(`/languages/${id}/move-down`);
    console.log('LanguageService: move down response:', response);
    console.log('LanguageService: move down data:', response.data);
    console.log('LanguageService: move down data.data:', response.data?.data);
    const languages = response.data?.data || response.data || [];
    console.log('LanguageService: move down final languages:', languages);
    return languages;
  }
};

// Utility functions
export const getProficiencyColor = (proficiency: string): string => {
  const colors: Record<string, string> = {
    beginner: 'bg-red-100 text-red-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-blue-100 text-blue-800',
    fluent: 'bg-green-100 text-green-800',
    native: 'bg-purple-100 text-purple-800'
  };
  return colors[proficiency] || 'bg-gray-100 text-gray-800';
};

export const getProficiencyPercentage = (proficiency: string): number => {
  const percentages: Record<string, number> = {
    beginner: 20,
    intermediate: 40,
    advanced: 60,
    fluent: 80,
    native: 100
  };
  return percentages[proficiency] || 0;
};

export const formatProficiencyLevel = (proficiency: string): string => {
  return proficiency.charAt(0).toUpperCase() + proficiency.slice(1);
};