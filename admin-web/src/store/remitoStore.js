import { create } from 'zustand';
export const useRemitoStore = create((set) => ({
    remitos: [],
    selectedRemito: null,
    isLoading: false,
    error: null,
    setRemitos: (remitos) => set({ remitos }),
    selectRemito: (remito) => set({ selectedRemito: remito }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
}));
