import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Reference } from '../../services/referenceService';

interface ReferenceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  reference?: Reference | null;
  isSubmitting?: boolean;
}

const ReferenceFormModal: React.FC<ReferenceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  reference,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
    yearsKnown: number;
    order: number;
    isActive: boolean;
  }>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    relationship: '',
    yearsKnown: 1,
    order: 0,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reference) {
      setFormData({
        name: reference.name || '',
        title: reference.title || '',
        company: reference.company || '',
        email: reference.email || '',
        phone: reference.phone || '',
        relationship: reference.relationship || '',
        yearsKnown: reference.yearsKnown || 1,
        order: reference.order || 0,
        isActive: reference.isActive ?? true
      });
    } else {
      setFormData({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        relationship: '',
        yearsKnown: 1,
        order: 0,
        isActive: true
      });
    }
    setErrors({});
  }, [reference, isOpen]);

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
      newErrors.name = 'Name is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.relationship.trim()) {
      newErrors.relationship = 'Relationship is required';
    }

    if (formData.yearsKnown < 1) {
      newErrors.yearsKnown = 'Years known must be at least 1';
    }

    // Only validate phone if provided
    if (formData.phone?.trim() && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9]\d{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
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
      if (key !== 'name' && key !== 'title' && key !== 'company' && key !== 'email' && key !== 'relationship' && key !== 'yearsKnown' && key !== 'order' && key !== 'isActive') {
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
            {reference ? 'Edit Reference' : 'Add New Reference'}
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
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
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
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
                placeholder="e.g., Senior Manager"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.company ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Company name"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Relationship */}
            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <input
                type="text"
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.relationship ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Former Manager, Colleague"
              />
              {errors.relationship && (
                <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>
              )}
            </div>

            {/* Years Known */}
            <div>
              <label htmlFor="yearsKnown" className="block text-sm font-medium text-gray-700 mb-2">
                Years Known *
              </label>
              <input
                type="number"
                id="yearsKnown"
                name="yearsKnown"
                value={formData.yearsKnown}
                onChange={handleChange}
                min="1"
                max="50"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.yearsKnown ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.yearsKnown && (
                <p className="mt-1 text-sm text-red-600">{errors.yearsKnown}</p>
              )}
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
                  This reference is active
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
                return reference ? 'Update Reference' : 'Add Reference';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferenceFormModal;
