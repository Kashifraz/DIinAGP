import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { profileService, Profile, ProfileUpdateData, ProfileCompletion } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';

interface ProfileState {
  profile: Profile | null;
  completion: ProfileCompletion | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  uploading: boolean;
}

type ProfileAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'SET_COMPLETION'; payload: ProfileCompletion }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'CLEAR_PROFILE' };

const initialState: ProfileState = {
  profile: null,
  completion: null,
  loading: false,
  error: null,
  updating: false,
  uploading: false,
};

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_UPDATING':
      return { ...state, updating: action.payload, error: null };
    case 'SET_UPLOADING':
      return { ...state, uploading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, updating: false, uploading: false };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, loading: false, error: null };
    case 'SET_COMPLETION':
      return { ...state, completion: action.payload };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile ? { ...state.profile, ...action.payload } : null,
        updating: false,
        uploading: false,
        error: null,
      };
    case 'CLEAR_PROFILE':
      return { ...initialState };
    default:
      return state;
  }
};

interface ProfileContextType {
  state: ProfileState;
  actions: {
    loadProfile: () => Promise<void>;
    updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
    uploadPhoto: (file: File) => Promise<boolean>;
    deletePhoto: () => Promise<boolean>;
    loadCompletion: () => Promise<void>;
    clearProfile: () => void;
  };
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { authState } = useAuth();

  // Load profile when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      // Only load profile if we don't already have it
      if (!state.profile) {
        // Add a small delay to ensure authentication is fully established
        const timer = setTimeout(() => {
          loadProfile().catch((error) => {
            console.error('Failed to load profile:', error);
            // Don't let profile loading errors affect authentication
          });
          loadCompletion().catch((error) => {
            console.error('Failed to load profile completion:', error);
            // Don't let profile completion errors affect authentication
          });
        }, 100);

        return () => clearTimeout(timer);
      }
    } else {
      clearProfile();
    }
  }, [authState.isAuthenticated, authState.user]);

  const loadProfile = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await profileService.getProfile();
      
      if (response.success) {
        dispatch({ type: 'SET_PROFILE', payload: response.data.profile });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to load profile' });
    }
  };

  const updateProfile = async (data: ProfileUpdateData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      const response = await profileService.updateProfile(data);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROFILE', payload: response.data.profile });
        // Reload completion after profile update
        await loadCompletion();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return false;
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update profile' });
      return false;
    }
  };

  const uploadPhoto = async (file: File): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_UPLOADING', payload: true });
      const response = await profileService.uploadPhoto(file);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROFILE', payload: response.data.profile });
        // Reload completion after photo upload
        await loadCompletion();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return false;
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to upload photo' });
      return false;
    }
  };

  const deletePhoto = async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_UPLOADING', payload: true });
      const response = await profileService.deletePhoto();
      
      if (response.success) {
        dispatch({ type: 'UPDATE_PROFILE', payload: response.data.profile });
        // Reload completion after photo deletion
        await loadCompletion();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return false;
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to delete photo' });
      return false;
    }
  };

  const loadCompletion = async (): Promise<void> => {
    try {
      const response = await profileService.getProfileCompletion();
      
      if (response.success) {
        dispatch({ type: 'SET_COMPLETION', payload: response.data });
      }
    } catch (error: any) {
      // Don't set error for completion loading failure
      console.error('Failed to load profile completion:', error);
    }
  };

  const clearProfile = (): void => {
    dispatch({ type: 'CLEAR_PROFILE' });
  };

  const contextValue: ProfileContextType = useMemo(() => ({
    state,
    actions: {
      loadProfile,
      updateProfile,
      uploadPhoto,
      deletePhoto,
      loadCompletion,
      clearProfile,
    },
  }), [state, loadProfile, updateProfile, uploadPhoto, deletePhoto, loadCompletion, clearProfile]);

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
