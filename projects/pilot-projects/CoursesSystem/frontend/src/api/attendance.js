import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = 'http://localhost:5000/api/attendance';

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const createSession = (data) => axios.post(`${API_URL}/session`, data, authHeader());
export const getSession = (id) => axios.get(`${API_URL}/session/${id}`, authHeader());
export const scanQRCode = (qrCode) => axios.post(`${API_URL}/scan`, { qrCode }, authHeader());
export const getSessionRecords = (id) => axios.get(`${API_URL}/session/${id}/records`, authHeader());
export const getAttendanceHistory = (courseId) => axios.get(`${API_URL}/history/${courseId}`, authHeader());
export const getCalendarSessions = (courseId) => axios.get(`${API_URL}/calendar/${courseId}`, authHeader());
export const getCourseStudentsWithAttendance = (courseId) => axios.get(`${API_URL}/course/${courseId}/students`, authHeader());
export const getAttendanceMatrix = (courseId) => axios.get(`${API_URL}/course/${courseId}/attendance-matrix`, authHeader()); 