export const supportedCurrencies = [
  'USD',
  'JPY',
  'BGN',
  'CZK',
  'DKK',
  'GBP',
  'HUF',
  'LTL',
  'LVL',
  'PLN',
  'RON',
  'SEK',
  'CHF',
  'ISK',
  'NOK',
  'HRK',
  'TRY',
  'AUD',
  'BRL',
  'CAD',
  'CNY',
  'HKD',
  'IDR',
  'ILS',
  'INR',
  'KRW',
  'MXN',
  'MYR',
  'NZD',
  'PHP',
  'SGD',
  'THB',
  'ZAR',
  // Older currencies
  'EEK',
  'SKK',
  'CYP',
  'MTL',
  'SIT',
  'ROL',
  'TRL',
  // Currently unsupported
  'RUB',
] as const;

export type SupportedCurrency = (typeof supportedCurrencies)[number];

export type EcbExchangeRates = {
  [currency in SupportedCurrency]: number;
};

export interface EcbExchangeRatesDay {
  time: string;
  rates: EcbExchangeRates;
}

export interface ExchangeRatesDay {
  date: Date;
  rates: EcbExchangeRates;
}

export interface ExtraPair {
  from: SupportedCurrency;
  to: SupportedCurrency;
}

export interface EcbXmlExchangeRatesDay {
  Cube: {
    '@_currency': SupportedCurrency;
    '@_rate': string;
  }[];
  '@_time': string;
}
