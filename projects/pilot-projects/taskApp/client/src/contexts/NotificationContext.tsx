import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { socket } = useSocket();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationsAPI.getAll();
        setNotifications(response.data.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for real-time updates
      socket.on('task-updated', (task) => {
        const notification: Notification = {
          id: `task-updated-${Date.now()}`,
          type: 'TASK_UPDATED',
          title: 'Task Updated',
          message: `Task "${task.title}" has been updated`,
          isRead: false,
          metadata: { taskId: task.id },
          createdAt: new Date().toISOString(),
        };
        addNotification(notification);
        toast.success(`Task "${task.title}" updated`);
      });

      socket.on('task-created', (task) => {
        const notification: Notification = {
          id: `task-created-${Date.now()}`,
          type: 'TASK_CREATED',
          title: 'New Task Created',
          message: `New task "${task.title}" has been created`,
          isRead: false,
          metadata: { taskId: task.id },
          createdAt: new Date().toISOString(),
        };
        addNotification(notification);
        toast.success(`New task "${task.title}" created`);
      });

      socket.on('comment-added', (comment) => {
        const notification: Notification = {
          id: `comment-added-${Date.now()}`,
          type: 'COMMENT_ADDED',
          title: 'New Comment',
          message: `New comment added to task`,
          isRead: false,
          metadata: { commentId: comment.id, taskId: comment.taskId },
          createdAt: new Date().toISOString(),
        };
        addNotification(notification);
        toast.success('New comment added');
      });

      return () => {
        socket.off('task-updated');
        socket.off('task-created');
        socket.off('comment-added');
      };
    }
  }, [socket]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}; 