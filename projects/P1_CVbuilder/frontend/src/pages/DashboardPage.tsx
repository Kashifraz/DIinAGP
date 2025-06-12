import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { useCV } from '../context/CVContext';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { state, getCVs, deleteCV } = useCV();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // Load CVs on component mount
  useEffect(() => {
    getCVs();
  }, [getCVs]);

  // Show success message if template was selected
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  const handleDeleteCV = async (cvId: string, cvName: string) => {
    if (globalThis.confirm(`Are you sure you want to delete "${cvName}"? This action cannot be undone.`)) {
      const success = await deleteCV(cvId);
      if (success) {
        // CV will be removed from state automatically
      }
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-green-400 hover:text-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your CVs and create new ones</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-body text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New CV</h3>
              <p className="text-gray-600 mb-4">Start building a new professional resume</p>
              <Link to="/dashboard/templates" className="btn btn-primary w-full">
                Choose Template
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <div className="bg-success-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My CVs</h3>
              <p className="text-gray-600 mb-4">{state.cvs.length} CVs created</p>
              <Link to="/dashboard/cvs" className="btn btn-outline w-full">
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* Recent CVs */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Recent CVs</h2>
          </div>
          <div className="card-body">
            {state.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading CVs...</span>
              </div>
            ) : state.cvs.length > 0 ? (
              <div className="space-y-4">
                {state.cvs.slice(0, 5).map((cv) => (
                  <div
                    key={cv._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 w-10 h-10 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{cv.name}</h3>
                        <p className="text-sm text-gray-500">
                          {cv.template.name} template • Modified {formatDate(cv.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/dashboard/cv/${cv._id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit CV"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteCV(cv._id, cv.name)}
                        className="p-2 text-gray-400 hover:text-error-600 transition-colors"
                        title="Delete CV"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {state.cvs.length > 5 && (
                  <div className="text-center pt-4">
                    <Link to="/dashboard/cvs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View all {state.cvs.length} CVs →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No CVs yet</h3>
                <p className="text-gray-500 mb-4">Create your first professional CV to get started</p>
                <Link to="/dashboard/templates" className="btn btn-primary">
                  Create Your First CV
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
