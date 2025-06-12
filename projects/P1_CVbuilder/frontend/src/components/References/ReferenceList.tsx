import React from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, Mail, Phone, Building, User } from 'lucide-react';
import { Reference } from '../../services/referenceService';

interface ReferenceListProps {
  references: Reference[];
  onEdit: (reference: Reference) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isReordering?: boolean;
}

const ReferenceList: React.FC<ReferenceListProps> = ({
  references = [],
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReordering = false
}) => {
  if (!references || references.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No References Added</h3>
        <p className="text-gray-500">Start building your professional network by adding your first reference.</p>
      </div>
    );
  }

  const formatYearsKnown = (years: number | undefined) => {
    if (!years || years < 1) return 'Unknown';
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  return (
    <div className="space-y-4">
      {references.map((reference, index) => (
        <div
          key={reference._id || index}
          className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${
            reference.isActive ? '' : 'opacity-60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Name and Status */}
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reference.name}
                </h3>
                {!reference.isActive && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    INACTIVE
                  </span>
                )}
              </div>

              {/* Title and Company */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">
                  {reference.title}
                </p>
                <p className="text-sm text-gray-600">
                  {reference.company}
                </p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                {/* Email */}
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <a
                    href={`mailto:${reference.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {reference.email}
                  </a>
                </div>

                {/* Phone */}
                {reference.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <a
                      href={`tel:${reference.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {reference.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Relationship and Years Known */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                {/* Relationship */}
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>
                    <span className="font-medium">Relationship:</span> {reference.relationship}
                  </span>
                </div>

                {/* Years Known */}
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  <span>
                    <span className="font-medium">Known for:</span> {formatYearsKnown(reference.yearsKnown)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Reorder Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onMoveUp(reference._id)}
                  disabled={index === 0 || isReordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMoveDown(reference._id)}
                  disabled={index === references.length - 1 || isReordering}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Edit and Delete Buttons */}
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => onEdit(reference)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Edit reference"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(reference._id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="Delete reference"
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

export default ReferenceList;
