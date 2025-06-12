import { apiClient } from './api';

// Types
export interface Certification {
  name: string;
  issuer?: string;
  dateObtained?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Project {
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
}

export interface Skill {
  _id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  yearsOfExperience?: number;
  description?: string;
  certifications?: Certification[];
  projects?: Project[];
  order: number;
  isActive: boolean;
  isHighlighted: boolean;
  proficiencyPercentage?: number;
  experienceLevel?: string;
  activeCertificationsCount?: number;
  totalProjectsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type SkillCategory = 
  | 'technical'
  | 'programming'
  | 'framework'
  | 'database'
  | 'cloud'
  | 'devops'
  | 'design'
  | 'language'
  | 'soft'
  | 'certification'
  | 'tool'
  | 'other';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface CreateSkillData {
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  yearsOfExperience?: number;
  description?: string;
  certifications?: Certification[];
  projects?: Project[];
  isHighlighted?: boolean;
}

export interface UpdateSkillData {
  name?: string;
  category?: SkillCategory;
  proficiency?: ProficiencyLevel;
  yearsOfExperience?: number;
  description?: string;
  certifications?: Certification[];
  projects?: Project[];
  isHighlighted?: boolean;
}

export interface ReorderSkillsData {
  skillIds: string[];
}

export interface BulkUpdateData {
  updates: Array<{
    id: string;
    [key: string]: any;
  }>;
}

export interface SkillStats {
  totalSkills: number;
  highlightedSkills: number;
  uniqueCategories: number;
  categories: string[];
  proficiencyLevels: string[];
  totalCertifications: number;
  totalProjects: number;
  averageExperience: number;
}

class SkillService {
  /**
   * Get all skills for the current user
   */
  async getSkills(): Promise<Skill[]> {
    const response = await apiClient.get('/skills');
    return response.data;
  }

  /**
   * Get skills by category
   */
  async getSkillsByCategory(category: SkillCategory): Promise<Skill[]> {
    const response = await apiClient.get(`/skills/category/${category}`);
    return response.data;
  }

  /**
   * Get a specific skill
   */
  async getSkillById(id: string): Promise<Skill> {
    const response = await apiClient.get(`/skills/${id}`);
    return response.data;
  }

  /**
   * Create a new skill
   */
  async createSkill(data: CreateSkillData): Promise<Skill> {
    const response = await apiClient.post('/skills', data);
    return response.data;
  }

  /**
   * Update a skill
   */
  async updateSkill(id: string, data: UpdateSkillData): Promise<Skill> {
    const response = await apiClient.put(`/skills/${id}`, data);
    return response.data;
  }

  /**
   * Delete a skill
   */
  async deleteSkill(id: string): Promise<void> {
    await apiClient.delete(`/skills/${id}`);
  }

  /**
   * Reorder skills
   */
  async reorderSkills(data: ReorderSkillsData): Promise<Skill[]> {
    const response = await apiClient.put('/skills/reorder', data);
    return response.data;
  }

  /**
   * Move skill up
   */
  async moveSkillUp(id: string): Promise<Skill[]> {
    const response = await apiClient.put(`/skills/${id}/move-up`);
    return response.data;
  }

  /**
   * Move skill down
   */
  async moveSkillDown(id: string): Promise<Skill[]> {
    const response = await apiClient.put(`/skills/${id}/move-down`);
    return response.data;
  }

  /**
   * Toggle skill highlight
   */
  async toggleSkillHighlight(id: string): Promise<Skill> {
    const response = await apiClient.put(`/skills/${id}/highlight`);
    return response.data;
  }

  /**
   * Get highlighted skills
   */
  async getHighlightedSkills(): Promise<Skill[]> {
    const response = await apiClient.get('/skills/highlighted');
    return response.data;
  }

  /**
   * Get skills statistics
   */
  async getSkillsStats(): Promise<SkillStats> {
    const response = await apiClient.get('/skills/stats');
    return response.data;
  }

  /**
   * Bulk update skills
   */
  async bulkUpdateSkills(data: BulkUpdateData): Promise<Skill[]> {
    const response = await apiClient.put('/skills/bulk-update', data);
    return response.data;
  }

  /**
   * Export skills data
   */
  async exportSkills(): Promise<{ data: Skill[]; exportedAt: string; totalSkills: number }> {
    const response = await apiClient.get('/skills/export');
    return response.data;
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: SkillCategory): string {
    const categoryMap: Record<SkillCategory, string> = {
      'technical': 'Technical',
      'programming': 'Programming',
      'framework': 'Framework',
      'database': 'Database',
      'cloud': 'Cloud',
      'devops': 'DevOps',
      'design': 'Design',
      'language': 'Language',
      'soft': 'Soft Skills',
      'certification': 'Certification',
      'tool': 'Tool',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  }

  /**
   * Get proficiency display name
   */
  getProficiencyDisplayName(proficiency: ProficiencyLevel): string {
    const proficiencyMap: Record<ProficiencyLevel, string> = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced',
      'expert': 'Expert'
    };
    return proficiencyMap[proficiency] || proficiency;
  }

  /**
   * Get proficiency color
   */
  getProficiencyColor(proficiency: ProficiencyLevel): string {
    const colorMap: Record<ProficiencyLevel, string> = {
      'beginner': 'bg-gray-100 text-gray-800',
      'intermediate': 'bg-blue-100 text-blue-800',
      'advanced': 'bg-green-100 text-green-800',
      'expert': 'bg-purple-100 text-purple-800'
    };
    return colorMap[proficiency] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get category color
   */
  getCategoryColor(category: SkillCategory): string {
    const colorMap: Record<SkillCategory, string> = {
      'technical': 'bg-blue-100 text-blue-800',
      'programming': 'bg-green-100 text-green-800',
      'framework': 'bg-purple-100 text-purple-800',
      'database': 'bg-orange-100 text-orange-800',
      'cloud': 'bg-cyan-100 text-cyan-800',
      'devops': 'bg-red-100 text-red-800',
      'design': 'bg-pink-100 text-pink-800',
      'language': 'bg-yellow-100 text-yellow-800',
      'soft': 'bg-indigo-100 text-indigo-800',
      'certification': 'bg-emerald-100 text-emerald-800',
      'tool': 'bg-gray-100 text-gray-800',
      'other': 'bg-slate-100 text-slate-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get all available categories
   */
  getAllCategories(): SkillCategory[] {
    return [
      'technical',
      'programming',
      'framework',
      'database',
      'cloud',
      'devops',
      'design',
      'language',
      'soft',
      'certification',
      'tool',
      'other'
    ];
  }

  /**
   * Get all proficiency levels
   */
  getAllProficiencyLevels(): ProficiencyLevel[] {
    return ['beginner', 'intermediate', 'advanced', 'expert'];
  }

  /**
   * Validate skill data
   */
  validateSkillData(data: CreateSkillData | UpdateSkillData): string[] {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length === 0)) {
      errors.push('Skill name is required');
    }

    if ('name' in data && data.name && data.name.length > 100) {
      errors.push('Skill name cannot exceed 100 characters');
    }

    if ('category' in data && !data.category) {
      errors.push('Skill category is required');
    }

    if ('proficiency' in data && !data.proficiency) {
      errors.push('Proficiency level is required');
    }

    if ('yearsOfExperience' in data && data.yearsOfExperience !== undefined) {
      if (data.yearsOfExperience < 0 || data.yearsOfExperience > 50) {
        errors.push('Years of experience must be between 0 and 50');
      }
    }

    if ('description' in data && data.description && data.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    if ('certifications' in data && data.certifications) {
      data.certifications.forEach((cert, index) => {
        if (cert.name && cert.name.length > 200) {
          errors.push(`Certification ${index + 1} name cannot exceed 200 characters`);
        }
        if (cert.issuer && cert.issuer.length > 100) {
          errors.push(`Certification ${index + 1} issuer cannot exceed 100 characters`);
        }
        if (cert.credentialId && cert.credentialId.length > 100) {
          errors.push(`Certification ${index + 1} credential ID cannot exceed 100 characters`);
        }
      });
    }

    if ('projects' in data && data.projects) {
      data.projects.forEach((project, index) => {
        if (project.name && project.name.length > 200) {
          errors.push(`Project ${index + 1} name cannot exceed 200 characters`);
        }
        if (project.description && project.description.length > 500) {
          errors.push(`Project ${index + 1} description cannot exceed 500 characters`);
        }
        if (project.technologies) {
          project.technologies.forEach((tech, techIndex) => {
            if (tech.length > 50) {
              errors.push(`Project ${index + 1} technology ${techIndex + 1} cannot exceed 50 characters`);
            }
          });
        }
      });
    }

    return errors;
  }
}

export const skillService = new SkillService();
export default skillService;
