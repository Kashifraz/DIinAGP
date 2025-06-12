import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../services/dashboardService';

const EmployeeDashboard = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['employeeStats'],
    queryFn: dashboardService.getEmployeeStats,
  });

  const stats = statsData?.data || {
    totalApplications: 0,
    statusCounts: {
      submitted: 0,
      under_review: 0,
      shortlisted: 0,
      interview_scheduled: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0
    },
    recentApplications: []
  };

  if (isLoading) {
    return (
      <div className="page" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2.5rem', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          My Dashboard
        </h1>
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '1.1rem' }}>
          Track your job applications and find new opportunities
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <Link to="/jobs" className="btn btn-primary" style={{ marginRight: '12px' }}>
          Browse Jobs
        </Link>
        <Link to="/profile" className="btn btn-secondary">
          Edit Profile
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalApplications}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.statusCounts.submitted}</div>
            <div className="stat-label">Under Review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.statusCounts.shortlisted + stats.statusCounts.interview_scheduled}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.93s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.statusCounts.accepted}</div>
            <div className="stat-label">Accepted</div>
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

      {/* Recent Applications */}
      {stats.recentApplications && stats.recentApplications.length > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
          padding: '30px', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Recent Applications</h2>
            <Link to="/applications" className="btn btn-secondary">
              View All
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '15px' }}>
            {stats.recentApplications.map(application => (
              <Link 
                key={application._id}
                to={`/applications/${application._id}`}
                style={{ 
                  background: '#fff', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '2px solid #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  color: '#333',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e9ecef';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#333' }}>
                    {application.job?.title || 'Job Application'}
                  </h3>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    {application.job?.company?.name || 'Company'} • {application.job?.location || 'Location'}
                  </div>
                </div>
                <div>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: application.status === 'submitted' ? '#fff3cd' : 
                               application.status === 'accepted' ? '#d4edda' : 
                               application.status === 'rejected' ? '#f8d7da' : '#e7f1ff',
                    color: application.status === 'submitted' ? '#856404' : 
                           application.status === 'accepted' ? '#155724' : 
                           application.status === 'rejected' ? '#721c24' : '#004085'
                  }}>
                    {application.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalApplications === 0 && (
        <div style={{ 
          background: '#fff',
          padding: '60px', 
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>No applications yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Start applying to jobs to see your progress here
          </p>
          <Link to="/jobs" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;

