import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { getToken } from './utils/auth';
import NavBar from './components/NavBar';
import CourseList from './pages/CourseList';
import TimetableList from './pages/TimetableList';
import CalendarView from './pages/CalendarView';
import AttendanceTeacher from './pages/AttendanceTeacher';
import AttendanceStudent from './pages/AttendanceStudent';
import ProtectedRoute from './components/ProtectedRoute';
import EnrolledStudentsPage from './pages/EnrolledStudentsPage';
import StudentCoursesStats from './pages/StudentCoursesStats';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  useEffect(() => {
    setIsAuthenticated(!!getToken());
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/courses" element={isAuthenticated ? <CourseList /> : <Navigate to="/login" />} />
        <Route path="/timetables" element={isAuthenticated ? <TimetableList /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={isAuthenticated ? <CalendarView /> : <Navigate to="/login" />} />
        <Route path="/attendance-teacher" element={
          <ProtectedRoute roles={['teacher', 'admin']}>
            <AttendanceTeacher />
          </ProtectedRoute>
        } />
        <Route path="/attendance-student" element={
          <ProtectedRoute roles={['student']}>
            <AttendanceStudent />
          </ProtectedRoute>
        } />
        <Route path="/courses/:id/students" element={isAuthenticated ? <EnrolledStudentsPage /> : <Navigate to="/login" />} />
        <Route path="/student-courses-stats" element={
          <ProtectedRoute roles={['student']}>
            <StudentCoursesStats />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
