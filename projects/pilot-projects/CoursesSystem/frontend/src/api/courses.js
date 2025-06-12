import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = 'http://localhost:5000/api/courses';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const getCourses = () => axios.get(API_URL, authHeader());
export const getCourse = (id) => axios.get(`${API_URL}/${id}`, authHeader());
export const createCourse = (data) => axios.post(API_URL, data, authHeader());
export const updateCourse = (id, data) => axios.put(`${API_URL}/${id}`, data, authHeader());
export const deleteCourse = (id) => axios.delete(`${API_URL}/${id}`, authHeader());
export const enrollStudent = (courseId, email) => axios.post(`${API_URL}/${courseId}/enroll`, { email }, authHeader());
export const getEnrolledStudents = (courseId) => axios.get(`${API_URL}/${courseId}/students`, authHeader());
export const removeEnrolledStudent = (courseId, studentId) => axios.delete(`${API_URL}/${courseId}/enroll/${studentId}`, authHeader());
 