import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import ApiService from '../services/ApiService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load stored authentication data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      let storedToken = null;
      let storedUser = null;
      
      if (Platform.OS === 'web') {
        // Use localStorage for web
        storedToken = localStorage.getItem('authToken');
        storedUser = localStorage.getItem('userData');
      } else {
        // Use SecureStore for mobile
        storedToken = await SecureStore.getItemAsync('authToken');
        storedUser = await SecureStore.getItemAsync('userData');
      }
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(email, password);
      
      if (response.success) {
        const { token: authToken, user: userData } = response;
        
        // Store authentication data securely
        if (Platform.OS === 'web') {
          // Use localStorage for web
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          // Use SecureStore for mobile
          await SecureStore.setItemAsync('authToken', authToken);
          await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        }
        
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await ApiService.register(email, password);
      
      if (response.success) {
        const { token: authToken, user: userData } = response;
        
        // Store authentication data securely
        if (Platform.OS === 'web') {
          // Use localStorage for web
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('userData', JSON.stringify(userData));
        } else {
          // Use SecureStore for mobile
          await SecureStore.setItemAsync('authToken', authToken);
          await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        }
        
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🔵 Logout function called');
      console.log('🔵 Current auth state - isAuthenticated:', isAuthenticated, 'user:', user);
      
      // Clear stored authentication data
      if (Platform.OS === 'web') {
        // Use localStorage for web
        console.log('🔵 Clearing localStorage (web)');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        console.log('🔵 localStorage cleared');
      } else {
        // Use SecureStore for mobile
        console.log('🔵 Clearing SecureStore (mobile)');
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('userData');
        console.log('🔵 SecureStore cleared');
      }
      
      console.log('🔵 Setting auth state to null');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('🔵 Auth state updated - isAuthenticated should be false');
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
