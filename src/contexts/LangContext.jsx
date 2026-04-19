import { createContext, useContext, useState, useCallback } from 'react';
import ko from '../i18n/ko';
import zh from '../i18n/zh';

const translations = { ko, zh };
const LangContext = createContext();

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem('chuiniu_lang') || 'ko'
  );

  const setLang = useCallback((l) => {
    setLangState(l);
    localStorage.setItem('chuiniu_lang', l);
  }, []);

  const t = useCallback(
    (key) => {
      const val = getNestedValue(translations[lang], key);
      return val !== undefined ? val : key;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
