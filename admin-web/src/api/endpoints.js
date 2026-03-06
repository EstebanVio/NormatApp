import apiClient from './client';
export const authAPI = {
    login: (email, password) => apiClient.post('/api/auth/login', { email, password }),
    register: (email, name, password) => apiClient.post('/api/auth/register', { email, name, password }),
    getCurrentUser: () => apiClient.get('/api/auth/me'),
    changePassword: (currentPassword, newPassword) => apiClient.post('/api/auth/change-password', { currentPassword, newPassword }),
};
export const remitosAPI = {
    createRemito: (formData) => apiClient.post('/api/remitos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getRemitos: (estado, transporteId, page = 1, limit = 20) => apiClient.get(`/api/remitos?estado=${estado || ''}&transporteId=${transporteId || ''}&page=${page}&limit=${limit}`),
    getRemitoById: (id) => apiClient.get(`/api/remitos/${id}`),
    assignRemito: (remitoId, transporteId) => apiClient.post(`/api/remitos/${remitoId}/assign`, { transporteId }),
    deleteRemito: (remitoId) => apiClient.delete(`/api/remitos/${remitoId}`),
};
export const entregasAPI = {
    getByRemito: (remitoId) => apiClient.get(`/api/entregas/remito/${remitoId}`),
    getById: (id) => apiClient.get(`/api/entregas/${id}`),
};
export const transportesAPI = {
    createTransporte: (nombre) => apiClient.post('/api/transportes', { nombre }),
    getTransportes: (activos = true) => apiClient.get(`/api/transportes?activos=${activos}`),
    getById: (id) => apiClient.get(`/api/transportes/${id}`),
    updateTransporte: (id, nombre, activo) => apiClient.put(`/api/transportes/${id}`, { nombre, activo }),
    deleteTransporte: (id) => apiClient.delete(`/api/transportes/${id}`),
    assignDriver: (transporteId, usuarioId) => apiClient.post('/api/transportes/asignar-conductor', { transporteId, usuarioId }),
};
export const usersAPI = {
    createUser: (email, name, password, role, transporteId) => apiClient.post('/api/users', { email, name, password, role, transporteId }),
    getUsers: (page = 1, limit = 20) => apiClient.get(`/api/users?page=${page}&limit=${limit}`),
    getById: (id) => apiClient.get(`/api/users/${id}`),
    updateUser: (id, data) => apiClient.put(`/api/users/${id}`, data),
    deleteUser: (id) => apiClient.delete(`/api/users/${id}`),
    changeRole: (id, nuevoRol) => apiClient.post(`/api/users/${id}/cambiar-rol`, { nuevoRol }),
};
