import type { GetHistoryOpts, GetLatestOpts } from '.';
import type { EcbExchangeRates, ExchangeRatesDay } from './types';

const transform = (
  data: ExchangeRatesDay[],
  opts?: GetLatestOpts | GetHistoryOpts
) => {
  const currencyArr =
    !opts || !opts.currency
      ? []
      : opts.currency && Array.isArray(opts.currency)
      ? opts.currency
      : [opts.currency];

  // Pre-compute timestamps for date filtering (optimization)
  const startTime = opts && 'startDate' in opts && opts.startDate !== undefined
    ? opts.startDate.getTime()
    : undefined;
  const endTime = opts && 'endDate' in opts && opts.endDate !== undefined
    ? opts.endDate.getTime()
    : undefined;

  // Early filtering using filter + map for better performance
  const transformedResponse = data
    .filter(({ date }) => {
      const time = date.getTime();
      if (startTime !== undefined && time < startTime) return false;
      if (endTime !== undefined && time > endTime) return false;
      return true;
    })
    .map(({ date, rates }) => {
      const filteredRates =
        currencyArr.length > 0
          ? (Object.fromEntries(
              currencyArr
                .filter((currency) => currency in rates)
                .map((currency) => [currency, rates[currency]])
            ) as EcbExchangeRates)
          : rates;

      const result: ExchangeRatesDay = {
        date,
        rates: filteredRates,
      };

      // Calculate extra pairs if requested
      if (opts?.extraPairs && opts.extraPairs.length > 0) {
        result.extraPairs = opts.extraPairs.map(({ from, to }) => {
          const fromRate = rates[from];
          const toRate = rates[to];

          if (fromRate === undefined) {
            throw new Error(`Currency ${from} not found in exchange rates for ${date.toISOString()}`);
          }
          if (toRate === undefined) {
            throw new Error(`Currency ${to} not found in exchange rates for ${date.toISOString()}`);
          }

          return {
            from,
            to,
            rate: fromRate / toRate,
          };
        });
      }

      // Convert amounts if requested
      if (opts?.amount !== undefined) {
        const ratesForConversion = currencyArr.length > 0 ? filteredRates : rates;
        result.convertedAmounts = Object.fromEntries(
          Object.entries(ratesForConversion).map(([currency, rate]) => [
            currency,
            opts.amount! * rate,
          ])
        ) as Partial<EcbExchangeRates>;
      }

      return result;
    });

  return transformedResponse;
};

export default transform;
