import { fetchHistory, fetchLatest } from './fetcher';
import parse from './parser';
import transform from './transformer';
import { validateOpts } from './validators';
import type { SupportedCurrency } from './types';

export interface BaseOpts {
  currency?: SupportedCurrency | SupportedCurrency[];
  extraPairs?: {
    from: SupportedCurrency;
    to: SupportedCurrency;
  }[];
  amount?: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetLatestOpts extends BaseOpts {}

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
}

export const getHistory = async (opts: GetHistoryOpts = {}) => {
  validateOpts(opts);
  const data = await fetchHistory();
  const parsedData = parse(data);
  const transformedData = transform(parsedData, opts);
  return transformedData;
};
