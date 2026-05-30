import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { ScoreBars } from '../components/ScoreBars';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { getOverallScore } from '../lib/utils';
import type { Session } from '../types';
import type { RootStackParamList } from '../navigation/types';

export default function ReportScreen() {
  const { authFetch } = useAuth();
  const route = useRoute<RouteProp<RootStackParamList, 'Report'>>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const id = route.params?.sessionId;
        const url = id ? `/api/sessions/${id}` : '/api/sessions';
        const res = await authFetch(url);
        if (res.ok) {
          const data = await res.json();
          setSession(Array.isArray(data) ? data[0] : data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authFetch, route.params?.sessionId]);

  const report = session?.evaluation_report;
  const scores = {
    delivery: Number(report?.scores?.delivery) || 0,
    clarity: Number(report?.scores?.clarity) || 0,
    scalability: Number(report?.scores?.scalability) || 0,
    readiness: Number(report?.scores?.readiness) || 0,
  };
  const overall = getOverallScore(report);

  return (
    <Screen title="Pitch Report" loading={loading}>
      {!session ? (
        <Text style={styles.empty}>No report found.</Text>
      ) : (
        <>
          <Text style={styles.business}>{session.business_name || 'Pitch Session'}</Text>
          <ScoreBars scores={scores} overall={overall} />
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Summary</Text>
            <Text style={styles.body}>{report?.summary || session.summary || 'No summary available.'}</Text>
          </View>
          {report?.strengths?.length ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Strengths</Text>
              {report.strengths.map((item, i) => (
                <Text key={i} style={styles.listItem}>• {item}</Text>
              ))}
            </View>
          ) : null}
          {report?.risks?.length ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Risks</Text>
              {report.risks.map((item, i) => (
                <Text key={i} style={styles.listItem}>• {item}</Text>
              ))}
            </View>
          ) : null}
          {report?.next_steps?.length ? (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Next steps</Text>
              {report.next_steps.map((item, i) => (
                <Text key={i} style={styles.listItem}>• {item}</Text>
              ))}
            </View>
          ) : null}
          <Text style={styles.disclaimer}>
            AI-generated feedback only. Not financial advice or a real investment offer.
          </Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textMuted },
  business: { fontSize: 22, fontWeight: '800', color: colors.text },
  block: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  blockTitle: { fontWeight: '800', color: colors.text, fontSize: 16 },
  body: { color: '#334155', lineHeight: 22 },
  listItem: { color: '#334155', lineHeight: 22 },
  disclaimer: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
