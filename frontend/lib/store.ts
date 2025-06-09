
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description?: string;
  status: string;
  createdAt: string;
}

export interface CardStatus {
  status: 'frozen' | 'authorized';
  expiresAt?: string;
  authorizedAmount?: number;
  authorizedCategory?: string;
}

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  
  // App state
  budgets: Budget[];
  transactions: Transaction[];
  cardStatus: CardStatus | null;
  
  // UI state
  currentScreen: 'intro' | 'home' | 'authorize' | 'success' | 'post-purchase' | 'history' | 'profile';
  isLoading: boolean;
  error: string | null;
  introCompleted: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setBudgets: (budgets: Budget[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setCardStatus: (status: CardStatus | null) => void;
  setCurrentScreen: (screen: AppState['currentScreen']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIntroCompleted: (completed: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      budgets: [],
      transactions: [],
      cardStatus: null,
      currentScreen: 'home',
      isLoading: false,
      error: null,
      introCompleted: false,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setBudgets: (budgets) => set({ budgets }),
      setTransactions: (transactions) => set({ transactions }),
      setCardStatus: (cardStatus) => set({ cardStatus }),
      setCurrentScreen: (currentScreen) => set({ currentScreen }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setIntroCompleted: (introCompleted) => set({ introCompleted }),
      logout: () => set({
        user: null,
        isAuthenticated: false,
        budgets: [],
        transactions: [],
        cardStatus: null,
        currentScreen: 'home',
        introCompleted: false
      }),
    }),
    {
      name: 'finlock-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        introCompleted: state.introCompleted
      }),
    }
  )
);
