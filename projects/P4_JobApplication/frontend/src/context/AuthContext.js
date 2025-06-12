import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Start as true
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = storage.getUser();
        const token = storage.getToken();
        
        if (storedUser && token) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      const { data } = response;
      const { user: userData, token } = data;

      console.log('Storing token and user data');
      storage.setToken(token);
      storage.setUser(userData);
      
      // Also store in raw localStorage to ensure it's accessible
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Token stored, verifying:', localStorage.getItem('token') ? 'Token in localStorage' : 'No token');
      
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      
      return { user: userData };
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      const { data } = response;
      const { user: newUser, token } = data;

      storage.setToken(token);
      storage.setUser(newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      setLoading(false);
      
      return { user: newUser };
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    storage.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};