import axios from 'axios';

// Base API robusta para dev/prod. En el navegador siempre vamos contra la
// misma origen (/api) porque nginx — sea el reverse_proxy del VPS o el del
// frontend container — está proxyando /api → backend:5000. Sólo cuando el
// build es SSR / Node (no hay window) caemos al host docker interno.
let API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  API_BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://backend:5000/api';
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
