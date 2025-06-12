import api from '../config/api';

const dashboardService = {
  // Employee dashboard stats
  getEmployeeStats: async () => {
    const response = await api.get('/dashboard/employee/stats');
    return response.data;
  },

  // Employer dashboard stats
  getEmployerStats: async () => {
    const response = await api.get('/dashboard/employer/stats');
    return response.data;
  },

  // Admin dashboard stats
  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin/stats');
    return response.data;
  }
};

export default dashboardService;

