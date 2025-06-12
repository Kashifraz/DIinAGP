// Native platform stub (web version is in websocketService.web.js)
// This file is used for iOS/Android where WebSocket support may need different implementation

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
    this.subscriptions = new Map();
    this.onNotificationCallback = null;
    this.onConnectionChangeCallback = null;
  }

  connect(token, userId) {
    console.warn('WebSocket not implemented for native platforms yet');
    // TODO: Implement native WebSocket support
  }

  disconnect() {
    console.log('WebSocket disconnect (native stub)');
  }

  subscribeToNotifications(userId) {
    console.warn('WebSocket subscribe not implemented for native platforms');
  }

  setOnNotification(callback) {
    this.onNotificationCallback = callback;
  }

  setOnConnectionChange(callback) {
    this.onConnectionChangeCallback = callback;
  }

  getConnectionStatus() {
    return false;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
