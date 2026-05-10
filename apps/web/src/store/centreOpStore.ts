// Guardian News V4.1 — Centre Opérationnel : store du mode global (sans persistance)
import { create } from 'zustand';

export type OperationalMode = 'victim' | 'analyst';

interface CentreOpState {
  mode: OperationalMode;
  setMode: (m: OperationalMode) => void;
  toggleMode: () => void;
}

export const useCentreOpStore = create<CentreOpState>((set) => ({
  mode: 'victim',
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((s) => ({ mode: s.mode === 'victim' ? 'analyst' : 'victim' })),
}));
