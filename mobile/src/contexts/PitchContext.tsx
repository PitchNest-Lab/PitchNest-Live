import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PitchConfig } from '../types';

interface PitchContextType {
  pitchConfig: PitchConfig | null;
  setPitchConfig: (config: PitchConfig | null) => void;
}

const PitchContext = createContext<PitchContextType | undefined>(undefined);

export function PitchProvider({ children }: { children: React.ReactNode }) {
  const [pitchConfig, setPitchConfig] = useState<PitchConfig | null>(null);
  const value = useMemo(() => ({ pitchConfig, setPitchConfig }), [pitchConfig]);
  return <PitchContext.Provider value={value}>{children}</PitchContext.Provider>;
}

export function usePitchConfig() {
  const ctx = useContext(PitchContext);
  if (!ctx) throw new Error('usePitchConfig must be used within PitchProvider');
  return ctx;
}
