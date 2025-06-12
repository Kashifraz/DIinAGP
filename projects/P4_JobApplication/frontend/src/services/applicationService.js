import api from '../config/api';

const applicationService = {
  // Submit application for a job
  submitApplication: async (formData) => {
    try {
      const response = await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          error.message || 
                          'Failed to submit application';
      throw new Error(errorMessage);
    }
  },

  // Get employee's applications
  getEmployeeApplications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/applications/employee?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee applications:', error);
      throw error.response?.data || error;
    }
  },

  // Get applications for a specific job (employer)
  getJobApplications: async (jobId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await api.get(`/applications/job/${jobId}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error.response?.data || error;
    }
  },

  // Get all applications for employer
  getEmployerApplications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await api.get(`/applications/employer?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employer applications:', error);
      throw error.response?.data || error;
    }
  },

  // Get single application by ID
  getApplication: async (applicationId) => {
    try {
      const response = await api.get(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error.response?.data || error;
    }
  },

  // Update application status (employer)
  updateApplicationStatus: async (applicationId, status, notes) => {
    try {
      const response = await api.patch(`/applications/${applicationId}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error.response?.data || error;
    }
  },

  // Respond to application (employer)
  respondToApplication: async (applicationId, responseData) => {
    try {
      const response = await api.post(`/applications/${applicationId}/respond`, responseData);
      return response.data;
    } catch (error) {
      console.error('Error responding to application:', error);
      throw error.response?.data || error;
    }
  },

  // Withdraw application (employee)
  withdrawApplication: async (applicationId) => {
    try {
      const response = await api.delete(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error.response?.data || error;
    }
  },

  // Get application statistics
  getApplicationStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.employer) queryParams.append('employer', params.employer);
      if (params.employee) queryParams.append('employee', params.employee);
      if (params.job) queryParams.append('job', params.job);
      if (params.status) queryParams.append('status', params.status);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);

      const response = await api.get(`/applications/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error.response?.data || error;
    }
  },

  // Download resume
  downloadResume: async (applicationId) => {
    try {
      const response = await api.get(`/applications/${applicationId}/resume`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading resume:', error);
      throw error.response?.data || error;
    }
  },
};

export default applicationService;

