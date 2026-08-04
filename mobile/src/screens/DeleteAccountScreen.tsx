import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LegalScreen, LegalSection } from '../components/LegalScreen';
import { APP_NAME, CONTACT_EMAIL, MIN_AGE } from '../constants/legal';
import { useAuth } from '../contexts/AuthContext';
import { apiPath } from '../config/env';

export default function DeleteAccountScreen() {
  const { logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setMessage('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiPath('/api/auth/delete-account'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setMessage('Account deleted. You can close the app.');
      await logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LegalScreen title="Delete Account">
      <LegalSection title="What gets deleted">
        Your {APP_NAME} profile, pitch decks, sessions, transcripts, and uploaded media are permanently removed.
      </LegalSection>
      <LegalSection title="Before you delete">
        This action cannot be undone. If you signed up on another device, use the same email and password below.
      </LegalSection>
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      <Button title="Delete my account" variant="danger" onPress={submit} loading={loading} />
      <Text style={styles.footer}>Questions? {CONTACT_EMAIL} · Users must be {MIN_AGE}+</Text>
    </LegalScreen>
  );
}

const styles = StyleSheet.create({
  error: { color: '#ef4444', fontWeight: '700' },
  success: { color: '#059669', fontWeight: '700' },
  footer: { color: '#64748b', fontSize: 12, lineHeight: 18 },
});
