import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PitchConfig, Session } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pitch: undefined;
  Decks: undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Setup: { preSelectedDeckId?: number } | undefined;
  LiveRoom: undefined;
  Report: { sessionId?: number };
  Privacy: undefined;
  Terms: undefined;
  Support: undefined;
  DeleteAccount: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type SetupRouteParams = { preSelectedDeckId?: number };
export type ReportRouteParams = { sessionId?: number };
