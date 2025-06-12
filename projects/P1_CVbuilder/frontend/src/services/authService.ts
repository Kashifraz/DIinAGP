import { apiClient } from './api';
import { User, LoginCredentials, RegisterData } from '../types';

// Auth response types
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// Authentication service
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }
    
    return response.data;
  },

  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }
    
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Don't throw error for logout, as it's not critical
      console.error('Logout API call failed:', error);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user data');
    }
    
    return response.data.user;
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Token refresh failed');
    }
    
    return response.data;
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<{ user: User }>('/auth/me', userData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update profile');
    }
    
    return response.data.user;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to send password reset email');
    }
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<void> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password,
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to reset password');
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.get(`/auth/verify-email/${token}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Email verification failed');
    }
  },
};

export default authService;
