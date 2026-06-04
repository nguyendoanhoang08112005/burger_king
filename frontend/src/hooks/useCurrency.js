import { useTranslation } from 'react-i18next'
import { LANG_CURRENCY_MAP, formatCurrency } from '../utils/currency'

export const useCurrency = () => {
  const { i18n } = useTranslation()
  const lang = i18n.language || 'vi'
  const config = LANG_CURRENCY_MAP[lang] 
    ?? LANG_CURRENCY_MAP['vi']

  return {
    format: (amount) => formatCurrency(
      amount, config.currency, config.locale
    ),
    currency: config.currency,
    symbol: config.symbol,
    locale: config.locale,
  }
}
