import React, { useState, useEffect } from 'react';
import { X, GraduationCap, MapPin, Calendar, Award, FileText } from 'lucide-react';
import { Education, CreateEducationData, UpdateEducationData } from '../../services/educationService';

interface EducationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEducationData | UpdateEducationData) => Promise<boolean>;
  education?: Education | null;
  loading?: boolean;
}

const EducationFormModal: React.FC<EducationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  education,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    gpa: '',
    description: '',
    location: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when education prop changes
  useEffect(() => {
    if (education) {
      setFormData({
        institution: education.institution || '',
        degree: education.degree || '',
        fieldOfStudy: education.fieldOfStudy || '',
        startDate: education.startDate ? education.startDate.split('T')[0] : '',
        endDate: education.endDate ? education.endDate.split('T')[0] : '',
        isCurrent: education.isCurrent || false,
        gpa: education.gpa ? education.gpa.toString() : '',
        description: education.description || '',
        location: education.location || ''
      });
    } else {
      setFormData({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        gpa: '',
        description: '',
        location: ''
      });
    }
    setErrors({});
  }, [education, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }

    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }

    if (!formData.fieldOfStudy.trim()) {
      newErrors.fieldOfStudy = 'Field of study is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const now = new Date();
      if (startDate > now) {
        newErrors.startDate = 'Start date cannot be in the future';
      }
    }

    if (formData.isCurrent === false && !formData.endDate) {
      newErrors.endDate = 'End date is required for completed education';
    }

    if (formData.isCurrent && formData.endDate) {
      newErrors.endDate = 'Current education cannot have an end date';
    }

    if (formData.endDate && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.gpa && (Number.isNaN(Number(formData.gpa)) || Number(formData.gpa) < 0 || Number(formData.gpa) > 4)) {
      newErrors.gpa = 'GPA must be between 0 and 4.0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: CreateEducationData | UpdateEducationData = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      fieldOfStudy: formData.fieldOfStudy.trim(),
      startDate: formData.startDate,
      endDate: formData.isCurrent ? undefined : (formData.endDate || undefined),
      isCurrent: formData.isCurrent,
      gpa: formData.gpa ? Number(formData.gpa) : undefined,
      description: formData.description.trim() || undefined,
      location: formData.location.trim() || undefined
    };

    const success = await onSubmit(submitData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Only close if clicking the backdrop, not the modal content
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {education ? 'Edit Education' : 'Add Education'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Institution */}
          <div>
            <label htmlFor="institution" className="form-label">
              Institution Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GraduationCap className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="institution"
                name="institution"
                type="text"
                value={formData.institution}
                onChange={handleInputChange}
                className={`form-input pl-10 ${errors.institution ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="University of Technology"
              />
            </div>
            {errors.institution && (
              <p className="form-error">{errors.institution}</p>
            )}
          </div>

          {/* Degree and Field of Study */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="degree" className="form-label">
                Degree *
              </label>
              <input
                id="degree"
                name="degree"
                type="text"
                value={formData.degree}
                onChange={handleInputChange}
                className={`form-input ${errors.degree ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Bachelor of Science"
              />
              {errors.degree && (
                <p className="form-error">{errors.degree}</p>
              )}
            </div>

            <div>
              <label htmlFor="fieldOfStudy" className="form-label">
                Field of Study *
              </label>
              <input
                id="fieldOfStudy"
                name="fieldOfStudy"
                type="text"
                value={formData.fieldOfStudy}
                onChange={handleInputChange}
                className={`form-input ${errors.fieldOfStudy ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Computer Science"
              />
              {errors.fieldOfStudy && (
                <p className="form-error">{errors.fieldOfStudy}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="form-label">
                Start Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`form-input pl-10 ${errors.startDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.startDate && (
                <p className="form-error">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="form-label">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={formData.isCurrent}
                  className={`form-input pl-10 ${formData.isCurrent ? 'bg-gray-50' : ''} ${errors.endDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.endDate && (
                <p className="form-error">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Current Education Checkbox */}
          <div className="flex items-center">
            <input
              id="isCurrent"
              name="isCurrent"
              type="checkbox"
              checked={formData.isCurrent}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-900">
              I am currently studying here
            </label>
          </div>

          {/* GPA and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gpa" className="form-label">
                GPA (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Award className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="gpa"
                  name="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  className={`form-input pl-10 ${errors.gpa ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="3.8"
                />
              </div>
              {errors.gpa && (
                <p className="form-error">{errors.gpa}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="form-label">
                Location (Optional)
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
                  className="form-input pl-10"
                  placeholder="New York, NY"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea pl-10"
                placeholder="Describe your studies, achievements, or relevant coursework..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(() => {
                if (loading) return 'Saving...';
                return education ? 'Update Education' : 'Add Education';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationFormModal;
