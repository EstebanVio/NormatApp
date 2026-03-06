import axios from 'axios';
class ApiClient {
    constructor(config) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "accessToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "refreshToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.client = axios.create(config);
        this.client.interceptors.request.use((request) => {
            if (this.accessToken) {
                request.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return request;
        });
        this.client.interceptors.response.use((response) => response, async (error) => {
            const originalRequest = error.config;
            if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
                originalRequest._retry = true;
                try {
                    const response = await this.refreshAccessToken();
                    this.setTokens(response.accessToken, response.refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                    return this.client(originalRequest);
                }
                catch (refreshError) {
                    this.clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        });
    }
    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
    loadTokens() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }
    async refreshAccessToken() {
        const response = await this.client.post('/api/auth/refresh', {
            refreshToken: this.refreshToken,
        });
        return response.data;
    }
    async get(url) {
        return this.client.get(url);
    }
    async post(url, data, config) {
        return this.client.post(url, data, config);
    }
    async put(url, data, config) {
        return this.client.put(url, data, config);
    }
    async delete(url) {
        return this.client.delete(url);
    }
    async request(config) {
        return this.client.request(config);
    }
}
const apiClient = new ApiClient({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    timeout: 30000,
});
export default apiClient;
