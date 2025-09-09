import { GetServerSideProps } from 'next'
import { Container, Heading, SimpleGrid, Alert, Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ScoreCard from '../../components/report/ScoreCard'
import PriceCard from '../../components/report/PriceCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { calcAltman, calcPiotroski, calcBeneish, calcOhlson, ScoreResult } from '../../lib/scoring'
import { getStockFinancials, getStockQuote, getStockHistory } from '../../lib/yahooFinance'
import { getScoreExplanations } from '../../lib/cms'

type Props = {
  ticker: string
  scores: { 
    z: ScoreResult
    f: ScoreResult  
    m: ScoreResult
    o: ScoreResult
  }
  explanations: Record<string, string>
  price?: {
    current: number | null
    change?: number | null
    changePercent?: number | null
    high52?: number | null
    low52?: number | null
    lastUpdated?: string | null
    companyName?: string
    currency?: string
  }
  error?: string
}

export default function ReportPage({ ticker, scores, explanations, price, error }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = (url: string) => {
      console.log('Report: Route change start:', url)
      // Only show loading spinner when navigating to another report page
      if (url.startsWith('/report/')) {
        console.log('Report: Setting loading to true')
        setIsLoading(true)
      } else {
        // If navigating away from report page, don't show loading
        console.log('Report: Navigating away, no loading')
        setIsLoading(false)
      }
    }
    const handleComplete = () => {
      console.log('Report: Route change complete')
      setIsLoading(false)
    }
    const handleError = () => {
      console.log('Report: Route change error')
      setIsLoading(false)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleError)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleError)
    }
  }, [router])

  if (isLoading) {
    console.log('Showing loading spinner for:', router.query.ticker || 'stock')
    return <LoadingSpinner message={`Analyzing ${router.query.ticker || 'stock'}...`} />
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <Box bg="red.50" color="red.800" p={4} borderRadius="md" border="1px solid" borderColor="red.200">
          {error}
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>Financial Analysis for {ticker.toUpperCase()}</Heading>

      {/* Top: price card + two primary scores */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
        <PriceCard
          ticker={ticker.toUpperCase()}
          company={price?.companyName || ''}
          price={price?.current || 0}
          change={price?.change || null}
          changePercent={price?.changePercent || null}
          lastUpdated={price?.lastUpdated || null}
        />

        <ScoreCard data={{
          title: 'Altman Z-Score',
          overallScore: scores.z.score,
          scoreType: 'altman',
          scores: { 'z-score': scores.z.score },
          summary: scores.z.interpretation,
          explanation: explanations.altmanZScore
        }} />
        <ScoreCard data={{
          title: 'Piotroski F-Score',
          overallScore: scores.f.score,
          scoreType: 'piotroski',
          scores: { 'f-score': scores.f.score },
          summary: scores.f.interpretation,
          explanation: explanations.piotroskiFScore
        }} />
      </SimpleGrid>

      {/* Secondary scores */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mt={8}>
        <ScoreCard data={{
          title: 'Beneish M-Score',
          overallScore: scores.m.score,
          scoreType: 'beneish',
          scores: { 'm-score': scores.m.score },
          summary: scores.m.interpretation,
          explanation: explanations.beneishMScore
        }} />
        <ScoreCard data={{
          title: 'Ohlson O-Score',
          overallScore: scores.o.score,
          scoreType: 'ohlson',
          scores: { 'o-score': scores.o.score },
          summary: scores.o.interpretation,
          explanation: explanations.ohlsonOScore
        }} />
      </SimpleGrid>
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ticker = context.params?.ticker as string
  if (!ticker) return { notFound: true }

  try {
    const financialData = await getStockFinancials(ticker)
    const quote = await getStockQuote(ticker)
    const history = await getStockHistory(ticker)
    const explanations = await getScoreExplanations()
    
    // compute 52-week high/low from history if available
    let high52 = null
    let low52 = null
    if (Array.isArray(history) && history.length > 0) {
      const highs = history.map((d: any) => d.high).filter(Boolean)
      const lows = history.map((d: any) => d.low).filter(Boolean)
      if (highs.length) high52 = Math.max(...highs)
      if (lows.length) low52 = Math.min(...lows)
    }

    const z = calcAltman(financialData, quote?.marketCap || 0)
    const f = calcPiotroski(financialData)
    const m = calcBeneish(financialData)
    const o = calcOhlson(financialData)

    const price = {
      current: quote?.regularMarketPrice ?? null,
      change: quote?.regularMarketChange ?? null,
      changePercent: quote?.regularMarketChangePercent ?? null,
      high52,
      low52,
      lastUpdated: quote?.regularMarketTime ? quote.regularMarketTime.toISOString() : null,
      companyName: quote?.shortName || quote?.longName || '',
      currency: quote?.currency || 'USD'
    }

    return { props: { ticker, scores: { z, f, m, o }, explanations, price } }
  } catch (error) {
    console.error('Report generation error:', error)
    return { 
      props: { 
        ticker, 
        scores: { z: { score: NaN, interpretation: '', color: '' }, f: { score: NaN, interpretation: '', color: '' }, m: { score: NaN, interpretation: '', color: '' }, o: { score: NaN, interpretation: '', color: '' } }, 
        explanations: {}, 
        error: `Failed to load financial data for ${ticker}. This stock may not have sufficient financial data available.` 
      } 
    }
  }
}
