// Updated to use Next.js API endpoints
// Change this to your production Next.js URL when deploying
const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api'
  : 'https://your-nextjs-app.vercel.app/api';

export async function analyzeStock(ticker) {
  const res = await fetch(`${API_BASE}/analyze?ticker=${ticker}`);
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}

export async function searchStocks(query) {
  const res = await fetch(`${API_BASE}/searchStocks?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getStockDetails(ticker) {
  const res = await fetch(`${API_BASE}/getStockDetails?ticker=${ticker}`);
  if (!res.ok) throw new Error('Failed to get stock details');
  return res.json();
}