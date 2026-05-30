import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, uploadDeck } from '../lib/utils';
import type { Deck } from '../types';
import type { RootStackParamList } from '../navigation/types';

export default function DecksScreen() {
  const { authFetch, token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/decks?t=${Date.now()}`);
      if (res.ok) setDecks(await res.json());
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const pickAndUpload = async () => {
    if (!token) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      await uploadDeck(token, asset.uri, asset.name, asset.mimeType || 'application/pdf');
      await load();
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Could not upload deck');
    } finally {
      setUploading(false);
    }
  };

  const removeDeck = (deck: Deck) => {
    Alert.alert('Delete deck', `Remove "${deck.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await authFetch(`/api/decks/${deck.id}`, { method: 'DELETE' });
          if (res.ok) load();
        },
      },
    ]);
  };

  return (
    <Screen title="Pitch Decks" subtitle="Upload PDF or PowerPoint decks" loading={loading}>
      <Button title={uploading ? 'Uploading…' : 'Upload deck'} onPress={pickAndUpload} loading={uploading} />
      {decks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No decks yet. Upload a PDF to use in live pitch sessions.</Text>
        </View>
      ) : (
        decks.map((deck) => (
          <View key={deck.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{deck.name}</Text>
              <Text style={styles.meta}>
                {deck.status || 'READY'} · {formatDate(deck.created_at)} · {deck.size ? `${deck.size} MB` : ''}
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => navigation.navigate('Setup', { preSelectedDeckId: deck.id })}>
                <Text style={styles.link}>Pitch</Text>
              </Pressable>
              <Pressable onPress={() => removeDeck(deck)}>
                <Text style={styles.danger}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
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
  emptyText: { color: colors.textMuted, lineHeight: 20 },
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
