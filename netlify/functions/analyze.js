const yahoo = require('yahoo-finance2').default;
const { calcAltman, calcPiotroski, calcBeneish, calcOhlson } = require('./scores');

const DEV_ORIGIN = 'http://localhost:19006'; // Expo web default

exports.handler = async ({ queryStringParameters, httpMethod }) => { // Added httpMethod
  // Define CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? DEV_ORIGIN : '*', // More specific in prod if needed
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Add OPTIONS
  };

  // Handle OPTIONS preflight request for CORS
  if (httpMethod === 'OPTIONS') {
    console.log('[analyze] Responding to OPTIONS preflight request.');
    return {
      statusCode: 204, // No Content
      headers,
      body: ''
    };
  }

  try {
    const ticker = queryStringParameters.ticker.toUpperCase();
    console.log(`[analyze] Invoked for ticker: ${ticker}`);

    // Fetch 1-year history & quote
    // Consider adding fetchWithTimeout here as well if these calls can be slow
    const history = await yahoo.historical(ticker, { period1: '1y', interval: '1d' });
    const quote   = await yahoo.quote(ticker);

    const highs = history.map(d => d.high), lows = history.map(d => d.low);
    const high52 = Math.max(...highs), low52 = Math.min(...lows);
    const current = quote.regularMarketPrice;
    const percent = ((current - low52) / (high52 - low52)) * 100;

    // Fetch financials
    const modules = await yahoo.allModules(ticker);

    // Compute scores
    const z = calcAltman(modules, quote.marketCap);
    const f = calcPiotroski(modules);
    const m = calcBeneish(modules);
    const o = calcOhlson(modules);

    console.log(`[analyze] Successfully processed data for ${ticker}`);

    return {
      statusCode: 200,
      headers, // Use defined headers
      body: JSON.stringify({
        price: { current, high52, low52, percent },
        scores: { z, f, m, o }
      })
    };
  } catch (err) {
    console.error(`[analyze] Error processing ticker: ${queryStringParameters.ticker}. Error: ${err.toString()}`, err.stack);
    return { 
      statusCode: 500, 
      headers, // Use defined headers
      body: JSON.stringify({ error: err.toString() }) 
    };
  }
};