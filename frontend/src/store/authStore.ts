

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/api';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
}

/**
 * Zustand store for authentication state management.
 * 
 * Persists auth data to localStorage automatically.
 * Handles login, registration, logout, and token management.
 */
export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const tokenRes = await apiClient.post('/auth/login', { email, password });
          const { access_token } = tokenRes.data;
          // Store token first so the /me request is authenticated
          set({ accessToken: access_token });
          const meRes = await apiClient.get('/auth/me');
          set({ user: meRes.data, isLoading: false, error: null });
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.detail || 'Login failed. Please try again.';
          set({ isLoading: false, error: errorMessage, user: null, accessToken: null });
          throw err;
        }
      },

      register: async (email: string, password: string, username: string, firstName: string, lastName: string) => {
        set({ isLoading: true, error: null });
        try {
          const tokenRes = await apiClient.post('/auth/register', {
            email,
            password,
            username,
            first_name: firstName,
            last_name: lastName,
            skills: [],
          });
          const { access_token } = tokenRes.data;
          set({ accessToken: access_token });
          const meRes = await apiClient.get('/auth/me');
          set({ user: meRes.data, isLoading: false, error: null });
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.detail || 'Registration failed. Please try again.';
          set({ isLoading: false, error: errorMessage, user: null, accessToken: null });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

/**
 * Custom hook wrapper for auth store
 */
export const useAuth = () => {
  return authStore();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const state = authStore.getState();
  return !!state.user && !!state.accessToken;
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return authStore.getState().user;
};

/**
 * Get access token
 */
export const getAccessToken = (): string | null => {
  return authStore.getState().accessToken;
};