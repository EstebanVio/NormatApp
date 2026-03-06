import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Bypass-Tunnel-Reminder': 'true',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),
};

export const remitosAPI = {
  getRemitos: () =>
    apiClient.get('/api/remitos?page=1&limit=100'),

  getRemitoById: (id: string) =>
    apiClient.get(`/api/remitos/${id}`),
};

export const entregasAPI = {
  register: (data: {
    remitoId: string;
    nombreReceptor: string;
    firmaBase64: string;
    fotoBase64?: string;
    lat: number;
    lng: number;
  }) => apiClient.post('/api/entregas', data),
};

export default apiClient;
