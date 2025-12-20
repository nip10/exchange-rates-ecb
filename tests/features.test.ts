import nock from 'nock';
import { describe, it, expect, afterEach } from 'vitest';
import { getLatest, getHistory } from '../lib';

const validXml = `<?xml version="1.0"?>
<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01">
  <Cube>
    <Cube time="2024-01-15">
      <Cube currency="USD" rate="1.0945"/>
      <Cube currency="GBP" rate="0.8573"/>
      <Cube currency="SEK" rate="11.3450"/>
      <Cube currency="NOK" rate="11.5230"/>
      <Cube currency="JPY" rate="161.45"/>
    </Cube>
  </Cube>
</gesmes:Envelope>`;

const historyXml = `<?xml version="1.0"?>
<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01">
  <Cube>
    <Cube time="2024-01-15">
      <Cube currency="USD" rate="1.0945"/>
      <Cube currency="GBP" rate="0.8573"/>
      <Cube currency="SEK" rate="11.3450"/>
    </Cube>
    <Cube time="2024-01-14">
      <Cube currency="USD" rate="1.0950"/>
      <Cube currency="GBP" rate="0.8580"/>
      <Cube currency="SEK" rate="11.3500"/>
    </Cube>
  </Cube>
</gesmes:Envelope>`;

describe('Extra Pairs Feature', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should calculate cross-currency rates (SEK/USD)', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    const [result] = await getLatest({
      extraPairs: [{ from: 'SEK', to: 'USD' }],
    });

    expect(result.extraPairs).toBeDefined();
    expect(result.extraPairs).toHaveLength(1);
    expect(result.extraPairs![0].from).toBe('SEK');
    expect(result.extraPairs![0].to).toBe('USD');
    // SEK/USD = 11.3450 / 1.0945 ≈ 10.364
    expect(result.extraPairs![0].rate).toBeCloseTo(10.364, 2);
  });

  it('should calculate multiple cross-currency pairs', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    const [result] = await getLatest({
      extraPairs: [
        { from: 'SEK', to: 'USD' },
        { from: 'NOK', to: 'GBP' },
        { from: 'JPY', to: 'USD' },
      ],
    });

    expect(result.extraPairs).toHaveLength(3);

    // SEK/USD = 11.3450 / 1.0945
    expect(result.extraPairs![0].rate).toBeCloseTo(10.364, 2);

    // NOK/GBP = 11.5230 / 0.8573
    expect(result.extraPairs![1].rate).toBeCloseTo(13.443, 2);

    // JPY/USD = 161.45 / 1.0945
    expect(result.extraPairs![2].rate).toBeCloseTo(147.510, 2);
  });

  it('should work with filtered currencies', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    const [result] = await getLatest({
      currency: ['USD', 'GBP'],
      extraPairs: [{ from: 'SEK', to: 'NOK' }],
    });

    // Rates should be filtered
    expect(Object.keys(result.rates)).toEqual(['USD', 'GBP']);

    // But extra pairs should still work (uses full rates)
    expect(result.extraPairs).toBeDefined();
    expect(result.extraPairs![0].rate).toBeCloseTo(11.3450 / 11.5230, 3);
  });

  it('should throw error if currency not found in extra pairs', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    // Validator catches invalid currencies before transformer runs
    await expect(
      getLatest({
        // @ts-expect-error - testing invalid currency
        extraPairs: [{ from: 'INVALID', to: 'USD' }],
      })
    ).rejects.toThrow('Currency INVALID in extraPairs is not supported');
  });

  it('should work with history data', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-hist-90d.xml')
      .reply(200, historyXml);

    const result = await getHistory({
      extraPairs: [{ from: 'SEK', to: 'USD' }],
    });

    expect(result).toHaveLength(2);

    // First day: SEK/USD = 11.3450 / 1.0945
    expect(result[0].extraPairs![0].rate).toBeCloseTo(10.364, 2);

    // Second day: SEK/USD = 11.3500 / 1.0950
    expect(result[1].extraPairs![0].rate).toBeCloseTo(10.365, 2);
  });
});

describe('Amount Conversion Feature', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should convert EUR amount to other currencies', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    const [result] = await getLatest({
      currency: ['USD', 'GBP'],
      amount: 100,
    });

    expect(result.convertedAmounts).toBeDefined();
    expect(result.convertedAmounts!.USD).toBeCloseTo(109.45, 2); // 100 * 1.0945
    expect(result.convertedAmounts!.GBP).toBeCloseTo(85.73, 2); // 100 * 0.8573
  });

  it('should convert to all currencies when no filter specified', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    const [result] = await getLatest({
      amount: 1000,
    });

    expect(result.convertedAmounts).toBeDefined();
    expect(result.convertedAmounts!.USD).toBeCloseTo(1094.5, 1);
    expect(result.convertedAmounts!.GBP).toBeCloseTo(857.3, 1);
    expect(result.convertedAmounts!.SEK).toBeCloseTo(11345.0, 1);
    expect(result.convertedAmounts!.NOK).toBeCloseTo(11523.0, 1);
    expect(result.convertedAmounts!.JPY).toBeCloseTo(161450.0, 1);
  });

  it('should handle decimal amounts', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    const [result] = await getLatest({
      currency: 'USD',
      amount: 99.99,
    });

    expect(result.convertedAmounts!.USD).toBeCloseTo(109.44, 2);
  });

  it('should work with history data', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-hist-90d.xml')
      .reply(200, historyXml);

    const result = await getHistory({
      currency: 'USD',
      amount: 500,
    });

    expect(result).toHaveLength(2);

    // First day: 500 * 1.0945
    expect(result[0].convertedAmounts!.USD).toBeCloseTo(547.25, 2);

    // Second day: 500 * 1.0950
    expect(result[1].convertedAmounts!.USD).toBeCloseTo(547.5, 2);
  });

  it('should handle zero amount', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    const [result] = await getLatest({
      currency: 'USD',
      amount: 0,
    });

    expect(result.convertedAmounts!.USD).toBe(0);
  });
});

describe('Combined Features', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should support both extraPairs and amount conversion', async () => {
    nock('https://www.ecb.europa.eu')
      .get('/stats/eurofxref/eurofxref-daily.xml')
      .reply(200, validXml);

    const [result] = await getLatest({
      currency: ['USD', 'SEK'],
      extraPairs: [{ from: 'SEK', to: 'USD' }],
      amount: 1000,
    });

    // Should have filtered rates
    expect(Object.keys(result.rates)).toEqual(['USD', 'SEK']);

    // Should have extra pairs
    expect(result.extraPairs).toHaveLength(1);
    expect(result.extraPairs![0].rate).toBeCloseTo(10.364, 2);

    // Should have converted amounts (for filtered currencies)
    expect(result.convertedAmounts!.USD).toBeCloseTo(1094.5, 1);
    expect(result.convertedAmounts!.SEK).toBeCloseTo(11345.0, 1);
  });
});
