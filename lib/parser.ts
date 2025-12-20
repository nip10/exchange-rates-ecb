import { type X2jOptions, XMLParser } from 'fast-xml-parser';
import type {
  EcbXmlExchangeRatesDay,
  ExchangeRatesDay,
  SupportedCurrency,
} from './types';

const parse = (xml: string) => {
  try {
    const options: Partial<X2jOptions> = {
      ignoreAttributes: false,
      processEntities: false, // Prevent XXE attacks
      allowBooleanAttributes: false,
    };
    const parser = new XMLParser(options);
    const parsedData = parser.parse(xml);

    // Validate XML structure
    if (!parsedData?.['gesmes:Envelope']?.['Cube']?.['Cube']) {
      throw new Error('Invalid ECB XML structure: missing required elements');
    }

    const dayData = parsedData['gesmes:Envelope']['Cube']['Cube'] as
      | EcbXmlExchangeRatesDay // daily
      | EcbXmlExchangeRatesDay[]; // historical
    const dayDataArr = Array.isArray(dayData) ? dayData : [dayData];

    const result = dayDataArr.map((day) => {
      const date = new Date(day['@_time']);

      // Validate date
      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date in ECB data: ${day['@_time']}`);
      }

      const entries = day['Cube'];

      if (!Array.isArray(entries)) {
        throw new Error('Invalid ECB XML structure: Cube entries must be an array');
      }

      return {
        date,
        rates: entries.reduce((acc, current) => {
          const currency = current['@_currency'] as SupportedCurrency;
          const rateString = current['@_rate'];
          const rate = Number.parseFloat(rateString);

          // Validate rate is a valid number
          if (Number.isNaN(rate)) {
            throw new Error(`Invalid rate for ${currency}: ${rateString}`);
          }

          acc[currency] = rate;
          return acc;
        }, {} as ExchangeRatesDay['rates']),
      };
    });

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse exchange rate XML: ${error.message}`);
    }
    throw new Error('Failed to parse exchange rate XML: Unknown error');
  }
};

export default parse;
