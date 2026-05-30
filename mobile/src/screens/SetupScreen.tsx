import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { usePitchConfig } from '../contexts/PitchContext';
import type { Deck, PitchConfig } from '../types';
import type { RootStackParamList } from '../navigation/types';

const MODES: PitchConfig['mode'][] = ['panel', 'coach', 'solo'];

export default function SetupScreen() {
  const { authFetch } = useAuth();
  const { setPitchConfig } = usePitchConfig();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Setup'>>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [mode, setMode] = useState<PitchConfig['mode']>('panel');
  const [businessName, setBusinessName] = useState('My Startup');
  const [description, setDescription] = useState('We are building the next generation of AI tools for enterprise.');
  const [industry, setIndustry] = useState('SaaS & Enterprise');
  const [investorArchetype, setInvestorArchetype] = useState('Seed Stage - Venture Capital');
  const [aggressiveness, setAggressiveness] = useState(60);
  const [riskAppetite, setRiskAppetite] = useState(75);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/api/decks?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setDecks(data);
          const preId = route.params?.preSelectedDeckId;
          const match = preId ? data.find((d: Deck) => d.id === preId) : data[0];
          if (match) setSelectedDeck(match);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authFetch, route.params?.preSelectedDeckId]);

  const startPitch = () => {
    if (!selectedDeck) return;
    setSubmitting(true);
    const config: PitchConfig = {
      mode,
      businessName,
      description,
      industry,
      investorArchetype,
      aggressiveness,
      riskAppetite,
      cameraEnabled,
      micEnabled,
      selectedDeck,
    };
    setPitchConfig(config);
    setSubmitting(false);
    navigation.navigate('LiveRoom');
  };

  return (
    <Screen title="Pre-Pitch Setup" subtitle="15 minute session · deck slides · voice" loading={loading}>
      <Text style={styles.label}>AI mode</Text>
      <View style={styles.row}>
        {MODES.map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={[styles.mode, mode === m && styles.modeActive]}>
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>{m.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Input label="Startup name" value={businessName} onChangeText={setBusinessName} />
      <Input label="Elevator pitch" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
      <Input label="Industry" value={industry} onChangeText={setIndustry} />
      <Input label="Investor persona" value={investorArchetype} onChangeText={setInvestorArchetype} />

      <View style={styles.sliderBlock}>
        <Text style={styles.label}>Aggressiveness: {aggressiveness}%</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setAggressiveness((v) => Math.max(0, v - 5))} style={styles.stepBtn}><Text>-</Text></Pressable>
          <Pressable onPress={() => setAggressiveness((v) => Math.min(100, v + 5))} style={styles.stepBtn}><Text>+</Text></Pressable>
        </View>
      </View>
      <View style={styles.sliderBlock}>
        <Text style={styles.label}>Risk appetite: {riskAppetite}%</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setRiskAppetite((v) => Math.max(0, v - 5))} style={styles.stepBtn}><Text>-</Text></Pressable>
          <Pressable onPress={() => setRiskAppetite((v) => Math.min(100, v + 5))} style={styles.stepBtn}><Text>+</Text></Pressable>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.label}>Camera</Text>
        <Switch value={cameraEnabled} onValueChange={setCameraEnabled} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.label}>Microphone (required)</Text>
        <Switch value={micEnabled} onValueChange={setMicEnabled} />
      </View>

      <Text style={styles.label}>Pitch deck</Text>
      {decks.length === 0 ? (
        <Text style={styles.hint}>Upload a PDF deck in the Decks tab first.</Text>
      ) : (
        decks.map((deck) => (
          <Pressable
            key={deck.id}
            onPress={() => setSelectedDeck(deck)}
            style={[styles.deckItem, selectedDeck?.id === deck.id && styles.deckItemActive]}
          >
            <Text style={styles.deckName}>{deck.name}</Text>
            <Text style={styles.deckMeta}>{deck.status || 'READY'}</Text>
          </Pressable>
        ))
      )}

      <Text style={styles.disclaimer}>
        AI-generated feedback only — not real investors. Keep the app open during your pitch.
      </Text>
      <Button title="Go Live" onPress={startPitch} loading={submitting} disabled={!selectedDeck || !micEnabled} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: 8 },
  mode: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  modeActive: { borderColor: colors.primary, backgroundColor: '#e0f2fe' },
  modeText: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  modeTextActive: { color: colors.primaryDark },
  sliderBlock: { gap: 8 },
  stepper: { flexDirection: 'row', gap: 8 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: { color: colors.textMuted },
  deckItem: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  deckItemActive: { borderColor: colors.primary, backgroundColor: '#e0f2fe' },
  deckName: { fontWeight: '800', color: colors.text },
  deckMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  disclaimer: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
