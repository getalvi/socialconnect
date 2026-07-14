import { create } from 'zustand';

type ViewName = 'dashboard' | 'content' | 'media' | 'ai-studio' | 'schedule' | 'social' | 'analytics' | 'campaigns' | 'settings';

interface AppState {
  currentView: ViewName;
  sidebarOpen: boolean;
  setCurrentView: (view: ViewName) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  sidebarOpen: true,
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));