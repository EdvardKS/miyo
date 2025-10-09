import axios from 'axios';

// Base API robusta para dev/prod: si estamos detrás de nginx usa "/api"
let API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  const isDockerNginx = typeof window !== 'undefined' && window.location.port === '3000';
  API_BASE_URL = isDockerNginx ? '/api' : 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;