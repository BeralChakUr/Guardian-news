import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EntryType =
  | 'qualification'
  | 'containment'
  | 'obligation'
  | 'export'
  | 'manual'
  | 'system';

export interface MainCouranteEntry {
  id: string;
  timestamp: string;
  /** Auteur de l'entrée (par défaut nom de la fonction ou "Système") */
  author: string;
  /** Type d'événement pour le filtrage UI */
  type: EntryType;
  description: string;
  /** Machines / comptes / services concernés */
  scope?: string;
  /** true si l'entrée a été créée automatiquement par l'app */
  auto?: boolean;
}

interface MainCouranteState {
  entries: MainCouranteEntry[];
  addEntry: (entry: Omit<MainCouranteEntry, 'id' | 'timestamp' | 'type'> & { type?: EntryType }) => void;
  removeEntry: (id: string) => void;
  clear: () => void;
}

// Mapping auteur → type (pour retrocompatibilité)
function inferType(author: string): EntryType {
  const lower = author.toLowerCase();
  if (lower.includes('qualif')) return 'qualification';
  if (lower.includes('endig') || lower.includes('contain')) return 'containment';
  if (lower.includes('obligat')) return 'obligation';
  if (lower.includes('export')) return 'export';
  if (lower.includes('système') || lower.includes('system')) return 'system';
  return 'manual';
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
              type: entry.type ?? inferType(entry.author),
              id:
                typeof crypto !== 'undefined' && 'randomUUID' in crypto
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

// Métadonnées des types pour l'UI
export const ENTRY_TYPE_META: Record<EntryType, { label: string; color: string }> = {
  qualification: { label: 'Qualification', color: 'cyan' },
  containment: { label: 'Endiguement', color: 'orange' },
  obligation: { label: 'Obligation', color: 'red' },
  export: { label: 'Export', color: 'emerald' },
  manual: { label: 'Manuel', color: 'slate' },
  system: { label: 'Système', color: 'slate' },
};
