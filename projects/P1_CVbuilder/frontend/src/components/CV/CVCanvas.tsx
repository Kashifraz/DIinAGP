import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCV } from '../../context/CVContext';
import { useTemplate } from '../../context/TemplateContext';
import { CV } from '../../services/cvService';
import CVPreview from './CVPreview';
import toast from 'react-hot-toast';

interface CVCanvasProps {
  cv: CV;
  onUpdate?: (cv: CV) => void;
}

const CVCanvas: React.FC<CVCanvasProps> = ({ cv, onUpdate }) => {
  const { updateCV, toggleSectionVisibility, reorderSections } = useCV();
  const { getFullTemplate } = useTemplate();
  
  const [template, setTemplate] = useState<any>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAutoSave = useCallback(async () => {
    if (isSaving) return; // Prevent multiple simultaneous saves
    
    setIsSaving(true);
    try {
      const updatedCV = await updateCV(cv._id, {
        name: cv.name,
        status: cv.status,
        settings: cv.settings
      });
      
      if (updatedCV) {
        setIsDirty(false);
        onUpdate?.(updatedCV);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [cv._id, cv.name, cv.status, cv.settings, updateCV, onUpdate, isSaving]);

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      if (cv.template._id && !template) {
        setIsLoadingTemplate(true);
        try {
          const fullTemplate = await getFullTemplate(cv.template._id);
          setTemplate(fullTemplate);
        } catch (error) {
          console.error('Error loading template:', error);
          toast.error('Failed to load template');
        } finally {
          setIsLoadingTemplate(false);
        }
      }
    };

    loadTemplate();
  }, [cv.template._id, template, getFullTemplate]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(async () => {
        await handleAutoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isDirty, cv, handleAutoSave]);

  const handleSectionVisibilityToggle = async (sectionName: string) => {
    try {
      await toggleSectionVisibility(cv._id, sectionName);
      setIsDirty(true);
    } catch (error) {
      console.error('Error toggling section visibility:', error);
    }
  };

  const handleSectionReorder = async (sectionOrders: string[]) => {
    try {
      await reorderSections(cv._id, sectionOrders);
      setIsDirty(true);
    } catch (error) {
      console.error('Error reordering sections:', error);
    }
  };

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading template...</span>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Template not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <CVPreview
        cv={cv}
        template={template}
        onSectionReorder={handleSectionReorder}
        onSectionVisibilityToggle={handleSectionVisibilityToggle}
      />
    </div>
  );
};

export default CVCanvas;