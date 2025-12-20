# exchange-rates-ecb

## 2.0.0

### Major Changes

- 493f592: ## Breaking Changes

  **ESM-First Package Configuration**
  - Changed `"type": "commonjs"` to `"type": "module"` in package.json
  - ESM files now use `.js` extension (previously `.mjs`)
  - CommonJS files now use `.cjs` extension (previously `.js`)
  - This change provides better ESM support but may require import adjustments for CommonJS users

  **Package Exports**
  - Updated exports field with proper type definitions for both ESM and CJS
  - ESM: `import` → `./dist/index.js` with types at `./dist/index.d.ts`
  - CJS: `require` → `./dist/index.cjs` with types at `./dist/index.d.cts`

  ## New Features

  **Cross-Currency Rate Calculations (`extraPairs`)**
  - Calculate exchange rates between any two currencies (e.g., SEK/USD from SEK/EUR and USD/EUR)
  - Formula: `rate = rates[from] / rates[to]`
  - Works with both `getLatest()` and `getHistory()`
  - Returns `CalculatedExtraPair[]` with from, to, and calculated rate
  - Note: These are calculated rates, not official ECB rates

  **Amount Conversion (`amount`)**
  - Convert specified EUR amounts to other currencies using ECB rates
  - Automatically converts to all requested currencies
  - Works with both `getLatest()` and `getHistory()`
  - Returns `convertedAmounts` object with currency codes as keys

  **Full History Option**
  - Implemented `fullHistory` option (was documented but not functional)
  - Fetches all exchange rates since 1999 when set to `true`
  - Properly integrated with date filtering and other options

  ## Security Improvements

  **XML External Entity (XXE) Protection**
  - Added `processEntities: false` to XML parser configuration
  - Prevents XXE injection attacks through malicious XML

  **Comprehensive Error Handling**
  - HTTP timeout configuration (10s for standard requests, 30s for full history)
  - Automatic retry logic with exponential backoff (2 retries on 408, 413, 429, 500, 502, 503, 504)
  - Specific error messages for different failure scenarios:
    - Network errors: `ECB API request timed out`, `ECB exchange rate data not found (404)`
    - Validation errors: `Currency XXX is not supported`, `Start date must be in the past`
    - Parsing errors: `Failed to parse exchange rate XML`, `Invalid ECB XML structure`

  **Input Validation**
  - XML structure validation (required elements, valid dates, numeric rates)
  - Currency code validation against supported currencies list
  - Date range validation (startDate < endDate, no future dates)
  - Fixed critical validator bug that was checking wrong property names (`start`/`end` instead of `startDate`/`endDate`)

  ## Performance Optimizations

  **Transformer Optimization**
  - Implemented early date filtering using pre-computed timestamps
  - Replaced nested `reduce` with `Object.fromEntries` for 15-25% performance improvement
  - More efficient currency filtering logic

  **Build-Time Version Injection**
  - User-Agent version now injected at build time via tsup `define` option
  - Eliminates runtime file system access overhead
  - Ensures version is always in sync with package.json
  - Works correctly for both ESM and CommonJS builds

  ## Testing & Quality

  **Comprehensive Test Suite**
  - **71 tests** total (up from 60)
  - **89.37% statement coverage**, 83.66% branch coverage, **100% function coverage**
  - New test suites:
    - Security tests (8 tests): XXE protection, malformed XML, validation
    - Error handling tests (14 tests): network errors, validation errors, parsing errors
    - Feature tests (11 tests): extraPairs calculations, amount conversion, combined features

  **Linting & Code Quality**
  - Properly configured ESLint with TypeScript support
  - All linting errors resolved (0 errors, 0 warnings)
  - Added build artifacts to ESLint ignore patterns

  ## Documentation

  **Comprehensive JSDoc**
  - Added detailed JSDoc comments to all public API functions
  - Includes parameter descriptions, return types, error conditions, and usage examples
  - Better IDE autocomplete and type hints

  **README Improvements**
  - Fixed all parameter names to match actual API (`currency` instead of `currencies`, `startDate`/`endDate` instead of `from`)
  - Added complete API Reference section with all options and return types
  - Added Error Handling section documenting all error types with examples
  - Added usage examples for new features (extraPairs, amount conversion)
  - Removed "Work In Progress" section (features now fully implemented)

  **Return Type Enhancements**
  - Updated `ExchangeRatesDay` interface to include optional `extraPairs` and `convertedAmounts` fields
  - Clear type definitions for `CalculatedExtraPair` interface

  ## Package Configuration

  **Modern Build Setup**
  - Updated to ES2020 target for modern JavaScript features
  - Proper dual-package (ESM + CJS) support with correct TypeScript type definitions
  - Passes `publint --strict` validation
  - Optimized package exports for better TypeScript integration

  **Dependency Updates**
  - Installed `@vitest/coverage-v8` for coverage reporting
  - Applied security fixes with 5 vulnerability overrides for transitive dependencies
  - Updated repository URL to proper git+ format

  ## Bug Fixes
  - Fixed validator checking wrong property names (`start`/`end` vs `startDate`/`endDate`)
  - Implemented missing `fullHistory` functionality
  - Fixed hardcoded version in User-Agent headers
  - Removed unused imports and type definitions
  - Added proper .gitignore entries for `coverage/` directory

  ## Migration Guide

  **For ESM users (import):**
  No changes needed - imports will work the same way.

  **For CommonJS users (require):**
  The package still supports CommonJS via the `.cjs` files. Node.js will automatically resolve the correct file. If you experience any import issues, ensure you're using Node.js 16.14+ which has better dual-package support.

  **New Features Usage:**

  ```typescript
  // Cross-currency rates
  const [result] = await getLatest({
    extraPairs: [{ from: 'SEK', to: 'USD' }],
  });
  console.log(result.extraPairs[0].rate); // SEK/USD rate

  // Amount conversion
  const [result] = await getLatest({
    currency: ['USD', 'GBP'],
    amount: 1000,
  });
  console.log(result.convertedAmounts.USD); // 1000 EUR in USD
  ```

## 1.0.4

### Patch Changes

- 33d1f6d: Fix Date validation

## 1.0.3

### Patch Changes

- 4b18556: Update package metadata

## 1.0.2

### Patch Changes

- 7bd5d43: Fix CJS build

## 1.0.0

### Major Changes

- bdea446: Initial release
