import { GetHistoryOpts, GetLatestOpts } from '.';
import { ExtraPair, supportedCurrencies, SupportedCurrency } from './types';
import { isValidDate } from './utils';

export const validateOpts = (opts: GetLatestOpts | GetHistoryOpts) => {
  if ('start' in opts || 'end' in opts) {
    validateDates(opts.start, opts.end);
  }
  validateCurrency(opts.currency);
  validateExtraPairs(opts.extraPairs);
  validateAmount(opts.amount);
};

export const validateDates = (startDate?: Date, endDate?: Date) => {
  if (startDate === undefined && endDate === undefined) return;
  if (startDate !== undefined && !isValidDate(startDate)) {
    throw new Error(`Start date ${startDate} is not a valid date`);
  }
  if (endDate !== undefined && !isValidDate(endDate)) {
    throw new Error(`End date ${endDate} is not a valid date`);
  }
  if (startDate !== undefined && endDate !== undefined && startDate > endDate) {
    throw new Error('Start date must be before end date');
  }
  if (endDate !== undefined && endDate > new Date()) {
    throw new Error('End date must be in the past');
  }
};

export const validateCurrency = (
  currency?: SupportedCurrency | SupportedCurrency[]
) => {
  if (currency === undefined) return;
  if (Array.isArray(currency)) {
    currency.forEach((c) => {
      if (!supportedCurrencies.includes(c)) {
        throw new Error(`Currency ${c} is not supported`);
      }
    });
    return;
  }
  if (!supportedCurrencies.includes(currency)) {
    throw new Error(`Currency ${currency} is not supported`);
  }
};

export const validateExtraPairs = (extraPairs?: ExtraPair[]) => {
  if (extraPairs === undefined) return;
  extraPairs.forEach((pair) => {
    if (!supportedCurrencies.includes(pair.from)) {
      throw new Error(`Currency ${pair.from} in extraPairs is not supported`);
    }
    if (!supportedCurrencies.includes(pair.to)) {
      throw new Error(`Currency ${pair.to} in extraPairs is not supported`);
    }
  });
};

export const validateAmount = (amount?: number) => {
  if (amount === undefined) return;
  if (!Number.isFinite(amount)) {
    throw new Error('Amount must be a valid number');
  }
};
