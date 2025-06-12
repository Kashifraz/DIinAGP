import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jobService from '../../services/jobService';
import dashboardService from '../../services/dashboardService';

const EmployerDashboard = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['employerStats'],
    queryFn: dashboardService.getEmployerStats,
  });

  // Fetch employer's jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['myJobs'],
    queryFn: jobService.getMyJobs,
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: jobService.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  // Update job status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ jobId, status }) => jobService.updateJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const jobs = jobsData?.data?.jobs || [];
  const stats = statsData?.data || {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    statusCounts: {
      submitted: 0,
      under_review: 0,
      shortlisted: 0,
      interview_scheduled: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0
    }
  };

  const handleDeleteJob = (jobId, jobTitle) => {
    if (window.confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleStatusChange = (jobId, newStatus) => {
    updateStatusMutation.mutate({ jobId, status: newStatus });
  };

  const filteredJobs = statusFilter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === statusFilter);

  if (statsLoading || jobsLoading) {
    return (
      <div className="page" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.5rem', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Dashboard
          </h1>
          <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '1.1rem' }}>
            Manage your job postings and applications
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/applications" className="btn btn-secondary">
            View Applications
          </Link>
          <Link to="/jobs/create" className="btn btn-primary">
            Post New Job
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalJobs}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.54.23-.58.46l-.95 6.41c-.08.54.19 1.06.65 1.26.46.21 1.06.15 1.51-.21l4.99-4.58c.3-.27.38-.69.22-1.05l-1.11-2.28L13 18l4.44 2.26c.46.22.97.14 1.35-.15.37-.29.58-.75.54-1.27l-.5-6.07z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeJobs}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalApplications}</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.statusCounts.shortlisted + stats.statusCounts.interview_scheduled}</div>
            <div className="stat-label">In Review</div>
          </div>
        </div>
      </div>

      {/* Application Status Breakdown */}
      {stats.totalApplications > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
          padding: '30px', 
          borderRadius: '16px', 
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#333' }}>Application Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} style={{ 
                background: '#fff', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #e9ecef',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                  {count}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'capitalize' }}>
                  {status.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Management Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        padding: '30px', 
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Your Job Postings</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ 
              padding: '12px 20px', 
              fontSize: '1rem', 
              border: '2px solid #667eea', 
              borderRadius: '8px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Jobs ({jobs.length})</option>
            <option value="active">Active ({jobs.filter(j => j.status === 'active').length})</option>
            <option value="draft">Draft ({jobs.filter(j => j.status === 'draft').length})</option>
            <option value="closed">Closed ({jobs.filter(j => j.status === 'closed').length})</option>
          </select>
        </div>

        {filteredJobs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>No jobs found</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>You haven't posted any jobs yet.</p>
            <Link to="/jobs/create" className="btn btn-primary" style={{ display: 'inline-block' }}>
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredJobs.map(job => (
              <div key={job._id} style={{ 
                background: '#fff', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e9ecef';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ flex: 1 }}>
                  <Link to={`/jobs/${job._id}`} style={{ color: '#333', textDecoration: 'none' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#333' }}>
                      {job.title}
                    </h3>
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                      {job.company?.name || 'Company'} • {job.location}
                    </div>
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: job.status === 'active' ? '#d4edda' : job.status === 'draft' ? '#fff3cd' : '#f8d7da',
                    color: job.status === 'active' ? '#155724' : job.status === 'draft' ? '#856404' : '#721c24'
                  }}>
                    {job.status}
                  </span>
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job._id, e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      fontSize: '0.9rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                  <Link 
                    to={`/jobs/${job._id}/edit`} 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job._id, job.title)}
                    className="btn btn-danger"
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
