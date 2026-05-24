import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import api from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login", { email, password });
          console.log('API response:', JSON.stringify(response.data));
          const { accessToken: token, user } = response.data.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("lumiere_token", token);
            document.cookie = `lumiere_role=${user.role}; path=/; max-age=2592000`;
          }
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async (credential: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/google", { credential });
          const { accessToken: token, user } = response.data.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("lumiere_token", token);
            document.cookie = `lumiere_role=${user.role}; path=/; max-age=2592000`;
          }
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/register", {
            name,
            email,
            password,
          });
          const { accessToken: token, user } = response.data.data;

          if (typeof window !== "undefined") {
            localStorage.setItem("lumiere_token", token);
            document.cookie = `lumiere_role=${user.role}; path=/; max-age=2592000`;

            // For register, we might want to stay or go to login depends on UI, 
            // but the user suggested register might have the same mismatch.
            // I'll update the structure fix but keep the redirect to /login as per previous requirement?
            // Wait, the user said "After saving, redirect based on role" in the LOGIN context.
            // For register, I'll just fix the data read.
          }
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout failed", error);
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem("lumiere_token");
          document.cookie = "lumiere_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/";
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("lumiere_token");
          console.log('checkAuth - token found:', !!token);

          if (token) {
            set({ token, isAuthenticated: true });

            try {
              const response = await api.get("/auth/me");
              console.log('checkAuth - /me response data:', response.data);
              set({ user: response.data.user, isAuthenticated: true });
            } catch (error: any) {
              console.log('checkAuth - /me error:', error.response?.data || error.message);
              localStorage.removeItem("lumiere_token");
              document.cookie = "lumiere_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              set({ user: null, token: null, isAuthenticated: false });
            }
          } else {
            set({ isAuthenticated: false });
          }
        }
      },

      setUser: (user) => set({ user }),
    }),
    { name: "lumiere-auth" }
  )
);