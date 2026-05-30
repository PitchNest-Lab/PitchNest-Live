import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { PitchProvider } from './src/contexts/PitchContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PitchProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </PitchProvider>
    </AuthProvider>
  );
}
