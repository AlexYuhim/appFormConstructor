import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    token,
    admin,
    isAuthenticated,
    isLoading,
    setAuth,
    logout,
    checkAuth,
  } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      setAuth(data.token, data.admin);
      navigate("/admin");
      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.error || "Ошибка при входе в систему";
      return { success: false, error: message };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const data = await authApi.register(email, password, name);
      setAuth(data.token, data.admin);
      navigate("/admin");
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.error || "Ошибка при регистрации";
      return { success: false, error: message };
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return {
    token,
    admin,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: handleLogout,
  };
};
