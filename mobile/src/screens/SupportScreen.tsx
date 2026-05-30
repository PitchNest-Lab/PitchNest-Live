import React from 'react';
import { Linking, Pressable, Text } from 'react-native';
import { LegalScreen, LegalSection } from '../components/LegalScreen';
import { APP_NAME, CONTACT_EMAIL, SUPPORT_URL } from '../constants/legal';

export default function SupportScreen() {
  return (
    <LegalScreen title="Support">
      <LegalSection title="Get help">
        Need help with login, pitch sessions, deck uploads, or account deletion? Email us and we will respond as soon as possible.
      </LegalSection>
      <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
        <Text style={{ color: '#0ea5e9', fontWeight: '800', fontSize: 16 }}>{CONTACT_EMAIL}</Text>
      </Pressable>
      <LegalSection title="App Store review">
        Demo reviewers can create a free account in-app or contact us for a test account.
      </LegalSection>
      <LegalSection title="Known limitations">
        {APP_NAME} mobile uses in-app deck viewing instead of screen sharing. Keep the app open during live pitches.
      </LegalSection>
      <Pressable onPress={() => Linking.openURL(SUPPORT_URL)}>
        <Text style={{ color: '#0ea5e9', fontWeight: '700' }}>View support page online</Text>
      </Pressable>
    </LegalScreen>
  );
}
