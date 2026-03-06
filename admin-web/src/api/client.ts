import axios, { AxiosInstance } from 'axios';

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

class ApiClient {
  private client: AxiosInstance;
  accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: ApiConfig) {
    this.client = axios.create(config);

    this.client.interceptors.request.use((request) => {
      if (this.accessToken) {
        request.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return request;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          originalRequest._retry = true;

          try {
            const response = await this.refreshAccessToken();
            this.setTokens(response.accessToken, response.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  loadTokens(): void {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private async refreshAccessToken() {
    const response = await this.client.post('/api/auth/refresh', {
      refreshToken: this.refreshToken,
    });
    return response.data;
  }

  async get<T>(url: string) {
    return this.client.get<T>(url);
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  async delete<T>(url: string) {
    return this.client.delete<T>(url);
  }

  async request<T>(config: any) {
    return this.client.request<T>(config);
  }
}

const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
});

export default apiClient;
