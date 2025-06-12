import React, { useState, useEffect } from 'react';
import { Eye, ArrowLeft, Check } from 'lucide-react';
import { Template } from '../../services/templateService';
import { generateTemplateHTML, generateSampleCVData } from '../../services/templateHtmlGenerator';

interface TemplatePreviewProps {
  template: Template;
  onBack: () => void;
  onSelect: (template: Template) => void;
  className?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  onBack,
  onSelect,
  className = ''
}) => {
  const [previewHtml, setPreviewHtml] = useState<string>('');


  // Generate preview HTML with sample data using shared generator
  useEffect(() => {
    try {
      const sampleCVData = generateSampleCVData(template);
      const html = generateTemplateHTML(sampleCVData);
      setPreviewHtml(html);
    } catch (error) {
      console.error('TemplatePreview: Error generating preview HTML:', error);
      setPreviewHtml('');
    }
  }, [template]);

  const handleSelect = () => {
    onSelect(template);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <p className="text-gray-600">{template.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSelect}
            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Check className="h-4 w-4 mr-2" />
            Select Template
          </button>
        </div>
      </div>


      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-xs text-gray-500">Template Preview</div>
          </div>
        </div>
        
        <div className="p-6">
          {previewHtml ? (
            <div 
              className="max-w-4xl mx-auto template-preview-container"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading preview...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Category:</span>
            <span className="ml-2 text-gray-600 capitalize">{template.category}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Version:</span>
            <span className="ml-2 text-gray-600">{template.version}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Sections:</span>
            <span className="ml-2 text-gray-600">{template.sections.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
