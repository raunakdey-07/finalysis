const API = '/.netlify/functions/analyze';

export async function analyzeStock(ticker) {
  const res = await fetch(`${API}?ticker=${ticker}`);
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}