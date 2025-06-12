import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jobService from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';

const JobEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
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

  // Fetch job details
  const { data: jobData, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id),
    enabled: !!id,
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: jobService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update job mutation
  const updateJobMutation = useMutation({
    mutationFn: ({ jobId, jobData }) => jobService.updateJob(jobId, jobData),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['job', id]);
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['myJobs']);
      navigate(`/jobs/${id}`);
    },
    onError: (error) => {
      setErrors(error.errors || {});
    }
  });

  // Populate form when job data is loaded
  useEffect(() => {
    if (jobData?.data?.job) {
      const job = jobData.data.job;
      
      // Check if user is authorized to edit this job
      if (user?.role !== 'employer' || user?.id !== job.employer) {
        navigate('/jobs');
        return;
      }

      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        responsibilities: job.responsibilities || '',
        location: job.location || '',
        employmentType: job.employmentType || 'full-time',
        experienceLevel: job.experienceLevel || 'mid',
        salaryRange: {
          min: job.salaryRange?.min || '',
          max: job.salaryRange?.max || '',
          currency: job.salaryRange?.currency || 'USD'
        },
        category: job.category || '',
        skills: job.skills || [],
        company: {
          name: job.company?.name || '',
          website: job.company?.website || '',
          description: job.company?.description || ''
        },
        isRemote: job.isRemote || false,
        isUrgent: job.isUrgent || false,
        maxApplications: job.maxApplications || 100,
        expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().slice(0, 16) : ''
      });
    }
  }, [jobData, user, navigate]);

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

    updateJobMutation.mutate({ jobId: id, jobData: submitData });
  };

  if (jobLoading || categoriesLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (jobError || !jobData?.data?.job) {
    return (
      <div className="error-container">
        <h3>Job Not Found</h3>
        <p>The job you're trying to edit doesn't exist or you don't have permission to edit it.</p>
        <Link to="/jobs" className="btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const job = jobData.data.job;

  return (
    <div className="job-edit-form">
      <div className="form-header">
        <div className="breadcrumb">
          <Link to="/jobs">Jobs</Link>
          <span className="breadcrumb-separator">›</span>
          <Link to={`/jobs/${id}`}>{job.title}</Link>
          <span className="breadcrumb-separator">›</span>
          <span>Edit</span>
        </div>
        
        <h2>Edit Job Posting</h2>
        <p>Update the details of your job posting</p>
      </div>

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
            >
              <option value="">Select a category</option>
              {categoriesData?.data?.categories?.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
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
                <button type="button" onClick={handleSkillAdd} className="btn-secondary">
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
            onClick={() => navigate(`/jobs/${id}`)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={updateJobMutation.isPending}
          >
            {updateJobMutation.isPending ? 'Updating...' : 'Update Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobEditForm;
