import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';
import { storage } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setAuth: (user: User, token?: string) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,

      setAuth: (user, token) => {
        if (token) {
          storage.setToken(token);
        }
        storage.setUser(user);
        set({
          user,
          token: token || storage.getToken(),
          isAuthenticated: true,
          isInitialized: true,
        });
      },

      updateUser: (partial) => {
        set((state) => {
          if (!state.user) return state;
          const updated = { ...state.user, ...partial };
          storage.setUser(updated);
          return { user: updated };
        });
      },

      logout: () => {
        storage.clearAll();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      },

      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: 'travellako_auth_store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
