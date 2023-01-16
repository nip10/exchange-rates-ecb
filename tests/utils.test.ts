import { isValidDate } from '../lib/utils';
import { describe, it, expect } from 'vitest';

describe('isValidDate', () => {
  const today = new Date();

  it('should return true if the date is valid', () => {
    expect(isValidDate(today)).toBe(true);
  });

  it('should return false if the date is invalid', () => {
    expect(isValidDate('today')).toBe(false);
    expect(isValidDate(123)).toBe(false);
    expect(isValidDate({})).toBe(false);
    expect(isValidDate([])).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(isValidDate(() => {})).toBe(false);
    expect(isValidDate(new Date('INVALID_DATE'))).toBe(false);
    expect(isValidDate(Number.NaN)).toBe(false);
  });
});
