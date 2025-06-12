import React from 'react';
import { ChevronUp, ChevronDown, Edit, Trash2, Award, Globe } from 'lucide-react';
import { Language, getProficiencyColor, getProficiencyPercentage, formatProficiencyLevel } from '../../services/languageService';

interface LanguageListProps {
  languages: Language[];
  onEdit: (language: Language) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  loading?: boolean;
  reordering?: boolean;
}

const LanguageList: React.FC<LanguageListProps> = ({
  languages,
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
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!languages || languages.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Languages Added</h3>
        <p className="text-gray-600 mb-4">
          Start building your language profile by adding your first language.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {languages.map((language, index) => (
        <div key={language._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language.name}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProficiencyColor(language.proficiency)}`}>
                  {formatProficiencyLevel(language.proficiency)}
                </span>
              </div>
              
              {/* Proficiency Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProficiencyPercentage(language.proficiency)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {getProficiencyPercentage(language.proficiency)}% proficiency
                </p>
              </div>

              {/* Certifications */}
              {language.certifications && language.certifications.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Certifications ({language.certifications.length})
                  </h4>
                  <div className="space-y-2">
                    {language.certifications.map((cert, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">
                              {cert.name}
                            </h5>
                            {cert.issuer && <p className="text-gray-600 text-xs">Issued by: {cert.issuer}</p>}
                            {cert.credentialId && <p className="text-gray-500 text-xs">ID: {cert.credentialId}</p>}
                            {cert.dateObtained && <p className="text-gray-500 text-xs">Date: {new Date(cert.dateObtained).toLocaleDateString()}</p>}
                            {cert.expiryDate && <p className="text-gray-500 text-xs">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onMoveUp(language._id)}
                disabled={reordering || index === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => onMoveDown(language._id)}
                disabled={reordering || index === languages.length - 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(language)}
                className="p-2 text-blue-600 hover:text-blue-800"
                title="Edit language"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(language._id)}
                className="p-2 text-red-600 hover:text-red-800"
                title="Delete language"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LanguageList;