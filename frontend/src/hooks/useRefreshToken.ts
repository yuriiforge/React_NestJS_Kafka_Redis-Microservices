import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';

interface JwtPayload {
  sub: string;
  exp: number;
}

export const useRefreshToken = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clearTokens = useAuthStore((s) => s.clearTokens);

  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const { sub: userId, exp } = jwtDecode<JwtPayload>(accessToken);
    const delay = exp * 1000 - Date.now() - 60_000;

    const refresh = async () => {
      try {
        const { data } = await authApi.refresh(userId, refreshToken);
        setTokens(data.accessToken, data.refreshToken);
      } catch {
        clearTokens();
      }
    };

    if (delay <= 0) {
      refresh();
      return;
    }

    const timer = setTimeout(refresh, delay);
    return () => clearTimeout(timer);
  }, [accessToken, refreshToken, setTokens, clearTokens]);
};
