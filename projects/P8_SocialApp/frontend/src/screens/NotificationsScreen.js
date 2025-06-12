import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';
import ProfilePhoto from '../components/ProfilePhoto';
import { API_BASE_URL } from '../config/api';
import theme from '../config/theme';

const NotificationsScreen = ({ navigation }) => {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead, navigateToPost } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Notifications are received via WebSocket, so just mark all as read
    markAllAsRead();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        // Navigate to friend requests screen
        navigation.navigate('FriendRequests');
        break;
      case 'LIKE':
      case 'COMMENT':
      case 'COMMENT_REPLY':
      case 'COMMENT_LIKE':
        // Navigate to post detail if postId exists
        if (notification.postId) {
          navigateToPost(notification.postId);
          navigation.navigate('PostDetail', { postId: notification.postId });
        }
        break;
      default:
        // For other types, try to navigate to post if postId exists
        if (notification.postId) {
          navigateToPost(notification.postId);
          navigation.navigate('PostDetail', { postId: notification.postId });
        }
    }
  };

  const getProfilePhotoUrl = (profilePhotoUrl) => {
    if (!profilePhotoUrl) return null;
    let filename = profilePhotoUrl.trim();
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return '';
    }
  };

  const renderNotification = ({ item }) => {
    const isUnread = !item.read;
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <ProfilePhoto
          photoUrl={getProfilePhotoUrl(item.actor?.profilePhotoUrl)}
          size={48}
          editable={false}
        />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formatDate(item.timestamp)}</Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No notifications yet</Text>
        <Text style={styles.emptySubtext}>
          You'll see notifications here for friend requests, reactions, comments, and more
        </Text>
        {!isConnected && (
          <View style={styles.connectionStatus}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.error} />
            <Text style={styles.connectionText}>Not connected to server</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllReadButton}>
              <Text style={styles.markAllReadText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  markAllReadButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  markAllReadText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: theme.spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadNotification: {
    backgroundColor: theme.colors.primary + '08',
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  notificationMessage: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  notificationTime: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.borderRadius.small,
  },
  connectionText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
  },
});

export default NotificationsScreen;

