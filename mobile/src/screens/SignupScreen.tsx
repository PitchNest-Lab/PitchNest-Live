import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthShell } from '../components/AuthShell';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { AuthTimeoutError } from '../lib/authApi';
import type { AuthStackParamList } from '../navigation/types';

export default function SignupScreen() {
  const { signup } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Fill in all fields. Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
    } catch (err) {
      if (err instanceof AuthTimeoutError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join founders practicing investor-ready pitches with AI panels."
    >
      {loading ? (
        <Text style={styles.statusText}>
          Creating account… Server may take up to 30s on first request after idle.
        </Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Input label="Full name" value={name} onChangeText={setName} placeholder="Jane Founder" autoComplete="name" />
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
        secureTextEntry
        placeholder="Min 6 characters"
        hint="Use at least 6 characters"
      />

      <Text style={styles.legal}>
        By signing up you agree to our Privacy Policy and Terms (in Settings after login).
      </Text>
      <Button title="Create account" onPress={onSubmit} loading={loading} />
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.linkCenter}>Already have an account? Log in</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  statusText: { color: colors.primaryDark, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  error: {
    backgroundColor: '#fef2f2',
    color: colors.danger,
    padding: 12,
    borderRadius: 12,
    fontWeight: '600',
  },
  legal: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  linkCenter: { textAlign: 'center', color: colors.primary, fontWeight: '700' },
});
