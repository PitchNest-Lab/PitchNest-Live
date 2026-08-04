import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PitchStackParamList } from './PitchStack';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pitch: NavigatorScreenParams<PitchStackParamList> | undefined;
  Decks: undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
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

export type ReportRouteParams = { sessionId?: number };
