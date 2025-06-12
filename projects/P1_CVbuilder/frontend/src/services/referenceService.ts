import { apiClient } from './api';

// Types
export interface Reference {
  _id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship: 'supervisor' | 'manager' | 'colleague' | 'client' | 'professor' | 'mentor' | 'peer' | 'other';
  relationshipDescription?: string;
  yearsKnown?: number;
  isAvailable: boolean;
  preferredContactMethod: 'email' | 'phone' | 'both';
  notes?: string;
  order: number;
  isActive: boolean;
  relationshipDisplay?: string;
  contactInfo?: string;
  yearsKnownDisplay?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReferenceData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship: 'supervisor' | 'manager' | 'colleague' | 'client' | 'professor' | 'mentor' | 'peer' | 'other';
  relationshipDescription?: string;
  yearsKnown?: number;
  isAvailable?: boolean;
  preferredContactMethod?: 'email' | 'phone' | 'both';
  notes?: string;
}

export interface UpdateReferenceData extends Partial<CreateReferenceData> {}

export interface ReferenceStats {
  totalReferences: number;
  relationshipTypes: Record<string, number>;
  availableReferences: number;
  averageYearsKnown: number;
  contactMethods: Record<string, number>;
}

// Relationship type options
export const relationshipTypes = [
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'manager', label: 'Manager' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'client', label: 'Client' },
  { value: 'professor', label: 'Professor' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'peer', label: 'Peer' },
  { value: 'other', label: 'Other' }
];

// Contact method options
export const contactMethods = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'both', label: 'Both' }
];

// Relationship type colors
export const relationshipTypeColors: Record<string, string> = {
  supervisor: 'bg-blue-100 text-blue-800',
  manager: 'bg-green-100 text-green-800',
  colleague: 'bg-purple-100 text-purple-800',
  client: 'bg-orange-100 text-orange-800',
  professor: 'bg-indigo-100 text-indigo-800',
  mentor: 'bg-pink-100 text-pink-800',
  peer: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800'
};

// API Functions
export const referenceService = {
  // Get all references
  getReferences: async (): Promise<Reference[]> => {
    console.log('ReferenceService: fetching references from API');
    const response = await apiClient.get('/references');
    console.log('ReferenceService: API response:', response.data);
    console.log('ReferenceService: response.data.data:', response.data?.data);
    console.log('ReferenceService: response.data type:', typeof response.data);
    console.log('ReferenceService: response.data is array:', Array.isArray(response.data));
    const references = response.data?.data || response.data || [];
    console.log('ReferenceService: final references:', references);
    return references;
  },

  // Get single reference
  getReferenceById: async (id: string): Promise<Reference> => {
    const response = await apiClient.get(`/references/${id}`);
    return response.data.data;
  },

  // Create reference
  createReference: async (data: CreateReferenceData): Promise<Reference> => {
    console.log('ReferenceService: creating reference with data:', data);
    const response = await apiClient.post('/references', data);
    console.log('ReferenceService: create response:', response.data);
    console.log('ReferenceService: create response.data.data:', response.data?.data);
    const reference = response.data?.data || response.data;
    console.log('ReferenceService: final created reference:', reference);
    return reference;
  },

  // Update reference
  updateReference: async (id: string, data: UpdateReferenceData): Promise<Reference> => {
    console.log('ReferenceService: updating reference with id:', id, 'data:', data);
    const response = await apiClient.put(`/references/${id}`, data);
    console.log('ReferenceService: update response:', response.data);
    const reference = response.data?.data || response.data;
    console.log('ReferenceService: final updated reference:', reference);
    return reference;
  },

  // Delete reference
  deleteReference: async (id: string): Promise<void> => {
    await apiClient.delete(`/references/${id}`);
  },

  // Reorder references
  reorderReferences: async (referenceIds: string[]): Promise<Reference[]> => {
    const response = await apiClient.put('/references/reorder', { referenceIds });
    return response.data.data;
  },

  // Move reference up
  moveReferenceUp: async (id: string): Promise<Reference[]> => {
    console.log('ReferenceService: moveReferenceUp called with id:', id);
    const response = await apiClient.put(`/references/${id}/move-up`);
    console.log('ReferenceService: moveReferenceUp response:', response.data);
    const references = response.data?.data || response.data || [];
    console.log('ReferenceService: final references after move up:', references);
    return references;
  },

  // Move reference down
  moveReferenceDown: async (id: string): Promise<Reference[]> => {
    console.log('ReferenceService: moveReferenceDown called with id:', id);
    const response = await apiClient.put(`/references/${id}/move-down`);
    console.log('ReferenceService: moveReferenceDown response:', response.data);
    const references = response.data?.data || response.data || [];
    console.log('ReferenceService: final references after move down:', references);
    return references;
  },

  // Get references statistics
  getReferencesStats: async (): Promise<ReferenceStats> => {
    const response = await apiClient.get('/references/stats');
    return response.data.data;
  },

  // Export references
  exportReferences: async (): Promise<{ data: any; filename: string }> => {
    const response = await apiClient.get('/references/export');
    return {
      data: response.data.data,
      filename: response.data.filename
    };
  }
};

// Utility functions
export const getRelationshipTypeColor = (relationship: string): string => {
  return relationshipTypeColors[relationship] || 'bg-gray-100 text-gray-800';
};

export const formatRelationshipType = (relationship: string): string => {
  const relationshipType = relationshipTypes.find(r => r.value === relationship);
  return relationshipType?.label || relationship;
};

export const formatContactMethod = (method: string): string => {
  const contactMethod = contactMethods.find(m => m.value === method);
  return contactMethod?.label || method;
};

export const formatYearsKnown = (years?: number): string | null => {
  if (!years) return null;
  return `${years} year${years > 1 ? 's' : ''}`;
};

export const getContactInfo = (reference: Reference): string => {
  const info = [];
  if (reference.email) info.push(`Email: ${reference.email}`);
  if (reference.phone) info.push(`Phone: ${reference.phone}`);
  return info.join(' | ');
};

export const downloadReferencesExport = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = globalThis.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.URL.revokeObjectURL(url);
};
