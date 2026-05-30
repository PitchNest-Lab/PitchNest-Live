import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadow, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useRootNavigation } from '../hooks/useRootNavigation';
import { formatDate, getOverallScore, getSessionStatus } from '../lib/utils';
import type { MainTabParamList } from '../navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { Session } from '../types';

export default function HomeScreen() {
  const { user, authFetch } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { navigateRoot } = useRootNavigation();
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
      <LinearGradient colors={[...gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <Text style={styles.cardTitle}>Start a live pitch</Text>
        <Text style={styles.cardText}>Voice, deck slides, and AI panel feedback. Built for mobile.</Text>
        <Button title="Start live pitch" onPress={() => navigation.navigate('Pitch', { screen: 'Setup' })} />
      </LinearGradient>

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
              onPress={() => navigateRoot('Report', { sessionId: session.id })}
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
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: 10,
    ...shadow.card,
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
