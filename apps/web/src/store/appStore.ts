import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isDarkMode: boolean;
  language: 'fr' | 'en';
  mode: 'public' | 'pro';
  favorites: string[];
  readLater: string[];
  toggleDarkMode: () => void;
  setLanguage: (lang: 'fr' | 'en') => void;
  setMode: (mode: 'public' | 'pro') => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  addReadLater: (id: string) => void;
  removeReadLater: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      language: 'fr',
      mode: 'public',
      favorites: [],
      readLater: [],
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setLanguage: (language) => set({ language }),
      setMode: (mode) => set({ mode }),
      addFavorite: (id) => set((state) => ({ favorites: [...state.favorites, id] })),
      removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter(f => f !== id) })),
      addReadLater: (id) => set((state) => ({ readLater: [...state.readLater, id] })),
      removeReadLater: (id) => set((state) => ({ readLater: state.readLater.filter(r => r !== id) })),
    }),
    {
      name: 'guardian-storage',
    }
  )
);
