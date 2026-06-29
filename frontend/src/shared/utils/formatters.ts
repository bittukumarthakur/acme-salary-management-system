interface CurrencyFormatterOptions {
  locale?: string
  inrCode?: string
}

const DEFAULT_LOCALE = 'en-IN'

export function formatCurrencyWithSymbol(
  value: number,
  currency = 'INR',
  options?: CurrencyFormatterOptions,
): string {
  return new Intl.NumberFormat(options?.locale ?? DEFAULT_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatCurrencyWithCode(
  value: number,
  currency: string,
  options?: CurrencyFormatterOptions,
): string {
  const formattedValue = new Intl.NumberFormat(
    options?.locale ?? DEFAULT_LOCALE,
    {
      maximumFractionDigits: 0,
    },
  ).format(value)

  if (currency === 'INR') {
    return `${options?.inrCode ?? 'Rs'} ${formattedValue}`
  }

  return `${currency} ${formattedValue}`
}

export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
