import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Download, Copy } from 'lucide-react';
import { useCV } from '../context/CVContext';
import { useTemplate } from '../context/TemplateContext';
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

const CVLibraryPage: React.FC = () => {
  const { state, getCVs, deleteCV, setCurrentCV } = useCV();
  const { getTemplates } = useTemplate();
  const navigate = useNavigate();
  
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);

  useEffect(() => {
    getCVs();
    getTemplates();
  }, [getCVs, getTemplates]);

  const filteredCVs = state.cvs
    .filter(cv => {
      const matchesSearch = cv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cv.template.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });


  const handleEditCV = (cv: CV) => {
    setCurrentCV(cv);
    navigate(`/dashboard/cv/${cv._id}`);
  };

  const handleDeleteCV = async (cv: CV) => {
    if (globalThis.confirm(`Are you sure you want to delete "${cv.name}"? This action cannot be undone.`)) {
      const success = await deleteCV(cv._id);
      if (success) {
        setShowActionsMenu(null);
      }
    }
  };

  const handleDuplicateCV = (cv: CV) => {
    // This would be implemented when we add duplication functionality
    toast.success('Duplicate functionality coming soon');
    setShowActionsMenu(null);
  };


  const handleDownloadCV = async (cv: CV) => {
    try {
      // Prepare CV data with all context data
      const cvData = {
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
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
      setShowActionsMenu(null);
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading CVs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CV Library</h1>
              <p className="text-sm text-gray-500">Manage and organize your CVs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search CVs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                >
                  <option value="updated-desc">Last Modified</option>
                  <option value="created-desc">Date Created</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CV Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCVs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {state.cvs.length === 0 ? 'No CVs yet' : 'No CVs match your search'}
            </h3>
            <p className="text-gray-500 mb-6">
              {state.cvs.length === 0 
                ? 'No CVs have been created yet'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCVs.map((cv) => (
              <div
                key={cv._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {cv.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {cv.template.name}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowActionsMenu(showActionsMenu === cv._id ? null : cv._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {showActionsMenu === cv._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleEditCV(cv)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit size={16} className="mr-3" />
                              Edit CV
                            </button>
                            <button
                              onClick={() => handleDuplicateCV(cv)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Copy size={16} className="mr-3" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => handleDownloadCV(cv)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Download size={16} className="mr-3" />
                              Download PDF
                            </button>
                            <div className="border-t border-gray-100"></div>
                            <button
                              onClick={() => handleDeleteCV(cv)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} className="mr-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Created:</span>
                      <span>{formatDate(cv.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Modified:</span>
                      <span>{formatDate(cv.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Version:</span>
                      <span>{cv.version}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditCV(cv)}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      <Eye size={16} className="mr-2" />
                      Open CV
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CVLibraryPage;
