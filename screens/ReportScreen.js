import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { ProgressBar, Card, Title } from 'react-native-paper';
import ScoreCard                    from '../components/ScoreCard';

// Helper function to fetch analysis data
const fetchStockAnalysis = async (ticker) => {
  console.log(`[ReportScreen] Fetching analysis for ${ticker}...`);
  try {
    const response = await fetch(`/.netlify/functions/analyze?ticker=${encodeURIComponent(ticker)}`);
    console.log(`[ReportScreen] API response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ReportScreen] API error response: ${errorText}`);
      throw new Error(`Failed to fetch stock analysis. Status: ${response.status}. Details: ${errorText}`);
    }
    const data = await response.json();
    console.log('[ReportScreen] Successfully fetched and parsed analysis data:', data);
    return data;
  } catch (error) {
    console.error('[ReportScreen] Error fetching stock analysis:', error);
    throw error; // Re-throw to be caught by the component
  }
};

export default function ReportScreen({ route }) {
  const { ticker } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setReportData(null); // Clear previous data

    fetchStockAnalysis(ticker)
      .then(data => {
        setReportData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'An unexpected error occurred.');
        setLoading(false);
      });
  }, [ticker]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Analyzing {ticker}…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorText}>Could not load report for {ticker}.</Text>
      </View>
    );
  }

  if (!reportData) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loadingText}>No data available for {ticker}.</Text>
      </View>
    );
  }

  const { price, scores } = reportData;

  if (!price || !scores) {
      console.error("[ReportScreen] Price or scores data is missing in reportData:", reportData);
      return (
          <View style={styles.loader}>
              <Text style={styles.errorText}>Incomplete data received for {ticker}.</Text>
          </View>
      );
  }

  const { current, high52, low52, percent } = price;
  const { z, f, m, o } = scores;

  if (!z || !f || !m || !o) {
    console.error("[ReportScreen] One or more score objects (z, f, m, o) are missing in scores:", scores);
    return (
        <View style={styles.loader}>
            <Text style={styles.errorText}>Incomplete score data for {ticker}.</Text>
        </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{ticker.toUpperCase()}</Title>
          {typeof current === 'number' && <Text style={styles.price}>${current.toFixed(2)}</Text>}
          {typeof percent === 'number' && <ProgressBar progress={percent / 100} color="#4caf50" style={styles.pb} />}
          <View style={styles.rangeRow}>
            {typeof low52 === 'number' && <Text style={styles.rangeText}>52W Low: ${low52.toFixed(2)}</Text>}
            {typeof high52 === 'number' && <Text style={styles.rangeText}>52W High: ${high52.toFixed(2)}</Text>}
          </View>
        </Card.Content>
      </Card>

      {z && z.score !== undefined && (
        <ScoreCard
          title="Altman Z-Score"
          value={typeof z.score === 'number' ? z.score.toFixed(2) : 'N/A'}
          interpretation={z.interpretation || 'No interpretation available.'}
          tooltip="Bankruptcy risk model. >2.99 safe, 1.81–2.99 grey, <1.81 distress."
          color={z.color || '#888'}
        />
      )}

      {f && f.score !== undefined && (
        <ScoreCard
          title="Piotroski F-Score"
          value={typeof f.score === 'number' ? `${f.score}/9` : 'N/A'}
          interpretation={f.interpretation || 'No interpretation available.'}
          tooltip="Financial strength. 8–9 strong, 5–7 average, 0–4 weak."
          color={f.color || '#888'}
        />
      )}

      {m && m.score !== undefined && (
        <ScoreCard
          title="Beneish M-Score"
          value={typeof m.score === 'number' ? m.score.toFixed(2) : 'N/A'}
          interpretation={m.interpretation || 'No interpretation available.'}
          tooltip="Earnings manipulation. >-1.78 suggests manipulation."
          color={m.color || '#888'}
        />
      )}

      {o && o.prob !== undefined && (
        <ScoreCard
          title="Ohlson O-Score"
          value={typeof o.prob === 'number' ? `${(o.prob * 100).toFixed(1)}%` : 'N/A'}
          interpretation={o.interpretation || "Probability of distress >50% high risk."}
          tooltip="Two-year bankruptcy probability model."
          color={o.color || '#888'}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#121212', flexGrow: 1 },
  card:      { marginBottom: 16, backgroundColor: '#1f1f1f' },
  title:     { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  price:     { fontSize: 28, fontWeight: 'bold', color: '#4caf50', textAlign: 'center', marginBottom: 8 },
  pb:        { height: 10, borderRadius: 5, marginVertical: 12, backgroundColor: '#333' },
  rangeRow:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  rangeText: { fontSize: 14, color: '#ccc' },
  loader:    { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#121212', padding: 20 },
  loadingText:{ color:'#fff', marginTop:12, fontSize: 16, textAlign: 'center' },
  errorText: { color: '#ff6b6b', fontSize: 16, textAlign: 'center', marginBottom: 10 },
});