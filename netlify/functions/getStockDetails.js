// netlify/functions/getStockDetails.js
// const fetch = require('node-fetch'); // Uncomment for Netlify deployment if global fetch isn't available

exports.handler = async function(event, context) {
  const ticker = (event.queryStringParameters && event.queryStringParameters.ticker) || '';
  console.log(`[getStockDetails] Invoked. Ticker: "${ticker}"`);

  if (!ticker || ticker.trim().length < 1) {
    console.log("[getStockDetails] Empty or invalid ticker. Returning error.");
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Ticker query parameter is required.' }),
    };
  }

  // Using Yahoo Finance v7 for more comprehensive quote details
  // For more specific modules, you can append them to the URL, e.g., &modules=price,summaryDetail,defaultKeyStatistics
  const yahooURL = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker.trim())}`;
  console.log(`[getStockDetails] Fetching from Yahoo URL: ${yahooURL}`);

  try {
    const response = await fetch(yahooURL);
    const responseStatus = response.status;
    console.log(`[getStockDetails] Yahoo API response status: ${responseStatus}`);
    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[getStockDetails] Yahoo API request failed. Status: ${responseStatus}. Response: ${responseText}`);
      return {
        statusCode: responseStatus,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to fetch stock details from Yahoo API.', details: responseText }),
      };
    }
    
    console.log("[getStockDetails] Yahoo API raw response text (first 500 chars): " + (responseText ? responseText.substring(0,500) : '(empty)'));
    const data = JSON.parse(responseText);

    if (!data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
      console.warn("[getStockDetails] Yahoo API response does not contain expected quote data. Data: " + JSON.stringify(data));
      return {
        statusCode: 404, // Not Found, as the ticker might be invalid or data unavailable
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `No quote data found for ticker: ${ticker}` }),
      };
    }

    const quote = data.quoteResponse.result[0]; // Assuming the first result is the one we want

    // Mapping to a more consistent structure for the frontend
    const stockDetails = {
      symbol: quote.symbol,
      shortName: quote.shortName || quote.longName, // Prefer shortName
      longName: quote.longName,
      currentPrice: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      marketCap: quote.marketCap,
      volume: quote.regularMarketVolume,
      open: quote.regularMarketOpen,
      exchangeName: quote.fullExchangeName || quote.exchange,
      currency: quote.currency,
      marketState: quote.marketState,
      // Add more fields as needed from the 'quote' object
      // e.g., quote.ask, quote.bid, quote.averageDailyVolume3Month, etc.
    };
    
    console.log("[getStockDetails] Formatted stock details for client: " + JSON.stringify(stockDetails, null, 2));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockDetails),
    };

  } catch (error) {
    const errorMessage = error.message || error.toString();
    console.error("[getStockDetails] General error during execution: " + errorMessage, error.stack);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error processing stock details.', details: errorMessage }),
    };
  }
};
