import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('servex_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('servex_token');
      // Emit a custom event so AuthContext can react
      window.dispatchEvent(new Event('servex:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
