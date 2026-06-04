import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const TranslatableInput = ({
  label,
  value = {},
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  rows = 4
}) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('vi')

  const viValue = value?.vi || ''
  const enValue = value?.en || ''

  const handleFieldChange = (lang, newValue) => {
    onChange({
      ...value,
      [lang]: newValue
    })
  }

  const isEnMissing = !enValue.trim()
  const activePlaceholder = placeholder || (activeTab === 'vi' ? t('admin.translation.vi_placeholder') : t('admin.translation.en_placeholder'))

  return (
    <div className="space-y-1.5 mb-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
          {label} {required && activeTab === 'vi' && <span className="text-red-500">*</span>}
        </label>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200/50 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => setActiveTab('vi')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'vi'
                ? 'bg-white dark:bg-slate-700 text-[#D62300] shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span>VI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-200 cursor-pointer relative ${
              activeTab === 'en'
                ? 'bg-white dark:bg-slate-700 text-[#002F6C] shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span>EN</span>
            {isEnMissing && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" title={t('admin.translation.en_missing_title')} />
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            value={activeTab === 'vi' ? viValue : enValue}
            onChange={(e) => handleFieldChange(activeTab, e.target.value)}
            placeholder={activePlaceholder}
            required={required && activeTab === 'vi'}
            rows={rows}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1E2130] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#D62300]/20 focus:border-[#D62300] outline-none transition"
          />
        ) : (
          <input
            type="text"
            value={activeTab === 'vi' ? viValue : enValue}
            onChange={(e) => handleFieldChange(activeTab, e.target.value)}
            placeholder={activePlaceholder}
            required={required && activeTab === 'vi'}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1E2130] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#D62300]/20 focus:border-[#D62300] outline-none transition"
          />
        )}

        {activeTab === 'en' && isEnMissing && (
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
            {t('admin.translation.en_missing_message')}
          </p>
        )}
      </div>
    </div>
  )
}

export default TranslatableInput
