import React, { useState, useEffect } from 'react'
import { apiClient } from '../utils/apiClient'

const TestPage = () => {
  const [apiStatus, setApiStatus] = useState({
    loading: false,
    success: false,
    error: null,
    data: null
  })

  const [dbStatus, setDbStatus] = useState({
    loading: false,
    success: false,
    error: null,
    data: null
  })

  const testAPI = async () => {
    setApiStatus({ loading: true, success: false, error: null, data: null })
    try {
      const response = await apiClient.get('/test')
      setApiStatus({
        loading: false,
        success: true,
        error: null,
        data: response.data
      })
    } catch (error) {
      setApiStatus({
        loading: false,
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        data: null
      })
    }
  }

  const testDatabase = async () => {
    setDbStatus({ loading: true, success: false, error: null, data: null })
    try {
      const response = await apiClient.get('/test/db')
      setDbStatus({
        loading: false,
        success: true,
        error: null,
        data: response.data
      })
    } catch (error) {
      setDbStatus({
        loading: false,
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error',
        data: null
      })
    }
  }

  useEffect(() => {
    // Auto-test API on component mount
    testAPI()
  }, [])

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Dashboard Test Page
        </h2>
        <p className="text-gray-600 mb-6">
          This is a test page to verify that the React application, API connection, and database are working correctly.
        </p>

        {/* API Test Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              API Connection Test
            </h3>
            <button
              onClick={testAPI}
              disabled={apiStatus.loading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {apiStatus.loading ? 'Testing...' : 'Test API'}
            </button>
          </div>

          {apiStatus.loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Testing API connection...</span>
            </div>
          )}

          {apiStatus.success && apiStatus.data && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">API Connection Successful!</span>
              </div>
              <div className="text-sm text-green-700">
                <p><strong>Message:</strong> {apiStatus.data.data?.message}</p>
                <p><strong>Timestamp:</strong> {apiStatus.data.data?.timestamp}</p>
                <p><strong>Environment:</strong> {apiStatus.data.data?.environment}</p>
              </div>
            </div>
          )}

          {apiStatus.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">API Connection Failed</span>
              </div>
              <p className="text-sm text-red-700">{apiStatus.error}</p>
            </div>
          )}
        </div>

        {/* Database Test Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Database Connection Test
            </h3>
            <button
              onClick={testDatabase}
              disabled={dbStatus.loading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dbStatus.loading ? 'Testing...' : 'Test Database'}
            </button>
          </div>

          {dbStatus.loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Testing database connection...</span>
            </div>
          )}

          {dbStatus.success && dbStatus.data && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Database Connection Successful!</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Status:</strong> {dbStatus.data.data?.status}</p>
                <p><strong>State:</strong> {dbStatus.data.data?.state}</p>
                <p><strong>Database:</strong> {dbStatus.data.data?.database}</p>
                <p><strong>Host:</strong> {dbStatus.data.data?.host}</p>
                {dbStatus.data.data?.collections && (
                  <div>
                    <p><strong>Collections:</strong></p>
                    <ul className="list-disc list-inside ml-2">
                      {dbStatus.data.data.collections.map((collection, index) => (
                        <li key={index}>{collection}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {dbStatus.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Database Connection Failed</span>
              </div>
              <p className="text-sm text-red-700">{dbStatus.error}</p>
            </div>
          )}
        </div>

        {/* System Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>React Version:</strong> {React.version}</p>
              <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
            </div>
            <div>
              <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not configured'}</p>
              <p><strong>Build Time:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage

