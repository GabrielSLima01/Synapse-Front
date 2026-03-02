import axios from 'axios';

// Create Axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Auto-logout on 401
    // if (error.response?.status === 401) {
    //   localStorage.removeItem('auth_token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default api;
