/* eslint-disable @typescript-eslint/no-non-null-assertion */
import transform from '../lib/transformer';
import { expect, describe, it } from 'vitest';
import { supportedCurrencies, SupportedCurrency } from '../lib/types';
import { parsedDailyData, parsedHistoryData } from './mocks/parsedData';

describe('transform', () => {
  describe('daily', () => {
    it('should return valid data without opts', () => {
      const data = transform([parsedDailyData]);
      expect(data).toHaveLength(1);
      expect(data).toEqual([parsedDailyData]);
    });

    it('should filter currencies', () => {
      const currency: SupportedCurrency[] = ['USD', 'JPY'];
      const data = transform([parsedDailyData], { currency });
      expect(data).toHaveLength(1);
      for (const d of data) {
        expect(d.date).toBeInstanceOf(Date);
        expect(Object.keys(d.rates)).toEqual(expect.arrayContaining(currency));
      }
    });
  });

  describe('history 90d', () => {
    it('should return valid data without opts', () => {
      const data = transform(parsedHistoryData);
      expect(data.length).toBeGreaterThan(1);
      expect(data).toEqual(parsedHistoryData);
    });

    it('should filter currencies', () => {
      const currency: SupportedCurrency[] = ['USD', 'JPY'];
      const data = transform(parsedHistoryData, { currency });
      expect(data.length).toBeGreaterThan(1);
      for (const d of data) {
        expect(d.date).toBeInstanceOf(Date);
        expect(Object.keys(d.rates)).toEqual(expect.arrayContaining(currency));
      }
    });

    it('should filter start date', () => {
      const startDate = new Date('2021-01-01');
      const data = transform(parsedHistoryData, { startDate });
      expect(data.length).toBeGreaterThan(1);
      for (const d of data) {
        expect(d.date).toBeInstanceOf(Date);
        expect(d.date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(
          Object.keys(d.rates).every((currency) =>
            supportedCurrencies.includes(currency as SupportedCurrency)
          )
        ).toBe(true);
      }
    });

    it('should filter end date', () => {
      const endDate = new Date('2023-01-01');
      const data = transform(parsedHistoryData, { endDate });
      expect(data.length).toBeGreaterThan(1);
      for (const d of data) {
        expect(d.date).toBeInstanceOf(Date);
        expect(d.date.getTime()).toBeLessThanOrEqual(endDate.getTime());
        expect(
          Object.keys(d.rates).every((currency) =>
            supportedCurrencies.includes(currency as SupportedCurrency)
          )
        ).toBe(true);
      }
    });

    it('should return valid data with all filters', () => {
      const startDate = new Date('2021-01-01');
      const endDate = new Date('2023-01-01');
      const currency: SupportedCurrency[] = ['USD', 'JPY'];
      const data = transform(parsedHistoryData, {
        startDate,
        endDate,
        currency,
      });
      for (const d of data) {
        expect(d.date).toBeInstanceOf(Date);
        expect(d.date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(d.date.getTime()).toBeLessThanOrEqual(endDate.getTime());
        expect(Object.keys(d.rates)).toEqual(expect.arrayContaining(currency));
      }
    });
  });
});
