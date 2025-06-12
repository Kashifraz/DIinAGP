import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/helpers';
import config from '../../config/config';

const RegisterForm = ({ onSwitchToLogin }) => {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      organization: '',
      professionalCategory: ''
    }
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) errors.email = 'Please enter a valid email address';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.profile.firstName) errors['profile.firstName'] = 'First name is required';
    if (!formData.profile.lastName) errors['profile.lastName'] = 'Last name is required';
    if (formData.role === 'employer' && !formData.profile.organization) errors['profile.organization'] = 'Organization name is required for employers';
    if (formData.role === 'employee' && !formData.profile.professionalCategory) errors['profile.professionalCategory'] = 'Professional category is required for employees';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await register(userData);
      // Redirect based on user role
      if (response?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(config.ROUTES.DASHBOARD);
      }
    } catch (err) {
      // Error is handled by AuthContext and displayed
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-form">
      <h2>Create Your Account</h2>
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="role">Account Type</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="employee">Employee</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={validationErrors.email ? 'error' : ''}
            placeholder="Enter your email"
            disabled={loading}
          />
          {validationErrors.email && (
            <span className="field-error">{validationErrors.email}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={validationErrors.password ? 'error' : ''}
            placeholder="Create a password"
            disabled={loading}
          />
          {validationErrors.password && (
            <span className="field-error">{validationErrors.password}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={validationErrors.confirmPassword ? 'error' : ''}
            placeholder="Confirm your password"
            disabled={loading}
          />
          {validationErrors.confirmPassword && (
            <span className="field-error">{validationErrors.confirmPassword}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="profile.firstName"
            value={formData.profile.firstName}
            onChange={handleChange}
            className={validationErrors['profile.firstName'] ? 'error' : ''}
            placeholder="Enter your first name"
            disabled={loading}
          />
          {validationErrors['profile.firstName'] && (
            <span className="field-error">{validationErrors['profile.firstName']}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="profile.lastName"
            value={formData.profile.lastName}
            onChange={handleChange}
            className={validationErrors['profile.lastName'] ? 'error' : ''}
            placeholder="Enter your last name"
            disabled={loading}
          />
          {validationErrors['profile.lastName'] && (
            <span className="field-error">{validationErrors['profile.lastName']}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="profile.phone"
            value={formData.profile.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            disabled={loading}
          />
        </div>
        {formData.role === 'employer' && (
          <div className="form-group">
            <label htmlFor="organization">Organization Name</label>
            <input
              type="text"
              id="organization"
              name="profile.organization"
              value={formData.profile.organization}
              onChange={handleChange}
              className={validationErrors['profile.organization'] ? 'error' : ''}
              placeholder="Enter your organization name"
              disabled={loading}
            />
            {validationErrors['profile.organization'] && (
              <span className="field-error">{validationErrors['profile.organization']}</span>
            )}
          </div>
        )}
        {formData.role === 'employee' && (
          <div className="form-group">
            <label htmlFor="professionalCategory">Professional Category</label>
            <select
              id="professionalCategory"
              name="profile.professionalCategory"
              value={formData.profile.professionalCategory}
              onChange={handleChange}
              className={validationErrors['profile.professionalCategory'] ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Select a category</option>
              <option value="Software Development">Software Development</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Design">Design</option>
              <option value="Operations">Operations</option>
              <option value="Customer Service">Customer Service</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
            </select>
            {validationErrors['profile.professionalCategory'] && (
              <span className="field-error">{validationErrors['profile.professionalCategory']}</span>
            )}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <div className="auth-switch">
        <p>
          Already have an account?{' '}
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;