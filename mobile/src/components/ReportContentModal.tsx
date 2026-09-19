import React, { useState } from 'react';
import { Alert, Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { Input } from './Input';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { CONTACT_EMAIL } from '../constants/legal';

const REASONS = ['Offensive or unsafe content', 'Inaccurate or misleading feedback', 'Something else'];

type Props = {
  visible: boolean;
  onClose: () => void;
  sessionId?: string | null;
};

/**
 * In-app "report AI content" flow. Required by Google Play's AI-Generated
 * Content policy: apps that generate content with AI must let users flag
 * offensive output without leaving the app.
 */
export function ReportContentModal({ visible, onClose, sessionId }: Props) {
  const { authFetch } = useAuth();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setReason(REASONS[0]);
    setDetails('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await authFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reason, message: details }),
      });
      if (!res.ok) throw new Error('Report failed');
      Alert.alert('Report received', 'Thanks — our team will review this session.');
      reset();
      onClose();
    } catch {
      Alert.alert(
        'Could not submit report',
        `Email ${CONTACT_EMAIL} with the session details instead?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Email us',
            onPress: () =>
              Linking.openURL(
                `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('PitchNest content report')}&body=${encodeURIComponent(
                  `Reason: ${reason}\nSession: ${sessionId || 'n/a'}\nDetails: ${details}`
                )}`
              ),
          },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Report AI content</Text>
          <Text style={styles.subtitle}>
            Flag anything offensive, unsafe, or inaccurate from the AI panel. Our team reviews every report.
          </Text>

          <View style={styles.reasonList}>
            {REASONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.reasonRow, reason === r && styles.reasonRowActive]}
                onPress={() => setReason(r)}
              >
                <View style={[styles.radio, reason === r && styles.radioActive]} />
                <Text style={styles.reasonText}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Additional details (optional)"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
            placeholder="What did the AI say or do?"
          />

          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={onClose} style={styles.actionBtn} />
            <Button title="Submit report" onPress={handleSubmit} loading={submitting} style={styles.actionBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  reasonList: { gap: 8 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonRowActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  reasonText: { color: colors.text, fontSize: 14, flex: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: spacing.sm },
  actionBtn: { flex: 1 },
});
