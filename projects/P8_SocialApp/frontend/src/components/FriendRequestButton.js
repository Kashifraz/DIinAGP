import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import friendService from '../services/friendService';
import { showToast } from '../utils/toast';
import theme from '../config/theme';

const FriendRequestButton = ({ userId, onStatusChange, navigation }) => {
  const [friendStatus, setFriendStatus] = useState(null); // 'none', 'pending_sent', 'pending_received', 'friends'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkFriendStatus();
  }, [userId]);

  const checkFriendStatus = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Check if friends
      const friendshipResponse = await friendService.checkFriendship(userId);
      if (friendshipResponse.success && friendshipResponse.data) {
        setFriendStatus('friends');
        setLoading(false);
        return;
      }

      // Check for pending requests
      // Get sent requests
      const sentResponse = await friendService.getSentRequests(0, 100);
      if (sentResponse.success && sentResponse.data) {
        const sentRequests = sentResponse.data.content || [];
        const sentRequest = sentRequests.find(req => req.receiverId === userId);
        if (sentRequest) {
          setFriendStatus('pending_sent');
          setLoading(false);
          return;
        }
      }

      // Get received requests
      const receivedResponse = await friendService.getReceivedRequests(0, 100);
      if (receivedResponse.success && receivedResponse.data) {
        const receivedRequests = receivedResponse.data.content || [];
        const receivedRequest = receivedRequests.find(req => req.senderId === userId);
        if (receivedRequest) {
          setFriendStatus('pending_received');
          setLoading(false);
          return;
        }
      }

      setFriendStatus('none');
    } catch (error) {
      console.error('Check friend status error:', error);
      setFriendStatus('none');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setActionLoading(true);
    try {
      const response = await friendService.sendFriendRequest(userId);
      if (response.success) {
        showToast.success('Friend request sent!', 'Success');
        setFriendStatus('pending_sent');
        if (onStatusChange) onStatusChange('pending_sent');
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to send friend request', 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (friendStatus === 'friends') {
    return (
      <TouchableOpacity
        style={[styles.button, styles.buttonFriends]}
        disabled
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark-circle" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  if (friendStatus === 'pending_sent') {
    return (
      <TouchableOpacity
        style={[styles.button, styles.buttonPending]}
        disabled
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  if (friendStatus === 'pending_received') {
    return (
      <TouchableOpacity
        style={[styles.button, styles.buttonReceived]}
        onPress={() => {
          // Navigate to friend requests screen
          if (navigation) {
            navigation.navigate('FriendRequests');
          } else if (onStatusChange) {
            onStatusChange('navigate_to_requests');
          }
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="person-add" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
    );
  }

  // friendStatus === 'none'
  return (
    <TouchableOpacity
      style={[styles.button, styles.buttonPrimary]}
      onPress={handleSendRequest}
      disabled={actionLoading}
      activeOpacity={0.7}
    >
      {actionLoading ? (
        <ActivityIndicator size="small" color={theme.colors.onPrimary} />
      ) : (
        <Ionicons name="person-add-outline" size={18} color={theme.colors.onPrimary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  buttonFriends: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.textSecondary + '40',
    opacity: 0.6,
  },
  buttonPending: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.textSecondary + '40',
    opacity: 0.6,
  },
  buttonReceived: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
});

export default FriendRequestButton;

