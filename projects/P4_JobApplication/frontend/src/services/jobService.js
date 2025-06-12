import api from '../config/api';

const jobService = {
  // Get all jobs with optional filters
  getJobs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all possible filter parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await api.get(`/jobs?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a specific job by ID
  getJobById: async (jobId) => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create a new job posting (employer only)
  createJob: async (jobData) => {
    try {
      const response = await api.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      console.log('Full error response:', error.response);
      
      // Extract detailed error information
      const errorData = error.response?.data;
      let errorMessage = 'Failed to create job posting';
      
      if (errorData) {
        // Handle validation errors
        if (errorData.errors) {
          errorMessage = errorData.errors;
        }
        // Handle general error message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Handle success: false with message
        else if (errorData.success === false && errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      // Create error object with both message and detailed errors
      const customError = new Error(errorMessage);
      customError.errors = errorData?.errors || {};
      customError.message = errorMessage;
      
      throw customError;
    }
  },

  // Update a job posting (employer only)
  updateJob: async (jobId, jobData) => {
    try {
      const response = await api.put(`/jobs/${jobId}`, jobData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete a job posting (employer only)
  deleteJob: async (jobId) => {
    try {
      const response = await api.delete(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update job status (employer only)
  updateJobStatus: async (jobId, status) => {
    try {
      const response = await api.patch(`/jobs/${jobId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get current user's jobs (employer only)
  getMyJobs: async () => {
    try {
      const response = await api.get('/jobs/my/jobs');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get job categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default jobService;
