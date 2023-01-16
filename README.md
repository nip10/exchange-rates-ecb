# Exchange Rates by ECB

Retrieve Euro foreign exchange reference rates from the [European Central Bank](http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html).

This module is intended to run on the server via Node.js, not in the browser.

The **current** currency list is available [here](http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html). Note that historic data may contain currencies that are no longer available. For the full list of currencies check [this](https://github.com/nip10/exchange-rates-ecb/blob/main/lib/types.ts#L1).

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

const { date, rates } = await exchangeRates.getLatest();

console.log(`Date: ${date}`);
console.log(`Rates: ${rates}`);
```

Note: Use the `date` property to determine when the rates were last updated.

### Fetch specific currencies

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const { date, rates } = await exchangeRates.getLatest({
  currencies: ['USD', 'JPY'],
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

### Fetch historic rates for a specific currency

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const data = await exchangeRates.getHistory({
  from: new Date('2023-01-01'),
  currencies: ['USD'],
});

console.log(`USD: ${data[0].rates.USD}`);
```

### Calculate extra pairs (WIP)

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const { date, rates, extraPairs } = await exchangeRates.getLatest({
  extraPairs: [
    {
      from: 'SEK',
      to: 'USD',
    },
  ],
});

console.log(`ExtraPairs - From: ${extraPairs[0].from} - To: ${extraPairs[0].to} - Rate: ${extraPairs[0].rate`);
```

Note: The extra pairs are calculated from the available rates based on the formula `rate = rate(from) / rate(to)`. These are not official rates.

### Convert amount to other currencies (WIP)

```typescript
import * as exchangeRates from 'exchange-rate-ecb';

const { date, rates, amount } = await exchangeRates.getLatest({
  currencies: ['USD', 'JPY'],
  amount: 1000,
});

console.log(`Amount in USD: ${ammount.usd}`);
console.log(`Amount in JPY: ${amount.jpy}`);
```

Note: Default currency is EUR. If you want to convert to other currency, you need to specify the `amount` and `amountCurrency` options.

## API

// TODO

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

const data = await exchangeRates.getHistoy({
  fullHistory: true,
});
```
