import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, getOverallScore, getSessionStatus } from '../lib/utils';
import type { RootStackParamList } from '../navigation/types';
import type { Session } from '../types';

export default function HomeScreen() {
  const { user, authFetch } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data.slice(0, 5) : []);
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen title={`Hi, ${user?.name?.split(' ')[0] || 'Founder'}`} subtitle="Ready to practice your pitch?" loading={loading}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start a live pitch</Text>
        <Text style={styles.cardText}>Voice + deck slides + AI panel. No screen sharing on mobile.</Text>
        <Button title="Configure Pitch" onPress={() => navigation.navigate('Setup')} />
      </View>

      <Text style={styles.sectionTitle}>Recent sessions</Text>
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No pitches yet. Upload a deck and start your first session.</Text>
        </View>
      ) : (
        sessions.map((session) => {
          const score = getOverallScore(session.evaluation_report);
          return (
            <Pressable
              key={session.id}
              style={styles.sessionCard}
              onPress={() => navigation.navigate('Report', { sessionId: session.id })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionName}>{session.business_name || 'Pitch Session'}</Text>
                <Text style={styles.sessionDate}>{formatDate(session.created_at)}</Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreValue}>{score || '—'}</Text>
                <Text style={styles.scoreLabel}>{getSessionStatus(score)}</Text>
              </View>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: 10,
  },
  cardTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  cardText: { color: '#e0f2fe', lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { color: colors.textMuted, lineHeight: 20 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionName: { fontWeight: '800', color: colors.text },
  sessionDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  scoreBadge: { alignItems: 'flex-end' },
  scoreValue: { fontSize: 22, fontWeight: '900', color: colors.primary },
  scoreLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
});
