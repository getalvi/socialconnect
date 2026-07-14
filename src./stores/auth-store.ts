import { create } from 'zustand';

interface AuthState {
  user: { id: string; email: string; name: string | null; role: string; avatar: string | null } | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, refreshToken: string, user: AuthState['user']) => void;
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('sc_token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('sc_refresh_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('sc_token') : false,
  loading: true,

  login: (token, refreshToken, user) => {
    localStorage.setItem('sc_token', token);
    localStorage.setItem('sc_refresh_token', refreshToken);
    set({ token, refreshToken, user, isAuthenticated: true, loading: false });
  },

  logout: () => {
    localStorage.removeItem('sc_token');
    localStorage.removeItem('sc_refresh_token');
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false, loading: false });
  },

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));