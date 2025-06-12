import { apiClient } from './api';

// Types
export interface AwardValue {
  amount?: number;
  currency?: string;
}

export interface Award {
  _id: string;
  title: string;
  description?: string;
  issuer: string;
  category: 'academic' | 'professional' | 'recognition' | 'competition' | 'achievement' | 'service' | 'leadership' | 'innovation' | 'other';
  dateReceived: string;
  location?: string;
  value?: AwardValue;
  url?: string;
  certificateUrl?: string;
  order: number;
  isActive: boolean;
  formattedDate?: string;
  formattedValue?: string;
  categoryDisplay?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAwardData {
  title: string;
  description?: string;
  issuer: string;
  category: 'academic' | 'professional' | 'recognition' | 'competition' | 'achievement' | 'service' | 'leadership' | 'innovation' | 'other';
  dateReceived: string;
  location?: string;
  value?: AwardValue;
  url?: string;
  certificateUrl?: string;
}

export interface UpdateAwardData extends Partial<CreateAwardData> {}

export interface AwardStats {
  totalAwards: number;
  awardCategories: Record<string, number>;
  totalValue: number;
  averageValue: number;
  recentAwards: number;
}

// Award category options
export const awardCategories = [
  { value: 'academic', label: 'Academic' },
  { value: 'professional', label: 'Professional' },
  { value: 'recognition', label: 'Recognition' },
  { value: 'competition', label: 'Competition' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'service', label: 'Service' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'other', label: 'Other' }
];

// Award category colors
export const awardCategoryColors: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-800',
  professional: 'bg-green-100 text-green-800',
  recognition: 'bg-purple-100 text-purple-800',
  competition: 'bg-orange-100 text-orange-800',
  achievement: 'bg-yellow-100 text-yellow-800',
  service: 'bg-pink-100 text-pink-800',
  leadership: 'bg-indigo-100 text-indigo-800',
  innovation: 'bg-teal-100 text-teal-800',
  other: 'bg-gray-100 text-gray-800'
};

// Currency options
export const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'CHF', label: 'CHF' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'INR', label: 'INR (₹)' }
];

// API Functions
export const awardService = {
  // Get all awards
  getAwards: async (): Promise<Award[]> => {
    console.log('AwardService: fetching awards from API');
    const response = await apiClient.get('/awards');
    console.log('AwardService: API response:', response.data);
    console.log('AwardService: response.data.data:', response.data?.data);
    console.log('AwardService: response.data type:', typeof response.data);
    console.log('AwardService: response.data is array:', Array.isArray(response.data));
    const awards = response.data?.data || response.data || [];
    console.log('AwardService: final awards:', awards);
    return awards;
  },

  // Get single award
  getAwardById: async (id: string): Promise<Award> => {
    const response = await apiClient.get(`/awards/${id}`);
    return response.data.data;
  },

  // Create award
  createAward: async (data: CreateAwardData): Promise<Award> => {
    console.log('AwardService: creating award with data:', data);
    const response = await apiClient.post('/awards', data);
    console.log('AwardService: create response:', response.data);
    console.log('AwardService: create response.data.data:', response.data?.data);
    const award = response.data?.data || response.data;
    console.log('AwardService: final created award:', award);
    return award;
  },

  // Update award
  updateAward: async (id: string, data: UpdateAwardData): Promise<Award> => {
    console.log('AwardService: updating award with id:', id, 'data:', data);
    const response = await apiClient.put(`/awards/${id}`, data);
    console.log('AwardService: update response:', response.data);
    const award = response.data?.data || response.data;
    console.log('AwardService: final updated award:', award);
    return award;
  },

  // Delete award
  deleteAward: async (id: string): Promise<void> => {
    await apiClient.delete(`/awards/${id}`);
  },

  // Reorder awards
  reorderAwards: async (awardIds: string[]): Promise<Award[]> => {
    const response = await apiClient.put('/awards/reorder', { awardIds });
    return response.data.data;
  },

  // Move award up
  moveAwardUp: async (id: string): Promise<Award[]> => {
    console.log('AwardService: moveAwardUp called with id:', id);
    const response = await apiClient.put(`/awards/${id}/move-up`);
    console.log('AwardService: moveAwardUp response:', response.data);
    const awards = response.data?.data || response.data || [];
    console.log('AwardService: final awards after move up:', awards);
    return awards;
  },

  // Move award down
  moveAwardDown: async (id: string): Promise<Award[]> => {
    console.log('AwardService: moveAwardDown called with id:', id);
    const response = await apiClient.put(`/awards/${id}/move-down`);
    console.log('AwardService: moveAwardDown response:', response.data);
    const awards = response.data?.data || response.data || [];
    console.log('AwardService: final awards after move down:', awards);
    return awards;
  },

  // Get awards statistics
  getAwardsStats: async (): Promise<AwardStats> => {
    const response = await apiClient.get('/awards/stats');
    return response.data.data;
  },

  // Export awards
  exportAwards: async (): Promise<{ data: any; filename: string }> => {
    const response = await apiClient.get('/awards/export');
    return {
      data: response.data.data,
      filename: response.data.filename
    };
  }
};

// Utility functions
export const getAwardCategoryColor = (category: string): string => {
  return awardCategoryColors[category] || 'bg-gray-100 text-gray-800';
};

export const formatAwardCategory = (category: string): string => {
  const awardCategory = awardCategories.find(c => c.value === category);
  return awardCategory?.label || category;
};

export const formatAwardDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatAwardValue = (value?: AwardValue): string | null => {
  if (!value || !value.amount) return null;
  
  const currency = value.currency || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value.amount);
};

export const downloadAwardsExport = (data: any, filename: string): void => {
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
