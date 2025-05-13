import React from 'react';
import { StyleSheet, Text }         from 'react-native';
import { Card, IconButton }         from 'react-native-paper';
import Tooltip                      from 'react-native-walkthrough-tooltip';

export default function ScoreCard({ title, value, interpretation, tooltip, color }) {
  const [showTip, setShowTip] = React.useState(false);

  return (
    <Card style={styles.card}>
      <Card.Title
        title={title}
        titleStyle={{ color }}
        right={() => (
          <Tooltip
            isVisible={showTip}
            contentStyle={styles.tipContent}
            content={<Text style={styles.tipText}>{tooltip}</Text>}
            placement="top"
            onClose={() => setShowTip(false)}
          >
            <IconButton icon="information" color={color} onPress={() => setShowTip(true)} />
          </Tooltip>
        )}
      />
      <Card.Content>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.interpret}>{interpretation}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card:      { marginBottom: 16, backgroundColor: '#1f1f1f' },
  value:     { fontSize: 28, fontWeight: 'bold' },
  interpret: { fontSize: 14, color: '#ccc', marginTop: 4 },
  tipContent:{ backgroundColor: '#333', padding: 8, borderRadius: 4 },
  tipText:   { color: '#fff', fontSize: 12 }
});