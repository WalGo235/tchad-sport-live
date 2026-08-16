import { create } from 'zustand';

export const useAppStore = create((set) => ({
  user: null,
  favorites: [],
  matches: [],
  teams: [],
  news: [],
  standings: [],
  
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
}));
