import api from './api';
import type { AuthResponse, User } from '@/types';

export interface LoginPayload {
  whatsapp: string;
}

export interface VerifyPayload {
  whatsapp: string;
  codigo: string;
}

export interface RegisterPayload {
  nome: string;
  whatsapp: string;
}

export const authService = {
  requestCode: async (payload: LoginPayload) => {
    const { data } = await api.post<{ message: string }>('/api/auth/login', payload);
    return data;
  },

  verifyCode: async (payload: VerifyPayload) => {
    const { data } = await api.post<AuthResponse>('/api/auth/verify', payload);
    return data;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<{ id: string; whatsapp: string; nome: string }>('/api/auth/register', payload);
    return data;
  },

  me: async () => {
    const { data } = await api.get<User & { isAdmin: boolean }>('/api/auth/me');
    return data;
  }
};
