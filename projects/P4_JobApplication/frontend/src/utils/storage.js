// Local storage utilities
import config from '../config/config';

export const storage = {
  // Set item in localStorage
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Get item from localStorage
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  // Auth specific methods
  setToken: (token) => {
    try {
      localStorage.setItem(config.TOKEN_KEY, token); // Store as string, not JSON
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  getToken: () => {
    try {
      return localStorage.getItem(config.TOKEN_KEY); // Return raw string
    } catch (error) {
      console.error('Error reading token:', error);
      return null;
    }
  },

  removeToken: () => {
    storage.remove(config.TOKEN_KEY);
  },

  setUser: (user) => {
    storage.set(config.USER_KEY, user);
  },

  getUser: () => {
    return storage.get(config.USER_KEY);
  },

  removeUser: () => {
    storage.remove(config.USER_KEY);
  },

  // Clear auth data
  clearAuth: () => {
    storage.removeToken();
    storage.removeUser();
  }
};

export default storage;
