import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, UserRole } from "@/lib/types";

interface AuthState {
  token: string | null;
  userId: number | null;
  name: string | null;
  email: string | null;
  role: UserRole | null;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      name: null,
      email: null,
      role: null,
      setSession: (auth) =>
        set({
          token: auth.token,
          userId: auth.userId,
          name: auth.name,
          email: auth.email,
          role: auth.role,
        }),
      clearSession: () =>
        set({ token: null, userId: null, name: null, email: null, role: null }),
    }),
    { name: "lv-auth" },
  ),
);

export const useIsAuthenticated = () => useAuthStore((s) => s.token !== null);
export const useIsAdmin = () => useAuthStore((s) => s.role === "ADMIN");
