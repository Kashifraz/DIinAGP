import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfilePhoto from './ProfilePhoto';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const FriendRequestItem = ({ 
  request, 
  type, // 'received' or 'sent'
  onAccept,
  onReject,
  onCancel,
  onPress,
  loading = false,
}) => {
  // Determine which user to display (sender for received, receiver for sent)
  // For received: show sender info, for sent: show receiver info
  const displayName = type === 'received' 
    ? (request.senderFullName || request.senderEmail || 'User')
    : (request.receiverFullName || request.receiverEmail || 'User');
  const displayEmail = type === 'received' 
    ? request.senderEmail 
    : request.receiverEmail;

  // Construct profile photo URL
  const getProfilePhotoUrl = () => {
    const photoUrl = type === 'received' 
      ? request.senderProfilePhotoUrl 
      : request.receiverProfilePhotoUrl;
    if (!photoUrl) return null;
    
    let filename = photoUrl.trim();
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
            {displayName}
          </Text>
          <View style={styles.emailContainer}>
            <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.email} numberOfLines={1}>
              {displayEmail}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {type === 'received' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => onAccept(request.id)}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.onPrimary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => onReject(request.id)}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <Ionicons name="close-circle" size={20} color={theme.colors.error} />
            )}
          </TouchableOpacity>
        </View>
      )}
      {type === 'sent' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => onCancel(request.id)}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.textSecondary} />
          ) : (
            <Ionicons name="close-circle-outline" size={20} color={theme.colors.textSecondary} />
          )}
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
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  acceptButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.error + '15',
    borderWidth: 1.5,
    borderColor: theme.colors.error + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.textSecondary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
});

export default FriendRequestItem;

