import axios from './axiosInstance';
import { User } from '../types';
import { saveToken, removeToken } from '../utils/localStorage';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post('/auth/login', { email, password });
    if (response.data.token) {
      saveToken(response.data.token);
    }
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await axios.post('/auth/register', { email, password, name });
    if (response.data.token) {
      saveToken(response.data.token);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get('/auth/check-auth');
    return response.data.user;
  },

  logout: () => {
    removeToken();
  },
};
