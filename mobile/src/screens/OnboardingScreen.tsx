import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';

const INDUSTRIES = ['SaaS & Enterprise', 'Fintech', 'Healthtech', 'Consumer & E-Commerce'];
const GOALS = ['Raise Seed Round', 'Improve Delivery', 'Investor Q&A Practice', 'Demo Day Prep'];

type Props = { onComplete: () => void };

export default function OnboardingScreen({ onComplete }: Props) {
  const { user, authFetch } = useAuth();
  const [step, setStep] = useState(1);
  const [startupName, setStartupName] = useState('');
  const [industry, setIndustry] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const finish = async (skipped = false) => {
    setLoading(true);
    const name = startupName.trim() || 'My Startup';
    try {
      if (!skipped) {
        await authFetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startup_name: name,
            industry: industry || 'SaaS & Enterprise',
            goal: goal || 'Improve Delivery',
          }),
        });
      }
    } catch {
      // continue even if profile save fails
    }
    await storage.setOnboardingComplete(true);
    await storage.setStartupName(name);
    setLoading(false);
    onComplete();
  };

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <Text style={styles.badge}>Step {step} of 3</Text>
        {step === 1 && (
          <>
            <Text style={styles.title}>Welcome, {user?.name?.split(' ')[0] || 'Founder'}!</Text>
            <Text style={styles.subtitle}>What startup are you pitching?</Text>
            <Input value={startupName} onChangeText={setStartupName} placeholder="e.g. EcoStream SaaS" />
            <Button title="Continue" onPress={() => setStep(2)} disabled={!startupName.trim()} />
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.title}>Select your industry</Text>
            <View style={styles.grid}>
              {INDUSTRIES.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setIndustry(item)}
                  style={[styles.chip, industry === item && styles.chipActive]}
                >
                  <Text style={[styles.chipText, industry === item && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Button title="Continue" onPress={() => setStep(3)} disabled={!industry} />
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.title}>What is your goal?</Text>
            <View style={styles.grid}>
              {GOALS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setGoal(item)}
                  style={[styles.chip, goal === item && styles.chipActive]}
                >
                  <Text style={[styles.chipText, goal === item && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Button title="Finish" onPress={() => finish(false)} loading={loading} disabled={!goal} />
          </>
        )}
        <Button title="Skip for now" variant="ghost" onPress={() => finish(true)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.md },
  badge: { color: colors.primary, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 22 },
  grid: { gap: 10 },
  chip: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: '#e0f2fe' },
  chipText: { fontWeight: '700', color: colors.text },
  chipTextActive: { color: colors.primaryDark },
});
