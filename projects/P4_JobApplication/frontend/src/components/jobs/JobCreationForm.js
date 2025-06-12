import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jobService from '../../services/jobService';
import categoryService from '../../services/categoryService';
import config from '../../config/config';

const JobCreationForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: {
      min: '',
      max: '',
      currency: 'USD'
    },
    category: '',
    skills: [],
    company: {
      name: '',
      website: '',
      description: ''
    },
    isRemote: false,
    isUrgent: false,
    maxApplications: 100,
    expiresAt: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [serverError, setServerError] = useState('');

  // Helper function to render hierarchical categories
  const renderCategoryOptions = (categories, level = 0) => {
    if (!categories || !Array.isArray(categories)) return null;
    
    return categories.map(category => (
      <React.Fragment key={category._id}>
        <option value={category._id}>
          {'— '.repeat(level)}{category.name}
        </option>
        {category.subcategories && category.subcategories.length > 0 && 
          renderCategoryOptions(category.subcategories, level + 1)
        }
      </React.Fragment>
    ));
  };

  // Fetch categories with hierarchy
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', 'hierarchy'],
    queryFn: () => categoryService.getCategories({ hierarchy: true }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: jobService.createJob,
    onSuccess: (data) => {
      console.log('Job created successfully:', data);
      setSuccessMessage('Job posted successfully! Redirecting to jobs list...');
      setServerError('');
      setErrors({});
      
      // Clear success message after 3 seconds and redirect
      setTimeout(() => {
        queryClient.invalidateQueries(['jobs']);
        navigate(config.ROUTES.JOBS);
      }, 2000);
    },
    onError: (error) => {
      console.error('Job creation error:', error);
      console.error('Error details:', {
        message: error.message,
        errors: error.errors,
        response: error.response
      });
      
      // Set server error message
      let errorMessage = 'Failed to create job posting. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // If errors is an object, format it nicely
        if (typeof error.response.data.errors === 'object') {
          const errorMessages = Object.values(error.response.data.errors);
          errorMessage = errorMessages.join(', ');
        } else {
          errorMessage = error.response.data.errors;
        }
      }
      
      // Clean up error message - remove quotes and make it user-friendly
      errorMessage = errorMessage
        .replace(/"/g, '') // Remove quotes
        .replace(/\\/g, '') // Remove backslashes
        .replace(/\{.*?\}/g, '') // Remove JSON object notation
        .trim();
      
      setServerError(errorMessage);
      setSuccessMessage('');
      
      // Handle field-specific errors
      if (error.errors && typeof error.errors === 'object') {
        setErrors(error.errors);
      } else if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
        setErrors(error.response.data.errors);
      }
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear server messages when user starts typing
    if (serverError || successMessage) {
      setServerError('');
      setSuccessMessage('');
    }
  };

  const handleSkillAdd = (e) => {
    e.preventDefault();
    if (skillInput.trim() && formData.skills.length < 20) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    setSuccessMessage('');

    // Prepare form data
    const submitData = {
      ...formData,
      salaryRange: {
        ...formData.salaryRange,
        min: formData.salaryRange.min ? parseInt(formData.salaryRange.min) : undefined,
        max: formData.salaryRange.max ? parseInt(formData.salaryRange.max) : undefined
      },
      maxApplications: parseInt(formData.maxApplications),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
    };

    console.log('Submitting job data:', submitData);
    createJobMutation.mutate(submitData);
  };

  if (categoriesLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="job-creation-form">
      <div className="form-header">
        <h2>Create New Job Posting</h2>
        <p>Fill out the form below to create a new job posting</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message" style={{
          background: '#d4edda',
          color: '#155724',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {serverError && (
        <div className="error-message" style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px', marginTop: '2px' }}>❌</span>
          <div>
            <strong>Error:</strong>
            <div style={{ marginTop: '4px', fontSize: '14px' }}>
              {serverError}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="job-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="e.g., Senior React Developer"
              required
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'error' : ''}
              required
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? 'Loading categories...' : 'Select a category'}
              </option>
              {renderCategoryOptions(categoriesData?.data)}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
            {categoriesLoading && <small>Loading categories...</small>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employmentType">Employment Type *</label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                required
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experienceLevel">Experience Level *</label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                required
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="form-section">
          <h3>Job Details</h3>
          
          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe the role, company culture, and what makes this opportunity unique..."
              rows="6"
              required
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements *</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              className={errors.requirements ? 'error' : ''}
              placeholder="List the required qualifications, education, and experience..."
              rows="5"
              required
            />
            {errors.requirements && <span className="error-message">{errors.requirements}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="responsibilities">Responsibilities *</label>
            <textarea
              id="responsibilities"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              className={errors.responsibilities ? 'error' : ''}
              placeholder="Describe the day-to-day responsibilities and key tasks..."
              rows="5"
              required
            />
            {errors.responsibilities && <span className="error-message">{errors.responsibilities}</span>}
          </div>
        </div>

        {/* Location & Salary */}
        <div className="form-section">
          <h3>Location & Compensation</h3>
          
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'error' : ''}
              placeholder="e.g., San Francisco, CA or Remote"
              required
            />
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isRemote"
                checked={formData.isRemote}
                onChange={handleChange}
              />
              This is a remote position
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salaryMin">Minimum Salary</label>
              <input
                type="number"
                id="salaryMin"
                name="salaryRange.min"
                value={formData.salaryRange.min}
                onChange={handleChange}
                placeholder="e.g., 80000"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salaryMax">Maximum Salary</label>
              <input
                type="number"
                id="salaryMax"
                name="salaryRange.max"
                value={formData.salaryRange.max}
                onChange={handleChange}
                placeholder="e.g., 120000"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="salaryRange.currency"
                value={formData.salaryRange.currency}
                onChange={handleChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="form-section">
          <h3>Required Skills</h3>
          
          <div className="skills-input">
            <div className="form-group">
              <label htmlFor="skillInput">Add Skills</label>
              <div className="skill-input-group">
                <input
                  type="text"
                  id="skillInput"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g., React, JavaScript, TypeScript"
                  maxLength="50"
                />
                <button type="button" onClick={handleSkillAdd} className="add-skill-btn">
                  Add Skill
                </button>
              </div>
              <small>Maximum 20 skills allowed</small>
            </div>

            {formData.skills.length > 0 && (
              <div className="skills-list">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill)}
                      className="skill-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Company Information */}
        <div className="form-section">
          <h3>Company Information</h3>
          
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              type="text"
              id="companyName"
              name="company.name"
              value={formData.company.name}
              onChange={handleChange}
              className={errors['company.name'] ? 'error' : ''}
              placeholder="e.g., Tech Innovations LLC"
              required
            />
            {errors['company.name'] && <span className="error-message">{errors['company.name']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="companyWebsite">Company Website</label>
            <input
              type="url"
              id="companyWebsite"
              name="company.website"
              value={formData.company.website}
              onChange={handleChange}
              placeholder="https://company.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyDescription">Company Description</label>
            <textarea
              id="companyDescription"
              name="company.description"
              value={formData.company.description}
              onChange={handleChange}
              placeholder="Brief description of your company..."
              rows="3"
            />
          </div>
        </div>

        {/* Additional Settings */}
        <div className="form-section">
          <h3>Additional Settings</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxApplications">Maximum Applications</label>
              <input
                type="number"
                id="maxApplications"
                name="maxApplications"
                value={formData.maxApplications}
                onChange={handleChange}
                min="1"
                max="1000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="expiresAt">Application Deadline</label>
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
              />
              Mark as urgent hiring
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(config.ROUTES.JOBS)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending ? 'Creating...' : 'Create Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobCreationForm;
