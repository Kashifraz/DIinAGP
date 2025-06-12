import api from './api';

export interface Category {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CategorySearchParams {
  q?: string;
}

class CategoryService {
  // Public endpoints
  async getPublicCategories(): Promise<Category[]> {
    const response = await api.get('/categories/public/active');
    return response.data;
  }

  async searchCategories(params: CategorySearchParams): Promise<Category[]> {
    const response = await api.get('/categories/public/search', { params });
    return response.data;
  }

  // Admin endpoints
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get('/categories/admin/all');
    return response.data;
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get(`/categories/public/${id}`);
    return response.data;
  }

  async createCategory(category: CategoryRequest): Promise<Category> {
    const response = await api.post('/categories/admin', category);
    return response.data;
  }

  async updateCategory(id: number, category: CategoryRequest): Promise<Category> {
    const response = await api.put(`/categories/admin/${id}`, category);
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/admin/${id}`);
  }

  async toggleCategoryStatus(id: number): Promise<Category> {
    const response = await api.patch(`/categories/admin/${id}/toggle-status`);
    return response.data;
  }

  async getCategoryStats(): Promise<any> {
    const response = await api.get('/categories/admin/stats');
    return response.data;
  }
}

export default new CategoryService();
