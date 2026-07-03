import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
}

interface AdminAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AdminUser | null;
  setAuth: (accessToken: string, refreshToken: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'admin-auth-storage' }
  )
);

export function useAdminAuth() {
  return useAdminAuthStore();
}
