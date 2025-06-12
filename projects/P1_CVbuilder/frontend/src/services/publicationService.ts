import { apiClient } from './api';

// Types
export interface PublicationAuthor {
  name: string;
  isPrimary: boolean;
  affiliation?: string;
}

export interface Publication {
  _id: string;
  title: string;
  type: 'journal' | 'conference' | 'book' | 'book_chapter' | 'patent' | 'blog' | 'article' | 'other';
  authors: PublicationAuthor[];
  publisher?: string;
  publicationDate: string;
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  citationCount: number;
  order: number;
  isActive: boolean;
  formattedDate?: string;
  primaryAuthor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePublicationData {
  title: string;
  type: 'journal' | 'conference' | 'book' | 'book_chapter' | 'patent' | 'blog' | 'article' | 'other';
  authors: PublicationAuthor[];
  publisher?: string;
  publicationDate: string;
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  citationCount?: number;
}

export interface UpdatePublicationData extends Partial<CreatePublicationData> {}

export interface PublicationStats {
  totalPublications: number;
  publicationTypes: Record<string, number>;
  totalCitations: number;
  averageCitations: number;
  recentPublications: number;
}

// Publication type options
export const publicationTypes = [
  { value: 'journal', label: 'Journal Article' },
  { value: 'conference', label: 'Conference Paper' },
  { value: 'book', label: 'Book' },
  { value: 'book_chapter', label: 'Book Chapter' },
  { value: 'patent', label: 'Patent' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'other', label: 'Other' }
];

// Publication type colors
export const publicationTypeColors: Record<string, string> = {
  journal: 'bg-blue-100 text-blue-800',
  conference: 'bg-green-100 text-green-800',
  book: 'bg-purple-100 text-purple-800',
  book_chapter: 'bg-indigo-100 text-indigo-800',
  patent: 'bg-orange-100 text-orange-800',
  blog: 'bg-pink-100 text-pink-800',
  article: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800'
};

// API Functions
export const publicationService = {
  // Get all publications
  getPublications: async (): Promise<Publication[]> => {
    console.log('PublicationService: fetching publications from API');
    const response = await apiClient.get('/publications');
    console.log('PublicationService: Full response:', response);
    console.log('PublicationService: response.data:', response.data);
    console.log('PublicationService: response.data.data:', response.data?.data);
    console.log('PublicationService: response.data type:', typeof response.data);
    console.log('PublicationService: response.data is array:', Array.isArray(response.data));
    
    // Try both approaches
    const publications = response.data?.data || response.data || [];
    console.log('PublicationService: final publications:', publications);
    return publications;
  },

  // Get single publication
  getPublicationById: async (id: string): Promise<Publication> => {
    const response = await apiClient.get(`/publications/${id}`);
    return response.data.data;
  },

  // Create publication
  createPublication: async (data: CreatePublicationData): Promise<Publication> => {
    console.log('PublicationService: creating publication:', data);
    const response = await apiClient.post('/publications', data);
    console.log('PublicationService: create response:', response);
    console.log('PublicationService: create response.data:', response.data);
    console.log('PublicationService: create response.data.data:', response.data?.data);
    const publication = response.data?.data || response.data;
    console.log('PublicationService: returning publication:', publication);
    return publication;
  },

  // Update publication
  updatePublication: async (id: string, data: UpdatePublicationData): Promise<Publication> => {
    console.log('PublicationService: updating publication:', id, data);
    const response = await apiClient.put(`/publications/${id}`, data);
    console.log('PublicationService: update response:', response);
    console.log('PublicationService: update response.data:', response.data);
    console.log('PublicationService: update response.data.data:', response.data?.data);
    const publication = response.data?.data || response.data;
    console.log('PublicationService: returning updated publication:', publication);
    return publication;
  },

  // Delete publication
  deletePublication: async (id: string): Promise<void> => {
    await apiClient.delete(`/publications/${id}`);
  },

  // Reorder publications
  reorderPublications: async (publicationIds: string[]): Promise<Publication[]> => {
    const response = await apiClient.put('/publications/reorder', { publicationIds });
    return response.data.data;
  },

  // Move publication up
  movePublicationUp: async (id: string): Promise<Publication[]> => {
    console.log('PublicationService: moving publication up:', id);
    const response = await apiClient.put(`/publications/${id}/move-up`);
    console.log('PublicationService: move up response:', response);
    console.log('PublicationService: move up data:', response.data);
    console.log('PublicationService: move up data.data:', response.data?.data);
    const publications = response.data?.data || response.data || [];
    console.log('PublicationService: move up final publications:', publications);
    return publications;
  },

  // Move publication down
  movePublicationDown: async (id: string): Promise<Publication[]> => {
    console.log('PublicationService: moving publication down:', id);
    const response = await apiClient.put(`/publications/${id}/move-down`);
    console.log('PublicationService: move down response:', response);
    console.log('PublicationService: move down data:', response.data);
    console.log('PublicationService: move down data.data:', response.data?.data);
    const publications = response.data?.data || response.data || [];
    console.log('PublicationService: move down final publications:', publications);
    return publications;
  },

  // Get publications statistics
  getPublicationsStats: async (): Promise<PublicationStats> => {
    const response = await apiClient.get('/publications/stats');
    return response.data.data;
  },

  // Export publications
  exportPublications: async (): Promise<{ data: any; filename: string }> => {
    const response = await apiClient.get('/publications/export');
    return {
      data: response.data.data,
      filename: response.data.filename
    };
  }
};

// Utility functions
export const getPublicationTypeColor = (type: string): string => {
  return publicationTypeColors[type] || 'bg-gray-100 text-gray-800';
};

export const formatPublicationType = (type: string): string => {
  const pubType = publicationTypes.find(t => t.value === type);
  return pubType?.label || type;
};

export const formatPublicationDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getPrimaryAuthor = (authors: PublicationAuthor[]): string => {
  const primary = authors.find(author => author.isPrimary);
  return primary ? primary.name : (authors[0] ? authors[0].name : '');
};

export const downloadPublicationsExport = (data: any, filename: string): void => {
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
