import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const imageUploadAPI = {
  // Upload image file
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/upload/image`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.imageUrl;
  },

  // Delete image by URL
  deleteImage: async (imageUrl: string): Promise<void> => {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_BASE_URL}/upload/image`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: { imageUrl }
    });
  }
};
