import React from 'react';
import { User } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { profileService } from '../../services/profileService';
import { getInitials } from '../../utils';

interface ProfilePhotoProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ 
  size = 'md', 
  showName = false, 
  className = '' 
}) => {
  const { state } = useProfile();
  const { profile } = state;

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-primary-100 flex items-center justify-center overflow-hidden`}>
        {profile?.photo ? (
          <img
            src={profileService.getPhotoUrl(profile.photo) || ''}
            alt={profile.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={`${textSizeClasses[size]} font-medium text-primary-600`}>
            {profile ? getInitials(profile.fullName) : 'U'}
          </span>
        )}
      </div>
      {showName && profile && (
        <span className="text-sm font-medium text-gray-700">
          {profile.fullName}
        </span>
      )}
    </div>
  );
};

export default ProfilePhoto;
