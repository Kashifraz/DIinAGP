import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';
import categoryService, { Category } from '../../services/categoryService';

const CategoryCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getPublicCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadCategories();
      return;
    }

    try {
      setLoading(true);
      const data = await categoryService.searchCategories({ q: searchTerm });
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to search categories');
      console.error('Error searching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Browse Categories
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Discover products organized by category. Find exactly what you're looking for.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-lg mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          <button
            onClick={handleSearch}
            className="absolute inset-y-0 right-0 px-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or browse all categories.
          </p>
          <div className="mt-6">
            <button
              onClick={() => {
                setSearchTerm('');
                loadCategories();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Categories
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCategories.map((category, index) => {
            // Different gradient colors for variety
            const gradients = [
              'from-blue-500 via-blue-600 to-indigo-700',
              'from-purple-500 via-purple-600 to-pink-700',
              'from-green-500 via-green-600 to-emerald-700',
              'from-orange-500 via-orange-600 to-red-700',
              'from-teal-500 via-teal-600 to-cyan-700',
              'from-pink-500 via-pink-600 to-rose-700',
              'from-indigo-500 via-indigo-600 to-purple-700',
              'from-emerald-500 via-emerald-600 to-green-700'
            ];
            
            const gradient = gradients[index % gradients.length];
            
            return (
              <div
                key={category.id}
                className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                {/* Category Image with Gradient Overlay */}
                <div className="relative h-56 overflow-hidden">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <TagIcon className="h-20 w-20 text-white opacity-90 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">#{category.sortOrder}</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                          category.isActive
                            ? 'bg-green-500 bg-opacity-80 text-white'
                            : 'bg-red-500 bg-opacity-80 text-white'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Category Icon */}
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <TagIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Hover Action Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => navigate(`/products?category=${category.id}`)}
                      className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>Explore Products</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-6 bg-white">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Category</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>#{category.sortOrder}</span>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-20 h-20 bg-white bg-opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white bg-opacity-5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      {filteredCategories.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredCategories.length} category{filteredCategories.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default CategoryCatalog;
