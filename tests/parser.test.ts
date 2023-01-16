import parse from '../lib/parser';
import { promises as fs } from 'fs';
import { expect, describe, it } from 'vitest';
import path from 'path';
import { supportedCurrencies, SupportedCurrency } from '../lib/types';

const mocksDir = path.join(__dirname, 'mocks');
const dailyXml = path.join(mocksDir, 'eurofxref-daily.xml');
const history90dXml = path.join(mocksDir, 'eurofxref-hist-90d.xml');
const historyAllXml = path.join(mocksDir, 'eurofxref-hist.xml');

describe('parse', async () => {
  it('should parse daily file', async () => {
    const xml = await fs.readFile(dailyXml, 'utf8');
    const data = parse(xml);
    expect(data).toHaveLength(1);
    for (const item of data) {
      expect(item.date).toBeInstanceOf(Date);
      expect(
        Object.keys(item.rates).every((currency) =>
          supportedCurrencies.includes(currency as SupportedCurrency)
        )
      ).toBe(true);
      expect(
        Object.values(item.rates).every((rate) => typeof rate === 'number')
      ).toBe(true);
    }
  });

  it('should parse history 90d file', async () => {
    const xml = await fs.readFile(history90dXml, 'utf8');
    const data = parse(xml);
    expect(data.length).toBeGreaterThan(1);
    for (const item of data) {
      expect(item.date).toBeInstanceOf(Date);
      expect(
        Object.keys(item.rates).every((currency) =>
          supportedCurrencies.includes(currency as SupportedCurrency)
        )
      ).toBe(true);
      expect(
        Object.values(item.rates).every((rate) => typeof rate === 'number')
      ).toBe(true);
    }
  });

  it('should parse history all file', async () => {
    const xml = await fs.readFile(historyAllXml, 'utf8');
    const data = parse(xml);
    expect(data.length).toBeGreaterThan(1);
    for (const item of data) {
      expect(item.date).toBeInstanceOf(Date);
      expect(
        Object.keys(item.rates).every((currency) =>
          supportedCurrencies.includes(currency as SupportedCurrency)
        )
      ).toBe(true);
      expect(
        Object.values(item.rates).every((rate) => typeof rate === 'number')
      ).toBe(true);
    }
  });
});
