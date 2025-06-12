// Web-specific WebSocket service implementation
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../config/api';

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 seconds
    this.subscriptions = new Map();
    this.onNotificationCallback = null;
    this.onConnectionChangeCallback = null;
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - JWT token
   * @param {number} userId - User ID
   */
  connect(token, userId) {
    if (this.isConnected || this.client?.active) {
      console.log('WebSocket already connected');
      return;
    }

    if (!token || !userId) {
      console.error('Token and userId are required for WebSocket connection');
      return;
    }

    // Get base URL without /api
    const wsBaseUrl = API_BASE_URL.replace('/api', '');

    // Create SockJS connection
    const socket = new SockJS(`${wsBaseUrl}/ws`);

    // Create STOMP client
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (__DEV__) {
          console.log('STOMP:', str);
        }
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribeToNotifications(userId);
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(true);
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.isConnected = false;
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(false);
        }
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event);
        this.isConnected = false;
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(false);
        }
        // Attempt to reconnect if not manually disconnected
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            if (token && userId) {
              console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
              this.connect(token, userId);
            }
          }, this.reconnectDelay);
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        if (this.onConnectionChangeCallback) {
          this.onConnectionChangeCallback(false);
        }
      },
    });

    // Activate the client
    this.client.activate();
  }

  /**
   * Subscribe to user's notification channel
   * @param {number} userId - User ID
   */
  subscribeToNotifications(userId) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return;
    }

    const destination = `/topic/user/${userId}`;

    // Unsubscribe if already subscribed
    if (this.subscriptions.has(destination)) {
      this.subscriptions.get(destination).unsubscribe();
    }

    // Subscribe to notifications
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('Notification received:', notification);
        
        if (this.onNotificationCallback) {
          this.onNotificationCallback(notification);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`Subscribed to ${destination}`);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe from all channels
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // Deactivate client
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;

      if (this.onConnectionChangeCallback) {
        this.onConnectionChangeCallback(false);
      }

      console.log('WebSocket disconnected');
    }
  }

  /**
   * Set callback for incoming notifications
   * @param {Function} callback - Callback function to handle notifications
   */
  setOnNotification(callback) {
    this.onNotificationCallback = callback;
  }

  /**
   * Set callback for connection status changes
   * @param {Function} callback - Callback function to handle connection changes
   */
  setOnConnectionChange(callback) {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Get current connection status
   * @returns {boolean} - True if connected, false otherwise
   */
  getConnectionStatus() {
    return this.isConnected && this.client?.connected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;

