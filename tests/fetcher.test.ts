import nock from 'nock';
import { describe, it, expect } from 'vitest';
import { fetchLatest, fetchHistory, fetchAll } from '../lib/fetcher';
import { promises as fs } from 'fs';
import path from 'path';

const mocksDir = path.join(__dirname, 'mocks');
const dailyXml = path.join(mocksDir, 'eurofxref-daily.xml');
const history90dXml = path.join(mocksDir, 'eurofxref-hist-90d.xml');
const historyAllXml = path.join(mocksDir, 'eurofxref-hist.xml');

describe('fetchLatest', () => {
  it('should return the latest exchange rates', async () => {
    const scope = nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .replyWithFile(200, dailyXml);

    const xml = await fs.readFile(dailyXml, 'utf8');

    const data = await fetchLatest();
    expect(data).toEqual(xml);

    scope.done();
  });
});

describe('fetchHistory', () => {
  it('should return the last 90 days of exchange rates', async () => {
    const scope = nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-hist-90d.xml')
      .replyWithFile(200, history90dXml);

    const xml = await fs.readFile(history90dXml, 'utf8');

    const data = await fetchHistory();
    expect(data).toEqual(xml);

    scope.done();
  });
});

describe('fetchHistoryAll', () => {
  it('should return the history exchange rates', async () => {
    const scope = nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-hist.xml')
      .replyWithFile(200, historyAllXml);

    const xml = await fs.readFile(historyAllXml, 'utf8');

    const data = await fetchAll();
    expect(data).toEqual(xml);

    scope.done();
  });
});
