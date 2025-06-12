import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Eye, EyeOff, Edit3 } from 'lucide-react';
import { CV } from '../../services/cvService';
import { useProfile } from '../../context/ProfileContext';
import { useExperience } from '../../context/ExperienceContext';
import { useEducation } from '../../context/EducationContext';
import { useSkill } from '../../context/SkillContext';
import { useLanguage } from '../../context/LanguageContext';
import { useProject } from '../../context/ProjectContext';
import { usePublications } from '../../context/PublicationContext';
import { useAward } from '../../context/AwardContext';
import { useReference } from '../../context/ReferenceContext';
import { generateTemplateHTML, CVData } from '../../services/templateHtmlGenerator';

interface CVPreviewProps {
  cv: CV;
  template: any;
  onSectionReorder: (sectionOrders: string[]) => void;
  onSectionVisibilityToggle: (sectionName: string) => void;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  cv,
  template,
  onSectionReorder,
  onSectionVisibilityToggle
}) => {
  const { state: profileState } = useProfile();
  const { experience } = useExperience();
  const { education } = useEducation();
  const { skills } = useSkill();
  const { languages } = useLanguage();
  const { projects } = useProject();
  const { publications } = usePublications();
  const { awards } = useAward();
  const { references } = useReference();

  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);


  // Get sorted sections
  const sortedSections = [...cv.sections].sort((a, b) => a.order - b.order);

  // Generate HTML using shared template generator
  useEffect(() => {
    try {
      // Prepare CV data for the shared generator
      const cvData: CVData = {
        name: cv.name,
        user: profileState.profile || {
          fullName: 'Your Name',
          email: 'your.email@example.com',
          phone: 'Your Phone',
          location: 'Your Location',
          bio: 'Professional summary goes here'
        },
        sections: cv.sections.map(section => ({
          name: section.name,
          order: section.order,
          visible: section.visible,
          data: {
            ...section.data,
            // Add context data to section data
            experiences: section.name === 'Experience' ? experience || [] : section.data?.experiences || [],
            educations: section.name === 'Education' ? education || [] : section.data?.educations || [],
            technical: section.name === 'Skills' ? (skills?.filter(s => s.category === 'technical').map(s => s.name) || []) : section.data?.technical || [],
            soft: section.name === 'Skills' ? (skills?.filter(s => s.category === 'soft').map(s => s.name) || []) : section.data?.soft || [],
            languages: section.name === 'Languages' ? languages || [] : section.data?.languages || [],
            projects: section.name === 'Projects' ? projects || [] : section.data?.projects || [],
            publications: section.name === 'Publications' ? publications || [] : section.data?.publications || [],
            awards: section.name === 'Awards' ? awards || [] : section.data?.awards || [],
            references: section.name === 'References' ? references || [] : section.data?.references || []
          }
        })),
        template: template
      };

      const html = generateTemplateHTML(cvData);
      setPreviewHtml(html);
    } catch (error) {
      console.error('CVPreview: Error generating HTML:', error);
      setPreviewHtml('<div class="error">Error generating CV preview</div>');
    }
  }, [cv, cv.sections, template, profileState, experience, education, skills, languages, projects, publications, awards, references]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newSections = [...sortedSections];
    [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    
    // Update order values
    for (let idx = 0; idx < newSections.length; idx++) {
      newSections[idx].order = idx;
    }
    
    const sectionOrders = newSections.map(section => section.name);
    onSectionReorder(sectionOrders);
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedSections.length - 1) return;
    
    const newSections = [...sortedSections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    
    // Update order values
    for (let idx = 0; idx < newSections.length; idx++) {
      newSections[idx].order = idx;
    }
    
    const sectionOrders = newSections.map(section => section.name);
    onSectionReorder(sectionOrders);
  };

  const getSectionIcon = (sectionName: string) => {
    const icons: Record<string, string> = {
      'Profile': '👤',
      'Experience': '💼',
      'Education': '🎓',
      'Skills': '🛠️',
      'Languages': '🌍',
      'Projects': '🚀',
      'Publications': '📚',
      'Awards': '🏆',
      'References': '👥'
    };
    return icons[sectionName] || '📄';
  };

  return (
    <div className="h-full flex">
      {/* Section Controls */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">CV Sections</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Edit3 size={16} className="mr-1" />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>

          <div className="space-y-2">
            {sortedSections.map((section, index) => (
              <div
                key={section.name}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  section.visible 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getSectionIcon(section.name)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{section.name}</h4>
                    <p className="text-xs text-gray-500">Order: {section.order + 1}</p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sortedSections.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => onSectionVisibilityToggle(section.name)}
                      className={`p-1 rounded ${
                        section.visible
                          ? 'text-green-600 hover:bg-green-100'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={section.visible ? 'Hide section' : 'Show section'}
                    >
                      {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isEditing && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Click "Edit" to reorder sections or toggle visibility
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CV Preview */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div 
              className="template-preview-container"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPreview;