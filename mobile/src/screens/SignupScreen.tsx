import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
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
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Create account" subtitle="Start practicing with AI investors">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Input label="Full name" value={name} onChangeText={setName} placeholder="Jane Founder" />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Text style={styles.legal}>
        By signing up you agree to our Privacy Policy and Terms (available in Settings after login).
      </Text>
      <Button title="Sign Up" onPress={onSubmit} loading={loading} />
      <Button title="Back to Login" variant="secondary" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: '#ef4444', fontWeight: '700' },
  legal: { color: '#64748b', fontSize: 12, lineHeight: 18 },
});
