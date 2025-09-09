import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:19006' : '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    const ticker = (req.query.ticker as string)?.trim()
    if (!ticker || ticker.length < 1) {
      return res.status(400).json({ error: 'Ticker query parameter is required.' })
    }

    // Using Yahoo Finance v7 for quote details
    const yahooURL = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`
    console.log(`[getStockDetails] Fetching from: ${yahooURL}`)

    const response = await fetch(yahooURL)
    const responseText = await response.text()

    if (!response.ok) {
      console.error(`[getStockDetails] Yahoo API failed. Status: ${response.status}`)
      return res.status(response.status).json({ 
        error: 'Failed to fetch stock details from Yahoo API.', 
        details: responseText 
      })
    }

    const data = JSON.parse(responseText)

    if (!data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
      console.warn(`[getStockDetails] No quote data found for ticker: ${ticker}`)
      return res.status(404).json({ error: `No quote data found for ticker: ${ticker}` })
    }

    const quote = data.quoteResponse.result[0]
    console.log(`[getStockDetails] Successfully fetched data for ${ticker}`)

    // Return the quote data
    return res.status(200).json({
      symbol: quote.symbol,
      shortName: quote.shortName || quote.longName,
      longName: quote.longName,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketChange: quote.regularMarketChange,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      marketCap: quote.marketCap,
      volume: quote.regularMarketVolume,
      averageVolume: quote.averageDailyVolume3Month,
      // Add more fields as needed
    })
  } catch (err) {
    console.error(`[getStockDetails] Error:`, err)
    return res.status(500).json({ error: (err as Error).toString() })
  }
}
