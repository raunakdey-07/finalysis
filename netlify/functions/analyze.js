const yahoo = require('yahoo-finance2').default;
const { calcAltman, calcPiotroski, calcBeneish, calcOhlson } = require('./scores');

exports.handler = async ({ queryStringParameters }) => {
  try {
    const ticker = queryStringParameters.ticker.toUpperCase();

    // Fetch 1-year history & quote
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        price: { current, high52, low52, percent },
        scores: { z, f, m, o }
      })
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};