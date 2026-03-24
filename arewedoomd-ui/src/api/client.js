import axios from 'axios';

// Dev'de Vite proxy üzerinden gider (/api → https://localhost:7118/api)
// Prod'da VITE_API_BASE_URL set edilmeli
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — only redirect if the user had a token (expired session)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('accessToken')) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
