import axios from 'axios';

// Agar environment variable nahi milta, toh default backend URL use karega
const API_BASE = process.env.REACT_APP_API_URL || 'https://cityart-backend.onrender.com';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Har request mein token check karega (Admin routes ke liye)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;