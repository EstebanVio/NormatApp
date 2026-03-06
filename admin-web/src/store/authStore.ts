import { create } from 'zustand';
import { User } from '../types';
import apiClient from '../api/client';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<any>('/api/auth/login', { email, password });
      const data = response.data as any;
      apiClient.setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    apiClient.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  loadCurrentUser: async () => {
    set({ isLoading: true });
    try {
      apiClient.loadTokens();
      if (!apiClient.accessToken) {
        set({ isLoading: false });
        return;
      }
      const response = await apiClient.get<User>('/api/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      apiClient.clearTokens();
    }
  },

  clearError: () => set({ error: null }),
}));
