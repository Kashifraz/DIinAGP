import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', userData),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  
  getById: (id: string) => api.get(`/projects/${id}`),
  
  create: (data: { name: string; description?: string; startDate?: string; endDate?: string }) =>
    api.post('/projects', data),
  
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  
  delete: (id: string) => api.delete(`/projects/${id}`),
  
  inviteMember: (id: string, data: { email: string; role: string }) =>
    api.post(`/projects/${id}/invite`, data),
  
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
  
  createTag: (projectId: string, data: { name: string; color: string }) =>
    api.post(`/projects/${projectId}/tags`, data),
  
  updateTag: (projectId: string, tagId: string, data: { name: string; color: string }) =>
    api.put(`/projects/${projectId}/tags/${tagId}`, data),
  
  deleteTag: (projectId: string, tagId: string) =>
    api.delete(`/projects/${projectId}/tags/${tagId}`),
  
  updateMemberRole: (projectId: string, userId: string, role: string) =>
    api.put(`/projects/${projectId}/members/${userId}/role`, { role }),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  
  getByProject: (projectId: string) => api.get(`/tasks/project/${projectId}`),
  
  getById: (id: string) => api.get(`/tasks/${id}`),
  
  create: (data: any) => api.post('/tasks', data),
  
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  
  delete: (id: string) => api.delete(`/tasks/${id}`),
  
  addComment: (taskId: string, data: { content: string }) =>
    api.post(`/tasks/${taskId}/comments`, data),
  
  getComments: (taskId: string) => api.get(`/tasks/${taskId}/comments`),
  
  updateStatus: (taskId: string, status: string) =>
    api.put(`/tasks/${taskId}/status`, { status }),
  
  assignTask: (taskId: string, userId: string) =>
    api.put(`/tasks/${taskId}/assign`, { userId }),
  
  addTags: (taskId: string, tagIds: string[]) =>
    api.post(`/tasks/${taskId}/tags`, { tagIds }),
  
  removeTags: (taskId: string, tagIds: string[]) =>
    api.delete(`/tasks/${taskId}/tags`, { data: { tagIds } }),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.put('/users/change-password', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Files API
export const filesAPI = {
  upload: (file: File, taskId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (taskId) {
      formData.append('taskId', taskId);
    }
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getByTask: (taskId: string) => api.get(`/files/task/${taskId}`),
  
  delete: (id: string) => api.delete(`/files/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api; 