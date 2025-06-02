// netlify/functions/searchStocks.js
// const fetch = require('node-fetch'); // Uncomment if you need to use node-fetch explicitly in Netlify

// Helper function for fetch with timeout
async function fetchWithTimeout(resource, options = {}, timeout = 8000) { // 8 seconds timeout
  console.log(`[fetchWithTimeout] Starting fetch for: ${resource} with timeout: ${timeout}ms`);
  const controller = new AbortController();
  const id = setTimeout(() => {
    console.warn(`[fetchWithTimeout] Aborting fetch for ${resource} due to timeout.`);
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`[fetchWithTimeout] Fetch aborted for ${resource}: Timeout`);
      throw new Error(`Request to Yahoo API timed out after ${timeout / 1000} seconds.`);
    }
    console.error(`[fetchWithTimeout] Fetch error for ${resource}:`, error);
    throw error; // Re-throw other errors
  }
}

const DEV_ORIGIN = 'http://localhost:19006'; // Expo web default

exports.handler = async function(event, context) {
  const query = (event.queryStringParameters && event.queryStringParameters.q) || '';
  console.log(`[searchStocks] Invoked. Query: "${query}"`);

  // Define CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? DEV_ORIGIN : '*', // More specific in prod if needed
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Add OPTIONS
  };

  // Handle OPTIONS preflight request for CORS
  if (event.httpMethod === 'OPTIONS') {
    console.log('[searchStocks] Responding to OPTIONS preflight request.');
    return {
      statusCode: 204, // No Content
      headers,
      body: ''
    };
  }

  if (!query || query.trim().length < 1) {
    console.log("[searchStocks] Empty or invalid query. Returning empty array.");
    return {
      statusCode: 200,
      headers, // Use defined headers
      body: JSON.stringify([]),
    };
  }

  const yahooURL = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query.trim())}&quotesCount=5&newsCount=0`;
  console.log(`[searchStocks] Fetching from Yahoo URL: ${yahooURL}`);

  try {
    // Use fetchWithTimeout instead of direct fetch
    const response = await fetchWithTimeout(yahooURL, {}, 7500); // 7.5 seconds timeout for Yahoo API call
    const responseStatus = response.status;
    console.log(`[searchStocks] Yahoo API response status: ${responseStatus}`);

    const responseText = await response.text(); // Get text first for better error details

    if (!response.ok) {
      console.error(`[searchStocks] Yahoo API request failed. Status: ${responseStatus}. Response: ${responseText}`);
      return {
        statusCode: responseStatus, // Forward Yahoo's error status
        headers, // Use defined headers
        body: JSON.stringify({ 
          error: 'Failed to fetch from Yahoo API.', 
          details: responseText 
        }),
      };
    }
    
    console.log("[searchStocks] Yahoo API raw response text (first 300 chars): " + (responseText ? responseText.substring(0,300) : '(empty)'));
    const data = JSON.parse(responseText);
    // console.log("[searchStocks] Yahoo API parsed data: " + JSON.stringify(data, null, 2)); // Can be very verbose

    if (!data || !Array.isArray(data.quotes)) {
      console.warn("[searchStocks] Yahoo API response does not contain 'data.quotes' array. Data: " + JSON.stringify(data));
      return {
        statusCode: 200, // Request to our function was ok, but Yahoo data was not as expected
        headers, // Use defined headers
        body: JSON.stringify([]), // Return empty array if quotes are missing
      };
    }

    const results = data.quotes
      .filter(item => item && item.symbol && item.shortname) // Ensure essential fields exist
      .slice(0, 5) // Limit to 5 suggestions
      .map(item => ({
        id: item.symbol, // Must be unique
        title: `${item.shortname} (${item.symbol})`, // Display text
      }));
    
    console.log("[searchStocks] Formatted results for client: " + JSON.stringify(results, null, 2));

    return {
      statusCode: 200,
      headers, // Use defined headers
      body: JSON.stringify(results),
    };

  } catch (error) {
    const errorMessage = error.message || error.toString();
    console.error("[searchStocks] General error during execution: " + errorMessage);
    // Log the stack trace if available and in a dev environment
    if (error.stack && process.env.NODE_ENV === 'development') {
        console.error("[searchStocks] Stack trace: " + error.stack);
    }
    // Determine if the error is due to our custom timeout
    const isTimeoutError = errorMessage.includes('timed out after');
    return {
      statusCode: isTimeoutError ? 504 : 500, // Gateway Timeout for our timeout, else Internal Server Error
      headers, // Use defined headers
      body: JSON.stringify({ 
        error: isTimeoutError ? 'Yahoo API request timed out.' : 'Internal server error processing stock search.', 
        details: errorMessage 
      }),
    };
  }
};