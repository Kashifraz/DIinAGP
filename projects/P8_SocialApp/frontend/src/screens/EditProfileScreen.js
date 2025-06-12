import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ProfilePhoto from '../components/ProfilePhoto';
import Input from '../components/Input';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const EditProfileScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { profile: initialProfile } = route.params || {};
  
  // Security check: Ensure user can only edit their own profile
  useEffect(() => {
    if (initialProfile && initialProfile.userId !== user?.userId) {
      showToast.error('You can only edit your own profile', 'Unauthorized');
      navigation.goBack();
    }
  }, [initialProfile, user, navigation]);
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [occupation, setOccupation] = useState(initialProfile?.occupation || '');
  const [relationshipStatus, setRelationshipStatus] = useState(initialProfile?.relationshipStatus || '');
  const [hobbies, setHobbies] = useState(initialProfile?.hobbies || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialProfile?.profilePhotoUrl || null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const relationshipOptions = [
    { label: 'Select status', value: '' },
    { label: 'Single', value: 'SINGLE' },
    { label: 'In a Relationship', value: 'IN_RELATIONSHIP' },
    { label: 'Married', value: 'MARRIED' },
  ];

  const getRelationshipLabel = () => {
    const option = relationshipOptions.find(opt => opt.value === relationshipStatus);
    return option ? option.label : 'Select status';
  };

  // Construct profile photo URL for display
  const getDisplayPhotoUrl = () => {
    if (!profilePhotoUrl) return null;
    // Extract just the filename (handle both old full path and new filename-only format)
    let filename = profilePhotoUrl.trim();
    if (filename.includes('/')) {
      filename = filename.split('/').pop();
    }
    if (filename.includes('\\')) {
      filename = filename.split('\\').pop();
    }
    // URL encode the filename to handle special characters
    const encodedFilename = encodeURIComponent(filename);
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/api/media/profile-photo/${encodedFilename}`;
  };

  const displayPhotoUrl = getDisplayPhotoUrl();

  // Web-compatible file input handler
  const handleWebFileInput = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a data URL from the file
      const reader = new FileReader();
      reader.onloadend = () => {
        uploadProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const pickImage = async () => {
    try {
      // For web, use native file input
      if (Platform.OS === 'web') {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      }

      // For mobile, use expo-image-picker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photos to set a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      showToast.error('Failed to pick image', 'Error');
    }
  };

  const takePhoto = async () => {
    try {
      // Camera not available on web
      if (Platform.OS === 'web') {
        showToast.info('Camera is not available on web. Please use photo library.', 'Info');
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your camera to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Take photo error:', error);
      showToast.error('Failed to take photo', 'Error');
    }
  };

  const showImagePickerOptions = () => {
    // On web, directly open file picker
    if (Platform.OS === 'web') {
      // Use setTimeout to ensure the click happens after any state updates
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 0);
      return;
    }

    // On mobile, show options
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadProfilePhoto = async (imageUri) => {
    setUploadingPhoto(true);
    try {
      console.log('Uploading photo:', imageUri);
      const response = await profileService.uploadProfilePhoto(imageUri);
      console.log('Upload response:', response);
      
      if (response && response.success) {
        // Update profile photo URL from response - extract just filename
        const photoUrl = response.data?.profilePhotoUrl || response.data?.data?.profilePhotoUrl;
        if (photoUrl) {
          // Ensure we only store the filename, not the full path
          let filename = photoUrl;
          if (filename.includes('/')) {
            filename = filename.split('/').pop();
          }
          if (filename.includes('\\')) {
            filename = filename.split('\\').pop();
          }
          setProfilePhotoUrl(filename);
          showToast.success('Profile photo updated successfully!', 'Success');
        } else {
          // Reload profile to get updated photo URL
          const profileResponse = await profileService.getCurrentProfile();
          if (profileResponse.success && profileResponse.data) {
            let filename = profileResponse.data.profilePhotoUrl;
            if (filename && filename.includes('/')) {
              filename = filename.split('/').pop();
            }
            if (filename && filename.includes('\\')) {
              filename = filename.split('\\').pop();
            }
            setProfilePhotoUrl(filename);
            showToast.success('Profile photo updated successfully!', 'Success');
          }
        }
      } else {
        showToast.error(response?.message || 'Failed to upload photo', 'Error');
      }
    } catch (error) {
      console.error('Upload error details:', error);
      showToast.error(error.message || 'Failed to upload photo', 'Error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (fullName.trim() && fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (bio.trim() && bio.length > 500) {
      newErrors.bio = 'Bio must not exceed 500 characters';
    }

    if (occupation.trim() && occupation.length > 200) {
      newErrors.occupation = 'Occupation must not exceed 200 characters';
    }

    if (hobbies.trim() && hobbies.length > 1000) {
      newErrors.hobbies = 'Hobbies must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const bioValue = bio.trim() || null;
      const fullNameValue = fullName.trim() || null;
      const occupationValue = occupation.trim() || null;
      const relationshipStatusValue = relationshipStatus || null;
      const hobbiesValue = hobbies.trim() || null;

      console.log('Updating profile with:', {
        bio: bioValue,
        fullName: fullNameValue,
        occupation: occupationValue,
        relationshipStatus: relationshipStatusValue,
        hobbies: hobbiesValue,
      });

      const response = await profileService.updateProfile(
        bioValue,
        fullNameValue,
        occupationValue,
        relationshipStatusValue,
        hobbiesValue
      );
      
      console.log('Profile update response:', response);
      
      if (response.success) {
        showToast.success('Profile updated successfully!', 'Success');
        // Small delay to ensure backend has saved before navigating back
        setTimeout(() => {
          navigation.goBack();
        }, 100);
      } else {
        showToast.error(response.message || 'Failed to update profile', 'Error');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showToast.error(error.message || 'Failed to update profile', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <ProfilePhoto
              photoUrl={displayPhotoUrl}
              size={140}
              editable
              onPress={showImagePickerOptions}
            />
            {uploadingPhoto && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.onPrimary} />
              </View>
            )}
          </View>
          <Text style={styles.photoHint}>Tap to change photo</Text>
          {/* Hidden file input for web */}
          {Platform.OS === 'web' && (
            <input
              ref={(el) => {
                fileInputRef.current = el;
              }}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleWebFileInput}
            />
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: null });
              }}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.fullName}
            />

            <Input
              label="Occupation"
              value={occupation}
              onChangeText={(text) => {
                setOccupation(text);
                if (errors.occupation) setErrors({ ...errors, occupation: null });
              }}
              placeholder="e.g., Software Engineer, Teacher, Doctor..."
              autoCapitalize="words"
              error={errors.occupation}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Relationship Status</Text>
              {Platform.OS === 'web' ? (
                <select
                  value={relationshipStatus}
                  onChange={(e) => setRelationshipStatus(e.target.value)}
                  style={styles.webPicker}
                >
                  {relationshipOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowRelationshipModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerButtonText, !relationshipStatus && styles.pickerButtonTextPlaceholder]}>
                    {getRelationshipLabel()}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <Input
              label="Bio"
              value={bio}
              onChangeText={(text) => {
                setBio(text);
                if (errors.bio) setErrors({ ...errors, bio: null });
              }}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              style={styles.bioInput}
              error={errors.bio}
              editable={!loading}
            />
            <Text style={styles.charCount}>
              {bio.length}/500 characters
            </Text>

            <Input
              label="Hobbies"
              value={hobbies}
              onChangeText={(text) => {
                setHobbies(text);
                if (errors.hobbies) setErrors({ ...errors, hobbies: null });
              }}
              placeholder="e.g., Reading, Photography, Traveling, Cooking..."
              multiline
              numberOfLines={3}
              style={styles.hobbiesInput}
              error={errors.hobbies}
              editable={!loading}
            />
            <Text style={styles.charCount}>
              {hobbies.length}/1000 characters
            </Text>
          </View>

          {Platform.OS !== 'web' && (
            <Modal
              visible={showRelationshipModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowRelationshipModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Relationship Status</Text>
                    <TouchableOpacity
                      onPress={() => setShowRelationshipModal(false)}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {relationshipOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.modalOption,
                          relationshipStatus === option.value && styles.modalOptionSelected,
                        ]}
                        onPress={() => {
                          setRelationshipStatus(option.value);
                          setShowRelationshipModal(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            relationshipStatus === option.value && styles.modalOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {relationshipStatus === option.value && (
                          <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.onPrimary} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 28,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontSize: 13,
  },
  form: {
    width: '100%',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hobbiesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    fontSize: 11,
  },
  pickerContainer: {
    marginBottom: theme.spacing.md,
  },
  pickerLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    fontSize: 14,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: 16,
    flex: 1,
  },
  pickerButtonTextPlaceholder: {
    color: theme.colors.textSecondary,
  },
  webPicker: {
    width: '100%',
    padding: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 50,
    outline: 'none',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    gap: theme.spacing.xs,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textSecondary + '60',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  modalOptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: 16,
  },
  modalOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default EditProfileScreen;

