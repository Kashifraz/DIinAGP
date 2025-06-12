import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const register = async (data) => {
  return axios.post(`${API_URL}/register`, data);
};

export const login = async (data) => {
  return axios.post(`${API_URL}/login`, data);
};

export const getCurrentUser = async (token) => {
  return axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}; 