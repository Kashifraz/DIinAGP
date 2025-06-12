import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, MapPin, Building2, Briefcase } from 'lucide-react';
import { Experience, CreateExperienceData, UpdateExperienceData } from '../../services/experienceService';

interface ExperienceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExperienceData | UpdateExperienceData) => Promise<boolean>;
  experience?: Experience | null;
  loading?: boolean;
}

const ExperienceFormModal: React.FC<ExperienceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  experience,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateExperienceData>({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    achievements: [],
    skills: [],
    employmentType: 'full-time',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAchievement, setNewAchievement] = useState('');
  const [newSkill, setNewSkill] = useState('');

  // Initialize form data when experience changes
  useEffect(() => {
    if (experience) {
      setFormData({
        company: experience.company || '',
        position: experience.position || '',
        location: experience.location || '',
        startDate: experience.startDate ? experience.startDate.split('T')[0] : '',
        endDate: experience.endDate ? experience.endDate.split('T')[0] : '',
        isCurrent: experience.isCurrent || false,
        description: experience.description || '',
        achievements: experience.achievements || [],
        skills: experience.skills || [],
        employmentType: experience.employmentType || 'full-time',
      });
    } else {
      setFormData({
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        achievements: [],
        skills: [],
        employmentType: 'full-time',
      });
    }
    setErrors({});
  }, [experience, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        // Clear end date if marking as current
        ...(name === 'isCurrent' && checked ? { endDate: '' } : {})
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addAchievement = (): void => {
    if (newAchievement.trim() && (formData.achievements?.length || 0) < 10) {
      setFormData(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index)
    }));
  };

  const addSkill = (): void => {
    if (newSkill.trim() && (formData.skills?.length || 0) < 20) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (new Date(formData.startDate) > new Date()) {
      newErrors.startDate = 'Start date cannot be in the future';
    }

    if (!formData.isCurrent && !formData.endDate) {
      newErrors.endDate = 'End date is required for completed experience';
    }

    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.isCurrent && formData.endDate) {
      newErrors.endDate = 'Current experience cannot have an end date';
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      achievements: (formData.achievements || []).filter(a => a.trim()),
      skills: (formData.skills || []).filter(s => s.trim()),
    };

    const success = await onSubmit(submitData);
    if (success) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {experience ? 'Edit Work Experience' : 'Add Work Experience'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Company and Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.company ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter company name"
                  disabled={loading}
                />
              </div>
              {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Position Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.position ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter position title"
                  disabled={loading}
                />
              </div>
              {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
            </div>
          </div>

          {/* Location and Employment Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g., San Francisco, CA"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type
              </label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                disabled={loading}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
              </div>
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading || formData.isCurrent}
                />
              </div>
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          {/* Current Position Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCurrent"
              name="isCurrent"
              checked={formData.isCurrent}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-700">
              I currently work here
            </label>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea pl-10 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your role, responsibilities, and key contributions..."
              disabled={loading}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-sm text-gray-500">
              {(formData.description || '').length}/2000 characters
            </p>
          </div>

          {/* Achievements */}
          <div>
            <label htmlFor="achievements" className="block text-sm font-medium text-gray-700 mb-2">
              Key Achievements
            </label>
            <div className="space-y-2">
              {(formData.achievements || []).map((achievement, index) => (
                <div key={`achievement-${index}-${achievement.slice(0, 10)}`} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-gray-700">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(formData.achievements?.length || 0) < 10 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAchievement();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Add an achievement..."
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading || !newAchievement.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {(formData.achievements?.length || 0)}/10 achievements
            </p>
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
              Skills Used
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(formData.skills || []).map((skill, index) => (
                  <span
                    key={`skill-${index}-${skill}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-primary-600 hover:text-primary-800"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {(formData.skills?.length || 0) < 20 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Add a skill..."
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading || !newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {(formData.skills?.length || 0)}/20 skills
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {(() => {
                if (loading) return 'Saving...';
                return experience ? 'Update Experience' : 'Add Experience';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExperienceFormModal;
