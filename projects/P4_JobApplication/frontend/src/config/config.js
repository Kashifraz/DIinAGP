// Environment configuration
export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // App Configuration
  APP_NAME: 'Job Application Management System',
  APP_VERSION: '1.0.0',
  
  // Authentication
  TOKEN_KEY: 'job_app_token',
  USER_KEY: 'job_app_user',
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Routes
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    JOBS: '/jobs',
    APPLICATIONS: '/applications',
    PROFILE: '/profile',
    ADMIN: '/admin'
  },
  
  // User Roles
  ROLES: {
    EMPLOYER: 'employer',
    EMPLOYEE: 'employee',
    ADMIN: 'admin'
  }
};

export default config;
