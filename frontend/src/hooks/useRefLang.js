import { useSearchParams } from 'react-router-dom'
import { useUiStore } from '../store/uiStore'

export const useRefLang = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const publicSettings = useUiStore(state => state.publicSettings)

  // Get active locales from public settings, fallback to vi & en if not loaded
  const dbLocales = publicSettings?.supported_locales
  const LOCALES = (dbLocales && dbLocales.length > 0)
    ? dbLocales.map(l => ({
        code: l.code,
        flag: l.flag || l.code.toUpperCase(),
        label: l.name,
        short: l.code.toUpperCase(),
        is_default: !!l.is_default,
      }))
    : [
        { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt', short: 'VI', is_default: true },
        { code: 'en', flag: '🇺🇸', label: 'English', short: 'EN', is_default: false },
      ]

  const defaultLocale = LOCALES.find(l => l.is_default) || LOCALES[0]
  const defaultCode = defaultLocale ? defaultLocale.code : 'vi'

  const requestedLang = searchParams.get('ref_lang') || defaultCode
  const refLang = LOCALES.some(locale => locale.code === requestedLang) ? requestedLang : defaultCode
  const currentLocale = LOCALES.find(locale => locale.code === refLang) ?? LOCALES[0]

  const switchLang = code => {
    const nextParams = new URLSearchParams(searchParams)
    if (code === defaultCode) {
      nextParams.delete('ref_lang')
    } else {
      nextParams.set('ref_lang', code)
    }
    setSearchParams(nextParams)
  }

  return {
    refLang,
    currentLocale,
    switchLang,
    isDefault: refLang === defaultCode,
    LOCALES,
    defaultCode,
    defaultLocale,
  }
}
