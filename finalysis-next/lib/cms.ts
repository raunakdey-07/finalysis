import axios from 'axios'

const CMS_URL = process.env.CMS_API_URL || ''
const CMS_TOKEN = process.env.CMS_API_TOKEN || ''

export async function getScoreExplanations(): Promise<Record<string, string>> {
  // Default explanations
  const defaultExplanations = {
    altmanZScore: 'The Altman Z-Score is a financial formula used to predict bankruptcy risk. Scores above 2.99 indicate financial stability, while scores below 1.81 suggest potential distress.',
    piotroskiFScore: 'The Piotroski F-Score evaluates a company\'s financial strength based on 9 criteria. Scores range from 0-9, with higher scores indicating stronger fundamentals.',
    beneishMScore: 'The Beneish M-Score detects potential earnings manipulation. Scores above -2.22 may indicate a higher probability of earnings management.',
    ohlsonOScore: 'The Ohlson O-Score estimates bankruptcy probability using financial ratios. Lower scores indicate better financial health and lower bankruptcy risk.'
  }

  if (!CMS_URL) {
    return defaultExplanations
  }

  try {
    const resp = await axios.get(`${CMS_URL}/api/financial-scores`, {
      headers: CMS_TOKEN ? { Authorization: `Bearer ${CMS_TOKEN}` } : undefined,
    })
    const items = resp.data.data || []
    return items.reduce((acc: Record<string, string>, item: any) => {
      const id = item.attributes?.scoreId
      const desc = item.attributes?.description || ''
      if (id) acc[id] = desc
      return acc
    }, {})
  } catch (err) {
    console.error('cms fetch error', err)
    return defaultExplanations
  }
}
