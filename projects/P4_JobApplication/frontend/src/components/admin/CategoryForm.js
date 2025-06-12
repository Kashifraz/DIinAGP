import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import categoryService from '../../services/categoryService';

const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    level: 0,
    sortOrder: 0,
    icon: '',
    color: '#007bff',
    isActive: true,
    metadata: {
      keywords: [],
      tags: []
    }
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories for parent selection
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'hierarchy'],
    queryFn: () => categoryService.getCategories({ hierarchy: true }),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentCategory: category.parentCategory || '',
        level: category.level || 0,
        sortOrder: category.sortOrder || 0,
        icon: category.icon || '',
        color: category.color || '#007bff',
        isActive: category.isActive !== undefined ? category.isActive : true,
        metadata: {
          keywords: category.metadata?.keywords || [],
          tags: category.metadata?.tags || []
        }
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('metadata.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear server error when user makes changes
    if (serverError) {
      setServerError('');
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.metadata.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          keywords: [...prev.metadata.keywords, keywordInput.trim()]
        }
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        keywords: prev.metadata.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.metadata.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, tagInput.trim()]
        }
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter(t => t !== tag)
      }
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.parentCategory && formData.level === 0) {
      errors.level = 'Subcategories must have level > 0';
    }
    
    if (!formData.parentCategory && formData.level > 0) {
      errors.parentCategory = 'Subcategories must have a parent';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    
    try {
      const submitData = {
        ...formData,
        parentCategory: formData.parentCategory || null,
        level: parseInt(formData.level),
        sortOrder: parseInt(formData.sortOrder)
      };

      if (category) {
        await categoryService.updateCategory(category._id, submitData);
      } else {
        await categoryService.createCategory(submitData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to save category. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        if (typeof error.response.data.errors === 'object') {
          const errorMessages = Object.values(error.response.data.errors);
          errorMessage = errorMessages.join(', ');
        } else {
          errorMessage = error.response.data.errors;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setServerError(errorMessage);
      
      // Set field-specific errors if available
      if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderParentOptions = (categories, level = 0) => {
    if (!categories || !Array.isArray(categories)) return null;
    
    return categories.map(cat => (
      <React.Fragment key={cat._id}>
        {cat._id !== category?._id && (
          <option value={cat._id}>
            {'— '.repeat(level)}{cat.name}
          </option>
        )}
        {cat.subcategories && cat.subcategories.length > 0 && 
          renderParentOptions(cat.subcategories, level + 1)
        }
      </React.Fragment>
    ));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content category-form-modal">
        <div className="modal-header">
          <h2>{category ? 'Edit Category' : 'Create New Category'}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {serverError && (
          <div className="error-message" style={{ margin: '20px', padding: '15px', background: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
            <strong>Error:</strong> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="e.g., Software Development"
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className={errors.level ? 'error' : ''}
              >
                <option value={0}>Main Category (0)</option>
                <option value={1}>Subcategory (1)</option>
                <option value={2}>Specialized (2)</option>
                <option value={3}>Specific (3)</option>
              </select>
              {errors.level && <span className="field-error">{errors.level}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe what this category represents..."
              rows="3"
              required
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="parentCategory">Parent Category</label>
              <select
                id="parentCategory"
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleChange}
                className={errors.parentCategory ? 'error' : ''}
              >
                <option value="">No Parent (Main Category)</option>
                {renderParentOptions(categoriesData?.data)}
              </select>
              {errors.parentCategory && <span className="field-error">{errors.parentCategory}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="sortOrder">Sort Order</label>
              <input
                type="number"
                id="sortOrder"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="icon">Icon</label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="e.g., laptop-code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active Category
            </label>
          </div>

          <div className="form-group">
            <label>Keywords</label>
            <div className="keyword-input-group">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Add keyword..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
              />
              <button type="button" onClick={handleAddKeyword} className="add-keyword-btn">
                Add
              </button>
            </div>
            <div className="tags-list">
              {formData.metadata.keywords.map((keyword, index) => (
                <span key={index} className="tag">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button type="button" onClick={handleAddTag} className="add-tag-btn">
                Add
              </button>
            </div>
            <div className="tags-list">
              {formData.metadata.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
