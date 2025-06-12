// Basic routing setup
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import config from '../config/config';

// Import layout components
import { Header, Footer } from '../components/Layout';

// Import auth components
import AuthPage from '../components/auth/AuthPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Import job components
import JobListing from '../components/jobs/JobListing';
import JobDetail from '../components/jobs/JobDetail';
import JobCreationForm from '../components/jobs/JobCreationForm';
import JobEditForm from '../components/jobs/JobEditForm';
import EmployerDashboard from '../components/jobs/EmployerDashboard';

// Import dashboard components
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

// Import admin components
import CategoryManagement from '../components/admin/CategoryManagement';
import UserManagement from '../components/admin/UserManagement';

// Import application components
import ApplicationForm from '../components/applications/ApplicationForm';
import EmployeeApplications from '../components/applications/EmployeeApplications';
import EmployeeApplicationDetail from '../components/applications/EmployeeApplicationDetail';
import EmployerApplicationsList from '../components/applications/EmployerApplicationsList';
import EmployerApplicationReview from '../components/applications/EmployerApplicationReview';

// Import profile component
import Profile from '../components/profile/Profile';

// Import pages
import LandingPage from '../components/pages/LandingPage';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Render role-specific dashboard
  if (user?.role === 'employer') {
    return <EmployerDashboard />;
  }
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  // For employees, show employee dashboard
  return <EmployeeDashboard />;
};

// Smart Applications component that redirects based on role
const Applications = () => {
  const { user } = useAuth();
  
  // If employer, redirect to employer applications
  if (user?.role === 'employer') {
    return <EmployerApplicationsList />;
  }
  
  // If employee or other, show employee applications
  return <EmployeeApplications />;
};

const Jobs = () => <JobListing />;

const Admin = () => {
  return <AdminDashboard />;
};

const NotFound = () => (
  <div className="page">
    <h2>404 - Page Not Found</h2>
    <p>The page you're looking for doesn't exist.</p>
  </div>
);

// Main App Router
const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path={config.ROUTES.HOME} element={<LandingPage />} />
              <Route path={config.ROUTES.LOGIN} element={<AuthPage />} />
              <Route path={config.ROUTES.REGISTER} element={<AuthPage />} />
              <Route 
                path={config.ROUTES.DASHBOARD} 
                element={
                  <ProtectedRoute>
                    <div className="padded-page">
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={config.ROUTES.JOBS} 
                element={
                  <ProtectedRoute>
                    <div className="padded-page">
                      <Jobs />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/create" 
                element={
                  <ProtectedRoute requiredRole="employer">
                    <div className="padded-page">
                      <JobCreationForm />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:id" 
                element={
                  <ProtectedRoute>
                    <div className="padded-page">
                      <JobDetail />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:id/edit" 
                element={
                  <ProtectedRoute requiredRole="employer">
                    <div className="padded-page">
                      <JobEditForm />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute>
                    <div className="padded-page">
                      <Applications />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications/:applicationId" 
                element={
                  <ProtectedRoute>
                    <div className="padded-page">
                      <EmployeeApplicationDetail />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/jobs/:id/apply" 
                element={
                  <ProtectedRoute requiredRole="employee">
                    <div className="padded-page">
                      <ApplicationForm />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employer/applications" 
                element={
                  <ProtectedRoute requiredRole="employer">
                    <div className="padded-page">
                      <EmployerApplicationsList />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications/:applicationId/review" 
                element={
                  <ProtectedRoute requiredRole="employer">
                    <div className="padded-page">
                      <EmployerApplicationReview />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={config.ROUTES.PROFILE} 
                element={
                  <ProtectedRoute>
                    <div className="padded-page">
                      <Profile />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={config.ROUTES.ADMIN} 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <div className="padded-page">
                      <Admin />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <div className="padded-page">
                      <CategoryManagement />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <div className="padded-page">
                      <UserManagement />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
