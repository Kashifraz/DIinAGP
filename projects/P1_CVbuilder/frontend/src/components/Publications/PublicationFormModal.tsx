import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Publication } from '../../services/publicationService';

interface PublicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  publication?: Publication | null;
  isSubmitting?: boolean;
}

const PublicationFormModal: React.FC<PublicationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  publication,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    type: 'journal' | 'conference' | 'book' | 'book_chapter' | 'patent' | 'blog' | 'article' | 'other';
    authors: { id: string; name: string; isPrimary: boolean; affiliation: string }[];
    publisher: string;
    publicationDate: string;
    doi: string;
    url: string;
    abstract: string;
    keywords: string;
    citationCount: number;
    order: number;
    isActive: boolean;
  }>({
    title: '',
    type: 'journal',
    authors: [{ id: '1', name: '', isPrimary: true, affiliation: '' }],
    publisher: '',
    publicationDate: new Date().toISOString().split('T')[0],
    doi: '',
    url: '',
    abstract: '',
    keywords: '',
    citationCount: 0,
    order: 0,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (publication) {
      setFormData({
        title: publication.title || '',
        type: publication.type || 'journal',
        authors: publication.authors?.map((author, index) => ({
          id: `author-${index}-${Date.now()}`,
          name: author.name,
          isPrimary: author.isPrimary,
          affiliation: author.affiliation || ''
        })) || [{ id: '1', name: '', isPrimary: true, affiliation: '' }],
        publisher: publication.publisher || '',
        publicationDate: publication.publicationDate || new Date().toISOString().split('T')[0],
        doi: publication.doi || '',
        url: publication.url || '',
        abstract: publication.abstract || '',
        keywords: publication.keywords ? publication.keywords.join(', ') : '',
        citationCount: publication.citationCount || 0,
        order: publication.order || 0,
        isActive: publication.isActive ?? true
      });
    } else {
      setFormData({
        title: '',
        type: 'journal',
        authors: [{ id: '1', name: '', isPrimary: true, affiliation: '' }],
        publisher: '',
        publicationDate: new Date().toISOString().split('T')[0],
        doi: '',
        url: '',
        abstract: '',
        keywords: '',
        citationCount: 0,
        order: 0,
        isActive: true
      });
    }
    setErrors({});
  }, [publication, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAuthorChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) => 
        i === index ? { ...author, [field]: value } : author
      )
    }));
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, { id: `author-${Date.now()}-${Math.random()}`, name: '', isPrimary: false, affiliation: '' }]
    }));
  };

  const removeAuthor = (index: number) => {
    if (formData.authors.length > 1) {
      setFormData(prev => ({
        ...prev,
        authors: prev.authors.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.authors || formData.authors.length === 0 || !formData.authors[0].name.trim()) {
      newErrors.authors = 'At least one author is required';
    }

    if (!formData.publisher.trim()) {
      newErrors.publisher = 'Publisher is required';
    }

    if (!formData.publicationDate) {
      newErrors.publicationDate = 'Publication date is required';
    }

    if (formData.url && !isValidUrl(formData.url)) {
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

    // Convert keywords string to array
    const keywordsArray = formData.keywords 
      ? formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
      : [];

    // Remove ID field from authors before submitting
    const authorsForSubmission = formData.authors.map(({ id, ...author }) => author);

    const submitData = {
      ...formData,
      authors: authorsForSubmission,
      keywords: keywordsArray
    };

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
            {publication ? 'Edit Publication' : 'Add New Publication'}
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
                Title *
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
                placeholder="Enter publication title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="journal">Journal Article</option>
                <option value="conference">Conference Paper</option>
                <option value="book">Book</option>
                <option value="book_chapter">Book Chapter</option>
                <option value="patent">Patent</option>
                <option value="blog">Blog Post</option>
                <option value="article">Article</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Publisher */}
            <div>
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                Publisher *
              </label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.publisher ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter publisher name"
              />
              {errors.publisher && (
                <p className="mt-1 text-sm text-red-600">{errors.publisher}</p>
              )}
            </div>

            {/* Publication Date */}
            <div>
              <label htmlFor="publicationDate" className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date *
              </label>
              <input
                type="date"
                id="publicationDate"
                name="publicationDate"
                value={formData.publicationDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.publicationDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.publicationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.publicationDate}</p>
              )}
            </div>

            {/* DOI */}
            <div>
              <label htmlFor="doi" className="block text-sm font-medium text-gray-700 mb-2">
                DOI
              </label>
              <input
                type="text"
                id="doi"
                name="doi"
                value={formData.doi}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter DOI (e.g., 10.1000/182)"
              />
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL
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
                placeholder="Enter publication URL"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
              )}
            </div>

            {/* Citation Count */}
            <div>
              <label htmlFor="citationCount" className="block text-sm font-medium text-gray-700 mb-2">
                Citation Count
              </label>
              <input
                type="number"
                id="citationCount"
                name="citationCount"
                value={formData.citationCount}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Keywords */}
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter keywords separated by commas"
              />
            </div>
          </div>

          {/* Authors */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Authors *
            </div>
            {formData.authors.map((author, index) => (
              <div key={author.id} className="flex items-center space-x-4 mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={author.name}
                    onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Author name"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={author.affiliation}
                    onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Affiliation"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`primary-${index}`}
                    checked={author.isPrimary}
                    onChange={(e) => handleAuthorChange(index, 'isPrimary', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`primary-${index}`} className="ml-2 text-sm text-gray-700">Primary</label>
                </div>
                {formData.authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAuthor(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAuthor}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add Author</span>
            </button>
            {errors.authors && (
              <p className="mt-1 text-sm text-red-600">{errors.authors}</p>
            )}
          </div>

          {/* Abstract */}
          <div>
            <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
              Abstract
            </label>
            <textarea
              id="abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter publication abstract"
            />
          </div>

          {/* Active Status */}
          <div>
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
                This publication is active
              </span>
            </label>
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
                return publication ? 'Update Publication' : 'Add Publication';
              })()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicationFormModal;