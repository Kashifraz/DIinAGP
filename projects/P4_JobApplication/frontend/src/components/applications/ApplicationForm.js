import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import applicationService from '../../services/applicationService';
import jobService from '../../services/jobService';

const ApplicationForm = () => {
  const { id: jobId } = useParams(); // Get job ID from route params (renamed from 'id' to 'jobId')
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availabilityDate: '',
    source: 'direct',
    notes: '',
  });

  const { data: jobData, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJobById(jobId),
    enabled: !!jobId, // Only run query if jobId is defined
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('job', jobId);
      formDataToSend.append('coverLetter', formData.coverLetter);
      formDataToSend.append('resume', file);
      if (formData.expectedSalary) formDataToSend.append('expectedSalary', formData.expectedSalary);
      if (formData.availabilityDate) formDataToSend.append('availabilityDate', formData.availabilityDate);
      formDataToSend.append('source', formData.source);
      if (formData.notes) formDataToSend.append('notes', formData.notes);

      return applicationService.submitApplication(formDataToSend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'employee'] });
      navigate('/applications', { state: { message: 'Application submitted successfully!' } });
    },
    onError: (error) => {
      console.error('Application submission error:', error);
      alert(error.message || 'Failed to submit application');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please upload a PDF or Word document');
        return;
      }
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!jobId) {
      alert('Invalid job ID. Please try again.');
      navigate('/jobs');
      return;
    }
    
    if (!file) {
      alert('Please upload your resume');
      return;
    }

    if (!formData.coverLetter || formData.coverLetter.length < 50) {
      alert('Cover letter must be at least 50 characters long');
      return;
    }

    submitApplicationMutation.mutate();
  };

  if (jobLoading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (!jobId) {
    return (
      <div className="page">
        <div className="error-message">
          <h2>Invalid Job</h2>
          <p>No job ID was provided. Please try again.</p>
          <button onClick={() => navigate('/jobs')} className="btn btn-primary">
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="page">
        <div className="error-message">
          <h2>Error Loading Job</h2>
          <p>{jobError.message || 'Failed to load job details'}</p>
          <button onClick={() => navigate('/jobs')} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const job = jobData?.data?.job;

  return (
    <div className="page">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1>Apply for {job?.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <p style={{ margin: 0 }}>Company: {job?.company?.name}</p>
          {job?.employer?.verificationBadge && (
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
        <p>Location: {job?.location}</p>

        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <div className="form-group">
            <label htmlFor="coverLetter">Cover Letter *</label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              rows={10}
              placeholder="Write your cover letter explaining why you're a good fit for this position (minimum 50 characters)"
              required
            />
            <small>Minimum 50 characters required</small>
          </div>

          <div className="form-group">
            <label htmlFor="resume">Resume (PDF or Word) *</label>
            <input
              type="file"
              id="resume"
              name="resume"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              required
            />
            {file && <p>Selected: {file.name}</p>}
            <small>Maximum file size: 5MB. Accepted formats: PDF, DOC, DOCX</small>
          </div>

          <div className="form-group">
            <label htmlFor="expectedSalary">Expected Salary</label>
            <input
              type="number"
              id="expectedSalary"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              placeholder="e.g., 50000"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="availabilityDate">Availability Date</label>
            <input
              type="date"
              id="availabilityDate"
              name="availabilityDate"
              value={formData.availabilityDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">How did you hear about us?</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              <option value="direct">Direct Application</option>
              <option value="job_board">Job Board</option>
              <option value="referral">Referral</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information you'd like to share"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitApplicationMutation.isPending}
            >
              {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;

