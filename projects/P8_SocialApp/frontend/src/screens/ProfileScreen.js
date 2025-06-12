import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ProfilePhoto from '../components/ProfilePhoto';
import FriendRequestButton from '../components/FriendRequestButton';
import profileService from '../services/profileService';
import { showToast } from '../utils/toast';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const ProfileScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get userId from route params (if viewing another user's profile)
  const userId = route?.params?.userId;
  
  // Check if viewing own profile
  const isOwnProfile = !userId || userId === user?.userId;

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (userId) {
        // Load another user's profile
        response = await profileService.getUserProfile(userId);
      } else {
        // Load current user's profile
        response = await profileService.getCurrentProfile();
      }
      
      console.log('Profile loaded:', response);
      
      if (response.success && response.data) {
        setProfile(response.data);
        console.log('Profile data set:', response.data);
      } else {
        console.warn('Profile load response not successful:', response);
      }
    } catch (error) {
      console.error('Profile load error:', error);
      showToast.error(error.message || 'Failed to load profile', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, user?.userId]);

  // Reload profile when screen comes into focus (e.g., after editing)
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleEditPhoto = () => {
    // Only allow editing own profile
    if (isOwnProfile) {
      navigation.navigate('EditProfile', { profile });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Construct profile photo URL
  const getProfilePhotoUrl = () => {
    if (!profile?.profilePhotoUrl) return null;
    // Extract just the filename (handle both old full path and new filename-only format)
    let filename = profile.profilePhotoUrl.trim();
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

  const profilePhotoUrl = getProfilePhotoUrl();
  const tabBarHeight = Platform.OS === 'ios' ? 88 : 70;

  const getRelationshipStatusLabel = (status) => {
    if (!status) return null;
    const labels = {
      SINGLE: 'Single',
      IN_RELATIONSHIP: 'In a Relationship',
      MARRIED: 'Married',
    };
    return labels[status] || status;
  };

  const getRelationshipStatusIcon = (status) => {
    if (!status) return 'heart-outline';
    const icons = {
      SINGLE: 'person-outline',
      IN_RELATIONSHIP: 'heart-outline',
      MARRIED: 'heart',
    };
    return icons[status] || 'heart-outline';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + theme.spacing.lg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <ProfilePhoto
          photoUrl={profilePhotoUrl}
          size={100}
          editable={isOwnProfile}
          onPress={isOwnProfile ? handleEditPhoto : undefined}
        />
        <Text style={styles.name}>{profile?.fullName || user?.fullName || 'User'}</Text>
        <View style={styles.emailContainer}>
          <Ionicons name="mail-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.email}>{profile?.email || user?.email}</Text>
        </View>
        {!isOwnProfile && userId && (
          <View style={styles.friendRequestContainer}>
            <FriendRequestButton
              userId={userId}
              navigation={navigation}
            />
          </View>
        )}
        {isOwnProfile && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile', { profile })}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* About Section */}
      {(profile?.bio || profile?.occupation || profile?.relationshipStatus || profile?.hobbies) && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          
          {profile?.bio && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bio</Text>
              <Text style={styles.infoValue}>{profile.bio}</Text>
            </View>
          )}

          {profile?.occupation && (
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="briefcase-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Occupation</Text>
              </View>
              <Text style={styles.infoValue}>{profile.occupation}</Text>
            </View>
          )}

          {profile?.relationshipStatus && (
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name={getRelationshipStatusIcon(profile.relationshipStatus)} size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Relationship Status</Text>
              </View>
              <Text style={styles.infoValue}>{getRelationshipStatusLabel(profile.relationshipStatus)}</Text>
            </View>
          )}

          {profile?.hobbies && (
            <View style={styles.infoItem}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="happy-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoLabel}>Hobbies</Text>
              </View>
              <Text style={styles.infoValue}>{profile.hobbies}</Text>
            </View>
          )}
        </View>
      )}

      {/* Account Information */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="settings-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Account Information</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoLabelRow}>
            <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoLabel}>User ID</Text>
          </View>
          <Text style={styles.infoValue}>{profile?.userId || user?.userId}</Text>
        </View>
        {profile?.createdAt && (
          <View style={styles.infoItem}>
            <View style={styles.infoLabelRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoLabel}>Member since</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    fontWeight: '700',
    fontSize: 24,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  email: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  friendRequestContainer: {
    marginTop: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    gap: theme.spacing.xs,
  },
  editButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  infoItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  infoLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: theme.spacing.xs,
  },
});

export default ProfileScreen;

