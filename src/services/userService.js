import api from './api';

const userService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/users', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  toggleActif: async (id, actif) => {
    try {
      const response = await api.patch(`/users/${id}/toggle`, { actif });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  getAgentsDisponibles: async (directionId = null) => {
    try {
      const params = directionId ? { direction_id: directionId } : {};
      const response = await api.get('/users/agents', { params });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getActivityLogs: async (id, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/users/${id}/logs`, { params: { page, limit } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  resetPassword: async (id) => {
    try {
      const response = await api.post(`/users/${id}/reset-password`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: { total: 0, actifs: 0, inactifs: 0, byRole: [] } };
    }
  }
};

export default userService;