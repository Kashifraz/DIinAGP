import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '../../services/categoryService';
import CategoryForm from './CategoryForm';
import CategoryStats from './CategoryStats';

const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Fetch categories with hierarchy
  const { data: categoriesData, isLoading, error: queryError } = useQuery({
    queryKey: ['categories', 'hierarchy'],
    queryFn: () => categoryService.getCategories({ hierarchy: true }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      alert('Category deleted successfully');
    },
    onError: (error) => {
      alert(`Error deleting category: ${error.message}`);
    }
  });

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCategory(null);
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const renderCategoryTree = (categories, level = 0) => {
    if (!categories || !Array.isArray(categories)) return null;

    return categories.map(category => (
      <React.Fragment key={category._id}>
        <tr className={`category-row level-${level}`}>
          <td>
            <div className="category-name" style={{ paddingLeft: `${level * 20}px` }}>
              {level > 0 && <span className="indent">└─</span>}
              <span className="category-icon" style={{ color: category.color }}>
                {category.icon ? `📁` : '📂'}
              </span>
              <span className="name">{category.name}</span>
            </div>
          </td>
          <td>
            <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>{category.level}</td>
          <td>{category.jobCount || 0}</td>
          <td>{category.sortOrder}</td>
          <td>
            <div className="action-buttons">
              <button
                onClick={() => handleEdit(category)}
                className="btn-edit"
                title="Edit Category"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(category._id, category.name)}
                className="btn-delete"
                title="Delete Category"
                disabled={deleteCategoryMutation.isPending}
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
        {category.subcategories && category.subcategories.length > 0 && 
          renderCategoryTree(category.subcategories, level + 1)
        }
      </React.Fragment>
    ));
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="page">
        <div className="error-message">
          <h3>Error Loading Categories</h3>
          <p>{queryError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="category-management-header">
        <h1 className="category-management-title">Category Management</h1>
        <div className="category-management-actions">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn-secondary"
          >
            📊 {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            ➕ Add Category
          </button>
        </div>
      </div>

      {showStats && <CategoryStats />}

      <div className="category-management-content">
        <div className="category-summary">
          <h3>Categories ({categoriesData?.data?.length || 0})</h3>
          <p>Manage job categories and their hierarchy</p>
        </div>

        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Status</th>
                <th>Level</th>
                <th>Jobs</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {renderCategoryTree(categoriesData?.data)}
            </tbody>
          </table>
        </div>

        {categoriesData?.data?.length === 0 && (
          <div className="no-categories">
            <div className="no-categories-content">
              <h3>No Categories Found</h3>
              <p>Start by creating your first category</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Create Category
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default CategoryManagement;
