import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import frTranslations from './locales/fr.json';
import mgTranslations from './locales/mg.json';
import enTranslations from './locales/en.json';

const resources = {
  fr: { translation: frTranslations },
  mg: { translation: mgTranslations },
  en: { translation: enTranslations }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: { useSuspense: false },
  });

export default i18n;