/**
 * Validates that a value is a valid Date object with a valid date value.
 *
 * Checks for:
 * - Correct type (Date object, not string/number)
 * - Valid date value (not NaN)
 * - Non-null date (handles NULL date objects)
 *
 * @param date - Value to check
 * @returns `true` if valid Date object with valid value, `false` otherwise
 *
 * @example
 * ```typescript
 * isValidDate(new Date());          // true
 * isValidDate(new Date('invalid')); // false
 * isValidDate('2024-01-01');        // false (string, not Date)
 * isValidDate(null);                // false
 * isValidDate(new Date(NaN));       // false
 * ```
 */
export const isValidDate = (date: unknown): date is Date => {
  return (
    Object.prototype.toString.call(date) === '[object Date]' &&
    !Number.isNaN(date as Date) &&
    // handle NULL date objects
    !Number.isNaN((date as Date).valueOf())
  );
};
