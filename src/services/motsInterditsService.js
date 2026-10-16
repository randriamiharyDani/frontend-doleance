import api from './api';

// Service de gestion des mots interdits (espace administrateur).
const motsInterditsService = {
  getAll: async () => {
    try {
      const response = await api.get('/mots-interdits');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [], message: error.response?.data?.message };
    }
  },

  create: async (mot) => {
    try {
      const response = await api.post('/mots-interdits', { mot });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  update: async (id, mot) => {
    try {
      const response = await api.put(`/mots-interdits/${id}`, { mot });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/mots-interdits/${id}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },
};

export default motsInterditsService;
