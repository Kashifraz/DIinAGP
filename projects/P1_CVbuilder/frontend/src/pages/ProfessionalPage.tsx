import React, { useState } from 'react';
import { Plus, Download, GraduationCap, Briefcase, Users, Globe, FileText, Code, Trophy } from 'lucide-react';
import { useEducation } from '../hooks/useEducation';
import { useExperience } from '../hooks/useExperience';
import { useSkill } from '../hooks/useSkill';
import { useLanguage } from '../context/LanguageContext';
import { usePublications } from '../context/PublicationContext';
import { useProject } from '../context/ProjectContext';
import { useAward } from '../context/AwardContext';
import { Education } from '../services/educationService';
import { Experience } from '../services/experienceService';
import { Skill } from '../services/skillService';
import { Language } from '../services/languageService';
import { Publication } from '../services/publicationService';
import { Project } from '../services/projectService';
import { Award } from '../services/awardService';
import { useReference } from '../context/ReferenceContext';
import { Reference } from '../services/referenceService';
import EducationList from '../components/Education/EducationList';
import EducationFormModal from '../components/Education/EducationFormModal';
import ExperienceList from '../components/Experience/ExperienceList';
import ExperienceFormModal from '../components/Experience/ExperienceFormModal';
import ExperienceStats from '../components/Experience/ExperienceStats';
import SkillList from '../components/Skills/SkillList';
import SkillFormModal from '../components/Skills/SkillFormModal';
import SkillStats from '../components/Skills/SkillStats';
import LanguageList from '../components/Languages/LanguageList';
import LanguageFormModal from '../components/Languages/LanguageFormModal';
import PublicationList from '../components/Publications/PublicationList';
import PublicationFormModal from '../components/Publications/PublicationFormModal';
import ProjectList from '../components/Projects/ProjectList';
import ProjectFormModal from '../components/Projects/ProjectFormModal';
import AwardList from '../components/Awards/AwardList';
import AwardFormModal from '../components/Awards/AwardFormModal';
import ReferenceList from '../components/References/ReferenceList';
import ReferenceFormModal from '../components/References/ReferenceFormModal';

const ProfessionalPage: React.FC = () => {
  const {
    education,
    loading: educationLoading,
    error: educationError,
    creating: educationCreating,
    updating: educationUpdating,
    reordering: educationReordering,
    createEducation,
    updateEducation,
    deleteEducation,
    moveEducationUp,
    moveEducationDown,
    exportEducation,
    clearError: clearEducationError
  } = useEducation();

  const {
    experience,
    stats: experienceStats,
    loading: experienceLoading,
    error: experienceError,
    creating: experienceCreating,
    updating: experienceUpdating,
    reordering: experienceReordering,
    createExperience,
    updateExperience,
    deleteExperience,
    moveExperienceUp,
    moveExperienceDown,
    exportExperience,
    clearError: clearExperienceError
  } = useExperience();

  const {
    skills,
    stats: skillStats,
    loading: skillLoading,
    error: skillError,
    creating: skillCreating,
    updating: skillUpdating,
    reordering: skillReordering,
    createSkill,
    updateSkill,
    deleteSkill,
    moveSkillUp,
    moveSkillDown,
    toggleSkillHighlight,
    exportSkills,
    clearError: clearSkillError
  } = useSkill();

  const {
    languages,
    loading: languageLoading,
    error: languageError,
    creating: languageCreating,
    updating: languageUpdating,
    reordering: languageReordering,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    moveLanguageUp,
    moveLanguageDown,
    clearError: clearLanguageError
  } = useLanguage();

  const {
    publications,
    creating: publicationCreating,
    updating: publicationUpdating,
    reordering: publicationReordering,
    createPublication,
    updatePublication,
    deletePublication,
    movePublicationUp,
    movePublicationDown,
  } = usePublications();

  const {
    projects,
    creating: projectCreating,
    updating: projectUpdating,
    reordering: projectReordering,
    createProject,
    updateProject,
    deleteProject,
    moveProjectUp,
    moveProjectDown,
  } = useProject();

  const {
    awards,
    creating: awardCreating,
    updating: awardUpdating,
    reordering: awardReordering,
    createAward,
    updateAward,
    deleteAward,
    moveAwardUp,
    moveAwardDown,
  } = useAward();
  
  const {
    references,
    creating: creatingReference,
    updating: updatingReference,
    reordering: reorderingReference,
    createReference,
    updateReference,
    deleteReference,
    moveReferenceUp,
    moveReferenceDown,
  } = useReference();
  
  console.log('ProfessionalPage: languages from context:', languages);
  console.log('ProfessionalPage: publications from context:', publications);
  console.log('ProfessionalPage: projects from context:', projects);
  console.log('ProfessionalPage: awards from context:', awards);
  console.log('ProfessionalPage: references from context:', references);

  const [activeTab, setActiveTab] = useState<'education' | 'experience' | 'skills' | 'languages' | 'publications' | 'projects' | 'awards' | 'references'>('education');
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isPublicationModalOpen, setIsPublicationModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [editingReference, setEditingReference] = useState<Reference | null>(null);

  // Education handlers
  const handleAddEducation = () => {
    setEditingEducation(null);
    setIsEducationModalOpen(true);
  };

  const handleEditEducation = (education: Education) => {
    setEditingEducation(education);
    setIsEducationModalOpen(true);
  };

  const handleCloseEducationModal = () => {
    setIsEducationModalOpen(false);
    setEditingEducation(null);
  };

  // Experience handlers
  const handleAddExperience = () => {
    setEditingExperience(null);
    setIsExperienceModalOpen(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setIsExperienceModalOpen(true);
  };

  const handleCloseExperienceModal = () => {
    setIsExperienceModalOpen(false);
    setEditingExperience(null);
  };

  // Skill handlers
  const handleAddSkill = () => {
    setEditingSkill(null);
    setIsSkillModalOpen(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setIsSkillModalOpen(true);
  };

  const handleCloseSkillModal = () => {
    setIsSkillModalOpen(false);
    setEditingSkill(null);
  };

  // Language handlers
  const handleAddLanguage = () => {
    setEditingLanguage(null);
    setIsLanguageModalOpen(true);
  };

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language);
    setIsLanguageModalOpen(true);
  };

  const handleCloseLanguageModal = () => {
    setIsLanguageModalOpen(false);
    setEditingLanguage(null);
  };

  // Publication handlers
  const handleAddPublication = () => {
    setEditingPublication(null);
    setIsPublicationModalOpen(true);
  };

  const handleEditPublication = (publication: Publication) => {
    setEditingPublication(publication);
    setIsPublicationModalOpen(true);
  };

  const handleClosePublicationModal = () => {
    setIsPublicationModalOpen(false);
    setEditingPublication(null);
  };

  // Project handlers
  const handleAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  // Award handlers
  const handleAddAward = () => {
    setEditingAward(null);
    setIsAwardModalOpen(true);
  };

  const handleEditAward = (award: Award) => {
    setEditingAward(award);
    setIsAwardModalOpen(true);
  };

  const handleCloseAwardModal = () => {
    setIsAwardModalOpen(false);
    setEditingAward(null);
  };

  const handleSubmitEducation = async (data: any) => {
    if (editingEducation) {
      return await updateEducation(editingEducation._id, data);
    } else {
      return await createEducation(data);
    }
  };

  const handleSubmitExperience = async (data: any) => {
    if (editingExperience) {
      return await updateExperience(editingExperience._id, data);
    } else {
      return await createExperience(data);
    }
  };

  const handleSubmitSkill = async (data: any) => {
    if (editingSkill) {
      return await updateSkill(editingSkill._id, data);
    } else {
      return await createSkill(data);
    }
  };

  const handleSubmitLanguage = async (data: any) => {
    if (editingLanguage) {
      const result = await updateLanguage(editingLanguage._id, data);
      return result !== null;
    } else {
      const result = await createLanguage(data);
      return result !== null;
    }
  };

  const handleSubmitPublication = async (data: any) => {
    if (editingPublication) {
      const result = await updatePublication(editingPublication._id, data);
      return result !== null;
    } else {
      const result = await createPublication(data);
      return result !== null;
    }
  };

  const handleSubmitProject = async (data: any) => {
    if (editingProject) {
      const result = await updateProject(editingProject._id, data);
      return result !== null;
    } else {
      const result = await createProject(data);
      return result !== null;
    }
  };

  const handleSubmitAward = async (data: any) => {
    if (editingAward) {
      const result = await updateAward(editingAward._id, data);
      return result !== null;
    } else {
      const result = await createAward(data);
      return result !== null;
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (globalThis.confirm('Are you sure you want to delete this education entry?')) {
      await deleteEducation(id);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (globalThis.confirm('Are you sure you want to delete this work experience entry?')) {
      await deleteExperience(id);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (globalThis.confirm('Are you sure you want to delete this skill?')) {
      await deleteSkill(id);
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    if (globalThis.confirm('Are you sure you want to delete this language?')) {
      await deleteLanguage(id);
    }
  };

  const handleDeletePublication = async (id: string) => {
    if (globalThis.confirm('Are you sure you want to delete this publication?')) {
      await deletePublication(id);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (globalThis.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  const handleDeleteAward = async (id: string) => {
    if (globalThis.confirm('Are you sure you want to delete this award?')) {
      await deleteAward(id);
    }
  };

  const handleMoveEducationUp = async (id: string) => {
    await moveEducationUp(id);
  };

  const handleMoveEducationDown = async (id: string) => {
    await moveEducationDown(id);
  };

  const handleMoveExperienceUp = async (id: string) => {
    await moveExperienceUp(id);
  };

  const handleMoveExperienceDown = async (id: string) => {
    await moveExperienceDown(id);
  };

  const handleMoveSkillUp = async (id: string) => {
    await moveSkillUp(id);
  };

  const handleMoveSkillDown = async (id: string) => {
    await moveSkillDown(id);
  };

  const handleMoveLanguageUp = async (id: string) => {
    await moveLanguageUp(id);
  };

  const handleMoveLanguageDown = async (id: string) => {
    await moveLanguageDown(id);
  };

  const handleMovePublicationUp = async (id: string) => {
    await movePublicationUp(id);
  };

  const handleMovePublicationDown = async (id: string) => {
    await movePublicationDown(id);
  };

  const handleMoveProjectUp = async (id: string) => {
    await moveProjectUp(id);
  };

  const handleMoveProjectDown = async (id: string) => {
    await moveProjectDown(id);
  };

  const handleMoveAwardUp = async (id: string) => {
    await moveAwardUp(id);
  };

  const handleMoveAwardDown = async (id: string) => {
    await moveAwardDown(id);
  };

  // Reference handlers
  const handleAddReference = () => {
    setEditingReference(null);
    setIsReferenceModalOpen(true);
  };

  const handleEditReference = (reference: Reference) => {
    setEditingReference(reference);
    setIsReferenceModalOpen(true);
  };

  const handleCloseReferenceModal = () => {
    setIsReferenceModalOpen(false);
    setEditingReference(null);
  };

  const handleSubmitReference = async (data: any) => {
    if (editingReference) {
      const result = await updateReference(editingReference._id, data);
      return result !== null;
    } else {
      const result = await createReference(data);
      return result !== null;
    }
  };

  const handleDeleteReference = async (id: string) => {
    await deleteReference(id);
  };

  const handleMoveReferenceUp = async (id: string) => {
    await moveReferenceUp(id);
  };

  const handleMoveReferenceDown = async (id: string) => {
    await moveReferenceDown(id);
  };

  const handleExportEducation = async () => {
    await exportEducation();
  };

  const handleExportExperience = async () => {
    await exportExperience();
  };

  const handleExportSkills = async () => {
    await exportSkills();
  };

  if (educationError || experienceError || skillError || languageError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading professional information: {educationError || experienceError || skillError || languageError}</p>
          <div className="mt-2 space-x-2">
            {educationError && (
              <button
                onClick={clearEducationError}
                className="text-sm underline hover:no-underline"
              >
                Dismiss Education Error
              </button>
            )}
            {experienceError && (
              <button
                onClick={clearExperienceError}
                className="text-sm underline hover:no-underline"
              >
                Dismiss Experience Error
              </button>
            )}
            {skillError && (
              <button
                onClick={clearSkillError}
                className="text-sm underline hover:no-underline"
              >
                Dismiss Skills Error
              </button>
            )}
            {languageError && (
              <button
                onClick={clearLanguageError}
                className="text-sm underline hover:no-underline"
              >
                Dismiss Languages Error
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Information</h1>
          <p className="text-gray-600">
            Manage your education, work experience, and professional achievements.
          </p>
        </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
              <nav className="flex flex-wrap gap-4">
                <button
                  onClick={() => setActiveTab('education')}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium ${
                    activeTab === 'education'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                  <span>Education</span>
                </button>
                <button
                  onClick={() => setActiveTab('experience')}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium ${
                    activeTab === 'experience'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                  <span>Work Experience</span>
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium ${
                    activeTab === 'skills'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Trophy className="h-5 w-5" />
                  <span>Skills & Certifications</span>
                </button>
                <button
                  onClick={() => setActiveTab('languages')}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium ${
                    activeTab === 'languages'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Globe className="h-5 w-5" />
                  <span>Languages</span>
                </button>
                <button
                  onClick={() => setActiveTab('publications')}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium ${
                    activeTab === 'publications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>Publications</span>
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium ${
                    activeTab === 'projects'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Code className="h-5 w-5" />
                  <span>Projects</span>
                </button>
                <button
                  onClick={() => setActiveTab('awards')}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium ${
                    activeTab === 'awards'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Trophy className="h-5 w-5" />
                  <span>Awards</span>
                </button>
                <button
                  onClick={() => setActiveTab('references')}
                  className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium ${
                    activeTab === 'references'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>References</span>
                </button>
              </nav>
            </div>

        {/* Tab Content */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            {/* Education Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Education</h2>
                <p className="text-gray-600 mt-1">
                  Add your educational background and academic achievements.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportEducation}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleAddEducation}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Education</span>
                </button>
              </div>
            </div>

            {/* Education List */}
            <div className="bg-gray-50 rounded-lg p-6">
              <EducationList
                education={education}
                onEdit={handleEditEducation}
                onDelete={handleDeleteEducation}
                onMoveUp={handleMoveEducationUp}
                onMoveDown={handleMoveEducationDown}
                loading={educationLoading}
                reordering={educationReordering}
              />
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-6">
            {/* Experience Statistics */}
            <ExperienceStats stats={experienceStats} loading={experienceLoading} />

            {/* Experience Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Work Experience</h2>
                <p className="text-gray-600 mt-1">
                  Add your professional work history and career achievements.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportExperience}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleAddExperience}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Experience</span>
                </button>
              </div>
            </div>

            {/* Experience List */}
            <div className="bg-gray-50 rounded-lg p-6">
              <ExperienceList
                experience={experience}
                onEdit={handleEditExperience}
                onDelete={handleDeleteExperience}
                onMoveUp={handleMoveExperienceUp}
                onMoveDown={handleMoveExperienceDown}
                loading={experienceLoading}
                reordering={experienceReordering}
              />
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            {/* Skills Statistics */}
            <SkillStats stats={skillStats} loading={skillLoading} />

            {/* Skills Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Skills & Certifications</h2>
                <p className="text-gray-600 mt-1">
                  Showcase your technical skills, certifications, and professional qualifications.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportSkills}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleAddSkill}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            {/* Skills List */}
            <div className="bg-gray-50 rounded-lg p-6">
              <SkillList
                skills={skills}
                onEdit={handleEditSkill}
                onDelete={handleDeleteSkill}
                onMoveUp={handleMoveSkillUp}
                onMoveDown={handleMoveSkillDown}
                onToggleHighlight={toggleSkillHighlight}
                loading={skillLoading}
                reordering={skillReordering}
              />
            </div>
          </div>
        )}

        {/* Coming Soon Sections */}

            {activeTab === 'languages' && (
              <div className="space-y-6">
                {/* Languages Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Languages</h2>
                    <p className="text-gray-600 mt-1">
                      Add your language skills and certifications.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleAddLanguage}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Language</span>
                    </button>
                  </div>
                </div>

                {/* Languages List */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <LanguageList
                    languages={languages || []}
                    onEdit={handleEditLanguage}
                    onDelete={handleDeleteLanguage}
                    onMoveUp={handleMoveLanguageUp}
                    onMoveDown={handleMoveLanguageDown}
                    loading={languageLoading}
                    reordering={languageReordering}
                  />
                </div>
              </div>
            )}

            {activeTab === 'publications' && (
              <div className="space-y-6">
                {/* Publications Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Publications</h2>
                    <p className="text-gray-600 mt-1">
                      Add your research papers, articles, and publications.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleAddPublication}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Publication</span>
                    </button>
                  </div>
                </div>

                {/* Publications List */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <PublicationList
                    publications={publications || []}
                    onEdit={handleEditPublication}
                    onDelete={handleDeletePublication}
                    onMoveUp={handleMovePublicationUp}
                    onMoveDown={handleMovePublicationDown}
                    isReordering={publicationReordering}
                  />
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                {/* Projects Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>
                    <p className="text-gray-600 mt-1">
                      Showcase your personal and professional projects.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleAddProject}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Project</span>
                    </button>
                  </div>
                </div>

                {/* Projects List */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <ProjectList
                    projects={projects || []}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    onMoveUp={handleMoveProjectUp}
                    onMoveDown={handleMoveProjectDown}
                    isReordering={projectReordering}
                  />
                </div>
              </div>
            )}

            {activeTab === 'awards' && (
              <div className="space-y-6">
                {/* Awards Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Awards</h2>
                    <p className="text-gray-600 mt-1">
                      Add your achievements, awards, and recognitions.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleAddAward}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Award</span>
                    </button>
                  </div>
                </div>

                {/* Awards List */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <AwardList
                    awards={awards || []}
                    onEdit={handleEditAward}
                    onDelete={handleDeleteAward}
                    onMoveUp={handleMoveAwardUp}
                    onMoveDown={handleMoveAwardDown}
                    isReordering={awardReordering}
                  />
                </div>
              </div>
            )}

            {activeTab === 'references' && (
              <div className="space-y-6">
                {/* References Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">References</h2>
                    <p className="text-gray-600">Manage your professional references</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddReference}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Reference
                    </button>
                  </div>
                </div>

                {/* References List */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <ReferenceList
                    references={references || []}
                    onEdit={handleEditReference}
                    onDelete={handleDeleteReference}
                    onMoveUp={handleMoveReferenceUp}
                    onMoveDown={handleMoveReferenceDown}
                    isReordering={reorderingReference}
                  />
                </div>
              </div>
            )}
      </div>

      {/* Education Form Modal */}
      <EducationFormModal
        isOpen={isEducationModalOpen}
        onClose={handleCloseEducationModal}
        onSubmit={handleSubmitEducation}
        education={editingEducation}
        loading={educationCreating || educationUpdating}
      />

      {/* Experience Form Modal */}
      <ExperienceFormModal
        isOpen={isExperienceModalOpen}
        onClose={handleCloseExperienceModal}
        onSubmit={handleSubmitExperience}
        experience={editingExperience}
        loading={experienceCreating || experienceUpdating}
      />

      {/* Skills Form Modal */}
      <SkillFormModal
        isOpen={isSkillModalOpen}
        onClose={handleCloseSkillModal}
        onSubmit={handleSubmitSkill}
        skill={editingSkill}
        loading={skillCreating || skillUpdating}
      />

      {/* Language Form Modal */}
      <LanguageFormModal
        isOpen={isLanguageModalOpen}
        onClose={handleCloseLanguageModal}
        onSubmit={handleSubmitLanguage}
        language={editingLanguage}
        loading={languageCreating || languageUpdating}
      />

      {/* Publication Form Modal */}
      <PublicationFormModal
        isOpen={isPublicationModalOpen}
        onClose={handleClosePublicationModal}
        onSubmit={handleSubmitPublication}
        publication={editingPublication}
        isSubmitting={publicationCreating || publicationUpdating}
      />

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        onSubmit={handleSubmitProject}
        project={editingProject}
        isSubmitting={projectCreating || projectUpdating}
      />

      {/* Award Form Modal */}
      <AwardFormModal
        isOpen={isAwardModalOpen}
        onClose={handleCloseAwardModal}
        onSubmit={handleSubmitAward}
        award={editingAward}
        isSubmitting={awardCreating || awardUpdating}
      />

      {/* Reference Form Modal */}
      <ReferenceFormModal
        isOpen={isReferenceModalOpen}
        onClose={handleCloseReferenceModal}
        onSubmit={handleSubmitReference}
        reference={editingReference}
        isSubmitting={creatingReference || updatingReference}
      />
    </div>
  );
};

export default ProfessionalPage;
