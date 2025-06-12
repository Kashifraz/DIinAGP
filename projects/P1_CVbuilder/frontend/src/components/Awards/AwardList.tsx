import React from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, ExternalLink, Trophy, Calendar, Building } from 'lucide-react';
import { Award } from '../../services/awardService';

interface AwardListProps {
  awards: Award[];
  onEdit: (award: Award) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isReordering?: boolean;
}

const AwardList: React.FC<AwardListProps> = ({
  awards = [],
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReordering = false
}) => {
  if (!awards || awards.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Awards Added</h3>
        <p className="text-gray-500">Start building your achievements by adding your first award.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: 'bg-blue-100 text-blue-800',
      professional: 'bg-green-100 text-green-800',
      personal: 'bg-purple-100 text-purple-800',
      sports: 'bg-orange-100 text-orange-800',
      arts: 'bg-pink-100 text-pink-800',
      community: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      academic: 'Academic',
      professional: 'Professional',
      recognition: 'Recognition',
      competition: 'Competition',
      achievement: 'Achievement',
      service: 'Service',
      leadership: 'Leadership',
      innovation: 'Innovation',
      other: 'Other'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="space-y-4">
      {awards.map((award, index) => (
        <div
          key={award._id || index}
          className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${
            award.isActive ? '' : 'opacity-60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title and Badges */}
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {award.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(award.category)}`}>
                  {getCategoryText(award.category)}
                </span>
                {!award.isActive && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    INACTIVE
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {award.description}
              </p>

              {/* Award Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                {/* Issuer */}
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  <span>{award.issuer}</span>
                </div>

                {/* Date */}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(award.dateReceived)}</span>
                </div>
              </div>

              {/* Location */}
              {award.location && (
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Location:</span> {award.location}
                </div>
              )}

              {/* URLs */}
              <div className="flex items-center space-x-4 text-sm mb-3">
                {award.url && (
                  <a
                    href={award.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Award Details
                  </a>
                )}
                {award.certificateUrl && (
                  <a
                    href={award.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Certificate
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Reorder Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onMoveUp(award._id)}
                  disabled={index === 0 || isReordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveDown(award._id)}
                  disabled={index === awards.length - 1 || isReordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Edit and Delete Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onEdit(award)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Edit award"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(award._id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Delete award"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AwardList;
