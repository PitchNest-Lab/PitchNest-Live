import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { APP_NAME, CONTACT_EMAIL } from '../constants/legal';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../navigation/types';

export default function ProfileScreen() {
  const { user, logout, authFetch } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setError('');
    if (!confirmed) {
      setError('Please confirm deletion is permanent.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch('/api/auth/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');
      await logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Profile" subtitle="Account, legal, and app settings">
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.freeBadge}>Free app · No subscriptions</Text>
      </View>

      <Text style={styles.section}>Legal & support</Text>
      {[
        { label: 'Privacy Policy', route: 'Privacy' as const },
        { label: 'Terms of Service', route: 'Terms' as const },
        { label: 'Support', route: 'Support' as const },
        { label: 'Delete Account', route: 'DeleteAccount' as const },
      ].map((item) => (
        <Pressable key={item.route} style={styles.linkRow} onPress={() => navigation.navigate(item.route)}>
          <Text style={styles.linkText}>{item.label}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      <Text style={styles.section}>Account actions</Text>
      <Button title="Log out" variant="secondary" onPress={() => logout()} />

      {!showDelete ? (
        <Button title="Delete account" variant="danger" onPress={() => setShowDelete(true)} />
      ) : (
        <View style={styles.deleteBox}>
          <Text style={styles.deleteTitle}>Delete account permanently</Text>
          <Text style={styles.deleteText}>
            This removes your profile, decks, sessions, and media from {APP_NAME}. This cannot be undone.
          </Text>
          <Pressable onPress={() => setConfirmed((v) => !v)} style={styles.checkRow}>
            <Text style={styles.checkMark}>{confirmed ? '☑' : '☐'}</Text>
            <Text style={styles.checkLabel}>I understand this is permanent</Text>
          </Pressable>
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Confirm delete" variant="danger" onPress={handleDelete} loading={loading} />
          <Button title="Cancel" variant="ghost" onPress={() => setShowDelete(false)} />
        </View>
      )}

      <Text style={styles.footer}>Support: {CONTACT_EMAIL}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  email: { color: colors.textMuted },
  freeBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    color: '#166534',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '800',
    fontSize: 12,
  },
  section: { marginTop: spacing.md, fontWeight: '800', color: colors.text, fontSize: 16 },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: { fontWeight: '700', color: colors.text },
  chevron: { fontSize: 22, color: colors.textMuted },
  deleteBox: {
    gap: spacing.sm,
    backgroundColor: '#fff1f2',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteTitle: { fontWeight: '800', color: colors.danger },
  deleteText: { color: '#7f1d1d', lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkMark: { fontSize: 18 },
  checkLabel: { fontWeight: '700', color: colors.text },
  error: { color: colors.danger, fontWeight: '700' },
  footer: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.lg },
});
