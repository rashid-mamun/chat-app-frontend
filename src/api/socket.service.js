import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  socket = null;
  currentToken = null;

  connect() {
    const { accessToken } = useAuthStore.getState();
    
    if (!accessToken) {
      if (this.socket) {
        this.disconnect();
      }
      return null;
    }

    // If socket is already connected with the same token, reuse it
    if (this.socket?.connected && this.currentToken === accessToken) {
      return this.socket;
    }

    // Otherwise disconnect old socket (e.g. user switch or refreshed token)
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentToken = accessToken;
    this.socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      // socket connected
    });

    this.socket.on('disconnect', (reason) => {
      // socket disconnected
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message || error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
  }

  // Listeners
  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emitters
  emit(event, data) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
    }
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;
