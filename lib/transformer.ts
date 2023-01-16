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
  const transformedResponse = data.reduce((acc, { date, rates }) => {
    if (
      opts &&
      'startDate' in opts &&
      opts.startDate !== undefined &&
      date.getTime() < opts.startDate.getTime()
    ) {
      return acc;
    }
    if (
      opts &&
      'endDate' in opts &&
      opts.endDate !== undefined &&
      date.getTime() > opts.endDate.getTime()
    ) {
      return acc;
    }
    acc.push({
      date,
      rates:
        currencyArr.length > 0
          ? currencyArr.reduce((acc, currency) => {
              if (currency) {
                acc[currency] = rates[currency];
              }
              return acc;
            }, {} as EcbExchangeRates)
          : rates,
    });
    return acc;
  }, [] as ExchangeRatesDay[]);
  return transformedResponse;
};

export default transform;
