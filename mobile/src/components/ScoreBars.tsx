import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../constants/theme';

type Props = {
  scores: Record<string, number>;
  overall?: number;
};

const LABELS: Record<string, string> = {
  delivery: 'Delivery',
  clarity: 'Clarity',
  scalability: 'Scalability',
  readiness: 'Readiness',
};

export function ScoreBars({ scores, overall }: Props) {
  const entries = Object.entries(scores);
  return (
    <View style={styles.wrap}>
      {typeof overall === 'number' ? (
        <View style={styles.overall}>
          <Text style={styles.overallLabel}>Overall</Text>
          <Text style={styles.overallValue}>{overall}%</Text>
        </View>
      ) : null}
      {entries.map(([key, value]) => (
        <View key={key} style={styles.row}>
          <View style={styles.rowTop}>
            <Text style={styles.label}>{LABELS[key] || key}</Text>
            <Text style={styles.value}>{value}/10</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(100, value * 10)}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  overall: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallLabel: { color: '#e0f2fe', fontWeight: '700', fontSize: 14 },
  overallValue: { color: '#fff', fontWeight: '800', fontSize: 28 },
  row: { gap: 6 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontWeight: '700', color: colors.text },
  value: { fontWeight: '700', color: colors.primary },
  track: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary },
});
