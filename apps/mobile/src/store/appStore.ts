import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, News } from '../types';

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // User Mode
  isProMode: boolean;
  toggleProMode: () => void;
  
  // Favorites & Read Later
  favorites: string[];
  readLater: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  addReadLater: (id: string) => void;
  removeReadLater: (id: string) => void;
  
  // Progress
  progress: UserProgress;
  completeLesson: (lessonId: string) => void;
  addBadge: (badgeId: string) => void;
  updateStreak: () => void;
  addPoints: (points: number) => void;
  
  // Notifications
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  
  // Load saved state
  loadState: () => Promise<void>;
}

const defaultProgress: UserProgress = {
  completedLessons: [],
  badges: [],
  streak: 0,
  lastActivity: '',
  totalPoints: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  isDarkMode: true,
  toggleDarkMode: async () => {
    const newValue = !get().isDarkMode;
    set({ isDarkMode: newValue });
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(newValue));
  },
  
  // User Mode
  isProMode: false,
  toggleProMode: async () => {
    const newValue = !get().isProMode;
    set({ isProMode: newValue });
    await AsyncStorage.setItem('isProMode', JSON.stringify(newValue));
  },
  
  // Favorites
  favorites: [],
  addFavorite: async (id: string) => {
    const newFavorites = [...get().favorites, id];
    set({ favorites: newFavorites });
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  },
  removeFavorite: async (id: string) => {
    const newFavorites = get().favorites.filter(f => f !== id);
    set({ favorites: newFavorites });
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
  },
  
  // Read Later
  readLater: [],
  addReadLater: async (id: string) => {
    const newReadLater = [...get().readLater, id];
    set({ readLater: newReadLater });
    await AsyncStorage.setItem('readLater', JSON.stringify(newReadLater));
  },
  removeReadLater: async (id: string) => {
    const newReadLater = get().readLater.filter(r => r !== id);
    set({ readLater: newReadLater });
    await AsyncStorage.setItem('readLater', JSON.stringify(newReadLater));
  },
  
  // Progress
  progress: defaultProgress,
  completeLesson: async (lessonId: string) => {
    const current = get().progress;
    if (!current.completedLessons.includes(lessonId)) {
      const newProgress = {
        ...current,
        completedLessons: [...current.completedLessons, lessonId],
        totalPoints: current.totalPoints + 10,
        lastActivity: new Date().toISOString(),
      };
      set({ progress: newProgress });
      await AsyncStorage.setItem('progress', JSON.stringify(newProgress));
    }
  },
  addBadge: async (badgeId: string) => {
    const current = get().progress;
    if (!current.badges.includes(badgeId)) {
      const newProgress = {
        ...current,
        badges: [...current.badges, badgeId],
        totalPoints: current.totalPoints + 50,
      };
      set({ progress: newProgress });
      await AsyncStorage.setItem('progress', JSON.stringify(newProgress));
    }
  },
  updateStreak: async () => {
    const current = get().progress;
    const today = new Date().toDateString();
    const lastActivity = current.lastActivity ? new Date(current.lastActivity).toDateString() : '';
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let newStreak = current.streak;
    if (lastActivity === yesterday) {
      newStreak = current.streak + 1;
    } else if (lastActivity !== today) {
      newStreak = 1;
    }
    
    const newProgress = {
      ...current,
      streak: newStreak,
      lastActivity: new Date().toISOString(),
    };
    set({ progress: newProgress });
    await AsyncStorage.setItem('progress', JSON.stringify(newProgress));
  },
  addPoints: async (points: number) => {
    const current = get().progress;
    const newProgress = {
      ...current,
      totalPoints: current.totalPoints + points,
    };
    set({ progress: newProgress });
    await AsyncStorage.setItem('progress', JSON.stringify(newProgress));
  },
  
  // Notifications
  notificationsEnabled: true,
  toggleNotifications: async () => {
    const newValue = !get().notificationsEnabled;
    set({ notificationsEnabled: newValue });
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
  },
  
  // Load saved state
  loadState: async () => {
    try {
      const [isDarkMode, isProMode, favorites, readLater, progress, notificationsEnabled] = await Promise.all([
        AsyncStorage.getItem('isDarkMode'),
        AsyncStorage.getItem('isProMode'),
        AsyncStorage.getItem('favorites'),
        AsyncStorage.getItem('readLater'),
        AsyncStorage.getItem('progress'),
        AsyncStorage.getItem('notificationsEnabled'),
      ]);
      
      set({
        isDarkMode: isDarkMode !== null ? JSON.parse(isDarkMode) : true,
        isProMode: isProMode !== null ? JSON.parse(isProMode) : false,
        favorites: favorites !== null ? JSON.parse(favorites) : [],
        readLater: readLater !== null ? JSON.parse(readLater) : [],
        progress: progress !== null ? JSON.parse(progress) : defaultProgress,
        notificationsEnabled: notificationsEnabled !== null ? JSON.parse(notificationsEnabled) : true,
      });
    } catch (error) {
      console.error('Error loading state:', error);
    }
  },
}));
