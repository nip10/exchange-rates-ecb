import nock from 'nock';
import { describe, it, expect } from 'vitest';
import path from 'path';
import { getLatest, getHistory } from '../lib';
import { supportedCurrencies, type SupportedCurrency } from '../lib/types';

const mocksDir = path.join(__dirname, 'mocks');
const dailyXml = path.join(mocksDir, 'eurofxref-daily.xml');
const history90dXml = path.join(mocksDir, 'eurofxref-hist-90d.xml');

describe('main', () => {
  it('should get latest rates', async () => {
    const scope = nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .replyWithFile(200, dailyXml);
    const data = await getLatest();
    expect(data).toHaveLength(1);
    for (const d of data) {
      expect(d.date).toBeInstanceOf(Date);
      expect(
        Object.keys(d.rates).every((currency) =>
          supportedCurrencies.includes(currency as SupportedCurrency)
        )
      ).toBe(true);
    }
    scope.done();
  });

  it('should get latest rates w/ filters', async () => {
    const scope = nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .replyWithFile(200, dailyXml);
    const currency: SupportedCurrency[] = ['USD', 'GBP'];
    const data = await getLatest({ currency });
    expect(data).toHaveLength(1);
    for (const d of data) {
      expect(d.date).toBeInstanceOf(Date);
      expect(Object.keys(d.rates)).toEqual(expect.arrayContaining(currency));
    }
    scope.done();
  });
  it('should get historic rates', async () => {
    const scope = nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-hist-90d.xml')
      .replyWithFile(200, history90dXml);
    const data = await getHistory();
    expect(data.length).toBeGreaterThan(1);
    for (const d of data) {
      expect(d.date).toBeInstanceOf(Date);
      expect(
        Object.keys(d.rates).every((currency) =>
          supportedCurrencies.includes(currency as SupportedCurrency)
        )
      ).toBe(true);
    }
    scope.done();
  });
  it('should get historic rates w/ filters', async () => {
    const scope = nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-hist-90d.xml')
      .replyWithFile(200, history90dXml);
    const startDate = new Date('2021-01-01');
    const endDate = new Date('2023-01-01');
    const currency: SupportedCurrency[] = ['USD', 'JPY'];
    const data = await getHistory({ startDate, endDate, currency });
    expect(data.length).toBeGreaterThan(1);
    for (const d of data) {
      expect(d.date).toBeInstanceOf(Date);
      expect(d.date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
      expect(d.date.getTime()).toBeLessThanOrEqual(endDate.getTime());
      expect(Object.keys(d.rates)).toEqual(expect.arrayContaining(currency));
    }
    scope.done();
  });
});
