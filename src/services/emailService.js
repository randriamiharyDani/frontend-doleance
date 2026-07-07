import { emailjs, EMAILJS_CONFIG } from '../config/emailjs';

class EmailService {
  
  /**
   * Envoyer la référence par email avec EmailJS
   */
  static async sendReference(contact, reference, citoyenNom, citoyenPrenom, titre) {
    try {
      console.log('📧 Envoi de la référence via EmailJS:', {
        contact,
        reference,
        citoyenNom,
        citoyenPrenom,
        titre
      });

      const isEmail = contact && contact.includes('@') && contact.includes('.');
      
      if (!isEmail) {
        // Pour SMS (simulé)
        console.log('📱 SMS envoyé à:', contact);
        return { 
          success: true, 
          message: 'SMS envoyé avec succès',
          data: { to: contact, reference }
        };
      }

      // Vérifier que la configuration est complète
      if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_REFERENCE) {
        console.error('❌ EmailJS non configuré correctement');
        return { 
          success: false, 
          message: 'Service d\'email non configuré' 
        };
      }

      // Préparer les paramètres pour EmailJS
      const templateParams = {
        to_email: contact,
        to_name: `${citoyenPrenom || ''} ${citoyenNom || ''}`.trim() || 'Citoyen',
        reference: reference || 'N/A',
        titre: titre || 'Doléance',
        date: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        heure: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        lien_suivi: `${window.location.origin}/suivi-doleance/${reference || ''}`
      };

      console.log('📤 Envoi vers EmailJS avec:', templateParams);

      // Envoyer l'email avec EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_REFERENCE,
        templateParams
      );

      console.log('✅ EmailJS réponse:', response);

      return { 
        success: true, 
        message: 'Email envoyé avec succès',
        data: response
      };
      
    } catch (error) {
      console.error('❌ Erreur EmailJS:', error);
      return { 
        success: false, 
        message: error.text || error.message || 'Erreur lors de l\'envoi' 
      };
    }
  }
}

export default EmailService;