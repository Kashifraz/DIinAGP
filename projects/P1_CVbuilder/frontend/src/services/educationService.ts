import { apiClient } from './api';

// Types
export interface Education {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  gpa?: number;
  description?: string;
  location?: string;
  order: number;
  isActive: boolean;
  duration?: string;
  dateRange?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEducationData {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  gpa?: number;
  description?: string;
  location?: string;
}

export interface UpdateEducationData {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  gpa?: number;
  description?: string;
  location?: string;
}

export interface EducationStats {
  totalEntries: number;
  currentEducation: number;
  completedEducation: number;
  averageGPA: number | null;
  uniqueInstitutions: number;
}

export interface ReorderEducationData {
  educationIds: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class EducationService {
  /**
   * Get all education entries for the current user
   */
  async getEducation(): Promise<Education[]> {
    const response = await apiClient.get('/education');
    return response.data; // Return the education array directly
  }

  /**
   * Get a specific education entry
   */
  async getEducationById(id: string): Promise<Education> {
    const response = await apiClient.get(`/education/${id}`);
    return response.data;
  }

  /**
   * Create a new education entry
   */
  async createEducation(data: CreateEducationData): Promise<Education> {
    const response = await apiClient.post('/education', data);
    return response.data;
  }

  /**
   * Update an education entry
   */
  async updateEducation(id: string, data: UpdateEducationData): Promise<Education> {
    const response = await apiClient.put(`/education/${id}`, data);
    return response.data;
  }

  /**
   * Delete an education entry
   */
  async deleteEducation(id: string): Promise<void> {
    await apiClient.delete(`/education/${id}`);
  }

  /**
   * Reorder education entries
   */
  async reorderEducation(data: ReorderEducationData): Promise<Education[]> {
    const response = await apiClient.put('/education/reorder', data);
    return response.data;
  }

  /**
   * Move education entry up
   */
  async moveEducationUp(id: string): Promise<Education[]> {
    const response = await apiClient.put(`/education/${id}/move-up`);
    return response.data;
  }

  /**
   * Move education entry down
   */
  async moveEducationDown(id: string): Promise<Education[]> {
    const response = await apiClient.put(`/education/${id}/move-down`);
    return response.data;
  }

  /**
   * Get education statistics
   */
  async getEducationStats(): Promise<EducationStats> {
    const response = await apiClient.get('/education/stats');
    return response.data;
  }

  /**
   * Export education data
   */
  async exportEducation(): Promise<{ data: Education[]; exportedAt: string; totalEntries: number }> {
    const response = await apiClient.get('/education/export');
    return response.data;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  /**
   * Format date range for display
   */
  formatDateRange(startDate: string, endDate?: string, isCurrent?: boolean): string {
    const start = this.formatDate(startDate);
    if (isCurrent) {
      return `${start} - Present`;
    }
    if (endDate) {
      const end = this.formatDate(endDate);
      return `${start} - ${end}`;
    }
    return start;
  }

  /**
   * Calculate duration between dates
   */
  calculateDuration(startDate: string, endDate?: string, isCurrent?: boolean): string {
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : null);
    
    if (!end) return '';
    
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    
    if (months < 0) {
      const adjustedYears = years - 1;
      const adjustedMonths = 12 + months;
      return `${adjustedYears} year${adjustedYears === 1 ? '' : 's'} ${adjustedMonths} month${adjustedMonths === 1 ? '' : 's'}`;
    }
    
    if (years === 0) {
      return `${months} month${months === 1 ? '' : 's'}`;
    }
    
    return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`;
  }

  /**
   * Validate education data
   */
  validateEducationData(data: CreateEducationData | UpdateEducationData): string[] {
    const errors: string[] = [];
    
    if ('institution' in data && (!data.institution || data.institution.trim().length === 0)) {
      errors.push('Institution name is required');
    }
    
    if ('degree' in data && (!data.degree || data.degree.trim().length === 0)) {
      errors.push('Degree is required');
    }
    
    if ('fieldOfStudy' in data && (!data.fieldOfStudy || data.fieldOfStudy.trim().length === 0)) {
      errors.push('Field of study is required');
    }
    
    if ('startDate' in data && !data.startDate) {
      errors.push('Start date is required');
    }
    
    if ('gpa' in data && data.gpa !== undefined && (data.gpa < 0 || data.gpa > 4)) {
      errors.push('GPA must be between 0 and 4.0');
    }
    
    if ('isCurrent' in data && data.isCurrent && 'endDate' in data && data.endDate) {
      errors.push('Current education cannot have an end date');
    }
    
    if ('isCurrent' in data && data.isCurrent === false && 'endDate' in data && !data.endDate) {
      errors.push('Completed education must have an end date');
    }
    
    return errors;
  }
}

export const educationService = new EducationService();
export default educationService;
