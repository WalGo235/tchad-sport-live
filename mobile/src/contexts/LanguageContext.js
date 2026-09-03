import React, { createContext, useContext, useEffect } from 'react';
import { I18nManager, Alert } from 'react-native';
import { translations } from '../translations';
import { useAppStore } from '../store/appStore';

const RTL_LANGUAGES = ['ar'];

const LanguageContext = createContext({
  language: 'fr',
  t: (key) => key,
  setLanguage: () => {},
  isRTL: false,
});

export function LanguageProvider({ children }) {
  const language = useAppStore((state) => state.language);
  const setLanguageStore = useAppStore((state) => state.setLanguage);

  // Au démarrage, aligne I18nManager sur la langue déjà enregistrée
  useEffect(() => {
    const shouldBeRTL = RTL_LANGUAGES.includes(language);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  const t = (key) => translations[language]?.[key] ?? translations.fr[key] ?? key;

  const setLanguage = (newLang) => {
    const wasRTL = I18nManager.isRTL;
    const willBeRTL = RTL_LANGUAGES.includes(newLang);

    setLanguageStore(newLang);

    if (wasRTL !== willBeRTL) {
      I18nManager.allowRTL(willBeRTL);
      I18nManager.forceRTL(willBeRTL);
      Alert.alert(
        `${translations.fr.restartTitle} / ${translations.en.restartTitle} / ${translations.ar.restartTitle}`,
        `${translations.fr.restartMessage}\n\n${translations.en.restartMessage}\n\n${translations.ar.restartMessage}`
      );
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, isRTL: I18nManager.isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}