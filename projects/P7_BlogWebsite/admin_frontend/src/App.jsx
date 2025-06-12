import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import TestPage from './pages/TestPage'
import DashboardPage from './pages/DashboardPage'
import PostsListPage from './pages/PostsListPage'
import PostFormPage from './pages/PostFormPage'
import PostPreviewPage from './pages/PostPreviewPage'
import MediaLibraryPage from './pages/MediaLibraryPage'
import CategoriesListPage from './pages/CategoriesListPage'
import CommentsListPage from './pages/CommentsListPage'

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="test" element={<TestPage />} />
          <Route path="posts" element={<PostsListPage />} />
          <Route path="posts/new" element={<PostFormPage />} />
          <Route path="posts/:id/edit" element={<PostFormPage />} />
          <Route path="posts/:id/preview" element={<PostPreviewPage />} />
          <Route path="categories" element={<CategoriesListPage />} />
          <Route path="media" element={<MediaLibraryPage />} />
          <Route path="comments" element={<CommentsListPage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

