import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfilePhoto from './ProfilePhoto';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const FriendListItem = ({ 
  friend, 
  onPress,
  onUnfriend,
  showUnfriendButton = true,
}) => {
  // Debug: Log friend object
  useEffect(() => {
    console.log('FriendListItem rendered with friend:', friend);
    console.log('friend.userId:', friend?.userId);
    console.log('friend.id:', friend?.id);
  }, [friend]);

  // Construct profile photo URL
  const getProfilePhotoUrl = () => {
    if (!friend?.profilePhotoUrl) return null;
    let filename = friend.profilePhotoUrl.trim();
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

  const handleUnfriend = () => {
    console.log('handleUnfriend called, friend object:', friend);
    console.log('friend.userId:', friend?.userId);
    console.log('friend.id:', friend?.id);
    console.log('onUnfriend function exists:', !!onUnfriend);
    
    // On web, Alert.alert might not work properly, so let's use window.confirm as fallback
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to unfriend ${friend.fullName || friend.email}?`
      );
      if (confirmed) {
        console.log('Unfriend confirmed (web), calling onUnfriend with userId:', friend.userId);
        if (onUnfriend && friend.userId) {
          onUnfriend(friend.userId);
        } else {
          console.error('onUnfriend is not defined or friend.userId is missing!', {
            onUnfriend: !!onUnfriend,
            userId: friend.userId,
            friend: friend
          });
        }
      } else {
        console.log('Unfriend cancelled (web)');
      }
    } else {
      Alert.alert(
        'Unfriend',
        `Are you sure you want to unfriend ${friend.fullName || friend.email}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => console.log('Cancel pressed') },
          {
            text: 'Unfriend',
            style: 'destructive',
            onPress: () => {
              console.log('Unfriend confirmed, calling onUnfriend with userId:', friend.userId);
              if (onUnfriend && friend.userId) {
                onUnfriend(friend.userId);
              } else {
                console.error('onUnfriend is not defined or friend.userId is missing!', {
                  onUnfriend: !!onUnfriend,
                  userId: friend.userId,
                  friend: friend
                });
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        <ProfilePhoto
          photoUrl={profilePhotoUrl}
          size={56}
          editable={false}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {friend.fullName || 'User'}
          </Text>
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.email} numberOfLines={1}>
              {friend.email}
            </Text>
          </View>
          {friend.friendshipCreatedAt && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.date}>
                Friends since {formatDate(friend.friendshipCreatedAt)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      {showUnfriendButton && (
        <TouchableOpacity
          style={styles.unfriendButton}
          onPress={() => {
            console.log('Unfriend button pressed');
            handleUnfriend();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="person-remove-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
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
  content: {
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
    marginBottom: theme.spacing.xs,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs / 2,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  unfriendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error + '15',
    borderWidth: 1.5,
    borderColor: theme.colors.error + '40',
    marginLeft: theme.spacing.sm,
  },
});

export default FriendListItem;

