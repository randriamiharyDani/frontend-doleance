// src/services/citoyenCallService.js
// API publique et Admin pour l'appel direct Citoyen -> Agent
import api from './api';

const citoyenCallService = {
  // Public : config de l'appel citoyen (agent destinataire + disponibilité)
  async getConfig() {
    const res = await api.get('/citoyen-call/config');
    return res.data;
  },

  // Admin : configuration actuelle + liste des agents candidats
  async getRecipient() {
    const res = await api.get('/citoyen-call/recipient');
    return res.data;
  },

  // Admin : changer l'agent destinataire (enregistré en base)
  async updateRecipient(id_utilisateur) {
    const res = await api.put('/citoyen-call/recipient', { id_utilisateur });
    return res.data;
  },
};

export default citoyenCallService;
