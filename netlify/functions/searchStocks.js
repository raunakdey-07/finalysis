exports.handler = async function(event, context) {
  const query = (event.queryStringParameters && event.queryStringParameters.q) || '';
  if (!query || query.length < 1) {
    return {
      statusCode: 200,
      body: JSON.stringify([])
    };
  }

  try {
    // Fetch data from Yahoo Finance API
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=3&newsCount=0`;
    const response = await fetch(url);
    const data = await response.json();

    // Format results for your frontend autocomplete
    const results = (data.quotes || [])
      .filter(item => item.symbol && item.shortname)
      .slice(0, 3) // Just in case
      .map(item => ({
        id: item.symbol,
        title: `${item.shortname} (${item.symbol})`
      }));

    return {
      statusCode: 200,
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch suggestions.' })
    };
  }
};