import emailjs from '@emailjs/browser';

const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'Jksn2QakJrrYN52pj',
  SERVICE_ID: 'service_bompnbg',
  TEMPLATE_REFERENCE: 'template_0urho91',  // ✅ Template pour l'envoi de référence
  // TEMPLATE_PASSWORD supprimé car pas encore créé
};

// Initialiser EmailJS avec la clé publique
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

console.log('✅ EmailJS configuré avec:', {
  service: EMAILJS_CONFIG.SERVICE_ID,
  template: EMAILJS_CONFIG.TEMPLATE_REFERENCE
});

export { emailjs, EMAILJS_CONFIG };