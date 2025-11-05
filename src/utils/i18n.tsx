import {createContext, useContext, ParentComponent, createSignal, Accessor, children, createMemo} from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { en, Translation } from '../i18n/en';
import { uk } from '../i18n/uk';
import { ru } from '../i18n/ru';

export type Language = 'en' | 'uk' | 'ru';

const translations: Record<Language, Translation> = {
  en,
  uk,
  ru,
};

type Translate = i18n.Translator<i18n.Flatten<Translation>>;

type I18nContextType = {
  t: Translate;
  locale: Accessor<Language>;
  setLocale: (lang: Language) => void;
};

const I18nProviderContext = createContext<I18nContextType>();

export const I18nProvider: ParentComponent = (props) => {
  const getStoredLanguage = (): Language => {
    const stored = localStorage.getItem('language');
    if (stored && (stored === 'en' || stored === 'uk' || stored === 'ru')) {
      return stored as Language;
    }
    return 'en';
  };

  const [locale, setLocaleSignal] = createSignal<Language>(getStoredLanguage());

  const dict = createMemo(() => i18n.flatten(translations[locale()]));
  const t = i18n.translator(dict, i18n.resolveTemplate);

  const setLocale = (lang: Language) => {
    setLocaleSignal(lang);
    localStorage.setItem('language', lang);
  };

  const value: I18nContextType = {
    t,
    locale,
    setLocale,
  };

  return (
    <I18nProviderContext.Provider value={value}>
      {props.children}
    </I18nProviderContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nProviderContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

export const getLocaleDateFormat = (locale: Language): string => {
  const formats: Record<Language, string> = {
    en: 'en-US',
    uk: 'uk-UA',
    ru: 'ru-RU',
  };
  return formats[locale];
};
