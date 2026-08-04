import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LiveRoomScreen from '../screens/LiveRoomScreen';
import SetupScreen from '../screens/SetupScreen';

export type PitchStackParamList = {
  Setup: { preSelectedDeckId?: number } | undefined;
  LiveRoom: undefined;
};

const Stack = createNativeStackNavigator<PitchStackParamList>();

export default function PitchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Setup" component={SetupScreen} />
      <Stack.Screen
        name="LiveRoom"
        component={LiveRoomScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
