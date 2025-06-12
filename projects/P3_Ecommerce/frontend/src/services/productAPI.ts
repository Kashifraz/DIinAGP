import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/products';

export interface ProductRequest {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  imageUrl?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  brand?: string;
  model?: string;
  isActive: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  isActive: boolean;
  sku?: string;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  inStock: boolean;
  lowStock: boolean;
  outOfStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPageResponse {
  content: ProductResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const productAPI = {
  // Get all products with pagination
  getAll: async (page: number = 0, size: number = 10, sortBy: string = 'name', sortDir: string = 'asc') => {
    return axios.get<ProductPageResponse>(`${API_BASE_URL}/public`, {
      params: { page, size, sortBy, sortDir }
    });
  },

  // Get product by ID
  getById: async (id: number) => {
    return axios.get<ProductResponse>(`${API_BASE_URL}/public/${id}`);
  },

  // Get products by category
  getByCategory: async (categoryId: number, page: number = 0, size: number = 10, sortBy: string = 'name', sortDir: string = 'asc') => {
    return axios.get<ProductPageResponse>(`${API_BASE_URL}/public/category/${categoryId}`, {
      params: { page, size, sortBy, sortDir }
    });
  },

  // Search products
  search: async (query: string, page: number = 0, size: number = 10, sortBy: string = 'name', sortDir: string = 'asc') => {
    return axios.get<ProductPageResponse>(`${API_BASE_URL}/public/search`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
  },

  // Search products by category
  searchByCategory: async (categoryId: number, query: string, page: number = 0, size: number = 10, sortBy: string = 'name', sortDir: string = 'asc') => {
    return axios.get<ProductPageResponse>(`${API_BASE_URL}/public/search/category/${categoryId}`, {
      params: { q: query, page, size, sortBy, sortDir }
    });
  },

  // Get products by price range
  getByPriceRange: async (minPrice: number, maxPrice: number, page: number = 0, size: number = 10) => {
    return axios.get<ProductPageResponse>(`${API_BASE_URL}/public/price-range`, {
      params: { minPrice, maxPrice, page, size }
    });
  },

  // Get products by brand
  getByBrand: async (brand: string) => {
    return axios.get<ProductResponse[]>(`${API_BASE_URL}/public/brand/${brand}`);
  },

  // Create new product (Admin only)
  create: async (productData: ProductRequest) => {
    const token = localStorage.getItem('token');
    return axios.post<ProductResponse>(API_BASE_URL, productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  // Update product (Admin only)
  update: async (id: number, productData: ProductRequest) => {
    const token = localStorage.getItem('token');
    return axios.put<ProductResponse>(`${API_BASE_URL}/${id}`, productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  // Delete product (Admin only)
  delete: async (id: number) => {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Update stock quantity (Admin only)
  updateStock: async (id: number, stockQuantity: number) => {
    const token = localStorage.getItem('token');
    return axios.patch<ProductResponse>(`${API_BASE_URL}/${id}/stock`, 
      { stockQuantity }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  },

  // Toggle product status (Admin only)
  toggleStatus: async (id: number) => {
    const token = localStorage.getItem('token');
    return axios.patch<ProductResponse>(`${API_BASE_URL}/${id}/status`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get low stock products (Admin only)
  getLowStock: async () => {
    const token = localStorage.getItem('token');
    return axios.get<ProductResponse[]>(`${API_BASE_URL}/admin/low-stock`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get out of stock products (Admin only)
  getOutOfStock: async () => {
    const token = localStorage.getItem('token');
    return axios.get<ProductResponse[]>(`${API_BASE_URL}/admin/out-of-stock`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get product statistics (Admin only)
  getStats: async () => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get category product count (Admin only)
  getCategoryStats: async (categoryId: number) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/admin/stats/category/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};
