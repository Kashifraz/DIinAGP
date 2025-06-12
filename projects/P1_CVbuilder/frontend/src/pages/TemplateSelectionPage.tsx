import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Template } from '../services/templateService';
import TemplateSelection from '../components/Templates/TemplateSelection';
import TemplatePreview from '../components/Templates/TemplatePreview';
import CVCreationModal from '../components/CV/CVCreationModal';

const TemplateSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleBackToSelection = () => {
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  const handleConfirmSelection = (template: Template) => {
    // Store selected template and show CV creation modal
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  const handleCreateCV = async (cvId: string) => {
    setShowCreateModal(false);
    // Navigate to CV editor
    navigate(`/dashboard/cv/${cvId}`);
  };

  const handleCancelCreate = () => {
    setShowCreateModal(false);
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPreview && selectedTemplate ? (
          <TemplatePreview
            template={selectedTemplate}
            onBack={handleBackToSelection}
            onSelect={handleConfirmSelection}
          />
        ) : (
          <TemplateSelection
            onTemplateSelect={handleTemplateSelect}
            selectedTemplateId={selectedTemplate?.id || selectedTemplate?._id}
          />
        )}
      </div>

      {/* CV Creation Modal */}
      {selectedTemplate && (
        <CVCreationModal
          isOpen={showCreateModal}
          onClose={handleCancelCreate}
          onSuccess={handleCreateCV}
          preselectedTemplate={selectedTemplate}
        />
      )}
    </div>
  );
};

export default TemplateSelectionPage;
