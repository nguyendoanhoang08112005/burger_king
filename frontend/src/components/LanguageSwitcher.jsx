import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'
import { useUiStore } from '../store/uiStore'
import { renderFlag } from '../utils/adminUtils'

const LanguageSwitcher = ({ variant = 'default', scrolled = false }) => {
  // variant: 'default' (customer) | 'compact' (admin) | 'header' (transparent header)
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const publicSettings = useUiStore(state => state.publicSettings)
  
  const supportedLocales = publicSettings?.supported_locales ?? [
    { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt', native_name: 'Tiếng Việt' },
    { code: 'en', flag: '🇺🇸', name: 'English', native_name: 'English' },
  ]

  const current = supportedLocales.find(
    l => l.code === i18n.language
  ) ?? supportedLocales[0] ?? { code: 'vi', flag: '🇻🇳', name: 'Tiếng Việt', native_name: 'Tiếng Việt' }

  // Close dropdown on outside click.
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (langCode) => {
    localStorage.setItem('hk_language', langCode)
    i18n.changeLanguage(langCode)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg 
          transition-colors font-semibold cursor-pointer
          ${variant === 'compact'
            ? 'px-2 py-1.5 text-xs hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
            : variant === 'header'
              ? `px-3.5 py-2 text-sm border transition-colors ${
                  scrolled
                    ? 'border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200'
                    : 'border-white/20 hover:bg-white/10 text-white'
                }`
              : 'px-3.5 py-2 text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200'
          }`}
        aria-label="Change language"
      >
        <span className="text-base leading-none select-none flex items-center">{renderFlag(current.code, "h-3.5 w-5 rounded-sm object-cover shadow-sm")}</span>
        <span>{variant === 'compact' ? current.code.toUpperCase() : current.native_name}</span>
        <svg width="10" height="10" viewBox="0 0 10 10"
          className={`transition-transform duration-200
            ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5L5 6.5L8 3.5" 
            stroke="currentColor" strokeWidth="1.5"
            fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 
          bg-white rounded-xl shadow-lg border border-gray-100 
          py-1.5 z-50 min-w-[160px] overflow-hidden dark:bg-[#1E2130] dark:border-gray-700 animate-fade-in">
          {supportedLocales.map(lang => (
            <button
              type="button"
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`w-full flex items-center gap-3 
                px-4 py-2.5 text-sm transition-colors cursor-pointer
                ${i18n.language === lang.code
                  ? 'bg-red-50 text-[#D62300] font-bold dark:bg-red-500/10'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
            >
              <span className="text-base leading-none select-none flex items-center">{renderFlag(lang.code, "h-3.5 w-5 rounded-sm object-cover shadow-sm")}</span>
              <span>{lang.native_name}</span>
              {i18n.language === lang.code && (
                <svg className="ml-auto" width="14" height="14"
                  viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4"
                    stroke="#D62300" strokeWidth="2"
                    strokeLinecap="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
