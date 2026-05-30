import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { CONTACT_EMAIL } from '../constants/legal';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
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
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>PitchNest</Text>
          <Text style={styles.tagline}>AI pitch practice for founders</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@startup.com" />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder="••••••••"
        />
        <Pressable onPress={() => setShowPassword((v) => !v)}>
          <Text style={styles.link}>{showPassword ? 'Hide password' : 'Show password'}</Text>
        </Pressable>

        <Button title="Log In" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.md }} />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkCenter}>Forgot password?</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.linkCenter}>Create an account</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          AI feedback is generated — not real investors or financial advice. Free app, no subscriptions.
        </Text>
        <Text style={styles.support}>Support: {CONTACT_EMAIL}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.sm },
  hero: { marginBottom: spacing.lg, alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '900', color: colors.primary },
  tagline: { marginTop: 6, color: colors.textMuted, fontSize: 15 },
  error: {
    backgroundColor: '#fef2f2',
    color: colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '700',
  },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  linkCenter: { textAlign: 'center', color: colors.primary, fontWeight: '700', marginTop: 8 },
  disclaimer: { marginTop: spacing.lg, textAlign: 'center', color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  support: { textAlign: 'center', color: colors.textMuted, fontSize: 12 },
});
