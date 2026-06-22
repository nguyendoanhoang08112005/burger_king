import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'
import axios from 'axios'

// Lấy backend api origin để tải file json từ backend public folder
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '')

export const initI18n = async () => {
  let supportedLngs = ['vi', 'en']
  try {
    const res = await axios.get(`${apiBaseUrl}/settings/public`)
    const locales = res.data.data?.supported_locales
    if (locales && Array.isArray(locales)) {
      supportedLngs = locales.map(l => l.code)
    }
  } catch (err) {
    console.error('Không thể load danh sách ngôn ngữ động, dùng vi & en làm mặc định:', err)
  }

  await i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: {
        'zh': ['en', 'vi'], // ZH -> EN -> VI
        'ko': ['en', 'vi'], // KO -> EN -> VI
        'ja': ['en', 'vi'], // JA -> EN -> VI
        'default': ['vi']  // Các ngôn ngữ khác -> VI
      },
      returnEmptyString: false,
      supportedLngs,
      defaultNS: 'translation',
      backend: {
        // Tải file translation thông qua API để giải quyết triệt để CORS
        loadPath: `${apiBaseUrl}/locales/{{lng}}/{{ns}}.json?v=1.0.14`,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: 'hk_language',
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false,
      },
    })
}

export default i18n
