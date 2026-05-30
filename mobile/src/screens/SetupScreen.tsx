import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors, gradients, radius, shadow, spacing, typography } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { usePitchConfig } from '../contexts/PitchContext';
import type { PitchStackParamList } from '../navigation/PitchStack';
import type { Deck, PitchConfig } from '../types';

const MODES: { id: PitchConfig['mode']; label: string; desc: string }[] = [
  { id: 'panel', label: 'Panel', desc: '3 AI investors' },
  { id: 'coach', label: 'Coach', desc: 'Guided feedback' },
  { id: 'solo', label: 'Solo', desc: 'Practice alone' },
];

export default function SetupScreen() {
  const { authFetch } = useAuth();
  const { setPitchConfig } = usePitchConfig();
  const navigation = useNavigation<NativeStackNavigationProp<PitchStackParamList>>();
  const route = useRoute<RouteProp<PitchStackParamList, 'Setup'>>();
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
    if (!selectedDeck) {
      Alert.alert(
        'Upload a deck first',
        'Go to the Decks tab and upload a PDF pitch deck before starting a live session.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Decks',
            onPress: () => navigation.getParent()?.navigate('Decks'),
          },
        ]
      );
      return;
    }
    if (!micEnabled) {
      Alert.alert('Microphone required', 'Enable the microphone to practice with voice.');
      return;
    }

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

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading your decks…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LinearGradient colors={[...gradients.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroLabel}>Pre-pitch</Text>
        <Text style={styles.heroTitle}>Configure session</Text>
        <Text style={styles.heroSub}>15 min · voice + deck slides · no screen share</Text>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>AI mode</Text>
        <View style={styles.modeRow}>
          {MODES.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setMode(m.id)}
              style={[styles.modeCard, mode === m.id && styles.modeCardActive]}
            >
              <Text style={[styles.modeTitle, mode === m.id && styles.modeTitleActive]}>{m.label}</Text>
              <Text style={styles.modeDesc}>{m.desc}</Text>
            </Pressable>
          ))}
        </View>

        <Input label="Startup name" value={businessName} onChangeText={setBusinessName} />
        <Input label="Elevator pitch" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
        <Input label="Industry" value={industry} onChangeText={setIndustry} />
        <Input label="Investor persona" value={investorArchetype} onChangeText={setInvestorArchetype} />

        <View style={styles.sliderCard}>
          <Text style={styles.sliderLabel}>Aggressiveness: {aggressiveness}%</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={() => setAggressiveness((v) => Math.max(0, v - 5))}>
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <Pressable style={styles.stepBtn} onPress={() => setAggressiveness((v) => Math.min(100, v + 5))}>
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Camera</Text>
          <Switch value={cameraEnabled} onValueChange={setCameraEnabled} trackColor={{ true: colors.primary }} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Microphone (required)</Text>
          <Switch value={micEnabled} onValueChange={setMicEnabled} trackColor={{ true: colors.primary }} />
        </View>

        <Text style={styles.sectionLabel}>Pitch deck</Text>
        {decks.length === 0 ? (
          <View style={styles.emptyDeck}>
            <Text style={styles.emptyDeckText}>
              No decks yet. Upload a PDF in the Decks tab, then return here to go live.
            </Text>
          </View>
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

        <Button
          title={decks.length === 0 ? 'Upload a deck first' : 'Start live pitch'}
          onPress={startPitch}
          loading={submitting}
          disabled={!selectedDeck || !micEnabled}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingText: { color: colors.textMuted, fontWeight: '600' },
  hero: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  heroLabel: { color: 'rgba(255,255,255,0.75)', ...typography.label },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
  heroSub: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 14 },
  body: { flex: 1, padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  sectionLabel: { ...typography.label, color: colors.textMuted },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.soft,
  },
  modeCardActive: { borderColor: colors.primary, backgroundColor: '#eef2ff' },
  modeTitle: { fontWeight: '800', color: colors.text, fontSize: 14 },
  modeTitleActive: { color: colors.primaryDark },
  modeDesc: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  sliderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sliderLabel: { fontWeight: '700', color: colors.text },
  stepper: { flexDirection: 'row', gap: 10, marginTop: 8 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 20, fontWeight: '700', color: colors.primary },
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
  toggleLabel: { fontWeight: '700', color: colors.text },
  emptyDeck: {
    backgroundColor: '#fff7ed',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  emptyDeckText: { color: '#9a3412', lineHeight: 20 },
  deckItem: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  deckItemActive: { borderColor: colors.primary, backgroundColor: '#eef2ff' },
  deckName: { fontWeight: '800', color: colors.text },
  deckMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
});
