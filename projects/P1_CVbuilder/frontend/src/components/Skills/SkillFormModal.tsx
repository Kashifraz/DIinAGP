import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Skill, CreateSkillData, UpdateSkillData, skillService, Certification, Project } from '../../services/skillService';

interface SkillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSkillData | UpdateSkillData) => Promise<boolean>;
  skill?: Skill | null;
  loading?: boolean;
}

const SkillFormModal: React.FC<SkillFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  skill,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateSkillData>({
    name: '',
    category: 'programming',
    proficiency: 'intermediate',
    yearsOfExperience: undefined,
    description: '',
    certifications: [],
    projects: [],
    isHighlighted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({});
  const [newProject, setNewProject] = useState<Partial<Project>>({});
  const [newTechnology, setNewTechnology] = useState('');

  // Initialize form data when skill changes
  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || '',
        category: skill.category || 'programming',
        proficiency: skill.proficiency || 'intermediate',
        yearsOfExperience: skill.yearsOfExperience,
        description: skill.description || '',
        certifications: skill.certifications || [],
        projects: skill.projects || [],
        isHighlighted: skill.isHighlighted || false,
      });
    } else {
      setFormData({
        name: '',
        category: 'programming',
        proficiency: 'intermediate',
        yearsOfExperience: undefined,
        description: '',
        certifications: [],
        projects: [],
        isHighlighted: false,
      });
    }
    setErrors({});
    setNewCertification({});
    setNewProject({});
    setNewTechnology('');
  }, [skill, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? Number.parseInt(value, 10) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addCertification = () => {
    if (newCertification.name && (formData.certifications?.length || 0) < 10) {
      const completeCertification: Certification = {
        name: newCertification.name,
        issuer: newCertification.issuer || '',
        credentialId: newCertification.credentialId || '',
        dateObtained: newCertification.dateObtained || '',
        expiryDate: newCertification.expiryDate || '',
        credentialUrl: newCertification.credentialUrl || ''
      };
      
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), completeCertification]
      }));
      setNewCertification({});
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    if (newProject.name && (formData.projects?.length || 0) < 10) {
      const completeProject: Project = {
        name: newProject.name,
        description: newProject.description || '',
        technologies: newProject.technologies || [],
        url: newProject.url || ''
      };
      
      setFormData(prev => ({
        ...prev,
        projects: [...(prev.projects || []), completeProject]
      }));
      setNewProject({});
    }
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  };

  const addTechnology = () => {
    if (newTechnology.trim() && (newProject.technologies?.length || 0) < 20) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Skill name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Skill category is required';
    }

    if (!formData.proficiency) {
      newErrors.proficiency = 'Proficiency level is required';
    }

    if (formData.yearsOfExperience !== undefined && (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 50)) {
      newErrors.yearsOfExperience = 'Years of experience must be between 0 and 50';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
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
      certifications: (formData.certifications || []).filter(cert => cert.name?.trim()),
      projects: (formData.projects || []).filter(project => project.name?.trim()),
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {skill ? 'Edit Skill' : 'Add Skill'}
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Skill Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter skill name"
                disabled={loading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                {skillService.getAllCategories().map(category => (
                  <option key={category} value={category}>
                    {skillService.getCategoryDisplayName(category)}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proficiency" className="block text-sm font-medium text-gray-700 mb-2">
                Proficiency Level *
              </label>
              <select
                id="proficiency"
                name="proficiency"
                value={formData.proficiency}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.proficiency ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                {skillService.getAllProficiencyLevels().map(level => (
                  <option key={level} value={level}>
                    {skillService.getProficiencyDisplayName(level)}
                  </option>
                ))}
              </select>
              {errors.proficiency && <p className="mt-1 text-sm text-red-600">{errors.proficiency}</p>}
            </div>

            <div>
              <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                value={formData.yearsOfExperience || ''}
                onChange={handleInputChange}
                min="0"
                max="50"
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.yearsOfExperience ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter years of experience"
                disabled={loading}
              />
              {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your experience with this skill..."
              disabled={loading}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-sm text-gray-500">
              {(formData.description || '').length}/500 characters
            </p>
          </div>

          {/* Highlight Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isHighlighted"
              name="isHighlighted"
              checked={formData.isHighlighted}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="isHighlighted" className="ml-2 block text-sm text-gray-700">
              Highlight this skill
            </label>
          </div>

          {/* Certifications */}
          <div>
            <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">
              Certifications
            </label>
            <div className="space-y-2">
              {(formData.certifications || []).map((cert, index) => (
                <div key={`cert-${index}-${cert.name?.slice(0, 10)}`} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">{cert.name}</h5>
                      {cert.issuer && <p className="text-gray-600 text-xs">Issued by: {cert.issuer}</p>}
                      {cert.credentialId && <p className="text-gray-500 text-xs">ID: {cert.credentialId}</p>}
                      {cert.dateObtained && <p className="text-gray-500 text-xs">Date: {cert.dateObtained}</p>}
                      {cert.expiryDate && <p className="text-gray-500 text-xs">Expires: {cert.expiryDate}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {(formData.certifications?.length || 0) < 10 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newCertification.name || ''}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Certification name"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={newCertification.issuer || ''}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Issuing organization"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={newCertification.credentialId || ''}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, credentialId: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Credential ID"
                      disabled={loading}
                    />
                    <input
                      type="url"
                      value={newCertification.credentialUrl || ''}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, credentialUrl: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Credential URL"
                      disabled={loading}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <input
                      type="date"
                      value={newCertification.dateObtained || ''}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, dateObtained: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Date Obtained"
                      disabled={loading}
                    />
                    <input
                      type="date"
                      value={newCertification.expiryDate || ''}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Expiry Date"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="mt-3 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading || !newCertification.name?.trim()}
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Certification
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {(formData.certifications?.length || 0)}/10 certifications
            </p>
          </div>

          {/* Projects */}
          <div>
            <label htmlFor="projects" className="block text-sm font-medium text-gray-700 mb-2">
              Projects
            </label>
            <div className="space-y-2">
              {(formData.projects || []).map((project, index) => (
                <div key={`project-${index}-${project.name?.slice(0, 10)}`} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 text-sm">{project.name}</h5>
                      {project.description && <p className="text-gray-600 text-xs mt-1">{project.description}</p>}
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.map((tech, techIdx) => (
                              <span
                                key={`tech-${techIdx}-${tech}`}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {(formData.projects?.length || 0) < 10 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newProject.name || ''}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Project name"
                      disabled={loading}
                    />
                    <textarea
                      value={newProject.description || ''}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Project description"
                      disabled={loading}
                    />
                    <input
                      type="url"
                      value={newProject.url || ''}
                      onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Project URL"
                      disabled={loading}
                    />
                    
                    {/* Technologies */}
                    <div>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newTechnology}
                          onChange={(e) => setNewTechnology(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTechnology();
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Add technology"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={addTechnology}
                          className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={loading || !newTechnology.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(newProject.technologies || []).map((tech, techIdx) => (
                          <span
                            key={`new-tech-${techIdx}-${tech}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTechnology(techIdx)}
                              className="text-primary-600 hover:text-primary-800"
                              disabled={loading}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addProject}
                    className="mt-3 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={loading || !newProject.name?.trim()}
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Project
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {(formData.projects?.length || 0)}/10 projects
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
                return skill ? 'Update Skill' : 'Add Skill';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillFormModal;
