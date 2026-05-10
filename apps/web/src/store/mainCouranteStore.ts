import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MainCouranteEntry {
  id: string;
  timestamp: string;
  author: string;
  description: string;
  scope?: string; // machines / comptes concernés
  auto?: boolean;
}

interface MainCouranteState {
  entries: MainCouranteEntry[];
  addEntry: (entry: Omit<MainCouranteEntry, 'id' | 'timestamp'>) => void;
  removeEntry: (id: string) => void;
  clear: () => void;
}

export const useMainCouranteStore = create<MainCouranteState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              timestamp: new Date().toISOString(),
            },
          ],
        })),
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      clear: () => set({ entries: [] }),
    }),
    { name: 'guardian-main-courante' }
  )
);
