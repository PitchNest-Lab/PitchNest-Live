import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { apiPath } from '../config/env';
import { authRequest, AuthTimeoutError } from '../lib/authApi';
import { storage } from '../lib/storage';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (path: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  const clearSession = useCallback(async () => {
    tokenRef.current = null;
    setUser(null);
    setToken(null);
    await storage.clearAuth();
  }, []);

  const persistSession = useCallback(async (nextUser: User, nextToken: string) => {
    tokenRef.current = nextToken;
    setUser(nextUser);
    setToken(nextToken);
    await Promise.all([storage.setUserJson(nextUser), storage.setToken(nextToken)]);
  }, []);

  const validateToken = useCallback(async (storedToken: string) => {
    const res = await authRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` },
    });
    return res.ok;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUserJson();
        if (!storedToken || !storedUser) return;

        tokenRef.current = storedToken;
        setToken(storedToken);
        setUser(storedUser);

        validateToken(storedToken)
          .then((valid) => {
            if (!valid) clearSession();
          })
          .catch(() => {});
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession, validateToken]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active' || !tokenRef.current) return;
      try {
        const valid = await validateToken(tokenRef.current);
        if (!valid) await clearSession();
      } catch {
        // ignore offline
      }
    });
    return () => sub.remove();
  }, [clearSession, validateToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await authRequest('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        await persistSession(data.user, data.token);
      } catch (err) {
        if (err instanceof AuthTimeoutError) throw err;
        throw err instanceof Error ? err : new Error('Login failed');
      }
    },
    [persistSession]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const res = await authRequest('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        await persistSession(data.user, data.token);
      } catch (err) {
        if (err instanceof AuthTimeoutError) throw err;
        throw err instanceof Error ? err : new Error('Signup failed');
      }
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const currentToken = tokenRef.current || (await storage.getToken());
      const headers = new Headers(options.headers || {});
      if (currentToken) headers.set('Authorization', `Bearer ${currentToken}`);
      const res = await fetch(apiPath(path), { ...options, headers });
      if (res.status === 401) await clearSession();
      return res;
    },
    [clearSession]
  );

  const value = useMemo(
    () => ({ user, token, isLoading, login, signup, logout, authFetch }),
    [user, token, isLoading, login, signup, logout, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
