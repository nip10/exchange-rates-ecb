import nock from 'nock';
import { describe, it, expect, afterEach } from 'vitest';
import { fetchLatest, fetchHistory, fetchAll } from '../lib/fetcher';
import { getLatest, getHistory } from '../lib';

describe('Network Error Handling', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should handle 404 errors for fetchLatest', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(404);

    await expect(fetchLatest()).rejects.toThrow('ECB exchange rate data not found (404)');
  });

  it('should handle 500 errors for fetchLatest', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .times(3)
      .reply(500);

    await expect(fetchLatest()).rejects.toThrow('ECB API server error (500)');
  });

  it('should handle 503 Service Unavailable', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .times(3)
      .reply(503, 'Service Unavailable');

    await expect(fetchLatest()).rejects.toThrow('ECB API server error (503)');
  });

  it('should handle network connection errors', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .replyWithError('ENOTFOUND');

    await expect(fetchLatest()).rejects.toThrow('Failed to fetch latest exchange rates');
  });

  it('should handle 404 errors for fetchHistory', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-hist-90d.xml')
      .reply(404);

    await expect(fetchHistory()).rejects.toThrow('ECB historical exchange rate data not found (404)');
  });

  it('should handle 404 errors for fetchAll', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-hist.xml')
      .reply(404);

    await expect(fetchAll()).rejects.toThrow('ECB full history exchange rate data not found (404)');
  });
});

describe('Validation Error Handling', () => {
  it('should throw error for invalid currency in getLatest', async () => {
    await expect(
      // @ts-expect-error - testing invalid input
      getLatest({ currency: 'INVALID' })
    ).rejects.toThrow('Currency INVALID is not supported');
  });

  it('should throw error for invalid currency array', async () => {
    await expect(
      // @ts-expect-error - testing invalid input
      getLatest({ currency: ['USD', 'INVALID'] })
    ).rejects.toThrow('Currency INVALID is not supported');
  });

  it('should throw error for future start date', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    await expect(
      getHistory({ startDate: futureDate })
    ).rejects.toThrow('Start date must be in the past');
  });

  it('should throw error for invalid date range (start > end)', async () => {
    const start = new Date('2024-12-31');
    const end = new Date('2024-01-01');

    await expect(
      getHistory({ startDate: start, endDate: end })
    ).rejects.toThrow('Start date must be before end date');
  });

  it('should throw error for invalid date type', async () => {
    await expect(
      // @ts-expect-error - testing invalid input
      getHistory({ startDate: 'invalid-date' })
    ).rejects.toThrow();
  });
});

describe('Parsing Error Handling', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should handle malformed XML from API', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, '<invalid>malformed XML without proper closing');

    await expect(getLatest()).rejects.toThrow('Failed to parse exchange rate XML');
  });

  it('should handle empty response from API', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, '');

    await expect(getLatest()).rejects.toThrow('Failed to parse exchange rate XML');
  });

  it('should handle XML with wrong structure', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(
        200,
        `<?xml version="1.0"?><Root><WrongStructure>data</WrongStructure></Root>`
      );

    await expect(getLatest()).rejects.toThrow('Invalid ECB XML structure');
  });
});
