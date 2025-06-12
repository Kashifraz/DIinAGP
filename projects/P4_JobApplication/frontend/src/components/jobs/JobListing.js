import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import jobService from '../../services/jobService';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';

const JobListing = () => {
  const { user } = useAuth();
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    employmentType: '',
    experienceLevel: '',
    isRemote: '',
    minSalary: '',
    maxSalary: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim().length >= 1) {
        setFilters(prev => ({
          ...prev,
          search: searchTerm.trim(),
          page: 1
        }));
      } else if (searchTerm.trim().length === 0) {
        setFilters(prev => ({
          ...prev,
          search: '',
          page: 1
        }));
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch jobs with current filters
  const { data: jobsData, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getJobs(filters),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Restore focus after query completes
  useEffect(() => {
    if (isSearchFocused && searchInputRef.current && !isLoading) {
      searchInputRef.current.focus();
    }
  }, [isLoading, isSearchFocused]);

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'hierarchy'],
    queryFn: () => categoryService.getCategories({ hierarchy: true }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setIsSearchFocused(false);
    setFilters({
      search: '',
      category: '',
      location: '',
      employmentType: '',
      experienceLevel: '',
      isRemote: '',
      minSalary: '',
      maxSalary: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Salary not specified';
    
    const { min, max, currency } = salaryRange;
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `${currency} ${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${currency} ${max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const getExperienceLevelLabel = (level) => {
    const labels = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive'
    };
    return labels[level] || level;
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Jobs</h3>
        <p>{error.message || 'Something went wrong while loading jobs.'}</p>
        <button onClick={() => refetch()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const jobs = jobsData?.data?.jobs || [];
  const pagination = jobsData?.data?.pagination || {};

  return (
    <div className="job-listing">
      <div className="job-listing-header">
        <div className="header-content">
          <h1>Job Opportunities</h1>
          <p>Discover your next career opportunity</p>
        </div>
        
        {user?.role === 'employer' && (
          <div className="header-actions">
            <Link to="/jobs/create" className="btn-primary">
              Post a Job
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              ref={searchInputRef}
              type="text"
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search jobs by title, company, or keywords..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>

        <div className="filters-toggle">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary filter-toggle-btn"
          >
            <svg className="filter-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {renderCategoryOptions(categoriesData?.data)}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="employmentType">Employment Type</label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={filters.employmentType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="experienceLevel">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={filters.experienceLevel}
                  onChange={handleFilterChange}
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="isRemote">Remote Work</label>
                <select
                  id="isRemote"
                  name="isRemote"
                  value={filters.isRemote}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="true">Remote Only</option>
                  <option value="false">On-site Only</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="minSalary">Min Salary</label>
                <input
                  type="number"
                  id="minSalary"
                  name="minSalary"
                  value={filters.minSalary}
                  onChange={handleFilterChange}
                  placeholder="e.g., 50000"
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="maxSalary">Max Salary</label>
                <input
                  type="number"
                  id="maxSalary"
                  name="maxSalary"
                  value={filters.maxSalary}
                  onChange={handleFilterChange}
                  placeholder="e.g., 150000"
                  min="0"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="sortBy">Sort By</label>
                <select
                  id="sortBy"
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                >
                  <option value="createdAt">Date Posted</option>
                  <option value="salary">Salary</option>
                  <option value="views">Most Viewed</option>
                  <option value="title">Job Title</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="sortOrder">Order</label>
                <select
                  id="sortOrder"
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            <div className="filters-actions">
              <button onClick={clearFilters} className="btn-icon-secondary">
                <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                <span>Clear Filters</span>
              </button>
              <button onClick={handleSearch} className="btn-icon-primary">
                <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>
          Showing {jobs.length} of {pagination.totalJobs || 0} jobs
          {filters.search && ` for "${filters.search}"`}
        </p>
      </div>

      {/* Job Cards */}
      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <div className="no-results">
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job._id} className="job-card">
              <div className="job-card-header">
                <div className="job-title-section">
                  <h3>
                    <Link to={`/jobs/${job._id}`} className="job-title-link">
                      {job.title}
                    </Link>
                  </h3>
                  <p className="company-name">{job.company.name}</p>
                </div>
                
                <div className="job-badges">
                  {job.employer?.verificationBadge && (
                    <span className="badge" style={{ background: '#d1e7dd', color: '#0f5132' }}>
                      ✓ Verified Employer
                    </span>
                  )}
                  {job.isUrgent && <span className="badge urgent">Urgent</span>}
                  {job.isRemote && <span className="badge remote">Remote</span>}
                  <span className="badge employment-type">
                    {getEmploymentTypeLabel(job.employmentType)}
                  </span>
                </div>
              </div>

              <div className="job-card-body">
                <p className="job-description">
                  {job.description.length > 200 
                    ? `${job.description.substring(0, 200)}...` 
                    : job.description
                  }
                </p>

                <div className="job-details">
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{job.location}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value">
                      {getExperienceLevelLabel(job.experienceLevel)}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Salary:</span>
                    <span className="detail-value">{formatSalary(job.salaryRange)}</span>
                  </div>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="job-skills">
                    {job.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="skill-tag more">
                        +{job.skills.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="job-card-footer">
                <div className="job-meta">
                  <span className="posted-date">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  {job.expiresAt && (
                    <span className="expires-date">
                      Expires {new Date(job.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="job-actions">
                  <Link to={`/jobs/${job._id}`} className="btn-icon-view">
                    <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="btn-pagination"
          >
            <svg className="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
            <span>Previous</span>
          </button>
          
          <div className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="btn-pagination"
          >
            <span>Next</span>
            <svg className="pagination-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default JobListing;
