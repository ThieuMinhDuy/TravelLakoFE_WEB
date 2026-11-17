import { create } from 'zustand';

interface UIState {
  adminSidebarCollapsed: boolean;
  toggleAdminSidebar: () => void;
  setAdminSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  adminSidebarCollapsed: false,
  toggleAdminSidebar: () =>
    set((state) => ({ adminSidebarCollapsed: !state.adminSidebarCollapsed })),
  setAdminSidebarCollapsed: (collapsed) =>
    set({ adminSidebarCollapsed: collapsed }),
}));
