import type { NextApiRequest, NextApiResponse } from 'next'

// Helper function for fetch with timeout
async function fetchWithTimeout(resource: string, options: RequestInit = {}, timeout = 8000) {
  console.log(`[fetchWithTimeout] Starting fetch for: ${resource} with timeout: ${timeout}ms`)
  const controller = new AbortController()
  const id = setTimeout(() => {
    console.warn(`[fetchWithTimeout] Aborting fetch for ${resource} due to timeout.`)
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[fetchWithTimeout] Fetch aborted for ${resource}: Timeout`)
      throw new Error(`Request to Yahoo API timed out after ${timeout / 1000} seconds.`)
    }
    console.error(`[fetchWithTimeout] Fetch error for ${resource}:`, error)
    throw error
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:19006' : '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    const query = (req.query.q as string)?.trim() || ''
    console.log(`[searchStocks] Query: "${query}"`)

    if (!query || query.length < 1) {
      console.log("[searchStocks] Empty query. Returning empty array.")
      return res.status(200).json([])
    }

    const yahooURL = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`
    console.log(`[searchStocks] Fetching from: ${yahooURL}`)

    const response = await fetchWithTimeout(yahooURL, {}, 7500)
    const responseText = await response.text()

    if (!response.ok) {
      console.error(`[searchStocks] Yahoo API failed. Status: ${response.status}`)
      return res.status(response.status).json({ 
        error: 'Failed to fetch from Yahoo API.', 
        details: responseText 
      })
    }
    
    console.log("[searchStocks] Yahoo API response (first 300 chars):", responseText.substring(0, 300))
    const data = JSON.parse(responseText)

    if (!data || !Array.isArray(data.quotes)) {
      console.warn("[searchStocks] No quotes array in response")
      return res.status(200).json([])
    }

    const results = data.quotes
      .filter((item: any) => item && item.symbol && item.shortname)
      .slice(0, 5)
      .map((item: any) => ({
        id: item.symbol,
        title: `${item.shortname} (${item.symbol})`,
      }))
    
    console.log("[searchStocks] Results:", results)
    return res.status(200).json(results)

  } catch (error) {
    const errorMessage = (error as Error).message || (error as Error).toString()
    console.error("[searchStocks] Error:", errorMessage)
    
    const isTimeoutError = errorMessage.includes('timed out after')
    return res.status(isTimeoutError ? 504 : 500).json({ 
      error: isTimeoutError ? 'Yahoo API request timed out.' : 'Internal server error processing stock search.', 
      details: errorMessage 
    })
  }
}
