import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import applicationService from '../../services/applicationService';

const EmployerApplicationsList = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, error } = useQuery({
    queryKey: ['applications', 'employer', statusFilter],
    queryFn: () => applicationService.getEmployerApplications({ 
      status: statusFilter === 'all' ? undefined : statusFilter 
    }),
  });

  // Backend returns: { success: true, data: [...], total: ..., etc. }
  // So data?.data is the applications array, not data?.data?.data
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
        <p>Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <h3>Error Loading Applications</h3>
          <p>{error.message || 'Failed to load applications'}</p>
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
            Job Applications
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
              ? "You haven't received any applications yet." 
              : `No applications with status "${statusFilter}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <tr key={application._id}>
                  <td className="candidate-cell">
                    <div className="candidate-info-cell">
                      <svg className="candidate-avatar-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <div className="candidate-details-cell">
                        <div className="candidate-name-cell">
                          {application.employee?.profile?.firstName} {application.employee?.profile?.lastName}
                          {application.employee?.verificationBadge && (
                            <span className="verified-badge-mini">✓</span>
                          )}
                        </div>
                        <div className="candidate-email-cell">{application.employee?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Link to={`/jobs/${application.job?._id}`} className="job-title-link-table">
                      {application.job?.title}
                    </Link>
                  </td>
                  <td className="date-cell">
                    {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>{getStatusBadge(application.status)}</td>
                  <td>
                    <Link to={`/applications/${application._id}/review`} className="btn-icon-view btn-review-table">
                      <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                      <span>Review</span>
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

export default EmployerApplicationsList;

