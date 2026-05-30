import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients, radius, spacing, typography } from '../constants/theme';

const FEATURES = [
  'Practice with AI investor panels',
  'Upload decks and get slide-aware feedback',
  'Scores, transcripts, and session history',
];

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  const [featureIndex, setFeatureIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 8, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setFeatureIndex((i) => (i + 1) % FEATURES.length);
        slide.setValue(-8);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(slide, { toValue: 0, duration: 320, useNativeDriver: true }),
        ]).start();
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [fade, slide]);

  return (
    <LinearGradient colors={[...gradients.auth]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Text style={styles.logoLetter}>P</Text>
              </View>
              <Text style={styles.brand}>PitchNest</Text>
            </View>

            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>

            <Animated.View
              style={[styles.featurePill, { opacity: fade, transform: [{ translateY: slide }] }]}
            >
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{FEATURES[featureIndex]}</Text>
            </Animated.View>

            <View style={styles.card}>{children}</View>
            {footer}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: spacing.md },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { color: '#fff', fontSize: 22, fontWeight: '900' },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroTitle: { ...typography.hero, color: '#fff', marginTop: spacing.sm },
  heroSubtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 24 },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  featureText: { color: '#e0e7ff', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 8,
  },
});
