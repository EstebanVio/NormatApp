import { create } from 'zustand';
import { Remito } from '../types';

interface RemitoStore {
  remitos: Remito[];
  selectedRemito: Remito | null;
  isLoading: boolean;
  error: string | null;

  setRemitos: (remitos: Remito[]) => void;
  selectRemito: (remito: Remito | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRemitoStore = create<RemitoStore>((set) => ({
  remitos: [],
  selectedRemito: null,
  isLoading: false,
  error: null,

  setRemitos: (remitos) => set({ remitos }),
  selectRemito: (remito) => set({ selectedRemito: remito }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
