import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { getToken } from '../utils/localStorage';

// В режиме разработки используем относительные пути
const isDevelopment = import.meta.env.MODE === 'development';
const API_BASE_URL = isDevelopment ? 'http://localhost:5000' : import.meta.env.VITE_API_URL;

console.log('[axios] Environment:', import.meta.env.MODE);
console.log('[axios] baseURL =', API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
  withCredentials: false, // Отключаем, так как используем Bearer токен
});

// Добавляем интерцепторы для логирования и токена
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('🚀 Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: {
        ...config.headers,
        Authorization: config.headers?.Authorization ? '[HIDDEN]' : undefined,
      },
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Если сервер вернул 401 или 403, очищаем состояние аутентификации
      if (error.response.status === 401 || error.response.status === 403) {
        // Проверяем, не является ли текущий URL страницей логина или регистрации
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
        store.dispatch(logout());
        window.location.href = '/login';
        }
      }
      console.error('❌ Response Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
 