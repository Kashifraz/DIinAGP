import api from './api';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  professionalTitle?: string;
  phone?: string;
  location?: string;
  bio?: string;
  photo?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  professionalTitle?: string;
  phone?: string;
  location?: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

export interface ProfileCompletion {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProfileResponse {
  profile: Profile;
}

export interface CompletionResponse {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
}

class ProfileService {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    const response = await api.get('/profiles/me');
    return response.data;
  }

  /**
   * Update user's profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<ProfileResponse>> {
    const response = await api.put('/profiles/me', data);
    return response.data;
  }

  /**
   * Upload profile photo
   */
  async uploadPhoto(file: File): Promise<ApiResponse<ProfileResponse>> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/profiles/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Delete profile photo
   */
  async deletePhoto(): Promise<ApiResponse<ProfileResponse>> {
    const response = await api.delete('/profiles/me/photo');
    return response.data;
  }

  /**
   * Get profile completion percentage
   */
  async getProfileCompletion(): Promise<ApiResponse<CompletionResponse>> {
    const response = await api.get('/profiles/me/completion');
    return response.data;
  }

  /**
   * Get profile photo URL
   */
  getPhotoUrl(photoPath?: string): string | null {
    if (!photoPath) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/uploads/${photoPath}`;
  }
}

export const profileService = new ProfileService();
export default profileService;
