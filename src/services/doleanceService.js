import api from './api';

const doleanceService = {
  // ========== DOLÉANCES ==========
  
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key]) queryParams.append(key, params[key]);
      });
      const response = await api.get(`/doleances?${queryParams.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: { doleances: [], pagination: { total: 0 } } };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/doleances/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  getByReference: async (reference) => {
    try {
      const response = await api.get(`/doleances/public/${reference}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/doleances', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateStatut: async (id, id_statut, commentaire = null) => {
    try {
      const response = await api.put(`/doleances/${id}/statut`, { id_statut, commentaire });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  addReponse: async (id, message, estInterne = false) => {
    try {
      const response = await api.post(`/doleances/${id}/reponses`, { message, est_interne: estInterne });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  addReponseCitoyen: async (reference, identifiant_citoyen, message) => {
    try {
      const response = await api.post(`/doleances/public/${reference}/reponse`, { identifiant_citoyen, message });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  assigner: async (id, id_utilisateur, commentaire = null) => {
    try {
      const response = await api.post(`/doleances/${id}/assigner`, { id_utilisateur, commentaire });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  transferer: async (id, id_direction, motif) => {
    try {
      const response = await api.post(`/doleances/${id}/transferer`, { id_direction, motif });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  addSatisfaction: async (id, note, commentaire = null) => {
    try {
      const response = await api.post(`/doleances/${id}/satisfaction`, { note, commentaire });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  getBackoffice: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val) queryParams.append(key, val);
      });
      const response = await api.get(`/doleances/backoffice?${queryParams.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: { doleances: [], pagination: { total: 0, pages: 0 } } };
    }
  },

  updatePriorite: async (id, id_priorite) => {
    try {
      const response = await api.put(`/doleances/${id}/priorite`, { id_priorite });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  getPiecesJointes: async (id) => {
    try {
      const response = await api.get(`/doleances/${id}/pieces-jointes`);
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/doleances/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  // ========== CATÉGORIES (CRUD) ==========

  getCategories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val) queryParams.append(key, val);
      });
      const qs = queryParams.toString();
      const response = await api.get(`/categories${qs ? '?' + qs : ''}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getCategorie: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  createCategory: async (data) => {
    try {
      const response = await api.post('/categories', data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateCategory: async (id, data) => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  getStatuts: async () => {
    try {
      const response = await api.get('/doleances/statuts');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getPriorites: async () => {
    try {
      const response = await api.get('/doleances/priorites');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getDirections: async () => {
    try {
      const response = await api.get('/doleances/directions');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getQuartiers: async () => {
    try {
      const response = await api.get('/doleances/quartiers');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getRoles: async () => {
    try {
      const response = await api.get('/doleances/roles');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  // ========== CORBEILLE ==========

  getTrashed: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val) queryParams.append(key, val);
      });
      const response = await api.get(`/corbeille?${queryParams.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  getTrashCount: async () => {
    try {
      const response = await api.get('/corbeille/count');
      return { success: true, data: response.data?.data };
    } catch (error) {
      return { success: false, data: { total: 0 } };
    }
  },

  restoreDoleance: async (id) => {
    try {
      const response = await api.post(`/corbeille/${id}/restore`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  permanentDelete: async (id) => {
    try {
      const response = await api.delete(`/corbeille/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  },

  emptyTrash: async (ids = null) => {
    try {
      const response = await api.post('/corbeille/empty', { ids });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
};

export default doleanceService;