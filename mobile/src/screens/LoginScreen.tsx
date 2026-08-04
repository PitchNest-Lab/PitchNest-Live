import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthShell } from '../components/AuthShell';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { CONTACT_EMAIL } from '../constants/legal';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { AuthTimeoutError } from '../lib/authApi';
import type { AuthStackParamList } from '../navigation/types';

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || password.length < 6) {
      setError('Enter a valid email and password (min 6 characters).');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      if (err instanceof AuthTimeoutError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to practice pitches with AI investors and track your progress."
      footer={
        <Text style={styles.footer}>
          Free app · No subscriptions · {CONTACT_EMAIL}
        </Text>
      }
    >
      {loading ? (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>
            Connecting to server… First request after idle can take up to 30 seconds on Render.
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@startup.com"
        autoComplete="email"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        placeholder="Your password"
        autoComplete="password"
      />
      <Pressable onPress={() => setShowPassword((v) => !v)}>
        <Text style={styles.link}>{showPassword ? 'Hide password' : 'Show password'}</Text>
      </Pressable>

      <Button title="Log in" onPress={onSubmit} loading={loading} />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button title="Create account" variant="outline" onPress={() => navigation.navigate('Signup')} />
      <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.linkCenter}>Forgot password?</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        AI feedback is simulated — not real investors or financial advice.
      </Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  statusBanner: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  statusText: { color: colors.primaryDark, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  error: {
    backgroundColor: '#fef2f2',
    color: colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '600',
    fontSize: 14,
  },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  linkCenter: { textAlign: 'center', color: colors.primary, fontWeight: '700', marginTop: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  disclaimer: { textAlign: 'center', color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: spacing.md,
  },
});
