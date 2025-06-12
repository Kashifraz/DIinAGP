import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Language, CreateLanguageData, UpdateLanguageData } from '../../services/languageService';

interface LanguageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLanguageData | UpdateLanguageData) => Promise<boolean>;
  language?: Language | null;
  loading?: boolean;
}

const LanguageFormModal: React.FC<LanguageFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  language,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateLanguageData>({
    name: '',
    proficiency: 'beginner',
    certifications: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when language changes
  useEffect(() => {
    if (language) {
      setFormData({
        name: language.name || '',
        proficiency: language.proficiency || 'beginner',
        certifications: language.certifications || []
      });
    } else {
      setFormData({
        name: '',
        proficiency: 'beginner',
        certifications: []
      });
    }
    setErrors({});
  }, [language, isOpen]);

  const handleInputChange = (field: keyof CreateLanguageData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCertificationChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      ) || []
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          name: '',
          issuer: '',
          dateObtained: '',
          expiryDate: '',
          credentialId: '',
          credentialUrl: ''
        }
      ]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Language name is required';
    }

    if (!formData.proficiency) {
      newErrors.proficiency = 'Proficiency level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {language ? 'Edit Language' : 'Add New Language'}
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
          {/* Language Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Language Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., English, Spanish, French"
              disabled={loading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Proficiency Level */}
          <div>
            <label htmlFor="proficiency" className="block text-sm font-medium text-gray-700 mb-2">
              Proficiency Level *
            </label>
            <select
              id="proficiency"
              value={formData.proficiency}
              onChange={(e) => handleInputChange('proficiency', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.proficiency ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="beginner">Beginner (20%)</option>
              <option value="intermediate">Intermediate (40%)</option>
              <option value="advanced">Advanced (60%)</option>
              <option value="fluent">Fluent (80%)</option>
              <option value="native">Native (100%)</option>
            </select>
            {errors.proficiency && <p className="mt-1 text-sm text-red-600">{errors.proficiency}</p>}
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Certifications
              </label>
              <button
                type="button"
                onClick={addCertification}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Certification
              </button>
            </div>

            {formData.certifications && formData.certifications.length > 0 && (
              <div className="space-y-4">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Certification {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Certification Name
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., TOEFL, IELTS"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issuing Organization
                        </label>
                        <input
                          type="text"
                          value={cert.issuer || ''}
                          onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., ETS, British Council"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date Obtained
                        </label>
                        <input
                          type="date"
                          value={cert.dateObtained || ''}
                          onChange={(e) => handleCertificationChange(index, 'dateObtained', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={cert.expiryDate || ''}
                          onChange={(e) => handleCertificationChange(index, 'expiryDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Credential ID
                        </label>
                        <input
                          type="text"
                          value={cert.credentialId || ''}
                          onChange={(e) => handleCertificationChange(index, 'credentialId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., 123456789"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Credential URL
                        </label>
                        <input
                          type="url"
                          value={cert.credentialUrl || ''}
                          onChange={(e) => handleCertificationChange(index, 'credentialUrl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="https://..."
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : (language ? 'Update Language' : 'Add Language')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LanguageFormModal;