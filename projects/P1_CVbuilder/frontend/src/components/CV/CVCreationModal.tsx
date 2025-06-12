import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { useTemplate } from '../../context/TemplateContext';
import { useCV } from '../../context/CVContext';
import { CreateCVData } from '../../services/cvService';
import { Template } from '../../services/templateService';
import toast from 'react-hot-toast';

interface CVCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (cvId: string) => void;
  preselectedTemplate?: Template;
}

const CVCreationModal: React.FC<CVCreationModalProps> = ({ isOpen, onClose, onSuccess, preselectedTemplate }) => {
  const { templates, getTemplates } = useTemplate();
  const { createCV, state } = useCV();
  
  
  const [formData, setFormData] = useState({
    name: '',
    templateId: preselectedTemplate?.id || preselectedTemplate?._id || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && templates.length === 0) {
      getTemplates();
    }
  }, [isOpen, templates.length, getTemplates]);

  // Update formData when preselectedTemplate changes
  useEffect(() => {
    const templateId = preselectedTemplate?.id || preselectedTemplate?._id;
    if (templateId) {
      setFormData(prev => ({
        ...prev,
        templateId: templateId
      }));
      // Clear any template validation errors
      setErrors(prev => ({
        ...prev,
        templateId: ''
      }));
    }
  }, [preselectedTemplate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'CV name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'CV name must be at least 3 characters';
    }

    // Check if template is selected (either from form or preselected)
    const selectedTemplateId = formData.templateId || preselectedTemplate?.id || preselectedTemplate?._id;
    
    if (!selectedTemplateId) {
      newErrors.templateId = 'Please select a template';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const createData: CreateCVData = {
        name: formData.name.trim(),
        templateId: formData.templateId || preselectedTemplate?.id || preselectedTemplate?._id || ''
      };

      const newCV = await createCV(createData);
      
      if (newCV) {
        toast.success('CV created successfully!');
        onSuccess?.(newCV._id);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating CV:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', templateId: preselectedTemplate?.id || preselectedTemplate?._id || '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New CV</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* CV Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              CV Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter CV name (e.g., 'Software Engineer CV')"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
              {preselectedTemplate ? 'Selected Template' : 'Choose Template *'}
            </label>
            {preselectedTemplate ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">{preselectedTemplate.name}</h4>
                    <p className="text-sm text-blue-700">{preselectedTemplate.description}</p>
                  </div>
                  <div className="text-blue-600">
                    <Check size={20} />
                  </div>
                </div>
              </div>
            ) : (
              <select
                id="templateId"
                name="templateId"
                value={formData.templateId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.templateId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select a template...</option>
                {templates.map((template) => (
                  <option key={template.id || template._id} value={template.id || template._id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            )}
            {errors.templateId && (
              <p className="mt-1 text-sm text-red-600">{errors.templateId}</p>
            )}
          </div>

          {/* Template Preview */}
          {formData.templateId && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Template Preview</h3>
              <div className="text-sm text-gray-600">
                {(() => {
                  const selectedTemplate = templates.find(t => (t.id || t._id) === formData.templateId);
                  return selectedTemplate ? (
                    <div>
                      <p><strong>Name:</strong> {selectedTemplate.name}</p>
                      <p><strong>Description:</strong> {selectedTemplate.description}</p>
                      <p><strong>Category:</strong> {selectedTemplate.category}</p>
                      <p><strong>Sections:</strong> {selectedTemplate.sections.join(', ')}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your CV will be created with the selected template</li>
                    <li>Default sections will be auto-populated from your profile</li>
                    <li>You can customize sections, reorder them, and add your content</li>
                    <li>All changes are automatically saved as you work</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || state.loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting || state.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create CV
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CVCreationModal;
