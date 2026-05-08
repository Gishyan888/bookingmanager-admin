import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hy from './locales/hy.json'
import ru from './locales/ru.json'

export const SUPPORTED_LANGS = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧', flagCode: 'gb' },
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺', flagCode: 'ru' },
  { code: 'hy', label: 'Armenian', native: 'Հայերեն', flag: '🇦🇲', flagCode: 'am' },
]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      hy: { translation: hy },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGS.map((l) => l.code),
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'bm_lang',
    },
    returnNull: false,
  })

export default i18n
