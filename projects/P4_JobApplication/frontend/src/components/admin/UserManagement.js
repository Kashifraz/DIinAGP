import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';

const UserManagement = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    role: '',
    isVerified: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [concernText, setConcernText] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.getAllUsers(filters),
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: (userId) => adminService.toggleUserVerification(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert('User verification status updated successfully!');
    },
    onError: (error) => {
      alert(error.message || 'Failed to update verification status');
    },
  });

  const updateConcernMutation = useMutation({
    mutationFn: ({ userId, concern }) => adminService.updateUserConcern(userId, concern),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert('Admin concern updated successfully!');
      setSelectedUser(null);
      setConcernText('');
    },
    onError: (error) => {
      alert(error.message || 'Failed to update concern');
    },
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleVerification = (userId) => {
    if (window.confirm('Are you sure you want to toggle this user\'s verification status?')) {
      toggleVerificationMutation.mutate(userId);
    }
  };

  const handleOpenConcernModal = (user) => {
    setSelectedUser(user);
    setConcernText(user.adminNotes || '');
  };

  const handleSubmitConcern = (e) => {
    e.preventDefault();
    if (!concernText.trim()) {
      alert('Please enter a concern or note');
      return;
    }
    updateConcernMutation.mutate({ userId: selectedUser.id, concern: concernText });
  };

  if (isLoading) {
    return (
      <div className="page" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <h3>Error Loading Users</h3>
          <p>{error.message || 'Failed to load users'}</p>
        </div>
      </div>
    );
  }

  const users = data?.data?.users || [];
  const total = data?.total || 0;

  return (
    <div className="page">
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2rem', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}>
              User Management
            </h1>
            <p style={{ color: '#666', marginTop: '8px', fontSize: '1.1rem' }}>
              Total Users: <strong style={{ color: '#667eea' }}>{total}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '30px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <h2 style={{ color: '#fff', margin: '0 0 20px 0', fontSize: '1.5rem' }}>Search & Filter</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div className="form-group">
            <label htmlFor="roleFilter" style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Role
            </label>
            <select
              id="roleFilter"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                background: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              <option value="">All Roles</option>
              <option value="employer">Employer</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="isVerifiedFilter" style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Verification Status
            </label>
            <select
              id="isVerifiedFilter"
              name="isVerified"
              value={filters.isVerified}
              onChange={handleFilterChange}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                background: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              <option value="">All Users</option>
              <option value="true">Verified Users</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div style={{ 
          background: '#fff', 
          padding: '60px 40px', 
          borderRadius: '12px', 
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>No users found</h3>
          <p style={{ color: '#666' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '20px',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
        }}>
          {users.map(user => (
            <div 
              key={user.id} 
              style={{ 
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: user.verificationBadge ? '2px solid #28a745' : '2px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}
            >
              {/* User Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#333' }}>
                      {user.profile?.firstName} {user.profile?.lastName}
                      {user.verificationBadge && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '1rem',
                          color: '#28a745'
                        }}>✓</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{ 
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: user.role === 'employer' ? '#e7f1ff' : user.role === 'employee' ? '#d4edda' : '#f8d7da',
                    color: user.role === 'employer' ? '#004085' : user.role === 'employee' ? '#155724' : '#721c24'
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    background: user.verificationBadge ? '#d1e7dd' : '#fff3cd',
                    color: user.verificationBadge ? '#0f5132' : '#856404'
                  }}>
                    {user.verificationBadge ? '✓ Verified' : '⚠ Not Verified'}
                  </span>
                </div>

                {user.adminNotes && (
                  <div style={{
                    background: '#fff3cd',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#856404',
                    borderLeft: '4px solid #ffc107'
                  }}>
                    <strong>Admin Note:</strong> {user.adminNotes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleToggleVerification(user.id)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: user.verificationBadge 
                      ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                      : 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  disabled={toggleVerificationMutation.isPending}
                >
                  {user.verificationBadge ? 'Remove Badge' : 'Verify User'}
                </button>
                <button
                  onClick={() => handleOpenConcernModal(user)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '2px solid #6c757d',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: '#fff',
                    color: '#6c757d'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#6c757d';
                    e.target.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#6c757d';
                  }}
                >
                  📝 Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Concern Modal */}
      {selectedUser && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              margin: '-40px -40px 30px -40px',
              padding: '30px 40px',
              borderRadius: '16px 16px 0 0',
              color: '#fff'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📝 Add Admin Note</h2>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                {selectedUser.profile?.firstName} {selectedUser.profile?.lastName} ({selectedUser.email})
              </p>
            </div>
            
            <form onSubmit={handleSubmitConcern}>
              <div className="form-group">
                <label htmlFor="concern" style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '1rem'
                }}>
                  Admin Note/Concern
                </label>
                <textarea
                  id="concern"
                  name="concern"
                  value={concernText}
                  onChange={(e) => setConcernText(e.target.value)}
                  rows={6}
                  placeholder="Enter your note or concern about this user..."
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    fontSize: '1rem', 
                    border: '2px solid #e9ecef', 
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>
              
              <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={updateConcernMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {updateConcernMutation.isPending ? 'Saving...' : '💾 Save Note'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setConcernText('');
                  }}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '8px',
                    border: '2px solid #6c757d',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: '#fff',
                    color: '#6c757d',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#6c757d';
                    e.target.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#fff';
                    e.target.style.color = '#6c757d';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

