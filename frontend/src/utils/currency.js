// Map language to the default currency.
export const LANG_CURRENCY_MAP = {
  vi: { currency: 'VND', symbol: '₫', locale: 'vi-VN' },
  en: { currency: 'USD', symbol: '$', locale: 'en-US' },
}

// Exchange rates. Replace with a rate API when multi-currency checkout is enabled.
export const EXCHANGE_RATES = {
  VND: 1,
  USD: 0.000040,  // 1 VND = 0.00004 USD
}

// Format currency by locale.
export const formatCurrency = (
  amount,
  currency = 'VND',
  locale = 'vi-VN'
) => {
  // Convert from VND to the target currency.
  const rate = EXCHANGE_RATES[currency] ?? 1
  const converted = amount * rate

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(converted)
}
