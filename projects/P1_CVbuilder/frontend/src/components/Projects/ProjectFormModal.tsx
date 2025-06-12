import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Project } from '../../services/projectService';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  project?: Project | null;
  isSubmitting?: boolean;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: 'personal' | 'academic' | 'professional' | 'open_source' | 'freelance' | 'research' | 'other';
    status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
    startDate: string;
    endDate: string;
    technologies: string;
    url: string;
    repository: string;
    achievements: string;
    order: number;
    isActive: boolean;
  }>({
    name: '',
    description: '',
    type: 'personal',
    status: 'completed',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    technologies: '',
    url: '',
    repository: '',
    achievements: '',
    order: 0,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        type: project.type || 'personal',
        status: project.status || 'completed',
        startDate: project.startDate || new Date().toISOString().split('T')[0],
        endDate: project.endDate || '',
        technologies: project.technologies ? project.technologies.join(', ') : '',
        url: project.url || '',
        repository: project.repository || '',
        achievements: project.achievements ? project.achievements.join(', ') : '',
        order: project.order || 0,
        isActive: project.isActive ?? true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'personal',
        status: 'completed',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        technologies: '',
        url: '',
        repository: '',
        achievements: '',
        order: 0,
        isActive: true
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (() => {
        if (type === 'checkbox') return (e.target as HTMLInputElement).checked;
        if (type === 'number') return Number(value);
        return value;
      })()
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Only validate dates if they are provided
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Only validate URLs if they are provided
    if (formData.url?.trim() && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (formData.repository?.trim() && !isValidUrl(formData.repository)) {
      newErrors.repository = 'Please enter a valid repository URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert technologies and achievements strings to arrays
    const technologiesArray = formData.technologies 
      ? formData.technologies.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    const achievementsArray = formData.achievements 
      ? formData.achievements.split(',').map(a => a.trim()).filter(a => a.length > 0)
      : [];

    // Clean up the data - remove empty strings for optional fields
    const submitData: any = {
      ...formData,
      technologies: technologiesArray,
      achievements: achievementsArray
    };

    // Remove empty strings for optional fields
    for (const key of Object.keys(submitData)) {
      if (key !== 'name' && key !== 'description' && key !== 'technologies' && key !== 'achievements' && key !== 'order' && key !== 'isActive') {
        if (submitData[key] === '' || submitData[key] === null) {
          delete submitData[key];
        }
      }
    }

    const success = await onSubmit(submitData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your project"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Project Type (Optional)
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
                <option value="professional">Professional</option>
                <option value="open_source">Open Source</option>
                <option value="freelance">Freelance</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status (Optional)
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Technologies */}
            <div>
              <label htmlFor="technologies" className="block text-sm font-medium text-gray-700 mb-2">
                Technologies (Optional)
              </label>
              <input
                type="text"
                id="technologies"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter technologies separated by commas"
              />
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>

            {/* Project URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Project URL (Optional)
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://your-project.com"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
              )}
            </div>

            {/* Repository URL */}
            <div>
              <label htmlFor="repository" className="block text-sm font-medium text-gray-700 mb-2">
                Repository URL (Optional)
              </label>
              <input
                type="url"
                id="repository"
                name="repository"
                value={formData.repository}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.repository ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://github.com/username/repo"
              />
              {errors.repository && (
                <p className="mt-1 text-sm text-red-600">{errors.repository}</p>
              )}
            </div>

            {/* Achievements */}
            <div className="md:col-span-2">
              <label htmlFor="achievements" className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements (Optional)
              </label>
              <input
                type="text"
                id="achievements"
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter achievements separated by commas"
              />
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label htmlFor="isActive" className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  This project is active
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(() => {
                if (isSubmitting) return 'Saving...';
                return project ? 'Update Project' : 'Add Project';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
