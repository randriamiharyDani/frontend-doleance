// src/config/guestSocket.js
// Connexion Socket.IO "invitée" : permet à un citoyen (sans compte) d'appeler un agent.
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://192.168.99.86:5000';

class GuestSocket {
  constructor() {
    this.socket = null;
    this.ready = false;
    this.guestId = null;
    this.eventListeners = {};
  }

  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.socket.on('guest-ready', (data) => {
      this.guestId = data?.guestId || null;
      this.ready = true;
    });

    this.socket.on('disconnect', () => {
      this.ready = false;
    });

    Object.keys(this.eventListeners).forEach((event) => {
      this.eventListeners[event].forEach((callback) => {
        if (typeof callback === 'function') this.socket.on(event, callback);
      });
    });

    return this.socket;
  }

  on(event, callback) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(callback);
    if (this.socket) this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) this.socket.off(event, callback);
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected() {
    return !!(this.socket && this.socket.connected);
  }

  disconnect() {
    this.ready = false;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new GuestSocket();
