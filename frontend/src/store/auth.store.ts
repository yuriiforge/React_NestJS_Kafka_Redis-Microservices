import { create } from 'zustand';

function decodeRole(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;

  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

const storedToken = localStorage.getItem('accessToken');

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: storedToken,
  refreshToken: localStorage.getItem('refreshToken'),
  role: decodeRole(storedToken),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken, role: decodeRole(accessToken) });
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ accessToken: null, refreshToken: null, role: null });
  },

  isAuthenticated: () => !!get().accessToken,
  isAdmin: () => get().role === 'ADMIN',
}));
