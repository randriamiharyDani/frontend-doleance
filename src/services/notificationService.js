import api from './api';

const notificationService = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    try {
      const response = await api.get('/notifications', { 
        params: { page, limit, unreadOnly: unreadOnly ? 'true' : 'false' }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: { notifications: [], total: 0 } };
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      return { success: true, count: response.data.count || 0 };
    } catch (error) {
      return { success: false, count: 0 };
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  },

};

export default notificationService;