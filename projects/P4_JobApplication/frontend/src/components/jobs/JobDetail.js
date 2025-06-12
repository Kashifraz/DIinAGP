import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jobService from '../../services/jobService';
import config from '../../config/config';
import { useAuth } from '../../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch job details
  const { data: jobData, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id),
    enabled: !!id,
  });

  // Update job status mutation (for employers)
  const updateStatusMutation = useMutation({
    mutationFn: ({ jobId, status }) => jobService.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['job', id]);
      queryClient.invalidateQueries(['jobs']);
    },
  });

  const job = jobData?.data?.job;

  const handleStatusChange = (newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus} this job?`)) {
      updateStatusMutation.mutate({ jobId: id, status: newStatus });
    }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { label: 'Draft', className: 'status-draft' },
      'active': { label: 'Active', className: 'status-active' },
      'closed': { label: 'Closed', className: 'status-closed' },
      'paused': { label: 'Paused', className: 'status-paused' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'status-unknown' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="error-container">
        <h3>Job Not Found</h3>
        <p>The job you're looking for doesn't exist or has been removed.</p>
        <Link to="/jobs" className="btn-icon-primary">
          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>Browse All Jobs</span>
        </Link>
      </div>
    );
  }

  const isJobOwner = user?.role === 'employer' && user?.id === job.employer;
  const canApply = user?.role === 'employee' && job.status === 'active';

  return (
    <div className="job-detail">
      <div className="job-detail-header">
        <div className="breadcrumb">
          <Link to="/jobs">Jobs</Link>
          <span className="breadcrumb-separator">›</span>
          <span>{job.title}</span>
        </div>

        <div className="job-header-content">
          <div className="job-title-section">
            <h1>{job.title}</h1>
            <div className="job-company">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>{job.company.name}</h2>
                {job.employer?.verificationBadge && (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: '#d1e7dd',
                    color: '#0f5132'
                  }}>
                    ✓ Verified Employer
                  </span>
                )}
              </div>
              {job.company.website && (
                <a 
                  href={job.company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="company-website"
                >
                  Visit Company Website
                </a>
              )}
            </div>
          </div>

          <div className="job-badges">
            {getStatusBadge(job.status)}
            {job.isUrgent && <span className="badge urgent">Urgent</span>}
            {job.isRemote && <span className="badge remote">Remote</span>}
            <span className="badge employment-type">
              {getEmploymentTypeLabel(job.employmentType)}
            </span>
          </div>
        </div>

        <div className="job-meta">
          <div className="meta-item">
            <span className="meta-label">Location:</span>
            <span className="meta-value">{job.location}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Experience Level:</span>
            <span className="meta-value">{getExperienceLevelLabel(job.experienceLevel)}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Salary:</span>
            <span className="meta-value">{formatSalary(job.salaryRange)}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Posted:</span>
            <span className="meta-value">{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
          
          {job.expiresAt && (
            <div className="meta-item">
              <span className="meta-label">Application Deadline:</span>
              <span className="meta-value">{new Date(job.expiresAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="job-detail-content">
        <div className="job-main-content">
          {/* Job Description */}
          <section className="job-section">
            <h3>Job Description</h3>
            <div className="job-description">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Requirements */}
          <section className="job-section">
            <h3>Requirements</h3>
            <div className="job-requirements">
              {job.requirements.split('\n').map((requirement, index) => (
                <p key={index}>{requirement}</p>
              ))}
            </div>
          </section>

          {/* Responsibilities */}
          <section className="job-section">
            <h3>Responsibilities</h3>
            <div className="job-responsibilities">
              {job.responsibilities.split('\n').map((responsibility, index) => (
                <p key={index}>{responsibility}</p>
              ))}
            </div>
          </section>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <section className="job-section">
              <h3>Required Skills</h3>
              <div className="job-skills">
                {job.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Company Information */}
          {job.company.description && (
            <section className="job-section">
              <h3>About {job.company.name}</h3>
              <div className="company-description">
                {job.company.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="job-sidebar">
          {/* Application Actions */}
          <div className="sidebar-section">
            <h4>Apply for this Job</h4>
            {!user ? (
              <div className="auth-prompt">
                <p>Please log in to apply for this job.</p>
                <Link to="/login" className="btn-icon-primary">
                  <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v12z"/>
                  </svg>
                  <span>Log In</span>
                </Link>
              </div>
            ) : user.role === 'employee' ? (
              <div className="application-actions">
                {job.status === 'active' ? (
                  <>
                    <p>Ready to apply?</p>
                    <Link 
                      to={`/jobs/${job._id}/apply`}
                      className="btn-icon-primary btn-full"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                    >
                      <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      <span>Apply Now</span>
                    </Link>
                    <small>
                      Complete the application form to submit your resume.
                    </small>
                  </>
                ) : (
                  <div className="job-closed">
                    <p>This job is no longer accepting applications.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="employer-view">
                <p>You're viewing this as an employer.</p>
                <Link to="/jobs" className="btn-icon-secondary">
                  <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                  <span>Browse Jobs</span>
                </Link>
              </div>
            )}
          </div>

          {/* Job Owner Actions */}
          {isJobOwner && (
            <div className="sidebar-section">
              <h4>Manage Job</h4>
              <div className="owner-actions">
                <Link 
                  to={`/jobs/${job._id}/edit`} 
                  className="btn-icon-secondary btn-full"
                >
                  <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  <span>Edit Job</span>
                </Link>
                
                <div className="status-actions">
                  <h5>Change Status:</h5>
                  {job.status !== 'active' && (
                    <button
                      onClick={() => handleStatusChange('active')}
                      className="btn-icon-success btn-sm"
                      disabled={updateStatusMutation.isPending}
                    >
                      <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Activate</span>
                    </button>
                  )}
                  {job.status !== 'closed' && (
                    <button
                      onClick={() => handleStatusChange('closed')}
                      className="btn-icon-danger btn-sm"
                      disabled={updateStatusMutation.isPending}
                    >
                      <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                      <span>Close</span>
                    </button>
                  )}
                  {job.status !== 'paused' && (
                    <button
                      onClick={() => handleStatusChange('paused')}
                      className="btn-icon-warning btn-sm"
                      disabled={updateStatusMutation.isPending}
                    >
                      <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                      <span>Pause</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Job Statistics */}
          <div className="sidebar-section">
            <h4>Job Statistics</h4>
            <div className="job-stats">
              <div className="stat-item">
                <span className="stat-label">Views:</span>
                <span className="stat-value">{job.views || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Applications:</span>
                <span className="stat-value">{job.applicationCount || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max Applications:</span>
                <span className="stat-value">{job.maxApplications}</span>
              </div>
            </div>
          </div>

          {/* Share Job */}
          <div className="sidebar-section">
            <h4>Share this Job</h4>
            <div className="share-actions">
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="btn-icon-secondary btn-sm"
              >
                <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default JobDetail;
