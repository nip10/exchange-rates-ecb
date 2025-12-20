import got from 'got';

export const fetchLatest = async (): Promise<string> => {
  try {
    const response = await got(
      'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
      {
        timeout: {
          request: 10000, // 10 second timeout
        },
        retry: {
          limit: 2,
          methods: ['GET'],
          statusCodes: [408, 413, 429, 500, 502, 503, 504],
        },
        headers: {
          'User-Agent': 'exchange-rates-ecb/1.0.4',
        },
      }
    ).text();
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if ('name' in error && error.name === 'TimeoutError') {
        throw new Error('ECB API request timed out after 10 seconds');
      }
      if ('response' in error && typeof error.response === 'object' && error.response !== null) {
        const response = error.response as { statusCode?: number };
        if (response.statusCode === 404) {
          throw new Error('ECB exchange rate data not found (404)');
        }
        if (response.statusCode && response.statusCode >= 500) {
          throw new Error(`ECB API server error (${response.statusCode})`);
        }
      }
      throw new Error(`Failed to fetch latest exchange rates from ECB: ${error.message}`);
    }
    throw new Error('Failed to fetch latest exchange rates from ECB: Unknown error');
  }
};

export const fetchHistory = async (): Promise<string> => {
  try {
    const response = await got(
      'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml',
      {
        timeout: {
          request: 10000,
        },
        retry: {
          limit: 2,
          methods: ['GET'],
          statusCodes: [408, 413, 429, 500, 502, 503, 504],
        },
        headers: {
          'User-Agent': 'exchange-rates-ecb/1.0.4',
        },
      }
    ).text();
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if ('name' in error && error.name === 'TimeoutError') {
        throw new Error('ECB API request timed out after 10 seconds');
      }
      if ('response' in error && typeof error.response === 'object' && error.response !== null) {
        const response = error.response as { statusCode?: number };
        if (response.statusCode === 404) {
          throw new Error('ECB historical exchange rate data not found (404)');
        }
        if (response.statusCode && response.statusCode >= 500) {
          throw new Error(`ECB API server error (${response.statusCode})`);
        }
      }
      throw new Error(`Failed to fetch historical exchange rates from ECB: ${error.message}`);
    }
    throw new Error('Failed to fetch historical exchange rates from ECB: Unknown error');
  }
};

export const fetchAll = async (): Promise<string> => {
  try {
    const response = await got(
      'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml',
      {
        timeout: {
          request: 30000, // 30 seconds for large file
        },
        retry: {
          limit: 2,
          methods: ['GET'],
          statusCodes: [408, 413, 429, 500, 502, 503, 504],
        },
        headers: {
          'User-Agent': 'exchange-rates-ecb/1.0.4',
        },
      }
    ).text();
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if ('name' in error && error.name === 'TimeoutError') {
        throw new Error('ECB API request timed out (full history is ~7MB)');
      }
      if ('response' in error && typeof error.response === 'object' && error.response !== null) {
        const response = error.response as { statusCode?: number };
        if (response.statusCode === 404) {
          throw new Error('ECB full history exchange rate data not found (404)');
        }
        if (response.statusCode && response.statusCode >= 500) {
          throw new Error(`ECB API server error (${response.statusCode})`);
        }
      }
      throw new Error(`Failed to fetch full history exchange rates from ECB: ${error.message}`);
    }
    throw new Error('Failed to fetch full history exchange rates from ECB: Unknown error');
  }
};
