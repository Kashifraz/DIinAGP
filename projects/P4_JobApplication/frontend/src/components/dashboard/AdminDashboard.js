import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dashboardService from '../../services/dashboardService';

const AdminDashboard = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: dashboardService.getAdminStats,
  });

  const stats = statsData?.data || {
    totalUsers: 0,
    roleCounts: {
      employee: 0,
      employer: 0,
      admin: 0
    },
    verifiedUsers: 0,
    activeJobs: 0,
    totalJobs: 0,
    totalApplications: 0,
    recentUsers: [],
    recentJobs: []
  };

  if (isLoading) {
    return (
      <div className="page" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
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
          Admin Dashboard
        </h1>
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '1.1rem' }}>
          System overview and management
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '12px' }}>
        <Link to="/admin/categories" className="btn btn-secondary">
          Manage Categories
        </Link>
        <Link to="/admin/users" className="btn btn-secondary">
          Manage Users
        </Link>
      </div>

      {/* Main Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7c0 2.21 1.79 4 4 4s4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg className="stat-icon-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
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
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.verifiedUsers}</div>
            <div className="stat-label">Verified Users</div>
          </div>
        </div>
      </div>

      {/* User Breakdown */}
      <div style={{ 
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        padding: '30px', 
        borderRadius: '16px', 
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#333' }}>Users by Role</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div style={{ 
            background: '#fff', 
            padding: '20px', 
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
              {stats.roleCounts.employee}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Employees</div>
          </div>

          <div style={{ 
            background: '#fff', 
            padding: '20px', 
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f5576c', marginBottom: '8px' }}>
              {stats.roleCounts.employer}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Employers</div>
          </div>

          <div style={{ 
            background: '#fff', 
            padding: '20px', 
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4facfe', marginBottom: '8px' }}>
              {stats.roleCounts.admin}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Admins</div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Recent Users */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
          padding: '30px', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#333' }}>Recent Users</h2>
          {stats.recentUsers && stats.recentUsers.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {stats.recentUsers.map(user => (
                <div key={user._id} style={{ 
                  background: '#fff', 
                  padding: '15px', 
                  borderRadius: '12px',
                  border: '2px solid #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#333' }}>
                      {user.profile?.firstName} {user.profile?.lastName}
                      {user.verificationBadge && (
                        <span style={{ marginLeft: '8px', color: '#28a745' }}>✓</span>
                      )}
                    </h3>
                    <div style={{ color: '#666', fontSize: '0.85rem' }}>{user.email}</div>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: user.role === 'employer' ? '#e7f1ff' : user.role === 'employee' ? '#d4edda' : '#f8d7da',
                    color: user.role === 'employer' ? '#004085' : user.role === 'employee' ? '#155724' : '#721c24'
                  }}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center' }}>No recent users</p>
          )}
        </div>

        {/* Recent Jobs */}
        <div style={{ 
          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
          padding: '30px', 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#333' }}>Recent Jobs</h2>
          {stats.recentJobs && stats.recentJobs.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {stats.recentJobs.map(job => (
                <Link 
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  style={{ 
                    background: '#fff', 
                    padding: '15px', 
                    borderRadius: '12px',
                    border: '2px solid #e9ecef',
                    textDecoration: 'none',
                    color: '#333',
                    display: 'block',
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
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#333' }}>
                    {job.title}
                  </h3>
                  <div style={{ color: '#666', fontSize: '0.85rem' }}>
                    {job.employer?.profile?.organization || job.employer?.email || 'Company'}
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: job.status === 'active' ? '#d4edda' : job.status === 'draft' ? '#fff3cd' : '#f8d7da',
                    color: job.status === 'active' ? '#155724' : job.status === 'draft' ? '#856404' : '#721c24',
                    display: 'inline-block',
                    marginTop: '8px'
                  }}>
                    {job.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', textAlign: 'center' }}>No recent jobs</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

