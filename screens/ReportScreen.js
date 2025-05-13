import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { ProgressBar, Card, Title } from 'react-native-paper';
import ScoreCard                    from '../components/ScoreCard';
import { analyzeStock }             from '../utils/api';

export default function ReportScreen({ route }) {
  const { ticker } = route.params;
  const [loading, setLoading] = useState(true);
  const [report, setReport]   = useState(null);

  useEffect(() => {
    analyzeStock(ticker).then(data => {
      setTimeout(() => {
        setReport(data);
        setLoading(false);
      }, 2500);
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

  const { current, high52, low52, percent } = report.price;
  const { z, f, m, o } = report.scores;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{ticker.toUpperCase()}</Title>
          <Text style={styles.price}>${current.toFixed(2)}</Text>
          <ProgressBar progress={percent/100} color="#4caf50" style={styles.pb} />
          <View style={styles.rangeRow}>
            <Text>${low52.toFixed(2)}</Text>
            <Text>${high52.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      <ScoreCard
        title="Altman Z-Score"
        value={z.score.toFixed(2)}
        interpretation={z.interpretation}
        tooltip="Bankruptcy risk model. >3 safe, 1.8–3 grey, <1.8 distress."
        color={z.color}
      />

      <ScoreCard
        title="Piotroski F-Score"
        value={`${f.score}/9`}
        interpretation={f.interpretation}
        tooltip="Financial strength. 8–9 strong, 5–7 average, 0–4 weak."
        color={f.color}
      />

      <ScoreCard
        title="Beneish M-Score"
        value={m.score.toFixed(2)}
        interpretation={m.interpretation}
        tooltip="Earnings manipulation. >−1.78 suggests manipulation."
        color={m.color}
      />

      <ScoreCard
        title="Ohlson O-Score"
        value={`${(o.prob*100).toFixed(1)}%`}
        interpretation="Probability of distress >50% high risk."
        tooltip="Two-year bankruptcy probability model."
        color={o.color}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#121212' },
  card:      { marginBottom: 16, backgroundColor: '#1f1f1f' },
  title:     { fontSize: 24, color: '#fff' },
  price:     { fontSize: 20, color: '#4caf50', marginBottom: 8 },
  pb:        { height: 8, borderRadius: 4, marginVertical: 8 },
  rangeRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  loader:    { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#121212' },
  loadingText:{ color:'#fff', marginTop:12 }
});