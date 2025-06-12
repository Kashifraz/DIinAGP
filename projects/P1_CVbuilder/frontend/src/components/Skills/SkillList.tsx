import React from 'react';
import { Skill, skillService } from '../../services/skillService';
import { ChevronUp, ChevronDown, Edit, Trash2, Star, StarOff, Award, Briefcase, Calendar, ExternalLink } from 'lucide-react';

interface SkillListProps {
  skills: Skill[];
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleHighlight: (id: string) => void;
  loading?: boolean;
  reordering?: boolean;
}

const SkillList: React.FC<SkillListProps> = ({
  skills,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleHighlight,
  loading = false,
  reordering = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No skills yet</h3>
        <p className="text-gray-500 mb-6">
          Add your skills to showcase your expertise and professional capabilities.
        </p>
      </div>
    );
  }

  const getProficiencyBar = (proficiency: string) => {
    const proficiencyMap: Record<string, number> = {
      'beginner': 25,
      'intermediate': 50,
      'advanced': 75,
      'expert': 100
    };
    const percentage = proficiencyMap[proficiency] || 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <div key={skill._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{skill.name}</h3>
                {skill.isHighlighted && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skillService.getCategoryColor(skill.category)}`}>
                  {skillService.getCategoryDisplayName(skill.category)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skillService.getProficiencyColor(skill.proficiency)}`}>
                  {skillService.getProficiencyDisplayName(skill.proficiency)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                {skill.yearsOfExperience && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{skill.yearsOfExperience} years experience</span>
                  </div>
                )}
                {skill.proficiencyPercentage && (
                  <div className="flex items-center gap-1">
                    <span>{skill.proficiencyPercentage}% proficiency</span>
                  </div>
                )}
              </div>

              {skill.proficiencyPercentage && (
                <div className="mb-3">
                  {getProficiencyBar(skill.proficiency)}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onMoveUp(skill._id)}
                disabled={index === 0 || reordering}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onMoveDown(skill._id)}
                disabled={index === skills.length - 1 || reordering}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onToggleHighlight(skill._id)}
                className={`p-2 ${skill.isHighlighted ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                title={skill.isHighlighted ? 'Remove highlight' : 'Highlight skill'}
              >
                {skill.isHighlighted ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => onEdit(skill)}
                className="p-2 text-gray-400 hover:text-primary-600"
                title="Edit skill"
              >
                <Edit className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onDelete(skill._id)}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Delete skill"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {skill.description && (
            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">{skill.description}</p>
            </div>
          )}

          {skill.certifications && skill.certifications.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                <Award className="h-4 w-4" />
                Certifications ({skill.certifications.length})
              </h4>
              <div className="space-y-2">
                {skill.certifications.map((cert, idx) => (
                  <div key={`cert-${idx}-${cert.name?.slice(0, 10)}`} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">{cert.name}</h5>
                        {cert.issuer && (
                          <p className="text-gray-600 text-xs mt-1">Issued by: {cert.issuer}</p>
                        )}
                        {cert.dateObtained && (
                          <p className="text-gray-500 text-xs">
                            Obtained: {new Date(cert.dateObtained).toLocaleDateString()}
                          </p>
                        )}
                        {cert.credentialId && (
                          <p className="text-gray-500 text-xs">ID: {cert.credentialId}</p>
                        )}
                      </div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skill.projects && skill.projects.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                Projects ({skill.projects.length})
              </h4>
              <div className="space-y-2">
                {skill.projects.map((project, idx) => (
                  <div key={`project-${idx}-${project.name?.slice(0, 10)}`} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">{project.name}</h5>
                        {project.description && (
                          <p className="text-gray-600 text-xs mt-1">{project.description}</p>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.map((tech, techIdx) => (
                              <span
                                key={`tech-${techIdx}-${tech}`}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SkillList;
