import React, { createContext, useState, useContext, useEffect } from 'react';
import fr from '../i18n/locales/fr';
import mg from '../i18n/locales/mg';
import en from '../i18n/locales/en';

const translations = {
  fr,
  mg,
  en
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage && ['fr', 'mg', 'en'].includes(savedLanguage) ? savedLanguage : 'fr';
  });

  const [t, setT] = useState(translations[language]);

  useEffect(() => {
    setT(translations[language]);
    localStorage.setItem('language', language);
    document.documentElement.lang = language === 'fr' ? 'fr' : language === 'mg' ? 'mg' : 'en';
  }, [language]);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const translate = (key) => {
    return t[key] || key;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, changeLanguage, t, translate } },
    children
  );
};