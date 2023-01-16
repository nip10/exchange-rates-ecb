import { type X2jOptions, XMLParser } from 'fast-xml-parser';
import type {
  EcbXmlExchangeRatesDay,
  ExchangeRatesDay,
  SupportedCurrency,
} from './types';

const parse = (xml: string) => {
  const options: Partial<X2jOptions> = {
    ignoreAttributes: false,
  };
  const parser = new XMLParser(options);
  const parsedData = parser.parse(xml);
  const dayData = parsedData['gesmes:Envelope']['Cube']['Cube'] as
    | EcbXmlExchangeRatesDay // daily
    | EcbXmlExchangeRatesDay[]; // historical
  const dayDataArr = Array.isArray(dayData) ? dayData : [dayData];
  const result = dayDataArr.map((day) => {
    const date = new Date(day['@_time']);
    const entries = day['Cube'];
    return {
      date,
      rates: entries.reduce((acc, current) => {
        const currency = current['@_currency'] as SupportedCurrency;
        const rateString = current['@_rate'];
        const rate = Number.parseFloat(rateString);
        acc[currency] = rate;
        return acc;
      }, {} as ExchangeRatesDay['rates']),
    };
  });

  return result;
};

export default parse;
