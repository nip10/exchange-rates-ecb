import { fetchAll, fetchHistory, fetchLatest } from './fetcher';
import parse from './parser';
import transform from './transformer';
import { validateOpts } from './validators';
import type { SupportedCurrency } from './types';

/**
 * Base configuration options for fetching exchange rates.
 *
 * @example
 * ```typescript
 * const opts: BaseOpts = {
 *   currency: ['USD', 'GBP'],
 * };
 * ```
 */
export interface BaseOpts {
  /** Single currency code or array of codes to filter results (e.g., 'USD' or ['USD', 'GBP']) */
  currency?: SupportedCurrency | SupportedCurrency[];

  /**
   * Calculate additional currency pairs (e.g., SEK/USD from SEK/EUR and USD/EUR rates).
   * Cross rates are calculated using the formula: rate = rates[from] / rates[to]
   * Note: These are calculated rates, not official ECB rates.
   */
  extraPairs?: {
    from: SupportedCurrency;
    to: SupportedCurrency;
  }[];

  /**
   * Convert specified amount from EUR to other currencies.
   * The amount will be converted using the ECB exchange rates.
   */
  amount?: number;
}

export interface GetLatestOpts extends BaseOpts {}

/**
 * Fetches the latest exchange rates from the European Central Bank.
 *
 * Rates are typically updated daily at 16:00 CET, except on TARGET closing days.
 * The ECB reference rates are based on a daily concertation procedure between central banks.
 *
 * @param opts - Optional configuration options
 * @param opts.currency - Single currency code or array of codes to filter results (e.g., 'USD' or ['USD', 'GBP'])
 * @param opts.extraPairs - Calculate cross-currency rates (e.g., SEK/USD from SEK/EUR and USD/EUR). Not official ECB rates.
 * @param opts.amount - Amount in EUR to convert to other currencies
 *
 * @returns Promise resolving to array with single day of exchange rates
 *
 * @throws {Error} If currency is not supported
 * @throws {Error} If network request fails or times out
 * @throws {Error} If XML parsing fails
 * @throws {Error} If currency in extraPairs is not found in rates
 *
 * @example
 * ```typescript
 * // Get all rates for today
 * const [today] = await getLatest();
 * console.log(today.date); // Date object
 * console.log(today.rates.USD); // 1.0945
 *
 * // Get specific currencies only
 * const [today] = await getLatest({ currency: ['USD', 'GBP', 'JPY'] });
 * console.log(Object.keys(today.rates)); // ['USD', 'GBP', 'JPY']
 *
 * // Calculate cross-currency rates
 * const [data] = await getLatest({
 *   extraPairs: [{ from: 'SEK', to: 'USD' }]
 * });
 * console.log(data.extraPairs[0].rate); // SEK/USD rate
 *
 * // Convert amounts
 * const [result] = await getLatest({
 *   currency: ['USD', 'GBP'],
 *   amount: 100
 * });
 * console.log(result.convertedAmounts.USD); // 100 EUR in USD
 * ```
 *
 * @see {@link https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html ECB Reference Rates}
 */
export const getLatest = async (opts: GetLatestOpts = {}) => {
  validateOpts(opts);
  const data = await fetchLatest();
  const parsedData = parse(data);
  const transformedData = transform(parsedData, opts);
  return transformedData;
};

export interface GetHistoryOpts extends BaseOpts {
  startDate?: Date;
  endDate?: Date;
  fullHistory?: boolean;
}

/**
 * Fetches historical exchange rates from the European Central Bank.
 *
 * By default, retrieves the last 90 days of data. Use `startDate` and `endDate`
 * to specify a custom date range, or set `fullHistory: true` to get all rates since 1999.
 *
 * @param opts - Optional configuration options
 * @param opts.currency - Single currency code or array of codes to filter results
 * @param opts.startDate - Earliest date to include (default: 90 days ago)
 * @param opts.endDate - Latest date to include (default: today)
 * @param opts.fullHistory - If true, fetches all rates since 1999 (~7MB, may take 1-2 seconds)
 * @param opts.extraPairs - Calculate cross-currency rates (e.g., SEK/USD from SEK/EUR and USD/EUR). Not official ECB rates.
 * @param opts.amount - Amount in EUR to convert to other currencies
 *
 * @returns Promise resolving to array of exchange rates, one entry per day
 *
 * @throws {Error} If startDate is after endDate
 * @throws {Error} If startDate is in the future
 * @throws {Error} If currency is not supported
 * @throws {Error} If network request fails or times out
 * @throws {Error} If XML parsing fails
 * @throws {Error} If currency in extraPairs is not found in rates
 *
 * @example
 * ```typescript
 * // Get last 90 days (default)
 * const history = await getHistory();
 *
 * // Get specific date range
 * const jan2024 = await getHistory({
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-01-31'),
 * });
 *
 * // Filter by currency
 * const usdHistory = await getHistory({ currency: 'USD' });
 *
 * // Get full history since 1999 (warning: large download)
 * const allRates = await getHistory({ fullHistory: true });
 *
 * // Calculate cross-currency rates with amount conversion
 * const data = await getHistory({
 *   currency: ['USD', 'GBP'],
 *   extraPairs: [{ from: 'SEK', to: 'NOK' }],
 *   amount: 1000
 * });
 * console.log(data[0].extraPairs[0].rate); // SEK/NOK rate
 * console.log(data[0].convertedAmounts.USD); // 1000 EUR in USD
 * ```
 *
 * @remarks
 * Full history is approximately 7 MB and may take 1-2 seconds to fetch and parse.
 * Consider caching results for large date ranges. Rates are filtered client-side,
 * so requesting a small date range still downloads the full dataset (90 days or full history).
 *
 * @see {@link https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html ECB Reference Rates}
 */
export const getHistory = async (opts: GetHistoryOpts = {}) => {
  validateOpts(opts);
  const data = opts.fullHistory ? await fetchAll() : await fetchHistory();
  const parsedData = parse(data);
  const transformedData = transform(parsedData, opts);
  return transformedData;
};
