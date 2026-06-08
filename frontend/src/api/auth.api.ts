import client from "./client";

export interface LoginResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await client.post<LoginResponse>("/admin/auth/login", {
      email,
      password,
    });
    return data;
  },

  register: async (email: string, password: string, name: string) => {
    const { data } = await client.post<LoginResponse>("/admin/auth/register", {
      email,
      password,
      name,
    });
    return data;
  },

  getMe: async () => {
    const { data } = await client.get<{ admin: LoginResponse["admin"] }>(
      "/admin/auth/me",
    );
    return data;
  },
};
