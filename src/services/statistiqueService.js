import api from './api';

const statistiqueService = {
  getDashboardStats: async (idCategorie = null) => {
    try {
      const params = {};
      if (idCategorie) params.id_categorie = idCategorie;
      const response = await api.get('/statistiques/dashboard', { params });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: { total: 0, enCours: 0, resolues: 0, urgentes: 0 } };
    }
  },

  getStatsByCategorie: async (periode = 'month') => {
    try {
      const response = await api.get('/statistiques/categories', { params: { periode } });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getStatsByDirection: async () => {
    try {
      const response = await api.get('/statistiques/directions');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getStatsByStatut: async () => {
    try {
      const response = await api.get('/statistiques/statuts');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getStatsByPriorite: async () => {
    try {
      const response = await api.get('/statistiques/priorites');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getEvolutionTemporelle: async (periode = 'month', nb = 12) => {
    try {
      const response = await api.get('/statistiques/evolution', { params: { periode, nb } });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getTempsTraitementMoyen: async () => {
    try {
      const response = await api.get('/statistiques/temps-traitement');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: { moyen_heures: 0, min_heures: 0, max_heures: 0 } };
    }
  },

  getPerformanceAgents: async (periode = 'month') => {
    try {
      const response = await api.get('/statistiques/performance-agents', { params: { periode } });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getStatsByQuartier: async () => {
    try {
      const response = await api.get('/statistiques/quartiers');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  getTauxSatisfaction: async () => {
    try {
      const response = await api.get('/statistiques/satisfaction');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return { success: false, data: { total_avis: 0, note_moyenne: 0, taux_satisfaction: 0 } };
    }
  },

  exportStats: async (params = {}, format = 'csv') => {
    try {
      const response = await api.post(`/statistiques/export/${format}`, params, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statistiques_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    }
  }
};

export default statistiqueService;