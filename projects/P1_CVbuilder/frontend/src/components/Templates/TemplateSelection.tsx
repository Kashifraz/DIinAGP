import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Palette, 
  Zap, 
  BookOpen, 
  Minimize2, 
  FileText, 
  Eye, 
  Check,
  Filter
} from 'lucide-react';
import { Template, getCategoryDisplayName, getCategoryColor, templateService } from '../../services/templateService';
import { useTemplate } from '../../context/TemplateContext';

interface TemplateSelectionProps {
  onTemplateSelect: (template: Template) => void;
  selectedTemplateId?: string;
  className?: string;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  onTemplateSelect,
  selectedTemplateId,
  className = ''
}) => {
  const {
    templates,
    categories,
    loading,
    error,
    filters,
    getTemplates,
    getTemplatesByCategory,
    getTemplateCategories,
    setFilters,
    clearError
  } = useTemplate();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    getTemplates();
    getTemplateCategories();
  }, [getTemplates, getTemplateCategories]);

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get icon component for category
  const getIconComponent = (category: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      professional: Briefcase,
      creative: Palette,
      modern: Zap,
      classic: BookOpen,
      minimal: Minimize2
    };
    return iconMap[category] || FileText;
  };

  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    if (filters.category === category) {
      // Clear category filter
      setFilters({});
      getTemplates();
    } else {
      // Apply category filter
      setFilters({ category });
      getTemplatesByCategory(category);
    }
  };

  // Handle template selection
  const handleTemplateSelect = async (template: Template) => {
    try {
      const templateId = template.id || template._id;
      if (!templateId) {
        console.error('TemplateSelection: No template ID available');
        return;
      }
      
      setLoadingTemplate(templateId);
      console.log('TemplateSelection: Fetching full template for:', template.name);
      // Fetch the full template with HTML and CSS
      const fullTemplate = await templateService.getFullTemplate(templateId);
      console.log('TemplateSelection: Full template fetched:', fullTemplate);
      onTemplateSelect(fullTemplate);
    } catch (error) {
      console.error('TemplateSelection: Error fetching full template:', error);
      // Fallback to the basic template if full fetch fails
      onTemplateSelect(template);
    } finally {
      setLoadingTemplate(null);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    getTemplates();
  };

  if (loading && templates.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error loading templates</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            clearError();
            getTemplates();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
          <p className="text-gray-600">Select a template to start building your CV</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          
          {/* Search */}
          <div>
            <label htmlFor="search-templates" className="block text-sm font-medium text-gray-700 mb-2">
              Search templates
            </label>
            <input
              id="search-templates"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category filters */}
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.name);
                const isSelected = filters.category === category.name;
                
                return (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryFilter(category.name)}
                    className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    {category.displayName}
                    <span className="ml-1 text-xs opacity-75">({category.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => {
          const IconComponent = getIconComponent(template.category);
          const templateId = template.id || template._id;
          const isSelected = selectedTemplateId === templateId;
          const isLoading = loadingTemplate === templateId;
          
          return (
            <button
              key={templateId}
              className={`relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg w-full text-left p-6 ${
                isSelected
                  ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
              onClick={() => !isLoading && handleTemplateSelect(template)}
              disabled={isLoading}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute top-3 right-3 bg-gray-600 text-white rounded-full p-1">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
              )}

              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {getCategoryDisplayName(template.category)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Template Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Template Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Version {template.version}</span>
                <div className="flex items-center text-blue-600">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* No templates found */}
      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filters.category
              ? 'Try adjusting your search or filters'
              : 'No templates are available at the moment'
            }
          </p>
          {(searchTerm || filters.category) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
