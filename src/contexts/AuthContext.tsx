/**
 * AuthContext.tsx - Contexto de Autenticação
 */

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  requestLoginCode: (whatsapp: string) => Promise<{ error: Error | null }>;
  verifyCode: (whatsapp: string, codigo: string) => Promise<{ error: Error | null; user?: User }>;
  registerUser: (payload: { nome: string; whatsapp: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    let active = true;

    authService.me()
      .then((data) => {
        if (!active) return;
        setUser({
          id: data.id,
          nome: data.nome,
          whatsapp: data.whatsapp,
          role: data.role
        });
        setIsAdmin(data.isAdmin);
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        if (active) {
          setUser(null);
          setIsAdmin(false);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const requestLoginCode = async (whatsapp: string) => {
    try {
      await authService.requestCode({ whatsapp });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyCode = async (whatsapp: string, codigo: string) => {
    try {
      const data = await authService.verifyCode({ whatsapp, codigo });
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      setIsAdmin(data.user.isAdmin ?? data.user.role === 'ADMIN');
      return { error: null, user: data.user };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const registerUser = async (payload: { nome: string; whatsapp: string }) => {
    try {
      await authService.register(payload);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAdmin(false);
  };

  const value = useMemo(
    () => ({ user, isAdmin, isLoading, requestLoginCode, verifyCode, registerUser, signOut }),
    [user, isAdmin, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
