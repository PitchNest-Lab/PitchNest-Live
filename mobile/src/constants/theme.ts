/** Aurora Boardroom — premium gradient auth + refined light app + dark live room */
export const colors = {
  // Brand
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  accent: '#22d3ee',
  accentWarm: '#f59e0b',

  // Surfaces (light app)
  background: '#f4f6fb',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  text: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  // Live room (dark)
  roomBg: '#0b1020',
  roomSurface: '#151d33',
  roomBorder: '#2a3654',
  roomText: '#f8fafc',
  roomMuted: '#94a3b8',

  // Semantic
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',

  // Auth gradient stops
  gradientStart: '#1e1b4b',
  gradientMid: '#312e81',
  gradientEnd: '#0e7490',
};

export const gradients = {
  auth: ['#1e1b4b', '#4338ca', '#0e7490'] as const,
  hero: ['#4f46e5', '#7c3aed', '#0891b2'] as const,
  cta: ['#6366f1', '#4f46e5'] as const,
  live: ['#0b1020', '#151d33'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: '#312e81',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const typography = {
  hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '500' as const },
  label: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
};
