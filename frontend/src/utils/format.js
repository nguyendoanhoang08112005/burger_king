import i18next from 'i18next'
import { LANG_CURRENCY_MAP, formatCurrency } from './currency'

export const formatVND = (amount) => {
  if (amount === undefined || amount === null) return '0'
  const lang = i18next.language || 'vi'
  const config = LANG_CURRENCY_MAP[lang] ?? LANG_CURRENCY_MAP['vi']
  return formatCurrency(amount, config.currency, config.locale)
}

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const lang = i18next.language || 'vi'
  const locale = lang === 'en' ? 'en-US' : 'vi-VN'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
