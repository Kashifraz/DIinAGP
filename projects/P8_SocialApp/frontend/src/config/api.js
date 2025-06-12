// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api'  // Development - use your machine's IP for physical device
  : 'https://your-production-api.com/api'; // Production

// For physical device testing, replace localhost with your machine's IP
// Example: 'http://192.168.1.100:8080/api'

export const API_ENDPOINTS = {
  // Test endpoints
  TEST_HEALTH: '/test/health',
  TEST_DATABASE: '/test/database',
  
  // Auth endpoints
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  
  // User endpoints
  USER_ME: '/users/me',
  USER_PROFILE: '/users',
  
  // Search endpoints
  SEARCH_USERS: '/users/search',
  
  // Friend endpoints
  FRIENDS: '/friends',
  FRIEND_REQUESTS: '/friends/requests',
  
  // Post endpoints
  POSTS: '/posts',
  
  // Comment endpoints
  COMMENTS: '/comments',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};

