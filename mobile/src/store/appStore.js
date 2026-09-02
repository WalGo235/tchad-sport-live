import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create(
  persist(
    (set) => ({
      user: null,
      favorites: [],
      matches: [],
      teams: [],
      news: [],
      standings: [],
      darkMode: false,
      darkModeInitialized: false,

      setUser: (user) => set({ user }),
      addFavorite: (teamId) => set((state) => ({
        favorites: [...new Set([...state.favorites, teamId])],
      })),
      removeFavorite: (teamId) => set((state) => ({
        favorites: state.favorites.filter(id => id !== teamId),
      })),
      setMatches: (matches) => set({ matches }),
      setTeams: (teams) => set({ teams }),
      setNews: (news) => set({ news }),
      setStandings: (standings) => set({ standings }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setDarkModeInitialized: (darkModeInitialized) => set({ darkModeInitialized }),
    }),
    {
      name: 'tchadsportlive-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        darkMode: state.darkMode,
        darkModeInitialized: state.darkModeInitialized,
      }),
    }
  )
);