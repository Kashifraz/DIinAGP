import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { EducationProvider } from './context/EducationContext';
import { ExperienceProvider } from './context/ExperienceContext';
import { SkillProvider } from './context/SkillContext';
import { LanguageProvider } from './context/LanguageContext';
import { PublicationProvider } from './context/PublicationContext';
import { ProjectProvider } from './context/ProjectContext';
import { AwardProvider } from './context/AwardContext';
import { ReferenceProvider } from './context/ReferenceContext';
import { TemplateProvider } from './context/TemplateContext';
import { CVProvider } from './context/CVContext';
import Layout from './components/Layout/Layout';
import ProtectedLayout from './components/Layout/ProtectedLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProfessionalPage from './pages/ProfessionalPage';
import TemplateSelectionPage from './pages/TemplateSelectionPage';
import CVLibraryPage from './pages/CVLibraryPage';
import CVEditorPage from './pages/CVEditorPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            } />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ProfileProvider>
                <EducationProvider>
                  <ExperienceProvider>
                    <SkillProvider>
                      <LanguageProvider>
                        <PublicationProvider>
                        <ProjectProvider>
                          <AwardProvider>
                            <ReferenceProvider>
                              <TemplateProvider>
                                <CVProvider>
                                  <ProtectedLayout />
                                </CVProvider>
                              </TemplateProvider>
                            </ReferenceProvider>
                          </AwardProvider>
                        </ProjectProvider>
                        </PublicationProvider>
                      </LanguageProvider>
                    </SkillProvider>
                  </ExperienceProvider>
                </EducationProvider>
              </ProfileProvider>
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="professional" element={<ProfessionalPage />} />
            <Route path="templates" element={<TemplateSelectionPage />} />
            <Route path="cvs" element={<CVLibraryPage />} />
            <Route path="cv/:id" element={<CVEditorPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
