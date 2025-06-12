import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, User } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { profileService } from '../../services/profileService';

interface PhotoUploadProps {
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ className = '' }) => {
  const { state, actions } = useProfile();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile, uploading } = state;
  const { uploadPhoto, deletePhoto } = actions;

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadPhoto(file).then((success) => {
      if (success) {
        setPreview(null);
      }
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDeletePhoto = async () => {
    if (window.confirm('Are you sure you want to delete your profile photo?')) {
      const success = await deletePhoto();
      if (success) {
        setPreview(null);
      }
    }
  };

  const getPhotoUrl = () => {
    if (preview) return preview;
    if (profile?.photo) {
      const url = profileService.getPhotoUrl(profile.photo);
      return url;
    }
    return null;
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Photo Display */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          {/* Delete button */}
          {profile?.photo && !uploading && (
            <button
              onClick={handleDeletePhoto}
              className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Delete photo"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <div
            className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            <div className="text-center">
              {uploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  <span className="text-sm text-gray-600">Uploading...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <Camera className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary-600 hover:text-primary-500 font-medium"
                      >
                        Click to upload
                      </button>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF, WebP up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Info */}
      {profile?.photo && (
        <div className="text-sm text-gray-600">
          <p>Current photo: {profile.photo}</p>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
