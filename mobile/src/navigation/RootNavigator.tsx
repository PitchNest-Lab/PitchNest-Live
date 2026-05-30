import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/storage';
import DeleteAccountScreen from '../screens/DeleteAccountScreen';
import LiveRoomScreen from '../screens/LiveRoomScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import ReportScreen from '../screens/ReportScreen';
import SetupScreen from '../screens/SetupScreen';
import SupportScreen from '../screens/SupportScreen';
import TermsScreen from '../screens/TermsScreen';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    storage.isOnboardingComplete().then(setOnboardingDone);
  }, [user]);

  if (isLoading || (user && onboardingDone === null)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Auth" component={AuthStack} />
          </>
        ) : !onboardingDone ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={() => setOnboardingDone(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="Setup"
              component={SetupScreen}
              options={{ headerShown: true, title: 'Pre-Pitch Setup', presentation: 'modal' }}
            />
            <Stack.Screen
              name="LiveRoom"
              component={LiveRoomScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="Report"
              component={ReportScreen}
              options={{ headerShown: true, title: 'Pitch Report' }}
            />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: true, title: 'Privacy' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: true, title: 'Terms' }} />
            <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: true, title: 'Support' }} />
            <Stack.Screen
              name="DeleteAccount"
              component={DeleteAccountScreen}
              options={{ headerShown: true, title: 'Delete Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
