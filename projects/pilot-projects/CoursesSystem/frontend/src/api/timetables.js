import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = 'http://localhost:5000/api/timetables';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const getTimetables = (courseId) => {
  const url = courseId ? `${API_URL}?course=${courseId}` : API_URL;
  return axios.get(url, authHeader());
};

export const createTimetable = (data) => axios.post(API_URL, data, authHeader());

export const updateTimetable = (id, data) => axios.put(`${API_URL}/${id}`, data, authHeader());

export const deleteTimetable = (id) => axios.delete(`${API_URL}/${id}`, authHeader());

export const getTimetablesByCourse = (courseId) => axios.get(`${API_URL}/by-course/${courseId}`, authHeader()); 