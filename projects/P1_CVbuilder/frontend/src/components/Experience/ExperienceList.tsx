import React from 'react';
import { Experience } from '../../services/experienceService';
import { ChevronUp, ChevronDown, Edit, Trash2, Calendar, MapPin, Building2, Briefcase } from 'lucide-react';

interface ExperienceListProps {
  experience: Experience[];
  onEdit: (experience: Experience) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  loading?: boolean;
  reordering?: boolean;
}

const ExperienceList: React.FC<ExperienceListProps> = ({
  experience,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
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

  if (!experience || experience.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No work experience yet</h3>
        <p className="text-gray-500 mb-6">
          Add your work experience to showcase your professional background and achievements.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const formatEmploymentType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance',
      'consulting': 'Consulting'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-4">
      {experience.map((exp, index) => (
        <div key={exp._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {formatEmploymentType(exp.employmentType)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{exp.company}</span>
                </div>
                {exp.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{exp.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : '')}
                </span>
                {exp.duration && (
                  <span className="ml-2 text-gray-400">• {exp.duration}</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onMoveUp(exp._id)}
                disabled={index === 0 || reordering}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onMoveDown(exp._id)}
                disabled={index === experience.length - 1 || reordering}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onEdit(exp)}
                className="p-2 text-gray-400 hover:text-primary-600"
                title="Edit experience"
              >
                <Edit className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => onDelete(exp._id)}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Delete experience"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {exp.description && (
            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
            </div>
          )}

          {exp.achievements && exp.achievements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Key Achievements:</h4>
              <ul className="list-disc list-inside space-y-1">
                {exp.achievements.map((achievement, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{achievement}</li>
                ))}
              </ul>
            </div>
          )}

          {exp.skills && exp.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Used:</h4>
              <div className="flex flex-wrap gap-2">
                {exp.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExperienceList;
