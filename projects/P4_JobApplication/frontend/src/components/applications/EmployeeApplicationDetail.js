import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import applicationService from '../../services/applicationService';

const EmployeeApplicationDetail = () => {
  const { applicationId } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplication(applicationId),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => applicationService.withdrawApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'employee'] });
      alert('Application withdrawn successfully');
    },
    onError: (error) => {
      alert(error.message || 'Failed to withdraw application');
    },
  });

  const handleWithdraw = () => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      withdrawMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="loading">Loading application details...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading application: {error.message}</div>;
  }

  const application = data?.data;

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
        {status ? status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
      </span>
    );
  };

  return (
    <div className="application-detail-page">
      <div className="detail-header">
        <Link to="/applications" className="btn-icon-secondary back-button">
          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          <span>Back to Applications</span>
        </Link>
        <h1 className="page-title">Application Details</h1>
      </div>

      {application && (
        <>
          {/* Application Overview */}
          <div className="detail-card">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              Application Overview
            </h2>
            <div className="overview-grid">
              <div className="overview-item">
                <svg className="item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
                </svg>
                <div className="item-content">
                  <span className="item-label">Job Title</span>
                  <span className="item-value">{application.job?.title}</span>
                </div>
              </div>
              <div className="overview-item">
                <svg className="item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div className="item-content">
                  <span className="item-label">Company</span>
                  <span className="item-value">{application.job?.company?.name}</span>
                </div>
              </div>
              <div className="overview-item">
                <svg className="item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <div className="item-content">
                  <span className="item-label">Applied</span>
                  <span className="item-value">{new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="overview-item">
                <svg className="item-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.9 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                <div className="item-content">
                  <span className="item-label">Application #</span>
                  <span className="item-value">{application.applicationNumber}</span>
                </div>
              </div>
            </div>
            
            {application.status !== 'withdrawn' && application.status !== 'rejected' && (
              <div className="withdraw-section">
                <button
                  onClick={handleWithdraw}
                  className="btn-withdraw"
                  disabled={withdrawMutation.isPending}
                >
                  <svg className="withdraw-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  <span>{withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw Application'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="detail-card">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Cover Letter
            </h2>
            <div className="content-box">
              {application.coverLetter}
            </div>
          </div>

          {/* Application Details */}
          <div className="detail-card">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              Application Information
            </h2>
            <div className="info-grid-simple">
              {application.expectedSalary && (
                <div className="info-item-simple">
                  <span className="info-label-simple">Expected Salary</span>
                  <span className="info-value-simple">${application.expectedSalary.toLocaleString()}</span>
                </div>
              )}
              {application.availabilityDate && (
                <div className="info-item-simple">
                  <span className="info-label-simple">Available From</span>
                  <span className="info-value-simple">{new Date(application.availabilityDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="info-item-simple">
                <span className="info-label-simple">Source</span>
                <span className="info-value-simple">{application.source ? application.source.replace('_', ' ') : 'Not specified'}</span>
              </div>
              {application.notes && (
                <div className="info-item-simple full-width">
                  <span className="info-label-simple">Additional Notes</span>
                  <div className="notes-box">
                    {application.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employer Response */}
          {application.employerResponse && (
            <div className="detail-card response-card">
              <h2 className="section-title">
                <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12H7v-2h6v2zm4-4H7V8h10v2z"/>
                </svg>
                Employer Response
              </h2>
              <div className="response-type-badge">
                {application.employerResponse?.type ? application.employerResponse.type.replace('_', ' ').toUpperCase() : 'N/A'}
              </div>
              <div className="response-message-box">
                <div className="response-message">
                  {application.employerResponse.message}
                </div>
              </div>
              {application.employerResponse.interviewDetails && (
                <div className="interview-details-grid">
                  {application.employerResponse.interviewDetails.scheduledDate && (
                    <div className="interview-detail-item">
                      <svg className="detail-icon-small" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                      <div>
                        <span className="detail-label-small">Date</span>
                        <span className="detail-value-small">{new Date(application.employerResponse.interviewDetails.scheduledDate).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  {application.employerResponse.interviewDetails.location && (
                    <div className="interview-detail-item">
                      <svg className="detail-icon-small" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <div>
                        <span className="detail-label-small">Location</span>
                        <span className="detail-value-small">{application.employerResponse.interviewDetails.location}</span>
                      </div>
                    </div>
                  )}
                  {application.employerResponse.interviewDetails.meetingLink && (
                    <div className="interview-detail-item">
                      <svg className="detail-icon-small" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                      </svg>
                      <div>
                        <span className="detail-label-small">Meeting Link</span>
                        <a href={application.employerResponse.interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="link-value">{application.employerResponse.interviewDetails.meetingLink}</a>
                      </div>
                    </div>
                  )}
                  {application.employerResponse.interviewDetails.notes && (
                    <div className="interview-detail-item full-width">
                      <svg className="detail-icon-small" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                      <div>
                        <span className="detail-label-small">Notes</span>
                        <span className="detail-value-small">{application.employerResponse.interviewDetails.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {application.employerResponse.respondedAt && (
                <div className="response-timestamp">
                  <svg className="timestamp-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  Responded: {new Date(application.employerResponse.respondedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Resume Information */}
          <div className="detail-card">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              Resume
            </h2>
            <div className="resume-info">
              <div className="resume-info-item">
                <span className="resume-label">File</span>
                <span className="resume-value">{application.resume?.originalName}</span>
              </div>
              <div className="resume-info-item">
                <span className="resume-label">Size</span>
                <span className="resume-value">{(application.resume?.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="resume-info-item">
                <span className="resume-label">Type</span>
                <span className="resume-value">{application.resume?.mimeType}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeApplicationDetail;
