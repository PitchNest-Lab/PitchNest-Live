import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { LEGAL_LAST_UPDATED } from '../constants/legal';

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalScreen({ title, children }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.updated}>Last updated: {LEGAL_LAST_UPDATED}</Text>
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.paragraph}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  updated: { marginTop: 6, color: colors.textMuted, fontSize: 13 },
  body: { marginTop: spacing.lg, gap: spacing.lg },
  section: { gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  paragraph: { fontSize: 15, lineHeight: 22, color: '#334155' },
});
