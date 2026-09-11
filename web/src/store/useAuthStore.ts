import { create } from 'zustand';
import { User } from '@/types';

// Single Responsibility: Store chỉ quản lý Auth state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Mặc định là true khi mới load app để check auth
  login: (userData) => set({ user: userData, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (status) => set({ isLoading: status }),
}));
