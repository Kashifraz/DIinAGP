import React from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, ExternalLink, BookOpen, Calendar, User } from 'lucide-react';
import { Publication } from '../../services/publicationService';

interface PublicationListProps {
  publications: Publication[];
  onEdit: (publication: Publication) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isReordering?: boolean;
}

const PublicationList: React.FC<PublicationListProps> = ({
  publications = [],
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReordering = false
}) => {
  if (!publications || publications.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Publications Added</h3>
        <p className="text-gray-500">Start building your publication portfolio by adding your first publication.</p>
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      journal: 'bg-blue-100 text-blue-800',
      conference: 'bg-green-100 text-green-800',
      book: 'bg-purple-100 text-purple-800',
      book_chapter: 'bg-indigo-100 text-indigo-800',
      patent: 'bg-yellow-100 text-yellow-800',
      blog: 'bg-pink-100 text-pink-800',
      article: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-4">
      {publications.map((publication, index) => (
        <div
          key={publication._id || index}
          className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${
            publication.isActive ? '' : 'opacity-60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title and Type */}
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {publication.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(publication.type)}`}>
                  {publication.type.replace('_', ' ').toUpperCase()}
                </span>
                {!publication.isActive && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    INACTIVE
                  </span>
                )}
              </div>

              {/* Authors */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <User className="w-4 h-4 mr-2" />
                <span>
                  {publication.authors?.map(author => author.name).join(', ') || 'No authors'}
                </span>
              </div>

              {/* Publisher and Date */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="mr-4">{publication.publisher}</span>
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(publication.publicationDate)}</span>
              </div>

              {/* DOI, URL, and Citation Count */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                {publication.doi && (
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    DOI: {publication.doi}
                  </span>
                )}
                {publication.url && (
                  <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Publication
                  </a>
                )}
                {publication.citationCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {publication.citationCount} citations
                  </span>
                )}
              </div>

              {/* Keywords */}
              {publication.keywords && publication.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
              {publication.keywords.map((keyword, idx) => (
                <span
                  key={`keyword-${idx}-${keyword}`}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {keyword}
                </span>
              ))}
                </div>
              )}

              {/* Abstract */}
              {publication.abstract && (
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                  {publication.abstract}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Reorder Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onMoveUp(publication._id)}
                  disabled={index === 0 || isReordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveDown(publication._id)}
                  disabled={index === publications.length - 1 || isReordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Edit and Delete Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onEdit(publication)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Edit publication"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(publication._id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Delete publication"
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

export default PublicationList;