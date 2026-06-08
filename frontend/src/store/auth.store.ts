import { create } from "zustand";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  admin: JSON.parse(localStorage.getItem("admin") || "null"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,

  setAuth: (token: string, admin: Admin) => {
    localStorage.setItem("token", token);
    localStorage.setItem("admin", JSON.stringify(admin));
    set({ token, admin, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    set({ token: null, admin: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    set({
      token,
      admin,
      isAuthenticated: !!token,
    });
  },
}));
