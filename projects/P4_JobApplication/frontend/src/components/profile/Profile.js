import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => userService.getProfile(),
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      alert(error.message || 'Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data) => userService.updatePassword(data),
    onSuccess: () => {
      alert('Password updated successfully!');
      setActiveTab('profile');
    },
    onError: (error) => {
      alert(error.message || 'Failed to update password');
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: (file) => userService.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      alert('Profile picture updated successfully!');
    },
    onError: (error) => {
      alert(error.message || 'Failed to upload profile picture');
    },
  });

  const [profileFormData, setProfileFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
    professionalCategory: '',
  });

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Initialize form when profile data loads
  React.useEffect(() => {
    if (profileData?.data?.user) {
      const profile = profileData.data.user.profile;
      setProfileFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
        professionalCategory: profile.professionalCategory || '',
      });
      setPreviewUrl(profile.avatar || '');
    }
  }, [profileData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      firstName: profileFormData.firstName,
      lastName: profileFormData.lastName,
      phone: profileFormData.phone || '',
    };

    // Add role-specific fields
    if (user?.role === 'employer') {
      payload.organization = profileFormData.organization || '';
    }
    if (user?.role === 'employee') {
      payload.professionalCategory = profileFormData.professionalCategory || '';
    }

    updateProfileMutation.mutate(payload);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: passwordFormData.currentPassword,
      newPassword: passwordFormData.newPassword,
      confirmPassword: passwordFormData.confirmPassword,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPicture = () => {
    if (!selectedFile) {
      alert('Please select an image file');
      return;
    }
    
    uploadPictureMutation.mutate(selectedFile);
  };

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <h3>Error Loading Profile</h3>
          <p>{error.message || 'Failed to load profile'}</p>
        </div>
      </div>
    );
  }

  const profile = profileData?.data?.user;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-header">Profile Settings</h1>

        {/* Profile Info Display */}
        <div className="profile-card">
          <div className="profile-info-section">
            <div className="profile-avatar-section">
              <img 
                src={profile?.profile?.avatar ? `http://localhost:5000/${profile.profile.avatar}` : '/default-avatar.png'} 
                alt="Profile" 
                className="profile-avatar-large"
              />
              <div className="profile-badge">
                {profile?.email}
              </div>
              <div className="profile-role-badge">
                {user?.role?.toUpperCase()}
              </div>
            </div>
            <div className="profile-details-section">
              <h2 className="profile-name">
                {profile?.profile?.firstName} {profile?.profile?.lastName}
                {user?.verificationBadge && <span className="verified-check">✓</span>}
              </h2>
              
              <div className="profile-info-grid">
                {profile?.profile?.phone && (
                  <div className="info-item">
                    <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    <div>
                      <span className="info-label">Phone</span>
                      <span className="info-value">{profile.profile.phone}</span>
                    </div>
                  </div>
                )}
                
                {profile?.profile?.organization && (
                  <div className="info-item">
                    <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                    </svg>
                    <div>
                      <span className="info-label">Organization</span>
                      <span className="info-value">{profile.profile.organization}</span>
                    </div>
                  </div>
                )}
                
                {profile?.profile?.professionalCategory && (
                  <div className="info-item">
                    <svg className="info-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                    </svg>
                    <div>
                      <span className="info-label">Category</span>
                      <span className="info-value">{profile.profile.professionalCategory}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>Profile</span>
          </button>
          <button
            className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <span>Password</span>
          </button>
          <button
            className={`profile-tab ${activeTab === 'picture' ? 'active' : ''}`}
            onClick={() => setActiveTab('picture')}
          >
            <svg className="tab-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6.5 0c-.83 0-1.5-.67-1.5-1.5 0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM9 16.5c-.83 0-1.5-.67-1.5-1.5S8.17 13.5 9 13.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-5 0c-.83 0-1.5-.67-1.5-1.5S3.17 13.5 4 13.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
            <span>Photo</span>
          </button>
        </div>

        {/* Profile Update Form */}
        {activeTab === 'profile' && (
          <div className="profile-form-card">
            <h2 className="form-section-title">Update Profile</h2>
            <form onSubmit={handleProfileSubmit} className="modern-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileFormData.firstName}
                    onChange={handleProfileChange}
                    className="modern-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileFormData.lastName}
                    onChange={handleProfileChange}
                    className="modern-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileFormData.phone}
                  onChange={handleProfileChange}
                  placeholder="+1234567890"
                  className="modern-input"
                />
              </div>
              {user?.role === 'employer' && (
                <div className="form-group">
                  <label htmlFor="organization">Organization</label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={profileFormData.organization}
                    onChange={handleProfileChange}
                    className="modern-input"
                  />
                </div>
              )}
              {user?.role === 'employee' && (
                <div className="form-group">
                  <label htmlFor="professionalCategory">Professional Category</label>
                  <input
                    type="text"
                    id="professionalCategory"
                    name="professionalCategory"
                    value={profileFormData.professionalCategory}
                    onChange={handleProfileChange}
                    className="modern-input"
                  />
                </div>
              )}
              <button
                type="submit"
                className="btn-modern btn-primary"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Password Update Form */}
        {activeTab === 'password' && (
          <div className="profile-form-card">
            <h2 className="form-section-title">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="modern-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordFormData.currentPassword}
                  onChange={handlePasswordChange}
                  className="modern-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  className="modern-input"
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="modern-input"
                  required
                  minLength="6"
                />
              </div>
              <button
                type="submit"
                className="btn-modern btn-primary"
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Profile Picture Upload */}
        {activeTab === 'picture' && (
          <div className="profile-form-card">
            <h2 className="form-section-title">Update Profile Picture</h2>
            <div className="upload-section">
              <div className="upload-preview">
                {previewUrl || profile?.profile?.avatar ? (
                  <img 
                    src={previewUrl || `http://localhost:5000/${profile.profile.avatar}`} 
                    alt="Preview" 
                    className="upload-image"
                  />
                ) : (
                  <div className="dummy-avatar">
                    <svg className="avatar-placeholder-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="upload-controls">
                <div className="form-group">
                  <label htmlFor="avatar">Select Image</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="avatar"
                      name="avatar"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="avatar" className="file-input-label">
                      <svg className="upload-icon" viewBox="0 0 24 24" fill="white">
                        <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                      </svg>
                      <div>
                        <span className="file-input-text">
                          {selectedFile ? selectedFile.name : 'Choose file to upload'}
                        </span>
                        <span className="file-input-hint">Click to browse or drag and drop</span>
                      </div>
                    </label>
                  </div>
                  <small className="file-constraints">Maximum file size: 5MB. Accepted formats: JPEG, PNG, GIF</small>
                </div>
                <button
                  type="button"
                  className="btn-modern btn-primary"
                  onClick={handleUploadPicture}
                  disabled={!selectedFile || uploadPictureMutation.isPending}
                >
                  {uploadPictureMutation.isPending ? 'Uploading...' : 'Upload Picture'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

