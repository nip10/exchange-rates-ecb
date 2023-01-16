import got from 'got';

export const fetchLatest = async (): Promise<string> => {
  const response = await got(
    'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'
  ).text();
  return response;
};

export const fetchHistory = async (): Promise<string> => {
  const response = await got(
    'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml'
  ).text();
  return response;
};

export const fetchAll = async (): Promise<string> => {
  const response = await got(
    'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml'
  ).text();
  return response;
};
