import { create } from 'zustand';

interface StoreState {
  user: any | null;
  darkMode: boolean;
  cachedProfile: { email: string; name: string; avatar_url?: string } | null;
  selectedTimeframe: string;
  customDateRange: { start: Date; end: Date } | null;
  selectedSchoolTypes: string[];
  setUser: (user: any | null) => void;
  setCachedProfile: (profile: { email: string; name: string; avatar_url?: string } | null) => void;
  toggleDarkMode: () => void;
  setSelectedTimeframe: (timeframe: string) => void;
  setCustomDateRange: (dateRange: { start: Date; end: Date } | null) => void;
  setSelectedSchoolTypes: (types: string[]) => void;
  clearState: () => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  cachedProfile: null,
  darkMode: false,
  selectedTimeframe: 'day',
  customDateRange: null,
  selectedSchoolTypes: ['elementary', 'middle', 'high', 'k8', 'k12'],
  setUser: (user) => set({ user }),
  setCachedProfile: (profile) => set({ cachedProfile: profile }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setCustomDateRange: (dateRange) => set({ customDateRange: dateRange }),
  setSelectedSchoolTypes: (types) => set({ selectedSchoolTypes: types }),
  clearState: () => set({ user: null }),
}));