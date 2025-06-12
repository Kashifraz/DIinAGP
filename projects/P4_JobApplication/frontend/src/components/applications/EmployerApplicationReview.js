import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import applicationService from '../../services/applicationService';
import api from '../../config/api';

const EmployerApplicationReview = () => {
  const { applicationId } = useParams();
  const queryClient = useQueryClient();
  const [responseForm, setResponseForm] = useState({
    type: '',
    message: '',
    interviewDetails: {
      scheduledDate: '',
      location: '',
      meetingLink: '',
      notes: ''
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplication(applicationId),
  });

  const respondMutation = useMutation({
    mutationFn: (responseData) => applicationService.respondToApplication(applicationId, responseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications', 'employer'] });
      alert('Response sent successfully');
      setResponseForm({
        type: '',
        message: '',
        interviewDetails: {
          scheduledDate: '',
          location: '',
          meetingLink: '',
          notes: ''
        }
      });
    },
    onError: (error) => {
      alert(error.message || 'Failed to send response');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, notes }) => applicationService.updateApplicationStatus(applicationId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications', 'employer'] });
    },
  });

  const handleResponseSubmit = (e) => {
    e.preventDefault();
    
    if (!responseForm.type || !responseForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    const responseData = {
      type: responseForm.type,
      message: responseForm.message,
    };

    if (responseForm.type === 'interview_invitation' && responseForm.interviewDetails.scheduledDate) {
      responseData.interviewDetails = responseForm.interviewDetails;
    }

    respondMutation.mutate(responseData);
  };

  const handleStatusUpdate = (status) => {
    if (window.confirm(`Are you sure you want to change the status to "${status}"?`)) {
      updateStatusMutation.mutate({ status });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResponseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterviewDetailsChange = (e) => {
    const { name, value } = e.target;
    setResponseForm(prev => ({
      ...prev,
      interviewDetails: {
        ...prev.interviewDetails,
        [name]: value
      }
    }));
  };

  const handleDownloadResume = async () => {
    try {
      const response = await api.get(`/applications/${applicationId}/resume`, {
        responseType: 'blob'
      });
      
      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response or use a default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'resume.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return <div className="loading">Loading application details...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading application: {error.message}</div>;
  }

  const application = data?.data;

  return (
    <div className="application-review-page">
      <div className="application-review-header">
        <Link to="/dashboard" className="btn-icon-secondary back-button">
          <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="page-title">Application Review</h1>
      </div>

      {application && (
        <div className="application-review-card">
          {/* Candidate Info Section */}
          <div className="review-section">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Candidate Information
            </h2>
            <div className="info-grid">
              <div className="info-item">
                <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <div className="info-content">
                  <span className="info-label">Name</span>
                  <span className="info-value">
                    {application.employee?.profile?.firstName || 'N/A'} {application.employee?.profile?.lastName || ''}
                    {application.employee?.verificationBadge && (
                      <span className="verified-badge-inline">
                        ✓ Verified
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{application.employee?.email || application.employee?.profile?.email || 'N/A'}</span>
                </div>
              </div>
              <div className="info-item">
                <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V9h5.08L7 11.83 8.62 13 11 9.76l1-1.36 1 1.36L15.38 13 17 11.83 14.92 9H20v6z"/>
                </svg>
                <div className="info-content">
                  <span className="info-label">Category</span>
                  <span className="info-value">{application.employee?.profile?.professionalCategory || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Applied For */}
          <div className="review-section">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
              </svg>
              Job Applied For
            </h2>
            <div className="job-details">
              <div className="job-detail-item">
                <span className="detail-label">Title</span>
                <span className="detail-value">{application.job?.title}</span>
              </div>
              <div className="job-detail-item">
                <span className="detail-label">Company</span>
                <span className="detail-value">{application.job?.company?.name}</span>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="review-section">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Cover Letter
            </h2>
            <div className="cover-letter-box">
              {application.coverLetter}
            </div>
          </div>

          {/* Application Details */}
          <div className="review-section">
            <h2 className="section-title">
              <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              Application Details
            </h2>
            <div className="detail-grid">
              <div className="detail-card">
                <span className="detail-label-small">Status</span>
                <span className="detail-value-small">{application.status}</span>
              </div>
              <div className="detail-card">
                <span className="detail-label-small">Applied</span>
                <span className="detail-value-small">{new Date(application.submittedAt).toLocaleDateString()}</span>
              </div>
              {application.expectedSalary && (
                <div className="detail-card">
                  <span className="detail-label-small">Expected Salary</span>
                  <span className="detail-value-small">${application.expectedSalary}</span>
                </div>
              )}
              {application.availabilityDate && (
                <div className="detail-card">
                  <span className="detail-label-small">Available From</span>
                  <span className="detail-value-small">{new Date(application.availabilityDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="download-resume-section">
            <button
              onClick={handleDownloadResume}
              className="btn-icon-primary btn-download-resume"
            >
              <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
              </svg>
              <span>Download Resume</span>
            </button>
          </div>
        </div>
      )}

      {/* Existing Response */}
      {application?.employerResponse && (
        <div className="application-review-card existing-response-card">
          <h2 className="section-title">
            <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            Existing Response
          </h2>
          <div className="response-info-section">
            <div className="response-type-badge">
              {application.employerResponse?.type ? application.employerResponse.type.replace('_', ' ').toUpperCase() : 'RESPONSE'}
            </div>
            <div className="response-message-box">
              <div className="response-message">
                {application.employerResponse.message}
              </div>
            </div>
            {application.employerResponse.interviewDetails && (
              <div className="interview-details-section">
                <div className="interview-detail-grid">
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
        </div>
      )}

      {/* Quick Status Update */}
      <div className="status-update-card">
        <h2 className="section-title">
          <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          Quick Status Update
        </h2>
        <div className="status-button-row">
          <button onClick={() => handleStatusUpdate('under_review')} className="status-btn status-btn-review">
            <svg className="status-btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span>Under Review</span>
          </button>
          <button onClick={() => handleStatusUpdate('shortlisted')} className="status-btn status-btn-shortlist">
            <svg className="status-btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span>Shortlist</span>
          </button>
          <button onClick={() => handleStatusUpdate('rejected')} className="status-btn status-btn-reject">
            <svg className="status-btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* Send Response - Allow employer to send new or update existing response */}
      <div className="application-review-card response-form-card">
        <h2 className="section-title">
          <svg className="section-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          {application?.employerResponse ? 'Update Response' : 'Send Response'}
        </h2>
        {application?.employerResponse && (
          <div className="update-notice">
            <svg className="notice-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span><strong>Note:</strong> This will replace your previous response. You're updating your response to the candidate.</span>
          </div>
        )}
        <form onSubmit={handleResponseSubmit}>
          <div className="form-group">
            <label htmlFor="responseType">Response Type *</label>
            <select
              id="responseType"
              name="type"
              value={responseForm.type}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', fontSize: '1rem' }}
            >
              <option value="">Select response type</option>
              <option value="acceptance">Acceptance / Job Offer</option>
              <option value="rejection">Rejection</option>
              <option value="interview_invitation">Interview Invitation</option>
              <option value="additional_info_requested">Request More Information</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={responseForm.message}
              onChange={handleInputChange}
              rows={6}
              placeholder="Write your response message to the candidate"
              required
              style={{ width: '100%', padding: '10px', fontSize: '1rem' }}
            />
          </div>

          {responseForm.type === 'interview_invitation' && (
            <>
              <div className="form-group">
                <label htmlFor="scheduledDate">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={responseForm.interviewDetails.scheduledDate}
                  onChange={handleInterviewDetailsChange}
                  style={{ width: '100%', padding: '10px', fontSize: '1rem' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Interview Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={responseForm.interviewDetails.location}
                  onChange={handleInterviewDetailsChange}
                  placeholder="e.g., Office address or online"
                  style={{ width: '100%', padding: '10px', fontSize: '1rem' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="meetingLink">Meeting Link (if online)</label>
                <input
                  type="url"
                  id="meetingLink"
                  name="meetingLink"
                  value={responseForm.interviewDetails.meetingLink}
                  onChange={handleInterviewDetailsChange}
                  placeholder="e.g., https://meet.google.com/abc-defg-hij"
                  style={{ width: '100%', padding: '10px', fontSize: '1rem' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="interviewNotes">Additional Notes</label>
                <textarea
                  id="interviewNotes"
                  name="notes"
                  value={responseForm.interviewDetails.notes}
                  onChange={handleInterviewDetailsChange}
                  rows={3}
                  placeholder="Any additional information for the candidate"
                  style={{ width: '100%', padding: '10px', fontSize: '1rem' }}
                />
              </div>
            </>
          )}

          <div className="submit-button-container">
            <button
              type="submit"
              className="btn-icon-primary btn-submit"
              disabled={respondMutation.isPending}
            >
              {respondMutation.isPending ? (
                <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  <circle cx="12" cy="12" r="3" opacity="0.3">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              ) : (
                <svg className="action-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
              <span>
                {respondMutation.isPending 
                  ? application?.employerResponse ? 'Updating...' : 'Sending...' 
                  : application?.employerResponse ? 'Update Response' : 'Send Response'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployerApplicationReview;

