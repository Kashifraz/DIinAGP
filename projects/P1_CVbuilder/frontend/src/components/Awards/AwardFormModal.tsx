import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Award } from '../../services/awardService';

interface AwardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  award?: Award | null;
  isSubmitting?: boolean;
}

const AwardFormModal: React.FC<AwardFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  award,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    issuer: string;
    dateReceived: string;
    category: 'academic' | 'professional' | 'recognition' | 'competition' | 'achievement' | 'service' | 'leadership' | 'innovation' | 'other';
    location: string;
    url: string;
    certificateUrl: string;
    order: number;
    isActive: boolean;
  }>({
    title: '',
    description: '',
    issuer: '',
    dateReceived: new Date().toISOString().split('T')[0],
    category: 'academic',
    location: '',
    url: '',
    certificateUrl: '',
    order: 0,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (award) {
      setFormData({
        title: award.title || '',
        description: award.description || '',
        issuer: award.issuer || '',
        dateReceived: award.dateReceived || new Date().toISOString().split('T')[0],
        category: award.category || 'academic',
        location: award.location || '',
        url: award.url || '',
        certificateUrl: award.certificateUrl || '',
        order: award.order || 0,
        isActive: award.isActive ?? true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        issuer: '',
        dateReceived: new Date().toISOString().split('T')[0],
        category: 'academic',
        location: '',
        url: '',
        certificateUrl: '',
        order: 0,
        isActive: true
      });
    }
    setErrors({});
  }, [award, isOpen]);

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

    if (!formData.title.trim()) {
      newErrors.title = 'Award title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.issuer.trim()) {
      newErrors.issuer = 'Issuer is required';
    }

    if (!formData.dateReceived) {
      newErrors.dateReceived = 'Date is required';
    }

    // Only validate URL if provided
    if (formData.url?.trim() && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
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

    // Clean up the data - remove empty strings for optional fields
    const submitData: any = {
      ...formData
    };

    // Remove empty strings for optional fields
    for (const key of Object.keys(submitData)) {
      if (key !== 'title' && key !== 'description' && key !== 'issuer' && key !== 'dateReceived' && key !== 'category' && key !== 'order' && key !== 'isActive') {
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {award ? 'Edit Award' : 'Add New Award'}
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
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Award Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter award title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
                placeholder="Describe the award and its significance"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Issuer */}
            <div>
              <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 mb-2">
                Issuer *
              </label>
              <input
                type="text"
                id="issuer"
                name="issuer"
                value={formData.issuer}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.issuer ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Organization or institution"
              />
              {errors.issuer && (
                <p className="mt-1 text-sm text-red-600">{errors.issuer}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="dateReceived" className="block text-sm font-medium text-gray-700 mb-2">
                Date Received *
              </label>
              <input
                type="date"
                id="dateReceived"
                name="dateReceived"
                value={formData.dateReceived}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dateReceived ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateReceived && (
                <p className="mt-1 text-sm text-red-600">{errors.dateReceived}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="academic">Academic</option>
                <option value="professional">Professional</option>
                <option value="recognition">Recognition</option>
                <option value="competition">Competition</option>
                <option value="achievement">Achievement</option>
                <option value="service">Service</option>
                <option value="leadership">Leadership</option>
                <option value="innovation">Innovation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country"
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL (Optional)
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
                placeholder="https://example.com/award"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
              )}
            </div>

            {/* Certificate URL */}
            <div>
              <label htmlFor="certificateUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Certificate URL (Optional)
              </label>
              <input
                type="url"
                id="certificateUrl"
                name="certificateUrl"
                value={formData.certificateUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/certificate"
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
                  This award is active
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
                return award ? 'Update Award' : 'Add Award';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AwardFormModal;
