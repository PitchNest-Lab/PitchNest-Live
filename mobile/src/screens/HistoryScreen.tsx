import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, getOverallScore, getSessionStatus } from '../lib/utils';
import type { Session } from '../types';
import type { RootStackParamList } from '../navigation/types';

export default function HistoryScreen() {
  const { authFetch } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/sessions');
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteSession = (session: Session) => {
    Alert.alert('Delete session', 'Remove this pitch from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await authFetch(`/api/sessions/${session.id}`, { method: 'DELETE' });
          load();
        },
      },
    ]);
  };

  const shareSession = async (session: Session) => {
    const url = session.share_id
      ? `https://pitchnestapp.vercel.app/report?session=${session.share_id}`
      : `https://pitchnestapp.vercel.app/report?session=${session.id}`;
    await Share.share({ message: `PitchNest report: ${url}` });
  };

  return (
    <Screen title="Pitch History" subtitle="Review and manage past sessions" loading={loading}>
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No sessions yet.</Text>
        </View>
      ) : (
        sessions.map((session) => {
          const score = getOverallScore(session.evaluation_report);
          return (
            <View key={session.id} style={styles.card}>
              <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('Report', { sessionId: session.id })}>
                <Text style={styles.name}>{session.business_name || 'Pitch Session'}</Text>
                <Text style={styles.meta}>
                  {formatDate(session.created_at)} · {getSessionStatus(score)} · {score || 0}%
                </Text>
              </Pressable>
              <View style={styles.actions}>
                <Pressable onPress={() => shareSession(session)}>
                  <Text style={styles.link}>Share</Text>
                </Pressable>
                <Pressable onPress={() => deleteSession(session)}>
                  <Text style={styles.danger}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { color: colors.textMuted },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  name: { fontWeight: '800', color: colors.text },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  actions: { gap: 10, alignItems: 'flex-end' },
  link: { color: colors.primary, fontWeight: '800' },
  danger: { color: colors.danger, fontWeight: '800' },
});
