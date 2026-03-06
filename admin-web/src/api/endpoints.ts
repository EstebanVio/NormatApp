import apiClient from './client';
import { AuthResponse, User } from '../types';

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/api/auth/login', { email, password }),

  register: (email: string, name: string, password: string) =>
    apiClient.post<AuthResponse>('/api/auth/register', { email, name, password }),

  getCurrentUser: () => apiClient.get<User>('/api/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/api/auth/change-password', { currentPassword, newPassword }),
};

export const remitosAPI = {
  createRemito: (formData: FormData) =>
    apiClient.post('/api/remitos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getRemitos: (estado?: string, transporteId?: string, page = 1, limit = 20) =>
    apiClient.get(`/api/remitos?estado=${estado || ''}&transporteId=${transporteId || ''}&page=${page}&limit=${limit}`),

  getRemitoById: (id: string) => apiClient.get(`/api/remitos/${id}`),

  assignRemito: (remitoId: string, transporteId: string) =>
    apiClient.post(`/api/remitos/${remitoId}/assign`, { transporteId }),

  deleteRemito: (remitoId: string) => apiClient.delete(`/api/remitos/${remitoId}`),
};

export const entregasAPI = {
  getByRemito: (remitoId: string) =>
    apiClient.get(`/api/entregas/remito/${remitoId}`),

  getById: (id: string) => apiClient.get(`/api/entregas/${id}`),
};

export const transportesAPI = {
  createTransporte: (nombre: string) =>
    apiClient.post('/api/transportes', { nombre }),

  getTransportes: (activos = true) =>
    apiClient.get(`/api/transportes?activos=${activos}`),

  getById: (id: string) => apiClient.get(`/api/transportes/${id}`),

  updateTransporte: (id: string, nombre?: string, activo?: boolean) =>
    apiClient.put(`/api/transportes/${id}`, { nombre, activo }),

  deleteTransporte: (id: string) => apiClient.delete(`/api/transportes/${id}`),

  assignDriver: (transporteId: string, usuarioId: string) =>
    apiClient.post('/api/transportes/asignar-conductor', { transporteId, usuarioId }),
};

export const usersAPI = {
  createUser: (email: string, name: string, password: string, role: string, transporteId?: string) =>
    apiClient.post('/api/users', { email, name, password, role, transporteId }),

  getUsers: (page = 1, limit = 20) =>
    apiClient.get(`/api/users?page=${page}&limit=${limit}`),

  getById: (id: string) => apiClient.get(`/api/users/${id}`),

  updateUser: (id: string, data: any) =>
    apiClient.put(`/api/users/${id}`, data),

  deleteUser: (id: string) => apiClient.delete(`/api/users/${id}`),

  changeRole: (id: string, nuevoRol: string) =>
    apiClient.post(`/api/users/${id}/cambiar-rol`, { nuevoRol }),
};
