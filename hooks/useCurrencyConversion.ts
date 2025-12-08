import { Currency } from '../types';

export const useCurrencyConversion = (exchangeRate: number) => {
  const convertToUSD = (value: number, currency: Currency): number => {
    if (currency === Currency.USD) return value;
    return value / (exchangeRate || 1200);
  };

  const convertFromUSD = (valueUSD: number, currency: Currency): number => {
    if (currency === Currency.USD) return valueUSD;
    return valueUSD * (exchangeRate || 1200);
  };

  const getEquivalent = (value: number, currency: Currency): string => {
    if (currency === Currency.USD) {
      const ars = convertFromUSD(value, Currency.ARS);
      return `≈ $${ars.toFixed(2)} ARS`;
    } else {
      const usd = convertToUSD(value, Currency.USD);
      return `≈ $${usd.toFixed(2)} USD`;
    }
  };

  const formatEquivalent = (value: number, currency: Currency): { amount: number; currency: string } => {
    if (currency === Currency.USD) {
      return {
        amount: convertFromUSD(value, Currency.ARS),
        currency: 'ARS',
      };
    } else {
      return {
        amount: convertToUSD(value, Currency.USD),
        currency: 'USD',
      };
    }
  };

  return { convertToUSD, convertFromUSD, getEquivalent, formatEquivalent };
};