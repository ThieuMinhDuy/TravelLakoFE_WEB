import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '../types/user';
import { authStorage, storage } from '../utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  /** remember: true → lưu lâu dài (localStorage), false → chỉ trong phiên trình duyệt */
  setAuth: (user: User, token?: string, remember?: boolean) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,

      setAuth: (user, token, remember) => {
        // Phải đặt cờ trước khi set() để persist ghi vào đúng nơi lưu trữ
        if (remember !== undefined) storage.setRemembered(remember);
        set({
          user,
          token: token ?? get().token,
          isAuthenticated: true,
          isInitialized: true,
        });
      },

      updateUser: (partial) =>
        set((state) => (state.user ? { user: { ...state.user, ...partial } } : state)),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        }),

      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: 'tripmate_auth',
      storage: createJSONStorage(() => authStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
