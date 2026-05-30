import { useCallback } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';

export function useRootNavigation() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateRoot = useCallback(
    <Route extends keyof RootStackParamList>(
      name: Route,
      params?: RootStackParamList[Route]
    ) => {
      let nav: NavigationProp<Record<string, object | undefined>> | undefined = navigation;
      while (nav) {
        const state = nav.getState();
        const names = state?.routeNames ?? [];
        if (names.includes(name as string)) {
          // @ts-expect-error nested navigator
          nav.navigate(name, params);
          return true;
        }
        nav = nav.getParent() as typeof nav | undefined;
      }
      return false;
    },
    [navigation]
  );

  return { navigateRoot, navigation };
}
