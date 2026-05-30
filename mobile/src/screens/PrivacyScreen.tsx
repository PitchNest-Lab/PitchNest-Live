import React from 'react';
import { Linking, Pressable, Text } from 'react-native';
import { LegalScreen, LegalSection } from '../components/LegalScreen';
import { CONTACT_EMAIL, MIN_AGE, PRIVACY_URL } from '../constants/legal';

export default function PrivacyScreen() {
  return (
    <LegalScreen title="Privacy Policy">
      <LegalSection title="Overview">
        PitchNest helps founders practice pitches with AI-generated investor personas on iOS and Android.
        This policy explains what we collect, how we use it, and how to delete your data.
      </LegalSection>
      <LegalSection title="Information we collect">
        Account data (name, email, hashed password), profile data (startup name, industry, goals), pitch decks,
        session transcripts, AI evaluation reports, and optional camera/audio during live pitch sessions.
      </LegalSection>
      <LegalSection title="AI processing">
        We use Google Gemini to power live conversations and evaluations. Voice, text, camera frames, and deck
        content may be sent to Google&apos;s APIs. AI responses are generated — not real investors or financial advice.
      </LegalSection>
      <LegalSection title="Third-party services">
        Supabase (database and storage), Google Gemini (AI), Render (backend API), Vercel (web legal pages).
      </LegalSection>
      <LegalSection title="Your choices">
        Update profile in Settings, revoke camera/microphone in device settings, or delete your account in Profile.
        Contact {CONTACT_EMAIL} for privacy requests.
      </LegalSection>
      <LegalSection title="Children">
        PitchNest is not directed at children under {MIN_AGE}. We do not knowingly collect data from users under {MIN_AGE}.
      </LegalSection>
      <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
        <Text style={{ color: '#0ea5e9', fontWeight: '700' }}>View full policy online</Text>
      </Pressable>
    </LegalScreen>
  );
}
