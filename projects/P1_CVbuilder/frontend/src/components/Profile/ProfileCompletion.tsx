import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';

interface ProfileCompletionProps {
  className?: string;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ className = '' }) => {
  const { state } = useProfile();
  const { completion } = state;

  if (!completion) {
    return null;
  }

  const { percentage, completedFields, totalFields, missingFields } = completion;

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCompletionIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-5 w-5" />;
    if (percentage >= 60) return <AlertCircle className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
  };

  const getCompletionMessage = (percentage: number) => {
    if (percentage >= 80) return 'Profile is well completed!';
    if (percentage >= 60) return 'Profile is partially completed.';
    return 'Profile needs more information.';
  };

  const fieldLabels: Record<string, string> = {
    fullName: 'Full Name',
    professionalTitle: 'Professional Title',
    phone: 'Phone Number',
    location: 'Location',
    bio: 'Bio/Summary',
    photo: 'Profile Photo',
    'socialLinks.linkedin': 'LinkedIn Profile',
    'socialLinks.github': 'GitHub Profile',
    'socialLinks.portfolio': 'Portfolio Website',
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getCompletionColor(percentage)}`}>
          {getCompletionIcon(percentage)}
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{getCompletionMessage(percentage)}</span>
          <span>{completedFields} of {totalFields} fields completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Missing Information:</h4>
          <ul className="space-y-1">
            {missingFields.map((field) => (
              <li key={field} className="flex items-center space-x-2 text-sm text-gray-600">
                <Circle className="h-4 w-4 text-gray-400" />
                <span>{fieldLabels[field] || field}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion Tips */}
      {percentage < 100 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Complete your profile to make your CV more professional and increase your chances of getting noticed by employers.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;
