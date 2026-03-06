import { create } from 'zustand';
import apiClient from '../api/client';
export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/api/auth/login', { email, password });
            const data = response.data;
            apiClient.setTokens(data.accessToken, data.refreshToken);
            set({ user: data.user, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
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
            const response = await apiClient.get('/api/auth/me');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
            set({ isLoading: false });
            apiClient.clearTokens();
        }
    },
    clearError: () => set({ error: null }),
}));
