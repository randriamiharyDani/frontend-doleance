// src/config/socket.js
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventListeners = {};
    this.userId = null;
    this.currentRoom = null;
    this.lockedResources = {}; // Pour suivre les ressources verrouillées
    this.onlineUsers = []; // Liste des utilisateurs en ligne
    this.onOnlineUsersUpdate = null; // Callback pour la mise à jour
  }

  // ========== CONNEXION ==========
  connect(token, userId, userName, userRole) {
    this.userId = userId;
    
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
        userId,
        userName,
        userRole,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Ré-appliquer les écouteurs enregistrés avant la connexion
    Object.keys(this.eventListeners).forEach((event) => {
      this.eventListeners[event].forEach((callback) => {
        if (typeof callback === 'function') this.socket.on(event, callback);
      });
    });

    // Événements de connexion
    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      console.log('🟢 Connecté au serveur Socket.io');
      
      // Rejoindre le salon utilisateur
      this.socket.emit('user-connected', {
        userId,
        userName,
        userRole,
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion Socket.io:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('⚠️ Nombre maximal de tentatives de reconnexion atteint');
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('🔴 Déconnecté du serveur Socket.io:', reason);
      
      // Libérer tous les verrous en cas de déconnexion
      this.releaseAllLocks();
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Reconnexion réussie');
      this.connected = true;
      
      // Rejoindre les salons précédents
      if (this.currentRoom) {
        this.joinRoom(this.currentRoom);
      }
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Erreur de reconnexion:', error.message);
    });

    // Écouter les verrous
    this.socket.on('resource-locked', (data) => {
      this.lockedResources[data.resourceId] = {
        userId: data.userId,
        userName: data.userName,
        timestamp: data.timestamp,
      };
      this.emit('resource-locked', data);
    });

    this.socket.on('resource-unlocked', (data) => {
      delete this.lockedResources[data.resourceId];
      this.emit('resource-unlocked', data);
    });

    this.socket.on('lock-conflict', (data) => {
      this.emit('lock-conflict', data);
    });

    // Écouter les mises à jour des utilisateurs en ligne
    this.socket.on('online-users-updated', (users) => {
      this.onlineUsers = users;
      console.log(`👥 Utilisateurs en ligne: ${users.length}`);
      if (this.onOnlineUsersUpdate) {
        this.onOnlineUsersUpdate(users);
      }
      this.emit('online-users-updated', users);
    });

    return this.socket;
  }

  // ========== GESTION DES SALONS ==========
  joinRoom(roomName) {
    if (this.isConnected() && roomName) {
      this.currentRoom = roomName;
      this.socket.emit('join-room', roomName);
      console.log(`📦 Rejoint le salon: ${roomName}`);
    }
  }

  leaveRoom(roomName) {
    if (this.isConnected() && roomName) {
      this.socket.emit('leave-room', roomName);
      if (this.currentRoom === roomName) {
        this.currentRoom = null;
      }
      console.log(`📦 Quitté le salon: ${roomName}`);
    }
  }

  // ========== GESTION DES VERROUS POUR DOLÉANCES ==========
  async lockResource(resourceId, resourceType = 'doleance') {
    return new Promise((resolve) => {
      if (!this.isConnected()) {
        console.warn('⚠️ Socket non connecté, impossible de verrouiller');
        resolve(false);
        return;
      }

      // Si déjà verrouillé par un autre utilisateur
      if (this.lockedResources[resourceId] && 
          this.lockedResources[resourceId].userId !== this.userId) {
        resolve(false);
        return;
      }

      // Si déjà verrouillé par cet utilisateur
      if (this.lockedResources[resourceId]?.userId === this.userId) {
        resolve(true);
        return;
      }

      // Écouter la réponse
      const handler = (data) => {
        if (data.resourceId === resourceId) {
          this.off('resource-locked', handler);
          resolve(data.success);
        }
      };
      this.on('resource-locked', handler);

      // Demander le verrou
      this.socket.emit('lock-resource', {
        resourceId,
        resourceType,
        userId: this.userId,
        userName: this.getUserName(),
      });

      // Timeout après 5 secondes
      setTimeout(() => {
        this.off('resource-locked', handler);
        resolve(false);
      }, 5000);
    });
  }

  unlockResource(resourceId) {
    if (this.isConnected()) {
      this.socket.emit('unlock-resource', {
        resourceId,
        userId: this.userId,
      });
      delete this.lockedResources[resourceId];
    }
  }

  releaseAllLocks() {
    Object.keys(this.lockedResources).forEach((resourceId) => {
      this.unlockResource(resourceId);
    });
  }

  // ========== ÉDITION EN TEMPS RÉEL ==========
  startEditing(resourceId, userId, userName, resourceType = 'doleance') {
    if (this.isConnected()) {
      this.socket.emit('start-editing', {
        resourceId,
        userId,
        userName,
        resourceType,
      });
    }
  }

  stopEditing(resourceId, userId) {
    if (this.isConnected()) {
      this.socket.emit('stop-editing', {
        resourceId,
        userId,
      });
    }
  }

  // ========== INDICATEUR DE FRAPPE ==========
  sendTyping(resourceId, userId, userName) {
    if (this.isConnected()) {
      this.socket.emit('typing', {
        resourceId,
        userId,
        userName,
      });
    }
  }

  sendStopTyping(resourceId, userId) {
    if (this.isConnected()) {
      this.socket.emit('stop-typing', {
        resourceId,
        userId,
      });
    }
  }

  // ========== NOTIFICATIONS DE POINTAGE ==========
  notifyClockIn(userId, userName, time) {
    this.emit('clock-in', { userId, userName, time });
  }

  notifyClockOut(userId, userName, time) {
    this.emit('clock-out', { userId, userName, time });
  }

  notifyLeaveRequest(userId, userName, startDate, endDate) {
    this.emit('leave-request', { userId, userName, startDate, endDate });
  }

  notifyLeaveApproved(leaveId, userId, userName) {
    this.emit('leave-approved', { leaveId, userId, userName });
  }

  notifyLeaveRejected(leaveId, userId, userName) {
    this.emit('leave-rejected', { leaveId, userId, userName });
  }

  // ========== UTILISATEURS EN LIGNE ==========
  getOnlineUsers() {
    return this.onlineUsers;
  }

  isUserOnline(userId) {
    return this.onlineUsers.some(u => u.userId === userId);
  }

  setOnlineUsersCallback(callback) {
    this.onOnlineUsersUpdate = callback;
  }

  // ========== MÉTHODES UTILITAIRES ==========
  getUserName() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
      } catch (e) {
        return 'Utilisateur';
      }
    }
    return 'Utilisateur';
  }

  disconnect() {
    this.releaseAllLocks();
    if (this.socket) {
      if (this.connected) {
        this.socket.emit('user-disconnected', this.userId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  emit(event, data) {
    if (this.isConnected()) {
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Socket non connecté, événement non envoyé: ${event}`);
    }
  }

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        cb => cb !== callback
      );
    }
  }

  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      delete this.eventListeners[event];
    }
  }
}

export default new SocketManager();