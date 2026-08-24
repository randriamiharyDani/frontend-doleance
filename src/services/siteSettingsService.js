// src/services/siteSettingsService.js
// Paramètres du site public : contacts d'urgence + réseaux sociaux (footer)
import api from './api';

const siteSettingsService = {
  // Public : contacts d'urgence + socials affichés sur le site
  async getSettings() {
    const res = await api.get('/site-settings');
    return res.data;
  },

  // Admin : mise à jour des numéros des contacts d'urgence
  async updateContacts(contacts) {
    const res = await api.put('/site-settings/contacts', { contacts });
    return res.data;
  },

  // Admin : mise à jour du numéro WhatsApp et des liens Facebook / Instagram
  async updateSocials(socials) {
    const res = await api.put('/site-settings/socials', socials);
    return res.data;
  },
};

export default siteSettingsService;
