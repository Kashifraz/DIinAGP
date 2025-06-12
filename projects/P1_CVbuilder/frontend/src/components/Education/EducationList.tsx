import React from 'react';
import { Education, educationService } from '../../services/educationService';
import { GraduationCap, MapPin, Calendar, Award, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface EducationListProps {
  education: Education[];
  onEdit: (education: Education) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  loading?: boolean;
  reordering?: boolean;
}

const EducationList: React.FC<EducationListProps> = ({
  education,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  loading = false,
  reordering = false
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (education.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Education Added</h3>
        <p className="text-gray-500 mb-6">
          Add your educational background to showcase your qualifications and achievements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <div
          key={edu._id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Institution and Degree */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {edu.institution}
                  </h3>
                  <p className="text-gray-700 font-medium">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                </div>
              </div>

              {/* Date Range and Location */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{edu.dateRange || educationService.formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}</span>
                  {edu.isCurrent && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
                      Current
                    </span>
                  )}
                </div>
                {edu.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{edu.location}</span>
                  </div>
                )}
              </div>

              {/* GPA and Duration */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                {edu.gpa && (
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>GPA: {edu.gpa}</span>
                  </div>
                )}
                {edu.duration && (
                  <span>Duration: {edu.duration}</span>
                )}
              </div>

              {/* Description */}
              {edu.description && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {edu.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Reorder Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onMoveUp(edu._id)}
                  disabled={index === 0 || reordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onMoveDown(edu._id)}
                  disabled={index === education.length - 1 || reordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Edit and Delete Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onEdit(edu)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit education"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(edu._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete education"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationList;
