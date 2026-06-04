import { useSearchParams } from 'react-router-dom'

export const LOCALES = [
  {
    code: 'vi',
    flag: 'VI',
    label: 'Vietnamese',
    short: 'VI',
    flagImg: '/flags/vn.svg',
  },
  {
    code: 'en',
    flag: 'EN',
    label: 'English',
    short: 'EN',
    flagImg: '/flags/us.svg',
  },
]

export const useRefLang = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedLang = searchParams.get('ref_lang') || 'vi'
  const refLang = LOCALES.some(locale => locale.code === requestedLang) ? requestedLang : 'vi'
  const currentLocale = LOCALES.find(locale => locale.code === refLang) ?? LOCALES[0]

  const switchLang = code => {
    const nextParams = new URLSearchParams(searchParams)
    if (code === 'vi') {
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
    isDefault: refLang === 'vi',
    LOCALES,
  }
}
