import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { useCV } from '../context/CVContext';
import CVCanvas from '../components/CV/CVCanvas';
import cvService, { CV } from '../services/cvService';
import { useProfile } from '../context/ProfileContext';
import { useExperience } from '../context/ExperienceContext';
import { useEducation } from '../context/EducationContext';
import { useSkill } from '../context/SkillContext';
import { useLanguage } from '../context/LanguageContext';
import { useProject } from '../context/ProjectContext';
import { usePublications } from '../context/PublicationContext';
import { useAward } from '../context/AwardContext';
import { useReference } from '../context/ReferenceContext';
import toast from 'react-hot-toast';

const CVEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, getCVById, updateCV, setCurrentCV } = useCV();
  
  // Get all context data for PDF generation
  const { state: profileState } = useProfile();
  const { experience } = useExperience();
  const { education } = useEducation();
  const { skills } = useSkill();
  const { languages } = useLanguage();
  const { projects } = useProject();
  const { publications } = usePublications();
  const { awards } = useAward();
  const { references } = useReference();
  
  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCV();
    }
  }, [id]);

  const loadCV = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if CV is already in state
      const existingCV = state.cvs.find(cv => cv._id === id);
      if (existingCV) {
        setCv(existingCV);
        setCurrentCV(existingCV);
        setLoading(false);
        return;
      }
      
      // Load CV from API
      await getCVById(id);
    } catch (error: any) {
      console.error('Error loading CV:', error);
      setError('Failed to load CV');
      toast.error('Failed to load CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.currentCV && state.currentCV._id === id) {
      setCv(state.currentCV);
    }
  }, [state.currentCV, id]);

  const handleCVUpdate = async (updatedCV: CV) => {
    try {
      const result = await updateCV(updatedCV._id, {
        name: updatedCV.name,
        status: updatedCV.status,
        settings: updatedCV.settings
      });
      
      if (result) {
        setCv(result);
        toast.success('CV updated successfully');
      }
    } catch (error) {
      console.error('Error updating CV:', error);
      toast.error('Failed to update CV');
    }
  };

  const handleSave = async () => {
    if (!cv) return;
    
    try {
      const result = await updateCV(cv._id, {
        name: cv.name,
        status: cv.status,
        settings: cv.settings
      });
      
      if (result) {
        setCv(result);
        toast.success('CV saved successfully');
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      toast.error('Failed to save CV');
    }
  };


  const prepareCVData = () => {
    if (!cv) return null;
    
    return {
      ...cv,
      user: profileState.profile,
      sections: cv.sections.map(section => {
        let sectionData = { ...section.data };
        
        // Populate section data based on context
        switch (section.name) {
          case 'Profile':
            sectionData = {
              ...sectionData,
              summary: profileState.profile?.bio || '',
              bio: profileState.profile?.bio || ''
            };
            break;
          case 'Experience':
            sectionData = {
              ...sectionData,
              experiences: experience || [],
              experience: experience || []
            };
            break;
          case 'Education':
            sectionData = {
              ...sectionData,
              educations: education || [],
              education: education || []
            };
            break;
          case 'Skills':
            sectionData = {
              ...sectionData,
              technical: skills?.filter(s => s.category === 'technical').map(s => s.name) || [],
              soft: skills?.filter(s => s.category === 'soft').map(s => s.name) || []
            };
            break;
          case 'Languages':
            sectionData = {
              ...sectionData,
              languages: languages || []
            };
            break;
          case 'Projects':
            sectionData = {
              ...sectionData,
              projects: projects || []
            };
            break;
          case 'Publications':
            sectionData = {
              ...sectionData,
              publications: publications || []
            };
            break;
          case 'Awards':
            sectionData = {
              ...sectionData,
              awards: awards || []
            };
            break;
          case 'References':
            sectionData = {
              ...sectionData,
              references: references || []
            };
            break;
        }
        
        return {
          ...section,
          data: sectionData
        };
      })
    };
  };


  const handleDownload = async () => {
    if (!cv) return;
    
    try {
      const cvData = prepareCVData();
      if (!cvData) return;

      // Generate PDF
      const pdfBlob = await cvService.generatePDF(cvData);
      
      // Create download link
      const url = globalThis.URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cv.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CV...</p>
        </div>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            CV Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The CV you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            to="/dashboard/cvs"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to CV Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/cvs"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Library
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{cv.name}</h1>
                <p className="text-sm text-gray-500">
                  Template: {cv.template.name} • Last modified: {new Date(cv.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Save size={16} className="mr-2" />
                Save
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <Download size={16} className="mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CV Canvas */}
      <div className="h-[calc(100vh-80px)]">
        <CVCanvas
          cv={cv}
          onUpdate={handleCVUpdate}
        />
      </div>
    </div>
  );
};

export default CVEditorPage;
