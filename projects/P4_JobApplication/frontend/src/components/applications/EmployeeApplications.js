import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import applicationService from '../../services/applicationService';

const EmployeeApplications = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, error } = useQuery({
    queryKey: ['applications', 'employee', statusFilter],
    queryFn: () => applicationService.getEmployeeApplications({ status: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const applications = data?.data || [];
  const total = data?.total || 0;

  const getStatusBadge = (status) => {
    const styles = {
      submitted: { background: '#cfe2ff', color: '#084298' },
      under_review: { background: '#fff3cd', color: '#856404' },
      shortlisted: { background: '#d1e7dd', color: '#0f5132' },
      interview_scheduled: { background: '#d0dbf4', color: '#1e40af' },
      accepted: { background: '#d1e7dd', color: '#0f5132' },
      rejected: { background: '#f8d7da', color: '#721c24' },
      withdrawn: { background: '#e2e3e5', color: '#41464b' },
    };
    
    const style = styles[status] || { background: '#e2e3e5', color: '#41464b' };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.85rem',
        fontWeight: '500',
        ...style
      }}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="page" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <h3>Error Loading Applications</h3>
          <p>{error.message || 'Failed to load your applications'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-list-page">
      <div className="applications-header">
        <div className="header-content">
          <h1 className="page-title">
            <svg className="title-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            My Applications
            <span className="count-badge">{total}</span>
          </h1>
        </div>
        <div className="filter-wrapper">
          <svg className="filter-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
          </svg>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Applications</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <h3>No applications found</h3>
          <p>
            {statusFilter === 'all' 
              ? "You haven't applied for any jobs yet." 
              : `No applications with status "${statusFilter}" found.`
            }
          </p>
          <Link to="/jobs" className="btn-icon-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>
            <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Browse Jobs</span>
          </Link>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <tr key={application._id}>
                  <td>
                    <div className="job-info-cell">
                      <svg className="job-icon-small" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
                      </svg>
                      <Link to={`/jobs/${application.job?._id}`} className="job-title-link-table">
                        {application.job?.title}
                      </Link>
                    </div>
                  </td>
                  <td className="company-cell">{application.job?.company?.name || 'N/A'}</td>
                  <td className="date-cell">
                    {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>{getStatusBadge(application.status)}</td>
                  <td>
                    <Link to={`/applications/${application._id}`} className="btn-review-table">
                      <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeApplications;

