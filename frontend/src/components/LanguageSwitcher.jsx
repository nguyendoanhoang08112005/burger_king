import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'

const LANGUAGES = [
  { code: 'vi', flagImg: '/flags/vn.svg', name: 'Vietnamese', short: 'VI' },
  { code: 'en', flagImg: '/flags/us.svg', name: 'English',    short: 'EN' },
]

const LanguageSwitcher = ({ variant = 'default' }) => {
  // variant: 'default' (customer) | 'compact' (admin)
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = LANGUAGES.find(
    l => l.code === i18n.language
  ) ?? LANGUAGES[0]

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
    i18n.changeLanguage(langCode)
    localStorage.setItem('hk_language', langCode)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg 
          transition-colors font-medium cursor-pointer
          ${variant === 'compact'
            ? 'px-2 py-1.5 text-xs hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
            : 'px-3 py-2 text-sm border border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200'
          }`}
        aria-label="Change language"
      >
        <img 
          src={current.flagImg} 
          alt={current.name} 
          className="w-5 h-3.5 object-cover rounded-sm shadow-sm" 
        />
        <span>{variant === 'compact' ? current.short : current.name}</span>
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
          py-1.5 z-50 min-w-[160px] overflow-hidden dark:bg-[#1E2130] dark:border-gray-700">
          {LANGUAGES.map(lang => (
            <button
              type="button"
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`w-full flex items-center gap-3 
                px-4 py-2.5 text-sm transition-colors cursor-pointer
                ${i18n.language === lang.code
                  ? 'bg-red-50 text-[#D62300] font-semibold dark:bg-red-500/10'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
            >
              <img 
                src={lang.flagImg} 
                alt={lang.name} 
                className="w-5 h-3.5 object-cover rounded-sm shadow-sm" 
              />
              <span>{lang.name}</span>
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
