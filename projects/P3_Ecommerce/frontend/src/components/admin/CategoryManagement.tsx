import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import CategoryStats from './CategoryStats';
import categoryService, { Category, CategoryRequest } from '../../services/categoryService';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: CategoryRequest) => {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories([...categories, newCategory]);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to create category');
      console.error('Error creating category:', err);
    }
  };

  const handleUpdateCategory = async (id: number, categoryData: CategoryRequest) => {
    try {
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      setCategories(categories.map(cat => cat.id === id ? updatedCategory : cat));
      setEditingCategory(null);
      setError(null);
    } catch (err) {
      setError('Failed to update category');
      console.error('Error updating category:', err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
        setError(null);
      } catch (err) {
        setError('Failed to delete category');
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const updatedCategory = await categoryService.toggleCategoryStatus(id);
      setCategories(categories.map(cat => cat.id === id ? updatedCategory : cat));
      setError(null);
    } catch (err) {
      setError('Failed to toggle category status');
      console.error('Error toggling status:', err);
    }
  };

  // Local filtering for admin view (no API call needed)
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage product categories and organize your catalog
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <CategoryStats categories={categories} />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category List */}
      <CategoryList
        categories={filteredCategories}
        onEdit={setEditingCategory}
        onDelete={handleDeleteCategory}
        onToggleStatus={handleToggleStatus}
      />

      {/* Category Form Modal */}
      {(showForm || editingCategory) && (
        <CategoryForm
          category={editingCategory}
          onSubmit={editingCategory ? 
            (data) => handleUpdateCategory(editingCategory.id, data) : 
            handleCreateCategory
          }
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default CategoryManagement;
