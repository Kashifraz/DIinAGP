import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfilePhoto from './ProfilePhoto';
import FriendRequestButton from './FriendRequestButton';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const SearchResultItem = ({ user, onPress, showFriendButton = true }) => {
  // Construct profile photo URL
  const getProfilePhotoUrl = () => {
    if (!user?.profilePhotoUrl) return null;
    let filename = user.profilePhotoUrl.trim();
    if (filename.includes('/')) {
      filename = filename.split('/').pop();
    }
    if (filename.includes('\\')) {
      filename = filename.split('\\').pop();
    }
    const encodedFilename = encodeURIComponent(filename);
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/api/media/profile-photo/${encodedFilename}`;
  };

  const profilePhotoUrl = getProfilePhotoUrl();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <ProfilePhoto
          photoUrl={profilePhotoUrl}
          size={56}
          editable={false}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {user.fullName || 'User'}
          </Text>
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.email} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {showFriendButton && user.id && (
        <View style={styles.friendButtonContainer}>
          <FriendRequestButton userId={user.id} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  info: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  name: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  friendButtonContainer: {
    marginLeft: theme.spacing.sm,
  },
});

export default SearchResultItem;

