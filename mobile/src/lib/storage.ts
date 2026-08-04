import * as SecureStore from 'expo-secure-store';

const KEYS = {
  token: 'pitchnest_token',
  user: 'pitchnest_user',
  onboardingComplete: 'pitchnest_onboarding_complete',
  startupName: 'pitchnest_startup_name',
} as const;

async function setItem(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  await SecureStore.deleteItemAsync(key);
}

export const storage = {
  async getToken() {
    return getItem(KEYS.token);
  },
  async setToken(token: string) {
    await setItem(KEYS.token, token);
  },
  async getUserJson() {
    const raw = await getItem(KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  async setUserJson(user: object) {
    await setItem(KEYS.user, JSON.stringify(user));
  },
  async isOnboardingComplete() {
    return (await getItem(KEYS.onboardingComplete)) === 'true';
  },
  async setOnboardingComplete(value: boolean) {
    await setItem(KEYS.onboardingComplete, value ? 'true' : 'false');
  },
  async getStartupName() {
    return getItem(KEYS.startupName);
  },
  async setStartupName(name: string) {
    await setItem(KEYS.startupName, name);
  },
  async clearAuth() {
    await Promise.all([removeItem(KEYS.token), removeItem(KEYS.user)]);
  },
  async clearAll() {
    await Promise.all(Object.values(KEYS).map(removeItem));
  },
};
