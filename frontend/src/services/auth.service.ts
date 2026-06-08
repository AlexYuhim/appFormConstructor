export const authService = {
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  setToken: (token: string): void => {
    localStorage.setItem("token", token);
  },

  removeToken: (): void => {
    localStorage.removeItem("token");
  },

  getAdmin: () => {
    const admin = localStorage.getItem("admin");
    return admin ? JSON.parse(admin) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};
