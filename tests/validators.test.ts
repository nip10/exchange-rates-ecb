import {
  validateDates,
  validateCurrency,
  validateExtraPairs,
  validateAmount,
} from '../lib/validators';
import { expect, describe, it } from 'vitest';

describe('validateDates', () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  it('should work with dates', () => {
    expect(() => validateDates(yesterday, today)).not.toThrow();
    expect(() => validateDates(today, today)).not.toThrow();
  });

  it('should not throw if start is not provided', () => {
    expect(() => validateDates(undefined, today)).not.toThrow();
  });

  it('should not throw if end is not provided', () => {
    expect(() => validateDates(today, undefined)).not.toThrow();
  });

  it('should not throw if no dates are provided', () => {
    expect(() => validateDates(undefined, undefined)).not.toThrow();
  });

  it('should throw if dates are invalid', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates('foo', today)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(123, today)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(Number.NaN, today)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => validateDates(() => {}, today)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates([123], today)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(false, today)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(null, today)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(today, '')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(today, 123)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(today, Number.NaN)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => validateDates(today, () => {})).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(today, [123])).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(today, false)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateDates(today, null)).toThrow();
  });

  it('should throw if end date is before start date', () => {
    // Also tests for start date after end date
    expect(() => validateDates(today, yesterday)).toThrow();
  });

  it('should throw if start date is in the future', () => {
    expect(() => validateDates(tomorrow, today)).toThrow();
  });
});

describe('validateCurrency', () => {
  it('should work with supported currency', () => {
    expect(() => validateCurrency('USD')).not.toThrow();
  });

  it('should work with supported currencies', () => {
    expect(() => validateCurrency(['USD', 'GBP'])).not.toThrow();
  });

  it("should throw if currency isn't supported", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateCurrency('EUR')).toThrow();
  });

  it("should throw if currencies aren't supported", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateCurrency(['USD', 'EUR'])).toThrow();
  });
});

describe('validateExtraPairs', () => {
  it('should work with supported currency pair', () => {
    expect(() =>
      validateExtraPairs([{ from: 'USD', to: 'GBP' }])
    ).not.toThrow();
  });

  it('should work with supported currency pairs', () => {
    expect(() =>
      validateExtraPairs([
        { from: 'USD', to: 'GBP' },
        { from: 'AUD', to: 'CAD' },
      ])
    ).not.toThrow();
  });

  it('should not throw if extra pairs is undefined', () => {
    expect(() => validateExtraPairs(undefined)).not.toThrow();
  });

  it("should throw if currency pair isn't supported", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateExtraPairs([{ from: 'EUR', to: 'GBP' }])).toThrow();
  });

  it("should throw if currency pairs aren't supported", () => {
    expect(() =>
      validateExtraPairs([
        { from: 'USD', to: 'GBP' },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error - should throw
        { from: 'USD', to: 'EUR' },
      ])
    ).toThrow();
  });
});

describe('validateAmount', () => {
  it('should work with valid amount', () => {
    expect(() => validateAmount(1.5)).not.toThrow();
    expect(() => validateAmount(0)).not.toThrow();
    expect(() => validateAmount(-1)).not.toThrow();
  });

  it('should not throw if amount is undefined', () => {
    expect(() => validateAmount(undefined)).not.toThrow();
  });

  it('should throw if amount is not a number', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateAmount('Foo')).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateAmount(true)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateAmount(null)).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateAmount({})).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    expect(() => validateAmount([])).toThrow();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - should throw
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => validateAmount(() => {})).toThrow();
  });
});
