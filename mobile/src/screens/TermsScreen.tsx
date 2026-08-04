import React from 'react';
import { Linking, Pressable, Text } from 'react-native';
import { LegalScreen, LegalSection } from '../components/LegalScreen';
import { APP_NAME, CONTACT_EMAIL, TERMS_URL } from '../constants/legal';

export default function TermsScreen() {
  return (
    <LegalScreen title="Terms of Service">
      <LegalSection title="Service">
        {APP_NAME} provides AI-powered pitch practice tools. The mobile app is free — no subscriptions are required in v1.
      </LegalSection>
      <LegalSection title="AI disclaimer">
        All investor personas and feedback are AI-generated simulations. They do not represent real venture capitalists,
        investment offers, or financial advice.
      </LegalSection>
      <LegalSection title="Acceptable use">
        Do not upload unlawful content, attempt to abuse the service, or share credentials. You must be at least 13 years old.
      </LegalSection>
      <LegalSection title="Account termination">
        You may delete your account at any time in Profile. We may suspend accounts that violate these terms.
      </LegalSection>
      <LegalSection title="Contact">
        Questions about these terms: {CONTACT_EMAIL}
      </LegalSection>
      <Pressable onPress={() => Linking.openURL(TERMS_URL)}>
        <Text style={{ color: '#0ea5e9', fontWeight: '700' }}>View full terms online</Text>
      </Pressable>
    </LegalScreen>
  );
}
