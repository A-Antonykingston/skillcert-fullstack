import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('auth/login/', { email, password });
      const { tokens, user } = response.data;

      localStorage.setItem('token', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);

      set({
        user,
        token: tokens.access,
        refreshToken: tokens.refresh,
        isAuthenticated: true,
        loading: false,
      });
      return true;
    } catch (err) {
      const data = err.response?.data;
      let errorMsg = 'Login failed. Please check your credentials.';
      if (data) {
        if (data.non_field_errors) {
          errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
      }
      set({ error: errorMsg, loading: false });
      return false;
    }
  },

  register: async ({ email, password, password_confirm, first_name, last_name }) => {
    set({ loading: true, error: null });
    try {
      // Generate a username from the email (part before @)
      const username = email.split('@')[0] + '_' + Date.now().toString(36);

      const response = await api.post('auth/register/', {
        email,
        password,
        password_confirm,
        first_name,
        last_name,
        username,
      });

      // Registration returns tokens too, but we redirect to login
      // so the user explicitly logs in
      set({ loading: false, error: null });
      return { success: true, message: response.data.message || 'Registration successful!' };
    } catch (err) {
      const data = err.response?.data;
      let errorMsg = 'Registration failed. Please try again.';
      if (data) {
        if (data.email) {
          errorMsg = Array.isArray(data.email) ? data.email[0] : data.email;
          // Make user-friendly message
          if (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('unique')) {
            errorMsg = 'An account with this email already exists.';
          }
        } else if (data.password_confirm) {
          errorMsg = Array.isArray(data.password_confirm) ? data.password_confirm[0] : data.password_confirm;
        } else if (data.password) {
          errorMsg = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.non_field_errors) {
          errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.username) {
          errorMsg = Array.isArray(data.username) ? data.username[0] : data.username;
        }
      }
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  logout: async () => {
    try {
      const refresh = get().refreshToken;
      if (refresh) {
        await api.post('auth/logout/', { refresh });
      }
    } catch {
      // Ignore errors during logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const response = await api.get('auth/profile/');
      set({ user: response.data });
    } catch (err) {
      // If unauthorized, token might be invalid
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
