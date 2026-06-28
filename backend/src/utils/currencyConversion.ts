/**
 * Currency conversion utilities for the API.
 * Provides deterministic conversion rates and logic.
 */

/** Supported currencies and their conversion rates to INR */
const CONVERSION_RATES: Record<string, number> = {
  INR: 1.0,
  USD: 83.2, // Example rates
  EUR: 90.5,
  GBP: 105.0,
};

/** Supported currency codes */
export const SUPPORTED_CURRENCIES = Object.keys(CONVERSION_RATES);

/**
 * Converts a salary amount from one currency to another.
 * Assumes all amounts are currently in INR and converts based on targetCurrency.
 *
 * @param amount The salary amount in INR
 * @param targetCurrencyCode The target currency code (e.g., 'USD', 'EUR')
 * @returns An object with converted amount and conversion rate
 * @throws Error if unsupported currency is provided
 */
export function convertSalary(amount: number, targetCurrencyCode: string) {
  const normalizedCode = targetCurrencyCode.toUpperCase();

  if (!CONVERSION_RATES[normalizedCode]) {
    throw new Error(`Unsupported currency: ${targetCurrencyCode}`);
  }

  const rate = CONVERSION_RATES[normalizedCode];
  const convertedAmount = amount / rate;

  return {
    originalAmount: amount,
    convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
    rate,
    originalCurrency: 'INR',
    targetCurrency: normalizedCode,
  };
}

/**
 * Gets the conversion details for a given currency code.
 * Returns rate 1 if currency is INR (no conversion needed).
 *
 * @param targetCurrencyCode The target currency code
 * @returns An object with conversion details
 * @throws Error if unsupported currency is provided
 */
export function getConversionRate(targetCurrencyCode: string) {
  const normalizedCode = targetCurrencyCode.toUpperCase();

  if (!CONVERSION_RATES[normalizedCode]) {
    throw new Error(`Unsupported currency: ${targetCurrencyCode}`);
  }

  return {
    fromCurrency: 'INR',
    toCurrency: normalizedCode,
    rate: CONVERSION_RATES[normalizedCode],
    convertedAt: new Date().toISOString(),
  };
}
