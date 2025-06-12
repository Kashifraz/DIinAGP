import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import websocketService from '../services/websocketService';
import { showToast } from '../utils/toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Handle incoming notifications
  const handleNotification = useCallback((notification) => {
    console.log('Handling notification:', notification);
    
    // Add ID and read status if not present
    const notificationWithId = {
      ...notification,
      id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: notification.read || false,
    };
    
    // Add to notifications list
    setNotifications((prev) => [notificationWithId, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    const actorName = notification.actor?.fullName || 'Someone';
    let message = notification.message;
    let type = 'info';

    // Customize message based on notification type
    switch (notification.type) {
      case 'LIKE':
        message = `${actorName} liked your post`;
        type = 'success';
        break;
      case 'COMMENT':
        message = `${actorName} commented on your post`;
        type = 'info';
        break;
      case 'FRIEND_REQUEST':
        message = `${actorName} sent you a friend request`;
        type = 'info';
        break;
      case 'FRIEND_ACCEPTED':
        message = `${actorName} accepted your friend request`;
        type = 'success';
        break;
      case 'COMMENT_REPLY':
        message = `${actorName} replied to your comment`;
        type = 'info';
        break;
      case 'COMMENT_LIKE':
        message = `${actorName} liked your comment`;
        type = 'success';
        break;
      default:
        message = notification.message;
    }

    // Show toast
    showToast.info(message, 'New Notification');

    // Optional: Navigate to post when notification is clicked
    // This can be enhanced to handle toast click
  }, []);

  // Handle connection status changes
  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected);
    if (connected) {
      console.log('WebSocket connected');
    } else {
      console.log('WebSocket disconnected');
    }
  }, []);

  // Connect WebSocket when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.userId && token) {
      console.log('Connecting WebSocket for user:', user.userId);
      
      // Set up callbacks
      websocketService.setOnNotification(handleNotification);
      websocketService.setOnConnectionChange(handleConnectionChange);

      // Connect
      websocketService.connect(token, user.userId);
    } else {
      // Disconnect if not authenticated
      websocketService.disconnect();
      setIsConnected(false);
    }

    // Cleanup on unmount or when auth changes
    return () => {
      if (!isAuthenticated) {
        websocketService.disconnect();
      }
    };
  }, [isAuthenticated, user?.userId, token, handleNotification, handleConnectionChange]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Navigate to post from notification
  // Note: Navigation is handled by the component that uses this context
  const navigateToPost = useCallback((postId) => {
    // This will be called by NotificationsScreen which has navigation access
    console.log('Navigate to post:', postId);
  }, []);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    navigateToPost,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

