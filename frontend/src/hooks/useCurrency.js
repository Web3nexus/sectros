import { useState, useEffect } from 'react';
import api from '../services/api';

const DEFAULT_CURRENCY = {
  code: 'USD',
  symbol: '$',
  country: 'US',
};

// Country code to default currency mapping
export const COUNTRY_CURRENCY_MAP = {
  US: { name: 'United States', code: 'USD', symbol: '$' },
  GB: { name: 'United Kingdom', code: 'GBP', symbol: '£' },
  UK: { name: 'United Kingdom', code: 'GBP', symbol: '£' },
  DE: { name: 'Germany', code: 'EUR', symbol: '€' },
  FR: { name: 'France', code: 'EUR', symbol: '€' },
  IT: { name: 'Italy', code: 'EUR', symbol: '€' },
  ES: { name: 'Spain', code: 'EUR', symbol: '€' },
  NL: { name: 'Netherlands', code: 'EUR', symbol: '€' },
  BE: { name: 'Belgium', code: 'EUR', symbol: '€' },
  AT: { name: 'Austria', code: 'EUR', symbol: '€' },
  IE: { name: 'Ireland', code: 'EUR', symbol: '€' },
  PT: { name: 'Portugal', code: 'EUR', symbol: '€' },
  GR: { name: 'Greece', code: 'EUR', symbol: '€' },
  FI: { name: 'Finland', code: 'EUR', symbol: '€' },
  NG: { name: 'Nigeria', code: 'NGN', symbol: '₦' },
  GH: { name: 'Ghana', code: 'GHS', symbol: 'GH₵' },
  KE: { name: 'Kenya', code: 'KES', symbol: 'KSh' },
  ZA: { name: 'South Africa', code: 'ZAR', symbol: 'R' },
  CA: { name: 'Canada', code: 'CAD', symbol: 'CA$' },
  AU: { name: 'Australia', code: 'AUD', symbol: 'A$' },
  NZ: { name: 'New Zealand', code: 'NZD', symbol: 'NZ$' },
  AE: { name: 'United Arab Emirates', code: 'AED', symbol: 'AED' },
  SA: { name: 'Saudi Arabia', code: 'SAR', symbol: 'SAR' },
  IN: { name: 'India', code: 'INR', symbol: '₹' },
  JP: { name: 'Japan', code: 'JPY', symbol: '¥' },
  CH: { name: 'Switzerland', code: 'CHF', symbol: 'CHF' },
  SE: { name: 'Sweden', code: 'SEK', symbol: 'kr' },
  NO: { name: 'Norway', code: 'NOK', symbol: 'kr' },
  DK: { name: 'Denmark', code: 'DKK', symbol: 'kr' },
  PL: { name: 'Poland', code: 'PLN', symbol: 'zł' },
  SG: { name: 'Singapore', code: 'SGD', symbol: 'S$' },
  BR: { name: 'Brazil', code: 'BRL', symbol: 'R$' },
  MX: { name: 'Mexico', code: 'MXN', symbol: 'MX$' },
};

export const COMMON_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$) - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$) - Australian Dollar' },
  { code: 'NGN', symbol: '₦', label: 'NGN (₦) - Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', label: 'GHS (GH₵) - Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', label: 'KES (KSh) - Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR (R) - South African Rand' },
  { code: 'AED', symbol: 'AED', label: 'AED (AED) - UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', label: 'SAR (SAR) - Saudi Riyal' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF (CHF) - Swiss Franc' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) - Japanese Yen' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$) - Singapore Dollar' },
];

function getStoredCurrency() {
  try {
    const symbol = localStorage.getItem('tenant_currency_symbol');
    const code = localStorage.getItem('tenant_currency_code');
    const country = localStorage.getItem('tenant_country');
    if (symbol || code) {
      return {
        symbol: symbol || '$',
        code: code || 'USD',
        country: country || 'US',
      };
    }
  } catch (e) {
    // Ignore storage issues
  }
  return DEFAULT_CURRENCY;
}

export function useCurrency() {
  const [currency, setCurrency] = useState(getStoredCurrency);

  useEffect(() => {
    let isMounted = true;
    api.get('configuration')
      .then(res => {
        if (!isMounted || !res.data) return;
        const symbol = res.data.currency_symbol || '$';
        const code = res.data.currency_code || (res.data.country && COUNTRY_CURRENCY_MAP[res.data.country]?.code) || 'USD';
        const country = res.data.country || 'US';

        const updated = { symbol, code, country };
        setCurrency(updated);
        try {
          localStorage.setItem('tenant_currency_symbol', symbol);
          localStorage.setItem('tenant_currency_code', code);
          localStorage.setItem('tenant_country', country);
        } catch (e) {}
      })
      .catch(() => {
        // Fallback to existing stored currency
      });

    return () => { isMounted = false; };
  }, []);

  const formatAmount = (amount, decimals = 2) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return `${currency.symbol}0.00`;
    return `${currency.symbol}${num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  return {
    symbol: currency.symbol,
    code: currency.code,
    country: currency.country,
    formatAmount,
  };
}

export default useCurrency;
