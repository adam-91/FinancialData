import api from "./config";
import { User } from "../types/user";

export const register = async (
  email: string,
  password: string
): Promise<User> => {
  const response = await api.post<User>("/api/auth/register", {
    email,
    password,
  });
  return response.data;
};

export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.post<User>("/api/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/api/auth/logout");
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>("/api/auth/me");
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post("/api/auth/password/reset-request", { email });
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  await api.post("/api/auth/password/reset-confirm", {
    token,
    new_password: newPassword,
  });
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  await api.post("/api/auth/password/change", {
    old_password: oldPassword,
    new_password: newPassword,
  });
};
