import { apiClient } from './api';

// Types
export interface Experience {
  _id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string[];
  skills?: string[];
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'consulting';
  order: number;
  isActive: boolean;
  duration?: string;
  dateRange?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperienceData {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string[];
  skills?: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'consulting';
}

export interface UpdateExperienceData {
  company?: string;
  position?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  achievements?: string[];
  skills?: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'consulting';
}

export interface ReorderExperienceData {
  experienceIds: string[];
}

export interface ExperienceStats {
  totalEntries: number;
  currentExperience: number;
  completedExperience: number;
  uniqueCompanies: number;
}

class ExperienceService {
  /**
   * Get all experience entries for the current user
   */
  async getExperience(): Promise<Experience[]> {
    const response = await apiClient.get('/experience');
    return response.data;
  }

  /**
   * Get a specific experience entry
   */
  async getExperienceById(id: string): Promise<Experience> {
    const response = await apiClient.get(`/experience/${id}`);
    return response.data;
  }

  /**
   * Create a new experience entry
   */
  async createExperience(data: CreateExperienceData): Promise<Experience> {
    const response = await apiClient.post('/experience', data);
    return response.data;
  }

  /**
   * Update an experience entry
   */
  async updateExperience(id: string, data: UpdateExperienceData): Promise<Experience> {
    const response = await apiClient.put(`/experience/${id}`, data);
    return response.data;
  }

  /**
   * Delete an experience entry
   */
  async deleteExperience(id: string): Promise<void> {
    await apiClient.delete(`/experience/${id}`);
  }

  /**
   * Reorder experience entries
   */
  async reorderExperience(data: ReorderExperienceData): Promise<Experience[]> {
    const response = await apiClient.put('/experience/reorder', data);
    return response.data;
  }

  /**
   * Move experience entry up
   */
  async moveExperienceUp(id: string): Promise<Experience[]> {
    const response = await apiClient.put(`/experience/${id}/move-up`);
    return response.data;
  }

  /**
   * Move experience entry down
   */
  async moveExperienceDown(id: string): Promise<Experience[]> {
    const response = await apiClient.put(`/experience/${id}/move-down`);
    return response.data;
  }

  /**
   * Get experience statistics
   */
  async getExperienceStats(): Promise<ExperienceStats> {
    const response = await apiClient.get('/experience/stats');
    return response.data;
  }

  /**
   * Export experience data
   */
  async exportExperience(): Promise<{ data: Experience[]; exportedAt: string; totalEntries: number }> {
    const response = await apiClient.get('/experience/export');
    return response.data;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  /**
   * Format employment type for display
   */
  formatEmploymentType(type: string): string {
    const typeMap: Record<string, string> = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance',
      'consulting': 'Consulting'
    };
    return typeMap[type] || type;
  }

  /**
   * Validate experience data
   */
  validateExperienceData(data: CreateExperienceData | UpdateExperienceData): string[] {
    const errors: string[] = [];

    if ('company' in data && (!data.company || data.company.trim().length === 0)) {
      errors.push('Company name is required');
    }

    if ('position' in data && (!data.position || data.position.trim().length === 0)) {
      errors.push('Position title is required');
    }

    if ('startDate' in data && !data.startDate) {
      errors.push('Start date is required');
    }

    if ('startDate' in data && data.startDate && new Date(data.startDate) > new Date()) {
      errors.push('Start date cannot be in the future');
    }

    if ('endDate' in data && data.endDate && 'startDate' in data && data.startDate) {
      if (new Date(data.endDate) <= new Date(data.startDate)) {
        errors.push('End date must be after start date');
      }
    }

    if ('isCurrent' in data && data.isCurrent && 'endDate' in data && data.endDate) {
      errors.push('Current experience cannot have an end date');
    }

    if ('isCurrent' in data && data.isCurrent === false && 'endDate' in data && !data.endDate) {
      errors.push('Completed experience must have an end date');
    }

    if ('description' in data && data.description && data.description.length > 2000) {
      errors.push('Description cannot exceed 2000 characters');
    }

    if ('achievements' in data && data.achievements) {
      data.achievements.forEach((achievement, index) => {
        if (achievement.length > 500) {
          errors.push(`Achievement ${index + 1} cannot exceed 500 characters`);
        }
      });
    }

    if ('skills' in data && data.skills) {
      data.skills.forEach((skill, index) => {
        if (skill.length > 50) {
          errors.push(`Skill ${index + 1} cannot exceed 50 characters`);
        }
      });
    }

    return errors;
  }
}

export const experienceService = new ExperienceService();
export default experienceService;
