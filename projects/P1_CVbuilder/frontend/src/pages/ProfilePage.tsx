import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, FileText, Linkedin, Github, Globe, Save, Loader2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import PhotoUpload from '../components/Profile/PhotoUpload';
import ProfileCompletion from '../components/Profile/ProfileCompletion';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { state, actions } = useProfile();
  const { profile, loading, updating, error } = state;
  const { updateProfile } = actions;

  const [formData, setFormData] = useState({
    fullName: '',
    professionalTitle: '',
    phone: '',
    location: '',
    bio: '',
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        professionalTitle: profile.professionalTitle || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        socialLinks: {
          linkedin: profile.socialLinks?.linkedin || '',
          github: profile.socialLinks?.github || '',
          portfolio: profile.socialLinks?.portfolio || '',
        },
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateFullName = (name: string): string | null => {
    if (name.trim() && name.trim().length < 2) return 'Full name must be at least 2 characters';
    if (name.trim() && name.trim().length > 50) return 'Full name cannot exceed 50 characters';
    return null;
  };

  const validateSocialLinks = (links: typeof formData.socialLinks): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (links.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(links.linkedin)) {
      errors['socialLinks.linkedin'] = 'Please provide a valid LinkedIn URL';
    }
    
    if (links.github && !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/.test(links.github)) {
      errors['socialLinks.github'] = 'Please provide a valid GitHub URL';
    }
    
    if (links.portfolio && !/^https?:\/\/.+/.test(links.portfolio)) {
      errors['socialLinks.portfolio'] = 'Please provide a valid portfolio URL';
    }
    
    return errors;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;

    // Validate other fields
    if (formData.professionalTitle && formData.professionalTitle.length > 100) {
      newErrors.professionalTitle = 'Professional title cannot exceed 100 characters';
    }

    if (formData.phone && !/^[+]?[1-9]\d{0,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please provide a valid phone number';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Bio cannot exceed 1000 characters';
    }

    // Validate social links
    const socialErrors = validateSocialLinks(formData.socialLinks);
    Object.assign(newErrors, socialErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Filter out empty fields before sending to backend
    const filteredData: Record<string, any> = {};
    
    // Add non-empty fields
    if (formData.fullName.trim()) {
      filteredData.fullName = formData.fullName.trim();
    }
    if (formData.professionalTitle.trim()) {
      filteredData.professionalTitle = formData.professionalTitle.trim();
    }
    if (formData.phone.trim()) {
      filteredData.phone = formData.phone.trim();
    }
    if (formData.location.trim()) {
      filteredData.location = formData.location.trim();
    }
    if (formData.bio.trim()) {
      filteredData.bio = formData.bio.trim();
    }

    // Handle social links
    const socialLinks: Record<string, string> = {};
    if (formData.socialLinks.linkedin.trim()) {
      socialLinks.linkedin = formData.socialLinks.linkedin.trim();
    }
    if (formData.socialLinks.github.trim()) {
      socialLinks.github = formData.socialLinks.github.trim();
    }
    if (formData.socialLinks.portfolio.trim()) {
      socialLinks.portfolio = formData.socialLinks.portfolio.trim();
    }

    // Only add socialLinks if it has content
    if (Object.keys(socialLinks).length > 0) {
      filteredData.socialLinks = socialLinks;
    }

    const success = await updateProfile(filteredData);
    
    if (success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading profile: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
          <p className="text-gray-600">Manage your personal information and professional details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>💡 All fields are optional!</strong> Fill in what you're comfortable sharing. 
                  You can always come back and update your profile later. The completion percentage 
                  will help you track your progress.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-3">
                    Profile Photo
                  </div>
                  <PhotoUpload />
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.fullName ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="form-error">{errors.fullName}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="form-input pl-10 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <p className="form-help">Email cannot be changed. Contact support if needed.</p>
                </div>

                {/* Professional Title */}
                <div>
                  <label htmlFor="professionalTitle" className="form-label">
                    Professional Title
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="professionalTitle"
                      name="professionalTitle"
                      type="text"
                      value={formData.professionalTitle}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.professionalTitle ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="e.g., Senior Software Developer"
                    />
                  </div>
                  {errors.professionalTitle && (
                    <p className="form-error">{errors.professionalTitle}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.phone ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="form-error">{errors.phone}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="form-label">
                    Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.location ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="City, State, Country"
                    />
                  </div>
                  {errors.location && (
                    <p className="form-error">{errors.location}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="form-label">
                    Bio / Professional Summary
                  </label>
                  <div className="relative w-full">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className={`form-textarea pl-10 w-full ${errors.bio ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                      placeholder="Tell us about yourself, your experience, and what makes you unique..."
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    {errors.bio ? (
                      <p className="form-error">{errors.bio}</p>
                    ) : (
                      <p className="form-help">Brief professional summary (max 1000 characters)</p>
                    )}
                    <span className="text-sm text-gray-500">
                      {formData.bio.length}/1000
                    </span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
                  
                  {/* LinkedIn */}
                  <div>
                    <label htmlFor="socialLinks.linkedin" className="form-label">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Linkedin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="socialLinks.linkedin"
                        name="socialLinks.linkedin"
                        type="url"
                        value={formData.socialLinks.linkedin}
                        onChange={handleInputChange}
                        className={`form-input pl-10 ${errors['socialLinks.linkedin'] ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    {errors['socialLinks.linkedin'] && (
                      <p className="form-error">{errors['socialLinks.linkedin']}</p>
                    )}
                  </div>

                  {/* GitHub */}
                  <div>
                    <label htmlFor="socialLinks.github" className="form-label">
                      GitHub Profile
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Github className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="socialLinks.github"
                        name="socialLinks.github"
                        type="url"
                        value={formData.socialLinks.github}
                        onChange={handleInputChange}
                        className={`form-input pl-10 ${errors['socialLinks.github'] ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    {errors['socialLinks.github'] && (
                      <p className="form-error">{errors['socialLinks.github']}</p>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label htmlFor="socialLinks.portfolio" className="form-label">
                      Portfolio Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="socialLinks.portfolio"
                        name="socialLinks.portfolio"
                        type="url"
                        value={formData.socialLinks.portfolio}
                        onChange={handleInputChange}
                        className={`form-input pl-10 ${errors['socialLinks.portfolio'] ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    {errors['socialLinks.portfolio'] && (
                      <p className="form-error">{errors['socialLinks.portfolio']}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Profile Completion Sidebar */}
          <div className="lg:col-span-1">
            <ProfileCompletion />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;