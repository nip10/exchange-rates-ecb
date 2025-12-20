# Exchange Rates by ECB

[![npm version](https://badge.fury.io/js/exchange-rates-ecb.svg)](https://badge.fury.io/js/exchange-rates-ecb)

Retrieve Euro foreign exchange reference rates from the [European Central Bank](http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html).

This module is intended to run on the server via Node.js, not in the browser.

The **current** currency list is available [here](http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html). Note that historic data may contain currencies that are no longer available. For the full list of currencies check [this](https://github.com/nip10/exchange-rates-ecb/blob/main/lib/types.ts#L1).

Supports ESM and CommonJS (require/import).

## Installation

```shell
$ yarn add exchange-rate-ecb
```

```shell
$ npm install exchange-rate-ecb
```

```shell
$ pnpm install exchange-rate-ecb
```

## Usage

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const [{ date, rates }] = await exchangeRates.getLatest();

console.log(`Date: ${date}`);
console.log(`Rates: ${rates}`);
```

Note: Use the `date` property to determine when the rates were last updated.

### Fetch specific currencies

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const [{ date, rates }] = await exchangeRates.getLatest({
  currency: ['USD', 'JPY'],
});

console.log(`USD: ${rates.USD}`);
console.log(`JPY: ${rates.JPY}`);
```

### Fetch historic rates

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const data = await exchangeRates.getHistory();

console.log(`USD: ${data[0].rates.USD}`);
```

Note: This will fetch the latest 90 days of rates by default.

### Fetch historic rates for a specific date range

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const data = await exchangeRates.getHistory({
  startDate: new Date('2023-01-01'),
  endDate: new Date('2023-01-31'),
  currency: ['USD'],
});

console.log(`USD: ${data[0].rates.USD}`);
```

### Calculate cross-currency rates

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const [{ date, rates, extraPairs }] = await exchangeRates.getLatest({
  extraPairs: [
    { from: 'SEK', to: 'USD' },
    { from: 'NOK', to: 'GBP' },
  ],
});

console.log(`SEK/USD: ${extraPairs[0].rate}`);
console.log(`NOK/GBP: ${extraPairs[1].rate}`);
```

Note: Cross-currency rates are calculated using the formula `rate = rates[from] / rates[to]`. These are calculated rates, not official ECB rates.

### Convert EUR amounts to other currencies

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const [{ date, rates, convertedAmounts }] = await exchangeRates.getLatest({
  currency: ['USD', 'GBP', 'JPY'],
  amount: 1000,
});

console.log(`1000 EUR = ${convertedAmounts.USD} USD`);
console.log(`1000 EUR = ${convertedAmounts.GBP} GBP`);
console.log(`1000 EUR = ${convertedAmounts.JPY} JPY`);
```

## API Reference

### `getLatest(options?)`

Fetches the latest exchange rates from the European Central Bank.

**Options:**
- `currency?: string | string[]` - Single currency code or array of codes to filter results (e.g., 'USD' or ['USD', 'GBP'])
- `extraPairs?: Array<{ from: string, to: string }>` - Calculate cross-currency rates (e.g., SEK/USD from SEK/EUR and USD/EUR)
- `amount?: number` - Amount in EUR to convert to other currencies

**Returns:** `Promise<ExchangeRatesDay[]>` - Array with single day of exchange rates

Each `ExchangeRatesDay` contains:
- `date: Date` - The date for these rates
- `rates: Record<string, number>` - Exchange rates for currencies
- `extraPairs?: Array<{ from: string, to: string, rate: number }>` - Calculated cross-currency rates (if requested)
- `convertedAmounts?: Record<string, number>` - Converted amounts (if requested)

**Throws:**
- Error if currency is not supported
- Error if network request fails or times out
- Error if XML parsing fails
- Error if currency in extraPairs is not found

**Example:**
```typescript
const [{ date, rates }] = await exchangeRates.getLatest({ currency: 'USD' });

// With all features
const [result] = await exchangeRates.getLatest({
  currency: ['USD', 'GBP'],
  extraPairs: [{ from: 'SEK', to: 'USD' }],
  amount: 1000
});
console.log(result.extraPairs[0].rate); // SEK/USD rate
console.log(result.convertedAmounts.USD); // 1000 EUR in USD
```

### `getHistory(options?)`

Fetches historical exchange rates from the European Central Bank.

**Options:**
- `currency?: string | string[]` - Single currency code or array of codes to filter results
- `startDate?: Date` - Earliest date to include (default: 90 days ago)
- `endDate?: Date` - Latest date to include (default: today)
- `fullHistory?: boolean` - If true, fetches all rates since 1999 (~7MB, may take 1-2 seconds)
- `extraPairs?: Array<{ from: string, to: string }>` - Calculate cross-currency rates
- `amount?: number` - Amount in EUR to convert to other currencies

**Returns:** `Promise<ExchangeRatesDay[]>` - Array of exchange rates, one entry per day

**Throws:**
- Error if startDate is after endDate
- Error if startDate is in the future
- Error if currency is not supported
- Error if network request fails or times out
- Error if XML parsing fails
- Error if currency in extraPairs is not found

**Example:**
```typescript
const history = await exchangeRates.getHistory({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  currency: ['USD', 'GBP'],
  extraPairs: [{ from: 'SEK', to: 'NOK' }],
  amount: 500
});

// Each day has rates, extraPairs, and convertedAmounts
history.forEach(day => {
  console.log(`${day.date}: USD=${day.rates.USD}`);
  console.log(`SEK/NOK: ${day.extraPairs[0].rate}`);
  console.log(`500 EUR = ${day.convertedAmounts.USD} USD`);
});
```

## Error Handling

The library throws descriptive errors for common scenarios:

**Network Errors:**
- `ECB exchange rate data not found (404)` - API endpoint not found
- `ECB API server error (500/503)` - ECB server errors
- `Failed to fetch latest exchange rates` - Network connection errors

**Validation Errors:**
- `Currency XXX is not supported` - Invalid or unsupported currency code
- `Start date must be in the past` - Future date provided as startDate
- `Start date must be before end date` - Invalid date range

**Parsing Errors:**
- `Failed to parse exchange rate XML` - Malformed XML from ECB
- `Invalid ECB XML structure` - Missing required XML elements
- `Invalid date in ECB data` - Invalid date format in XML

**Example:**
```typescript
try {
  const data = await exchangeRates.getLatest({ currency: 'INVALID' });
} catch (error) {
  console.error(error.message); // "Currency INVALID is not supported"
}
```

## FAQ

### Why are the rates not updated to the latest values ?

The ECB updates the rates daily around 16:00 CET, except on TARGET closing days.

From the [ECB website](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html):

> The reference rates are usually updated at around 16:00 CET every working day, except on TARGET closing days.
> They are based on a regular daily concertation procedure between central banks across Europe, which normally takes place at 14:15 CET.

### Why do I only get 90 days of data ?

Set the `fullHistory` option to `true` to get the full history of rates.
:warning: This returns **a lot of data** (daily rates since 1999).

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const data = await exchangeRates.getHistory({
  fullHistory: true,
});
```
